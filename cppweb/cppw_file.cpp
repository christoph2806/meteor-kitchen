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

#include "cppw_file.h"

#include "cppw_time.h"

#define SLEEP_1 10
#define SLEEP_2 10
#define SLEEP_3 100


#include <cstdio>
#include <cstdlib>
#include <errno.h>
#include <fcntl.h>
#include <string.h>
#include <dirent.h>
#include <sys/stat.h>

#ifdef _WIN32
    #include <windows.h>

    #define realpath(N,R) _fullpath((R),(N),_MAX_PATH);

    #ifndef __MINGW__
        #include <io.h>
        #ifndef ftruncate
                #define ftruncate chsize
        #endif
    #endif

    #ifndef F_UNLCK
        #define F_UNLCK 0
    #endif
    #ifndef F_RDLCK
        #define F_RDLCK 1
    #endif
    #ifndef F_WRLCK
        #define F_WRLCK 2
    #endif

    bool FileSetMode(int iFileDescriptor, int iMode, string* pErrorMessage)
    {
        if(setmode(iFileDescriptor, iMode) == -1)
        {
            if(pErrorMessage != NULL)
                return false;
        }
        return true;
    }
#else
    #include <unistd.h>

    #ifndef O_BINARY
        #define O_BINARY 0
    #endif

    bool FileSetMode(int iFileDescriptor, int iMode, string* pErrorMessage)
    {
        return true;
    }
#endif

#ifndef S_IRWALL
    #ifdef _WIN32
        #define S_IRWALL 256 | 128
    #else
        #define S_IRWALL S_IRUSR | S_IWUSR | S_IRGRP | S_IWGRP | S_IROTH | S_IWOTH
    #endif
#endif

bool FileSetBinary(int iFileDescriptor, string* pErrorMessage)
{
    return FileSetMode(iFileDescriptor, O_BINARY, pErrorMessage);
}

string GetDirSeparator(string sFileName)
{
    int len = sFileName.size();
    if(len == 0)
        return DIR_SEPARATOR;

    string dir_sep = DIR_SEPARATOR;
    // autodetect dir separator
    size_t dpos = sFileName.find_last_of("/\\");
    if(dpos != string::npos)
        dir_sep = sFileName.substr(dpos, 1);
    return dir_sep;
}

string AddDirSeparator(string sFileName)
{
    string dir_sep = GetDirSeparator(sFileName);
    int len = sFileName.size();
    if(sFileName[len - 1] != dir_sep[0])
        return sFileName + dir_sep;
    return sFileName;
}

string ChangeFileExt(string sFileName, string sNewExt)
{
    string res = sFileName;
    string ext = sNewExt;
    if(ext.find(".") == 0)
        ext.erase(0, 1);

    size_t dpos = res.find_last_of("/\\");
    size_t epos = res.find_last_of(".");
    if(dpos == string::npos)
      dpos = epos;

    if((epos != string::npos) && (epos >= dpos))
        res.erase(epos, res.size() - epos);
    if(ext != "")
      res = res + ".";

    return res + ext;
}

string ExtractFileExt(string sFileName)
{
    string res = sFileName;

    size_t dpos = res.find_last_of("/\\");
    size_t epos = res.find_last_of(".");
    if(dpos == string::npos)
      dpos = epos;

    if((epos != string::npos) && (epos >= dpos))
        res.erase(0, epos);
    else
        res = ".";

    return res;
}

string ExtractFileDir(string sFileName)
{
    string dir_sep = GetDirSeparator(sFileName);
    size_t dpos = sFileName.rfind(dir_sep);
    if(dpos == string::npos)
        return "";
    return sFileName.substr(0, dpos + 1);
}

string ExtractFileName(string sFileName)
{
    string dir_sep = GetDirSeparator(sFileName);
    size_t dpos = sFileName.rfind(dir_sep);
    if(dpos == string::npos)
        return sFileName;
    return sFileName.substr(dpos + 1, sFileName.size() - (dpos + 1));
}

string AddSuffixToFileName(string sFileName, string sSuffix)
{
    return ChangeFileExt(ChangeFileExt(sFileName, "") + sSuffix, ExtractFileExt(sFileName));
}

#ifdef _WIN32

string TempDir()
{
    char temp_path[MAX_PATH+1];
    GetTempPath(MAX_PATH, temp_path);
    return AddDirSeparator(temp_path);
}

