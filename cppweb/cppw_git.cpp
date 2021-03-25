#include "cppw_git.h"

bool GitExec(int error, string message, string extra, string* pErrorMessage)
{
	const git_error *lg2err;
	string lg2msg = "";
	string lg2spacer = "";

	if (!error)
		return true;

	if ((lg2err = giterr_last()) != NULL && lg2err->message != NULL) {
		lg2msg = lg2err->message;
		lg2spacer = " - ";
	}

	if (extra != "") {
		*pErrorMessage = message + " '" + extra + "' [" + IntToStr(error) + "]" + lg2spacer + lg2msg;
	} else {
		*pErrorMessage = message + " [" + IntToStr(error) + "]" + lg2spacer + lg2msg;
	}

	return false;
}

bool GitGetCurrentBranch(git_repository *repo, string* pBranch, string* pErrorMessage)
{
	*pBranch = "";

	int error = 0;
	const char *branch = NULL;
	git_reference *head = NULL;
	

	error = git_repository_head(&head, repo);

	if(error == GIT_EUNBORNBRANCH || error == GIT_ENOTFOUND)
		branch = NULL;
	else if (!error) {
		branch = git_reference_shorthand(head);
	} else {
		return GitExec(error, "Failed to get current branch", "", pErrorMessage);
	}

	*pBranch = branch ? branch : "";
	git_reference_free(head);
	
	return true;
}

bool GitBranchExists(git_repository *repo, string sName, bool *bExists, string* pErrorMessage) {
	git_reference *out = NULL;

	int error = 0;
	error = git_reference_dwim(&out, repo, sName.c_str());
	
	if(error == GIT_ENOTFOUND) {
		*bExists = false;
		return true;
	}

	if(!GitExec(error, "Could not resolve reference", "", pErrorMessage)) {
		return false;
	}

	*bExists = out != NULL;

	git_reference_free(out);

	return true;
}

bool GitCreateBranch(git_repository *repo, string sName, string* pErrorMessage) {
	git_oid target_id;
	if(!GitExec(git_reference_name_to_id(&target_id, repo, "HEAD"), "Could not get reference to HEAD", "", pErrorMessage)) {
		return false;
	}
	git_commit* target = NULL;
	if(!GitExec(git_commit_lookup(&target, repo, &target_id), "Could not get last commit", "", pErrorMessage)) {
		return false;
	}
	
	git_reference* branch = NULL;
	if(!GitExec(git_branch_create(&branch, repo, sName.c_str(), target, 0), "Could not create branch \"" + sName + "\".", "", pErrorMessage)) {
		return false;
	}

	if(!GitExec(git_repository_set_head(repo, git_reference_name(branch)), "Could not switch to newly created branch \"" + sName + "\"", "", pErrorMessage)) {
		return false;
	}

	git_reference_free(branch);
	git_commit_free(target);
	return true;
}

bool GitRepoIsClean(git_repository *repo, bool* pIsClean, string* pErrorMessage) {
	*pIsClean = true;

	git_status_options opts = GIT_STATUS_OPTIONS_INIT;
	opts.flags = GIT_STATUS_OPT_INCLUDE_UNTRACKED |
		GIT_STATUS_OPT_RENAMES_HEAD_TO_INDEX |
		GIT_STATUS_OPT_SORT_CASE_SENSITIVELY;
	git_status_list *statuses = NULL;

	if(!GitExec(git_status_list_new(&statuses, repo, &opts), "Could not get repository status", "", pErrorMessage)) {
		return false;
	}

	size_t count = git_status_list_entrycount(statuses);
	*pIsClean = count == 0;

	return true;
}

struct add_all_cb_payload {
	git_repository *repo;
	CWStringList* list;
};

int add_all_cb(const char *path, const char *matched_pathspec, void *payload) {

	unsigned status;
	struct add_all_cb_payload p = *(struct add_all_cb_payload*)(payload);

	if(git_status_file(&status, p.repo, path)) {
		return -1;
	}

	if(status & GIT_STATUS_WT_MODIFIED || status & GIT_STATUS_WT_NEW) {
		if(p.list != NULL) {
			p.list->Add(path);
		}
		return 0;
	}
	return 1;
}

