#ifndef CPPW_JSONPARSER_H
#define CPPW_JSONPARSER_H

#include "cppw_string.h"

enum  CWJSONType { jmtNull = 0, jmtBool, jmtInteger, jmtFloat, jmtString, jmtArray, jmtObject };

void EscapeJSON(string* pJSON);
string EscapeJSON(const string& input);

void UnescapeJSON(string* pJSON);
string UnescapeJSON(const string& sJSON);


class CWJSONValue;
class CWJSONMember;
class CWJSONMemberList;
class CWJSONArray;
class CWJSONObject;

class CWJSONValue
{
		void* Value;
	public:
		CWJSONType Type;

		CWJSONValue(CWJSONType iType = jmtNull);
		~CWJSONValue();

		void Free();

		void SetNull();
		void SetBool(bool bValue);
		void SetString(const string& sValue);
		void SetInteger(int iValue);
		void SetFloat(double fValue);
		void SetArray(CWJSONArray* pValue);
		void SetObject(CWJSONObject* pValue);
		void Set(string sValue, CWJSONType iType);

		bool GetBool();
		string GetString();
		int GetInteger();
		double GetFloat();
		CWJSONArray* GetArray();
		CWJSONObject* GetObject();

		void Stringify(string* pOutput, bool bMinify, string sIndent, bool bJavaScript = false, bool bMeteor = false, bool bSimpleSchema = false);
		string Stringify(bool bMinify, string sIndent, bool bJavaScript = false, bool bMeteor = false, bool bSimpleSchema = false) { string s = ""; Stringify(&s, bMinify, sIndent, bJavaScript, bMeteor, bSimpleSchema); return s; }

		void GetYaml(string* pOutput, string sIndent = "");

		bool Parse(const char* cInput, int* pPos, int iLen, string* pErrorMessage);
};

class CWJSONArray
{
	public:
		vector<CWJSONValue*> Items;

		CWJSONArray();
		~CWJSONArray();

		int Count();
		void Clear();

		CWJSONValue* Add(CWJSONValue* pItem);
		CWJSONValue* AddNull() { CWJSONValue* val = new CWJSONValue(); val->SetNull(); return Add(val); }
		CWJSONValue* AddBool(bool bValue) { CWJSONValue* val = new CWJSONValue(); val->SetBool(bValue); return Add(val); }
		CWJSONValue* AddString(const string& sValue) { CWJSONValue* val = new CWJSONValue(); val->SetString(sValue); return Add(val); }

		CWJSONValue* AddInteger(int iValue) { CWJSONValue* val = new CWJSONValue(); val->SetInteger(iValue); return Add(val); }
		CWJSONValue* AddFloat(double fValue) { CWJSONValue* val = new CWJSONValue(); val->SetFloat(fValue); return Add(val); }
		CWJSONValue* AddArray(CWJSONArray* pValue) { CWJSONValue* val = new CWJSONValue(); val->SetArray(pValue); return Add(val); }
		CWJSONValue* AddObject(CWJSONObject* pValue) { CWJSONValue* val = new CWJSONValue(); val->SetObject(pValue); return Add(val); }

		void AddStringList(CWStringList* pList) { int count = pList->Count(); for(int i = 0; i < count; i++) AddString(pList->Strings[i]); }

		void Delete(int iIndex);
		void DeleteString(const string& sValue);

		CWJSONObject* GetObjectWithMember(string sMemberName);
		void GetObjectsWithMember(string sMemberName, CWJSONArray* pArray);

		CWJSONObject* GetObjectWithStringValue(string sMemberName, string sMemberValue);

		int FindString(const string& sValue);
		void ExtractStrings(CWStringList* pList);
		void ReplaceString(string sOld, string sNew);

		void Stringify(string* pOutput, bool bMinify, string sIndent, bool bJavaScript = false, bool bMeteor = false, bool bSimpleSchema = false);
		string Stringify(bool bMinify = true, bool bJavaScript = false, bool bMeteor = false, bool bSimpleSchema = false);

		void GetYaml(string* pOutput, string sIndent = "");

		bool Parse(const char* cInput, int* pPos, int iLen, string* pErrorMessage);
		bool Parse(const string& sInput, string* pErrorMessage);
};