bool DirectoryExists(string sDirectory)
{
    string dir = AddDirSeparator(sDirectory);

    DWORD dwAttrib = GetFileAttributes(dir.c_str());

    return (dwAttrib != INVALID_FILE_ATTRIBUTES && (dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

bool ListDirExt(string sDirectory, CWStringList* pFiles, bool bRecourse, bool bIncludeDirectories, string* pErrorMessage)
{
    WIN32_FIND_DATA fdFile;
    HANDLE hFind = NULL;

    char sDir[2048];
    strcpy(sDir, sDirectory.c_str());
    int dirlen = strlen(sDir);
    if(dirlen > 0 && sDir[dirlen - 1] == '\\')
        sDir[dirlen - 1] = '\0';

	if(bIncludeDirectories) {
		pFiles->Add(AddDirSeparator(sDirectory));
	}

    char sPath[2048];
    sprintf(sPath, "%s\\*.*", sDir);

    if((hFind = FindFirstFile(sPath, &fdFile)) == INVALID_HANDLE_VALUE)
    {
        if(pErrorMessage != NULL)
            *pErrorMessage = "Path not found: \"" + string(sPath) + "\"";
        return false;
    }
    do
    {
        //Find first file will always return "."
        //    and ".." as the first two directories.
        if(strcmp(fdFile.cFileName, ".") != 0
                && strcmp(fdFile.cFileName, "..") != 0)
        {
            //Build up our file path using the passed in
            //  [sDir] and the file/foldername we just found:
            sprintf(sPath, "%s\\%s", sDir, fdFile.cFileName);

            //Is the entity a File or Folder?
            if(fdFile.dwFileAttributes &FILE_ATTRIBUTE_DIRECTORY)
            {
                if(bRecourse)
				{
                    if(!ListDirExt(sPath, pFiles, bRecourse, bIncludeDirectories, pErrorMessage))
                        return false;
				}
            }
            else
            {
                pFiles->Add(sPath);
            }
        }
    }
    while(FindNextFile(hFind, &fdFile)); //Find the next file.

    FindClose(hFind); //Always, Always, clean things up!

    return true;	
}

bool ListDir(string sDirectory, CWStringList* pFiles, bool bRecourse, string* pErrorMessage)
{
	return ListDirExt(sDirectory, pFiles, bRecourse, false, pErrorMessage);
}

#else

string TempDir()
{
    return AddDirSeparator(P_tmpdir);
}

bool DirectoryExists(string sDirectory)
{
    string dir = AddDirSeparator(sDirectory);

    if(0 != access(dir.c_str(), F_OK))
    {
        if(ENOENT == errno)
            return false; // doesn't exists
        if (ENOTDIR == errno)
            return false; // not a directory

        return false;
    }

    return true;
}

bool ListDirExt(string sDirectory, CWStringList* pFiles, bool bRecourse, bool bIncludeDirectories, string* pErrorMessage)
{
    sDirectory = AddDirSeparator(sDirectory);

	if(bIncludeDirectories) {
		pFiles->Add(sDirectory);
	}

    DIR *dp;
    struct dirent *dirp;
    if((dp  = opendir(sDirectory.c_str())) == NULL)
    {
        if(pErrorMessage != NULL)
        {
            string msg = "";
            if(errno == EACCES) msg = "Access denied.";
            if(errno == EMFILE) msg = "Too many open files.";
            if(errno == ENOMEM) msg = "Not enough memory.";
            *pErrorMessage = msg;
        }
        return false;
    }

    while((dirp = readdir(dp)) != NULL)
    {
        if(dirp->d_type == DT_REG)
        {
            string tmp_file = dirp->d_name;
            pFiles->Add(sDirectory + tmp_file);
        }
        else
        {
            if(dirp->d_type == DT_DIR && bRecourse)
            {
                string tmp_dir = dirp->d_name;
                if(tmp_dir != "." && tmp_dir != "..")
                {
                    if(!ListDirExt(sDirectory + tmp_dir, pFiles, bRecourse, bIncludeDirectories, pErrorMessage))
                    {
                        closedir(dp);
                        return false;
                    }
                }
            }
        }
    }
    closedir(dp);

    return true;
}

bool ListDir(string sDirectory, CWStringList* pFiles, bool bRecourse, string* pErrorMessage)
{
	return ListDirExt(sDirectory, pFiles, bRecourse, false, pErrorMessage);
}


#endif

string GetFullPath(string sPath, string* pErrorMessage)
{
	char buff[4096];
	char* res = realpath(sPath.c_str(), buff);

	if(!res)
	{
		if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
		return "";
	}
	return res;
}

string GetCWD() {
	return AddDirSeparator(GetFullPath(AddDirSeparator(".")));
}

int g_mymkdir(const char* dirname)
{
    int ret=0;
#ifdef _WIN32
    ret = _mkdir(dirname);
#else
    ret = mkdir(dirname, 0775);
#endif
    return ret;
}

int g_makedir (char *newdir, char* error_message)
{
    char *buffer;
    char *p;
    int  len = (int)strlen(newdir);

    if (len <= 0)
        return 0;

    buffer = (char*)malloc(len+1);
    if (buffer==NULL)
    {
        sprintf(error_message, "Error allocating memory.");
        return 1;
    }
    strcpy(buffer,newdir);

    if(buffer[len-1] == '/') {
        buffer[len-1] = '\0';
    }

    if (g_mymkdir(buffer) == 0)
    {
        free(buffer);
        return 1;
    }

    p = buffer+1;
    while (1)
    {
        char hold;

        while(*p && *p != '\\' && *p != '/')
            p++;
        hold = *p;
        *p = 0;
        if (g_mymkdir(buffer) == -1 && errno != EEXIST)
        {
            sprintf(error_message, "Couldn't create directory \"%s\": %s.", buffer, strerror(errno));
            free(buffer);
            return 0;
        }
        if(hold == 0)
            break;
        *p++ = hold;
    }
    free(buffer);
    return 1;
}

bool MakeDir(string sDirName, bool bFailIfExists, string* pErrorMessage)
{
    if(pErrorMessage != NULL) *pErrorMessage = "";

    if(DirectoryExists(sDirName))
    {
        if(bFailIfExists)
        {
            if(pErrorMessage != NULL) *pErrorMessage = "Directory \"" + sDirName + "\" already exists.";
            return false;
        }
        else
            return true;
    }

    char error_message[2048];
    if(!g_makedir((char*)sDirName.c_str(), error_message))
    {
        if(pErrorMessage != NULL) *pErrorMessage = error_message;
        return false;
    }

    return true;
}

bool ChDir(string sDirName, string* pErrorMessage)
{
	if(chdir(sDirName.c_str()) != 0)
	{
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
	}
	return true;
}

bool DirectoryIsEmpty(string sDirName, string* pErrorMessage)
{
	if(!DirectoryExists(sDirName)) {
		return true;
	}
	
	CWStringList files;
	if(!ListDir(sDirName, &files, false, pErrorMessage)) {
		return true;
	}
	return files.Count() == 0;
}

bool RmDir(string sDirName, string* pErrorMessage)
{
    if(rmdir(sDirName.c_str()) == -1)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }
    return true;
}

bool RmDirExt(string sDirName, bool bForceRemoveIfAllSubdirsAreEmpty, string* pErrorMessage)
{
	if(bForceRemoveIfAllSubdirsAreEmpty) {
		CWStringList files;
		if(!ListDir(sDirName, &files, true, pErrorMessage)) {
			return false;
		}
		if(files.Count() == 0) {
			CWStringList directories;
			if(!ListDirExt(sDirName, &directories, true, true, pErrorMessage)) {
				return false;
			}
			int dir_count = directories.Count();
			if(dir_count > 0) {
				directories.Sort(true);
				for(int i = 0; i < dir_count; i++) {
					string path = directories.Strings[i];
					if(rmdir(path.c_str()) == -1)
					{
						if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
						return false;
					}
				}
			}
		}
	}
	else
	{
		if(rmdir(sDirName.c_str()) == -1)
		{
			if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
			return false;
		}
	}

    return true;
}

string ConvertDirSeparator(string sFileName)
{
	string res = sFileName;

	if(FindSubString(&res, "http://") == 0 || FindSubString(&res, "https://") == 0) return sFileName;

	if(DIR_SEPARATOR_CHAR == '/') ReplaceSubString(&res, "\\", "/");
	if(DIR_SEPARATOR_CHAR == '\\') ReplaceSubString(&res, "/", "\\");

	return res;
}

bool FileExists(string sFileName, int* pFileSize)
{
    int fd = open(sFileName.c_str(), O_BINARY | O_RDONLY);
    if(fd < 0)
    {
        // file is not open.
        if(errno == ENOENT)
            return false;

        // error occoured, return false?
        return false;
    }

    if(pFileSize != NULL) *pFileSize = lseek(fd, 0, SEEK_END);

    close(fd);
    return true;
}

bool FileExists(string sFileName)
{
    return FileExists(sFileName, NULL);
}

bool FileMove(string sSource, string sDest, bool bFailIfExists, string* pErrorMessage)
{
    if(!FileExists(sSource))
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Source file \"" + sSource + "\" doesn't exists.";
        return false;
    }

	if(bFailIfExists && FileExists(sDest))
	{
        if(pErrorMessage != NULL) *pErrorMessage = "Dest file \"" + sDest + "\" already exists.";
        return false;
	}

    if(rename(sSource.c_str(), sDest.c_str()) == -1)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }

	return true;
}

