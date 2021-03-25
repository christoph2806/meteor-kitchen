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

#ifndef CPPW_STRING_H
#define CPPW_STRING_H

#include <string>
#include <vector>
#include <string.h>
#include <stdint.h>

#define LINE_TERM "\n"

#ifdef _WIN32
    #ifndef strncasecmp
        #define strncasecmp strnicmp
    #endif

    #ifndef strcasecmp
        #define strcasecmp stricmp
    #endif
#endif

using namespace std;

class CWStringList;

char* _ftoa(double val, char* str);
char* _ftoa(double fValue, int iScale, char* pBuffer);
char* _itoa(int value, char* result, int base);

string IntToStr(int iNum);
int StrToInt(string str);
int StrToIntDef(string str, int iDefaultValue);
int ExtractIntDef(string str, int iDefaultValue);

double StrToFloat(string str);
string FloatToStr(double fValue);
string FloatToStr(double fValue, int iScale);
string FloatToStr(double fValue, char cDecimalSeparator, char cThousandSeparator);
string FloatToStr(double fValue, int iScale, char cDecimalSeparator, char cThousandSeparator, int iMaxTrailingZeroes = -1);

void ToLowerCase(string* pInput);
string ToLowerCase(string sInput);

void ToUpperCase(string* pInput);
string ToUpperCase(string sInput);

string ToCamelCase(string sInput, char cTriggerChar, bool bUpperFirstChar);
string FromCamelCase(string sInput, char cInsertChar, bool bToLowerCase);

int FindCodeBlock(string* pString, string sStartString, string sEndString, string* pBlock, bool bCaseSensitive = true, int iStartFrom = 0);

int FindBlock(string* pString, string sStartString, string sEndString, string* pBlock, bool bCaseSensitive = true, int iStartFrom = 0);

int FindSubString(string* pString, string* pSubString, bool bCaseSensitive = true, int iStartFrom = 0, bool bWholeWord = false);
int FindSubString(string* pString, string sSubString, bool bCaseSensitive = true, int iStartFrom = 0, bool bWholeWord = false);

void ReplaceSubString(string* pString, string* pOld, string* pNew, bool bCaseSensitive = true, bool bWholeWord = false);
void ReplaceSubString(string* pString, string sOld, string sNew, bool bCaseSensitive = true, bool bWholeWord = false);
string ReplaceSubString(const string& sString, string sOld, string sNew, bool bCaseSensitive = true, bool bWholeWord = false);

void InsertBeforeSubString(string* pString, string *pSub, string *pNew);
void InsertBeforeSubString(string* pString, string sSub, string sNew);
string InsertBeforeSubString(const string& sString, string sSub, string sNew);

void InsertAfterSubString(string* pString, string *pSub, string *pNew);
void InsertAfterSubString(string* pString, string sSub, string sNew);
string InsertAfterSubString(const string& sString, string sSub, string sNew);

void InsertIntoSubString(string* pString, string *pSub, string *pNew, int iPos);
void InsertIntoSubString(string* pString, string sSub, string sNew, int iPos);
string InsertIntoSubString(const string& sString, string sSub, string sNew, int iPos);

string EnsureFirstChar(const string& sString, char cChar);
string EnsureLastChar(const string& sString, char cChar);

string RemoveFirstChar(const string& sString, char cChar);
string RemoveLastChar(const string& sString, char cChar);

int FindChar(const char* str, char c, int pos = 0, int num = -1);
string TerminateAtChar(string sString, char cChar);
string Trim(string sString, bool bSpaces = true, bool bNewLines = true);
string TrimRight(string sString, bool bSpaces = true, bool bNewLines = true);
string LastLineWhitespace(string sString);

