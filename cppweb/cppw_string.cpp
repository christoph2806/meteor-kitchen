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

#include "cppw_string.h"
#include "cppw_time.h"
#include <sstream>
#include <cstdio>
#include <cstdlib>
#include <algorithm>
#include <math.h>

#define MIN3(a, b, c) ((a) < (b) ? ((a) < (c) ? (a) : (c)) : ((b) < (c) ? (b) : (c)))

char* _ftoa(double val, char* str)
{
  sprintf(str, "%f", val);
  return str;
}

char* _ftoa(double fValue, int iScale, char* pBuffer)
{
    char fmt[10];
    sprintf(fmt, "%%.%dlf", iScale);
    sprintf(pBuffer, fmt, fValue);
    return pBuffer;
}

char* _itoa(int value, char* result, int base)
{
    // check that the base if valid
    if (base < 2 || base > 36) { *result = '\0'; return result; }

    char* ptr = result, *ptr1 = result, tmp_char;
    int tmp_value;

    do {
        tmp_value = value;
        value /= base;
        *ptr++ = "zyxwvutsrqponmlkjihgfedcba9876543210123456789abcdefghijklmnopqrstuvwxyz" [35 + (tmp_value - value * base)];
    } while ( value );

    // Apply negative sign
    if (tmp_value < 0) *ptr++ = '-';
    *ptr-- = '\0';
    while(ptr1 < ptr) {
        tmp_char = *ptr;
        *ptr--= *ptr1;
        *ptr1++ = tmp_char;
    }
    return result;
}

string IntToStr(int iNum)
{
    char res[128];
    sprintf(res, "%d", iNum);
    return res;
}

int StrToInt(string str)
{
    return(atoi(str.c_str()));
}

int StrToIntDef(string str, int iDefaultValue)
{
    if(str == "" || str.find_first_not_of("0123456789+-") != string::npos)
        return iDefaultValue;
    return(atoi(str.c_str()));
}

int ExtractIntDef(string str, int iDefaultValue)
{
    string s = "";
    const char* buff = str.c_str();
    int i = 0;
    while(buff[i] != '\0')
    {
        if(isdigit(buff[i]))
            s.push_back(buff[i]);
        i++;
    }

    return StrToIntDef(s, iDefaultValue);
}

double StrToFloat(string str)
{
    return(atof(str.c_str()));
}

string FloatToStr(double fValue)
{
    char tmp[81];
    // convert to float
    _ftoa(fValue, tmp);

    // remove trailing zeroes
    int count = strlen(tmp);
    while((count > 0) && (tmp[count - 1] == '0'))
    {
        tmp[count - 1] = '\0';
        count--;
    }

    // at least one trailing zero after decimal point
    if(tmp[strlen(tmp) - 1] == '.')
        strcat(tmp, "0");
    return tmp;
}

string FloatToStr(double fValue, int iScale)
{
    char tmp[81];
    return _ftoa(fValue, iScale, tmp);
}

string FloatToStr(double fValue, char cDecimalSeparator, char cThousandSeparator)
{
    if(cDecimalSeparator == cThousandSeparator)
    {
        if(cDecimalSeparator == '.')
            cThousandSeparator = ',';
        else
            cThousandSeparator = '.';
    }

    string res = FloatToStr(fValue);
    // change decimal separator
    int len = res.size();
    int decimal_pos = -1;
    for(int i = len - 1; i >= 0; i--)
    {
        if(res[i] == '.')
        {
            res[i] = cDecimalSeparator;
            decimal_pos = i;
        }
    }

    if(decimal_pos < 0)
        decimal_pos = len;

    if(cThousandSeparator != '\0')
    {
        int first_num_pos = 0;
        if(fValue < 0)
            first_num_pos = 1;
        for(int i = decimal_pos - 3; i > first_num_pos; i -= 3)
            res.insert(i, 1, cThousandSeparator);
    }
    return res;
}

string FloatToStr(double fValue, int iScale, char cDecimalSeparator, char cThousandSeparator, int iMaxTrailingZeroes)
{
    if(cDecimalSeparator == cThousandSeparator)
    {
        if(cDecimalSeparator == '.')
            cThousandSeparator = ',';
        else
            cThousandSeparator = '.';
    }

    string res = FloatToStr(fValue, iScale);
    // change decimal separator
    int len = res.size();
    int decimal_pos = -1;
    for(int i = len - 1; i >= 0; i--)
    {
        if(res[i] == '.')
        {
            res[i] = cDecimalSeparator;
            decimal_pos = i;
        }
    }

    if(decimal_pos < 0)
        decimal_pos = len;

    if(iMaxTrailingZeroes >= 0)
    {
        for(int i = len - 1; i > decimal_pos; i--)
        {
            if(res[i] == '0' && (i - decimal_pos) > iMaxTrailingZeroes)
                res.erase(i, 1);
            else
                break;
        }
        len = res.size();
        if(decimal_pos == len - 1)
            res.erase(decimal_pos, 1);
    }

    if(cThousandSeparator != '\0')
    {
        int first_num_pos = 0;
        if(fValue < 0)
            first_num_pos = 1;

        for(int i = decimal_pos - 3; i > first_num_pos; i -= 3)
            res.insert(i, 1, cThousandSeparator);
    }
    return res;
}

void ToLowerCase(string* pInput)
{
	int (*pf)(int) = tolower;
	std::transform(pInput->begin(), pInput->end(), pInput->begin(), pf);
}

string ToLowerCase(string sInput)
{
	string s = sInput;
	ToLowerCase(&s);
	return s;
}

void ToUpperCase(string* pInput)
{
	int (*pf)(int) = toupper;
	std::transform(pInput->begin(), pInput->end(), pInput->begin(), pf);
}

string ToUpperCase(string sInput)
{
	string s = sInput;
	ToUpperCase(&s);
	return s;
}

string ToCamelCase(string sInput, char cTriggerChar, bool bUpperFirstChar)
{
	string res = sInput;
	for(int i = 0; i < (int)res.size(); i++)
	{
		if(i == 0)
		{
			if(bUpperFirstChar)
				res[i] = toupper(res[i]);
			else
				res[i] = tolower(res[i]);
		}

		if(res[i] == cTriggerChar)
		{
			if(i < (int)res.size() - 1)
			{
				res[i + 1] = toupper(res[i + 1]);
				res.erase(i, 1);
			}
		}
	}
	return res;
}

string FromCamelCase(string sInput, char cInsertChar, bool bToLowerCase)
{
	if(sInput.size() == 0) return "";

	if(sInput == ToLowerCase(sInput))
	{
		if(bToLowerCase)
			return sInput;
		else
			return ToUpperCase(sInput);
	}

	if(sInput == ToUpperCase(sInput))
	{
		if(bToLowerCase)
			return ToLowerCase(sInput);
		else
			return sInput;
	}

	string res = sInput;
	int len = res.size();
	for(int i = len - 1; i >= 1; i--)
	{
		char c0 = res[i - 1];
		char c1 = res[i];

		if(c1 == toupper(c1) && c0 == tolower(c0) && c1 != tolower(c1) && c0 != toupper(c0))
			res.insert(i, 1, cInsertChar);
	}

	if(bToLowerCase)
		return ToLowerCase(res);

	return ToUpperCase(res);
}