bool FileCopy(string sSource, string sDest, bool bFailIfExists, int iTimeoutMS, string* pErrorMessage)
{
    int file_size = 0;
    if(!FileExists(sSource, &file_size))
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Source file \"" + sSource + "\" doesn't exists.";
        return false;
    }

    bool already_exists = FileExists(sDest, NULL);
    if(already_exists && bFailIfExists)
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Destination file \"" + sDest + "\" already exists.";
        return false;
    }

    // open source file and lock it (wait timeout if locked)
    int sour_fd = -1;
    if(!FileOpenAndLock(sSource, true, iTimeoutMS, &sour_fd, NULL, pErrorMessage))
        return false;

    if(already_exists && !FileDelete(sDest, pErrorMessage))
    {
        FileUnlockAndClose(sour_fd, NULL);
        return false;
    }

    int dest_fd = -1;
    if(!FileCreateAndLock(sDest, iTimeoutMS, &dest_fd, pErrorMessage))
    {
        FileUnlockAndClose(sour_fd, NULL);
        return false;
    }

    // perform copy
    int buffer_size = COPY_BUFFER_SIZE;
    if(buffer_size > file_size) buffer_size = file_size;
    char* buffer = (char*)malloc(buffer_size);
    int bytes_read = 0;
    while(bytes_read < file_size)
    {
        int chunk_size = file_size - bytes_read;
        if(chunk_size > buffer_size) chunk_size = buffer_size;
        if(!FileRead(sour_fd, buffer, chunk_size, pErrorMessage))
        {
            free(buffer);
            FileUnlockAndClose(dest_fd, NULL);
            FileUnlockAndClose(sour_fd, NULL);
            return false;
        }

        if(!FileWrite(dest_fd, buffer, chunk_size, pErrorMessage))
        {
            free(buffer);
            FileUnlockAndClose(dest_fd, NULL);
            FileUnlockAndClose(sour_fd, NULL);
            return false;
        }

        bytes_read = bytes_read + chunk_size;
    }
    free(buffer);

    FileUnlockAndClose(dest_fd, NULL);
    FileUnlockAndClose(sour_fd, NULL);

    return true;
}

