#include <cstdio>


#include "cppw_meteor_kitchen.h"
#include "cppw_file.h"
#include "cppw_process.h"
#include "cppw_sock.h"
#include "cppw_git.h"
#include "cppw_time.h"

using namespace std;

void PrintUsage(string sAppPath, string sExampleDir)
{
	CWStringList examples;
	if(ListDir(sExampleDir, &examples, true, NULL))
	{
		int count = examples.Count();
		for(int i = count - 1; i >= 0; i--)
		{
			string file_name = ExtractFileName(examples.Strings[i]);
			if(FindSubString(&file_name, "example-") != 0 || (ExtractFileExt(file_name) != ".json" && ExtractFileExt(file_name) != ".txt"))
				examples.Delete(i);
		}
	}
	examples.Sort();

	printf("\r\nUsage:\r\n");
	printf("\t%s [options] <input_file_or_url> <output_dir>\r\n", ExtractFileName(sAppPath).c_str());
	printf("\r\nOptions:\r\n");
	printf("\r\n\t--blaze\tGenerate \"blaze\" code");
	printf("\r\n\t--react\tGenerate \"react\" code");
	printf("\r\n\t-c, --coffee\tGenerate coffee script (\"blaze\" only)");
	printf("\r\n\t-j, --jade\tGenerate jade templates (\"blaze\" only)");
	printf("\r\n\t-a, --android\tAdd Android into the list of target platforms");
	printf("\r\n\t-i, --ios\tAdd iOS into the list of target platforms");
	printf("\r\n\t-l, --live\tLive mode (auto rerun when input file is modified)");
	printf("\r\n\t-n, --no-git\tDon't use git (overwrite files with no mercy)");
	printf("\r\n\t-r <version>, --meteor-release <version>\tUse given meteor release");
	printf("\r\n\t-v, --version\tPrint version number");
	printf("\r\n");
	if(examples.Count() > 0)
	{
		printf("Or:\r\n");
		printf("\t%s --example-<name> <output_dir>\r\n", ExtractFileName(sAppPath).c_str());
		printf("\r\nAvailable examples:\r\n\r\n\t");

		for(int i = 0; i < examples.Count(); i++)
		{
			string file_name = ExtractFileName(examples.Strings[i]);
			printf("%s ", ReplaceSubString(ChangeFileExt(file_name, ""), "example-", "").c_str());
		}
		printf("\r\n");
	}

//	printf("Or:\r\n");
//	printf("\t%s --metadata <output_file>\r\n", ExtractFileName(sAppPath).c_str());

	printf("\r\n");
}

bool Yaml2Json(string sInputFile, string sOutputFile, string* pErrorMessage)
{
	string args = sInputFile + " > " + sOutputFile;

	string cmd = "js-yaml " + args;
	string tmp_out = "";
	if(!Popen(cmd, &tmp_out, pErrorMessage))
	{
		if(pErrorMessage != NULL) *pErrorMessage = "Error converting yaml to json. " + *pErrorMessage;
		return false;
	}
	if(FindSubString(&tmp_out, "error", false) >= 0)
	{
		if(pErrorMessage != NULL) *pErrorMessage = "Error converting yaml to json. " + *pErrorMessage;
		return false;
	}
	return true;
}

bool Human2Json(string sInputFile, string sOutputFile, string* pErrorMessage)
{
	string args = sInputFile + " " + sOutputFile;

	if(!Execute(GetExecutablePath("human2machine"), args.c_str(), true, pErrorMessage))
	{
		if(pErrorMessage != NULL) *pErrorMessage = "Error converting human language to json. " + *pErrorMessage;
		return false;
	}

	return true;
}


