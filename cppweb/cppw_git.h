#ifndef CPPW_GIT_H
#define CPPW_GIT_H

#include <git2.h>

#include "cppw_string.h"

bool GitExec(int error, string message, string extra, string* pErrorMessage);
bool GitGetCurrentBranch(git_repository *repo, string* pBranch, string* pErrorMessage);
bool GitBranchExists(git_repository *repo, string sName, bool *bExists, string* pErrorMessage);
bool GitCreateBranch(git_repository *repo, string sName, string* pErrorMessage);
bool GitRepoIsClean(git_repository *repo, bool* pIsClean, string* pErrorMessage);
bool GitAddAllAndCommit(git_repository *repo, string sCommitMessage, CWStringList* pAddedFiles, string* pErrorMessage);
bool GitCheckout(git_repository *repo, string sBranchName, string* pErrorMessage);
bool GitIsMergeRequired(git_repository *repo, string sBranchName, bool *pIsMergeRequired, string* pErrorMessage);
bool GitMerge(git_repository *repo, string sBranchName, CWStringList* pConflicts, string* pErrorMessage);
bool GitRepoIsMerging(git_repository *repo, bool* pIsMerging, string* pErrorMessage);


#endif