int FindCodeBlock(string* pString, string sStartString, string sEndString, string* pBlock, bool bCaseSensitive, int iStartFrom)
{
/*
	int block_start = FindSubString(pString, &sStartString, bCaseSensitive, iStartFrom);
	if(block_start < 0) return -1;
	
	int pos = block_start + sStartString.size();
	int depth = 1;
	while(depth > 0)
	{
		int tmp_start = FindSubString(pString, &sStartString, bCaseSensitive, pos);
		
	}

	return block_start;
*/
return -1;
}

int FindBlock(string* pString, string sStartString, string sEndString, string* pBlock, bool bCaseSensitive, int iStartFrom)
{
	int block_start = FindSubString(pString, &sStartString, bCaseSensitive, iStartFrom);
	if(block_start < 0) return -1;

	int block_end = FindSubString(pString, &sEndString, bCaseSensitive, block_start + sStartString.size());
	if(block_end < 0) return -1;

	if(pBlock != NULL)
		pBlock->assign(pString->substr(block_start, (block_end + sEndString.size()) - block_start));

	return block_start;
}

int FindSubString(string* pString, string* pSubString, bool bCaseSensitive, int iStartFrom, bool bWholeWord)
{
    if(pString->size() == 0 || pSubString->size() == 0)
        return -1;

    if(bCaseSensitive)
    {
    	size_t pos = pString->find(*pSubString, iStartFrom);
		if(pos == string::npos) {
			return -1;
		}
	
		int res = (int)pos;

		if(bWholeWord) {
			int str_len = pString->size();
			int sub_len = pSubString->size();

			char char_before = res == 0 ? 0 : pString->at(res - 1);
			bool ok_before = char_before == 0 || (!isalnum(char_before) && char_before != '_' && char_before != '$');
			if(!ok_before) {
				if(res >= str_len - 1) {
					return -1;
				}
				return FindSubString(pString, pSubString, bCaseSensitive, res + 1, bWholeWord);
			}

			char char_after = (res + sub_len >= str_len) ? 0 : pString->at(res + sub_len);
			bool ok_after = char_after == 0 || (!isalnum(char_after) && char_after != '_' && char_after != '$');

			if(!ok_after) {
				if(res >= str_len - 1) {
					return -1;
				}
				return FindSubString(pString, pSubString, bCaseSensitive, res + 1, bWholeWord);
			}

			return res;
		}

		return res;
    }

    int str_len = pString->size();
    if(iStartFrom >= str_len)
        return -1;

    int sub_len = pSubString->size();

    if(str_len < sub_len)
        return -1;

    const char* cstr = pString->c_str();
    const char* csub = pSubString->c_str();
    for(int i = iStartFrom; i < str_len; i++)
    {
		if(strncasecmp(cstr + i, csub, sub_len) == 0)
		{
			if(!bWholeWord) {
				return i;
			}

			char char_before = i == 0 ? 0 : pString->at(i - 1);
			bool ok_before = char_before == 0 || (!isalnum(char_before) && char_before != '_' && char_before != '$');
			
			if(ok_before) {
				char char_after = (i + sub_len >= str_len) ? 0 : pString->at(i + sub_len);
				bool ok_after = char_after == 0 || (!isalnum(char_after) && char_after != '_' && char_after != '$');
				if(ok_after) {
					return i;
				}
			}
		}
	}
	return -1;
}

int FindSubString(string* pString, string sSubString, bool bCaseSensitive, int iStartFrom, bool bWholeWord)
{
	return FindSubString(pString, &sSubString, bCaseSensitive, iStartFrom, bWholeWord);
}

void ReplaceSubString(string* pString, string *pOld, string *pNew, bool bCaseSensitive, bool bWholeWord)
{
    if(pString == NULL || pOld == NULL || pNew == NULL)
        return;

    int old_size = pOld->size();
    int new_size = pNew->size();
    int pos = 0;
    while((pos = FindSubString(pString, pOld, bCaseSensitive, pos, bWholeWord)) >= 0)
    {
        pString->replace(pos, old_size, *pNew);
        pos = pos + new_size;
    }
}

void ReplaceSubString(string* pString, string sOld, string sNew, bool bCaseSensitive, bool bWholeWord)
{
    ReplaceSubString(pString, &sOld, &sNew, bCaseSensitive, bWholeWord);
}

string ReplaceSubString(const string& sString, string sOld, string sNew, bool bCaseSensitive, bool bWholeWord)
{
    string s(sString);
    ReplaceSubString(&s, &sOld, &sNew, bCaseSensitive, bWholeWord);
    return s;
}

void InsertBeforeSubString(string* pString, string *pSub, string *pNew)
{
    if(pString == NULL || pSub == NULL || pNew == NULL)
        return;

    int old_size = pSub->size();
    int new_size = pNew->size();
    size_t pos = 0;
    while((pos = pString->find(*pSub, pos)) != string::npos)
    {
        pString->insert(pos, *pNew);
        pos = pos + old_size + new_size;
    }
}

void InsertBeforeSubString(string* pString, string sSub, string sNew)
{
    InsertBeforeSubString(pString, &sSub, &sNew);
}

string InsertBeforeSubString(const string& sString, string sSub, string sNew)
{
    string s(sString);
    InsertBeforeSubString(&s, &sSub, &sNew);
    return s;
}

void InsertAfterSubString(string* pString, string *pSub, string *pNew)
{
    if(pString == NULL || pSub == NULL || pNew == NULL)
        return;

    int old_size = pSub->size();
    int new_size = pNew->size();
    size_t pos = 0;
    while((pos = pString->find(*pSub, pos)) != string::npos)
    {
        pString->insert(pos + old_size, *pNew);
        pos = pos + old_size + new_size;
    }
}

void InsertAfterSubString(string* pString, string sSub, string sNew)
{
    InsertAfterSubString(pString, &sSub, &sNew);
}

string InsertAfterSubString(const string& sString, string sSub, string sNew)
{
    string s(sString);
    InsertAfterSubString(&s, &sSub, &sNew);
    return s;
}


void InsertIntoSubString(string* pString, string *pSub, string *pNew, int iPos)
{
    if(pString == NULL || pSub == NULL || pNew == NULL)
        return;

    int old_size = pSub->size();
    int new_size = pNew->size();
    size_t pos = 0;
    while((pos = pString->find(*pSub, pos)) != string::npos)
    {
        pString->insert(pos + iPos, *pNew);
        pos = pos + old_size + new_size;
    }
}

void InsertIntoSubString(string* pString, string sSub, string sNew, int iPos)
{
    InsertIntoSubString(pString, &sSub, &sNew, iPos);
}