bool FileDelete(string sFileName, string* pErrorMessage)
{
    if(unlink(sFileName.c_str()) == -1)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }
    return true;
}

// ---
// Open file for read/write (if exists) and return file size
// ---

bool FileOpen(string sFileName, bool bReadOnly, int* pFileDesc, int* pFileSize, string* pErrorMessage)
{
    // open file
    int fd = -1;
    if(bReadOnly)
        fd = open(sFileName.c_str(), O_BINARY | O_RDONLY);
    else
        fd = open(sFileName.c_str(), O_BINARY | O_RDWR);

    if(fd < 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }

    int file_size = lseek(fd, 0, SEEK_END);
    if(file_size < 0)
    {
        // data_size is < 0
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);

        FileClose(fd, NULL);
        return false;
    }

    lseek(fd, 0, SEEK_SET);

    *pFileDesc = fd;
    if(pFileSize != NULL) *pFileSize = file_size;

    return true;
}

bool FileCreate(string sFileName, int* pFileDesc, string* pErrorMessage)
{
    // open file
    int fd = open(sFileName.c_str(), O_BINARY | O_RDWR | O_CREAT, S_IRWALL);

    if(fd < 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }

    if(!FileTruncate(fd, 0, pErrorMessage))
        return false;

    *pFileDesc = fd;

    return true;
}

bool FileClose(int iFileDesc, string* pErrorMessage)
{
    if(close(iFileDesc) == -1)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }
    return true;
}

#ifdef _WIN32

