#include "cppw_jsonparser.h"

#include <cstdlib>

void EscapeJSON(string* pJSON)
{
	ReplaceSubString(pJSON, "\\", "\\\\");
	ReplaceSubString(pJSON, "\"", "\\\"");
	ReplaceSubString(pJSON, "/", "\\/");
	ReplaceSubString(pJSON, "\b", "\\b");
	ReplaceSubString(pJSON, "\f", "\\f");
	ReplaceSubString(pJSON, "\n", "\\n");
	ReplaceSubString(pJSON, "\r", "\\r");
	ReplaceSubString(pJSON, "\t", "\\t");
}

string EscapeJSON(const string& sJSON)
{
	string res = sJSON;
	EscapeJSON(&res);
	return res;
}

void UnescapeJSON(string* pJSON)
{
	ReplaceSubString(pJSON, "\\\\", "~\\~");
	ReplaceSubString(pJSON, "\\\"", "\"");
	ReplaceSubString(pJSON, "\\/", "/");
	ReplaceSubString(pJSON, "\\b", "\b");
	ReplaceSubString(pJSON, "\\f", "\f");
	ReplaceSubString(pJSON, "\\n", "\n");
	ReplaceSubString(pJSON, "\\r", "\r");
	ReplaceSubString(pJSON, "\\t", "\t");
	ReplaceSubString(pJSON, "~\\~", "\\");
}

string UnescapeJSON(const string& sJSON)
{
	string res = sJSON;
	UnescapeJSON(&res);
	return res;
}

void EscapeYAML(string* pYAML)
{
	ReplaceSubString(pYAML, "\\\\", "\\");
	ReplaceSubString(pYAML, "\"", "\\\"");
	ReplaceSubString(pYAML, "\b", "\\b");
	ReplaceSubString(pYAML, "\f", "\\f");
	ReplaceSubString(pYAML, "\n", "\\n");
	ReplaceSubString(pYAML, "\r", "\\r");
	ReplaceSubString(pYAML, "\t", "\\t");
}

string EscapeYAML(const string& sYAML)
{
	string res = sYAML;
	EscapeYAML(&res);
	return res;
}


CWJSONValue::CWJSONValue(CWJSONType iType)
{
	Value = NULL;

	switch(iType)
	{
		case jmtNull    : Free(); break;
		case jmtBool    : SetBool(false); break;
		case jmtInteger : SetInteger(0); break;
		case jmtFloat   : SetFloat(0); break;
		case jmtString  : SetString(""); break;
		case jmtArray   : SetArray(new CWJSONArray()); break;
		case jmtObject  : SetObject(new CWJSONObject()); break;
	}
}

CWJSONValue::~CWJSONValue()
{
	Free();
}

void CWJSONValue::Free()
{
	if(Value == NULL) return;

	switch(Type)
	{
		case jmtString: delete (string*)Value; break;
		case jmtArray: delete (CWJSONArray*)Value; break;
		case jmtObject: delete (CWJSONObject*)Value; break;

		case jmtNull:
		case jmtBool:
		case jmtInteger:
		case jmtFloat:
		{
			free(Value);
		}; break;
	}
	Value = NULL;
}

void CWJSONValue::SetString(const string& sValue)
{
	Free();

	Type = jmtString;

	Value = new string(sValue);
}

void CWJSONValue::SetNull()
{
	Free();
}

void CWJSONValue::SetBool(bool bValue)
{
	Free();

	Type = jmtBool;

	Value = malloc(sizeof(bool));
	memcpy(Value, &bValue, sizeof(bool));
}

void CWJSONValue::SetInteger(int iValue)
{
	Free();

	Type = jmtInteger;

	Value = malloc(sizeof(int));
	memcpy(Value, &iValue, sizeof(int));
}

void CWJSONValue::SetFloat(double fValue)
{
	Free();

	Type = jmtFloat;

	Value = malloc(sizeof(double));
	memcpy(Value, &fValue, sizeof(double));
}

void CWJSONValue::SetArray(CWJSONArray* pValue)
{
	Free();

	Type = jmtArray;

	Value = pValue;
}

void CWJSONValue::SetObject(CWJSONObject* pValue)
{
	Free();

	Type = jmtObject;

	Value = pValue;
}