class CWJSONMember
{
	public:
		string Name;
		CWJSONValue* Value;

		CWJSONMember(const string& sName, CWJSONType iType = jmtNull);
		~CWJSONMember();

		void SetNull() { Value->SetNull(); }
		void SetBool(bool bValue) { Value->SetBool(bValue); }
		void SetString(const string& sValue) { Value->SetString(sValue); }
		void SetInteger(int iValue) { Value->SetInteger(iValue); }
		void SetFloat(double fValue) { Value->SetFloat(fValue); }
		void SetArray(CWJSONArray* pValue) { Value->SetArray(pValue); }
		void SetObject(CWJSONObject* pValue) { Value->SetObject(pValue); }

		bool Set(string sValue, string* pErrorMessage); // parse string, determine type and set value

		void ExtractStrings(CWStringList* pList);
		void ReplaceString(string sOld, string sNew);

		void Stringify(string* pOutput, bool bMinify, string sIndent, bool bJavaScript = false, bool bMeteor = false, bool bSimpleSchema = false);

		void GetYaml(string* pOutput, string sIndent = "");

		bool Parse(const char* cInput, int* pPos, int iLen, string* pErrorMessage);
};

class CWJSONMemberList
{
	public:
		vector<CWJSONMember*> Items;

		CWJSONMemberList();
		~CWJSONMemberList();

		int Count();
		void Clear();
		CWJSONMember* Add(CWJSONMember* pItem);
		CWJSONMember* Add(const string& sName, CWJSONType iType = jmtNull);

		CWJSONMember* AddNull(const string& sName) { CWJSONMember* member = new CWJSONMember(sName); member->SetNull(); return Add(member); }
		CWJSONMember* AddBool(const string& sName, bool bValue) { CWJSONMember* member = new CWJSONMember(sName); member->SetBool(bValue); return Add(member); }
		CWJSONMember* AddString(const string& sName, const string& sValue) { CWJSONMember* member = new CWJSONMember(sName); member->SetString(sValue); return Add(member); }
		CWJSONMember* AddInteger(const string& sName, int iValue)  { CWJSONMember* member = new CWJSONMember(sName); member->SetInteger(iValue); return Add(member); }
		CWJSONMember* AddFloat(const string& sName, double fValue)  { CWJSONMember* member = new CWJSONMember(sName); member->SetFloat(fValue); return Add(member); }
		CWJSONMember* AddArray(const string& sName, CWJSONArray* pValue)  { CWJSONMember* member = new CWJSONMember(sName); member->SetArray(pValue); return Add(member); }
		CWJSONMember* AddObject(const string& sName, CWJSONObject* pValue)  { CWJSONMember* member = new CWJSONMember(sName); member->SetObject(pValue); return Add(member); }

		void Delete(int iIndex);
		void Delete(const string& sName);
		void Delete(CWJSONMember* pMember);

		int IndexOf(const string& sName);
		int IndexOf(CWJSONMember* pMember);
		CWJSONMember* Get(const string& sName);

		CWJSONMember* SetNull(const string& sName) { CWJSONMember* member = Get(sName); if(member == NULL) { member = new CWJSONMember(sName); Add(member); } member->SetNull(); return member; }
		CWJSONMember* SetBool(const string& sName, bool bValue) { CWJSONMember* member = Get(sName); if(member == NULL) { member = new CWJSONMember(sName); Add(member); } member->SetBool(bValue); return member; }
		CWJSONMember* SetString(const string& sName, const string& sValue) { CWJSONMember* member = Get(sName); if(member == NULL) { member = new CWJSONMember(sName); Add(member); } member->SetString(sValue); return member; }
		CWJSONMember* SetInteger(const string& sName, int iValue)  { CWJSONMember* member = Get(sName); if(member == NULL) { member = new CWJSONMember(sName); Add(member); } member->SetInteger(iValue); return member; }
		CWJSONMember* SetFloat(const string& sName, double fValue)  { CWJSONMember* member = Get(sName); if(member == NULL) { member = new CWJSONMember(sName); Add(member); } member->SetFloat(fValue); return member; }
		CWJSONMember* SetArray(const string& sName, CWJSONArray* pValue)  { CWJSONMember* member = Get(sName); if(member == NULL) { member = new CWJSONMember(sName); Add(member); } member->SetArray(pValue); return member; }
		CWJSONMember* SetObject(const string& sName, CWJSONObject* pValue)  { CWJSONMember* member = Get(sName); if(member == NULL) { member = new CWJSONMember(sName); Add(member); } member->SetObject(pValue); return member; }
		CWJSONMember* Set(const string& sName, string sValue) { CWJSONMember* member = Get(sName); if(member == NULL) { member = new CWJSONMember(sName); Add(member); } string msg = ""; if(!member->Set(sValue, &msg)) return NULL; return member; }