string InsertIntoSubString(const string& sString, string sSub, string sNew, int iPos)
{
    string s(sString);
    InsertIntoSubString(&s, &sSub, &sNew, iPos);
    return s;
}

string EnsureFirstChar(const string& sString, char cChar)
{
    string res = sString;
    int len = res.size();
    if(len == 0 || res[0] != cChar)
        return res.insert(0, 1, cChar);

    return res;
}

string EnsureLastChar(const string& sString, char cChar)
{
    string res = sString;
    int len = res.size();
    if(len == 0 || res[len - 1] != cChar)
        return res.append(1, cChar);

    return res;
}

string RemoveFirstChar(const string& sString, char cChar)
{
    string res = sString;
    int len = res.size();
    if(len > 0 && res[0] == cChar)
        return res.erase(0, 1);

    return res;
}

string RemoveLastChar(const string& sString, char cChar)
{
    string res = sString;
    int len = res.size();
    if(len > 0 && res[len - 1] == cChar)
        return res.erase(len - 1, 1);

    return res;
}

int FindChar(const char* str, char c, int pos, int num)
{
	if(num == 0) return -1;

	if(num < 0)
	{
		while(str[pos] != 0)
		{

			if(str[pos] == c) return pos;
			pos++;
		}
	}
	else
	{
		char* pch = (char*) memchr(str, c, num);
		if(pch != NULL) return pch - str;
	}

    return -1;
}

string TerminateAtChar(string sString, char cChar, bool bIgnoreFirstChar)
{
    size_t start_from = 0;
    if(bIgnoreFirstChar) {
        start_from = 1;
    }

	size_t pos = sString.find(cChar, start_from);

    if(pos != string::npos) {
		return sString.erase(pos, sString.size() - 1);
	}
	
	return sString;
}


string Trim(string sString, bool bSpaces, bool bNewLines)
{
    string invalid_chars = "";
    if(bSpaces) invalid_chars.append(" \t");
    if(bNewLines) invalid_chars.append("\r\n");

    if(sString == "")
        return sString;

    string res(sString);
    while(res.find_first_of(invalid_chars) == 0)
        res.erase(0, 1);

    if(res == "")
        return res;

    while(res.size() > 0 && res.find_last_of(invalid_chars) == res.size() - 1)
        res.erase(res.size() - 1, 1);

    return res;
}

string TrimRight(string sString, bool bSpaces, bool bNewLines)
{
    string invalid_chars = "";
    if(bSpaces) invalid_chars.append(" \t");
    if(bNewLines) invalid_chars.append("\r\n");

    if(sString == "")
        return sString;

    string res(sString);
    while(res.size() > 0 && res.find_last_of(invalid_chars) == res.size() - 1)
        res.erase(res.size() - 1, 1);

    return res;
}

string LastLineWhitespace(string sString)
{
	CWStringList list;
	list.SetText(Trim(sString, true, true));
	if(list.Count() == 0) {
		return "";
	}

	string last_line = list.Strings[list.Count() - 1];
	string res = "";
	int pos = 0;
	while(last_line[pos] == ' ' || last_line[pos] == '\t') {
		res += last_line[pos];
		pos++;
	}
	return res;
}


void StringAppendLine(string* pString, string* pLine, int iIndentCount, char cIndentChar, string sLineTerm)
{
	for(int i = 0; i < iIndentCount; i++)
		pString->append(1, cIndentChar);
		
	pString->append(*pLine);
	
	pString->append(sLineTerm);
}

void StringAppendLine(string* pString, string sLine, int iIndentCount, char cIndentChar, string sLineTerm)
{
	StringAppendLine(pString, &sLine, iIndentCount, cIndentChar, sLineTerm);
}

void StringToList(const string* pText, char cSeparator, CWStringList* pList)
{
    pList->Clear();
    if(*pText == "") return;

    size_t pos = 0;
    int newline = -1;
    while((newline = FindChar(pText->c_str(), cSeparator, pos)) >= 0)
    {
        pList->Add(pText->substr(pos, newline - pos));
        pos = newline + 1;
    }
    unsigned int len = pText->size();
    if(pos <= len)
        pList->Add(pText->substr(pos, len - pos));
}

void StringToList(const string& sText, char cSeparator, CWStringList* pList)
{
	return StringToList(&sText, cSeparator, pList);
}


void StringToList(const string& sText, char cSeparator, char cIgnoreSepStartChar, char cIgnoreSepEndChar, CWStringList* pList)
{
	char* text = (char*)sText.c_str();
	int last = 0;
	int pos = 0;
	bool ignore = false;
	while(text[pos] != 0)
	{
		if(text[pos] == cIgnoreSepStartChar && !ignore)
			ignore = true;
		else if(text[pos] == cIgnoreSepEndChar && ignore)
				ignore = false;
		if(text[pos] == cSeparator && !ignore)
		{
			pList->Add(string(text + last, pos - last));
			last = pos + 1;
		}
		pos++;
	}
	pList->Add(string(text + last, pos - last));
}

void StringToListExt(const string& sText, char cSeparator, CWStringList* pList, string sCharsToSpace, string sCharsToDelete)
{
	pList->Clear();

	string tmpstr = sText;

	// chars to space
	size_t rep_index = string::npos;
	do {
		rep_index = tmpstr.find_first_of(sCharsToSpace);
		if(rep_index != string::npos)
		{
			if(tmpstr[rep_index] == cSeparator)
				rep_index = string::npos;
			else
				tmpstr[rep_index] = cSeparator;
		}
	} while(rep_index != string::npos);

	// delete chars
	size_t del_index = string::npos;
	do {
		del_index = tmpstr.find_first_of(sCharsToDelete);
		if(del_index != string::npos) tmpstr.erase(del_index, 1);
	} while(del_index != string::npos);

	StringToList(&tmpstr, cSeparator, pList);

	int count = pList->Count();
	for(int i = count - 1; i >= 0; i--)
		if(pList->Strings[i] == "") pList->Delete(i);
}

string ListToString(CWStringList* pList, char cSeparator)
{
    string res = "";
    int count = pList->Count();
    for(int i = 0; i < count; i++)
    {
        if(i > 0) res.append(1, cSeparator);
        res.append(pList->Strings[i]);
    }
    return res;
}

string ExpandString(string sString, int iLen, bool bAlignLeft, char cChar)
{
    string res = sString;
    char expstr[2];
    expstr[0] = cChar;
    expstr[1] = '\0';
    while(res.size() < iLen)
    {
        if(bAlignLeft)
            res = res + expstr;
        else
            res = expstr + res;
    }
    return res;
}

