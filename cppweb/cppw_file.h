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

#ifndef CPPW_FILE_H
#define CPPW_FILE_H

#include "cppw_callback.h"
#include "cppw_string.h"
#include "cppw_sha1.h"

#define COPY_BUFFER_SIZE 65536 // 64k

#ifdef _WIN32
        #define DIR_SEPARATOR "\\"
        #define DIR_SEPARATOR_CHAR '\\'
#else
        #define DIR_SEPARATOR "/"
        #define DIR_SEPARATOR_CHAR '/'
#endif

#ifndef STDIN_FILENO
    #define STDIN_FILENO 0
#endif

#ifndef STDOUT_FILENO
    #define STDOUT_FILENO 1
#endif

string GetDirSeparator(string sFileName);
string AddDirSeparator(string sFileName);

string ChangeFileExt(string sFileName, string sNewExt);
string ExtractFileExt(string sFileName);
string ExtractFileDir(string sFileName);
string ExtractFileName(string sFileName);
string AddSuffixToFileName(string sFileName, string sSuffix);

string TempDir();
bool MakeDir(string sDirName, bool bFailIfExists, string* pErrorMessage);
bool ChDir(string sDirName, string* pErrorMessage);
string GetFullPath(string sPath, string* pErrorMessage = NULL);
string GetCWD();
string ConvertDirSeparator(string sFileName);
bool DirectoryIsEmpty(string sDirName, string* pErrorMessage = NULL);
bool RmDir(string sDirName, string* pErrorMessage = NULL);
bool RmDirExt(string sDirName, bool bForceRemoveIfAllSubdirsAreEmpty, string* pErrorMessage = NULL);

bool FileExists(string sFileName, int* pFileSize);
bool FileExists(string sFileName);

bool DirectoryExists(string sDirectory);
bool ListDirExt(string sDirectory, CWStringList* pFiles, bool bRecourse, bool bIncludeDirectories, string* pErrorMessage = NULL);
bool ListDir(string sDirectory, CWStringList* pFiles, bool bRecourse, string* pErrorMessage = NULL);

bool FileMove(string sSource, string sDest, bool bFailIfExists, string* pErrorMessage);
bool FileCopy(string sSource, string sDest, bool bFailIfExists, int iTimeoutMS, string* pErrorMessage);
bool FileDelete(string sFileName, string* pErrorMessage);

bool FileOpen(string sFileName, bool bReadOnly, int* pFileDesc, int* pFileSize, string* pErrorMessage);
bool FileCreate(string sFileName, int* pFileDesc, string* pErrorMessage);
bool FileClose(int iFileDesc, string* pErrorMessage);

bool FileSetMode(int iFileDescriptor, int iMode, string* pErrorMessage);
bool FileSetBinary(int iFileDescriptor, string* pErrorMessage);

bool FileLock(int iFileDescriptor, int iLockType, int iTimeoutMS, CWCallbackFunction pCallback, const void* pCallbackArg, int iCallbackIntervalMS, string* pErrorMessage);
bool FileLock(int iFileDescriptor, int iLockType, int iTimeoutMS, string* pErrorMessage);

bool FileCreateAndLock(string sFileName, int iTimeoutMS, int* pFileDesc, string* pErrorMessage);
bool FileOpenAndLock(string sFileName, bool bReadOnly, int iTimeoutMS, int* pFileDesc, int* iFileSize, string* pErrorMessage);
bool FileOpenOrCreateAndLock(string sFileName, int iTimeoutMS, int* pFileDesc, string* pErrorMessage);

bool FileCreateNonExistingAndLock(string sFileName, int iTimeoutMS, int* pFileDesc, string* pErrorMessage);
bool FileOpenExistingAndLock(string sFileName, int iTimeoutMS, int* pFileDesc, int* pFileSize, CWCallbackFunction pCallback, const void* pCallbackArg, int iCallbackIntervalMS, string* pErrorMessage);
bool FileOpenExistingAndLock(string sFileName, int iTimeoutMS, int* pFileDesc, int* pFileSize, string* pErrorMessage);
bool FileUnlockAndClose(int iFileDescriptor, string* pErrorMessage);

bool FileTruncate(int iFileDescriptor, int iSize, string* pErrorMessage);
int FilePos(int iFileDescriptor, string* pErrorMessage);
bool FileSeekToEnd(int iFileDescriptor, string* pErrorMessage);
bool FileSeek(int iFileDescriptor, int iPos, string* pErrorMessage);
bool FileSeekToBegin(int iFileDescriptor, string* pErrorMessage);

bool FileWrite(int iFileDescriptor, void* pBuffer, int iSize, string* pErrorMessage);
bool FileRead(int iFileDescriptor, void* pBuffer, int iSize, string* pErrorMessage);
bool FileReadLine(int iFileDescriptor, string* pLine, bool* pEOF, string* pErrorMessage);
bool FilePrint(int iFileDescriptor, int iSize, string* pErrorMessage);

bool FileSave(string sFileName, void* pBuffer, int iSize, int iTimeoutMS, string* pErrorMessage);
bool FileSaveString(string sFileName, const string& sString, int iTimeoutMS, string* pErrorMessage);
bool FileSaveString(string sFileName, string* pString, int iTimeoutMS, string* pErrorMessage);
bool FileAppend(string sFileName, void* pBuffer, int iSize, int iTimeoutMS, string* pErrorMessage);
bool FileAppendString(string sFileName, const string& sString, int iTimeoutMS, string* pErrorMessage);
bool FileAppendString(string sFileName, string* pString, int iTimeoutMS, string* pErrorMessage);
bool FileLoad(string sFileName, void** pBuffer, int* pSize, int iTimeoutMS, string* pErrorMessage);
bool FileLoadString(string sFileName, string* pString, int iTimeoutMS, string* pErrorMessage);

bool FileSHA1(string sFileName, string* pSHA1, string* pErrorMessage);

double FileDateModifiedMS(string sFileName);
bool WaitForFileChange(string sFileName, string* pErrorMessage);



#endif