void CWJSONValue::Set(string sValue, CWJSONType iType)
{
	switch(iType)
	{
		case jmtString: SetString(sValue); break;
		case jmtArray: { CWJSONArray* arr = new CWJSONArray(); arr->Parse(sValue, NULL); SetArray(arr); }; break;
		case jmtObject: { CWJSONObject* obj = new CWJSONObject(); obj->Parse(sValue, NULL); SetObject(obj); }; break;

		case jmtNull: SetNull(); break;

		case jmtBool: {
			SetBool(sValue != "");
			if(StrCmpi(sValue, "true") == 0) SetBool(true);
			if(StrCmpi(sValue, "false") == 0) SetBool(false);
		}; break;

		case jmtInteger: SetInteger(StrToInt(sValue)); break;
		case jmtFloat: SetFloat(StrToFloat(sValue)); break;
	}
}

bool CWJSONValue::GetBool()
{
	if(Value == NULL) return false;

	switch(Type)
	{
		case jmtNull : return false; break;
		case jmtBool : return *((bool*)Value); break;
		case jmtString :
		{
			string s = GetString();
			if(StrCmpi(s, "true") == 0) return true;
			if(StrCmpi(s, "false") == 0) return false;

			return s == "" ? false : true;
		}; break;
		case jmtInteger: return GetInteger() == 0 ? false : true; break;
		case jmtFloat  : return GetFloat() == 0 ? false : true; break;
		case jmtArray  : return false; break;
		case jmtObject : return false; break;
	}
	return false;
}

string CWJSONValue::GetString()
{
	if(Value == NULL) return "null";

	switch(Type)
	{
		case jmtNull : return "null"; break;
		case jmtBool : return GetBool() ? "true" : "false"; break;
		case jmtString : return *((string*)Value); break;
		case jmtInteger: return IntToStr(GetInteger()); break;
		case jmtFloat  : return FloatToStr(GetFloat()); break;
		case jmtArray  : return ""; break;
		case jmtObject : return ""; break;
	}
	return "";
}

int CWJSONValue::GetInteger()
{
	switch(Type)
	{
		case jmtNull   : return 0; break;
		case jmtBool : return GetBool() ? 1 : 0; break;
		case jmtString : return StrToInt(GetString()); break;
		case jmtInteger: return *((int*)Value); break;
		case jmtFloat  : return GetFloat(); break;
		case jmtArray  : return 0; break;
		case jmtObject : return 0; break;
	}

	return 0;
}

double CWJSONValue::GetFloat()
{
	switch(Type)
	{
		case jmtNull   : return 0; break;
		case jmtBool : return GetBool() ? 1 : 0; break;
		case jmtString : return StrToFloat(GetString()); break;
		case jmtInteger: return GetInteger(); break;
		case jmtFloat  : return *((double*)Value); break;
		case jmtArray  : return 0; break;
		case jmtObject : return 0; break;
	}

	return 0;
}

CWJSONArray* CWJSONValue::GetArray()
{
	if(Type != jmtArray) return NULL;

	return (CWJSONArray*)Value;
}

CWJSONObject* CWJSONValue::GetObject()
{
	if(Type != jmtObject) return NULL;

	return (CWJSONObject*)Value;
}

void CWJSONValue::Stringify(string* pOutput, bool bMinify, string sIndent, bool bJavaScript, bool bMeteor, bool bSimpleSchema)
{
	if(Value == NULL) {
		pOutput->append(GetString());
		return;
	}
	switch(Type)
	{
		case jmtString:
		{
			string value = GetString();
			// special processing for meteor javascript
			if(bMeteor && (Trim(value, true, true).find("function") == 0 || Trim(value, true, true).find("(function") == 0 || Trim(value, true, true).find("Session.") == 0 || Trim(value, true, true).find("Meteor.") == 0 || Trim(value, true, true).find("this.") == 0 || Trim(value, true, true).find("new ") == 0 || Trim(value, true, true).find("()") == Trim(value, true, true).length() - 2))
			{
				pOutput->append(value);
			}
			else
			{
				// special processing for simple-schema javascript
				if(bSimpleSchema && (
					value == "Boolean" || value == "[Boolean]" ||
					value == "String" || value == "[String]" ||
					value == "Number" || value == "[Number]" ||
					value == "Date"   || value == "[Date]" ||
					value == "Array"  || value == "[Array]" ||
					value == "Object" || value == "[Object]" ||
					value.find("SimpleSchema.") == 0
				))
				{
					pOutput->append(value);
				}
				else
				{
					// normal processing
					pOutput->append("\"");
					pOutput->append(value);
					pOutput->append("\"");
				}
			}
		}; break;

		case jmtArray:
			GetArray()->Stringify(pOutput, bMinify, sIndent, bJavaScript, bMeteor, bSimpleSchema); break;
		case jmtObject:
			GetObject()->Stringify(pOutput, bMinify, sIndent, bJavaScript, bMeteor, bSimpleSchema); break;

		default:
			pOutput->append(GetString());
	}
}