string TimeString(bool bLocal) {
	int year = 0;
	int month = 0;
	int day = 0;
	int hour = 0;
	int min = 0;
	int sec = 0;
	int ttsec = 0;
	GetTime(bLocal, &year, &month, &day, &hour, &min, &sec, &ttsec);

	return ExpandString(IntToStr(year), 4, false, '0') +
		  ExpandString(IntToStr(month), 2, false, '0') +
		  ExpandString(IntToStr(day), 2, false, '0') +
		  ExpandString(IntToStr(hour), 2, false, '0') +
		  ExpandString(IntToStr(min), 2, false, '0') +
		  ExpandString(IntToStr(sec), 2, false, '0') +
		  ExpandString(IntToStr(ttsec), 4, false, '0');
}


string RandomString(int iLen)
{
    if(iLen <= 0) return "";

	string res = "";
    for(int i = 0; i < iLen; i++)
    {
        char ch = 'A';
        if(i % 2)
            ch = 'a';

        res.append(1, ch + (rand() % 26));
    }
    return res;
}

void GetCursorPos(const char* cString, int iPos, int* pLineNo, int* pCharNo)
{
	int pos = 0;
	int line_no = 0;
	int char_no = 0;
	while(pos < iPos)
	{
		char c = cString[pos];

		if(c == '\r' || c == '\n')
		{
			char_no = 0;
			line_no++;

			if(cString[pos + 1] != c && (cString[pos + 1] == '\r' || cString[pos + 1] == '\n'))
				pos++;
		}
		else
			char_no++;

		pos++;
	}

	if(pLineNo != NULL) *pLineNo = line_no + 1;
	if(pCharNo != NULL) *pCharNo = char_no + 1;
}

bool IsEMailAddress(string sEMail)
{
    size_t pos1 = sEMail.find("@");
    if(pos1 == string::npos)
        return false;

    size_t pos2 = sEMail.rfind(".");
    if(pos2 == string::npos)
        return false;

    if(pos1 > pos2)
        return false;

    return true;
}

int StrCmp(const string& str1, const string& str2, bool bOpposite)
{
    if(str1 == str2)
        return 0;

    if(bOpposite)
    {
        if(str1 > str2)
            return -1;
        return 1;
    }

    if(str1 > str2)
        return 1;
    return -1;
}

int StrCmpi(const string& str1, const string& str2, bool bOpposite)
{
	int res = strcasecmp(str1.c_str(), str2.c_str());

	if(bOpposite)
		return 0 - res;

	return res;
}

int LevenshteinDist(const char *s1, const char *s2, bool bCaseSensitive)
{
    unsigned int s1len, s2len, x, y, lastdiag, olddiag;
    s1len = strlen(s1);
    s2len = strlen(s2);
    unsigned int column[s1len+1];
    for (y = 1; y <= s1len; y++)
        column[y] = y;
    for (x = 1; x <= s2len; x++)
    {
        column[0] = x;
        for (y = 1, lastdiag = x-1; y <= s1len; y++)
        {
            olddiag = column[y];
			if(bCaseSensitive)
				column[y] = MIN3(column[y] + 1, column[y-1] + 1, lastdiag + (s1[y-1] == s2[x-1] ? 0 : 1));
            else
				column[y] = MIN3(column[y] + 1, column[y-1] + 1, lastdiag + (toupper(s1[y-1]) == toupper(s2[x-1]) ? 0 : 1));

            lastdiag = olddiag;
        }
    }
    return(column[s1len]);
}

int LevenshteinDistance(string* pS1, string* pS2, bool bCaseSensitive)
{
	return LevenshteinDist(pS1->c_str(), pS2->c_str(), bCaseSensitive);
}

int LevenshteinDistance(const string &s1, const string &s2, bool bCaseSensitive)
{
	return LevenshteinDist(s1.c_str(), s2.c_str(), bCaseSensitive);
}

string ByteToBinString(uint8_t iByte, char cFalseChar, char cTrueChar)
{
    char b[9];
    b[8] = '\0';

    uint8_t counter = 0;
    for (uint8_t z = 128; z > 0; z >>= 1)
    {
        b[counter] = ((iByte & z) == z) ? cTrueChar : cFalseChar;
        counter++;
    }

    return b;
}

uint32_t UTF8_charlen(const char* cUTF8, uint32_t* pPos)
{
	int pos = 0;
	if(pPos != NULL) pos = *pPos;

    uint8_t ch = cUTF8[pos];
    // empty string
    if(ch == 0)
        return 0;

    if(ch <= 0x7F) /* 0XXX XXXX one byte */
    {
		if(pPos != NULL) (*pPos) += 1;
        return 1;
    }
    else if((ch & 0xE0) == 0xC0)  /* 110X XXXX  two bytes */
    {
		if(pPos != NULL) (*pPos) += 2;
        return 2;
    }
    else if((ch & 0xF0) == 0xE0)  /* 1110 XXXX  three bytes */
    {
		if(pPos != NULL) (*pPos) += 3;
        return 3;
    }
    else if((ch & 0xF8) == 0xF0)  /* 1111 0XXX  four bytes */
    {
		if(pPos != NULL) (*pPos) += 4;
        return 4;
    }

	if(pPos != NULL) (*pPos) += 1;
    return 1;
}

uint32_t UTF8_strlen(const char* cUTF8)
{
	uint32_t len = 0;
	uint32_t pos = 0;
	while(UTF8_charlen(cUTF8, &pos)) len++;

	return len;
}

uint32_t UTF8_to_UTF32_char(const char* cUTF8, uint32_t* pPos, int* pLen)
{
    *pLen = 0;

    uint8_t ch = cUTF8[*pPos];
    // empty string
    if(ch == 0)
    {
        return 0;
    }

    if(ch <= 0x7F) /* 0XXX XXXX one byte */
    {
        *pLen = 1;
        (*pPos) += 1;
        return ch;
    }
    else if((ch & 0xE0) == 0xC0)  /* 110X XXXX  two bytes */
    {
        int c1 = (uint8_t)ch;
        int c2 = (uint8_t)cUTF8[(*pPos) + 1];

        uint32_t res = (c1 - 192) * 64 + c2 - 128;
        *pLen = 2;
        (*pPos) += 2;
        return res;
    }
    else if((ch & 0xF0) == 0xE0)  /* 1110 XXXX  three bytes */
    {
        int c1 = (uint8_t)ch;
        int c2 = (uint8_t)cUTF8[(*pPos) + 1];
        int c3 = (uint8_t)cUTF8[(*pPos) + 2];

        uint32_t res = (c1 - 224) * 4096 + (c2 - 128) * 64 + c3 - 128;
        *pLen = 3;
        (*pPos) += 3;
        return res;
    }
    else if((ch & 0xF8) == 0xF0)  /* 1111 0XXX  four bytes */
    {
        int c1 = (uint8_t)ch;
        int c2 = (uint8_t)cUTF8[(*pPos) + 1];
        int c3 = (uint8_t)cUTF8[(*pPos) + 2];
        int c4 = (uint8_t)cUTF8[(*pPos) + 2];

        uint32_t res = (c1 - 240) * 262144 + (c2 - 128) * 4096 + (c3 - 128) * 64 + c4 - 128;
        *pLen = 4;
        (*pPos) += 4;
        return res;
    }

    *pLen = -1;
    return 0;
}