bool FileLock(int iFileDescriptor, int iLockType, int iTimeoutMS, CWCallbackFunction pCallback, const void* pCallbackArg, int iCallbackIntervalMS, string* pErrorMessage)
{
    // ????????????????????????
    return true;
}

#else

bool FileLock(int iFileDescriptor, int iLockType, int iTimeoutMS, CWCallbackFunction pCallback, const void* pCallbackArg, int iCallbackIntervalMS, string* pErrorMessage)
{
    // iLockType:
    //    F_UNLCK = unlock
    //    F_WRLCK = write lock
    //    F_RDLCK = read lock

    // lock file
    struct flock fl;
    fl.l_type   = iLockType;
    fl.l_whence = SEEK_SET;
    fl.l_start  = 0;
    fl.l_len    = 0;
    fl.l_pid    = getpid();

    double start_time = GetTimeMS();
    double last_callback = GetTimeMS();
    while(fcntl(iFileDescriptor, F_SETLK, &fl) == -1)
    {
        if(errno == EACCES || errno == EAGAIN)
        {
            // exit if timeout
            if((GetTimeMS() - start_time) >= iTimeoutMS)
            {
                if(pErrorMessage != NULL) *pErrorMessage = "Timeout.";
                return false;
            }

            // execute callback
            if(pCallback != NULL && iCallbackIntervalMS > 0)
            {
                if((GetTimeMS() - last_callback) >= iCallbackIntervalMS)
                {
                    if(!pCallback(pCallbackArg, pErrorMessage))
                        return false;
                    last_callback = GetTimeMS();
                }
            }

            SleepMS(SLEEP_1);
        }
        else
        {
            if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
            return false;
        }
    }

    return true;
}

#endif

bool FileLock(int iFileDescriptor, int iLockType, int iTimeoutMS, string* pErrorMessage)
{
    return FileLock(iFileDescriptor, iLockType, iTimeoutMS, NULL, NULL, 0, pErrorMessage);
}

// ---
// wait while file exists, then create new file and lock it.
// ---

bool FileCreateNonExistingAndLock(string sFileName, int iTimeoutMS, int* pFileDesc, string* pErrorMessage)
{
    // open file (wait timeout while exists)
    double start_time = GetTimeMS();
    int fd = -1;
    while(fd < 0)
    {
        fd = open(sFileName.c_str(), O_BINARY | O_RDWR | O_CREAT | O_EXCL, S_IRWALL);
        if(fd < 0)
        {
            if(errno == EEXIST)
            {
                if((GetTimeMS() - start_time) >= iTimeoutMS)
                {
                    if(pErrorMessage != NULL) *pErrorMessage = "Timeout.";
                    return false;
                }
                SleepMS(SLEEP_1);
            }
            else
            {
                if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
                return false;
            }
        }
    }

    // lock the file
    if(!FileLock(fd, F_WRLCK, iTimeoutMS, pErrorMessage))
    {
        close(fd);
        return false;
    }

    *pFileDesc = fd;
    return true;
}

// ---
// Open or create file if not exists. Wait timeout while locked by other and lock.
// ---

bool FileOpenOrCreateAndLock(string sFileName, int iTimeoutMS, int* pFileDesc, string* pErrorMessage)
{
    // open file
    int fd = open(sFileName.c_str(), O_BINARY | O_RDWR | O_CREAT, S_IRWALL);
    if(fd < 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }

    // lock the file
    if(!FileLock(fd, F_WRLCK, iTimeoutMS, pErrorMessage))
    {
        close(fd);
        return false;
    }

    *pFileDesc = fd;
    return true;
}

// ---
// If file doesn't exists, create and lock it. If already exists - error.
// ---

bool FileCreateAndLock(string sFileName, int iTimeoutMS, int* pFileDesc, string* pErrorMessage)
{
    // open file
    int fd = open(sFileName.c_str(), O_BINARY | O_RDWR | O_CREAT | O_EXCL, S_IRWALL);
    if(fd < 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }

    // lock the file
    if(!FileLock(fd, F_WRLCK, iTimeoutMS, pErrorMessage))
    {
        close(fd);
        return false;
    }

    *pFileDesc = fd;
    return true;
}

// ---
// if file exists wait timeout if locked, open and lock it.
// ---