void CWJSONValue::GetYaml(string* pOutput, string sIndent)
{
	switch(Type)
	{
		case jmtString:
		{
			pOutput->append("\"");
			pOutput->append(EscapeYAML(UnescapeJSON(GetString())));
			pOutput->append("\"");
		}; break;

		case jmtArray:
			GetArray()->GetYaml(pOutput, sIndent); break;

		case jmtObject:
			GetObject()->GetYaml(pOutput, sIndent); break;

		default:
			pOutput->append(GetString());
	}
}

bool CWJSONValue::Parse(const char* cInput, int* pPos, int iLen, string* pErrorMessage)
{
    const char* input = cInput;
    int pos = 0;
    if(pPos != NULL) pos = *pPos;

	// find value start
	while(pos < iLen &&
		input[pos] != '\"' &&
		input[pos] != '.' &&
		input[pos] != '-' &&
		input[pos] != '{' &&
		input[pos] != '[' &&
		!isalnum(input[pos]))
			pos++;

	if(pos >= iLen)
	{
		int line_no = -1;
		int char_no = -1;
		GetCursorPos(cInput, pos, &line_no, &char_no);
		if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
		return false;
	}

	switch(input[pos])
	{
		// null
		case 'n':
		{
			int val_start = pos;
			// find value end
			while(pos < iLen && isalnum(input[pos])) pos++;

			if(pos >= iLen || pos - val_start != 4 || strncmp(input + val_start, "null", 4) != 0)
			{
				int line_no = -1;
				int char_no = -1;
				GetCursorPos(cInput, pos, &line_no, &char_no);
				if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
				return false;
			}
			SetNull();
		}; break;

		// true
		case 't':
		{
			int val_start = pos;
			// find value end
			while(pos < iLen && isalnum(input[pos])) pos++;

			if(pos >= iLen || pos - val_start != 4 || strncmp(input + val_start, "true", 4) != 0)
			{
				int line_no = -1;
				int char_no = -1;
				GetCursorPos(cInput, pos, &line_no, &char_no);
				if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
				return false;
			}
			SetBool(true);
		}; break;

		// false
		case 'f':
		{
			int val_start = pos;
			// find value end
			while(pos < iLen && isalnum(input[pos])) pos++;

			if(pos >= iLen || pos - val_start != 5 || strncmp(input + val_start, "false", 5) != 0)
			{
				int line_no = -1;
				int char_no = -1;
				GetCursorPos(cInput, pos, &line_no, &char_no);
				if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
				return false;
			}
			SetBool(false);
		}; break;


		// number
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
		case '-':
		case '.':
		case 'e':
		case 'E':
		{
			int val_start = pos;
			while(pos < iLen &&
					input[pos + 1] != ',' &&
					input[pos + 1] != ' ' &&
					input[pos + 1] != '\t' &&
					input[pos + 1] != '\r' &&
					input[pos + 1] != '\n' &&
					input[pos + 1] != '}' &&
					input[pos + 1] != ']')
						pos++;
			if(pos >= iLen)
			{
				int line_no = -1;
				int char_no = -1;
				GetCursorPos(cInput, pos, &line_no, &char_no);
				if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
				return false;
			}

			string num(input + val_start, (pos - val_start) + 1);
			if(num.find_first_not_of("-01234567890") == string::npos)
			{
				// integer
				SetInteger(StrToInt(num));
			}
			else
			{
				if(num.find_first_not_of("+-.01234567890eE") == string::npos)
				{
					// float
					SetFloat(StrToFloat(num));
				}
				else
				{
					if(pErrorMessage) *pErrorMessage = "Error parsing JSON";
					return false;
				}
			}
			pos++;
		}; break;

		// string
		case '\"':
		{
			pos++;
			int val_start = pos;
			// find value end
			while(pos < iLen && !(input[pos] == '\"' && pos > 0 && input[pos - 1] != '\\')) pos++;
			if(pos >= iLen)
			{
				int line_no = -1;
				int char_no = -1;
				GetCursorPos(cInput, pos, &line_no, &char_no);
				if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
				return false;
			}

			SetString(string(input + val_start, pos - val_start));
			pos++;
		}; break;
		// array
		case '[':
		{
			CWJSONArray* array = new CWJSONArray();
			if(!array->Parse(input, &pos, iLen, pErrorMessage))
			{
				delete array;
				return false;
			}
			SetArray(array);
		}; break;

		// object
		case '{':
		{
			CWJSONObject* object = new CWJSONObject();
			if(!object->Parse(input, &pos, iLen, pErrorMessage))
			{
				delete object;
				return false;
			}
			SetObject(object);
		}; break;
	}

	// skip spaces after value
	while(pos < iLen && (input[pos] == ' ' || input[pos] == '\t' || input[pos] == '\r' || input[pos] == '\n')) pos++;

	// after value we expect comma, closed object or closed array
	if(pos >= iLen || (pos < iLen && input[pos] != ',' && input[pos] != '}' && input[pos] != ']'))
	{
		int line_no = -1;
		int char_no = -1;
		GetCursorPos(cInput, pos, &line_no, &char_no);
		if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
		return false;
	}

    if(pPos != NULL) *pPos = pos;
	return true;
}