int main(int argc, char* argv[])
{
// --- test jsx parser
/*
string ss = "";
string ee = "";
if(!FileLoadString("/Users/pera/test.jsx", &ss, 0, &ee)) printf("%s", ee.c_str());
CWNode hh;
if(!hh.ParseJSX(ss, &ee)) printf("%s", ee.c_str());
string rr = "";
rr = hh.GetJSX(0);
if(!FileSaveString("/Users/pera/parsed.jsx", &rr, 0, &ee)) printf("%s", ee.c_str());
return 0;
*/
// ---
	srand(time(NULL));

	string msg = "";
	string app_path = "";
	app_path = GetSelfPath();
	string example_dir = AddDirSeparator(GetFullPath(AddDirSeparator(AddDirSeparator(ExtractFileDir(app_path)) + "..") + "examples"));
	string cwd = AddDirSeparator(GetFullPath(AddDirSeparator(".")));

	CWStringList input_switches;
	CWStringList input_files;
	string force_meteor_version = "";
	for(int i = 1; i < argc; i++)
	{
		string s = argv[i];
		if(s.size() > 0 && s[0] == '-')
		{
			if(s == "-c") s = "--coffee";
			if(s == "-j") s = "--jade";
			if(s == "-a") s = "--android";
			if(s == "-i") s = "--ios";
			if(s == "-v") s = "--version";
			if(s == "-h") s = "--help";
			if(s == "-m") s = "--metadata";
			if(s == "-l") s = "--live";
			if(s == "-n") s = "--no-git";
			if(s == "-r" || s == "--meteor-release") {
				s = "--meteor-release";
				if(i < argc - 1) {
					i++;
					force_meteor_version = argv[i];
				}
			}
			if(s == "-u") s = "--unsafe-perm";
			input_switches.Add(s);
		}
		else
			input_files.Add(s);
	}

	// ---
	// version
	// ---
	if(input_switches.Find("--version") >= 0)
	{
		printf("%i.%i.%i%s", GENERATOR_VERSION_MAJOR, GENERATOR_VERSION_MINOR, GENERATOR_VERSION_PATCH, LINE_TERM);
		return 0;
	}

	int current_year = 2018;
	GetTime(true, &current_year);

	printf("\r\nMeteor Kitchen v%i.%i.%i\r\n", GENERATOR_VERSION_MAJOR, GENERATOR_VERSION_MINOR, GENERATOR_VERSION_PATCH);
	printf("Source code generator for Meteor.js - www.meteorkitchen.com\r\n");
	printf("Copyright (c) 2014-%i Petar Korponaić\r\n", current_year);
	printf("<petar.korponaic@gmail.com>\r\n");
	printf("\r\n");

	// ---
	// help
	// ---
	if(input_switches.Find("--help") >= 0)
	{
		PrintUsage(app_path, example_dir);
		return 0;
	}

	// ---
	// extract metadata
	// ---
	if(input_switches.Find("--metadata") >= 0)
	{
		if(input_files.Count() == 0)
		{
			printf("Error: invalid arguments.\r\n");
			PrintUsage(app_path, example_dir);
			return -1;
		}

		string meta_output_path = input_files.Strings[0];

		printf("Extracting metadata...\r\n");
		CWJSONObject meta;
		CWJSONObject help;
		string description_filename = AddDirSeparator(GetFullPath(AddDirSeparator(AddDirSeparator(AddDirSeparator(AddDirSeparator(ExtractFileDir(app_path)) + "..") + "..") + "..") + "resources")) + "meta_description.json";
		if(FileExists(description_filename))
		{
			string tmp = "";
			if(FileLoadString(description_filename, &tmp, 0, NULL))
			{
				if(!help.Parse(tmp, &msg))
				{
					printf("Error parsing metadata description. %s\r\n", msg.c_str());
					return -1;
				}
			}
		}

		GetMetadata(&meta, true, false, &help);
		string meta_output = meta.Stringify(false);
		printf("Writing metadata to \"%s\"...\r\n", meta_output_path.c_str());
		if(!FileSaveString(meta_output_path, &meta_output, 0, &msg))
		{
			printf("%s\r\n", msg.c_str());
			return -1;
		}
		printf("\r\nGenerator finished.\r\n\r\n");
		return 0;
	}

	// ---
	// built-in example
	// ---
	// old style --example--<name> switch
	int option_example_pos = input_switches.FindBeginWith("--example-");
	if(option_example_pos >= 0)
	{
		string tmp = input_switches.Strings[option_example_pos];

		string example_name = tmp.erase(0, 2);
		tmp = ChangeFileExt(AddDirSeparator(example_dir + example_name) + example_name, ".json");
		if(!FileExists(tmp)) tmp = ChangeFileExt(tmp, ".txt");
		if(!FileExists(tmp)) tmp = ChangeFileExt(tmp, ".yaml");
		if(!FileExists(tmp)) tmp = ChangeFileExt(tmp, ".json");
		input_files.Insert(tmp, 0);
	}

	// ---
	// generate
	// ---
	if(input_files.Count() < 2)
	{
		printf("Error: invalid arguments.\r\n");
		PrintUsage(app_path, example_dir);
		return -1;
	}

	string input_file = input_files.Strings[0];
	string output_dir = AddDirSeparator(input_files.Strings[1]);
	bool coffee = input_switches.Find("--coffee") >= 0;
	bool jade = input_switches.Find("--jade") >= 0;
	CWStringList target_platforms;
	if(input_switches.Find("--android") >= 0) target_platforms.Add("android");
	if(input_switches.Find("--ios") >= 0) target_platforms.Add("ios");

	bool input_is_yaml = StrCmpi(ExtractFileExt(input_file), ".yaml") == 0 || StrCmpi(ExtractFileExt(input_file), ".yml") == 0;
	bool input_is_human = StrCmpi(ExtractFileExt(input_file), ".txt") == 0;
	bool input_file_is_temp = false;
	bool live = input_switches.Find("--live") >= 0;
	bool usegit = input_switches.Find("--no-git") < 0;
// !!!
//usegit = false;
	string force_templating = "";
	if(input_switches.Find("--blaze") >= 0) force_templating = "blaze";
	if(input_switches.Find("--react") >= 0) force_templating = "react";

	bool unsafe_perm = false;
	if(input_switches.Find("--unsafe-perm") >= 0) unsafe_perm = true;

	// download input file from URL
	bool input_file_is_url = false;
	string input_url = input_file;
	string live_url = ReplaceSubString(input_url, "/getapp/", "/waitapp/");
	if(input_file.find("http://") == 0 || input_file.find("https://") == 0)
	{
		input_file_is_url = true;
		printf("Downloading input file...\r\n");
		input_file = TempDir() + RandomString(10) + ".json";
		if(!CURLDownload(input_url, input_file, true, &msg))
		{
			printf("\r\n%s\r\n\r\n", msg.c_str());
			return -1;
		}
		input_file_is_temp = true;
	}

/*	
	if(usegit && !input_file_is_temp) {
		string original_input = input_file;
		input_file = TempDir() + RandomString(10) + ".json";
		if(!FileCopy(original_input, input_file, false, 0, &msg)) {
			printf("\r\n%s\r\n\r\n", msg.c_str());
			return -1;
		}
		input_file_is_temp = true;
	}
*/

	if(!FileExists(input_file))
	{
		printf("\r\nInput file not found \"%s\".\r\n\r\n", input_file.c_str());
		return -1;
	}

	string input_file_full_path = GetFullPath(input_file);
	if(input_file_full_path == "") input_file_full_path = input_file;
	string input_dir = AddDirSeparator(ExtractFileDir(input_file_full_path));
	string original_input_file = input_file;
	
	do {
		input_file = original_input_file;
		
		if(input_is_yaml)
		{
			// convert yaml to json
			printf("Converting yaml to json using \"js-yaml\"...\r\n");
			string input_yaml = input_file;
			input_file = TempDir() + RandomString(10) + ".json";
			input_file_is_temp = true;

			if(!Yaml2Json(input_yaml, input_file, &msg))
			{
				printf("\r\n%s\r\n\r\n", msg.c_str());
				return -1;
			}
		}

		if(input_is_human)
		{
			// convert yaml to json
			printf("Converting human language to json using \"human2machine\"...\r\n");
			string input_human = input_file;
			input_file = TempDir() + RandomString(10) + ".json";
			input_file_is_temp = true;

			if(!Human2Json(input_human, input_file, &msg))
			{
				printf("\r\n%s\r\n\r\n", msg.c_str());
				return -1;
			}
		}

		git_repository *repo = NULL;
		string current_branch = "";
		string original_branch = "";
		string output_dir_full = output_dir;
		if(usegit) {
			git_libgit2_init();

			if(!MakeDir(output_dir, false, &msg))
			{
				printf("\r\n%s\r\n\r\n", msg.c_str());
				return -1;
			}
			output_dir_full = AddDirSeparator(GetFullPath(output_dir));
			printf("Open git repository...\r\n");
			if(git_repository_open_ext(&repo, output_dir_full.c_str(), 0, NULL)) {
				printf("Git repository not found. Initializing new git repository...\r\n");
				if(!GitExec(git_repository_init(&repo, output_dir_full.c_str(), 0), "Could not initialize repository", output_dir_full, &msg)) {
					printf("\r\n%s\r\n\r\n", msg.c_str());
					return -1;
				}
			}

			if(git_repository_is_bare(repo)) {
				printf("\r\nError: meteor-kitchen cannot operate in a bare repository \"%s\".\r\n\r\n", git_repository_path(repo));
				return -1;
			}

			printf("Reading current branch name...\r\n");
			if(!GitGetCurrentBranch(repo, &current_branch, &msg)) {
				printf("\r\n%s\r\n\r\n", msg.c_str());
				return -1;
			}
			
			bool dont_commit = false;
			if(current_branch == "") {
				printf("No current branch, creating initial commit...\r\n");

				string commit_message = "meteor-kitchen " + TimeString(false);
				if(!GitAddAllAndCommit(repo, commit_message, NULL, &msg)) {
					printf("\r\n%s\r\n\r\n", msg.c_str());
					return -1;
				}
				dont_commit = true;
				if(!GitGetCurrentBranch(repo, &current_branch, &msg)) {
					printf("\r\n%s\r\n\r\n", msg.c_str());
					return -1;
				}
			}
			printf("Repository is on branch \"%s\"\r\n", current_branch.c_str());
			original_branch = current_branch;

			if(!dont_commit) {
				bool is_clean = false;
				if(!GitRepoIsClean(repo, &is_clean, &msg)) {
					printf("\r\n%s\r\n\r\n", msg.c_str());
					return -1;
				}

				bool is_merging = false;
				if(!GitRepoIsMerging(repo, &is_merging, &msg)) {
					printf("\r\n%s\r\n\r\n", msg.c_str());
					return -1;
				}
				
				if(is_merging) {
					printf("\r\nRepository is in \"merging\" state. Please resolve conflicts (if any) and commit.\r\n\r\n");
					return -1;
				}

				if(is_clean) {
					printf("Branch \"%s\" is clean\r\n", current_branch.c_str());
				} else {
					string commit_message = "meteor-kitchen " + TimeString(false);
					printf("Branch \"%s\" is not clean\r\n", current_branch.c_str());
					printf("Adding all files and commit with message \"%s\"...\r\n", commit_message.c_str());
					if(!GitAddAllAndCommit(repo, commit_message, NULL, &msg)) {
						printf("\r\n%s\r\n\r\n", msg.c_str());
						return -1;
					}
				}
			}

			if(current_branch != "meteor-kitchen") {
				printf("Searching for \"meteor-kitchen\" branch...\r\n");
				bool branch_exists = false;
				if(!GitBranchExists(repo, "meteor-kitchen", &branch_exists, &msg)) {
					printf("\r\n%s\r\n\r\n", msg.c_str());
					return -1;
				}

				if(branch_exists) {
					printf("Switching to \"meteor-kitchen\" branch...\r\n");
					if(!GitCheckout(repo, "meteor-kitchen", &msg)) {
						printf("\r\n%s\r\n\r\n", msg.c_str());
						return -1;
					}
				} else {
					printf("Branch \"meteor-kitchen\" not found, creating one...\r\n");
					if(!GitCreateBranch(repo, "meteor-kitchen", &msg)) {
						return -1;
					}
				}

				if(!GitGetCurrentBranch(repo, &current_branch, &msg)) {
					printf("\r\n%s\r\n\r\n", msg.c_str());
					return -1;
				}
			}
			printf("Repository is on branch \"%s\"\r\n", current_branch.c_str());
		}
		CWApplication generator(NULL);
		bool success = true;
		if(!generator.Generate(input_file, input_dir, output_dir, coffee, jade, &target_platforms, force_meteor_version, force_templating, unsafe_perm, input_file_is_url, cwd, &msg))
		{
			printf("\r\n%s\r\n\r\n", msg.c_str());
			success = false;
			if(!live)
				return -1;
		}

		if(!ChDir(cwd, &msg)) {
			printf("\r\n%s\r\n\r\n", msg.c_str());
			return -1;
		}

		if(input_file_is_temp)
		{
			printf("Cleaning up...\r\n");
			if(!FileDelete(input_file, &msg))
			{
				printf("\r\n%s\r\n\r\n", msg.c_str());
				return -1;
			}
		}

		if(success) {
			if(usegit) {
				bool repo_is_clean = false;
				if(!GitRepoIsClean(repo, &repo_is_clean, &msg)) {
					printf("\r\n%s\r\n\r\n", msg.c_str());
					return -1;
				}

				if(repo_is_clean) {
					printf("Branch \"%s\" is clean, nothing to commit\r\n", current_branch.c_str());
				} else {
					string commit_message = "meteor-kitchen " + TimeString(false);
					printf("Adding all files and commit with message \"%s\"...\r\n", commit_message.c_str());
					if(!GitAddAllAndCommit(repo, commit_message, NULL, &msg)) {
						printf("\r\n%s\r\n\r\n", msg.c_str());
						return -1;
					}
				}

				if(current_branch == "meteor-kitchen" && original_branch != current_branch) {
					printf("Switching to \"%s\" branch...\r\n", original_branch.c_str());
					if(!GitCheckout(repo, original_branch, &msg)) {
						printf("\r\n%s\r\n\r\n", msg.c_str());
						return -1;
					}
				}

				if(!GitGetCurrentBranch(repo, &current_branch, &msg)) {
					printf("\r\n%s\r\n\r\n", msg.c_str());
					return -1;
				}
				printf("Repository is on branch \"%s\"\r\n", current_branch.c_str());

				if(current_branch != "meteor-kitchen") {
					printf("Comparing branches \"meteor-kitchen\" and \"%s\"...\r\n", current_branch.c_str());
					bool merge_required = false;
					if(!GitIsMergeRequired(repo, "meteor-kitchen", &merge_required, &msg)) {
						return -1;
					}
					
					if(!merge_required) {
						printf("Already up-to-date\r\n");
					} else {
						printf("Merging branch \"meteor-kitchen\" into \"%s\"...\r\n", current_branch.c_str());

						CWStringList conflicts;
						if(!GitMerge(repo, "meteor-kitchen", &conflicts, &msg)) {
							return -1;
						}

						if(conflicts.Count() == 0) {
							printf("Merged successfully\r\n");
						} else {
							printf("\r\nGot conflicts:\r\n\r\n");
							for(int conflict_counter = 0; conflict_counter < conflicts.Count(); conflict_counter++) {
								printf("\t%s\r\n", conflicts.Strings[conflict_counter].c_str());
							}
							printf("\r\nPlease fix conflicts and run \"git commit\"\r\n");
							return -1;
						}
					}
				}
			}

			int warning_count = generator.Warnings->Count();
			if(warning_count > 0)
				printf("%sGenerator finished with %i warnings.%s%s", LINE_TERM, warning_count, LINE_TERM, LINE_TERM);
			else
				printf("\r\nGenerator finished.\r\n\r\n");
		}

		if(live) {
			if(input_file_is_url) {
				printf("Waiting for input file change...\r\n");
				input_file = TempDir() + RandomString(10) + ".json";
				original_input_file = input_file;

				bool valid_json = true;
				do {
					if(!CURLDownload(live_url, input_file, true, &msg))
					{
						printf("\r\n%s\r\n\r\n", msg.c_str());
						return -1;
					}
					
					string input_str = "";
					if(!FileLoadString(input_file, &input_str, 0, &msg)) {
						printf("\r\n%s\r\n\r\n", msg.c_str());
						return -1;
					}

					CWJSONObject input_json;
					valid_json = input_json.Parse(input_str, &msg);
				} while(!valid_json);

				input_file_is_temp = true;
			} else {
				printf("Waiting for input file change...\r\n");
				if(!WaitForFileChange(original_input_file, &msg)) {
					printf("\r\n%s\r\n\r\n", msg.c_str());
					return -1;
				}
			}
		}

	} while(live);

    return 0;
}