		void ExtractStrings(CWStringList* pList);
		void ReplaceString(string sOld, string sNew);

		void Stringify(string* pOutput, bool bMinify, string sIndent, bool bJavaScript = false, bool bMeteor = false, bool bSimpleSchema = false);

		void GetYaml(string* pOutput, string sIndent = "");

		void Merge(CWJSONMemberList* pMemberList);
};

class CWJSONObject
{
	public:
		CWJSONMemberList* Members;

		CWJSONObject();
		~CWJSONObject();

		void Clear();
		void Delete(const string& sName) { Members->Delete(sName); }

		CWJSONValue* Get(const string& sName) { CWJSONMember* member = Members->Get(sName); if(member == NULL) return NULL; return member->Value; }

		bool HasMember(const string& sName) { return Members->Get(sName) != NULL; }

		bool GetBool(const string& sName, bool iDefaultValue = false) { CWJSONMember* member = Members->Get(sName); if(member == NULL) return false; return member->Value->GetBool(); }
		int GetInteger(const string& sName, int iDefaultValue = 0) { CWJSONMember* member = Members->Get(sName); if(member == NULL) return iDefaultValue; return member->Value->GetInteger(); }
		string GetString(const string& sName, string sDefaultValue = "") { CWJSONMember* member = Members->Get(sName); if(member == NULL) return sDefaultValue; return member->Value->GetString(); }
		CWJSONArray* GetArray(const string& sName) { CWJSONMember* member = Members->Get(sName); if(member == NULL) return NULL; return member->Value->GetArray(); }
		CWJSONObject* GetObject(const string& sName) { CWJSONMember* member = Members->Get(sName); if(member == NULL) return NULL; return member->Value->GetObject(); }

		CWJSONValue* SetNull(const string& sName) { return Members->SetNull(sName)->Value; }

		CWJSONValue* SetBool(const string& sName, bool bValue) { return Members->SetBool(sName, bValue)->Value; }
		CWJSONValue* SetString(const string& sName, const string& sValue) { return Members->SetString(sName, sValue)->Value; }
		CWJSONValue* SetInteger(const string& sName, int iValue)  { return Members->SetInteger(sName, iValue)->Value; }
		CWJSONValue* SetFloat(const string& sName, double fValue)  { return Members->SetFloat(sName, fValue)->Value; }
		CWJSONValue* SetArray(const string& sName, CWJSONArray* pValue)  { return Members->SetArray(sName, pValue)->Value; }
		CWJSONValue* SetObject(const string& sName, CWJSONObject* pValue)  { return Members->SetObject(sName, pValue)->Value; }
		CWJSONValue* Set(const string& sName, string sValue)  { return Members->Set(sName, sValue)->Value; }

		void ExtractStrings(CWStringList* pList);
		void ReplaceString(string sOld, string sNew);

		void Stringify(string* pOutput, bool bMinify, string sIndent, bool bJavaScript = false, bool bMeteor = false, bool bSimpleSchema = false);
		string Stringify(bool bMinify = true, bool bJavaScript = false, bool bMeteor = false, bool bSimpleSchema = false);

		void GetYaml(string* pOutput, string sIndent = "");
		string GetYaml();

		bool Parse(const char* cInput, int* pPos, int iLen, string* pErrorMessage);
		bool Parse(const string& sInput, string* pErrorMessage);

		bool CopyFrom(CWJSONObject* pObject, string* pErrorMessage = NULL);
		void Merge(CWJSONObject* pObject);
};


#endif // CPPW_JSONPARSER_H