bool GitAddAllAndCommit(git_repository *repo, string sCommitMessage, CWStringList* pAddedFiles, string* pErrorMessage)
{
	if(pAddedFiles != NULL) {
		pAddedFiles->Clear();
	}

	git_index *index;
	git_strarray array = {0};
	struct add_all_cb_payload payload = {0};
	payload.repo = repo;
	payload.list = pAddedFiles;

	array.count = 1;
	array.strings = (char**)malloc(sizeof(char*) * array.count);
	string wildcard = "*";
	array.strings[0] = (char*)wildcard.c_str();
	
	if(!GitExec(git_repository_index(&index, repo), "Could not open repository index", "", pErrorMessage)) {
		return false;
	}

	if(!GitExec(git_index_add_all(index, &array, GIT_INDEX_ADD_DEFAULT, &add_all_cb, &payload), "Couldn't add files to repository index", "", pErrorMessage)) {
		return false;
	}

	if(!GitExec(git_index_write(index), "Could not write repository index", "", pErrorMessage)) {
		return false;
	}

	git_oid tree_id;
	if(!GitExec(git_index_write_tree(&tree_id, index), "Could not get tree from repository index", "", pErrorMessage)) {
		return false;
	}

	git_index_free(index);

	git_tree *tree;
	if(!GitExec(git_tree_lookup(&tree, repo, &tree_id), "Could not look up repository tree", "", pErrorMessage)) {
		return false;
	}

	git_oid parent_id;
	git_commit* parent = NULL;
	int parent_count = 0;
	string commit_message = "";
	if(git_reference_name_to_id(&parent_id, repo, "HEAD")) {
		commit_message = "Initial commit";
	} else {
		if(!GitExec(git_commit_lookup(&parent, repo, &parent_id), "Could not get commit parent", "", pErrorMessage)) {
			return false;
		}
		parent_count = 1;
		commit_message = sCommitMessage;
	}

	git_signature *sig;
	int error = git_signature_default(&sig, repo);
	if(error == GIT_ENOTFOUND) {
		if(!GitExec(git_signature_new(&sig, "John Doe", "johndoe@example.com", time(NULL), 0), "Unable to create new signature", "", pErrorMessage)) {
			return false;
		}
	} else {
		if(!GitExec(error, "Unable to create a commit signature.", "Perhaps \"user.name\" and \"user.email\" are not set", pErrorMessage)) {
			return false;
		}
	}

	git_oid commit_id;
	if(!GitExec(git_commit_create_v(&commit_id, repo, "HEAD", sig, sig, NULL, commit_message.c_str(), tree, parent_count, parent), "Could not create commit", "", pErrorMessage)) {
		return false;
	}

	git_tree_free(tree);
	git_signature_free(sig);
	git_commit_free(parent);
	
	return true;
}

bool GitCheckout(git_repository *repo, string sBranchName, string* pErrorMessage)
{
	git_object *treeish = NULL;
	git_checkout_options opts = GIT_CHECKOUT_OPTIONS_INIT;
	opts.checkout_strategy = GIT_CHECKOUT_SAFE;

	if(!GitExec(git_revparse_single(&treeish, repo, sBranchName.c_str()), "", "", pErrorMessage)) {
		return false;
	}

	if(!GitExec(git_checkout_tree(repo, treeish, &opts), "", "", pErrorMessage)) {
		return false;
	}

	if(!GitExec(git_repository_set_head(repo, ("refs/heads/" + sBranchName).c_str()), "", "", pErrorMessage)) {
		return false;
	}

	git_object_free(treeish);

	return true;
}

bool GitIsMergeRequired(git_repository *repo, string sBranchName, bool *pIsMergeRequired, string* pErrorMessage)
{
	*pIsMergeRequired = false;

	git_reference *their_ref = NULL;
	if(!GitExec(git_reference_lookup(&their_ref, repo, ("refs/heads/" + sBranchName).c_str()), "Could not find branch \"" + sBranchName + "\"", "", pErrorMessage)) {
		return false;
	}

	git_annotated_commit *their_heads[1];
	if(!GitExec(git_annotated_commit_from_ref(&their_heads[0], repo, their_ref), "Could not find branch \"" + sBranchName + "\"", "", pErrorMessage)) {
		return false;
	}

	git_merge_analysis_t analysis;
	git_merge_preference_t preference;
	if(!GitExec(git_merge_analysis(&analysis, &preference, repo, (const git_annotated_commit**)their_heads, 1), "Could not perform merge analysis", "", pErrorMessage)) {
		return false;
	}

	*pIsMergeRequired = (analysis & GIT_MERGE_ANALYSIS_NORMAL) != 0;

	git_reference_free(their_ref);
	git_annotated_commit_free(their_heads[0]);

	return true;
}