int _urlcount(const char *p, const char *keep) {
    int k;
    for (k = 0; *p != 0; p++) {
        if (isalnum(*p) || *p == ' ' ||
            (keep != 0 && strchr(keep, *p) != 0))
        {
            k++;
        }
        else {
            k += 3;
        }
    }
    return k;
}

char *_urlencode(const char *in, char *out, const char *keep) {
    const char hexdigit[] = "0123456789ABCDEF";

    for (; *in != 0; in++) {
        if (isalnum(*in) ||
            (keep != 0 && strchr(keep, *in) != 0))
        {
            *out++ = *in;
        }
        else if (*in == ' ') {
            *out++ = '+';
        }
        else {
            *out++ = '%';
            *out++ = hexdigit[(*in >> 4) & 0xf];
            *out++ = hexdigit[*in & 0xf];
        }
    }
    *out = 0;
    return out;
}

char *URLEncode(const char *p, const char *keep) {
    char *out;

    if (p == 0) {
        return 0;
    }
    out = (char*)malloc(_urlcount(p, keep) + 1);
    _urlencode(p, out, keep);
    return out;
}

string URLEncode(string sString, string sKeep)
{
    char* out = URLEncode(sString.c_str(), sKeep.c_str());
    string res(out);
    free(out);
    return res;
}

CWStringList::CWStringList()
{
    Name = "";
}

CWStringList::~CWStringList()
{
    Clear();
}

void CWStringList::Clear()
{
    Strings.clear();
}

int CWStringList::Count()
{
    return Strings.size();
}

void CWStringList::Append(CWStringList* pCopyFrom)
{
    if(pCopyFrom == NULL)
        return;
    int count = pCopyFrom->Count();
    for(int i = 0; i < count; i++)
        Add(pCopyFrom->Strings[i]);
}

void CWStringList::Assign(CWStringList* pCopyFrom)
{
    Clear();
    Append(pCopyFrom);
}

void CWStringList::Append(string sText)
{
    if(sText == "") return;

    // space-backslash-lineterm is continuation sequence
    ReplaceSubString(&sText, " \\\r\n", "\f");
    ReplaceSubString(&sText, " \\\n", "\f");
    ReplaceSubString(&sText, " \\\r", "\f");
    // convert MSDOS & Mac lineterms to \n
    ReplaceSubString(&sText, "\r\n", "\n");

    size_t newline = 0;
    size_t pos = 0;
    while((newline = sText.find_first_of("\r\n", pos)) != string::npos)
    {
        string s = sText.substr(pos, newline - pos);
        ReplaceSubString(&s, "\f", LINE_TERM);
        Add(s);
        pos = newline + 1;
    }
    unsigned int len = sText.size();
    if(pos <= len)
    {
        string s = sText.substr(pos, len - pos);
        ReplaceSubString(&s, "\f", LINE_TERM);
        Add(s);
    }
}

void CWStringList::Merge(CWStringList* pMergeFrom, bool bCaseSensitive)
{
	int count = pMergeFrom->Count();
	for(int i = 0; i < count; i++)
	{
		if(Find(pMergeFrom->Strings[i], bCaseSensitive) < 0)
			Add(pMergeFrom->Strings[i]);
	}
}

void CWStringList::SetText(string sText)
{
    Clear();
	Append(sText);
}

string CWStringList::GetText()
{
    string res = "";
    string continuation = " \\" + string(LINE_TERM);
    int count = Count();
    for(int i = 0; i < count; i++)
    {
        if(i > 0)
            res.append(LINE_TERM);
        string s(Strings[i]);
        ReplaceSubString(&s, LINE_TERM, continuation);
        res.append(s);
    }
    return res;
}

void CWStringList::Add(string sString)
{
    Strings.push_back(sString);
}

void CWStringList::AddUnique(string sString, bool bCaseSensitive)
{
	if(Find(sString, bCaseSensitive) >= 0) {
		return;
	}
	
	Add(sString);
}

void CWStringList::Insert(string sString, int iIndex)
{
    Strings.insert(Strings.begin() + iIndex, sString);
}

void CWStringList::Delete(int iIndex)
{
	if(iIndex < 0) return;
    Strings.erase(Strings.begin() + iIndex);
}

void CWStringList::Delete(string sString)
{
	int index = -1;
	do {
		index = Find(sString);
		if(index >= 0) Delete(index);
	} while(index >= 0);
}

void CWStringList::DeleteEmptyLines()
{
	int count = Count();
	for(int i = count - 1; i >= 0; i--)
		if(Strings[i] == "") Delete(i);
}

int CWStringList::Find(string sString, bool bCaseSensitive, int iStartIndex)
{
    int count = Count();
    for(int i = iStartIndex; i < count; i++)
    {
        if(bCaseSensitive)
        {
            if(Strings[i] == sString)
                return i;
        }
        else
        {
            if(strcasecmp(Strings[i].c_str(), sString.c_str()) == 0)
                return i;
        }
    }
    return -1;
}

int CWStringList::FindSubStr(string sSubString, bool bCaseSensitive, int iStartIndex)
{
    int count = Count();
    for(int i = iStartIndex; i < count; i++)
    {
    	string s = Strings[i];
		if(FindSubString(&s, &sSubString, bCaseSensitive, 0) >= 0)
			return i;
    }
    return -1;
}

int CWStringList::FindBeginWith(string sString, bool bCaseSensitive, int iStartIndex)
{
    int count = Count();
    for(int i = iStartIndex; i < count; i++)
    {
    	string s = Strings[i];
		if(FindSubString(&s, &sString, bCaseSensitive, 0) == 0)
			return i;
    }
    return -1;
}

int CWStringList::FindSimilar(string sString, bool bCaseSensitive, int iStartIndex, int iMaxDistance)
{
	int max_distance = 99999;
	if(iMaxDistance < 0)
		max_distance = ceil(sString.size() * 0.7);

	int min_distance = 99999;
	int best_index = -1;
    int count = Count();
    for(int i = iStartIndex; i < count; i++)
    {
    	int dist = LevenshteinDistance((char*)sString.c_str(), (char*)Strings[i].c_str(), bCaseSensitive);
    	if(dist < min_distance && dist <= max_distance)
    	{
			min_distance = dist;
			best_index = i;
    	}
    }
	return best_index;
}

void CWStringList::ReplaceStr(string sOld, string sNew, bool bCaseSensitive, int iStartIndex)
{
    int count = Count();
    for(int i = iStartIndex; i < count; i++)
	{
		if(bCaseSensitive)
		{
			if(Strings[i] == sOld) Strings[i] = sNew;
		}
		else
		{
			if(StrCmpi(Strings[i], sOld) == 0) Strings[i] = sNew;
		}
	}
}