void StringAppendLine(string* pString, string* pLine, int iIndentCount = 0, char cIndentChar = '\t', string sLineTerm = LINE_TERM);
void StringAppendLine(string* pString, string sLine, int iIndentCount = 0, char cIndentChar = '\t', string sLineTerm = LINE_TERM);
void StringToList(const string* pText, char cSeparator, CWStringList* pList);
void StringToList(const string& sText, char cSeparator, CWStringList* pList);
void StringToList(const string& sText, char cSeparator, char cIgnoreSepStartChar, char cIgnoreSepEndChar, CWStringList* pList);
void StringToListExt(const string& sText, char cSeparator, CWStringList* pList, string sCharsToSpace = "", string sCharsToDelete = "");
string ListToString(CWStringList* pList, char cSeparator);

string ExpandString(string sString, int iLen, bool bAlignLeft, char cChar);

string TimeString(bool bLocal = false);
string RandomString(int iLen);

void GetCursorPos(const char* cString, int iPos, int* pLineNo, int* pCharNo);

bool IsEMailAddress(string sEMail);

int StrCmp(const string& str1, const string& str2, bool bOpposite = false);
int StrCmpi(const string& str1, const string& str2, bool bOpposite = false);

int LevenshteinDist(const char *s1, const char *s2, bool bCaseSensitive = true);
int LevenshteinDistance(string *pS1, string *pS2, bool bCaseSensitive = true);
int LevenshteinDistance(const string &s1, const string &s2, bool bCaseSensitive = true);

string ByteToBinString(uint8_t iByte, char cFalseChar = '0', char cTrueChar = '1');

uint32_t UTF8_charlen(const char* cUTF8, uint32_t* pPos = NULL);
uint32_t UTF8_strlen(const char* cUTF8);
uint32_t UTF8_to_UTF32_char(const char* cUTF8, uint32_t* pPos, int* pLen);

string URLEncode(string sString, string sKeep);

void EscapeMarkdown(string* pMarkdown);
string EscapeMarkdown(const string& sMarkdown);

/// String list object for easy manipulation with list of strings.
class CWStringList
{
    public:
        string Name;

        vector<string> Strings;

        CWStringList();
        ~CWStringList();

        void Clear();
        int Count();

        void Assign(CWStringList* pCopyFrom);
        void Append(CWStringList* pCopyFrom);
		void Append(string sText);
		void Merge(CWStringList* pMergeFrom, bool bCaseSensitive = true);
        void SetText(string sText);
        string GetText(); // join all elements into signle string object. Newlines inside elements are converted to "space-backslash-newline" sequence.

        void Add(string sString); // add string to the end of list.
        void AddUnique(string sString, bool bCaseSensitive = true); // add string to the end of list only if string doesn't already exists
        void Insert(string sString, int iIndex); // insert string into position iIndex.
        void Delete(int iIndex); // delete iIndex-th element from list.
        void Delete(string sString); // delete all occourences of whole string from list.
        void DeleteEmptyLines();

        int Find(string sString, bool bCaseSensitive = true, int iStartIndex = 0);
        int FindSubStr(string sSubString, bool bCaseSensitive = true, int iStartIndex = 0);
        int FindBeginWith(string sString, bool bCaseSensitive = true, int iStartIndex = 0);
        int FindSimilar(string sString, bool bCaseSensitive = true, int iStartIndex = 0, int iMaxDistance = -1);

        void ReplaceStr(string sOld, string sNew, bool bCaseSensitive = true, int iStartIndex = 0);
        void ReplaceSubStr(string sOld, string sNew, bool bCaseSensitive = true, int iStartIndex = 0, bool bWholeWord = false);
        void TerminateAllAtChar(char cChar); // remove char and everything after it in all strings
        void TrimAll(); // remove leading and trailing whitespaces from all strings (space, tab and newline characters)

        void ReplaceValues(string sOld, string sNew, bool bCaseSensitive = true);
		void ReplaceValueSubstring(string sOld, string sNew, bool bCaseSensitive = true);

        // name=value functions
        bool IsNameValue(int iIndex);
        int FindName(string sName, int iStartIndex = 0);
        void DeleteNameValue(string sName);
        string GetName(int iIndex);
        string GetValue(string sName, int iStartIndex = 0);
        string GetValue(string sName, string sDefaultValue, int iStartIndex = 0);
        string GetValue(int iIndex);
        void GetValues(string sName, CWStringList* pValues);
        void SetValue(string sName, string sValue);
        void SetValue(int iIndex, string sValue);