// --------------


CWJSONArray::CWJSONArray()
{

}

CWJSONArray::~CWJSONArray()
{
	Clear();
}

int CWJSONArray::Count()
{
	return Items.size();
}

void CWJSONArray::Clear()
{
	int count = Count();
	for(int i = 0; i < count; i++)
		delete Items[i];
	Items.clear();
}

CWJSONValue* CWJSONArray::Add(CWJSONValue* pItem)
{
	Items.push_back(pItem);
	return pItem;
}

void CWJSONArray::Delete(int iIndex)
{
	delete Items[iIndex];
    Items.erase(Items.begin() + iIndex);
}

CWJSONObject* CWJSONArray::GetObjectWithMember(string sMemberName)
{
	int count = Count();
	for(int i = 0; i < count; i++)
	{
		CWJSONObject* obj = Items[i]->GetObject();
		if(obj && obj->Get(sMemberName) != NULL)
			return obj;
	}
	return NULL;
}

void CWJSONArray::GetObjectsWithMember(string sMemberName, CWJSONArray* pArray)
{
	pArray->Clear();

	int count = Count();
	for(int i = 0; i < count; i++)
	{
		CWJSONObject* obj = Items[i]->GetObject();
		if(obj && obj->Get(sMemberName) != NULL)
		{
			CWJSONObject* new_obj = new CWJSONObject();
			new_obj->CopyFrom(obj);
			pArray->AddObject(new_obj);
		}
	}
}

CWJSONObject* CWJSONArray::GetObjectWithStringValue(string sMemberName, string sMemberValue)
{
	int count = Count();
	for(int i = 0; i < count; i++)
	{
		CWJSONObject* obj = Items[i]->GetObject();
		if(obj)
		{
			CWJSONValue* value = obj->Get(sMemberName);
			if(value && value->GetString() == sMemberValue)
				return obj;
		}
	}
	return NULL;
}

void CWJSONArray::ExtractStrings(CWStringList* pList)
{
	int count = Count();
	for(int i = 0; i < count; i++)
	{
		CWJSONValue* value = Items[i];
		if(value->Type == jmtString)
			pList->Add(value->GetString());
		else
		{
			if(value->Type == jmtObject)
				value->GetObject()->ExtractStrings(pList);
			else
			{
				if(value->Type == jmtArray)
					value->GetArray()->ExtractStrings(pList);
			}
		}
	}
}