void CWStringList::ReplaceSubStr(string sOld, string sNew, bool bCaseSensitive, int iStartIndex, bool bWholeWord)
{
    int count = Count();
    for(int i = iStartIndex; i < count; i++)
		ReplaceSubString(&(Strings[i]), sOld, sNew, bCaseSensitive, bWholeWord);
}

void CWStringList::TerminateAllAtChar(char cChar, bool bIgnoreFirstChar)
{
    int count = Count();
    int start_from = 0;
    if(bIgnoreFirstChar) {
        start_from = 1;
    }
    for(int i = 0; i < count; i++)
	{
		size_t pos = Strings[i].find(cChar, start_from);
        if(pos != string::npos) Strings[i] = Strings[i].erase(pos, Strings[i].size() - 1);
	}
}

void CWStringList::TrimAll()
{
    int count = Count();
    for(int i = 0; i < count; i++)
	{
		Strings[i] = Trim(Strings[i]);
	}
}

void CWStringList::ReplaceValues(string sOld, string sNew, bool bCaseSensitive)
{
    int count = Count();
    for(int i = 0; i < count; i++)
	{
		string value = GetValue(i);

		if(bCaseSensitive)
		{
			if(value == sOld)
				SetValue(i, sNew);
		}
		else
		{
			if(StrCmpi(value, sOld) == 0)
				SetValue(i, sNew);
		}
	}
}

void CWStringList::ReplaceValueSubstring(string sOld, string sNew, bool bCaseSensitive)
{
    int count = Count();
    for(int i = 0; i < count; i++)
	{
		if(IsNameValue(i))
		{
			string value = GetValue(i);
			ReplaceSubString(&value, sOld, sNew, bCaseSensitive);
			SetValue(i, value);
		}
		else
		{
			Strings[i] = ReplaceSubString(Strings[i], sOld, sNew, bCaseSensitive);
		}
	}
}

bool CWStringList::IsNameValue(int iIndex)
{
    return Strings[iIndex].find('=') != string::npos;
}

int CWStringList::FindName(string sName, int iStartIndex)
{
    int count = Count();
    for(int i = iStartIndex; i < count; i++)
    {
        if(GetName(i) == sName)
            return i;
    }
    return -1;
}

void CWStringList::DeleteNameValue(string sName)
{
    int index = FindName(sName);
    if(index < 0)
        return;
    Delete(index);
}

string CWStringList::GetValue(string sName, int iStartIndex)
{
    int pos = FindName(sName, iStartIndex);
    if(pos < 0)
        return "";

    return Strings[pos].substr(sName.size() + 1, Strings[pos].size() - (sName.size() + 1));
}

string CWStringList::GetValue(string sName, string sDefaultValue, int iStartIndex)
{
	int pos = FindName(sName, iStartIndex);
	if(pos < 0)
		return sDefaultValue;
	return GetValue(pos);
}

string CWStringList::GetName(int iIndex)
{
    string str = Strings[iIndex];
    size_t eq_pos = str.find("=");
    if(eq_pos == string::npos)
        return str;

    return str.substr(0, eq_pos);
}

string CWStringList::GetValue(int iIndex)
{
    string str = Strings[iIndex];
    size_t eq_pos = str.find("=");
    if(eq_pos == string::npos)
        return str;

    return str.substr(eq_pos + 1, str.size() - (eq_pos + 1));
}

void CWStringList::GetValues(string sName, CWStringList* pValues)
{
    pValues->Clear();
    int pos = 0;
    while((pos = FindName(sName, pos)) >= 0)
    {
        pValues->Add(GetValue(pos));
        pos++;
    }
}

void CWStringList::SetValue(string sName, string sValue)
{
    int pos = FindName(sName);
    if(pos < 0)
    {
        Add(sName + "=" + sValue);
        return;
    }

    Strings[pos] = sName + "=" + sValue;
}

void CWStringList::SetValue(int iIndex, string sValue)
{
	string name = GetName(iIndex);
	if(name == "")
		Strings[iIndex] = sValue;
	else
		Strings[iIndex] = name + "=" + sValue;
}

void CWStringList::Swap(int iIndex1, int iIndex2)
{
    std::swap(Strings[iIndex1], Strings[iIndex2]);
}

void CWStringList::Sort(bool bDescending, int iStart, int iEnd)
{
    int i = iStart;
    int k = iEnd;

    if(iEnd - iStart >= 1)
    {
        while(k > i)
        {
            while(StrCmp(Strings[i], Strings[iStart], bDescending) <= 0 && i <= iEnd && k > i)
                i++;
            while(StrCmp(Strings[k], Strings[iStart], bDescending) > 0 && k >= iStart && k >= i)
                k--;

            if(k > i)
            {
                if(Strings[i] != Strings[k])
                    Swap(i, k);
            }
        }

        if(Strings[iStart] != Strings[k])
            Swap(iStart, k);

        if(k > iStart)
            Sort(bDescending, iStart, k - 1);
        if(k < iEnd)
            Sort(bDescending, k + 1, iEnd);
    }
}

void CWStringList::Sort(bool bDescending)
{
    Sort(bDescending, 0, Count() - 1);
}

// ------------
// ------------

CWStringListArray::CWStringListArray()
{
    OwnsObjects = true;
}

CWStringListArray::~CWStringListArray()
{
    Clear();
}

void CWStringListArray::Clear()
{
    if(OwnsObjects)
    {
        int count = Count();
        for(int i = 0; i < count; i++)
            delete Items[i];
    }
    Items.clear();
}

int CWStringListArray::Count()
{
    return Items.size();
}

void CWStringListArray::Add(CWStringList* pList)
{
    Items.push_back(pList);
}

void CWStringListArray::Delete(int iIndex)
{
    if(OwnsObjects)
        delete Items[iIndex];
    Items.erase(Items.begin() + iIndex);
}

int CWStringListArray::IndexOf(CWStringList* pList)
{
    int count = Count();
    for(int i = 0; i < count; i++)
    {
        if(Items[i] == pList)
            return i;
    }
    return -1;
}

// ------------
// ------------

CWStringTable::CWStringTable()
{

}

CWStringTable::~CWStringTable()
{
    Clear();
}

void CWStringTable::Clear()
{
    int column_count = ColCount();
    for(int i = 0; i < column_count; i++)
        delete Columns[i];
    Columns.clear();
}

void CWStringTable::ClearData()
{
    int column_count = ColCount();
    for(int i = 0; i < column_count; i++)
		Columns[i]->Clear();
}

int CWStringTable::ColCount()
{
    return Columns.size();
}

int CWStringTable::RowCount()
{
    if(ColCount() == 0)
        return 0;

    return Columns[0]->Count();
}

int CWStringTable::AddRow()
{
    int col_count = ColCount();
    for(int i = 0; i < col_count; i++) Columns[i]->Add("");

	return RowCount() - 1;
}

CWStringList* CWStringTable::AddCol(string sName, string sDefaultValue)
{
    CWStringList* col = new CWStringList();
    col->Name = sName;
    int row_count = RowCount();
    for(int i = 0; i < row_count; i++)
        col->Add(sDefaultValue);
    Columns.push_back(col);
    return col;
}