        void Swap(int iIndex1, int iIndex2);

        void Sort(bool bDescending, int iStart, int iEnd);
        void Sort(bool bDescending = false);
};

/// Array of CWStringList objects
class CWStringListArray
{
    public:
        vector<CWStringList*>Items;

        bool OwnsObjects;

        CWStringListArray();
        ~CWStringListArray();

        void Clear();
        int Count();

        void Add(CWStringList* pList);
        void Delete(int iIndex);
        int IndexOf(CWStringList* pList);
};

/// String table - list of CWStringList objects (base class for CSV parser CWCSV)
class CWStringTable
{
    public:
        vector<CWStringList*> Columns;

        CWStringTable();
        ~CWStringTable();

        void Clear();
        void ClearData();

        int RowCount();
        int ColCount();

        int AddRow();
        CWStringList* AddCol(string sColName = "", string sDefaultValue = "");

        int GetColIndex(string sColName);
        CWStringList* GetCol(string sColName);

        void DeleteRow(int iRowIndex);
        void DeleteCol(int iColIndex);
        void DeleteCol(string sColName);

        string GetValue(int iColIndex, int iRowIndex);
        string GetValue(string sColName, int iRowIndex);

        void SetValue(int iColIndex, int iRowIndex, string sValue, bool bAutoExpand = true);
        void SetValue(string sColName, int iRowIndex, string sValue, bool bAutoExpand = true);

        void SwapCols(int iIndex1, int iIndex2);
        void SwapCols(string sColName1, string sColName2);
        void SwapRows(int iIndex1, int iIndex2);

        void Sort(int iColIndex, bool bDescending, int iStart, int iEnd);
        void Sort(int iColIndex, bool bDescending = false);
        void Sort(string sColName, bool bDescending = false);

        void CopyStruct(CWStringTable* pTable);
        void AddExternalRow(CWStringTable* pTable, int iRowIndex);

		bool WordStats(int iColIndex, CWStringTable* pStats, bool bUniqueValues = false, string sCharsToSpace = "", string sCharsToDelete = "", int* pSum = NULL);
        bool WordStats(string sColName, CWStringTable* pStats, bool bUniqueValues = false, string sCharsToSpace = "", string sCharsToDelete = "", int* pSum = NULL);
};

class CWSortedList
{
		bool Unique;
		bool CaseSensitive;
	public:
        vector<string> Strings;
        string Name;

		CWSortedList(bool bCaseSensitive = true, bool bUnique = false);
		~CWSortedList();

		void Clear();
		int Count();
		int Add(string sString, bool* pDuplicate = NULL);
		void Merge(CWStringList* pMergeFrom);
		void Delete(int iIndex);

		int BinarySearch(string sString, int iMin, int iMax, int* pPos = NULL);
		int Find(string sString);

		string ShortestString();
};

/// Array of CWSortedList objects
class CWSortedListArray
{
    public:
        vector<CWSortedList*>Items;

        bool OwnsObjects;
        string Name;

        CWSortedListArray();
        ~CWSortedListArray();

        void Clear();
        int Count();
        int TotalCount();

        void Add(CWSortedList* pList);
        void Delete(int iIndex);
        int IndexOf(CWSortedList* pList);
		int IndexOf(string sName);

		int Find(string sName, string sString);
};


class CWStringIndex
{
	public:
		CWStringList* List;
		bool Unique;
		bool CaseSensitive;
		vector<int> Positions;

		CWStringIndex(CWStringList* pList, bool bCaseSensitive = true, bool bUnique = false);
		~CWStringIndex();

		void Clear();
		int Count();

		int BinarySearch(string sString, int iMin, int iMax, int* pPos = NULL);
		int Find(string sString);
		void Rebuild(bool bCaseSensitive = true, bool bUnique = false);
		string StringAt(int iPosition);
};

#endif