bool GitMerge(git_repository *repo, string sBranchName, CWStringList* pConflicts, string* pErrorMessage)
{
	pConflicts->Clear();

	git_reference *their_ref = NULL;
	if(!GitExec(git_reference_lookup(&their_ref, repo, ("refs/heads/" + sBranchName).c_str()), "Could not find branch \"" + sBranchName + "\"", "", pErrorMessage)) {
		return false;
	}

		git_oid their_id;
		if(!GitExec(git_reference_name_to_id(&their_id, repo, ("refs/heads/" + sBranchName).c_str()), "Cannot get other branch oid", "", pErrorMessage)) {
			return false;
		}

		git_commit* their_commit = NULL;
		if(!GitExec(git_commit_lookup(&their_commit, repo, &their_id), "Could not get other branch tip", "", pErrorMessage)) {
			return false;
		}


	git_annotated_commit *their_heads[1];
	if(!GitExec(git_annotated_commit_from_ref(&their_heads[0], repo, their_ref), "Could not get annotated commit in branch \"" + sBranchName + "\"", "", pErrorMessage)) {
		return false;
	}

	git_merge_options merge_options = GIT_MERGE_OPTIONS_INIT;
	git_checkout_options checkout_options = GIT_CHECKOUT_OPTIONS_INIT;
	checkout_options.checkout_strategy = GIT_CHECKOUT_SAFE;

	if(!GitExec(git_merge(repo, (const git_annotated_commit**)their_heads, 1, &merge_options, &checkout_options), "Could not merge \"" + sBranchName + "\" branch", "", pErrorMessage)) {
		return false;
	}

	git_reference_free(their_ref);
	git_annotated_commit_free(their_heads[0]);

	git_index* index = NULL;
	if(!GitExec(git_repository_index(&index, repo), "Could not open repository index", "", pErrorMessage)) {
		return false;
	}

	const git_index_entry *entry;
	size_t i;
	for (i = 0; i < git_index_entrycount(index); i++) {
		entry = git_index_get_byindex(index, i);

		if (git_index_entry_is_conflict(entry)) {
			pConflicts->AddUnique(entry->path);
		}
	}

	if(pConflicts->Count() == 0) {
		git_oid tree_id;
		if(!GitExec(git_index_write_tree(&tree_id, index), "Could not get tree from repository index", "", pErrorMessage)) {
			return false;
		}

		git_tree *tree;
		if(!GitExec(git_tree_lookup(&tree, repo, &tree_id), "Could not look up repository tree", "", pErrorMessage)) {
			return false;
		}

		git_oid parent_id;
		git_commit* parent = NULL;
		string commit_message = "Merge branch \'" + sBranchName + "\'";
		if(!GitExec(git_reference_name_to_id(&parent_id, repo, "HEAD"), "Cannot get current branch tip id", "", pErrorMessage)) {
			return false;
		}

		if(!GitExec(git_commit_lookup(&parent, repo, &parent_id), "Could not get current branch tip", "", pErrorMessage)) {
			return false;
		}

		git_signature *sig;
		int error = git_signature_default(&sig, repo);
		if(error == GIT_ENOTFOUND) {
			if(!GitExec(git_signature_new(&sig, "John Doe", "johndoe@example.com", time(NULL), 0), "Unable to create new signature", "", pErrorMessage)) {
				return false;
			}
		} else {
			if(!GitExec(error, "Unable to create a commit signature.", "Perhaps \"user.name\" and \"user.email\" are not set", pErrorMessage)) {
				return false;
			}
		}

		git_oid commit_id;
		if(!GitExec(git_commit_create_v(&commit_id, repo, "HEAD", sig, sig, NULL, commit_message.c_str(), tree, 2, parent, their_commit), "Could not create commit", "", pErrorMessage)) {
			return false;
		}

		git_repository_state_cleanup(repo);

		git_tree_free(tree);
		git_signature_free(sig);
		git_commit_free(parent);
	} else {
		// got conflicts, what to do?
	}
	git_index_free(index);
	
	return true;
}

bool GitRepoIsMerging(git_repository *repo, bool* pIsMerging, string* pErrorMessage) {
	*pIsMerging = git_repository_state(repo) == GIT_REPOSITORY_STATE_MERGE;
	return true;
}