int CWStringTable::GetColIndex(string sColName)
{
    int col_count = ColCount();
    for(int i = 0; i < col_count; i++)
        if(Columns[i]->Name == sColName)
            return i;
    return -1;
}

CWStringList* CWStringTable::GetCol(string sColName)
{
	int index = GetColIndex(sColName);
	if(index < 0) return NULL;

    return Columns[index];
}

string CWStringTable::GetValue(int iColIndex, int iRowIndex)
{
    if(iColIndex < 0 || iColIndex >= ColCount())
        return "";

    if(iRowIndex < 0 || iRowIndex >= RowCount())
        return "";

    return Columns[iColIndex]->Strings[iRowIndex];
}

string CWStringTable::GetValue(string sColName, int iRowIndex)
{
    int col_index = GetColIndex(sColName);
    if(col_index < 0)
        return "";
    return GetValue(col_index, iRowIndex);
}

void CWStringTable::SetValue(int iColIndex, int iRowIndex, string sValue, bool bAutoExpand)
{
    if(iColIndex < 0 || iRowIndex < 0)
        return;


    if(iColIndex >= ColCount())
    {
        if(!bAutoExpand)
            return;
        while(ColCount() <= iColIndex)
            AddCol("Column_" + IntToStr(ColCount()));
    }

    if(iRowIndex >= RowCount())
    {
        if(!bAutoExpand)
            return;
        while(RowCount() <= iRowIndex)
            AddRow();
    }

    Columns[iColIndex]->Strings[iRowIndex] = sValue;
}

void CWStringTable::SetValue(string sColName, int iRowIndex, string sValue, bool bAutoExpand)
{
    int col_index = GetColIndex(sColName);
    if(col_index < 0)
        return;
    SetValue(col_index, iRowIndex, sValue, bAutoExpand);
}

void CWStringTable::DeleteRow(int iRowIndex)
{
    if(iRowIndex < 0 || iRowIndex >= RowCount())
        return;

    int col_count = ColCount();
    for(int i = 0; i < col_count; i++)
        Columns[i]->Delete(iRowIndex);
}

void CWStringTable::DeleteCol(int iColIndex)
{
    if(iColIndex < 0 || iColIndex >= ColCount())
        return;

    delete Columns[iColIndex];
    Columns.erase(Columns.begin() + iColIndex);
}

void CWStringTable::DeleteCol(string sColName)
{
    int col_index = GetColIndex(sColName);
    if(col_index < 0)
        return;

    DeleteCol(col_index);
}

void CWStringTable::SwapCols(int iIndex1, int iIndex2)
{
    std::swap(Columns[iIndex1], Columns[iIndex2]);
}

void CWStringTable::SwapCols(string sColName1, string sColName2)
{
    SwapCols(GetColIndex(sColName1), GetColIndex(sColName2));
}

void CWStringTable::SwapRows(int iIndex1, int iIndex2)
{
    int col_count = ColCount();
    for(int i = 0; i < col_count; i++)
        Columns[i]->Swap(iIndex1, iIndex2);
}

void CWStringTable::Sort(int iColIndex, bool bDescending, int iStart, int iEnd)
{
    int i = iStart;
    int k = iEnd;

    CWStringList* col = Columns[iColIndex];

    if(iEnd - iStart >= 1)
    {
        while(k > i)
        {
            while(StrCmp(col->Strings[i], col->Strings[iStart], bDescending) <= 0 && i <= iEnd && k > i)
                i++;
            while(StrCmp(col->Strings[k], col->Strings[iStart], bDescending) > 0 && k >= iStart && k >= i)
                k--;

            if(k > i)
            {
                if(col->Strings[i] != col->Strings[k])
                    SwapRows(i, k);
            }
        }

        if(col->Strings[iStart] != col->Strings[k])
            SwapRows(iStart, k);

        if(k > iStart)
            Sort(iColIndex, bDescending, iStart, k - 1);
        if(k < iEnd)
            Sort(iColIndex, bDescending, k + 1, iEnd);
    }
}

void CWStringTable::Sort(int iColIndex, bool bDescending)
{
    Sort(iColIndex, bDescending, 0, RowCount() - 1);
}

void CWStringTable::Sort(string sColName, bool bDescending)
{
    Sort(GetColIndex(sColName), bDescending, 0, RowCount() - 1);
}


void CWStringTable::CopyStruct(CWStringTable* pTable)
{
	Clear();
	int col_count = pTable->ColCount();
	for(int i = 0; i < col_count; i++)
		AddCol(pTable->Columns[i]->Name);
}

void CWStringTable::AddExternalRow(CWStringTable* pExTable, int iExRowIndex)
{
	int new_row_index = AddRow();
	int col_count = ColCount();
	for(int i = 0; i < col_count; i++)
		SetValue(i, new_row_index, pExTable->GetValue(Columns[i]->Name, iExRowIndex));
}

bool CWStringTable::WordStats(int iColIndex, CWStringTable* pStats, bool bUniqueValues, string sCharsToSpace, string sCharsToDelete, int* pSum)
{
	if(iColIndex < 0 || iColIndex >= ColCount()) return false;

	CWSortedList* col = new CWSortedList(false, bUniqueValues);
	col->Merge(Columns[iColIndex]);

	CWSortedList words(false, true);
	vector<int> counts;

    int row_count = col->Count();
    for(int i = 0; i < row_count; i++)
	{
		string tmpstr = col->Strings[i];

		CWStringList tmp;
		StringToListExt(tmpstr, ' ', &tmp, sCharsToSpace, sCharsToDelete);
		int idx;
		bool duplicate;
		for(int x = 0; x < tmp.Count(); x++)
		{
			idx = words.Add(tmp.Strings[x], &duplicate);

			if(duplicate)
				counts[idx] = counts[idx] + 1;
			else
				counts.insert(counts.begin() + idx, 1);
		}
	}
	delete col;

	pStats->Clear();
    CWStringList* word_col = pStats->AddCol("word");
    CWStringList* count_col = pStats->AddCol("count");

	int sum = 0;
	int word_count = words.Count();
	for(int i = 0; i < word_count; i++)
	{
		if(words.Strings[i] != "")
		{
			word_col->Add(words.Strings[i]);
			string tmp = IntToStr(counts[i]);
			while(tmp.size() < 7) tmp = "0" + tmp;
			count_col->Add(tmp);
			sum += counts[i];
		}
	}

	pStats->Sort("count", true);
	if(pSum != NULL) *pSum = sum;

	return true;
}

bool CWStringTable::WordStats(string sColName, CWStringTable* pStats, bool bUniqueValues, string sCharsToSpace, string sCharsToDelete, int* pSum)
{
	return WordStats(GetColIndex(sColName), pStats, bUniqueValues, sCharsToSpace, sCharsToDelete, pSum);
}

// -----------------


