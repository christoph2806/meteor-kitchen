/*
Copyright (c) 2013 Petar Korponaić

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

#include "cppw_process.h"

#include "cppw_time.h"
#include "cppw_file.h"

#include <cstdio>
#include <cstdlib>
#include <string.h>
#include <errno.h>

#ifdef _WIN32
    #include <windows.h>
    #include <Psapi.h>

    bool Popen(string sCommand, string* pOutput, string* pErrorMessage)
    {
        FILE *in;
        char buff[512];

        if(!(in = popen(sCommand.c_str(), "r"))) {
            if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
            return false;
        }

        pOutput->clear();
        while(fgets(buff, sizeof(buff), in)!=NULL){
            pOutput->append(buff);
        }
        pclose(in);
        return true;
    }

    string GetExecutablePath(string sFileName)
    {
        string res = sFileName;
        if(!Popen("where " + sFileName, &res, NULL))
			return sFileName;

        res = Trim(res);
        if(FindSubString(&res, "INFO:") >= 0) {
            return sFileName;
        }

		CWStringList pathlist;
		pathlist.SetText(res);
		if(pathlist.Count() > 0)
		{
			// code specific to executing meteor
			if(sFileName == "meteor" && pathlist.FindSubStr(".bat", false) >= 0)
				res = pathlist.Strings[pathlist.FindSubStr(".bat", false)];
			else
				res = pathlist.Strings[0];
		}

        return res;
    }

    bool Execute(string sFileName, string sArguments, bool bWait, string* pErrorMessage)
    {
        // Initialize StartupInfo structure
        STARTUPINFO    StartupInfo;
        memset(&StartupInfo, 0, sizeof(StartupInfo));
        StartupInfo.cb = sizeof(StartupInfo);

        // This will contain the information about the newly created process
        PROCESS_INFORMATION ProcessInformation;

        string args = "\"" + sFileName + "\" " + sArguments;

        DWORD creation_flags = 0;
        if(!bWait) creation_flags = CREATE_NEW_CONSOLE;

        BOOL results = CreateProcess((char*)sFileName.c_str(),
                                 (char*)args.c_str(),
                                 0, // Process Attributes
                                 0, // Thread Attributes
                                 FALSE, // Inherit Handles
                                 creation_flags, // CreationFlags,
                                 0, // Enviornment
                                 0, // Current Directory
                                 &StartupInfo, // StartupInfo
                                 &ProcessInformation // Process Information
                                 );
        if (!results)
        {
			if(pErrorMessage != NULL)
			{
				LPVOID lpMsgBuf;
				DWORD dw = GetLastError();

				FormatMessage(
					FORMAT_MESSAGE_ALLOCATE_BUFFER |
					FORMAT_MESSAGE_FROM_SYSTEM |
					FORMAT_MESSAGE_IGNORE_INSERTS,
					NULL,
					dw,
					MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
					(LPTSTR) &lpMsgBuf,
					0, NULL );

				*pErrorMessage = (LPTSTR)lpMsgBuf;
				LocalFree(lpMsgBuf);
			}

            return false;
        }

        if(bWait)
        {
            WaitForSingleObject(ProcessInformation.hProcess, INFINITE);
        }
        // Cleanup
        CloseHandle(ProcessInformation.hProcess);
        CloseHandle(ProcessInformation.hThread);
        return true;
    }

bool IsProcessRunning(int iPID)
{
    HANDLE process = OpenProcess(SYNCHRONIZE, FALSE, iPID);
    DWORD ret = WaitForSingleObject(process, 0);
    CloseHandle(process);
    return ret == WAIT_TIMEOUT;
}

int GetProcessID()
{
    return GetCurrentProcessId();
}

string GetSelfPath()
{
    char buffer[MAX_PATH];

    GetModuleFileName(NULL, buffer, MAX_PATH);

    return buffer;
}

#else

#include <signal.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <fcntl.h>
#include <unistd.h>

string GetExecutablePath(string sFileName)
{
	return sFileName;
}

#ifdef __APPLE__

#include <libproc.h>

string GetSelfPath()
{
	char dir[4096];
	int res = proc_pidpath(GetProcessID(), dir, 4096);
	if(res < 0) return "";
	return dir;
}

#else

string GetSelfPath()
{
	char dir[4096];
	int res = readlink("/proc/self/exe", dir, 4096);
	if(res < 0) return "";
	dir[res] = '\0';
	return dir;
}

#endif

void ArgstrToArgv(string sArguments, char* argv[])
{
	int argc = 0;

	char* text = (char*)sArguments.c_str();
	int last = 0;
	int pos = 0;
	int len = 0;
	bool ignore = false;
	while(text[pos] != 0)
	{
		if(text[pos] == '\"') ignore = !ignore;
		if((text[pos] == ' ' || text[pos] == '\t') && !ignore)
		{
			len = pos - last;
			argv[argc] = (char*)malloc(len + 1);
			strncpy(argv[argc], text + last, len);
			argv[argc][len] = '\0';
			argc++;
			last = pos + 1;
		}
		pos++;
	}
	len = pos - last;

	len = pos - last;
	argv[argc] = (char*)malloc(len + 1);
	strncpy(argv[argc], text + last, len);
	argv[argc][len] = '\0';
	argc++;

	argv[argc] = 0;
}

void FreeArgv(char* argv[])
{
	int i = 0;
	while(argv[i] != 0)
		free(argv[i++]);
}

void Daemonise(bool bAlreadyForkedChild, bool bResetWorkingDir, bool bResetFileCreationMask)
{
	// if this is parent process which should be forked (if this function is not called from already forked child process)
	if(!bAlreadyForkedChild)
	{
		// Fork, allowing the parent process to terminate.
		pid_t pid = fork();
		if (pid == -1)
		{
			// cannot fork parent process
			_exit(EXIT_FAILURE);
		}
		else
		{
			if (pid != 0)
			{
				// this is parent - terminate it
				_exit(0);
			}
		}
	}

	// OK, this is forked child process we want to become a daemon

    // Start a new session for the daemon.
    if (setsid() == -1)
    {
		// cannot start a new session
		_exit(EXIT_FAILURE);
    }

    // Fork again, allowing the parent process to terminate.
    signal(SIGHUP,SIG_IGN);
    pid_t pid = fork();
    if(pid == -1)
    {
    	// cannot fork
		_exit(EXIT_FAILURE);
    }
    else
    {
		if (pid != 0)
		{
			_exit(EXIT_SUCCESS);
		}
    }

    // OK, now we are in forked grand children process.

    // Set the current working directory to the root directory.
	if(bResetWorkingDir)
	{
		if(chdir("/") == -1)
		{
			_exit(EXIT_FAILURE);
		}
	}

    // Set the user file creation mask to zero.
	if(bResetFileCreationMask)
	{
		umask(0);
	}

    // Close then reopen standard file descriptors.
    close(STDIN_FILENO);
    close(STDOUT_FILENO);
    close(STDERR_FILENO);
    if (open("/dev/null", O_RDONLY) == -1)
    {
		_exit(EXIT_FAILURE);
    }
    if (open("/dev/null", O_WRONLY) == -1)
    {
		_exit(EXIT_FAILURE);
    }
    if (open("/dev/null", O_RDWR) == -1)
    {
		_exit(EXIT_FAILURE);
    }
}

// Execute external program.
//   sFileName is path to program executable
//   sArguments is string containing arguments which are passed to program
//   bWait:
//     if "true" function will wait program to finish
//     if "false" function will not wait program to finish - it executes independently

bool Execute(string sFileName, string sArguments, bool bWait, string* pErrorMessage)
{
	pid_t fork_rv = fork();
	if(fork_rv == -1)
		return false;

	if(fork_rv == 0)
	{
		if(!bWait)
			Daemonise(true, false, false);

		// exec
		char* argv[255];
		string args = sFileName + " " + sArguments;
		ArgstrToArgv(args.c_str(), argv);
		execvp(sFileName.c_str(), argv);
		// if execl fails
		FreeArgv(argv);
		_exit(EXIT_FAILURE);
	}

	// parent wait for the child
	if(bWait)
	{
		int pid, status;
		pid = waitpid(fork_rv, &status, 0);
		if(pid <= 0)
		{
			string msg = "Error executing \"" + sFileName + "\". " + strerror(errno);
			if(pErrorMessage) *pErrorMessage = msg;
			return false;
		}

		if(WIFEXITED(status) && WEXITSTATUS(status) != 0)
		{
			string msg = "Error executing \"" + sFileName + "\". " + strerror(errno);
			if(pErrorMessage) *pErrorMessage = msg;
			return false;
		}
	}
	return true;
}

bool Popen(string sCommand, string* pOutput, string* pErrorMessage)
{
	FILE *in;
	char buff[512];

	if(!(in = popen(sCommand.c_str(), "r"))) {
		if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
		return false;
	}

	pOutput->clear();
	while(fgets(buff, sizeof(buff), in)!=NULL){
		pOutput->append(buff);
	}
	pclose(in);
	return true;
}

/*
bool Execute(string sFileName, string sArguments, bool bWait, string* pErrorMessage)
{
    char cmd[1024];
    cmd[0] = '\0';
    if(!bWait)
        strcat(cmd, "nohup ");

    strcat(cmd, sFileName.c_str());
    if(sArguments != "")
    {
        strcat(cmd, " ");
        strcat(cmd, sArguments.c_str());
    }

    if(!bWait)
        strcat(cmd, " > /dev/null 2> /dev/null < /dev/null &");

    if(system(cmd) != 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }

    return true;
}
*/

int GetProcessID()
{
    return getpid();
}

bool IsProcessRunning(int iPID)
{
    if(iPID < 1 || iPID > 65535)
        return false;

    char tmp[255];
    sprintf(tmp, "/proc/%i/cmdline", iPID);

    string filename = tmp;
    return FileExists(filename);
}

bool KillProcess(int iPID)
{
    if(iPID < 1 || iPID > 65535)
        return false;

    return kill(iPID, SIGQUIT) == 0;
}


#endif