bool FileOpenAndLock(string sFileName, bool bReadOnly, int iTimeoutMS, int* pFileDesc, int* pFileSize, string* pErrorMessage)
{
    // open file
    int fd = -1;
    if(bReadOnly)
        fd = open(sFileName.c_str(), O_BINARY | O_RDONLY);
    else
        fd = open(sFileName.c_str(), O_BINARY | O_RDWR);

    if(fd < 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }

    // lock the file
    if(bReadOnly)
    {
        if(!FileLock(fd, F_RDLCK, iTimeoutMS, pErrorMessage))
        {
            close(fd);
            return false;
        }
    }
    else
    {
        if(!FileLock(fd, F_WRLCK, iTimeoutMS, pErrorMessage))
        {
            close(fd);
            return false;
        }
    }

    int file_size = lseek(fd, 0, SEEK_END);
    if(file_size < 0)
    {
        // data_size is < 0
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);

        FileUnlockAndClose(fd, NULL);
        return false;
    }
    lseek(fd, 0, SEEK_SET);

    *pFileDesc = fd;
    if(pFileSize != NULL) *pFileSize = file_size;

    return true;
}

// ---
// wait while file not exists or is empty, open and lock it. If not exists or is empty, return after timeout ms.
// ---

bool FileOpenExistingAndLock(string sFileName, int iTimeoutMS, int* pFileDesc, int* pFileSize, CWCallbackFunction pCallback, const void* pCallbackArg, int iCallbackIntervalMS, string* pErrorMessage)
{
    // open file (wait timeout while not exists)
    double start_time = GetTimeMS();
    double last_callback = GetTimeMS();
    int fd = -1;
    int data_size = 0;
    while(fd < 0)
    {
        fd = open(sFileName.c_str(), O_BINARY | O_RDWR);
        if(fd < 0)
        {
            // file is not open.
            if(errno == ENOENT)
            {
                // File doesn't exists. return if timeout.
                if((GetTimeMS() - start_time) >= iTimeoutMS)
                {
                    if(pErrorMessage != NULL) *pErrorMessage = "Timeout.";
                    return false;
                }

                // execute callback
                if(pCallback != NULL && iCallbackIntervalMS > 0)
                {
                    if((GetTimeMS() - last_callback) >= iCallbackIntervalMS)
                    {
                        if(!pCallback(pCallbackArg, pErrorMessage))
                            return false;
                        last_callback = GetTimeMS();
                    }
                }

                // sleep and try again
                SleepMS(SLEEP_1);
            }
            else
            {
                // error opening file.
                if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
                return false;
            }
        }
        else
        {
            // File is open. Get write lock, wait timeout while got lock.
            if(!FileLock(fd, F_WRLCK, iTimeoutMS, pCallback, pCallbackArg, iCallbackIntervalMS, pErrorMessage))
            {
                close(fd);
                return false;
            }

            // got lock, check if file is empty
            data_size = lseek(fd, 0, SEEK_END);
            if(data_size < 0)
            {
                // data_size is < 0
                if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);

                FileUnlockAndClose(fd, NULL);
                return false;
            }

            if(data_size == 0)
            {
                // close file
                FileUnlockAndClose(fd, NULL);
                fd = -1;

                // return if timeout
                if((GetTimeMS() - start_time) >= iTimeoutMS)
                {
                    if(pErrorMessage != NULL) *pErrorMessage = "Timeout.";
                    return false;
                }

                // execute callback
                if(pCallback != NULL && iCallbackIntervalMS > 0)
                {
                    if((GetTimeMS() - last_callback) >= iCallbackIntervalMS)
                    {
                        if(!pCallback(pCallbackArg, pErrorMessage))
                            return false;
                        last_callback = GetTimeMS();
                    }
                }

                // sleep and try again...
                SleepMS(SLEEP_2);
            }
            else
                lseek(fd, 0, SEEK_SET);
        }
    }
    *pFileDesc = fd;
    if(pFileSize != NULL) *pFileSize = data_size;
    return true;
}

bool FileOpenExistingAndLock(string sFileName, int iTimeoutMS, int* pFileDesc, int* pFileSize, string* pErrorMessage)
{
    return FileOpenExistingAndLock(sFileName, iTimeoutMS, pFileDesc, pFileSize, NULL, NULL, 0, pErrorMessage);
}

bool FileUnlockAndClose(int iFileDescriptor, string* pErrorMessage)
{
    // unlock file
    if(!FileLock(iFileDescriptor, F_UNLCK, 0, pErrorMessage))
    {
        close(iFileDescriptor);
        return false;
    }

    // close file
    close(iFileDescriptor);
    return true;
}