int CWJSONArray::FindString(const string& sValue)
{
	int count = Count();
	for(int i = count - 1; i >= 0; i--)
	{
		CWJSONValue* value = Items[i];
		if(value->Type == jmtString && value->GetString() == sValue)
			return i;
	}
	return -1;
}

void CWJSONArray::DeleteString(const string& sValue)
{
	int index = FindString(sValue);
	if(index < 0) return;
	Delete(index);
}

void CWJSONArray::ReplaceString(string sOld, string sNew)
{
	int count = Count();
	for(int i = 0; i < count; i++)
	{
		CWJSONValue* value = Items[i];
		if(value->Type == jmtString)
		{
			if(value->GetString() == sOld)
				value->SetString(sNew);
		}
		else
		{
			if(value->Type == jmtObject)
				value->GetObject()->ReplaceString(sOld, sNew);
			else
			{
				if(value->Type == jmtArray)
					value->GetArray()->ReplaceString(sOld, sNew);
			}
		}
	}
}

void CWJSONArray::Stringify(string* pOutput, bool bMinify, string sIndent, bool bJavaScript, bool bMeteor, bool bSimpleSchema)
{
	pOutput->append("[");
	if(!bMinify) pOutput->append(LINE_TERM);

	int count = Count();
	for(int i = 0; i < count; i++)
	{
		if(!bMinify) pOutput->append(sIndent + "\t");
		Items[i]->Stringify(pOutput, bMinify, sIndent + "\t", bJavaScript, bMeteor, bSimpleSchema);

		if(i < count - 1)
			pOutput->append(",");

		if(!bMinify) pOutput->append(LINE_TERM);
	}

	if(!bMinify) pOutput->append(sIndent);
	pOutput->append("]");
}

string CWJSONArray::Stringify(bool bMinify, bool bJavaScript, bool bMeteor, bool bSimpleSchema)
{
	string output = "";
	string indent = "";
	Stringify(&output, bMinify, indent, bJavaScript, bMeteor, bSimpleSchema);
	return output;
}

void CWJSONArray::GetYaml(string* pOutput, string sIndent)
{
	int count = Count();
	if(count == 0)
		pOutput->append("[]");
	pOutput->append(LINE_TERM);

	for(int i = 0; i < count; i++)
	{
		pOutput->append(sIndent);
		pOutput->append("-");

		if(Items[i]->Type != jmtObject && Items[i]->Type != jmtArray)
			pOutput->append(" ");

		Items[i]->GetYaml(pOutput, sIndent + " ");

		if(Items[i]->Type != jmtObject && Items[i]->Type != jmtArray)
			pOutput->append(LINE_TERM);
	}
}

bool CWJSONArray::Parse(const char* cInput, int* pPos, int iLen, string* pErrorMessage)
{
	Clear();
    const char* input = cInput;
    int pos = 0;
    if(pPos != NULL) pos = *pPos;

	// find array start
	while(pos < iLen && input[pos] != '[')
		pos++;

	if(pos >= iLen)
	{
		int line_no = -1;
		int char_no = -1;
		GetCursorPos(cInput, pos, &line_no, &char_no);
		if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
		return false;
	}

	pos++;

	while(pos < iLen && (input[pos] == ' ' || input[pos] == '\t' || input[pos] == '\r' || input[pos] == '\n'))
		pos++;

	if(pos >= iLen)
	{
		int line_no = -1;
		int char_no = -1;
		GetCursorPos(cInput, pos, &line_no, &char_no);
		if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
		return false;
	}

	// loop until array end
	while(pos < iLen && input[pos] != ']')
	{
		CWJSONValue* value = new CWJSONValue();
		if(!value->Parse(input, &pos, iLen, pErrorMessage))
		{
			delete value;
			return false;
		}
		Add(value);

		while(pos < iLen && input[pos] != ',' && input[pos] != ']')
			pos++;

		if(input[pos] == ',')
		{
			pos++;
			while(pos < iLen && (input[pos] == ' ' || input[pos] == '\t' || input[pos] == '\r' || input[pos] == '\n'))
				pos++;
		}
	}
	pos++;

    if(pPos != NULL) *pPos = pos;
	return true;
}

bool CWJSONArray::Parse(const string& sInput, string* pErrorMessage)
{
    int input_len = sInput.size();
    const char* input = sInput.c_str();
    return Parse(input, NULL, input_len, pErrorMessage);
}