CWSortedList::CWSortedList(bool bCaseSensitive, bool bUnique)
{
	CaseSensitive = bCaseSensitive;
	Unique = bUnique;
	Name = "";
}

CWSortedList::~CWSortedList()
{
    Clear();
}

void CWSortedList::Clear()
{
    Strings.clear();
}

int CWSortedList::Count()
{
    return Strings.size();
}

int CWSortedList::Add(string sString, bool* pDuplicate)
{
	int new_pos = -1;
	int old_pos = BinarySearch(sString, 0, Count() - 1, &new_pos);
	if(old_pos >= 0)
	{
		if(!Unique) Strings.insert(Strings.begin() + old_pos, sString);
		if(pDuplicate != NULL) *pDuplicate = true;
		return old_pos;
	}

	if(pDuplicate != NULL) *pDuplicate = false;
	Strings.insert(Strings.begin() + new_pos, sString);
	return new_pos;
}

void CWSortedList::Merge(CWStringList* pMergeFrom)
{
    int count = pMergeFrom->Count();
    for(int i = 0; i < count; i++)
		Add(pMergeFrom->Strings[i]);
}

void CWSortedList::Delete(int iIndex)
{
	if(iIndex < 0) return;
    Strings.erase(Strings.begin() + iIndex);
}

int CWSortedList::BinarySearch(string sString, int iMin, int iMax, int* pPos)
{
	// test if array is empty
	if (iMax < iMin)
	{
		// set is empty, so return value showing not found
		if(pPos != NULL) *pPos = iMin;
		return -1;
	}
	else
    {
		// calculate midpoint to cut set in half
		int imid = iMin + ((iMax - iMin) / 2);

		// three-way comparison
		int diff = -1;
		if(CaseSensitive)
			diff = StrCmp(Strings[imid], sString);
		else
			diff = StrCmpi(Strings[imid], sString);

		if(diff > 0)
		{
			// sString is in lower subset
			return BinarySearch(sString, iMin, imid - 1, pPos);
		}
		else
		{
			if(diff < 0)
			{
				// sString is in upper subset
				return BinarySearch(sString, imid+1, iMax, pPos);
			}
			else
			{
				// sString has been found
				return imid;
			}
		}
	}
}

int CWSortedList::Find(string sString)
{
	return BinarySearch(sString, 0, Count() - 1, NULL);
}

string CWSortedList::ShortestString()
{
	int minlen = -1;
	string shortest = "";
	int count = Count();
	for(int i = 0; i < count; i++)
	{
		int len = Strings[i].size();
		if(minlen == -1 || len < minlen)
		{
			shortest = Strings[i];
			minlen = len;
		}
	}
	return shortest;
}

// ------------
// ------------

CWSortedListArray::CWSortedListArray()
{
    OwnsObjects = true;
    Name = "";
}

CWSortedListArray::~CWSortedListArray()
{
    Clear();
}

void CWSortedListArray::Clear()
{
    if(OwnsObjects)
    {
        int count = Count();
        for(int i = 0; i < count; i++)
            delete Items[i];
    }
    Items.clear();
}

int CWSortedListArray::Count()
{
    return Items.size();
}

int CWSortedListArray::TotalCount()
{
	int count = Count();
	if(count == 0) return 0;

	int total = 0;
	for(int i = 0; i < count; i++)
		total += Items[i]->Count();

	return total;
}

void CWSortedListArray::Add(CWSortedList* pList)
{
    Items.push_back(pList);
}

void CWSortedListArray::Delete(int iIndex)
{
    if(OwnsObjects)
        delete Items[iIndex];
    Items.erase(Items.begin() + iIndex);
}

int CWSortedListArray::IndexOf(CWSortedList* pList)
{
    int count = Count();
    for(int i = 0; i < count; i++)
    {
        if(Items[i] == pList)
            return i;
    }
    return -1;
}

int CWSortedListArray::IndexOf(string sName)
{
    int count = Count();
    for(int i = 0; i < count; i++)
    {
        if(Items[i]->Name == sName)
            return i;
    }
    return -1;
}

int CWSortedListArray::Find(string sName, string sString)
{
	int list_index = IndexOf(sName);
    if(list_index < 0) return -1;

	CWSortedList* list = Items[list_index];
	return list->Find(sString);
}

// -------------------------

CWStringIndex::CWStringIndex(CWStringList* pList, bool bCaseSensitive, bool bUnique)
{
	List = pList;

	Rebuild(bCaseSensitive, bUnique);
}

CWStringIndex::~CWStringIndex()
{

}

void CWStringIndex::Clear()
{
	Positions.clear();
}

int CWStringIndex::Count()
{
    return Positions.size();
}

int CWStringIndex::BinarySearch(string sString, int iMin, int iMax, int* pPos)
{
	// test if array is empty
	if (iMax < iMin)
	{
		// set is empty, so return value showing not found
		if(pPos != NULL) *pPos = iMin;
		return -1;
	}
	else
    {
		// calculate midpoint to cut set in half
		int imid = iMin + ((iMax - iMin) / 2);

		// three-way comparison
		int diff = -1;
		if(CaseSensitive)
			diff = StrCmp(List->Strings[Positions[imid]], sString);
		else
			diff = StrCmpi(List->Strings[Positions[imid]], sString);

		if(diff > 0)
		{
			// sString is in lower subset
			return BinarySearch(sString, iMin, imid - 1, pPos);
		}
		else
		{
			if(diff < 0)
			{
				// sString is in upper subset
				return BinarySearch(sString, imid+1, iMax, pPos);
			}
			else
			{
				// sString has been found
				return imid;
			}
		}
	}
}

int CWStringIndex::Find(string sString)
{
	int pos = BinarySearch(sString, 0, Count() - 1, NULL);
	if(pos < 0) return -1;
	return Positions[pos];
}

void CWStringIndex::Rebuild(bool bCaseSensitive, bool bUnique)
{
	CaseSensitive = bCaseSensitive;
	Unique = bUnique;

	Clear();

	if(List == NULL) return;

    int count = List->Count();
    for(int i = 0; i < count; i++)
	{
		int new_pos = -1;
		int old_pos = BinarySearch(List->Strings[i], 0, Count() - 1, &new_pos);
		if(old_pos >= 0)
		{
			if(!Unique) Positions.insert(Positions.begin() + old_pos, i);
		}
		else
			Positions.insert(Positions.begin() + new_pos, i);
	}
}

string CWStringIndex::StringAt(int iPosition)
{
	return List->Strings[Positions[iPosition]];
}

void EscapeMarkdown(string* pMarkdown)
{
	ReplaceSubString(pMarkdown, "\"_", "\"\b");
	ReplaceSubString(pMarkdown, "_", "\\_");
	ReplaceSubString(pMarkdown, "\"\b", "\"_");
}

string EscapeMarkdown(const string& sMarkdown)
{
	string res = sMarkdown;
	EscapeMarkdown(&res);
	return res;
}