bool FileTruncate(int iFileDescriptor, int iSize, string* pErrorMessage)
{
    if(ftruncate(iFileDescriptor, iSize) == -1)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }
    return true;
}

int FilePos(int iFileDescriptor, string* pErrorMessage)
{
    int pos = lseek(iFileDescriptor, 0, SEEK_CUR);
    if(pos < 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return -1;
    }
    return pos;
}

bool FileSeekToEnd(int iFileDescriptor, string* pErrorMessage)
{
    if(lseek(iFileDescriptor, 0, SEEK_END) == -1)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }
    return true;
}

bool FileSeek(int iFileDescriptor, int iPos, string* pErrorMessage)
{
    if(lseek(iFileDescriptor, iPos, SEEK_SET) == -1)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }
    return true;
}

bool FileSeekToBegin(int iFileDescriptor, string* pErrorMessage)
{
    if(lseek(iFileDescriptor, 0, SEEK_SET) == -1)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
        return false;
    }
    return true;
}

bool FileWrite(int iFileDescriptor, void* pBuffer, int iSize, string* pErrorMessage)
{
    if(iSize == 0) return true;

    // write data
    int bytes_written = 0;
    while(bytes_written < iSize)
    {
        int wr = write(iFileDescriptor, (char*)pBuffer + bytes_written, iSize - bytes_written);
        if(wr > 0)
            bytes_written = bytes_written + wr;
        else
        {
            if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
            return false;
        }
    }
    return true;
}

bool FileRead(int iFileDescriptor, void* pBuffer, int iSize, string* pErrorMessage)
{
    if(iSize == 0) return true;
    // read data
    int bytes_read = 0;
    while(bytes_read < iSize)
    {
        int rd = read(iFileDescriptor, (char*)pBuffer + bytes_read, iSize - bytes_read);
        if(rd > 0)
            bytes_read = bytes_read + rd;
        else
        {
            if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
            return false;
        }
    }
    return true;
}

bool FileReadLine(int iFileDescriptor, string* pLine, bool* pEOF, string* pErrorMessage)
{
	pLine->clear();
	*pEOF = false;

	const int block_size = 4096;
	char block[block_size];

    // read data
	bool newline_found = false;
	do {
		int rd = read(iFileDescriptor, block, block_size);
		if(rd == 0)
		{
			*pEOF = true;
			return false;
		}

		if(rd < 0)
		{
            if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
            return false;
		}

		int newline_pos = FindChar(block, '\n', 0, rd);
		if(newline_pos >= 0)
		{
			pLine->append(block, newline_pos);
			newline_found = true;

			if(lseek(iFileDescriptor, (newline_pos + 1) - rd, SEEK_CUR) == -1)
			{
				if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);
				return false;
			}
		}
		else
			pLine->append(block, rd);

	} while(!newline_found);

	return true;
}

bool FilePrint(int iFileDescriptor, int iSize, string* pErrorMessage)
{
    if(iSize == 0) return true;

    // copy file to stdout
    int buffer_size = COPY_BUFFER_SIZE;
    if(buffer_size > iSize) buffer_size = iSize;
    char* buffer = (char*)malloc(buffer_size);
    int bytes_read = 0;
    while(bytes_read < iSize)
    {
        int chunk_size = iSize - bytes_read;
        if(chunk_size > buffer_size) chunk_size = buffer_size;
        if(!FileRead(iFileDescriptor, buffer, chunk_size, pErrorMessage))
        {
            free(buffer);
            return false;
        }

        for(int i = 0; i < chunk_size; i++)
            fputc(buffer[i], stdout);
        bytes_read = bytes_read + chunk_size;
    }
    free(buffer);

    return true;
}

// create or wait while file is locked, open it, truncate to zero and write data
bool FileSave(string sFileName, void* pBuffer, int iSize, int iTimeoutMS, string* pErrorMessage)
{
    int fd = -1;
    if(!FileOpenOrCreateAndLock(sFileName, iTimeoutMS, &fd, pErrorMessage))
        return false;

    // truncate file to zero bytes
    if(ftruncate(fd, 0) == -1)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);

        FileUnlockAndClose(fd, NULL);
        return false;
    }

    if(!FileWrite(fd, pBuffer, iSize, pErrorMessage))
    {
        FileUnlockAndClose(fd, NULL);
        return false;
    }

    FileUnlockAndClose(fd, NULL);
    return true;
}

bool FileSaveString(string sFileName, const string& sString, int iTimeoutMS, string* pErrorMessage)
{
    return FileSave(sFileName, (void*)(sString.c_str()), sString.size(), iTimeoutMS, pErrorMessage);
}