// --------------


CWJSONMember::CWJSONMember(const string& sName, CWJSONType iType)
{
	Name = sName;
	Value = new CWJSONValue(iType);
}

CWJSONMember::~CWJSONMember()
{
	delete Value;
}

void CWJSONMember::ExtractStrings(CWStringList* pList)
{
	if(Value->Type == jmtString)
		pList->Add(Value->GetString());
	else
	{
		if(Value->Type == jmtObject)
			Value->GetObject()->ExtractStrings(pList);
		else
		{
			if(Value->Type == jmtArray)
				Value->GetArray()->ExtractStrings(pList);
		}
	}
}

void CWJSONMember::ReplaceString(string sOld, string sNew)
{
	if(Value->Type == jmtString)
	{
		if(Value->GetString() == sOld)
			Value->SetString(sNew);
	}
	else
	{
		if(Value->Type == jmtObject)
			Value->GetObject()->ReplaceString(sOld, sNew);
		else
		{
			if(Value->Type == jmtArray)
				Value->GetArray()->ReplaceString(sOld, sNew);
		}
	}
}

void CWJSONMember::Stringify(string* pOutput, bool bMinify, string sIndent, bool bJavaScript, bool bMeteor, bool bSimpleSchema)
{
	if(!bMinify) pOutput->append(sIndent);

	bool quoted_name = !bJavaScript || (bJavaScript && FindSubString(&Name, ".") >= 0);
	if(quoted_name) pOutput->append("\"");

	if(bJavaScript)
		pOutput->append(UnescapeJSON(Name));
	else
		pOutput->append(Name);


	if(quoted_name) pOutput->append("\"");

	pOutput->append(":");

	if(!bMinify) pOutput->append(" ");
	Value->Stringify(pOutput, bMinify, sIndent, bJavaScript, bMeteor, bSimpleSchema);
}

void CWJSONMember::GetYaml(string* pOutput, string sIndent)
{
	pOutput->append(sIndent);
	pOutput->append(Name);
	pOutput->append(":");

	if(Value->Type != jmtObject && Value->Type != jmtArray)
		pOutput->append(" ");

	Value->GetYaml(pOutput, sIndent + "  ");

	if(Value->Type != jmtObject && Value->Type != jmtArray)
		pOutput->append(LINE_TERM);
}

bool CWJSONMember::Parse(const char* cInput, int* pPos, int iLen, string* pErrorMessage)
{
    const char* input = cInput;
    int pos = 0;
    if(pPos != NULL) pos = *pPos;

	// skip spaces
	while(pos < iLen && (input[pos] == ' ' || input[pos] == '\t' || input[pos] == '\r' || input[pos] == '\n')) pos++;

	if(pos >= iLen || input[pos] != '\"')
	{
		int line_no = -1;
		int char_no = -1;
		GetCursorPos(cInput, pos, &line_no, &char_no);
		if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
		return false;
	}

	// member start found
	pos++;
	int name_start = pos;
	// find name end
	while(pos < iLen && !(input[pos] == '\"' && pos > 0 && input[pos - 1] != '\\'))
		pos++;

	if(pos >= iLen)
	{
		int line_no = -1;
		int char_no = -1;
		GetCursorPos(cInput, pos, &line_no, &char_no);
		if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
		return false;
	}

	// name end found
	Name = string(input + name_start, pos - name_start);
	pos++;

	// skip spaces
	while(pos < iLen && (input[pos] == ' ' || input[pos] == '\t' || input[pos] == '\r' || input[pos] == '\n')) pos++;

	if(pos >= iLen || input[pos] != ':')
	{
		int line_no = -1;
		int char_no = -1;
		GetCursorPos(cInput, pos, &line_no, &char_no);
		if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
		return false;
	}

	// value start found
	pos++;
	if(!Value->Parse(input, &pos, iLen, pErrorMessage))
		return false;

	if(pPos != NULL) *pPos = pos;
	return true;
}

bool CWJSONMember::Set(string sValue, string* pErrorMessage)
{
	const char* val = sValue.c_str();
	int pos = 0;
	int len = sValue.size();
	if(!Value->Parse(val, &pos, len, pErrorMessage))
		return false;

	return true;
}

// ---------------------

CWJSONMemberList::CWJSONMemberList()
{

}

CWJSONMemberList::~CWJSONMemberList()
{
	Clear();
}

int CWJSONMemberList::Count()
{
	return Items.size();
}

void CWJSONMemberList::Clear()
{
	int count = Count();
	for(int i = 0; i < count; i++)
		delete Items[i];
	Items.clear();
}

CWJSONMember* CWJSONMemberList::Add(CWJSONMember* pItem)
{
	Items.push_back(pItem);
	return pItem;
}

CWJSONMember* CWJSONMemberList::Add(const string& sName, CWJSONType iType)
{
	CWJSONMember* member = new CWJSONMember(sName, iType);
	return Add(member);
}

void CWJSONMemberList::Delete(int iIndex)
{
	delete Items[iIndex];
    Items.erase(Items.begin() + iIndex);
}

void CWJSONMemberList::Delete(const string& sName)
{
	int index = IndexOf(sName);
	if(index < 0) return;

	delete Items[index];
    Items.erase(Items.begin() + index);
}

void CWJSONMemberList::Delete(CWJSONMember* pMember)
{
	int index = IndexOf(pMember);
	if(index < 0) return;

	delete Items[index];
    Items.erase(Items.begin() + index);
}

int CWJSONMemberList::IndexOf(const string& sName)
{
	int count = Count();
	for(int i = 0; i < count; i++)
	{
		if(Items[i]->Name == sName)
			return i;
	}
	return -1;
}

int CWJSONMemberList::IndexOf(CWJSONMember* pMember)
{
	int count = Count();
	for(int i = 0; i < count; i++)
	{
		if(Items[i] == pMember)
			return i;
	}
	return -1;
}

CWJSONMember* CWJSONMemberList::Get(const string& sName)
{
	int index = IndexOf(sName);
	if(index < 0)
		return NULL;

	return Items[index];
}

void CWJSONMemberList::ExtractStrings(CWStringList* pList)
{
	int count = Count();
	for(int i = 0; i < count; i++)
		Items[i]->ExtractStrings(pList);
}

void CWJSONMemberList::ReplaceString(string sOld, string sNew)
{
	int count = Count();
	for(int i = 0; i < count; i++)
		Items[i]->ReplaceString(sOld, sNew);
}

void CWJSONMemberList::Stringify(string* pOutput, bool bMinify, string sIndent, bool bJavaScript, bool bMeteor, bool bSimpleSchema)
{
	int count = Count();
	for(int i = 0; i < count; i++)
	{
		Items[i]->Stringify(pOutput, bMinify, sIndent + "\t", bJavaScript, bMeteor, bSimpleSchema);

		if(i < count - 1)
			pOutput->append(",");

		if(!bMinify) pOutput->append(LINE_TERM);
	}
}

void CWJSONMemberList::GetYaml(string* pOutput, string sIndent)
{
	int count = Count();
	for(int i = 0; i < count; i++)
		Items[i]->GetYaml(pOutput, sIndent);
}

void CWJSONMemberList::Merge(CWJSONMemberList* pMemberList)
{
	int count = pMemberList->Count();
	for(int i = 0; i < count; i++)
	{
		CWJSONMember* member = pMemberList->Items[i];
		switch(member->Value->Type)
		{
			case jmtNull: SetNull(member->Name); break;
			case jmtBool: SetBool(member->Name, member->Value->GetBool()); break;
			case jmtInteger: SetInteger(member->Name, member->Value->GetInteger()); break;
			case jmtFloat: SetFloat(member->Name, member->Value->GetFloat()); break;
			case jmtString: SetString(member->Name, member->Value->GetString()); break;

			case jmtArray: {
				CWJSONArray* array = new CWJSONArray();
				string msg = "";
				array->Parse(member->Value->GetArray()->Stringify(true), &msg);
				SetArray(member->Name, array);
			}; break;

			case jmtObject: {
				CWJSONObject* object = new CWJSONObject();
				string msg = "";
				object->Parse(member->Value->GetObject()->Stringify(true), &msg);
				CWJSONMember* original_member = Get(member->Name);
				CWJSONObject* original_object = NULL;
				if(original_member != NULL && original_member->Value != NULL) {
					original_object = original_member->Value->GetObject();
				}
				
				if(original_object == NULL) {
					SetObject(member->Name, object);
				} else {
					original_object->Merge(object);
				}
			}; break;
		}
	}
}