bool FileSaveString(string sFileName, string* pString, int iTimeoutMS, string* pErrorMessage)
{
    return FileSave(sFileName, (void*)(pString->c_str()), pString->size(), iTimeoutMS, pErrorMessage);
}

// create or wait while file is locked, open it, move to end of file and write data
bool FileAppend(string sFileName, void* pBuffer, int iSize, int iTimeoutMS, string* pErrorMessage)
{
    int fd = -1;
    if(!FileOpenOrCreateAndLock(sFileName, iTimeoutMS, &fd, pErrorMessage))
        return false;

    // seek to end of file
    if(lseek(fd, 0, SEEK_END) == -1)
    {
        if(pErrorMessage != NULL) *pErrorMessage = strerror(errno);

        FileUnlockAndClose(fd, NULL);
        return false;
    }

    if(!FileWrite(fd, pBuffer, iSize, pErrorMessage))
    {
        FileUnlockAndClose(fd, NULL);
        return false;
    }

    FileUnlockAndClose(fd, NULL);
    return true;
}

bool FileAppendString(string sFileName, const string& sString, int iTimeoutMS, string* pErrorMessage)
{
    return FileAppend(sFileName, (void*)(sString.c_str()), sString.size(), iTimeoutMS, pErrorMessage);
}

bool FileAppendString(string sFileName, string* pString, int iTimeoutMS, string* pErrorMessage)
{
    return FileAppend(sFileName, (void*)(pString->c_str()), pString->size(), iTimeoutMS, pErrorMessage);
}

bool FileLoadString(string sFileName, string* pString, int iTimeoutMS, string* pErrorMessage)
{
    int fd = -1;
    int data_size = 0;
    // open file
    if(!FileOpenAndLock(sFileName, true, iTimeoutMS, &fd, &data_size, pErrorMessage))
        return false;

    char* buffer = (char*)malloc(data_size + 1);
    if(!FileRead(fd, (void*)buffer, data_size, pErrorMessage))
    {
        free(buffer);
        FileUnlockAndClose(fd, NULL);
        return false;
    }
    buffer[data_size] = '\0';

    FileUnlockAndClose(fd, NULL);

    *pString = buffer;
    free(buffer);
    return true;
}


// open file (wait if locked) and load data

bool FileLoad(string sFileName, void** pBuffer, int* pSize, int iTimeoutMS, string* pErrorMessage)
{
    int fd = -1;
    int data_size = 0;
    // open file
    if(!FileOpenAndLock(sFileName, true, iTimeoutMS, &fd, &data_size, pErrorMessage))
        return false;

    // read data
    void* buffer = malloc(data_size + 1);
    if(!FileRead(fd, buffer, data_size, pErrorMessage))
    {
        FileUnlockAndClose(fd, NULL);
        free(buffer);
        return false;
    }
    *pBuffer = buffer;
    *pSize = data_size;

    // unlock and close file
    FileUnlockAndClose(fd, NULL);

    return true;
}

bool FileSHA1(string sFileName, string* pSHA1, string* pErrorMessage)
{
    int fd = -1;
    int data_size = 0;
    // open file
    if(!FileOpenAndLock(sFileName, true, 0, &fd, &data_size, pErrorMessage))
        return false;

    // read data
    char* buffer = (char*)malloc(data_size + 1);
    if(!FileRead(fd, buffer, data_size, pErrorMessage))
    {
        FileUnlockAndClose(fd, NULL);
        free(buffer);
        return false;
    }

	*pSHA1 = GetSHA1(buffer, data_size);

    // unlock and close file
    FileUnlockAndClose(fd, NULL);
    return true;	
}

double FileDateModifiedMS(string sFileName) {
	struct stat fs;
	if(stat(sFileName.c_str(), &fs) < 0) {
		return -1;
	}
	
    double res = 0;
    res += fs.st_mtime * 1000.0; // sec to ms

    return res;
}

bool WaitForFileChange(string sFileName, string* pErrorMessage) {
	string sha1;
	if(!FileSHA1(sFileName, &sha1, pErrorMessage)) {
		return false;
	}

	string new_sha1 = "";
	do {
		SleepMS(SLEEP_3);
		if(!FileSHA1(sFileName, &new_sha1, pErrorMessage)) {
			return false;
		}
	} while(new_sha1 == sha1);

	return true;
}