// --------------

CWJSONObject::CWJSONObject()
{
	Members = new CWJSONMemberList();
}

CWJSONObject::~CWJSONObject()
{
	delete Members;
}

void CWJSONObject::Clear()
{
	Members->Clear();
}

void CWJSONObject::ExtractStrings(CWStringList* pList)
{
	Members->ExtractStrings(pList);
}

void CWJSONObject::ReplaceString(string sOld, string sNew)
{
	Members->ReplaceString(sOld, sNew);
}

void CWJSONObject::Stringify(string* pOutput, bool bMinify, string sIndent, bool bJavaScript, bool bMeteor, bool bSimpleSchema)
{
	pOutput->append("{");
	if(!bMinify) pOutput->append(LINE_TERM);

	Members->Stringify(pOutput, bMinify, sIndent, bJavaScript, bMeteor, bSimpleSchema);

	if(!bMinify) pOutput->append(sIndent);
	pOutput->append("}");
}

string CWJSONObject::Stringify(bool bMinify, bool bJavaScript, bool bMeteor, bool bSimpleSchema)
{
	string output = "";
	string indent = "";
	Stringify(&output, bMinify, indent, bJavaScript, bMeteor, bSimpleSchema);
	return output;
}

void CWJSONObject::GetYaml(string* pOutput, string sIndent)
{
	if(sIndent == "")
	{
		pOutput->append("---");
	}

	pOutput->append(LINE_TERM);
	Members->GetYaml(pOutput, sIndent);
}

string CWJSONObject::GetYaml()
{
	string res = "";
	GetYaml(&res, "");
	return res;
}

bool CWJSONObject::Parse(const char* cInput, int* pPos, int iLen, string* pErrorMessage)
{
    Clear();

    const char* input = cInput;
    int pos = 0;
    if(pPos != NULL) pos = *pPos;

	// find object start
	while(pos < iLen && input[pos] != '{')
		pos++;

	if(pos >= iLen)
	{
		int line_no = -1;
		int char_no = -1;
		GetCursorPos(cInput, pos, &line_no, &char_no);
		if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
		return false;
	}

	pos++;

	while(pos < iLen && (input[pos] == ' ' || input[pos] == '\t' || input[pos] == '\r' || input[pos] == '\n'))
		pos++;

	if(pos >= iLen)
	{
		int line_no = -1;
		int char_no = -1;
		GetCursorPos(cInput, pos, &line_no, &char_no);
		if(pErrorMessage) *pErrorMessage = "Error parsing JSON. Parsing stopped at line " + IntToStr(line_no) + " char " + IntToStr(char_no) + ".";
		return false;
	}

	// loop until object end
	while(pos < iLen && input[pos] != '}')
	{
		// find member start
		while(pos < iLen && input[pos] != '\"')
			pos++;

		// member start found
		if(input[pos] == '\"')
		{
			CWJSONMember* member = new CWJSONMember("");

			if(!member->Parse(input, &pos, iLen, pErrorMessage))
			{
				delete member;
				return false;
			}

			Members->Add(member);
		}

		while(pos < iLen && input[pos] != ',' && input[pos] != '}')
			pos++;

		if(input[pos] == ',')
		{
			pos++;
			while(pos < iLen && (input[pos] == ' ' || input[pos] == '\t' || input[pos] == '\r' || input[pos] == '\n'))
				pos++;
		}
	}
	pos++;

    if(pPos != NULL) *pPos = pos;
    return true;
}


bool CWJSONObject::Parse(const string& sInput, string* pErrorMessage)
{
    int input_len = sInput.size();
    const char* input = sInput.c_str();
    return Parse(input, NULL, input_len, pErrorMessage);
}

bool CWJSONObject::CopyFrom(CWJSONObject* pObject, string* pErrorMessage)
{
	if(pObject == NULL)
	{
		Clear();
		return true;
	}

	string str = pObject->Stringify(true);

	return Parse(str, pErrorMessage);
}

void CWJSONObject::Merge(CWJSONObject* pObject)
{
	if(pObject == NULL) return;

	Members->Merge(pObject->Members);
}