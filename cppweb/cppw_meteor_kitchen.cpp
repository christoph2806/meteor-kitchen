#include <cstdio>

#include "cppw_meteor_kitchen.h"
#include "cppw_file.h"
#include "cppw_process.h"
#include "cppw_sock.h"

void MetaInit(CWJSONObject* pMeta, string sObjectType, string sDerivedFrom)
{
	pMeta->SetString("objectType", sObjectType);

	CWJSONArray* derived_from = pMeta->GetArray("derivedFrom");
	if(derived_from == NULL)
	{
		derived_from = new CWJSONArray();
		pMeta->SetArray("derivedFrom", derived_from);
	}

	if(sDerivedFrom != "") derived_from->AddString(sDerivedFrom);

	CWJSONArray* members = pMeta->GetArray("members");
	if(members == NULL)
	{
		members = new CWJSONArray();
		pMeta->SetArray("members", members);
	}

	CWJSONArray* override_members = pMeta->GetArray("overrideMembers");
	if(override_members == NULL)
	{
		override_members = new CWJSONArray();
		pMeta->SetArray("overrideMembers", override_members);
	}

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members == NULL)
	{
		hide_members = new CWJSONArray();
		pMeta->SetArray("hideMembers", hide_members);
	}

	CWJSONArray* hide_derived_classes = pMeta->GetArray("hideDerivedClasses");
	if(hide_derived_classes == NULL)
	{
		hide_derived_classes = new CWJSONArray();
		pMeta->SetArray("hideDerivedClasses", hide_derived_classes);
	}

	pMeta->SetBool("hideThis", false);
}

void MetaHideDerivedClass(CWJSONObject* pMeta, string sClassName)
{
	CWJSONArray* hide_derived_classes = pMeta->GetArray("hideDerivedClasses");
	if(hide_derived_classes == NULL)
	{
		hide_derived_classes = new CWJSONArray();
		pMeta->SetArray("hideDerivedClasses", hide_derived_classes);
	}

	hide_derived_classes->AddString(sClassName);
}

void MetaAddMember(CWJSONObject* pMeta, string sName, string sTitle, string sType, string sSubType, string sDefault, bool bRequired, string sInput, CWStringList* pChoiceItems)
{
	CWJSONArray* members = pMeta->GetArray("members");
	if(members == NULL)
	{
		members = new CWJSONArray();
		pMeta->SetArray("members", members);
	}

	CWJSONObject* member = members->GetObjectWithStringValue("name", sName);
	if(member == NULL) {
		member = new CWJSONObject();
		members->AddObject(member);
	}

	member->SetString("name", sName);
	member->SetString("title", sTitle);
	member->SetString("type", sType);
	member->SetString("subType", sSubType);
	member->SetString("default", sDefault);
	member->SetBool("required", bRequired);
	member->SetString("input", sInput);

	if(pChoiceItems != NULL)
	{
		CWJSONArray* choice_items = member->GetArray("choice_items");
		if(choice_items == NULL)
		{
			choice_items = new CWJSONArray();
			member->SetArray("choice_items", choice_items);
		}
		choice_items->AddStringList(pChoiceItems);
	}
}

void MetaOverrideMember(CWJSONObject* pMeta, string sName, string sTitle, string sType, string sSubType, string sDefault, bool bRequired, string sInput, CWStringList* pChoiceItems)
{
	CWJSONArray* override_members = pMeta->GetArray("overrideMembers");
	if(override_members == NULL)
	{
		override_members = new CWJSONArray();
		pMeta->SetArray("overrideMembers", override_members);
	}


	CWJSONObject* member = override_members->GetObjectWithStringValue("name", sName);
	if(member == NULL)
	{
		member = new CWJSONObject();
		override_members->AddObject(member);
	}

	member->SetString("name", sName);
	member->SetString("title", sTitle);
	member->SetString("type", sType);
	member->SetString("subType", sSubType);
	member->SetString("default", sDefault);
	member->SetBool("required", bRequired);
	member->SetString("input", sInput);

	if(pChoiceItems != NULL)
	{
		CWJSONArray* choice_items = member->GetArray("choice_items");
		if(choice_items == NULL)
		{
			choice_items = new CWJSONArray();
			member->SetArray("choice_items", choice_items);
		}
		choice_items->AddStringList(pChoiceItems);
	}
}

CWJSONObject* MetaGetClass(string sClassName, CWJSONObject* pMeta)
{
	if(sClassName == "") return NULL;
	CWJSONArray* class_list = pMeta->GetArray("classList");
    if(class_list == NULL) return NULL;
	int class_count = class_list->Count();
	for(int i = 0; i < class_count; i++)
	{
		CWJSONObject* class_item = class_list->Items[i]->GetObject();
		if(class_item != NULL && class_item->GetString("objectType") == sClassName) return class_item;
	}
	return NULL;
}

void SimplifyMetadata(CWJSONObject* pObject, CWJSONObject* pResult, CWJSONObject* pMeta, bool bOverrideMembers)
{
    pResult->Clear();
    pResult->CopyFrom(pObject);
	pResult->Delete("overrideMembers");
	pResult->Delete("hideMembers");

	CWJSONArray* result_members = pResult->GetArray("members");
	if(result_members == NULL)
	{
		result_members = new CWJSONArray();
		pResult->SetArray("members", result_members);
	}
	result_members->Clear();

	CWJSONArray* hide_members = pObject->GetArray("hideMembers");
	CWJSONArray* override_members = pObject->GetArray("overrideMembers");

	CWJSONArray* derived_from = pObject->GetArray("derivedFrom");
	if(derived_from != NULL && derived_from->Count() > 0)
	{
		int derived_count = derived_from->Count();
		for(int i = 0; i < derived_count; i++)
		{
			string derived_from_name = derived_from->Items[i]->GetString();
			CWJSONObject* derived_from_class = MetaGetClass(derived_from_name, pMeta);
			if(derived_from_class != NULL)
			{
				CWJSONObject* derived_from_class_simplified = new CWJSONObject();
				SimplifyMetadata(derived_from_class, derived_from_class_simplified, pMeta, false);

				CWJSONArray* derived_members = derived_from_class_simplified->GetArray("members");
				if(derived_members != NULL && derived_members->Count() > 0)
				{
					for(int j = 0; j < derived_members->Count(); j++)
					{
						CWJSONObject* derived_member = derived_members->Items[j]->GetObject();
						if(derived_member != NULL)
						{
							CWJSONObject* member = new CWJSONObject();
							member->CopyFrom(derived_member);
							result_members->AddObject(member);
						}
					}
				}
				delete derived_from_class_simplified;
			}
		}
	}

	CWJSONArray* original_members = pObject->GetArray("members");
	if(original_members != NULL && original_members->Count() > 0)
	{
		for(int j = 0; j < original_members->Count(); j++)
		{
			CWJSONObject* original_member = original_members->Items[j]->GetObject();
			if(original_member != NULL)
			{
				CWJSONObject* member = new CWJSONObject();
				member->CopyFrom(original_member);
				result_members->AddObject(member);
			}
		}
	}

	if(bOverrideMembers)
	{
        int result_members_count = result_members->Count();
        for(int i = result_members_count - 1; i >= 0; i--)
		{
			CWJSONObject* result_member = result_members->Items[i]->GetObject();
			string result_member_name = result_member->GetString("name");

            if(hide_members->FindString(result_member_name) >= 0)
				result_members->Delete(i);
			else
			{
				CWJSONObject* override_member = override_members->GetObjectWithStringValue("name", result_member_name);
				if(override_member != NULL) result_member->CopyFrom(override_member);
			}
		}
	}
}

void GetMetadata(CWJSONObject* pMeta, bool bSimplify, bool bNamesOnly, CWJSONObject* pMetaHelp)
{
	pMeta->SetInteger("version", GENERATOR_METADATA_VERSION);

	CWJSONArray* object_list = pMeta->GetArray("classList");
	if(object_list == NULL)
	{
		object_list = new CWJSONArray();
		pMeta->SetArray("classList", object_list);
	}

	// root
	{
		CWJSONObject* object = new CWJSONObject();
		MetaInit(object, "root", "");
		MetaAddMember(object, "application", "Application", "application", "", "", true, "", NULL);
		object_list->AddObject(object);
	}

	// object
	{
		CWJSONObject* object = new CWJSONObject();
		CWObject tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// field
	{
		CWJSONObject* object = new CWJSONObject();
		CWField tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// hidden field
	{
		CWJSONObject* object = new CWJSONObject();
		CWHiddenField tmp;
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// field item
	{
		CWJSONObject* object = new CWJSONObject();
		CWInputItem tmp;
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// collection
	{
		CWJSONObject* object = new CWJSONObject();
		CWCollection tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// query
	{
		CWJSONObject* object = new CWJSONObject();
		CWQuery tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// subscription
	{
		CWJSONObject* object = new CWJSONObject();
		CWSubscription tmp;
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// component
	{
		CWJSONObject* object = new CWJSONObject();
		CWComponent tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// route_param
	{
		CWJSONObject* object = new CWJSONObject();
		CWParam tmp;
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// variable
	{
		CWJSONObject* object = new CWJSONObject();
		CWVariable tmp;
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// action
	{
		CWJSONObject* object = new CWJSONObject();
		CWAction tmp;
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// server_side_route
	{
		CWJSONObject* object = new CWJSONObject();
		CWServerSideRoute tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// page
	{
		CWJSONObject* object = new CWJSONObject();
		CWPage tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// zone
	{
		CWJSONObject* object = new CWJSONObject();
		CWZone tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// file_pair
	{
		CWJSONObject* object = new CWJSONObject();
		CWFilePair tmp;
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// packages
	{
		CWJSONObject* object = new CWJSONObject();
		CWPackages tmp;
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// application
	{
		CWJSONObject* object = new CWJSONObject();
		CWApplication tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// custom_component
	{
		CWJSONObject* object = new CWJSONObject();
		CWCustomComponent tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// menu_item
	{
		CWJSONObject* object = new CWJSONObject();
		CWMenuItem tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// menu
	{
		CWJSONObject* object = new CWJSONObject();
		CWMenu tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// jumbotron
	{
		CWJSONObject* object = new CWJSONObject();
		CWJumbotron tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// form
	{
		CWJSONObject* object = new CWJSONObject();
		CWForm tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// dataview
	{
		CWJSONObject* object = new CWJSONObject();
		CWDataView tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// treeview
	{
		CWJSONObject* object = new CWJSONObject();
		CWTreeView tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// markdown
	{
		CWJSONObject* object = new CWJSONObject();
		CWMarkdown tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// div
	{
		CWJSONObject* object = new CWJSONObject();
		CWDiv tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// section
	{
		CWJSONObject* object = new CWJSONObject();
		CWSection tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// editable content
	{
		CWJSONObject* object = new CWJSONObject();
		CWEditableContent tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// cms content
	{
		CWJSONObject* object = new CWJSONObject();
		CWCMSContent tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// plugin
	{
		CWJSONObject* object = new CWJSONObject();
		CWPlugin tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	// chart
	{
		CWJSONObject* object = new CWJSONObject();
		CWChart tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}
	
	// gasoline
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasoline tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_event
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasEvent tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_node
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasNode tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_text
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasText tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_element
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasElement tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_handler
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasHandler tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_helper
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasHelper tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_template
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasTemplate tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_html
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasHTML tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_loop
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasLoop tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_condition
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasCondition tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_condition_true
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasConditionTrue tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_condition_false
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasConditionFalse tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	// gas_inclusion
	{
		CWJSONObject* object = new CWJSONObject();
		CWGasInclusion tmp(NULL);
		tmp.GetMetadata(object);
		object_list->AddObject(object);
	}

	if(bSimplify)
	{
		CWJSONObject* simplified = new CWJSONObject();
		simplified->CopyFrom(pMeta);
		CWJSONArray* class_list_simplified = simplified->GetArray("classList");
		if(class_list_simplified == NULL)
		{
			class_list_simplified = new CWJSONArray();
			simplified->SetArray("classList", class_list_simplified);
		}
		class_list_simplified->Clear();

		CWJSONArray* class_list = pMeta->GetArray("classList");
		if(class_list != NULL && class_list->Count() > 0)
		{
			for(int i = 0; i < class_list->Count(); i++)
			{
				CWJSONObject* original_class = class_list->Items[i]->GetObject();
				if(original_class != NULL)
				{
					CWJSONObject* simplified_class = new CWJSONObject();
					SimplifyMetadata(original_class, simplified_class, pMeta, true);
					class_list_simplified->AddObject(simplified_class);
				}
			}
		}

		pMeta->CopyFrom(simplified);

		delete simplified;
	}

	if(bNamesOnly)
	{
		CWJSONObject* simplified = new CWJSONObject();
		simplified->CopyFrom(pMeta);
		CWJSONArray* class_list_simplified = simplified->GetArray("classList");
		if(class_list_simplified == NULL)
		{
			class_list_simplified = new CWJSONArray();
			simplified->SetArray("classList", class_list_simplified);
		}
		class_list_simplified->Clear();

		CWJSONArray* class_list = pMeta->GetArray("classList");
		if(class_list != NULL && class_list->Count() > 0)
		{
			for(int i = 0; i < class_list->Count(); i++)
			{
				CWJSONObject* original_class = class_list->Items[i]->GetObject();
				if(original_class != NULL)
				{
					CWJSONObject* simplified_class = new CWJSONObject();
					simplified_class->SetString("objectType", original_class->GetString("objectType"));
					CWJSONArray* simplified_members = new CWJSONArray();
					simplified_class->SetArray("members", simplified_members);
					CWJSONArray* original_members = original_class->GetArray("members");
					if(original_members != NULL)
					{
						for(int j = 0; j < original_members->Count(); j++)
						{
							CWJSONObject* original_member = original_members->Items[j]->GetObject();
							if(original_member != NULL)
							{
								CWJSONObject* simplified_member = new CWJSONObject();
								simplified_member->SetString("name", original_member->GetString("name"));
								simplified_members->AddObject(simplified_member);
							}
						}
					}
					class_list_simplified->AddObject(simplified_class);
				}
			}
		}

		pMeta->CopyFrom(simplified);

		delete simplified;
	}

	if(pMetaHelp != NULL)
	{
		CWJSONArray* meta_classes = pMeta->GetArray("classList");
		CWJSONArray* help_classes = pMetaHelp->GetArray("classList");

		if(meta_classes != NULL && help_classes != NULL)
		{
			for(int i = 0; i < meta_classes->Count(); i++)
			{
				CWJSONObject* meta_class = meta_classes->Items[i]->GetObject();
				if(meta_class != NULL)
				{
					CWJSONObject* help_class = help_classes->GetObjectWithStringValue("objectType", meta_class->GetString("objectType"));
					if(help_class != NULL)
					{
						meta_class->SetString("description", help_class->GetString("description"));

						CWJSONArray* meta_members = meta_class->GetArray("members");
						CWJSONArray* help_members = help_class->GetArray("members");
						if(meta_members != NULL && help_members != NULL)
						{
							for(int j = 0; j < meta_members->Count(); j++)
							{
                                CWJSONObject* meta_member = meta_members->Items[j]->GetObject();
                                if(meta_member != NULL)
								{
                                    CWJSONObject* help_member = help_members->GetObjectWithStringValue("name", meta_member->GetString("name"));
									if(help_member != NULL)
									{
										meta_member->SetString("description", help_member->GetString("description"));
									}
								}
							}
						}
					}
				}
			}
		}
	}
}

bool ParseJSONFile(string sFileName, CWJSONObject* pJSON, bool bFailIfNotExists, string* pErrorMessage)
{
	pJSON->Clear();

	if(sFileName == "" || !FileExists(sFileName))
	{
		if(bFailIfNotExists)
		{
			if(pErrorMessage) *pErrorMessage = "File not found: \"" + sFileName + "\".";
			return false;
		}
		else
			return true;
	}

	string input_string = "";
	if(!FileLoadString(sFileName, &input_string, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading \"" + sFileName + "\". " + *pErrorMessage;
		return false;
	}

	if(!pJSON->Parse(input_string, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error parsing \"" + sFileName + "\". " + *pErrorMessage;
		return false;
	}

	return true;
}

bool LoadHTML(string sPath, CWNode* pNode, string* pErrorMessage)
{
	string tmpstr = "";
	if(!FileExists(sPath))
	{
		if(pErrorMessage) *pErrorMessage = "File not found \"" + sPath + "\".";
		return false;
	}

	if(!FileLoadString(sPath, &tmpstr, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading file \"" + sPath + "\". " + *pErrorMessage;
		return false;
	}

	if(!pNode->ParseHTML(tmpstr, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error parsing file \"" + sPath + "\". " + *pErrorMessage;
		return false;
	}

	return true;
}

bool LoadJSON(string sFileName, CWJSONObject* pObject, string* pErrorMessage)
{
	string input_string = "";
	if(!FileLoadString(sFileName, &input_string, 0, pErrorMessage))
		return false;

	if(!pObject->Parse(input_string, pErrorMessage))
		return false;

	return true;
}

bool LoadJSX(string sPath, CWNode* pNode, string* pErrorMessage)
{
	string tmpstr = "";
	if(!FileExists(sPath))
	{
		if(pErrorMessage) *pErrorMessage = "File not found \"" + sPath + "\".";
		return false;
	}

	if(!FileLoadString(sPath, &tmpstr, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading file \"" + sPath + "\". " + *pErrorMessage;
		return false;
	}

	if(!pNode->ParseJSX(tmpstr, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error parsing file \"" + sPath + "\". " + *pErrorMessage;
		return false;
	}

	return true;
}

void JSONArrayToStringList(CWJSONArray* pJSONArray, CWStringList* pList, bool bUnescape = false)
{
	pList->Clear();

	if(pJSONArray == NULL) return;

	int item_count = pJSONArray->Count();
	for(int i = 0; i < item_count; i++)
	{
		string str = pJSONArray->Items[i]->GetString();
		if(str != "")
		{
			if(bUnescape)
				pList->Add(UnescapeJSON(str));
			else
				pList->Add(str);
		}
	}
}

int FindFilePair(CWArray<CWFilePair*> *pList, string sSource, string sSourceContent, string sDest)
{
	int count = pList->Count();
	for(int i = 0; i < count; i++)
	{
		CWFilePair* pair = pList->Items[i];
		if((sSource != "" && pair->Source == sSource && pair->Dest == sDest) ||
			(sSourceContent != "" && pair->SourceContent == sSourceContent && pair->Dest == sDest))
			return i;
	}
	return -1;
}

// ---------------------------------------------------

CWInputItem::CWInputItem()
{
	Value = "";
	Title = "";
}

CWInputItem::~CWInputItem()
{

}

void CWInputItem::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "input_item", "");

	MetaAddMember(pMeta, "value", "Value", "string", "", "", true, "text", NULL);
	MetaAddMember(pMeta, "title", "Title", "string", "", "", true, "text", NULL);
}

// ---------------------------------------------------

CWHiddenField::CWHiddenField()
{
	Name = "";
	Value = "";
}

CWHiddenField::~CWHiddenField()
{
}

void CWHiddenField::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "hidden_field", "");

	MetaAddMember(pMeta, "name", "Name", "string", "", "", true, "text", NULL);
	MetaAddMember(pMeta, "value", "Value", "string", "", "", true, "text", NULL);
}

// ---------------------------------------------------

CWParam::CWParam()
{
	Name = "";
	Value = "";

	Type = jmtString;
}

CWParam::~CWParam()
{
}

void CWParam::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "param", "");

	MetaAddMember(pMeta, "name", "Name", "string", "", "", true, "text", NULL);
	MetaAddMember(pMeta, "value", "Value", "string", "", "", true, "text", NULL);
}

// ---------------------------------------------------


CWParams::CWParams(): CWArray<CWParam*>()
{
}

CWParams::~CWParams()
{
}

void CWParams::LoadFromJSONArray(CWJSONArray* pJSONArray)
{
	Clear();
	if(pJSONArray == NULL) return;

	int item_count = pJSONArray->Count();
	for(int i = 0; i < item_count; i++) {
		CWJSONObject* obj = pJSONArray->Items[i]->GetObject();
		if(obj != NULL)
		{
			CWParam* param = new CWParam();
			param->Name = obj->GetString("name");
			param->Value = obj->GetString("value");
			CWJSONValue *val = obj->Get("value");
			if(val != NULL)
				param->Type = val->Type;
			else
				param->Type = jmtString;

			Add(param);
		}
	}
}

void CWParams::SaveToJSONArray(CWJSONArray* pJSONArray)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
	{
		CWJSONObject* obj = new CWJSONObject();
		CWParam* param = Items[i];
		obj->SetString("name", param->Name);
		obj->SetString("value", param->Value);
		pJSONArray->AddObject(obj);
	}
}

string CWParams::AsString()
{
	string res = "";
	int count = Count();
	for(int i = 0; i < count; i++)
	{
		CWParam* param = Items[i];
		if(i > 0) res.append(", ");
		res.append(param->Name + ": " + param->Value);
	}
	return res;
}

CWParam* CWParams::GetParam(string sName)
{
	int param_count = Items.size();
	for(int i = 0; i < param_count; i++)
	{
		if(Items[i]->Name == sName)
			return Items[i];
	}
	return NULL;
}

// ---------------------------------------------------

CWVariable::CWVariable()
{
	Name = "";
	Value = "";
	QueryName = "";
}

CWVariable::~CWVariable()
{
}

void CWVariable::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "variable", "");

	MetaAddMember(pMeta, "name", "Name", "string", "", "", true, "text", NULL);
	MetaAddMember(pMeta, "value", "Value", "string", "", "", true, "text", NULL);
	MetaAddMember(pMeta, "query_name", "Query name", "string", "query_name", "", false, "select_query", NULL);
}

// ---------------------------------------------------


CWVariables::CWVariables(): CWArray<CWVariable*>()
{
}

CWVariables::~CWVariables()
{
}

void CWVariables::LoadFromJSONArray(CWJSONArray* pJSONArray)
{
	Clear();
	if(pJSONArray == NULL) return;

	int item_count = pJSONArray->Count();
	for(int i = 0; i < item_count; i++) {
		CWJSONObject* obj = pJSONArray->Items[i]->GetObject();
		if(obj != NULL)
		{
			CWVariable* variable = new CWVariable();
			variable->Name = obj->GetString("name");
			variable->Value = obj->GetString("value");
			variable->QueryName = obj->GetString("query_name");
			Add(variable);
		}
	}
}

void CWVariables::SaveToJSONArray(CWJSONArray* pJSONArray)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
	{
		CWJSONObject* obj = new CWJSONObject();
		CWVariable* variable = Items[i];
		obj->SetString("name", variable->Name);
		obj->SetString("value", variable->Value);
		obj->SetString("query_name", variable->QueryName);
		pJSONArray->AddObject(obj);
	}
}

CWVariable* CWVariables::GetVariable(string sName)
{
	int variable_count = Items.size();
	for(int i = 0; i < variable_count; i++)
	{
		if(Items[i]->Name == sName)
			return Items[i];
	}
	return NULL;
}

// ---------------------------------------------------

CWAction::CWAction()
{
	Name = "";
	Title = "";
	IconClass = "";
	Route = "";
	RouteParams = new CWParams();
	ActionCode = "";
	Rule = "";
}

CWAction::~CWAction()
{
}

void CWAction::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "action", "");

	MetaAddMember(pMeta, "name", "Name", "string", "", "", true, "text", NULL);
	MetaAddMember(pMeta, "title", "Title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "icon_class", "Icon class", "string", "", "", false, "text", NULL);
//	MetaAddMember(pMeta, "method_name", "Method name", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "route", "Route name", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "route_params", "Route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "action_code", "Action Code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "rule", "Rule", "string", "", "", false, "javascript", NULL);
}

// ---------------------------------------------------


CWActions::CWActions(): CWArray<CWAction*>()
{
}

CWActions::~CWActions()
{
}

void CWActions::LoadFromJSONArray(CWJSONArray* pJSONArray)
{
	Clear();
	if(pJSONArray == NULL) return;

	int item_count = pJSONArray->Count();
	for(int i = 0; i < item_count; i++) {
		CWJSONObject* obj = pJSONArray->Items[i]->GetObject();
		if(obj != NULL)
		{
			CWAction* action = new CWAction();

			action->Name = obj->GetString("name");
			action->Title = obj->GetString("title");
			action->IconClass = obj->GetString("icon_class");
			action->Route = obj->GetString("route");
			action->RouteParams->LoadFromJSONArray(obj->GetArray("route_params"));
			action->ActionCode = UnescapeJSON(obj->GetString("action_code"));
			action->Rule = UnescapeJSON(obj->GetString("rule"));

			Add(action);
		}
	}
}

void CWActions::SaveToJSONArray(CWJSONArray* pJSONArray)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
	{
		CWJSONObject* obj = new CWJSONObject();
		CWAction* action = Items[i];

		obj->SetString("name", action->Name);

		obj->SetString("title", action->Title);
		obj->SetString("icon_class", action->IconClass);
		obj->SetString("route", action->Route);
		CWJSONArray* tmp_array = new CWJSONArray();
		action->RouteParams->SaveToJSONArray(tmp_array);
		obj->SetArray("route_params", tmp_array);
		obj->SetString("action_code", action->ActionCode);
		obj->SetString("rule", action->Rule);

		pJSONArray->AddObject(obj);
	}
}

CWAction* CWActions::GetAction(string sName)
{
	int action_count = Items.size();
	for(int i = 0; i < action_count; i++)
	{
		if(Items[i]->Name == sName)
			return Items[i];
	}
	return NULL;
}

// ---------------------------------------------------

CWRoute::CWRoute()
{
	Route = "";
	URL = "";
	Title = "";
	ControllerName = "";
	Type = ztUnknown;
	Zoneless = false;
	Roles = new CWStringList();
}

CWRoute::~CWRoute()
{
	Clear();
	delete Roles;
}

void CWRoute::Clear()
{
	Route = "";
	URL = "";
	Title = "";
	ControllerName = "";
	Type = ztUnknown;
	Zoneless = false;
	Roles->Clear();
}


// ---------------------------------------------------
CWServerSideRoute::CWServerSideRoute(CWObject* pParent): CWObject(pParent)
{
	RouteParams = new CWStringList();
	Path = "";
	SourceFile = "";
	SourceContent = "";
}

CWServerSideRoute::~CWServerSideRoute()
{
	Clear();
	delete RouteParams;
}

void CWServerSideRoute::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "server_side_route", "object");

	MetaAddMember(pMeta, "route_params", "Route params", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "path", "Path", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "source_file", "Source file", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "source_content", "Source content", "string", "", "", false, "javascript", NULL);
}

void CWServerSideRoute::Clear()
{
	RouteParams->Clear();
	Path = "";
	SourceFile = "";
	SourceContent = "";
}

bool CWServerSideRoute::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	JSONArrayToStringList(pJSON->GetArray("route_params"), RouteParams);
	Path = pJSON->GetString("path");
	SourceFile = ConvertDirSeparator(pJSON->GetString("source_file"));
	SourceContent = UnescapeJSON(pJSON->GetString("source_content"));

	return true;
}

// ---------------------------------------------------

CWRouter::CWRouter(CWObject* pParent): CWObject(pParent)
{
	Map = new CWArray<CWRoute*>;
	Roles = new CWStringList();
	Config = new CWJSONObject();
}

void CWRouter::Clear()
{
	Map->Clear();
	Roles->Clear();
	Config->Clear();
}

CWRouter::~CWRouter()
{
	Clear();
	delete Config;
	delete Roles;
	delete Map;
}

void CWRouter::PublicRoutes(CWStringList* pRoutes)
{
	int map_count = Map->Count();
	for(int i = 0; i < map_count; i++)
	{
		CWRoute* map = Map->Items[i];
		if(map->Type == ztPublic && !map->Zoneless) pRoutes->Add(map->Route);
	}
}

void CWRouter::PrivateRoutes(CWStringList* pRoutes)
{
	int map_count = Map->Count();
	for(int i = 0; i < map_count; i++)
	{
		CWRoute* map = Map->Items[i];
		if(map->Type == ztPrivate && !map->Zoneless) pRoutes->Add(map->Route);
	}
}

void CWRouter::ZonelessRoutes(CWStringList* pRoutes)
{
	int map_count = Map->Count();
	for(int i = 0; i < map_count; i++)
	{
		CWRoute* map = Map->Items[i];
		if(map->Type == ztFree || map->Zoneless) pRoutes->Add(map->Route);
	}
}

string CWRouter::DefaultFreeRoute()
{
	CWApplication* app = App();
	if(app == NULL) {
		return "";
	}

	if(app->FreeZone != NULL) {
		return app->FreeZone->DefaultRoute;
	}
	
	return "";
}

string CWRouter::DefaultPublicRoute()
{
	CWApplication* app = App();
	if(app == NULL) {
		return "";
	}

	if(app->PublicZone != NULL) {
		return app->PublicZone->DefaultRoute;
	}
	
	return "";
}

string CWRouter::DefaultPrivateRoute()
{
	CWApplication* app = App();
	if(app == NULL) {
		return "";
	}

	if(app->PrivateZone != NULL) {
		return app->PrivateZone->DefaultRoute;
	}
	
	return "";
}

CWRoute* CWRouter::GetRoute(string sRouteName)
{
	int map_count = Map->Count();
	for(int i = 0; i < map_count; i++)
	{
		CWRoute* map = Map->Items[i];
		if(map->Route == sRouteName) return map;
	}
	return NULL;
}

CWRoute* CWRouter::GetPublicRoute(string sRouteName)
{
	CWRoute* map = GetRoute(sRouteName);
	if(map != NULL && map->Type == ztPublic) return map;
	return NULL;
}

CWRoute* CWRouter::GetPrivateRoute(string sRouteName)
{
	CWRoute* map = GetRoute(sRouteName);
	if(map != NULL && map->Type == ztPrivate) return map;
	return NULL;
}

CWRoute* CWRouter::GetFreeRoute(string sRouteName)
{
	CWRoute* map = GetRoute(sRouteName);
	if(map != NULL && map->Type == ztFree) return map;
	return NULL;
}

void CWRouter::GetRoleMap(string* pRoleMap, string* pPublicList, string* pPrivateList, string* pFreeList)
{
	CWStringList public_routes;
	CWStringList private_routes;
	CWStringList free_routes;

	PublicRoutes(&public_routes);
	PrivateRoutes(&private_routes);
	ZonelessRoutes(&free_routes);

	string role_map = "";
	int role_map_counter = 0;
	for(int i = 0; i < private_routes.Count(); i++)
	{
		string route_name = private_routes.Strings[i];
		CWRoute* map = GetRoute(route_name);
		if(map != NULL)
		{
			CWJSONArray role_list;
			role_list.AddStringList(map->Roles);

			if(role_list.Count() > 0)
			{
				if(role_map_counter > 0)
				{
					role_map.append(",");
					role_map.append(LINE_TERM);
					role_map.append("\t");
				}
				role_map.append("{ route: \"" + route_name + "\",\troles: " + role_list.Stringify(true, true, true) + " }");
				role_map_counter++;
			}
		}
	}

	for(int i = 0; i < free_routes.Count(); i++)
	{
		string route_name = free_routes.Strings[i];
		CWRoute* map = GetRoute(route_name);
		if(map != NULL)
		{
			CWJSONArray role_list;
			role_list.AddStringList(map->Roles);

			if(role_list.Count() > 0)
			{
				if(role_map_counter > 0)
				{
					role_map.append(",");
					role_map.append(LINE_TERM);
					role_map.append("\t");
				}
				role_map.append("{ route: \"" + route_name + "\",\troles: " + role_list.Stringify(true, true, true) + " }");
				role_map_counter++;
			}
		}
	}


	string public_list = "";
	for(int i = 0; i < public_routes.Count(); i++)
	{
		if(i > 0)
		{
			public_list.append(",");
			public_list.append(LINE_TERM);
			public_list.append("\t");
		}
		public_list.append("\"" + public_routes.Strings[i] + "\"");
	}

	string private_list = "";
	for(int i = 0; i < private_routes.Count(); i++)
	{
		if(i > 0)
		{
			private_list.append(",");
			private_list.append(LINE_TERM);
			private_list.append("\t");
		}
		private_list.append("\"" + private_routes.Strings[i] + "\"");
	}

	string free_list = "";
	for(int i = 0; i < free_routes.Count(); i++)
	{
		if(i > 0)
		{
			free_list.append(",");
			free_list.append(LINE_TERM);
			free_list.append("\t");
		}
		free_list.append("\"" + free_routes.Strings[i] + "\"");
	}

	if(pRoleMap != NULL) *pRoleMap = role_map;
	if(pPublicList != NULL) *pPublicList = public_list;
	if(pPrivateList != NULL) *pPrivateList = private_list;
	if(pFreeList != NULL) *pFreeList = free_list;
}

void CWRouter::GetHomeRoutes(string *pPublicHome, string* pPrivateHome, string* pFreeHome, string* pRootRoute)
{
	string free_home_route = "";
	if(free_home_route == "" && GetFreeRoute(DefaultFreeRoute()) != NULL) free_home_route = DefaultFreeRoute();
	if(free_home_route == "" && GetFreeRoute("home_free") != NULL) free_home_route = "home_free";
	if(free_home_route == "" && GetFreeRoute("home") != NULL) free_home_route = "home";	

	if(free_home_route == "") {
		CWStringList free_routes;
		ZonelessRoutes(&free_routes);
		if(free_routes.Count() > 0) {
			free_home_route = free_routes.Strings[0];
		}
	}

	string public_home_route = "";
	if(public_home_route == "" && GetPublicRoute(DefaultPublicRoute()) != NULL) public_home_route = DefaultPublicRoute();
	if(public_home_route == "" && GetFreeRoute(DefaultPublicRoute()) != NULL) public_home_route = DefaultPublicRoute();
	if(public_home_route == "" && GetPublicRoute("home_public") != NULL) public_home_route = "home_public";
	if(public_home_route == "" && GetPublicRoute("home") != NULL) public_home_route = "home";
	if(public_home_route == "" && GetFreeRoute(DefaultFreeRoute()) != NULL) public_home_route = DefaultFreeRoute();
	if(public_home_route == "" && GetFreeRoute("home_free") != NULL) public_home_route = "home_free";
	if(public_home_route == "" && GetFreeRoute("home") != NULL) public_home_route = "home";
//	if(public_home_route == "") public_home_route = free_home_route;

	string private_home_route = "";
	if(private_home_route == "" && GetPrivateRoute(DefaultPrivateRoute()) != NULL) private_home_route = DefaultPrivateRoute();
	if(private_home_route == "" && GetFreeRoute(DefaultPrivateRoute()) != NULL) private_home_route = DefaultPrivateRoute();
	if(private_home_route == "" && GetPrivateRoute("home_private") != NULL) private_home_route = "home_private";
	if(private_home_route == "" && GetPrivateRoute("home") != NULL) private_home_route = "home";
	if(private_home_route == "" && GetFreeRoute(DefaultFreeRoute()) != NULL) private_home_route = DefaultFreeRoute();
	if(private_home_route == "" && GetFreeRoute("home_free") != NULL) private_home_route = "home_free";
	if(private_home_route == "" && GetFreeRoute("home") != NULL) private_home_route = "home";
//	if(private_home_route == "") private_home_route = free_home_route;

	if(pPublicHome != NULL) *pPublicHome = public_home_route;
	if(pPrivateHome != NULL) *pPrivateHome = private_home_route;
	if(pFreeHome != NULL) *pFreeHome = free_home_route;
	if(pRootRoute != NULL) {
		if(public_home_route != "") {
			*pRootRoute = public_home_route;
		} else {
			*pRootRoute = free_home_route;
		}
	}
}

bool CWRouter::CreateIron(string* pClientJS, string* pServerJS, string* pErrorMessage)
{
	// role map
	string role_map = "";
	string public_list = "";
	string private_list = "";
	string free_list = "";
	GetRoleMap(&role_map, &public_list, &private_list, &free_list);

	ReplaceSubString(pClientJS, "/*ROLE_MAP*/", role_map);
	ReplaceSubString(pClientJS, "/*PUBLIC_ROUTES*/", public_list);
	ReplaceSubString(pClientJS, "/*PRIVATE_ROUTES*/", private_list);
	ReplaceSubString(pClientJS, "/*FREE_ROUTES*/", free_list);

	// home routes
	string public_home_route = "";
	string private_home_route = "";
	string free_home_route = "";
	GetHomeRoutes(&public_home_route, &private_home_route, &free_home_route, NULL);

	if(public_home_route == "" && GetPublicRoute("login") != NULL) public_home_route = "login";

	ReplaceSubString(pClientJS, "PUBLIC_HOME_ROUTE", public_home_route);
	ReplaceSubString(pClientJS, "PRIVATE_HOME_ROUTE", private_home_route);
	ReplaceSubString(pClientJS, "FREE_HOME_ROUTE", free_home_route);

	// router config
	CWJSONObject router_config;
	router_config.CopyFrom(Config);
	router_config.Merge(App()->RouterConfig);

	ReplaceSubString(pClientJS, "/*ROUTER_CONFIG*/", router_config.Stringify(false, true, true));

	// create client router map for each route
	int map_count = Map->Count();
	for(int i = 0; i < map_count; i++)
	{
		CWRoute* map = Map->Items[i];
		string route = LINE_TERM;
		route.append("\tthis.route(\"" + map->URL + "\", {name: \"" + map->Route + "\", title: \"" + EscapeJSON(map->Title) + "\", controller: \"" + map->ControllerName + "\"});");
		InsertBeforeSubString(pClientJS, "/*ROUTER_MAP*/", route);
	}

	// create server router map for each route
	int route_count = App()->ServerSideRoutes->Count();
	for(int i = 0; i < route_count; i++)
	{
		CWServerSideRoute* server_route = App()->ServerSideRoutes->Items[i];
		string route_name = server_route->Name;
		string route_path = server_route->Path;
		if(route_path == "") route_path = EnsureFirstChar(ReplaceSubString(route_name, ".", "/"), '/');

		int route_param_count = server_route->RouteParams->Count();
		for(int x = 0; x < route_param_count; x++)
		{
			route_path = EnsureLastChar(route_path, '/');
			route_path.append(":" + server_route->RouteParams->Strings[x]);
		}

		string route_var_name = ToCamelCase(ToCamelCase(route_name, '.', true), '_', true);
		string route_controller_name = route_var_name + "Controller";

		string route = LINE_TERM;
		route.append("\tthis.route(\"" + route_name + "\", {path: \"" + route_path + "\", controller: \"" + route_controller_name + "\", where: \"server\"});");

		// Map this route both to client and server (client needs that to make {{routeFor}} {{pathFor}} possible)
		InsertBeforeSubString(pServerJS, "/*ROUTER_MAP*/", route);
		InsertBeforeSubString(pClientJS, "/*ROUTER_MAP*/", route);

		// create server route controller
		string controller_js = "";
		string controller_js_source = App()->TemplateCodeDir + "controller_server.js";
		if(!FileLoadString(controller_js_source, &controller_js, 0, pErrorMessage))
		{
			if(pErrorMessage != NULL) *pErrorMessage = "Error reading file \"" + controller_js_source + "\". " + *pErrorMessage;
			return false;
		}

		string source = "";
		if(server_route->SourceFile != "")
		{
			string source_file = App()->InputDir + server_route->SourceFile;
			if(!FileExists(source_file))
			{
				if(pErrorMessage) *pErrorMessage = "Error: controller source file not found \"" + source_file + "\".";
				return false;
			}

			source_file = GetFullPath(source_file, pErrorMessage);
			if(source_file == "") return false;

			if(!FileLoadString(source_file, &source, 0, pErrorMessage))
			{
				if(pErrorMessage != NULL) *pErrorMessage = "Error reading file: \"" + source_file + "\".";
				return false;
			}
		}

		ReplaceSubString(&controller_js, "CONTROLLER_NAME", route_controller_name);
		ReplaceSubString(&controller_js, "/*ACTION_CODE*/", LINE_TERM + source);

		string controller_dir = App()->ServerRouterDir + AddDirSeparator(FromCamelCase(route_var_name, '_', true));

		if(!App()->MkDir(controller_dir, false, pErrorMessage))
			return false;

		string controller_filename = ChangeFileExt(FromCamelCase(route_controller_name, '_', true), ".js");
		string controller_js_dest = controller_dir + controller_filename;
		if(!App()->SaveString(controller_js_dest, &controller_js, 0, pErrorMessage))
		{
			if(pErrorMessage != NULL) *pErrorMessage = "Error writing controller \"" + controller_js_dest + "\".";
			return false;
		}
	}

	ReplaceSubString(pClientJS, "/*ROUTER_MAP*/", "");
	ReplaceSubString(pServerJS, "/*ROUTER_MAP*/", "");

	return true;
}

bool CWRouter::CreateFlow(string* pClientJS, string* pServerJS, string* pErrorMessage)
{
	string role_map = "";
	string public_list = "";
	string private_list = "";
	string free_list = "";
	GetRoleMap(&role_map, &public_list, &private_list, &free_list);

	ReplaceSubString(pClientJS, "/*ROLE_MAP*/", role_map);
	ReplaceSubString(pClientJS, "/*PUBLIC_ROUTES*/", public_list);
	ReplaceSubString(pClientJS, "/*PRIVATE_ROUTES*/", private_list);
	ReplaceSubString(pClientJS, "/*FREE_ROUTES*/", free_list);

	// home routes
	string public_home_route = "";
	string private_home_route = "";
	string free_home_route = "";
	GetHomeRoutes(&public_home_route, &private_home_route, &free_home_route, NULL);

	if(public_home_route == "" && GetPublicRoute("login") != NULL) public_home_route = "login";

	ReplaceSubString(pClientJS, "PUBLIC_HOME_ROUTE", public_home_route);
	ReplaceSubString(pClientJS, "PRIVATE_HOME_ROUTE", private_home_route);
	ReplaceSubString(pClientJS, "FREE_HOME_ROUTE", free_home_route);


	// server-side routes
	int route_count = App()->ServerSideRoutes->Count();
	if(route_count > 0)
	{
		string route_template = "";
		string route_template_path = App()->TemplateCodeDir + "route_server.js";
		if(!FileLoadString(route_template_path, &route_template, 0, pErrorMessage))
		{
			if(pErrorMessage != NULL) *pErrorMessage = "Error loading server route template. " + *pErrorMessage;
			return false;
		}

		for(int i = 0; i < route_count; i++)
		{
			string route_code = route_template;
			CWServerSideRoute* server_route = App()->ServerSideRoutes->Items[i];
			string route_name = server_route->Name;
			string route_path = server_route->Path;
			if(route_path == "") route_path = EnsureFirstChar(ReplaceSubString(route_name, ".", "/"), '/');

			int route_param_count = server_route->RouteParams->Count();
			for(int x = 0; x < route_param_count; x++)
			{
				route_path = EnsureLastChar(route_path, '/');
				route_path.append(":" + server_route->RouteParams->Strings[x]);
			}

			string route_var_name = ToCamelCase(ToCamelCase(route_name, '.', true), '_', true);

			string source = "";
			if(server_route->SourceFile != "")
			{
				string source_file = App()->InputDir + server_route->SourceFile;
				if(!FileExists(source_file))
				{
					if(pErrorMessage) *pErrorMessage = "Error: server-side route source file not found \"" + source_file + "\".";
					return false;
				}

				source_file = GetFullPath(source_file, pErrorMessage);
				if(source_file == "") return false;

				if(!FileLoadString(source_file, &source, 0, pErrorMessage))
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Error reading server-side route source file: \"" + source_file + "\".";
					return false;
				}
			} else {
				source = server_route->SourceContent;
			}

			ReplaceSubString(&route_code, "ROUTE_URL", route_path, true);
			ReplaceSubString(&route_code, "ROUTE_NAME", route_name, true);
			ReplaceSubString(&route_code, "ROUTE_VAR", route_var_name, true);
			ReplaceSubString(&route_code, "/*ACTION_FUNCTION*/", source, true);
			
			if(pServerJS != NULL)
			{
				pServerJS->append(LINE_TERM);
				pServerJS->append(route_code);
				pServerJS->append(LINE_TERM);
			}
		}
	}

	return true;
}

bool CWRouter::Create(string* pClientJS, string* pServerJS, string* pErrorMessage)
{
	string templating_name = App()->TemplatingName();

	if(templating_name == "blaze" && !CreateIron(pClientJS, pServerJS, pErrorMessage)) return false;
	if(templating_name == "react" && !CreateFlow(pClientJS, pServerJS, pErrorMessage)) return false;

	return true;
}

bool CWRouter::Prepare(string* pErrorMessage)
{
	Clear();

	if(App()->FreeZone != NULL) App()->FreeZone->GetAllRoutes(this);
	if(App()->PublicZone != NULL) App()->PublicZone->GetAllRoutes(this);
	if(App()->PrivateZone != NULL)
	{
		App()->PrivateZone->GetAllRoutes(this);
		if(!App()->PrivateZone->GetAllRoles(Roles, pErrorMessage))
			return false;
	}
	return true;
}

bool CWRouter::Generate(string* pErrorMessage)
{
	App()->Log("Creating router...");

	string templating_name = App()->TemplatingName();

	string router_server_source = App()->TemplateCodeDir + "router_server.js";
	string router_client_source = "";
	if(App()->UseAccounts)
		router_client_source = App()->TemplateCodeDir + "router_client_accounts.js";
	else
		router_client_source = App()->TemplateCodeDir + "router_client_simple.js";

	if(templating_name == "react") router_client_source = ChangeFileExt(router_client_source, ".jsx");

	// read client router template
	string router_client_js = "";
	if(!FileLoadString(router_client_source, &router_client_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading router template \"" + router_client_source + "\". " + *pErrorMessage;
		return false;
	}

	// read server router template
	string router_server_js = "";
	if(!FileLoadString(router_server_source, &router_server_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading router template \"" + router_server_source + "\". " + *pErrorMessage;
		return false;
	}

	// read router config
	string router_config_source = ChangeFileExt(router_client_source, ".json");
	if(!ParseJSONFile(router_config_source, Config, false, pErrorMessage))
		return false;

	if(!Create(&router_client_js, &router_server_js, pErrorMessage))
		return false;

	// write client router
	string router_client_dest = App()->ClientRouterDir + "router.js";
	if(templating_name == "react") router_client_dest = ChangeFileExt(router_client_dest, ".jsx");
	if(!App()->SaveString(router_client_dest, &router_client_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing router \"" + router_client_dest + "\". " + *pErrorMessage;
		return false;
	}

	// write server router
	string router_server_dest = App()->ServerRouterDir + "router.js";
	if(!App()->SaveString(router_server_dest, &router_server_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing router \"" + router_server_dest + "\". " + *pErrorMessage;
		return false;
	}

	return true;
}

// ---------------------------------------------------

CWObject::CWObject(CWObject* pParent)
{
	Parent = pParent;
	Clear();
}

CWObject::~CWObject()
{
	Clear();
}

void CWObject::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "object", "");

	MetaAddMember(pMeta, "name", "Name", "string", "object_name", "", true, "text", NULL);
}

CWApplication* CWObject::App()
{
	CWObject* parent = this;
	while(parent->Parent != NULL && dynamic_cast<CWApplication*>(parent) == NULL)
		parent = parent->Parent;

	return dynamic_cast<CWApplication*>(parent);
}

string CWObject::ObjectPath()
{
	string res = "";
	CWObject* parent = this;
	while(parent != NULL)
	{
		if(res == "")
			res = parent->Name;
		else
			res = parent->Name + "." + res;

		parent = parent->Parent;
	}
	return res;
}

void CWObject::Clear()
{
	Name = "";
}

bool CWObject::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	Clear();
	Name = FromCamelCase(Trim(pJSON->GetString("name")), '_', true);
	if(Name == "") Name = sDefaultName;

	if(Name == "")
	{
		if(pErrorMessage) *pErrorMessage = "Invalid input file structure: object must have a name.";
		return false;
	}
	return true;
}

bool CWObject::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	pJSON->SetString("name", Name);

	return true;
}

void CWObject::CopyFrom(CWObject* pObject)
{
	string msg = "";
	CWJSONObject obj;
	pObject->SaveToJSON(&obj, &msg);
	LoadFromJSON(&obj, "", &msg);
}

// ---------------------------------------------------

CWField::CWField(CWObject* pParent): CWObject(pParent)
{
	Title = "";
	Type = "";
	Default = "";
	Min = "";
	Max = "";
	Required = false;
	Searchable = true;
	Sortable = true;
	Exportable = true;
	Format = "";
	Input = "";
	InputTemplate = "";
	InputTemplateCode = "";
	InputGroupClass = "";
	InputControlClass = "";
	InputItems = new CWArray<CWInputItem*>;

	LookupQueryName = "";
	LookupQueryParams = new CWParams();
	LookupKey = "";
	LookupField = "";

	DisplayHelper = "";
	EditInline = false;

	ArrayItemType = "";
	CrudFields = new CWArray<CWField*>;
	CrudInsertTitle = "";

	FileCollection = "";
	FileContainer = "";

	JoinCollection = "";
	JoinCollectionField = "";
	JoinContainer = "";
	JoinFields = new CWStringList();

	ShowInDataview = true;
	ShowInInsertForm = true;
	ShowInUpdateForm = true;
	ShowInReadOnlyForm = true;

	RoleInBlog = "";
	// ---
	LookupSubscription = new CWSubscription();
}

CWField::~CWField()
{
	Clear();
	delete LookupSubscription;
	delete LookupQueryParams;
	delete CrudFields;
	delete InputItems;
	delete JoinFields;
}

void CWField::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "field", "object");

	CWStringList type_list;
	type_list.Add("string");
	type_list.Add("integer");
	type_list.Add("float");
	type_list.Add("date");
	type_list.Add("time");
	type_list.Add("bool");
	type_list.Add("array");
	type_list.Add("object");
	type_list.Add("email");

	CWStringList subtype_list;
	subtype_list.Assign(&type_list);
	subtype_list.Delete("array");
	subtype_list.Insert("", 0);

	CWStringList input_list;
	input_list.Add("text");
	input_list.Add("password");
	input_list.Add("datepicker");
	input_list.Add("read-only");
	input_list.Add("textarea");
	input_list.Add("radio");
	input_list.Add("checkbox");
	input_list.Add("select");
	input_list.Add("select-multiple");
	input_list.Add("tags");
	input_list.Add("crud");
	input_list.Add("file");
	input_list.Add("custom");

	CWStringList blog_role_list;
	blog_role_list.Add("");
	blog_role_list.Add("title");
	blog_role_list.Add("subtitle");
	blog_role_list.Add("text");
	blog_role_list.Add("date");

	MetaAddMember(pMeta, "title", "Title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "type", "Type", "string", "", "string", true, "select", &type_list);
	MetaAddMember(pMeta, "default", "Default value", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "min", "Min. value", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "max", "Max. value", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "required", "Required", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "format", "Format", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "searchable", "Searchable", "bool", "", "true", false, "checkbox", NULL);
	MetaAddMember(pMeta, "sortable", "Sortable", "bool", "", "true", false, "checkbox", NULL);
	MetaAddMember(pMeta, "exportable", "Exportable", "bool", "", "true", false, "checkbox", NULL);
	MetaAddMember(pMeta, "input", "Input", "string", "", "text", false, "select", &input_list);
	MetaAddMember(pMeta, "input_template", "Input template", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "input_template_code", "Input template code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "input_group_class", "Input group class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "input_control_class", "Input control class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "input_items", "Input items", "array", "input_item", "", false, "", NULL);
	MetaAddMember(pMeta, "lookup_query_name", "Lookup query name", "string", "query_name", "", false, "select_query", NULL);
	MetaAddMember(pMeta, "lookup_query_params", "Lookup query params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "lookup_key", "Lookup value field", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "lookup_field", "Lookup title field", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "display_helper", "Display helper", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "edit_inline", "Edit inline", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "array_item_type", "Array item type", "string", "", "", false, "select", &subtype_list);
	MetaAddMember(pMeta, "crud_fields", "CRUD input fields", "array", "field", "", false, "", NULL);
	MetaAddMember(pMeta, "crud_insert_title", "CRUD insert title", "string", "", "", false, "text", NULL);

	MetaAddMember(pMeta, "file_collection", "File collection", "string", "collection_name", "", false, "select_collection", NULL);
	MetaAddMember(pMeta, "file_container", "File container field", "string", "", "", false, "text", NULL);

	MetaAddMember(pMeta, "join_collection", "Join collection", "string", "collection_name", "", false, "select_collection", NULL);
	MetaAddMember(pMeta, "join_collection_field", "Join collection field", "string", "", "", false, "", NULL);
	MetaAddMember(pMeta, "join_container", "Join container field", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "join_fields", "Join fields", "array", "string", "", false, "stringlist", NULL);

	MetaAddMember(pMeta, "show_in_dataview", "Show in dataviews", "bool", "", "true", false, "checkbox", NULL);
	MetaAddMember(pMeta, "show_in_insert_form", "Show in insert forms", "bool", "", "true", false, "checkbox", NULL);
	MetaAddMember(pMeta, "show_in_update_form", "Show in update forms", "bool", "", "true", false, "checkbox", NULL);
	MetaAddMember(pMeta, "show_in_read_only_form", "Show in read-only forms", "bool", "", "true", false, "checkbox", NULL);

	MetaAddMember(pMeta, "role_in_blog", "Role in Blog", "string", "", "", false, "select", &blog_role_list);
}

void CWField::GetSimpleSchema(CWJSONObject* pSchema)
{
	pSchema->Clear();

	if(Title != "") pSchema->SetString("label", Title);

	// --- type
	string type = Type;
	bool type_array = false;
	if(StrCmpi(type, "array") == 0)
	{
		type = ArrayItemType;
		type_array = true;
	}

	if(type == "" || StrCmpi(type, "string") == 0) pSchema->SetString("type", "String");

	if(StrCmpi(type, "bool") == 0) pSchema->SetString("type", "Boolean");

	if(StrCmpi(type, "integer") == 0) pSchema->SetString("type", "Number");

	if(StrCmpi(type, "float") == 0)
	{
		pSchema->SetString("type", "Number");
		pSchema->SetBool("decimal", true);
	}

	if(StrCmpi(type, "date") == 0) pSchema->SetString("type", "Date");

	if(StrCmpi(type, "time") == 0) pSchema->SetString("type", "Number");

	if(StrCmpi(type, "array") == 0) pSchema->SetString("type", "Array");

	if(StrCmpi(type, "object") == 0 || StrCmpi(type, "file") == 0)
	{
		pSchema->SetString("type", "Object");
		pSchema->SetBool("blackbox", true);
	}

	if(StrCmpi(type, "email") == 0)
	{
		pSchema->SetString("type", "String");
		pSchema->SetString("regEx", "SimpleSchema.RegEx.Email");
	}

	if(type_array) pSchema->SetString("type", "[" + pSchema->GetString("type") + "]");
	// ---

	if(!Required) pSchema->SetBool("optional", true);

	// put this into function - the same transformation needed for min/max
	if(Default != "")
	{
		if(StrCmpi(Type, "string") == 0) pSchema->SetString("defaultValue", Default);
		if(StrCmpi(Type, "integer") == 0) pSchema->SetInteger("defaultValue", StrToInt(Default));
		if(StrCmpi(Type, "float") == 0) pSchema->SetInteger("defaultValue", StrToFloat(Default));
//		if(StrCmpi(Type, "date") == 0) ???
//		if(StrCmpi(Type, "time") == 0) ???
//		if(StrCmpi(Type, "array") == 0) ???
//		if(StrCmpi(Type, "email") == 0) ???
	}

	if(Min != "")
	{
		if(StrCmpi(Type, "string") == 0) pSchema->SetString("min", Min);
		if(StrCmpi(Type, "integer") == 0) pSchema->SetInteger("min", StrToInt(Min));
		if(StrCmpi(Type, "float") == 0) pSchema->SetInteger("min", StrToFloat(Min));
//		if(StrCmpi(Type, "date") == 0) ???
//		if(StrCmpi(Type, "time") == 0) ???
//		if(StrCmpi(Type, "array") == 0) ???
//		if(StrCmpi(Type, "email") == 0) ???
	}

	if(Max != "")
	{
		if(StrCmpi(Type, "string") == 0) pSchema->SetString("max", Max);
		if(StrCmpi(Type, "integer") == 0) pSchema->SetInteger("max", StrToInt(Max));
		if(StrCmpi(Type, "float") == 0) pSchema->SetInteger("max", StrToFloat(Max));
//		if(StrCmpi(Type, "date") == 0) ???
//		if(StrCmpi(Type, "time") == 0) ???
//		if(StrCmpi(Type, "array") == 0) ???
//		if(StrCmpi(Type, "email") == 0) ???
	}
}

CWSubscription* CWField::GetLookupSubscription()
{
	if(LookupSubscription->Name != "") return LookupSubscription;
	return NULL;
}

CWQuery* CWField::GetLookupQuery()
{
	CWSubscription* subscription = GetLookupSubscription();
	if(subscription == NULL) return NULL;
	return App()->GetQuery(subscription->Name);
}

string CWField::GetLookupQueryName()
{
	CWQuery* query = GetLookupQuery();
	if(query == NULL) return "";
	return query->Name;
}

void CWField::Clear()
{
	CWObject::Clear();
	Title = "";
	Type = "";
	Default = "";
	Min = "";
	Max = "";
	Required = false;
	Searchable = true;
	Sortable = true;
	Exportable = true;
	Format = "";
	Input = "";
	InputTemplate = "";
	InputTemplateCode = "";
	InputGroupClass = "";
	InputControlClass = "";
	InputItems->Clear();
	LookupQueryName = "";
	LookupQueryParams->Clear();
	LookupKey = "";
	LookupField = "";
	DisplayHelper = "";
	EditInline = false;
	ArrayItemType = "";
	CrudFields->Clear();
	CrudInsertTitle = "";

	FileCollection = "";
	FileContainer = "";

	JoinCollection = "";
	JoinCollectionField = "";
	JoinContainer = "";
	JoinFields->Clear();

	ShowInDataview = true;
	ShowInInsertForm = true;
	ShowInUpdateForm = true;
	ShowInReadOnlyForm = true;

	RoleInBlog = "";
	// ---
	LookupSubscription->Clear();
}

bool CWField::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	// read name again but don't convert from camel case
	Name = pJSON->GetString("name");

	Title = pJSON->GetString("title");
	Type = FromCamelCase(pJSON->GetString("type"), '_', true);
	Default = pJSON->GetString("default");
	Min = pJSON->GetString("min");
	Max = pJSON->GetString("max");
	Required = pJSON->GetBool("required");
	Searchable = pJSON->HasMember("searchable") ? pJSON->GetBool("searchable") : true;
	Sortable = pJSON->HasMember("sortable") ? pJSON->GetBool("sortable") : true;
	Exportable = pJSON->HasMember("exportable") ? pJSON->GetBool("exportable") : true;
	Format = pJSON->GetString("format");

	Input = pJSON->GetString("input");
	InputGroupClass = pJSON->GetString("input_group_class");
	InputControlClass = pJSON->GetString("input_control_class");
	InputTemplate = pJSON->GetString("input_template");
	InputTemplateCode = UnescapeJSON(pJSON->GetString("input_template_code"));

	CWJSONArray* input_items = pJSON->GetArray("input_items");
	if(input_items != NULL)
	{
		int input_items_count = input_items->Count();
		for(int i = 0; i < input_items_count; i++)
		{
			CWJSONObject* input_item = input_items->Items[i]->GetObject();
			if(input_item != NULL)
			{
				CWInputItem* field_item = new CWInputItem();
				field_item->Value = input_item->GetString("value");
				field_item->Title = input_item->GetString("title");
				InputItems->Add(field_item);
			}
			else
			{
				string input_item = input_items->Items[i]->GetString();
				if(input_item != "")
				{
					CWInputItem* field_item = new CWInputItem();
					field_item->Value = input_item;
					field_item->Title = input_item;
					InputItems->Add(field_item);
				}
			}
		}
	}

	CWJSONObject* lookup_query = pJSON->GetObject("lookup_query");
	if(lookup_query != NULL && lookup_query->GetString("name") != "")
	{
		// ------
		// this block is for backward compatibility with pre-0.9.48 - remove in future versions
		App()->Warning("Object \"" + Name + "\" contains deprecated property \"lookup_query\". Please move lookup_query definition into \"application.queries\" array and set this object's \"lookup_query_name\" and \"lookup_query_params\".");


		LookupQueryName = lookup_query->GetString("name");
		LookupQueryParams->LoadFromJSONArray(lookup_query->GetArray("params"));

		LookupSubscription->Name = lookup_query->GetString("name");
		LookupSubscription->Params->LoadFromJSONArray(lookup_query->GetArray("params"));

		if(App()->GetQuery(LookupQueryName) == NULL)
		{
			CWQuery* qry = new CWQuery(App());
			if(!qry->LoadFromJSON(lookup_query, "", pErrorMessage))
				return false;
			App()->Queries->Add(qry);
		}
		// ------
	}
	else
	{
		LookupQueryName = FromCamelCase(pJSON->GetString("lookup_query_name"), '_', true);
		LookupQueryParams->LoadFromJSONArray(pJSON->GetArray("lookup_query_params"));

		LookupSubscription->Name = FromCamelCase(pJSON->GetString("lookup_query_name"), '_', true);
		LookupSubscription->Params->LoadFromJSONArray(pJSON->GetArray("lookup_query_params"));
	}

	LookupKey = pJSON->GetString("lookup_key");
	LookupField = pJSON->GetString("lookup_field");
	DisplayHelper = pJSON->GetString("display_helper");
	EditInline = pJSON->GetBool("edit_inline");

	ArrayItemType = pJSON->GetString("array_item_type");
	CrudInsertTitle = pJSON->GetString("crud_insert_title");

	// load fields
	CWJSONArray* fields = pJSON->GetArray("crud_fields");
	if(fields)
	{
		int fields_count = fields->Count();
		for(int i = 0; i < fields_count; i++)
		{
			CWJSONObject* field = fields->Items[i]->GetObject();
			if(field != NULL)
			{
				CWField* obj = new CWField(this);
				if(!obj->LoadFromJSON(field, "", pErrorMessage))
				{
					delete obj;
					return false;
				}
				CrudFields->Add(obj);
			}
		}
	}

	FileCollection = FromCamelCase(pJSON->GetString("file_collection"), '_', true);
	FileContainer = pJSON->GetString("file_container");

	JoinCollection = FromCamelCase(pJSON->GetString("join_collection"), '_', true);
	JoinCollectionField = pJSON->GetString("join_collection_field");
	JoinContainer = pJSON->GetString("join_container");
	JSONArrayToStringList(pJSON->GetArray("join_fields"), JoinFields);

	ShowInDataview = pJSON->HasMember("show_in_dataview") ? pJSON->GetBool("show_in_dataview") : true;
	ShowInInsertForm = pJSON->HasMember("show_in_insert_form") ? pJSON->GetBool("show_in_insert_form") : true;
	ShowInUpdateForm = pJSON->HasMember("show_in_update_form") ? pJSON->GetBool("show_in_update_form") : true;
	ShowInReadOnlyForm = pJSON->HasMember("show_in_read_only_form") ? pJSON->GetBool("show_in_read_only_form") : true;

	RoleInBlog = pJSON->GetString("role_in_blog");

	return true;
}

// ---------------------------------------------------

CWCollection::CWCollection(CWObject* pParent): CWObject(pParent)
{
	Type = "";

	Fields = new CWArray<CWField*>;

	OwnerField = "";

	RolesAllowedToRead = new CWStringList();
	RolesAllowedToInsert = new CWStringList();
	RolesAllowedToUpdate = new CWStringList();
	RolesAllowedToDelete = new CWStringList();
	RolesAllowedToDownload = new CWStringList();

	UpdateRule = "";
	DeleteRule = "";

	StorageAdapters = new CWStringList();
	StorageAdapterOptions = new CWJSONObject();

	BeforeInsertCode = "";
	BeforeUpdateCode = "";
	BeforeRemoveCode = "";

	AfterInsertCode = "";
	AfterUpdateCode = "";
	AfterRemoveCode = "";

	BeforeInsertSourceFile = "";
	BeforeUpdateSourceFile = "";
	BeforeRemoveSourceFile = "";

	AfterInsertSourceFile = "";
	AfterUpdateSourceFile = "";
	AfterRemoveSourceFile = "";
	// ---

	OriginalName = "";
}

CWCollection::~CWCollection()
{
	Clear();
	delete Fields;

	delete StorageAdapterOptions;
	delete StorageAdapters;

	delete RolesAllowedToDownload;
	delete RolesAllowedToDelete;
	delete RolesAllowedToUpdate;
	delete RolesAllowedToInsert;
	delete RolesAllowedToRead;
	// ---
}

void CWCollection::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "collection", "object");

	CWStringList type_list;
	type_list.Add("collection");
	type_list.Add("file_collection");
	type_list.Add("bigchaindb");

	CWStringList storage_adapters_list;
	storage_adapters_list.Add("gridfs");
	storage_adapters_list.Add("filesystem");
	storage_adapters_list.Add("s3");
	storage_adapters_list.Add("dropbox");

	MetaAddMember(pMeta, "type", "Type", "string", "", "collection", true, "select", &type_list);
	MetaAddMember(pMeta, "storage_adapters", "Storage adapters", "array", "string", "", false, "stringlist", &storage_adapters_list);
	MetaAddMember(pMeta, "storage_adapter_options", "Storage adapter options", "string", "", "", false, "json", NULL);

	MetaAddMember(pMeta, "fields", "Fields", "array", "field", "", false, "", NULL);

	MetaAddMember(pMeta, "owner_field", "Owner field", "string", "", "", false, "text", NULL);

	MetaAddMember(pMeta, "roles_allowed_to_read", "Roles allowed to Read", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "roles_allowed_to_insert", "Roles allowed to Insert", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "roles_allowed_to_update", "Roles allowed to Update", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "roles_allowed_to_delete", "Roles allowed to Delete", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "roles_allowed_to_download", "Roles allowed to Download", "array", "string", "", false, "stringlist", NULL);

	MetaAddMember(pMeta, "update_rule", "Update rule", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "delete_rule", "Delete rule", "string", "", "", false, "javascript", NULL);

	MetaAddMember(pMeta, "before_insert_code", "Before insert code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "before_update_code", "Before update code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "before_remove_code", "Before remove code", "string", "", "", false, "javascript", NULL);

	MetaAddMember(pMeta, "after_insert_code", "After insert code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "after_update_code", "After update code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "after_remove_code", "After remove code", "string", "", "", false, "javascript", NULL);

	MetaAddMember(pMeta, "before_insert_source_file", "Before insert source file", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "before_update_source_file", "Before update source file", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "before_remove_source_file", "Before remove source file", "string", "", "", false, "text", NULL);

	MetaAddMember(pMeta, "after_insert_source_file", "After insert source file", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "after_update_source_file", "After update source file", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "after_remove_source_file", "After remove source file", "string", "", "", false, "text", NULL);
}

void CWCollection::GetSimpleSchema(CWJSONObject* pSchema)
{
	pSchema->Clear();
	int field_count = Fields->Count();
	for(int i = 0; i < field_count; i++)
	{
        CWField* field = Fields->Items[i];
        CWJSONObject* field_schema = new CWJSONObject();
        field->GetSimpleSchema(field_schema);
        pSchema->SetObject(field->Name, field_schema);
	}
}

void CWCollection::Clear()
{
	CWObject::Clear();

	Type = "";

	Fields->Clear();

	OwnerField = "";

	RolesAllowedToRead->Clear();
	RolesAllowedToInsert->Clear();
	RolesAllowedToUpdate->Clear();
	RolesAllowedToDelete->Clear();
	RolesAllowedToDownload->Clear();

	UpdateRule = "";
	DeleteRule = "";

	StorageAdapters->Clear();
	StorageAdapterOptions->Clear();

	BeforeInsertCode = "";
	BeforeUpdateCode = "";
	BeforeRemoveCode = "";

	AfterInsertCode = "";
	AfterUpdateCode = "";
	AfterRemoveCode = "";

	BeforeInsertSourceFile = "";
	BeforeUpdateSourceFile = "";
	BeforeRemoveSourceFile = "";

	AfterInsertSourceFile = "";
	AfterUpdateSourceFile = "";
	AfterRemoveSourceFile = "";

	OriginalName = "";
}

bool CWCollection::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Type = pJSON->GetString("type");

	// load fields
	CWJSONArray* fields = pJSON->GetArray("fields");
	if(fields)
	{
		int fields_count = fields->Count();
		for(int i = 0; i < fields_count; i++)
		{
			CWJSONObject* field = fields->Items[i]->GetObject();
			if(field != NULL)
			{
				CWField* obj = new CWField(this);
				if(!obj->LoadFromJSON(field, "", pErrorMessage))
				{
					delete obj;
					return false;
				}
				Fields->Add(obj);
			}
		}
	}

	OwnerField = pJSON->GetString("owner_field");

	JSONArrayToStringList(pJSON->GetArray("roles_allowed_to_read"), RolesAllowedToRead);
	JSONArrayToStringList(pJSON->GetArray("roles_allowed_to_insert"), RolesAllowedToInsert);
	JSONArrayToStringList(pJSON->GetArray("roles_allowed_to_update"), RolesAllowedToUpdate);
	JSONArrayToStringList(pJSON->GetArray("roles_allowed_to_delete"), RolesAllowedToDelete);
	JSONArrayToStringList(pJSON->GetArray("roles_allowed_to_download"), RolesAllowedToDownload);

	UpdateRule = UnescapeJSON(pJSON->GetString("update_rule"));
	DeleteRule = UnescapeJSON(pJSON->GetString("delete_rule"));

	JSONArrayToStringList(pJSON->GetArray("storage_adapters"), StorageAdapters);

	CWJSONObject* adapter_options_object = pJSON->GetObject("storage_adapter_options");
	if(adapter_options_object == NULL) {
		adapter_options_object = new CWJSONObject();
		string adapter_options_string = UnescapeJSON(pJSON->GetString("storage_adapter_options"));
		if(adapter_options_string != "") {
			if(!adapter_options_object->Parse(adapter_options_string, pErrorMessage)) {
				if(pErrorMessage != NULL) *pErrorMessage = "Error parsing collection \"" + Name + "\" storage_adapter_options string. " + *pErrorMessage; 
				return false;
			}
		}
		StorageAdapterOptions->CopyFrom(adapter_options_object);
		delete adapter_options_object;
	} else {
		StorageAdapterOptions->CopyFrom(adapter_options_object);
	}

	// ---
	// backward compatibility - remove in the future
	if(pJSON->GetBool("read_owner_only") && RolesAllowedToRead->Find("owner") < 0)
	{
		RolesAllowedToRead->Add("owner");
	}

	if(pJSON->GetBool("write_owner_only") && RolesAllowedToUpdate->Find("owner") < 0)
	{
		RolesAllowedToUpdate->Add("owner");
		RolesAllowedToDelete->Add("owner");
	}
	//
	// ---

	BeforeInsertCode = UnescapeJSON(pJSON->GetString("before_insert_code"));
	BeforeUpdateCode = UnescapeJSON(pJSON->GetString("before_update_code"));
	BeforeRemoveCode = UnescapeJSON(pJSON->GetString("before_remove_code"));

	AfterInsertCode = UnescapeJSON(pJSON->GetString("after_insert_code"));
	AfterUpdateCode = UnescapeJSON(pJSON->GetString("after_update_code"));
	AfterRemoveCode = UnescapeJSON(pJSON->GetString("after_remove_code"));

	BeforeInsertSourceFile = ConvertDirSeparator(pJSON->GetString("before_insert_source_file"));
	BeforeUpdateSourceFile = ConvertDirSeparator(pJSON->GetString("before_update_source_file"));
	BeforeRemoveSourceFile = ConvertDirSeparator(pJSON->GetString("before_remove_source_file"));

	AfterInsertSourceFile = ConvertDirSeparator(pJSON->GetString("after_insert_source_file"));
	AfterUpdateSourceFile = ConvertDirSeparator(pJSON->GetString("after_update_source_file"));
	AfterRemoveSourceFile = ConvertDirSeparator(pJSON->GetString("after_remove_source_file"));

	OriginalName = pJSON->GetString("name");

	return true;
}

string CWCollection::GetOriginalName()
{
	string original_name = OriginalName;
	if(original_name == "") original_name = Name;
	return OriginalName;
}

string CWCollection::Variable()
{
	return ToCamelCase(Name, '_', true);
}

string CWCollection::InsertMethodName()
{
	return ToCamelCase(Name, '_', false) + "Insert";
}

string CWCollection::UpdateMethodName()
{
	return ToCamelCase(Name, '_', false) + "Update";
}

string CWCollection::RemoveMethodName()
{
	return ToCamelCase(Name, '_', false) + "Remove";
}

bool CWCollection::Create(string* pErrorMessage)
{
	App()->Log("Creating collection \"" + Name + "\"...");

	string original_name = GetOriginalName();

	string type = ToLowerCase(Type);
	if(type == "") type = "collection";
	if(type != "collection" && type != "file_collection" && type != "bigchaindb")
	{
		if(pErrorMessage) *pErrorMessage = "Collection \"" + Name + "\" is of unknown type \"" + type + "\".";
		return false;
	}

	// check roles
	CWStringList used_roles;
	used_roles.Merge(RolesAllowedToRead);
	used_roles.Merge(RolesAllowedToInsert);
	used_roles.Merge(RolesAllowedToUpdate);
	used_roles.Merge(RolesAllowedToDelete);
	used_roles.Merge(RolesAllowedToDownload);
	int role_count = used_roles.Count();
	for(int i = 0; i < role_count; i++)
	{
		if(App()->Roles->Find(used_roles.Strings[i]) < 0 && used_roles.Strings[i] != "nobody" && used_roles.Strings[i] != "owner")
		{
			if(pErrorMessage) *pErrorMessage = "Collection \"" + Name + "\" references non-existing role \"" + used_roles.Strings[i] + "\". Please add this role to application.roles array.";
			return false;
		}
	}

	string owner_field = OwnerField;
	if(owner_field == "") owner_field = "createdBy";

	string insert_rule = "";
	string update_rule = UpdateRule;
	string remove_rule = DeleteRule;
	string download_rule = "";
	if(RolesAllowedToInsert->Count() > 0)
	{
		if(RolesAllowedToInsert->Find("nobody") >= 0)
			insert_rule = "false";
		else
		{
			if(insert_rule != "") insert_rule.append(" && ");
			CWJSONArray allowed_roles;
			allowed_roles.AddStringList(RolesAllowedToInsert);
			allowed_roles.DeleteString("owner");
			insert_rule.append("Users.isInRoles(userId, " + allowed_roles.Stringify(true, true, true) + ")");
		}
	}

	if(RolesAllowedToUpdate->Count() > 0)
	{
		if(RolesAllowedToUpdate->Find("nobody") >= 0)
			update_rule = "false";
		else
		{
			CWJSONArray allowed_roles;
			allowed_roles.AddStringList(RolesAllowedToUpdate);
			// role "owner"
			if(allowed_roles.FindString("owner") >= 0)
			{
				allowed_roles.DeleteString("owner");

				if(update_rule != "") update_rule.append(" && ");

				if(allowed_roles.Count() > 0)
				{
					update_rule.append("userId && (doc." + owner_field + " == userId");
					update_rule.append(" || ");
					update_rule.append("Users.isInRoles(userId, " + allowed_roles.Stringify(true, true, true) + ")");
					update_rule.append(")");
				}
				else
					update_rule.append("userId && doc." + owner_field + " == userId");
			}
			else
			{
				if(allowed_roles.Count() > 0)
				{
					if(update_rule != "") update_rule.append(" && ");
					update_rule.append("userId");
					update_rule.append(" && ");
					update_rule.append("Users.isInRoles(userId, " + allowed_roles.Stringify(true, true, true) + ")");
				}
			}
		}
	}

	if(RolesAllowedToDelete->Count() > 0)
	{
		if(RolesAllowedToDelete->Find("nobody") >= 0)
			remove_rule = "false";
		else
		{
			CWJSONArray allowed_roles;
			allowed_roles.AddStringList(RolesAllowedToDelete);

			// role "owner"
			if(allowed_roles.FindString("owner") >= 0)
			{
				allowed_roles.DeleteString("owner");

				if(remove_rule != "") remove_rule.append(" && ");

				if(allowed_roles.Count() > 0)
				{
					remove_rule.append("userId && (doc." + owner_field + " == userId");
					remove_rule.append(" || ");
					remove_rule.append("Users.isInRoles(userId, " + allowed_roles.Stringify(true, true, true) + ")");
					remove_rule.append(")");
				}
				else
					remove_rule.append("userId && doc." + owner_field + " == userId");
			}
			else
			{
				if(allowed_roles.Count() > 0)
				{
					if(remove_rule != "") remove_rule.append(" && ");
					remove_rule.append("userId");
					remove_rule.append(" && ");
					remove_rule.append("Users.isInRoles(userId, " + allowed_roles.Stringify(true, true, true) + ")");
				}
			}
		}
	}

	if(RolesAllowedToDownload->Count() > 0)
	{
		if(RolesAllowedToDownload->Find("nobody") >= 0)
			download_rule = "false";
		else
		{
			CWJSONArray allowed_roles;
			allowed_roles.AddStringList(RolesAllowedToDownload);

			// role "owner"
			if(allowed_roles.FindString("owner") >= 0)
			{
				allowed_roles.DeleteString("owner");

				if(download_rule != "") download_rule.append(" && ");

				if(allowed_roles.Count() > 0)
				{
					download_rule.append("userId && (doc." + owner_field + " == userId");
					download_rule.append(" || ");
					download_rule.append("Users.isInRoles(userId, " + allowed_roles.Stringify(true, true, true) + ")");
					download_rule.append(")");
				}
				else
					download_rule.append("userId && doc." + owner_field + " == userId");
			}
			else
			{
				if(allowed_roles.Count() > 0)
				{
					if(download_rule != "") download_rule.append(" && ");
					download_rule.append("userId");
					download_rule.append(" && ");
					download_rule.append("Users.isInRoles(userId, " + allowed_roles.Stringify(true, true, true) + ")");
				}
			}
		}
	}

	if(insert_rule == "") insert_rule = "true";
	if(update_rule == "") update_rule = "true";
	if(remove_rule == "") remove_rule = "true";
	if(download_rule == "") download_rule = "true";

	// ---
	// shared code
	string shared_js_dest = App()->BothCollectionsDir + ChangeFileExt(Name, ".js");
	string shared_js_dest_relative = App()->RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(shared_js_dest, App()->OutputDir, ""), '/'), true);
	string shared_js_import = "";
	if(Name == "users") {
		shared_js_import = "import {Users} from \"meteor-user-roles\";";
	} else {
		shared_js_import = "import {" + Variable() + "} from \"" + shared_js_dest_relative + "\";";
	}
	CWStringList shared_js_imports;
	if(type == "bigchaindb") {
	} else {
		shared_js_imports.SetText("import {Mongo} from \"meteor/mongo\";");
	}

	string shared_js = "";
	string shared_js_source = "";
	if(type == "collection") {
		if(App()->UseCollection2) {
			shared_js_source = App()->TemplateCodeDir + "collection_collection2_shared.js";
		} else {
			shared_js_source = App()->TemplateCodeDir + "collection_shared.js";
		}
	}
	if(type == "file_collection") {
		shared_js_source = App()->TemplateCodeDir + "collection_fs_shared.js";
	}

	if(type == "bigchaindb") {
		shared_js_source = App()->TemplateCodeDir + "collection_bigchaindb_shared.js";
	}

	if(!FileLoadString(shared_js_source, &shared_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading file \"" + shared_js_source + "\". " + *pErrorMessage;
		return false;
	}

	if(type == "file_collection")
	{
		string fs_store_list = "";

		CWStringList adapters;
		adapters.Assign(StorageAdapters);
		if(StorageAdapterOptions->GetObject("gridfs") != NULL && adapters.Find("gridfs") < 0) adapters.Add("gridfs");
		if(StorageAdapterOptions->GetObject("filesystem") != NULL && adapters.Find("filesystem") < 0) adapters.Add("filesystem");
		if(StorageAdapterOptions->GetObject("s3") != NULL && adapters.Find("s3") < 0) adapters.Add("s3");
		if(StorageAdapterOptions->GetObject("dropbox") != NULL && adapters.Find("dropbox") < 0) adapters.Add("dropbox");

		int adapter_count = adapters.Count();
		if(adapter_count == 0)
		{
			if(fs_store_list != "") fs_store_list.append(", ");
			fs_store_list.append("new FS.Store.GridFS(\"" + original_name + "\", {})");
		}
		else
		{
			for(int x = 0; x < adapter_count; x++)
			{
				string adapter_name = adapters.Strings[x];
				if(adapter_name == "gridfs")
				{
					if(fs_store_list != "") fs_store_list.append(", ");
					string opt_str = "{}";
					CWJSONObject* opts = StorageAdapterOptions->GetObject("gridfs");
					if(opts != NULL) opt_str = opts->Stringify(false, true, true, false);
					fs_store_list.append("new FS.Store.GridFS(\"" + original_name + "\", " + opt_str + ")");
				}
				if(adapter_name == "filesystem")
				{
					if(fs_store_list != "") fs_store_list.append(", ");
					string opt_str = "{}";
					CWJSONObject* opts = StorageAdapterOptions->GetObject("filesystem");
					if(opts != NULL) opt_str = opts->Stringify(false, true, true, false);
					fs_store_list.append("new FS.Store.FileSystem(\"" + original_name + "\", " + opt_str + ")");
				}
				if(adapter_name == "s3")
				{
					if(fs_store_list != "") fs_store_list.append(", ");
					string opt_str = "{}";
					CWJSONObject* opts = StorageAdapterOptions->GetObject("s3");
					if(opts != NULL) opt_str = opts->Stringify(false, true, true, false);
					fs_store_list.append("new FS.Store.S3(\"" + original_name + "\", " + opt_str + ")");
				}
				if(adapter_name == "dropbox")
				{
					if(fs_store_list != "") fs_store_list.append(", ");
					string opt_str = "{}";
					CWJSONObject* opts = StorageAdapterOptions->GetObject("dropbox");
					if(opts != NULL) opt_str = opts->Stringify(false, true, true, false);
					fs_store_list.append("new FS.Store.Dropbox(\"" + original_name + "\", " + opt_str + ")");
				}
			}
		}
		ReplaceSubString(&shared_js, "FS_STORE_LIST", fs_store_list, true);
	}

	// collection2
	if(App()->UseCollection2 && type != "file_collection")
	{
		string schema_js = "";
		string schema_js_source = App()->TemplateCodeDir + "collection_shared_schema.js";
		if(!FileLoadString(schema_js_source, &schema_js, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file \"" + schema_js_source + "\". " + *pErrorMessage;
			return false;
		}

		CWJSONObject simple_schema;
		GetSimpleSchema(&simple_schema);
		ReplaceSubString(&schema_js, "SIMPLE_SCHEMA", simple_schema.Stringify(false, true, true, true));

		shared_js.append(LINE_TERM);
		shared_js.append(schema_js);

		shared_js_imports.Add("import SimpleSchema from \"simpl-schema\";");
	}

	ReplaceSubString(&shared_js, "COLLECTION_NAME", original_name);
	ReplaceSubString(&shared_js, "COLLECTION_VARIABLE", Variable());
	ReplaceSubString(&shared_js, "COLLECTION_VAR", Variable()); // deprecated, remove in (near) future
	ReplaceSubString(&shared_js, "COLLECTION_INSERT_METHOD", InsertMethodName());
	ReplaceSubString(&shared_js, "COLLECTION_UPDATE_METHOD", UpdateMethodName());
	ReplaceSubString(&shared_js, "COLLECTION_REMOVE_METHOD", RemoveMethodName());

	ReplaceSubString(&shared_js, "INSERT_RULE", insert_rule);
	ReplaceSubString(&shared_js, "UPDATE_RULE", update_rule);
	ReplaceSubString(&shared_js, "REMOVE_RULE", remove_rule);
	ReplaceSubString(&shared_js, "DOWNLOAD_RULE", download_rule);

	CWStringList shared_auto_imports;
	App()->GetCollectionImportsForFile(shared_js, &shared_auto_imports, true);

	shared_js_imports.Merge(&shared_auto_imports);
	ReplaceSubString(&shared_js, "/*IMPORTS*/", shared_js_imports.GetText());

	if(Name != "users") {
		if(!App()->SaveString(shared_js_dest, &shared_js, 0, pErrorMessage))
			return false;
	}	
	// ---

	// ---
	// server methods code
	string methods_js = "";
	string methods_js_source = "";
	if(type == "file_collection") {
		methods_js_source = App()->TemplateCodeDir + "collection_fs_methods.js";
	} else {
		methods_js_source = App()->TemplateCodeDir + "collection_methods.js";
	}

	if(!FileLoadString(methods_js_source, &methods_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading file \"" + methods_js_source + "\". " + *pErrorMessage;
		return false;
	}

	CWStringList methods_js_imports;
	methods_js_imports.SetText(shared_js_import);

	CWStringList methods_auto_imports;
	App()->GetCollectionImportsForFile(methods_js, &methods_auto_imports, false);

	methods_js_imports.Merge(&methods_auto_imports);
	ReplaceSubString(&methods_js, "/*IMPORTS*/", methods_js_imports.GetText());

	ReplaceSubString(&methods_js, "INSERT_METHOD_NAME", InsertMethodName());
	ReplaceSubString(&methods_js, "UPDATE_METHOD_NAME", UpdateMethodName());
	ReplaceSubString(&methods_js, "REMOVE_METHOD_NAME", RemoveMethodName());
	ReplaceSubString(&methods_js, "COLLECTION_VARIABLE", Variable());

	string methods_js_dest = App()->ServerMethodsDir + ChangeFileExt(Name, ".js");
	if(Name != "users") {
		if(!App()->SaveString(methods_js_dest, &methods_js, 0, pErrorMessage))
			return false;
	}
	// ---

	// ---
	// server code
	string server_js = "";
	string server_js_source = "";
	if(type == "file_collection")
		server_js_source = App()->TemplateCodeDir + "collection_fs_server.js";
	else
		server_js_source = App()->TemplateCodeDir + "collection_server.js";

	if(!FileLoadString(server_js_source, &server_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading file \"" + server_js_source + "\". " + *pErrorMessage;
		return false;
	}

	if(type != "file_collection")
	{
		string server_hooks_js = "";
		string server_hooks_js_source = App()->TemplateCodeDir + "collection_server_hooks.js";
		if(!FileLoadString(server_hooks_js_source, &server_hooks_js, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file \"" + server_hooks_js_source + "\". " + *pErrorMessage;
			return false;
		}
		server_js.append(LINE_TERM);
		server_js.append(server_hooks_js);
	}

	ReplaceSubString(&server_js, "COLLECTION_NAME", original_name);
	ReplaceSubString(&server_js, "COLLECTION_VARIABLE", Variable());
	ReplaceSubString(&server_js, "COLLECTION_INSERT_METHOD", InsertMethodName());
	ReplaceSubString(&server_js, "COLLECTION_UPDATE_METHOD", UpdateMethodName());
	ReplaceSubString(&server_js, "COLLECTION_REMOVE_METHOD", RemoveMethodName());
	ReplaceSubString(&server_js, "COLLECTION_VAR", Variable()); // deprecated, remove in (near) future

	ReplaceSubString(&server_js, "INSERT_RULE", insert_rule);
	ReplaceSubString(&server_js, "UPDATE_RULE", update_rule);
	ReplaceSubString(&server_js, "REMOVE_RULE", remove_rule);

	// --- before insert hook
	string before_insert_code = "";
	if(owner_field != "")
	{
		before_insert_code.append(LINE_TERM);
		before_insert_code.append("\tif(!doc." + owner_field + ") doc." + owner_field + " = userId;");
	}

	if(BeforeInsertCode != "")
	{
		before_insert_code.append(LINE_TERM);
		before_insert_code.append(BeforeInsertCode);
	}

	if(BeforeInsertSourceFile != "")
	{
		string before_insert_source_file = App()->InputDir + BeforeInsertSourceFile;
		if(!FileExists(before_insert_source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: before insert source file not found \"" + before_insert_source_file + "\".";
			return false;
		}

		before_insert_source_file = GetFullPath(before_insert_source_file, pErrorMessage);
		if(before_insert_source_file == "") return false;

		string tmp_source = "";
		if(!FileLoadString(before_insert_source_file, &tmp_source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + before_insert_source_file + "\".";
			return false;
		}

		before_insert_code.append(LINE_TERM);
		before_insert_code.append(tmp_source);
	}
	// ---

	// --- before update hook
	string before_update_code = "";
	if(BeforeUpdateCode != "") before_update_code = LINE_TERM + BeforeUpdateCode;
	if(BeforeUpdateSourceFile != "")
	{
		string before_update_source_file = App()->InputDir + BeforeUpdateSourceFile;
		if(!FileExists(before_update_source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: before update source file not found \"" + before_update_source_file + "\".";
			return false;
		}

		before_update_source_file = GetFullPath(before_update_source_file, pErrorMessage);
		if(before_update_source_file == "") return false;

		string tmp_source = "";
		if(!FileLoadString(before_update_source_file, &tmp_source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + before_update_source_file + "\".";
			return false;
		}

		before_update_code.append(LINE_TERM);
		before_update_code.append(tmp_source);
	}
	// ---

	// --- before remove hook
	string before_remove_code = "";
	if(BeforeRemoveCode != "") before_remove_code = LINE_TERM + BeforeRemoveCode;
	if(BeforeRemoveSourceFile != "")
	{
		string before_remove_source_file = App()->InputDir + BeforeRemoveSourceFile;
		if(!FileExists(before_remove_source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: before remove source file not found \"" + before_remove_source_file + "\".";
			return false;
		}

		before_remove_source_file = GetFullPath(before_remove_source_file, pErrorMessage);
		if(before_remove_source_file == "") return false;

		string tmp_source = "";
		if(!FileLoadString(before_remove_source_file, &tmp_source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + before_remove_source_file + "\".";
			return false;
		}

		before_remove_code.append(LINE_TERM);
		before_remove_code.append(tmp_source);
	}
	// ---

	// --- after insert hook
	string after_insert_code = "";
	if(AfterInsertCode != "")
	{
		after_insert_code.append(LINE_TERM);
		after_insert_code.append(AfterInsertCode);
	}

	if(AfterInsertSourceFile != "")
	{
		string after_insert_source_file = App()->InputDir + AfterInsertSourceFile;
		if(!FileExists(after_insert_source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: after insert source file not found \"" + after_insert_source_file + "\".";
			return false;
		}

		after_insert_source_file = GetFullPath(after_insert_source_file, pErrorMessage);
		if(after_insert_source_file == "") return false;

		string tmp_source = "";
		if(!FileLoadString(after_insert_source_file, &tmp_source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + after_insert_source_file + "\".";
			return false;
		}

		after_insert_code.append(LINE_TERM);
		after_insert_code.append(tmp_source);
	}
	// ---

	// --- after update hook
	string after_update_code = "";
	if(AfterUpdateCode != "") after_update_code = LINE_TERM + AfterUpdateCode;
	if(AfterUpdateSourceFile != "")
	{
		string after_update_source_file = App()->InputDir + AfterUpdateSourceFile;
		if(!FileExists(after_update_source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: after update source file not found \"" + after_update_source_file + "\".";
			return false;
		}

		after_update_source_file = GetFullPath(after_update_source_file, pErrorMessage);
		if(after_update_source_file == "") return false;

		string tmp_source = "";
		if(!FileLoadString(after_update_source_file, &tmp_source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + after_update_source_file + "\".";
			return false;
		}

		after_update_code.append(LINE_TERM);
		after_update_code.append(tmp_source);
	}
	// ---

	// --- after remove hook
	string after_remove_code = "";
	if(AfterRemoveCode != "") after_remove_code = LINE_TERM + AfterRemoveCode;
	if(AfterRemoveSourceFile != "")
	{
		string after_remove_source_file = App()->InputDir + AfterRemoveSourceFile;
		if(!FileExists(after_remove_source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: after remove source file not found \"" + after_remove_source_file + "\".";
			return false;
		}

		after_remove_source_file = GetFullPath(after_remove_source_file, pErrorMessage);
		if(after_remove_source_file == "") return false;

		string tmp_source = "";
		if(!FileLoadString(after_remove_source_file, &tmp_source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + after_remove_source_file + "\".";
			return false;
		}

		after_remove_code.append(LINE_TERM);
		after_remove_code.append(tmp_source);
	}
	// ---


	ReplaceSubString(&server_js, "/*BEFORE_INSERT_CODE*/", before_insert_code);
	ReplaceSubString(&server_js, "/*BEFORE_UPDATE_CODE*/", before_update_code);
	ReplaceSubString(&server_js, "/*BEFORE_REMOVE_CODE*/", before_remove_code);

	ReplaceSubString(&server_js, "/*AFTER_INSERT_CODE*/", after_insert_code);
	ReplaceSubString(&server_js, "/*AFTER_UPDATE_CODE*/", after_update_code);
	ReplaceSubString(&server_js, "/*AFTER_REMOVE_CODE*/", after_remove_code);

//	InsertBeforeSubString(&server_js, "/*IMPORTS*/", shared_js_import);

	CWStringList server_js_imports;
	server_js_imports.SetText(shared_js_import);

	CWStringList server_auto_imports;
	App()->GetCollectionImportsForFile(server_js, &server_auto_imports, false);

	server_js_imports.Merge(&server_auto_imports);
	ReplaceSubString(&server_js, "/*IMPORTS*/", server_js_imports.GetText());

	string server_js_dest = App()->ServerCollectionsRulesDir + ChangeFileExt(Name, ".js");
	if(Name != "users") {
		if(!App()->SaveString(server_js_dest, &server_js, 0, pErrorMessage))
			return false;
	}

	// ---
	// publish code
	string publish_js = "";
	string publish_js_source = App()->TemplateCodeDir + "collection_publish.js";
	CWStringList shared_imports;

	if(!FileLoadString(publish_js_source, &publish_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading file \"" + publish_js_source + "\". " + *pErrorMessage;
		return false;
	}

	int query_count = App()->Queries->Count();
	for(int i = 0; i < query_count; i++)
	{
		CWQuery* query = App()->Queries->Items[i];
		if(query->Collection == Name)
		{
			if(Name != "users" || (query->Name != "current_user_data" && query->Name != "admin_users" && query->Name != "admin_users_paged" && query->Name != "admin_user")) {
				string find_function = "";
				string publication = "";
				string export_method = "";

				if(!query->ServerFindFunction(&find_function, &publication, &export_method, &shared_imports, true, pErrorMessage)) {
					return false;
				}

				publish_js.append(publication);
				publish_js.append(LINE_TERM);

				if(query->UsedByDataview) {
					publish_js.append(export_method);
					publish_js.append(LINE_TERM);
				}
			}
		}
	}

	CWStringList publish_js_imports;
	publish_js_imports.SetText(shared_js_import);

	CWStringList publish_auto_imports;
	App()->GetCollectionImportsForFile(publish_js, &publish_auto_imports, false);

	publish_js_imports.Merge(&publish_auto_imports);
	ReplaceSubString(&publish_js, "/*IMPORTS*/", publish_js_imports.GetText());


	string publish_js_dest = App()->ServerPublishDir + ChangeFileExt(Name, ".js");
	if(!App()->SaveString(publish_js_dest, &publish_js, 0, pErrorMessage))
		return false;

	// ---

	return true;
}

// ---------------------------------------------------

CWQuery::CWQuery(CWObject* pParent): CWObject(pParent)
{
	Collection = "";
	FindOne = false;
	Filter = new CWJSONObject();
	Options = new CWJSONObject();
	RelatedQueries = new CWSubscriptions();
	Variables = new CWVariables();
	// ---
	UsedByDataview = false;
	SpecialParams = new CWStringList();
}

CWQuery::~CWQuery()
{
	Clear();
	delete Variables;
	delete RelatedQueries;
	delete Options;
	delete Filter;
	// ---
	delete SpecialParams;
}

void CWQuery::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "query", "object");

	MetaAddMember(pMeta, "collection", "Collection name", "string", "collection_name", "", true, "select_collection", NULL);
	MetaAddMember(pMeta, "find_one", "FindOne", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "filter", "Filter", "string", "", "", false, "json", NULL);
	MetaAddMember(pMeta, "options", "Options", "string", "", "", false, "json", NULL);
	MetaAddMember(pMeta, "related_queries", "Related queries", "array", "subscription", "", false, "", NULL);
	MetaAddMember(pMeta, "variables", "Variables", "array", "variable", "", false, "", NULL);
}

void CWQuery::Clear()
{
	CWObject::Clear();
	Collection = "";
	FindOne = false;
	Filter->Clear();
	Options->Clear();
	RelatedQueries->Clear();
	Variables->Clear();
	// ---
	UsedByDataview = false;
	SpecialParams->Clear();
}

bool CWQuery::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Collection = FromCamelCase(pJSON->GetString("collection"), '_', true);
	FindOne = pJSON->GetBool("find_one");

	CWJSONObject* filter_object = pJSON->GetObject("filter");
	if(filter_object == NULL) {
		filter_object = new CWJSONObject();
		string filter_string = UnescapeJSON(pJSON->GetString("filter"));
		if(filter_string != "") {
			if(!filter_object->Parse(filter_string, pErrorMessage)) {
				if(pErrorMessage != NULL) *pErrorMessage = "Error parsing query \"" + Name + "\" filter string. " + *pErrorMessage; 
				return false;
			}
		}
		Filter->CopyFrom(filter_object);
		delete filter_object;
	} else {
		Filter->CopyFrom(filter_object);
	}

	CWJSONObject* options_object = pJSON->GetObject("options");
	if(options_object == NULL) {
		options_object = new CWJSONObject();
		string options_string = UnescapeJSON(pJSON->GetString("options"));
		if(options_string != "") {
			if(!options_object->Parse(options_string, pErrorMessage)) {
				if(pErrorMessage != NULL) *pErrorMessage = "Error parsing query \"" + Name + "\" options string. " + *pErrorMessage;
				return false;
			}
		}
		Options->CopyFrom(options_object);
		delete options_object;
	} else {
		Options->CopyFrom(options_object);
	}

	CWJSONArray* related_queries = pJSON->GetArray("related_queries");
	if(related_queries != NULL && !RelatedQueries->LoadFromJSON(related_queries, pErrorMessage))
		return false;

	Variables->LoadFromJSONArray(pJSON->GetArray("variables"));

	return true;
}

bool CWQuery::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	if(!CWObject::SaveToJSON(pJSON, pErrorMessage))
		return false;

	pJSON->SetString("collection", Collection);
	pJSON->SetBool("find_one", FindOne);
	CWJSONObject* filter = new CWJSONObject();
	filter->CopyFrom(Filter);
	pJSON->SetObject("filter", filter);
	CWJSONObject* options = new CWJSONObject();
	options->CopyFrom(Options);
	pJSON->SetObject("options", options);

	CWJSONArray* related_queries = new CWJSONArray();
	if(!RelatedQueries->SaveToJSON(related_queries, pErrorMessage)) {
		return false;
	}

	CWJSONArray* variables = new CWJSONArray();
	Variables->SaveToJSONArray(variables);
	pJSON->SetArray("variables", variables);

	return true;
}

void CWQuery::ExtractParams(CWStringList* pList)
{
	pList->Clear();

	CWStringList filter_params;
	Filter->ExtractStrings(&filter_params);

	CWStringList option_params;
	Options->ExtractStrings(&option_params);

	CWStringList params;
	params.Merge(&filter_params);
	params.Merge(&option_params);

	int count = params.Count();
	for(int i = 0; i < count; i++)
	{
		string param = params.Strings[i];
		if(param != "") {
			if(param[0] == ':' || param[0] == '#') {
				string param_name = param.erase(0, 1);
				pList->Add(param_name);
			}
		}
	}

	CWStringList query_vars;
	ExtractVars(&query_vars);
	int var_count = query_vars.Count();
	for(int i = 0; i < var_count; i++) {
		string var_name = query_vars.Strings[i];
		string var_value = "null";
		CWVariable* variable = Variables->GetVariable(var_name);
		if(variable != NULL) {
			CWQuery* ext_query = App()->GetQuery(variable->QueryName);
			if(ext_query != NULL) {
				CWStringList ext_params;
				ext_query->ExtractParams(&ext_params);
				pList->Merge(&ext_params, true);
			}
		}
	}
}

void CWQuery::ExtractVars(CWStringList* pList)
{
	pList->Clear();

	CWStringList filter_vars;
	Filter->ExtractStrings(&filter_vars);

	CWStringList option_vars;
	Options->ExtractStrings(&option_vars);

	CWStringList vars;
	vars.Merge(&filter_vars);
	vars.Merge(&option_vars);

	int count = vars.Count();
	for(int i = 0; i < count; i++)
	{
		string var = vars.Strings[i];
		if(var != "") {
			if(var[0] == '%') {
				string var_name = var.erase(0, 1);
				pList->Add(var_name);
			}
		}
	}	
}


bool CWQuery::Matches(CWQuery* pQuery)
{
	if(Name != pQuery->Name) return false;
	if(Collection != pQuery->Collection) return false;
	if(FindOne != pQuery->FindOne) return false;

	string filter1 = Filter->Stringify(true);
	string filter2 = pQuery->Filter->Stringify(true);
	if(filter1 != filter2) return false;

	string options1 = Options->Stringify(true);
	string options2 = pQuery->Options->Stringify(true);
	if(options1 != options2) return false;

	return true;
}

bool CWQuery::ClientFindFunction(CWParams* pSubscriptionParams, string* pResult, CWStringList* pParamVars, CWStringList* pCollectionIncludes, string* pErrorMessage)
{
	string params_path = "";
	string extra_var = "";
	if(App()->TemplatingName() == "blaze") {
		params_path = "this.params";
		extra_var = "this." + ToCamelCase(Name, '_', false) + "ExtraParams";
	}
	if(App()->TemplatingName() == "react") {
		params_path = "props.routeParams";
		extra_var = ToCamelCase(Name, '_', false) + "ExtraParams";
	}

	string collection_name = Collection;
	string collection_var = "";

	if(collection_name == "users")
	{
		collection_var = "Users";
	}
	else
	{
		CWCollection* collection = App()->GetCollection(collection_name);
		if(collection == NULL)
		{
			if(pErrorMessage) *pErrorMessage = "Query \"" + Name + "\": collection \"" + collection_name + "\" not found.";
			return false;
		}
		collection_var = collection->Variable();
	}

	string query_filter = Filter->Stringify(true, true, true);
	string query_options = Options->Stringify(true, true, true);

	CWStringList query_params;
	ExtractParams(&query_params);
	int param_count = query_params.Count();
	for(int x = 0; x < param_count; x++)
	{
		string param_name = query_params.Strings[x];

		CWParam* query_param = pSubscriptionParams->GetParam(param_name);
		if(query_param != NULL)
		{
			CWJSONValue val;
			val.Set(query_param->Value, query_param->Type);
			string v = "";
			if(pParamVars->Count() > 0) v = "\t\t";

			string param_value = val.Stringify(true, "", true, true);
			if(App()->TemplatingName() == "react") {
				ReplaceSubString(&param_value, "this.params", "props.routeParams");
			}
			v.append("var " + param_name + " = " + EnsureLastChar(param_value, ';'));
			pParamVars->Add(v);

			ReplaceSubString(&query_filter, "\":" + param_name + "\"", param_name);
			ReplaceSubString(&query_options, "\":" + param_name + "\"", param_name);

			if(query_param->Type == jmtInteger)
			{
				ReplaceSubString(&query_filter, "\"#" + param_name + "\"", param_name);
				ReplaceSubString(&query_options, "\"#" + param_name + "\"", param_name);
			}
			else
			{
				ReplaceSubString(&query_filter, "\"#" + param_name + "\"", "parseInt(" + param_name + ")");
				ReplaceSubString(&query_options, "\"#" + param_name + "\"", "parseInt(" + param_name + ")");
			}
		}
		else
		{
			ReplaceSubString(&query_filter, "\":" + param_name + "\"", params_path + "." + param_name);
			ReplaceSubString(&query_options, "\":" + param_name + "\"", params_path + "." + param_name);

			ReplaceSubString(&query_filter, "\"#" + param_name + "\"", "parseInt(" + params_path + "." + param_name + ")");
			ReplaceSubString(&query_options, "\"#" + param_name + "\"", "parseInt(" + params_path + "." + param_name + ")");
		}

	}
	
	CWStringList query_vars;
	ExtractVars(&query_vars);
	int var_count = query_vars.Count();
	for(int i = 0; i < var_count; i++) {
		string var_name = query_vars.Strings[i];
		string var_value = "null";
		CWVariable* variable = Variables->GetVariable(var_name);
		if(variable != NULL) {
			CWQuery* ext_query = App()->GetQuery(variable->QueryName);
			if(ext_query == NULL) {
				var_value = UnescapeJSON(variable->Value);
			} else {
				CWStringList tmp_param_vars;
				if(!ext_query->ClientFindFunction(pSubscriptionParams, &var_value, &tmp_param_vars, pCollectionIncludes, pErrorMessage)) {
					return false;
				}

				if(ext_query->FindOne) {
					if(variable->Value != "") {
						string ext_query_var = ToCamelCase(var_name + "_obj", '_', false);

						string v = "";
						if(pParamVars->Count() > 0) v = "\t\t";
						v.append("var " + ext_query_var + " = " + EnsureLastChar(var_value, ';'));
						pParamVars->Add(v);

						var_value = "objectUtils.getPropertyValue(\"" + variable->Value + "\", " + ext_query_var + ")";
					}
				} else {
					var_value = var_value + ".fetch()";
					if(variable->Value != "") {
						var_value = var_value + ".map(function(tmp) { return tmp[\"" + variable->Value + "\"]; })";
					}
				}
			}
		}

		string v = "";
		if(pParamVars->Count() > 0) v = "\t\t";
		v.append("var " + var_name + " = " + EnsureLastChar(var_value, ';'));
		pParamVars->Add(v);

		ReplaceSubString(&query_filter, "\"%" + var_name + "\"", var_name);
		ReplaceSubString(&query_options, "\"%" + var_name + "\"", var_name);
	}

	ReplaceSubString(&query_filter, "\"Meteor.userId()\"", "Meteor.userId()");
	ReplaceSubString(&query_options, "\"Meteor.userId()\"", "Meteor.userId()");

	string find_function = "find";
	if(FindOne)
		find_function = "findOne";

	if(UsedByDataview) {
		*pResult = collection_var + "." + find_function + "(databaseUtils.extendFilter(" + query_filter + ", " + extra_var + "), databaseUtils.extendOptions(" + query_options + ", " + extra_var + "))";
	} else {
		*pResult = collection_var + "." + find_function + "(" + query_filter + ", " + query_options + ")";
	}

	if(pCollectionIncludes != NULL) {
		if(collection_name != "users")
		{
			string shared_js_dest = App()->BothCollectionsDir + ChangeFileExt(collection_name, ".js");
			string shared_js_dest_relative = App()->RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(shared_js_dest, App()->OutputDir, ""), '/'), true);
			string shared_js_import = "import {" + collection_var + "} from \"" + shared_js_dest_relative + "\";";
			if(pCollectionIncludes->Find(shared_js_import) < 0)
				pCollectionIncludes->Add(shared_js_import);
		}
		else
		{
			string import_users = "import {" + collection_var + "} from \"meteor-user-roles\";";
			if(pCollectionIncludes->Find(import_users) < 0)
				pCollectionIncludes->Add(import_users);
		}
	}

	return true;
}

// ---------------------------------------------------

bool CWQuery::ServerFindFunction(string* pResult, string* pPublish, string* pExportMethod, CWStringList* pCollectionIncludes, bool bUseExtraOptions, string* pErrorMessage)
{
	bool extra_options = UsedByDataview && bUseExtraOptions;
	

	string publish_js = "";
	publish_js.append("Meteor.publish(\"" + Name + "\", function(");

	string export_js = "";
	export_js.append("Meteor.methods({");
	export_js.append(LINE_TERM);
	export_js.append("\t\"" + ToCamelCase(Name + "_export", '_', false) + "\": function(");

	string count_js = "";
	count_js.append("Meteor.publish(\"" + Name + "_count\", function(");


	CWJSONObject tmp_filter_a;
	CWJSONObject tmp_filter_b;

	tmp_filter_a.CopyFrom(Filter);
	tmp_filter_b.CopyFrom(Filter);

	CWCollection* collection = App()->GetCollection(Collection);

	string owner_field = "";
	CWStringList roles_allowed_to_read;
	bool has_joins = false;
	string collection_var = "";

	if(collection != NULL) {
		owner_field = collection->OwnerField;
		roles_allowed_to_read.Append(collection->RolesAllowedToRead);

		for(int i = 0; i < collection->Fields->Count(); i++)
			if(collection->Fields->Items[i]->JoinCollection != "" || collection->Fields->Items[i]->JoinCollectionField != "" || collection->Fields->Items[i]->FileCollection != "")
				has_joins = true;

		collection_var = collection->Variable();
	}
	if(owner_field == "") owner_field = "createdBy";

	bool read_owner_only = roles_allowed_to_read.Find("owner") >= 0;

	// restrict read to owner's documents only
	if(read_owner_only)
	{
		tmp_filter_b.SetString(owner_field, "this.userId");
		roles_allowed_to_read.Delete("owner");
	}

	string query_filter_a = tmp_filter_a.Stringify(true, true, true);
	string query_filter_b = tmp_filter_b.Stringify(true, true, true);
	string query_options = Options->Stringify(true, true, true);

	bool need_current_user = false;
	
	if(FindSubString(&query_filter_a, "Meteor.user()") >= 0) {
		ReplaceSubString(&query_filter_a, "Meteor.user()", "currentUser");
		need_current_user = true;
	}

	if(FindSubString(&query_filter_b, "Meteor.user()") >= 0) {
		ReplaceSubString(&query_filter_b, "Meteor.user()", "currentUser");
		need_current_user = true;
	}

	ReplaceSubString(&query_filter_a, "Meteor.userId()", "this.userId");
	ReplaceSubString(&query_filter_b, "Meteor.userId()", "this.userId");
	ReplaceSubString(&query_options, "Meteor.userId()", "this.userId");

	ReplaceSubString(&query_filter_a, "\"this.userId\"", "this.userId");
	ReplaceSubString(&query_filter_b, "\"this.userId\"", "this.userId");
	ReplaceSubString(&query_options, "\"this.userId\"", "this.userId");

	CWStringList query_params;
	ExtractParams(&query_params);

	int query_params_count = query_params.Count();
	for(int x = 0; x < query_params_count; x++)
	{
		string param_name = query_params.Strings[x];
		if(x > 0) {
			publish_js.append(", ");
			export_js.append(", ");
			count_js.append(", ");
		}

		publish_js.append(param_name);
		export_js.append(param_name);
		count_js.append(param_name);

		string correct_param_name = param_name;
		string special_param = SpecialParams->GetValue(param_name);
		if(special_param != "") {
			correct_param_name = special_param;
		}

		ReplaceSubString(&query_filter_a, "\":" + param_name + "\"", correct_param_name);
		ReplaceSubString(&query_filter_a, "\"#" + param_name + "\"", "parseInt(" + correct_param_name + ")");

		ReplaceSubString(&query_filter_b, "\":" + param_name + "\"", correct_param_name);
		ReplaceSubString(&query_filter_b, "\"#" + param_name + "\"", "parseInt(" + correct_param_name + ")");

		ReplaceSubString(&query_options, "\":" + param_name + "\"", correct_param_name);
		ReplaceSubString(&query_options, "\"#" + param_name + "\"", "parseInt(" + correct_param_name + ")");
	}
	
	if(extra_options) {
		if(query_params_count > 0) {
			publish_js.append(", ");
			export_js.append(", ");
			count_js.append(", ");
		}
		
		publish_js.append("extraOptions");
		export_js.append("extraOptions");
		count_js.append("extraOptions");
	}

	publish_js.append(") {");
	publish_js.append(LINE_TERM);

	if(query_params_count > 0 || extra_options) {
		export_js.append(", ");
	}
	export_js.append("exportFields, fileType");
	export_js.append(") {");
	export_js.append(LINE_TERM);

	count_js.append(") {");
	count_js.append(LINE_TERM);

	if(extra_options) {
		publish_js.append("\textraOptions.doSkip = true;");
		publish_js.append(LINE_TERM);

		export_js.append("\t\textraOptions.noPaging = true;");
		export_js.append(LINE_TERM);
	}

	if(need_current_user) {
		publish_js.append("\tvar currentUser = Meteor.users.findOne({ _id: this.userId });");
		publish_js.append(LINE_TERM);

		export_js.append("\tvar currentUser = Meteor.users.findOne({ _id: this.userId });");
		export_js.append(LINE_TERM);

		count_js.append("\tvar currentUser = Meteor.users.findOne({ _id: this.userId });");
		count_js.append(LINE_TERM);
	}

	CWStringList query_vars;
	ExtractVars(&query_vars);
	
	int var_count = query_vars.Count();
	for(int i = 0; i < var_count; i++) {
		string var_name = query_vars.Strings[i];
		string var_value = "null";
		CWVariable* variable = Variables->GetVariable(var_name);
		if(variable != NULL) {
			CWQuery* ext_query = App()->GetQuery(variable->QueryName);
			if(ext_query == NULL) {
				var_value = UnescapeJSON(variable->Value);
			} else {
				string tmp_publish = "";
				string tmp_export = "";
				if(!ext_query->ServerFindFunction(&var_value, &tmp_publish, &tmp_export, pCollectionIncludes, false, pErrorMessage)) {
					return false;
				}

				if(ext_query->FindOne) {
					if(variable->Value != "") {
						string ext_query_var = ToCamelCase(var_name + "_obj", '_', false);
						publish_js.append("\tvar " + ext_query_var + " = " + EnsureLastChar(var_value, ';'));
						publish_js.append(LINE_TERM);

						export_js.append("\tvar " + ext_query_var + " = " + EnsureLastChar(var_value, ';'));
						export_js.append(LINE_TERM);

						count_js.append("\tvar " + ext_query_var + " = " + EnsureLastChar(var_value, ';'));
						count_js.append(LINE_TERM);

						var_value = "objectUtils.getPropertyValue(\"" + variable->Value + "\", " + ext_query_var + ")";
					}
				} else {
					var_value = var_value + ".fetch()";
					if(variable->Value != "") {
						var_value = var_value + ".map(function(tmp) { return tmp[\"" + variable->Value + "\"]; })";
					}
				}
			}
		}
		publish_js.append("\tvar " + var_name + " = " + EnsureLastChar(var_value, ';'));
		publish_js.append(LINE_TERM);

		export_js.append("\t\tvar " + var_name + " = " + EnsureLastChar(var_value, ';'));
		export_js.append(LINE_TERM);

		count_js.append("\tvar " + var_name + " = " + EnsureLastChar(var_value, ';'));
		count_js.append(LINE_TERM);

		ReplaceSubString(&query_filter_a, "\"%" + var_name + "\"", var_name);
		ReplaceSubString(&query_filter_b, "\"%" + var_name + "\"", var_name);
	}
	
	// restrict read to roles
	if(roles_allowed_to_read.Count() > 0)
	{
		CWJSONArray allowed_roles;
		allowed_roles.AddStringList(&roles_allowed_to_read);
		publish_js.append("\tif(Users.isInRoles(this.userId, " + allowed_roles.Stringify(true, true, true) + ")) {");
		publish_js.append(LINE_TERM);
		publish_js.append("\t\treturn ");
		if(has_joins) publish_js.append(collection_var + ".publishJoinedCursors(");
		publish_js.append(collection_var + ".find(");
		if(extra_options) {
			publish_js.append("databaseUtils.extendFilter(" + query_filter_a + ", extraOptions)");
		} else {
			publish_js.append(query_filter_a);
		}
		publish_js.append(", ");
		if(extra_options) {
			publish_js.append("databaseUtils.extendOptions(" + query_options + ", extraOptions)");
		} else {
			publish_js.append(query_options);
		}
		if(has_joins) publish_js.append(")");
		publish_js.append(");");
		publish_js.append(LINE_TERM);
		publish_js.append("\t}");
		publish_js.append(LINE_TERM);

		export_js.append("\t\tif(Users.isInRoles(this.userId, " + allowed_roles.Stringify(true, true, true) + ")) {");
		export_js.append(LINE_TERM);
		export_js.append("\t\t\tvar data = ");
		export_js.append(collection_var + ".find(");
		if(extra_options) {
			export_js.append("databaseUtils.extendFilter(" + query_filter_a + ", extraOptions)");
		} else {
			export_js.append(query_filter_a);
		}
		export_js.append(", ");
		if(extra_options) {
			export_js.append("databaseUtils.extendOptions(" + query_options + ", extraOptions)");
		} else {
			export_js.append(query_options);
		}
		export_js.append(").fetch();");
		export_js.append(LINE_TERM);
		
		export_js.append("\t\t\treturn objectUtils.exportArrayOfObjects(data, exportFields, fileType);");
		export_js.append(LINE_TERM);
		
		export_js.append("\t\t}");
		export_js.append(LINE_TERM);

		if(read_owner_only)
		{
			publish_js.append("\t");
			publish_js.append("return ");
			if(has_joins) publish_js.append(collection_var + ".publishJoinedCursors(");
			publish_js.append(collection_var + ".find(");
			if(extra_options) {
				publish_js.append("databaseUtils.extendFilter(" + query_filter_b + ", extraOptions)");
			} else {
				publish_js.append(query_filter_b);
			}
			publish_js.append(", ");
			if(extra_options) {
				publish_js.append("databaseUtils.extendOptions(" + query_options + ", extraOptions)");
			} else {
				publish_js.append(query_options);
			}
			if(has_joins) publish_js.append(")");
			publish_js.append(");");
			publish_js.append(LINE_TERM);

			export_js.append("\t\tvar data = ");
			export_js.append(collection_var + ".find(");
			if(extra_options) {
				export_js.append("databaseUtils.extendFilter(" + query_filter_b + ", extraOptions)");
			} else {
				export_js.append(query_filter_b);
			}
			export_js.append(", ");
			if(extra_options) {
				export_js.append("databaseUtils.extendOptions(" + query_options + ", extraOptions)");
			} else {
				export_js.append(query_options);
			}
			export_js.append(").fetch();");
			export_js.append(LINE_TERM);

			export_js.append("\t\treturn objectUtils.exportArrayOfObjects(data, exportFields, fileType);");
			export_js.append(LINE_TERM);
		}
		else
		{
			publish_js.append("\t");
			publish_js.append("return this.ready();");
			publish_js.append(LINE_TERM);
		}
	}
	else
	{
		publish_js.append("\t");
		publish_js.append("return ");
		if(has_joins) publish_js.append(collection_var + ".publishJoinedCursors(");
		publish_js.append(collection_var + ".find(");
		if(extra_options) {
			publish_js.append("databaseUtils.extendFilter(" + query_filter_b + ", extraOptions)");
		} else {
			publish_js.append(query_filter_b);
		}
		publish_js.append(", ");
		if(extra_options) {
			publish_js.append("databaseUtils.extendOptions(" + query_options + ", extraOptions)");
		} else {
			publish_js.append(query_options);
		}
		if(has_joins) publish_js.append(")");
		publish_js.append(");");
		publish_js.append(LINE_TERM);

		export_js.append("\t\tvar data = ");
		export_js.append(collection_var + ".find(");
		if(extra_options) {
			export_js.append("databaseUtils.extendFilter(" + query_filter_b + ", extraOptions)");
		} else {
			export_js.append(query_filter_b);
		}
		export_js.append(", ");
		if(extra_options) {
			export_js.append("databaseUtils.extendOptions(" + query_options + ", extraOptions)");
		} else {
			export_js.append(query_options);
		}
		export_js.append(").fetch();");
		export_js.append(LINE_TERM);

		export_js.append("\t\treturn objectUtils.exportArrayOfObjects(data, exportFields, fileType);");
		export_js.append(LINE_TERM);
	}
	export_js.append("\t}");
	export_js.append(LINE_TERM);

	export_js.append("});");
	export_js.append(LINE_TERM);

	count_js.append("\t");
	count_js.append("Counts.publish(this, \"" + Name + "_count\", ");
	count_js.append(collection_var + ".find(");
	if(extra_options) {
		count_js.append("databaseUtils.extendFilter(" + query_filter_b + ", extraOptions)");
	} else {
		count_js.append(query_filter_b);
	}
	count_js.append(", ");
	count_js.append("{ fields: { _id: 1 } }");
	count_js.append("));");
	count_js.append(LINE_TERM);
	count_js.append("});");
	count_js.append(LINE_TERM);
	
	string find_function = "";
	find_function.append(collection_var);
	if(FindOne) {
		find_function.append(".findOne(");
	} else {
		find_function.append(".find(");
	}

	if(extra_options) {
		find_function.append("databaseUtils.extendFilter(" + query_filter_b + ", extraOptions)");
	} else {
		find_function.append(query_filter_b);
	}
	find_function.append(", ");
	if(extra_options) {
		find_function.append("databaseUtils.extendOptions(" + query_options + ", extraOptions)");
	} else {
		find_function.append(query_options);
	}
	find_function.append(")");

	publish_js.append("});");
	publish_js.append(LINE_TERM);

	if(extra_options) {
		publish_js.append(LINE_TERM);
		publish_js.append(count_js);
	}

	if(pCollectionIncludes != NULL) {
		if(Collection != "users")
		{
			string shared_js_dest = App()->BothCollectionsDir + ChangeFileExt(Collection, ".js");
			string shared_js_dest_relative = App()->RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(shared_js_dest, App()->OutputDir, ""), '/'), true);
			string shared_js_import = "import {" + collection_var + "} from \"" + shared_js_dest_relative + "\";";
			if(pCollectionIncludes->Find(shared_js_import) < 0)
				pCollectionIncludes->Add(shared_js_import);
		}
		else
		{
			string import_users = "import {" + collection_var + "} from \"meteor-user-roles\";";
			if(pCollectionIncludes->Find(import_users) < 0)
				pCollectionIncludes->Add(import_users);
		}
	}

	*pPublish = publish_js;

	if(pExportMethod != NULL) {
		*pExportMethod = export_js;
	}

	*pResult = find_function;

	return true;
}

// ---------------------------------------------------

CWSubscription::CWSubscription()
{
	Name = "";
	Params = new CWParams();
}

CWSubscription::~CWSubscription()
{
	Clear();
	delete Params;
}

void CWSubscription::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "subscription", "");

	MetaAddMember(pMeta, "name", "Publication name", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "params", "Params", "array", "param", "", false, "", NULL);
}

void CWSubscription::Clear()
{
	Name = "";
	Params->Clear();
}

bool CWSubscription::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	Name = FromCamelCase(pJSON->GetString("name"), '_', true);
	Params->LoadFromJSONArray(pJSON->GetArray("params"));

	return true;
}

bool CWSubscription::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	pJSON->SetString("name", Name);
	CWJSONArray* params = new CWJSONArray();
	Params->SaveToJSONArray(params);
	return true;
}


void CWSubscription::GetSubscriptionArguments(CWApplication* pApp, bool bInsideTracker, string* pArguments, CWStringList* pParamVars) {
	string params_path = "";
	if(pApp->TemplatingName() == "blaze") params_path = "this.params";
	if(pApp->TemplatingName() == "react") {
		if(bInsideTracker) {
			params_path = "props.routeParams";
		} else {
			params_path = "this.props.routeParams";
		}
	}
	
	*pArguments = "";
	pParamVars->Clear();

	CWStringList query_params;
	CWQuery* query = pApp->GetQuery(Name);
	query->ExtractParams(&query_params);
	int query_params_count = query_params.Count();
	for(int x = 0; x < query_params_count; x++)
	{
		string param_name = query_params.Strings[x];
		CWParam* query_param = Params->GetParam(param_name);

		if(query_param != NULL)
		{
			CWJSONValue val;
			val.Set(query_param->Value, query_param->Type);
			string v = "";
			if(pParamVars->Count() > 0) v = "\t\t";
			string param_value = val.Stringify(true, "", true, true);
			if(pApp->TemplatingName() == "react") {
				ReplaceSubString(&param_value, "this.params", params_path);
			}
			param_value = Trim(param_value, true, true);
			
			if(FindSubString(&param_value, "new RegExp") == 0) {
				string original_value = param_value;

				ReplaceSubString(&param_value, "new RegExp", "");
				param_value = Trim(param_value, true, true);
				param_value = Trim(RemoveLastChar(param_value, ';'), true, true);
				param_value = Trim(RemoveFirstChar(param_value, '('), true, true);
				param_value = Trim(RemoveLastChar(param_value, ')'), true, true);

				CWStringList regexp_args;
				StringToList(param_value, ',', '(', ')', &regexp_args);
				if(regexp_args.Count() > 0) {
					param_value = regexp_args.Strings[0];
					ReplaceSubString(&original_value, regexp_args.Strings[0], param_name);
					query->SpecialParams->Add(param_name + "=" + original_value);
				}
			}
			v.append("var " + param_name + " = " + EnsureLastChar(param_value, ';'));
			pParamVars->Add(v);

			pArguments->append(", " + param_name);
		}
		else
		{
			pArguments->append(", " + params_path + "." + param_name);
		}
	}

}


// ---------------------------------------------------

CWSubscriptions::CWSubscriptions(): CWArray<CWSubscription*>()
{
}

CWSubscriptions::~CWSubscriptions()
{
}

bool CWSubscriptions::LoadFromJSON(CWJSONArray* pJSONArray, string* pErrorMessage)
{
	Clear();
	if(pJSONArray == NULL) return false;

	int item_count = pJSONArray->Count();
	for(int i = 0; i < item_count; i++)
	{
		CWJSONObject* obj = pJSONArray->Items[i]->GetObject();
		if(obj != NULL)
		{
			CWSubscription* subscription = new CWSubscription();
			if(!subscription->LoadFromJSON(obj, "", pErrorMessage))
			{
				delete subscription;
				return false;
			}
			Add(subscription);
		}
	}
	return true;
}

bool CWSubscriptions::SaveToJSON(CWJSONArray* pJSONArray, string* pErrorMessage)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
	{
		CWJSONObject* obj = new CWJSONObject();
		CWSubscription* subscription = Items[i];
		if(!subscription->SaveToJSON(obj, pErrorMessage)) {
			return false;
		}
		pJSONArray->AddObject(obj);
	}
	return true;
}


CWSubscription* CWSubscriptions::GetSubscription(string sName)
{
	int subscription_count = Count();
	for(int i = 0; i < subscription_count; i++)
	{
		if(Items[i]->Name == sName)
			return Items[i];
	}
	return NULL;
}


void CWSubscriptions::AddUnique(CWSubscription* pSubscription)
{
	if(pSubscription == NULL) return;
	CWSubscription* sub = GetSubscription(pSubscription->Name);
	if(sub == NULL) Add(pSubscription);
}

void CWSubscriptions::MergeUnique(CWSubscriptions* pSubscriptions)
{
	if(pSubscriptions == NULL) return;
	int subscription_count = pSubscriptions->Count();
	for(int i = 0; i < subscription_count; i++)
		AddUnique(pSubscriptions->Items[i]);
}

// ---------------------------------------------------

CWComponent::CWComponent(CWObject* pParent): CWObject(pParent)
{
	Type = "";
	Template = "";
	CustomTemplate = "";
	HTML = "";
	JS = "";
	JSX = "";
	Gasoline = new CWGasoline(this);
	UseGasoline = false;

	Imports = new CWStringList();
	DestSelector = "";
	DestPosition = "";
	Class = "";
	Title = "";
	TitleIconClass = "";
	EventsCode = "";
	HelpersCode = "";
	QueryName = "";
	QueryParams = new CWParams();
	BeforeSubscriptionCode = "";
	CustomDataCode = "";

	Components = new CWArray<CWComponent*>;
	ShowCondition = "";
	TemplateCreatedCode = "";
	TemplateRenderedCode = "";
	TemplateDestroyedCode = "";
	// ---

	InternalImports = new CWStringList();

	Subscription = new CWSubscription();
	CustomHTML = false;
	CustomJS = false;
	CustomJSX = false;
	OriginalGasoline = new CWJSONObject();

	AddEvents = "";
	AddHelpers = "";
	AddBindings = new CWStringList();
	
	ReplaceStrings = new CWStringList();
}

CWComponent::~CWComponent()
{
	Clear();
	delete AddBindings;
	delete OriginalGasoline;

	delete Gasoline;
	delete ReplaceStrings;
	delete InternalImports;

	delete Imports;
	delete Subscription;
	delete QueryParams;
	delete Components;
}

void CWComponent::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "component", "object");

	pMeta->SetBool("hideThis", true);
	MetaHideDerivedClass(pMeta, "page");

	CWStringList position_list;
	position_list.Add("");
	position_list.Add("top");
	position_list.Add("bottom");
	position_list.Add("before");
	position_list.Add("after");

	MetaAddMember(pMeta, "type", "Type", "string", "", "component", true, "text", NULL);
	MetaAddMember(pMeta, "template", "Template", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "custom_template", "Custom template", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "html", "HTML code", "string", "", "", false, "html", NULL);
	MetaAddMember(pMeta, "js", "JS code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "jsx", "JSX code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "gasoline", "Generic Template", "gasoline", "", "", false, "", NULL);
	MetaAddMember(pMeta, "use_gasoline", "Use visual designer", "bool", "", "false", false, "checkbox", NULL);

	MetaAddMember(pMeta, "imports", "Import modules", "array", "string", "", false, "stringlist", NULL);

	MetaAddMember(pMeta, "dest_selector", "Dest. selector", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "dest_position", "Dest. position", "string", "", "", false, "select", &position_list);
	MetaAddMember(pMeta, "class", "CSS class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "title", "Title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "title_icon_class", "Title icon class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "events_code", "Events", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "helpers_code", "Helpers", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "query_name", "Query name", "string", "query_name", "", false, "select_query", NULL);
	MetaAddMember(pMeta, "query_params", "Query params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "before_subscription_code", "Before Subscription Code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "custom_data_code", "Custom Data Code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "components", "Components", "array", "component", "", false, "", NULL);
	MetaAddMember(pMeta, "show_condition", "Show Condition", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "template_created_code", "Template created code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "template_rendered_code", "Template rendered code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "template_destroyed_code", "Template destroyed code", "string", "", "", false, "javascript", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");
	}
}

void CWComponent::Clear()
{
	CWObject::Clear();

	Type = "";
	Template = "";
	CustomTemplate = "";
	HTML = "";
	JS = "";
	JSX = "";
	Gasoline->Clear();
	UseGasoline = false;

	Imports->Clear();
	DestSelector = "";
	DestPosition = "";
	Class = "";
	Title = "";
	TitleIconClass = "";
	EventsCode = "";
	HelpersCode = "";
	QueryName = "";
	QueryParams->Clear();
	BeforeSubscriptionCode = "";
	CustomDataCode = "";
	Components->Clear();
	ShowCondition = "";
	TemplateCreatedCode = "";
	TemplateRenderedCode = "";
	TemplateDestroyedCode = "";

	InternalImports->Clear();
	Subscription->Clear();
	ReplaceStrings->Clear();
	AddBindings->Clear();

	// ---
	
	OriginalGasoline->Clear();
}

bool CWComponent::HasMenuWithRoute(string sRouteName)
{
	CWMenu* this_menu = dynamic_cast<CWMenu*>(this);
	if(this_menu != NULL && this_menu->HasItemWithRoute(sRouteName))
		return true;

	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++)
		if(Components->Items[i]->HasMenuWithRoute(sRouteName))
			return true;

	return false;
}

CWPage* CWComponent::ParentPage(bool bZoneIsPage)
{
	CWObject* parent = Parent;
	while(parent != NULL)
	{
		if(dynamic_cast<CWPage*>(parent) != NULL && (dynamic_cast<CWZone*>(parent) == NULL || bZoneIsPage))
			return (CWPage*)parent;

		parent = parent->Parent;
	}
	return NULL;
}

CWZone* CWComponent::ParentZone()
{
	CWObject* parent = this;
	while(parent != NULL)
	{
		if(dynamic_cast<CWZone*>(parent) != NULL)
			return ((CWZone*)parent);

		parent = parent->Parent;
	}
	return NULL;
}

CWZoneType CWComponent::GetZoneType()
{
	CWObject* parent = this;
	while(parent != NULL)
	{
		if(dynamic_cast<CWZone*>(parent) != NULL)
			return ((CWZone*)parent)->ZoneType;

		parent = parent->Parent;
	}
	return ztUnknown;
}

CWQuery* CWComponent::GetMainQuery()
{
	return App()->GetQuery(QueryName);
}

CWCollection* CWComponent::GetCollection()
{
	CWQuery* query = GetMainQuery();
	if(query == NULL) return NULL;

	if(query->Collection == "") return NULL;

	return App()->GetCollection(query->Collection);
}

string CWComponent::GetCollectionName()
{
	CWQuery* query = GetMainQuery();
	if(query == NULL) return "";
	if(query->Collection == "") return "";
	if(query->Collection == "users") return query->Collection;

	CWCollection* collection = App()->GetCollection(query->Collection);
	if(collection == NULL) return "";
	return collection->Name;
}

void CWComponent::GetUsedCollections(CWStringList* pCollections)
{
	CWCollection* collection = GetCollection();
	if(collection != NULL) pCollections->Add(collection->Name);

	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++)
		Components->Items[i]->GetUsedCollections(pCollections);
}

CWSubscription* CWComponent::GetMainSubscription()
{
	if(Subscription->Name == "") return NULL;
	return Subscription;
}

bool CWComponent::GetSubscriptions(CWSubscriptions* pSubscriptions, string* pErrorMessage)
{
	pSubscriptions->OwnsItems = false;

	CWSubscription* main_subscription = GetMainSubscription();
	if(main_subscription != NULL)
	{
		pSubscriptions->AddUnique(main_subscription);
		CWQuery* query = App()->GetQuery(main_subscription->Name);
		if(query != NULL) pSubscriptions->MergeUnique(query->RelatedQueries);
	}

	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++)
	{
		if(!Components->Items[i]->GetSubscriptions(pSubscriptions, pErrorMessage))
			return false;
	}

	return true;
}

void CWComponent::GetBeforeSubscriptionCode(string* pCode)
{
	if(pCode == NULL) return;
	
	string tabs = "";
	if(App()->TemplatingName() == "blaze") tabs = "\t\t";
	if(App()->TemplatingName() == "react") tabs = "\t\t\t";

	if(BeforeSubscriptionCode != "")
	{
		if(pCode->size() > 0)
		{
			pCode->append(tabs);
		}
		pCode->append(BeforeSubscriptionCode);
		pCode->append(LINE_TERM);
	}
	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++)
		Components->Items[i]->GetBeforeSubscriptionCode(pCode);
}

void CWComponent::GetCustomDataCode(string* pCode)
{
	if(pCode == NULL) return;
	
	string tabs = "";
	if(App()->TemplatingName() == "blaze") tabs = "\t\t";
	if(App()->TemplatingName() == "react") tabs = "\t\t\t";

	if(CustomDataCode != "")
	{
		if(pCode->size() > 0)
		{
			pCode->append(tabs);
		}
		pCode->append(CustomDataCode);
		pCode->append(LINE_TERM);
	}
	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++)
		Components->Items[i]->GetCustomDataCode(pCode);
}

CWArray<CWField*> *CWComponent::GetFields()
{
	CWCollection* collection = GetCollection();
	if(!collection) return NULL;

	return collection->Fields;
}

int CWComponent::ComponentIndex(CWComponent* pComponent)
{
	if(pComponent == NULL) {
		return -1;
	}

	string type = pComponent->Type;
	int component_count = Components->Count();
	int index = 0;
	for(int i = 0; i < component_count; i++) {
		if(Components->Items[i]->Type == type) {
			if(Components->Items[i] == pComponent) {
				return index;
			}
			index++;
		}
	}

	return -1;
}

bool CWComponent::HasComponentWithDestination(string sSelector, bool bRecourse)
{
	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++) {
		CWComponent* component = Components->Items[i];
		if(component->DestSelector == sSelector) {
			return true;
		}
		if(bRecourse && component->HasComponentWithDestination(sSelector, bRecourse)) {
			return true;
		}
	}
	return false;
}

void CWComponent::GetComponentsUsingQuery(CWQuery* pQuery, CWArray<CWComponent*> *pComponents)
{
	pComponents->OwnsItems = false;
	
	if(GetMainQuery() == pQuery) {
		pComponents->Add(this);
	}

	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++) {
		CWComponent* component = Components->Items[i];
		if(component->GetMainQuery() == pQuery) {
			pComponents->Add(component);
		}
		component->GetComponentsUsingQuery(pQuery, pComponents);
	}
}


bool CWComponent::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Type = FromCamelCase(pJSON->GetString("type"), '_', true);
	if(Type == "custom") Type = "custom_component";
	if(Type == "dataview") Type = "data_view";
	if(Type == "treeview") Type = "tree_view";

	Template = pJSON->GetString("template");
	CustomTemplate = ConvertDirSeparator(pJSON->GetString("custom_template"));
	HTML = UnescapeJSON(pJSON->GetString("html"));
	JS = UnescapeJSON(pJSON->GetString("js"));
	JSX = UnescapeJSON(pJSON->GetString("jsx"));

	CWJSONObject* gasoline = pJSON->GetObject("gasoline");
	if(gasoline != NULL) {
		OriginalGasoline->CopyFrom(gasoline);
/*
		if(!Gasoline->LoadFromJSON(gasoline, "gasoline", pErrorMessage)) {
			return false;
		}
*/
	}
	UseGasoline = pJSON->GetBool("use_gasoline");

	JSONArrayToStringList(pJSON->GetArray("imports"), Imports, true);

	DestSelector = pJSON->GetString("dest_selector");
	DestPosition = pJSON->GetString("dest_position");
	Class = pJSON->GetString("class");
	Title = UnescapeJSON(pJSON->GetString("title"));
	TitleIconClass = pJSON->GetString("title_icon_class");
	EventsCode = UnescapeJSON(pJSON->GetString("events_code"));
	HelpersCode = UnescapeJSON(pJSON->GetString("helpers_code"));


	CWJSONObject* query = pJSON->GetObject("query");
	if(query && query->GetString("name") != "")
	{
		// ------
		// this block is for backward compatibility with pre-0.9.48 - remove in future versions
		App()->Warning("Object \"" + Name + "\" contains deprecated property \"query\". Please move query definition into \"application.queries\" array and set this object's \"query_name\" and \"query_params\".");

		QueryName = query->GetString("name");
		QueryParams->LoadFromJSONArray(query->GetArray("params"));
		Subscription->Name = query->GetString("name");
		Subscription->Params->LoadFromJSONArray(query->GetArray("params"));

		if(App()->GetQuery(QueryName) == NULL)
		{
			CWQuery* qry = new CWQuery(App());
			if(!qry->LoadFromJSON(query, "", pErrorMessage))
				return false;

			App()->Queries->Add(qry);
		}
		// ------
	}
	else
	{
		QueryName = FromCamelCase(pJSON->GetString("query_name"), '_', true);
		QueryParams->LoadFromJSONArray(pJSON->GetArray("query_params"));

		Subscription->Name = FromCamelCase(pJSON->GetString("query_name"), '_', true);
		Subscription->Params->LoadFromJSONArray(pJSON->GetArray("query_params"));
	}

	BeforeSubscriptionCode = UnescapeJSON(pJSON->GetString("before_subscription_code"));
	CustomDataCode = UnescapeJSON(pJSON->GetString("custom_data_code"));

	// load components
	CWJSONArray* components = pJSON->GetArray("components");
	if(components)
	{
		int components_count = components->Count();
		for(int i = 0; i < components_count; i++)
		{
			CWJSONObject* component = components->Items[i]->GetObject();
			if(component != NULL)
			{
				string component_name = FromCamelCase(component->GetString("name"), '_', true);
				string component_type = FromCamelCase(component->GetString("type"), '_', true);
				if(component_type == "")
				{
					if(pErrorMessage) *pErrorMessage = "Error: component \"" + component_name + "\" must have a \"type\" property specified.";
					return false;
				}

				CWComponent* obj = NULL;

				if(component_type == "component") obj = new CWComponent(this); // Deprecated; for backward compatibility only.
				if(component_type == "menu") obj = new CWMenu(this);
				if(component_type == "jumbotron") obj = new CWJumbotron(this);
				if(component_type == "form") obj = new CWForm(this);
				if(component_type == "data_view" || component_type == "dataview") obj = new CWDataView(this);
				if(component_type == "tree_view" || component_type == "treeview") obj = new CWTreeView(this);
				if(component_type == "markdown") obj = new CWMarkdown(this);
				if(component_type == "div") obj = new CWDiv(this);
				if(component_type == "section") obj = new CWSection(this);
				if(component_type == "editable_content") obj = new CWEditableContent(this);
				if(component_type == "cms_content") obj = new CWCMSContent(this);
				if(component_type == "chart") obj = new CWChart(this);
				if(component_type == "custom" || component_type == "custom_component") obj = new CWCustomComponent(this);

				if(obj == NULL) obj = new CWPlugin(this);

				if(!obj->LoadFromJSON(component, "", pErrorMessage))
				{
					delete obj;
					return false;
				}
				Components->Add(obj);
			}
		}
	}

	ShowCondition = UnescapeJSON(pJSON->GetString("show_condition"));
	TemplateCreatedCode = UnescapeJSON(pJSON->GetString("template_created_code"));
	TemplateRenderedCode = UnescapeJSON(pJSON->GetString("template_rendered_code"));
	TemplateDestroyedCode = UnescapeJSON(pJSON->GetString("template_destroyed_code"));

	return true;
}

string CWComponent::TemplateName()
{
	if(dynamic_cast<CWComponent*>(Parent) == NULL)
		return ToCamelCase(Name, '_', true);

	return ((CWComponent*)Parent)->TemplateName() + ToCamelCase(Name, '_', true);

//	return ParentPage(true)->TemplateName() + ToCamelCase(Name, '_', true);
}

string CWComponent::TemplateFile()
{
	if(CustomTemplate == "" && Template == "") return App()->TemplateUiComponentsDir + Type;

	if(CustomTemplate != "") return App()->InputDir + ChangeFileExt(CustomTemplate, "");

	return App()->TemplateUiComponentsDir + ChangeFileExt(ExtractFileName(Template), "");
}

string CWComponent::SettingsFile()
{
	return ChangeFileExt(TemplateFile(), ".json");
}

bool CWComponent::ReadSettings(CWPackages* pPackages, CWArray<CWFilePair*>* pCopyFiles, string* pErrorMessage)
{
	string settings_filename = SettingsFile();

	CWJSONObject settings_json;
	if(!ParseJSONFile(settings_filename, &settings_json, false, pErrorMessage))
		return false;

	// load package list
	CWJSONObject* packages_json = settings_json.GetObject("packages");
	if(packages_json)
	{
		CWStringList meteor_packages;
		CWStringList npm_packages;
		CWStringList mrt_packages;

		JSONArrayToStringList(packages_json->GetArray("meteor"), &meteor_packages);
		JSONArrayToStringList(packages_json->GetArray("npm"), &npm_packages);
		JSONArrayToStringList(packages_json->GetArray("mrt"), &mrt_packages);

		pPackages->Meteor->Merge(&meteor_packages);
		pPackages->Npm->Merge(&npm_packages);
		pPackages->Mrt->Merge(&mrt_packages);
	}

	JSONArrayToStringList(settings_json.GetArray("imports"), InternalImports, true);

	// load list of files to copy
	CWJSONArray* copy_files = settings_json.GetArray("copy_files");
	if(copy_files != NULL)
	{
		int copy_files_count = copy_files->Count();
		for(int i = 0; i < copy_files_count; i++)
		{
			CWJSONObject* pair = copy_files->Items[i]->GetObject();
			if(pair != NULL)
			{
				string source_file = pair->GetString("source");
				if(source_file.find("http://") != 0 && source_file.find("https://") != 0) {
					source_file = ConvertDirSeparator(source_file);
				}
				string source_content = UnescapeJSON(pair->GetString("source_content"));
				string dest_file = ConvertDirSeparator(pair->GetString("dest"));
				if(FindFilePair(pCopyFiles, source_file, source_content, dest_file) < 0)
				{
					CWFilePair* file_pair = new CWFilePair();
					file_pair->Source = source_file;
					file_pair->SourceContent = source_content;
					file_pair->Dest = dest_file;
					pCopyFiles->Add(file_pair);
				}
			}
		}
	}

	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++)
	{
		CWComponent* component = Components->Items[i];
		if(!component->ReadSettings(pPackages, pCopyFiles, pErrorMessage))
			return false;
	}

	return true;
}

string CWComponent::GetCollectionVar()
{
	CWQuery* main_query = GetMainQuery();
	if(main_query == NULL) return "";

	string collection_name = main_query->Collection;
	string collection_var = "";
	if(collection_name == "users")
		collection_var = "Users";
	else
	{
		CWCollection* collection = GetCollection();
		if(collection != NULL) collection_var = collection->Variable();
	}
	return collection_var;
}

string CWComponent::GetCollectionInsertMethodName()
{
	CWQuery* main_query = GetMainQuery();
	if(main_query == NULL) return "";

	string collection_name = main_query->Collection;
	string collection_var = "";
	if(collection_name == "users") {
		//collection_var = "Users";
	}
	else
	{
		CWCollection* collection = GetCollection();
		if(collection != NULL) collection_var = collection->InsertMethodName();
	}
	return collection_var;
}

string CWComponent::GetCollectionUpdateMethodName()
{
	CWQuery* main_query = GetMainQuery();
	if(main_query == NULL) return "";

	string collection_name = main_query->Collection;
	string collection_var = "";
	if(collection_name == "users") {
		//collection_var = "Users";
	}
	else
	{
		CWCollection* collection = GetCollection();
		if(collection != NULL) collection_var = collection->UpdateMethodName();
	}
	return collection_var;
}

string CWComponent::GetCollectionRemoveMethodName()
{
	CWQuery* main_query = GetMainQuery();
	if(main_query == NULL) return "";

	string collection_name = main_query->Collection;
	string collection_var = "";
	if(collection_name == "users") {
		//collection_var = "Users";
	}
	else
	{
		CWCollection* collection = GetCollection();
		if(collection != NULL) collection_var = collection->RemoveMethodName();
	}
	return collection_var;
}

string CWComponent::GetQueryName()
{
	CWQuery* main_query = GetMainQuery();
	if(main_query == NULL) return "";
	return main_query->Name;
}

string CWComponent::GetComponentID()
{
	return FromCamelCase(TemplateName(), '-', true);
//	return ReplaceSubString(Type + "-" + Name, "_", "-");
}

bool CWComponent::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	CWNode* title_node = pHTML->FindChild("#component-title", true, true);
	if(title_node && Title == "") pHTML->DeleteChild(title_node, true);

	CWNode* title_icon_node = pHTML->FindChild("#component-title-icon", true, true);
	if(title_icon_node != NULL)
	{
		if(TitleIconClass == "")
			pHTML->DeleteChild(title_icon_node, true);
		else
			title_icon_node->Attr->DeleteNameValue("id");
	}

	string events_code = AddEvents;
	if(events_code != "" && EventsCode != "") events_code = EnsureLastChar(events_code, ',') + LINE_TERM;
	events_code.append(EventsCode);
	if(events_code != "")
	{
		int events_pos = FindSubString(pJS, "/*EVENTS_CODE*/");
		if(events_pos >= 0)
		{
			size_t events_function_pos = pJS->rfind(".events", events_pos);
			if(events_function_pos != string::npos)
			{
				size_t last_closed_brace = pJS->rfind("}", events_pos);
				if(last_closed_brace != string::npos && last_closed_brace > events_function_pos)
				{
					pJS->insert(last_closed_brace + 1, ", ");
				}
			}
		}
	}

	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++) {
		CWComponent* component = Components->Items[i];
		if(component != NULL) {
			if(component->ShowCondition != "") {
				string show_condition_helper_name = ToCamelCase(component->Name, '_', true) + "ShowCondition";
				string show_condition_helper = "";
				show_condition_helper.append(LINE_TERM);
				show_condition_helper.append("\t\"" + show_condition_helper_name + "\": function() {" + LINE_TERM);
				show_condition_helper.append("\t\t" + component->ShowCondition + "\n");
				show_condition_helper.append("\t}");

				if(AddHelpers != "") AddHelpers = EnsureLastChar(AddHelpers, ',') + LINE_TERM;
				AddHelpers.append(show_condition_helper);
			}
		}
	}

	string helpers_code = AddHelpers;
	if(helpers_code != "" && HelpersCode != "") helpers_code = EnsureLastChar(helpers_code, ',') + LINE_TERM;
	helpers_code.append(HelpersCode);
	if(helpers_code != "")
	{
		int helpers_pos = FindSubString(pJS, "/*HELPERS_CODE*/");
		if(helpers_pos >= 0)
		{
			size_t helpers_function_pos = pJS->rfind(".helpers", helpers_pos);
			if(helpers_function_pos != string::npos)
			{
				size_t last_closed_brace = pJS->rfind("}", helpers_pos);
				if(last_closed_brace != string::npos && last_closed_brace > helpers_function_pos)
				{
					pJS->insert(last_closed_brace + 1, ", ");
				}
			}
		}
	}

	ReplaceSubString(pJS, "/*EVENTS_CODE*/", events_code);
	ReplaceSubString(pJS, "/*HELPERS_CODE*/", helpers_code);
	ReplaceSubString(pJS, "/*TEMPLATE_CREATED_CODE*/", TemplateCreatedCode);
	ReplaceSubString(pJS, "/*TEMPLATE_RENDERED_CODE*/", TemplateRenderedCode);
	ReplaceSubString(pJS, "/*TEMPLATE_DESTROYED_CODE*/", TemplateDestroyedCode);

	ReplaceSubString(pJS, "COLLECTION_VARIABLE", GetCollectionVar());
	ReplaceSubString(pJS, "COLLECTION_INSERT_METHOD", GetCollectionInsertMethodName());
	ReplaceSubString(pJS, "COLLECTION_UPDATE_METHOD", GetCollectionUpdateMethodName());
	ReplaceSubString(pJS, "COLLECTION_REMOVE_METHOD", GetCollectionRemoveMethodName());
	ReplaceSubString(pJS, "QUERY_NAME", GetQueryName());

	ReplaceSubString(pJS, "COLLECTION_VAR", GetCollectionVar()); // !!! deprecated, remove in (near) future
	ReplaceSubString(pJS, "QUERY_VAR", GetQueryName()); // !!! deprecated remove in (near) future

	CWPage* parent_page = ParentPage(true);
	if(parent_page != NULL) {
		pRootHTML->Replace("PAGE_ROUTE_NAME", parent_page->Route(), true, true);
		ReplaceSubString(pJS, "PAGE_ROUTE_NAME", parent_page->Route());
	}

	// QUERY_FILTER - currently used only by TreeView component
	CWSubscription* main_subscription = GetMainSubscription();
	string query_filter = "";
	if(main_subscription != NULL)
	{
		CWQuery* main_query = App()->GetQuery(main_subscription->Name);
		if(main_query != NULL)
		{
			query_filter = main_query->Filter->Stringify(true, true, true);
			CWStringList query_params;
			main_query->ExtractParams(&query_params);
			int param_count = query_params.Count();
			for(int x = 0; x < param_count; x++)
			{
				string param_name = query_params.Strings[x];

				CWParam* query_param = main_subscription->Params->GetParam(param_name);
				if(query_param != NULL)
				{
					ReplaceSubString(&query_filter, "\":" + param_name + "\"", param_name);

					if(query_param->Type == jmtInteger)
						ReplaceSubString(&query_filter, "\"#" + param_name + "\"", param_name);
					else
						ReplaceSubString(&query_filter, "\"#" + param_name + "\"", "parseInt(" + param_name + ")");
				}
				else
				{
					ReplaceSubString(&query_filter, "\":" + param_name + "\"", "this.params." + param_name);
					ReplaceSubString(&query_filter, "\"#" + param_name + "\"", "parseInt(this.params." + param_name + ")");
				}

			}
			ReplaceSubString(&query_filter, "\"Meteor.userId()\"", "Meteor.userId()");
			ReplaceSubString(&query_filter, "this.params.", "self.data.");
		}
	}
	if(query_filter == "") query_filter = "{}";
	ReplaceSubString(pJS, "QUERY_FILTER", query_filter);

	int replace_count = ReplaceStrings->Count();
	for(int i = 0; i < replace_count; i++) {
		ReplaceSubString(pJS, ReplaceStrings->GetName(i), ReplaceStrings->GetValue(i));
	}

	return true;
}

bool CWComponent::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	CWPage* parent_page = ParentPage(true);
	if(parent_page != NULL) {
		pHTML->Replace("PAGE_ROUTE_NAME", parent_page->Route(), true, true);
	}

	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++) {
		CWComponent* component = Components->Items[i];
		if(component != NULL) {
			if(component->ShowCondition != "") {
				string show_condition_helper_name = ToCamelCase(component->Name, '_', true) + "ShowCondition";
				string show_condition_helper = "";
				show_condition_helper.append(LINE_TERM);
				show_condition_helper.append("\t" + show_condition_helper_name + "() {" + LINE_TERM);
				show_condition_helper.append("\t\t" + component->ShowCondition + "\n");
				show_condition_helper.append("\t}");
				show_condition_helper.append(LINE_TERM);
				AddHelpers.append(show_condition_helper);
			}
		}
	}

	string events_code = AddEvents;
	if(events_code != "" && EventsCode != "") events_code = events_code + LINE_TERM;
	events_code.append(EventsCode);
	pHTML->Replace("/*EVENTS_CODE*/", events_code, true, true);

	string helpers_code = AddHelpers;
	if(helpers_code != "" && HelpersCode != "") helpers_code = helpers_code + LINE_TERM;
	helpers_code.append(HelpersCode);
	pHTML->Replace("/*HELPERS_CODE*/", helpers_code, true, true);

	pHTML->Replace("/*TEMPLATE_CREATED_CODE*/", TemplateCreatedCode, true, true);
	pHTML->Replace("/*TEMPLATE_RENDERED_CODE*/", TemplateRenderedCode, true, true);
	pHTML->Replace("/*TEMPLATE_DESTROYED_CODE*/", TemplateDestroyedCode, true, true);


/*
	int replace_count = ReplaceStrings->Count();
	for(int i = 0; i < replace_count; i++) {
		pHTML->Replace(ReplaceStrings->GetName(i), ReplaceStrings->GetValue(i), true, true);
	}
*/
	string bindings = "";
	int bindings_count = AddBindings->Count();
	for(int i = 0; i < bindings_count; i++) {
		if(bindings != "") bindings = bindings + "\t\t";
		bindings = bindings + "this." + AddBindings->Strings[i] + " = this." + AddBindings->Strings[i] + ".bind(this);\n";
	}

	pHTML->Replace("/*BINDINGS*/", bindings, true, true);
	
	return true;
}

bool CWComponent::Create(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string templating_name = App()->TemplatingName();

	if(templating_name == "blaze" && !CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage)) return false;
	if(templating_name == "react" && !CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage)) return false;

	return true;
}

bool CWComponent::GenerateBlaze(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	App()->Log("Creating component \"" + Name + "\"...");


	string frontend = App()->FrontendName();

	CWNode* html = new CWNode();
	if(CustomHTML && CustomTemplate == "")
	{
		if(!html->ParseHTML(HTML, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error parsing HTML. " + *pErrorMessage;
			return false;
		}
	}
	else
	{
		// load html template
		string html_template_file = ChangeFileExt(TemplateFile(), ".html");
		if(!LoadHTML(html_template_file, html, pErrorMessage))
			return false;
	}

	string js = "";
	if(CustomJS && CustomTemplate == "")
	{
		js = JS;
	}
	else
	{
		// load js template
		string js_template_file = ChangeFileExt(TemplateFile(), ".js");
		if(!FileLoadString(js_template_file, &js, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading \"" + js_template_file + "\". " + *pErrorMessage;
			return false;
		}
	}

	// copy styles
	string css_template_file = ChangeFileExt(TemplateFile(), ".css");
	if(!FileExists(css_template_file)) {
		css_template_file = ChangeFileExt(TemplateFile(), ".less");
		
		if(!FileExists(css_template_file)) {
			css_template_file = ChangeFileExt(TemplateFile(), ".scss");
		}
	}

	if(FileExists(css_template_file)) {
		if(!App()->FCopy(css_template_file, App()->ClientStylesDir, false, 0, pErrorMessage)) {
			return false;
		}
	}

	// extract all template nodes
	CWNodeList template_nodes;
	template_nodes.OwnsObjects = false;
	html->FindChildsByName("template", true, true, &template_nodes, true);

	// find container template
	CWNode* container_node = NULL;
	if(template_nodes.Count() > 0) container_node = template_nodes.Items[0];
	if(container_node == NULL)
	{
		container_node = html->FindChild("#" + Type, true, true);
		if(container_node == NULL) container_node = html;
	}

	string template_name = TemplateName();
	if(container_node->Name == "template")
	{
		string tmp_name = container_node->Attr->GetValue("name");
		if(tmp_name != "" && tmp_name != "TEMPLATE_NAME")
		{
			template_name = tmp_name;
		}
		container_node->Attr->SetValue("name", template_name);
	}

	CWQuery* main_query = GetMainQuery();
	string query_name = GetQueryName();
	string collection_name = GetCollectionName();
	string collection_var = GetCollectionVar();
	string component_id = GetComponentID();
	string with_query_begin = "";
	string with_query_end = "";
	if(main_query != NULL && main_query->FindOne)
	{
		with_query_begin = "{{#with " + query_name + "}}";
		with_query_end = "{{/with}}";
	}

	ReplaceSubString(&js, "TEMPLATE_NAME", template_name);

	string position = DestPosition;
	if(position == "") position = "bottom"; // default

	CWMenu* this_menu = dynamic_cast<CWMenu*>(this);
	CWZone* the_zone = dynamic_cast<CWZone*>(ParentPage(true));
	bool parent_is_zone = the_zone != NULL;
	int menu_index = -1;
	if(this_menu != NULL && parent_is_zone) {
		menu_index = the_zone->ComponentIndex(this);
	}
	
	string component_class = Class;
	if(this_menu != NULL && parent_is_zone && component_class == "" && this_menu->ItemsContainerClass == "")
	{
		if(the_zone->Layout == "" || the_zone->Layout == "navbar" || the_zone->Layout == "landing" || the_zone->Layout == "admin") {
			if(frontend == "bootstrap3") {
				switch(menu_index) {
					case 0: component_class="nav navbar-nav"; break;
					case 1: component_class="nav navbar-nav navbar-right"; break;
				}
			}
			if(frontend == "bootstrap3-inspinia") {
				switch(menu_index) {
					case 0: component_class="nav navbar-nav"; break;
					case 1: component_class="nav navbar-top-links navbar-right"; break;
				}
			}
			if(frontend == "semantic-ui") component_class = "ui attached menu";
		}

		if(the_zone->Layout == "sidenav") {
			if(frontend == "bootstrap3") component_class = "nav nav-stacked nav-pills";
			if(frontend == "bootstrap3-inspinia") {
				switch(menu_index) {
					case 0: component_class="nav metismenu"; break;
					case 1: component_class="nav navbar-top-links navbar-right"; break;
				}
			}
			if(frontend == "semantic-ui") component_class = "";
		}

		if(the_zone->Layout == "landing" || the_zone->Layout == "admin") {
			if(frontend == "bootstrap3") {
				switch(menu_index) {
					case 0: component_class="nav navbar-nav"; break;
					case 1: component_class="nav navbar-nav navbar-right"; break;
				}
			}
			if(frontend == "bootstrap3-inspinia") {
				switch(menu_index) {
					case 0: component_class="nav navbar-nav navbar-right"; break;
					case 1: component_class="nav navbar-nav navbar-right"; break;
				}
			}
			if(frontend == "semantic-ui") component_class = "ui attached menu";
		}
	}

	// insert into parent
	CWNode* dest_node = pParentHTML;
	if(DestSelector == "")
	{
		CWNode* tmp = NULL;
		// find default dest selector
		if(tmp == NULL) tmp = pParentHTML->FindChild("#" + Type, true, true);
		if(tmp == NULL) {
			if(this_menu != NULL && parent_is_zone) {
				switch(menu_index) {
					case 0: tmp = pParentHTML->FindChild("#primary-navigation", true, true); break;
					case 1: tmp = pParentHTML->FindChild("#secondary-navigation", true, true); break;
				}
			}
		}
		if(tmp == NULL) {
			if(this_menu != NULL && parent_is_zone && DestPosition == "") position = "top";
			tmp = pParentHTML->FindChild("#content", true, true);
		}
		if(tmp != NULL) dest_node = tmp;
	}
	else
	{
		dest_node = pParentHTML->FindChild(DestSelector, true, true);
		if(dest_node == NULL)
		{
			if(pErrorMessage) *pErrorMessage = "Destination element \"" + DestSelector + "\" not found.";
			return false;
		}
	}

	if((position == "before" || position == "after") && dest_node->Name == "template")
		position = "bottom";

	if(position != "before" && position != "after" && position != "top" && position != "bottom")
	{
		if(pErrorMessage) *pErrorMessage = "Unknown destination position \"" + DestPosition + "\". Expected: \"before\", \"after\", \"top\" or \"bottom\".";
		return false;
	}

	CWNode* dest_parent_node = NULL;
	if(position == "before" || position == "after")
	{
		dest_parent_node = pParentHTML->FindParentOfChild(dest_node);
		if(dest_parent_node == NULL)
			position = "bottom";
	}

	if(container_node->Name == "template")
	{
		string template_helper = "{{> " + container_node->Attr->GetValue("name") + "}}";

		if(ShowCondition != "") {
			string show_condition_helper_name = ToCamelCase(Name, '_', true) + "ShowCondition";
			template_helper = "{{#if " + show_condition_helper_name + "}}" + LINE_TERM + "\t" + template_helper + LINE_TERM + "{{/if}}";
		}

		if(position == "before") dest_parent_node->AppendTextBeforeChild(template_helper, dest_node);
		if(position == "after") dest_parent_node->AppendTextAfterChild(template_helper, dest_node);
		if(position == "top") dest_node->AppendTextBeforeChildAndSubstring(template_helper, 0, "{{> yield}}");
		if(position == "bottom") dest_node->AppendText(template_helper);

		for(int i = 0; i < template_nodes.Count(); i++)
			pRootHTML->AddChild(template_nodes.Items[i]);
	}
	else
	{
		CWNode* new_node = NULL;
		if(ShowCondition != "") {
			string show_condition_helper_name = ToCamelCase(Name, '_', true) + "ShowCondition";
			new_node = new CWNode();
			new_node->AppendText("{{#if " + show_condition_helper_name + "}}");
			new_node->AddChild(container_node);
			new_node->AppendText("{{/if}}");
		} else {
			new_node = container_node;
		}

		if(position == "before") dest_parent_node->InsertChild(new_node, dest_parent_node->IndexOfChild(dest_node));
		if(position == "after") dest_parent_node->InsertChild(new_node, dest_parent_node->IndexOfChild(dest_node) + 1);
		if(position == "top") dest_node->InsertChild(new_node, 0);
		if(position == "bottom") dest_node->AddChild(new_node);
	}

	// create component
	if(!Create(pRootHTML, html, container_node, &js, pErrorMessage))
		return false;

	html->Replace("TEMPLATE_NAME", template_name, true, true);
	html->Replace("APP_TITLE", App()->Title, true, true);
	html->Replace("COMPONENT_TITLE_ICON_CLASS", TitleIconClass, true, true);
	html->Replace("COMPONENT_TITLE", Title, true, true);
	html->Replace("COMPONENT_CLASS", component_class, true, true);
	html->Replace("QUERY_VAR", query_name, true, true); // deprecated, remove in (near) future
	html->Replace("QUERY_NAME", query_name, true, true);
	html->Replace("COLLECTION_VARIABLE", collection_var, true, true);
	html->Replace("COLLECTION_INSERT_METHOD", GetCollectionInsertMethodName(), true, true);
	html->Replace("COLLECTION_UPDATE_METHOD", GetCollectionUpdateMethodName(), true, true);
	html->Replace("COLLECTION_REMOVE_METHOD", GetCollectionRemoveMethodName(), true, true);
	html->Replace("COLLECTION_VAR", collection_var, true, true); // deprecated, remove in (near) future
	html->Replace("COMPONENT_ID", component_id, true, true);
	html->Replace("<!-- WITH_QUERY_BEGIN -->", with_query_begin, true, true);
	html->Replace("<!-- WITH_QUERY_END -->", with_query_end, true, true);

	string insert_method_name = "";
	string update_method_name = "";
	string remove_method_name = "";
	CWCollection* collection = GetCollection();
	if(collection != NULL) {
		insert_method_name = collection->InsertMethodName();
		update_method_name = collection->UpdateMethodName();
		remove_method_name = collection->RemoveMethodName();
	}

	ReplaceSubString(&js, "INSERT_METHOD_NAME", insert_method_name);
	ReplaceSubString(&js, "UPDATE_METHOD_NAME", update_method_name);
	ReplaceSubString(&js, "REMOVE_METHOD_NAME", remove_method_name);

	// create components
	for(int i = 0; i < Components->Count(); i++)
	{
		CWComponent* component = Components->Items[i];
		if(!component->Generate(pRootHTML, container_node, &js, pErrorMessage))
			return false;
	}

	// insert js into parent
	pParentJS->append(LINE_TERM);
	pParentJS->append(js);

	// if this component uses reactive dict, add pageSession variable declaration to parent .js
//	if(FindSubString(&js, "pageSession") >= 0 && FindSubString(pParentJS, "var pageSession = new ReactiveDict();") < 0)
//		pParentJS->insert(0, "var pageSession = new ReactiveDict();\n\n");


	return true;
}

bool CWComponent::GenerateReact(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	App()->Log("Creating component \"" + Name + "\"...");

	string frontend = App()->FrontendName();

	CWNode* jsx = new CWNode();
	if(CustomJSX && CustomTemplate == "")
	{
		if(!jsx->ParseJSX(JSX, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error parsing JSX. " + *pErrorMessage;
			return false;
		}
	}
	else
	{
		// load html template
		string jsx_template_file = ChangeFileExt(TemplateFile(), ".jsx");
		if(!LoadJSX(jsx_template_file, jsx, pErrorMessage))
			return false;
	}
	
	// copy styles
	string css_template_file = ChangeFileExt(TemplateFile(), ".css");
	if(!FileExists(css_template_file)) {
		css_template_file = ChangeFileExt(TemplateFile(), ".less");
		
		if(!FileExists(css_template_file)) {
			css_template_file = ChangeFileExt(TemplateFile(), ".scss");
		}
	}

	if(FileExists(css_template_file)) {
		if(!App()->FCopy(css_template_file, App()->ClientStylesDir, false, 0, pErrorMessage)) {
			return false;
		}
	}


	// find container node
	CWNode* container_node = NULL;
	if(container_node == NULL)
	{
		container_node = jsx->FindChild("#" + Type, true, true);
		if(container_node == NULL) container_node = jsx;
	}

	string template_name = TemplateName();
//	CWQuery* main_query = GetMainQuery();
	string query_name = GetQueryName();
	string collection_name = GetCollectionName();
	string collection_var = GetCollectionVar();
	string component_id = GetComponentID();
	string with_query_begin = "";
	string with_query_end = "";
	string position = DestPosition;
	if(position == "") position = "bottom"; // default
//	CWPage* parent_page = ParentPage(true);

	CWMenu* this_menu = dynamic_cast<CWMenu*>(this);
	CWZone* the_zone = dynamic_cast<CWZone*>(Parent);
	bool parent_is_zone = the_zone != NULL;
	int menu_index = -1;
	if(this_menu != NULL && parent_is_zone) {
		menu_index = the_zone->ComponentIndex(this);
	}
	CWPage* parent_page = ParentPage(true);

	string component_class = Class;
	if(this_menu != NULL && parent_is_zone && component_class == "" && this_menu->ItemsContainerClass == "")
	{
		if(the_zone->Layout == "" || the_zone->Layout == "navbar" || the_zone->Layout == "landing" || the_zone->Layout == "admin") {
			if(frontend == "bootstrap3") {
				switch(menu_index) {
					case 0: component_class="nav navbar-nav"; break;
					case 1: component_class="nav navbar-nav navbar-right"; break;
				}
			}
			if(frontend == "bootstrap3-inspinia") {
				switch(menu_index) {
					case 0: component_class="nav navbar-nav"; break;
					case 1: component_class="nav navbar-top-links navbar-right"; break;
				}
			}
			if(frontend == "semantic-ui") component_class = "ui attached menu";
		}

		if(the_zone->Layout == "sidenav") {
			if(frontend == "bootstrap3") component_class = "nav nav-stacked nav-pills";
			if(frontend == "bootstrap3-inspinia") {
				switch(menu_index) {
					case 0: component_class="nav metismenu"; break;
					case 1: component_class="nav navbar-top-links navbar-right"; break;
				}
			}
			if(frontend == "semantic-ui") component_class = "";
		}

		if(the_zone->Layout == "landing" || the_zone->Layout == "admin") {
			if(frontend == "bootstrap3") {
				switch(menu_index) {
					case 0: component_class="nav navbar-nav"; break;
					case 1: component_class="nav navbar-nav navbar-right"; break;
				}
			}
			if(frontend == "bootstrap3-inspinia") {
				switch(menu_index) {
					case 0: component_class="nav navbar-nav navbar-right"; break;
					case 1: component_class="nav navbar-nav navbar-right"; break;
				}
			}
			if(frontend == "semantic-ui") component_class = "ui attached menu";
		}
	}

	// insert into parent
	CWNode* dest_node = pParentHTML;
	if(DestSelector == "")
	{
		CWNode* tmp = NULL;
		// find default dest selector
		if(tmp == NULL) tmp = pParentHTML->FindChild("#" + Type, true, true);
		if(tmp == NULL) {
			if(this_menu != NULL && parent_is_zone) {
				switch(menu_index) {
					case 0: tmp = pParentHTML->FindChild("#primary-navigation", true, true); break;
					case 1: tmp = pParentHTML->FindChild("#secondary-navigation", true, true); break;
				}
			}
		}
		if(tmp == NULL)
		{
			if(this_menu != NULL && parent_is_zone && DestPosition == "") position = "top";
			tmp = pParentHTML->FindChild("#content", true, true);
		}
		if(tmp != NULL) dest_node = tmp;
	}
	else
	{
		dest_node = pParentHTML->FindChild(DestSelector, true, true);
		if(dest_node == NULL)
		{
			if(pErrorMessage) *pErrorMessage = "Destination element \"" + DestSelector + "\" not found.";
			return false;
		}
	}

	if((position == "before" || position == "after") && dest_node->Name == "template")
		position = "bottom";

	if(position != "before" && position != "after" && position != "top" && position != "bottom")
	{
		if(pErrorMessage) *pErrorMessage = "Unknown destination position \"" + DestPosition + "\". Expected: \"before\", \"after\", \"top\" or \"bottom\".";
		return false;
	}

	CWNode* dest_parent_node = NULL;
	if(position == "before" || position == "after")
	{
		dest_parent_node = pParentHTML->FindParentOfChild(dest_node);
		if(dest_parent_node == NULL)
			position = "bottom";
	}

	if(Trim(jsx->Text->Strings[0], true, true) == "")
	{
		CWNode* new_node = NULL;
		if(ShowCondition != "") {
			string show_condition_helper_name = ToCamelCase(Name, '_', true) + "ShowCondition";
			new_node = new CWNode();
			new_node->AppendText("{ this." + show_condition_helper_name + "() ? (");
			new_node->AddChild(container_node);
			new_node->AppendText(") : null }");
		} else {
			new_node = container_node;
		}

		if(dest_node->Name == "")
		{
			if(dest_node->Childs->Count() == 0) dest_node->AddChild("div");
			if(position == "top") dest_node->Childs->Items[0]->InsertChild(new_node, 0);
			if(position == "bottom") dest_node->Childs->Items[0]->AddChild(new_node);
		}
		else
		{
			if(position == "before") dest_parent_node->InsertChildSpec(new_node, dest_parent_node->IndexOfChild(dest_node));
			if(position == "after") dest_parent_node->InsertChild(new_node, dest_parent_node->IndexOfChild(dest_node) + 1);
			if(position == "top") dest_node->InsertChild(new_node, 0);
			if(position == "bottom") dest_node->AddChild(new_node);
		}
	}
	else
	{
		CWNode* helper_node = new CWNode(TemplateName());
		helper_node->SelfClosing = true;
		helper_node->Attr->SetValue("data", "{this.props.data}");
		helper_node->Attr->SetValue("routeParams", "{this.props.routeParams}");

		CWNode* new_node = NULL;
		if(ShowCondition != "") {
			string show_condition_helper_name = ToCamelCase(Name, '_', true) + "ShowCondition";
			new_node = new CWNode();
			new_node->AppendText("{ this." + show_condition_helper_name + "() ? (");
			new_node->AddChild(helper_node);
			new_node->AppendText(") : null }");
		} else {
			new_node = helper_node;
		}


		if(position == "before") dest_parent_node->InsertChildSpec(new_node, dest_parent_node->IndexOfChild(dest_node));
		if(position == "after") dest_parent_node->InsertChild(new_node, dest_parent_node->IndexOfChild(dest_node) + 1);
		if(position == "top") dest_node->InsertChild(new_node, 0);
		if(position == "bottom") dest_node->AddChild(new_node);

		pRootHTML->AddChild(container_node);
	}

	// create component
	if(!Create(pRootHTML, jsx, container_node, NULL, pErrorMessage))
		return false;

	string insert_method_name = "";
	string update_method_name = "";
	string remove_method_name = "";
	CWCollection* collection = GetCollection();
	if(collection != NULL) {
		insert_method_name = collection->InsertMethodName();
		update_method_name = collection->UpdateMethodName();
		remove_method_name = collection->RemoveMethodName();
	}

	jsx->Replace("INSERT_METHOD_NAME", insert_method_name, true, true);
	jsx->Replace("UPDATE_METHOD_NAME", update_method_name, true, true);
	jsx->Replace("REMOVE_METHOD_NAME", remove_method_name, true, true);
	jsx->Replace("TEMPLATE_NAME", template_name, true, true);
	jsx->Replace("APP_TITLE", App()->Title, true, true);
	jsx->Replace("COMPONENT_TITLE_ICON_CLASS", TitleIconClass, true, true);
	jsx->Replace("COMPONENT_TITLE", Title, true, true);
	jsx->Replace("COMPONENT_CLASS", component_class, true, true);
	jsx->Replace("QUERY_VAR", query_name, true, true); // deprecated, remove in (near) future
	jsx->Replace("QUERY_NAME", query_name, true, true);
	jsx->Replace("COLLECTION_VARIABLE", collection_var, true, true);
	jsx->Replace("COLLECTION_INSERT_METHOD", GetCollectionInsertMethodName(), true, true);
	jsx->Replace("COLLECTION_UPDATE_METHOD", GetCollectionUpdateMethodName(), true, true);
	jsx->Replace("COLLECTION_REMOVE_METHOD", GetCollectionRemoveMethodName(), true, true);
	jsx->Replace("COLLECTION_VAR", collection_var, true, true); // deprecated, remove in (near) future
	jsx->Replace("COMPONENT_ID", component_id, true, true);
	jsx->Replace("<!-- WITH_QUERY_BEGIN -->", with_query_begin, true, true);
	jsx->Replace("<!-- WITH_QUERY_END -->", with_query_end, true, true);
	// replace global helpers
	jsx->Replace("{{userEmail}}", "{userEmail()}", true, true);
	jsx->Replace("{{userFullName}}", "{userFullName()}", true, true);

	// create components
	for(int i = 0; i < Components->Count(); i++)
	{
		CWComponent* component = Components->Items[i];
		if(!component->Generate(pRootHTML, container_node, NULL, pErrorMessage))
			return false;
	}

	if(parent_page != NULL)
	{
		int includes_count = Imports->Count();
		for(int i = 0; i < includes_count; i++)
		{
			string include = EnsureLastChar(App()->ReplaceDirAlias(Imports->Strings[i], true, true), ';');
			if(parent_page->IncludeFiles->Find(include) < 0)
				parent_page->IncludeFiles->Add(include);
		}

		includes_count = InternalImports->Count();
		for(int i = 0; i < includes_count; i++)
		{
			string include = EnsureLastChar(App()->ReplaceDirAlias(InternalImports->Strings[i], true, true), ';');
			if(parent_page->IncludeFiles->Find(include) < 0)
				parent_page->IncludeFiles->Add(include);
		}
	}
	return true;
}

bool CWComponent::Generate(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	string templating_name = App()->TemplatingName();

	if(templating_name == "blaze" && !GenerateBlaze(pRootHTML, pParentHTML, pParentJS, pErrorMessage)) return false;
	if(templating_name == "react" && !GenerateReact(pRootHTML, pParentHTML, pParentJS, pErrorMessage)) return false;

	return true;
}

// ---------------------------------------------------


CWPlugin::CWPlugin(CWObject* pParent): CWComponent(pParent)
{
	Properties = new CWJSONObject();
	PluginData = new CWJSONObject();
}

CWPlugin::~CWPlugin()
{
	Clear();
	delete PluginData;
	delete Properties;
}

void CWPlugin::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "plugin", "component");

	MetaAddMember(pMeta, "properties", "Properties", "object", "", "", false, "json", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
		hide_members->AddString("class");
		hide_members->AddString("title");
		hide_members->AddString("title_icon_class");
		hide_members->AddString("events_code");
		hide_members->AddString("helpers_code");
		hide_members->AddString("template_created_code");
		hide_members->AddString("template_rendered_code");
		hide_members->AddString("template_destroyed_code");
	}
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "", true, "text", NULL);
}

void CWPlugin::Clear()
{
	CWComponent::Clear();
	PluginData->Clear();
	Properties->Clear();
}

bool CWPlugin::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Properties->CopyFrom(pJSON->GetObject("properties"));
	PluginData->CopyFrom(pJSON);

	return true;
}

string CWPlugin::PluginDir()
{
	return AddDirSeparator(App()->PluginsDir + Type);
}

string CWPlugin::TemplateFile()
{
	return TempDir() + ChangeFileExt(ExtractFileName(PluginTemplate), "");
}

string CWPlugin::SettingsFile()
{
	return PluginDir() + "plugin.json";
}

bool CWPlugin::Generate(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	// find plugin directory
	string plugin_dir = PluginDir();
	if(!DirectoryExists(plugin_dir))
	{
		if(pErrorMessage) *pErrorMessage = "Unknown component type or plugin: \"" + Type + "\".";
		return false;
	}

	App()->Log("Plugin \"" + Type + "\"...");

	// find plugin executable
	string plugin_exec = plugin_dir + "plugin.js";
	if(!FileExists(plugin_exec))
	{
		if(pErrorMessage) *pErrorMessage = "Plugin executable for \"" + Type + "\" not found: \"" + plugin_exec + "\".";
		return false;
	}

	// prepare input string for plugin
	CWJSONObject obj;
	obj.CopyFrom(PluginData);

	string output_html = "";
	string output_js = "";
	do {
		PluginTemplate = RandomString(10);

		output_html = ChangeFileExt(TemplateFile(), ".html");
		output_js = ChangeFileExt(TemplateFile(), ".js");
	} while(FileExists(output_html) || FileExists(output_js));

	obj.SetString("output_html", output_html);
	obj.SetString("output_js", output_js);

	string input_string = obj.Stringify();

	// execute plugin with input_string as argument
	string args = plugin_exec + " " + input_string;
	App()->Log("Executing plugin...");
	if(!Execute(GetExecutablePath("node"), args.c_str(), true, pErrorMessage))
		return false;

	// in this point, plugin was created output_html and output_js, now just call generate as regular component
	if(!CWComponent::Generate(pRootHTML, pParentHTML, pParentJS, pErrorMessage))
		return false;

	// delete templates created by plugin
	if(FileExists(output_html)) FileDelete(output_html, NULL);
	if(FileExists(output_js)) FileDelete(output_js, NULL);

	return true;
}


// ---------------------------------------------------


CWPage::CWPage(CWObject* pParent): CWComponent(pParent)
{
	Type = "page";
	UserDefinedTemplate = false;
	Text = "";
	BackgroundImage = "";
	ContainerClass = "";
	RouteParams = new CWStringList();
	CloseRoute = "";
	BackRoute = "";
	CloseRouteParams = new CWParams();
	BackRouteParams = new CWParams();
	Roles = new CWStringList();
	Pages = new CWArray<CWPage*>;
	RelatedQueries = new CWSubscriptions();
	RenderSubpages = "auto";
	ForceYieldSubpages = false;
	Zoneless = false;
	ParentLayout = false;
	LayoutTemplate = "";
	ControllerBeforeAction = "";
	ControllerAfterAction = "";

	// ---
	
	IncludeFiles = new CWStringList();
}

CWPage::~CWPage()
{
	Clear();
	delete IncludeFiles;

	delete RelatedQueries;
	delete Pages;
	delete Roles;
	delete BackRouteParams;
	delete CloseRouteParams;
	delete RouteParams;
}

void CWPage::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "page", "component");

	MetaHideDerivedClass(pMeta, "zone");

	CWStringList render_subpages_list;
	render_subpages_list.Add("auto");
	render_subpages_list.Add("never");
	render_subpages_list.Add("always");

	MetaAddMember(pMeta, "user_defined_template", "User defined template", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "meta_description", "Meta Description", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "meta_title", "Meta Title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "text", "Text", "string", "", "", false, "textarea", NULL);
	MetaAddMember(pMeta, "background_image", "Background Image URL", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "container_class", "Container class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "route_params", "Route params", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "close_route", "Close button route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "close_route_params", "Close button route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "back_route", "Back button route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "back_route_params", "Back button route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "roles", "Roles", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "pages", "Subpages", "array", "page", "", false, "", NULL);
	MetaAddMember(pMeta, "related_queries", "Related queries", "array", "subscription", "", false, "", NULL);
	MetaAddMember(pMeta, "force_yield_subpages", "Force yield subpages", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "render_subpages", "Render subpages", "string", "", "", false, "select", &render_subpages_list);
	MetaAddMember(pMeta, "zoneless", "Zoneless", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "parent_layout", "Parent layout", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "layout_template", "Layout template name", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "controller_before_action", "Controller onBeforeAction", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "controller_after_action", "Controller onAfterAction", "string", "", "", false, "text", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
//		hide_members->AddString("html");
//		hide_members->AddString("js");
//		hide_members->AddString("jsx");
//		hide_members->AddString("gasoline");
//		hide_members->AddString("use_gasoline");

		hide_members->AddString("dest_selector");
		hide_members->AddString("dest_position");
		hide_members->AddString("show_condition");
	}

	// override super class members
	CWStringList template_list;
	template_list.Add("");
	template_list.Add("page_empty");
	template_list.Add("page_subcontent_sidenav");
	template_list.Add("page_subcontent_sidenav_collapse");
	template_list.Add("page_subcontent_tabnav");
	template_list.Add("page_subcontent_tabnav_2col");
	template_list.Add("page_subcontent_navbar");
	template_list.Add("page_subcontent_navbar_top");
	template_list.Add("change_pass");
	template_list.Add("create_password");
	template_list.Add("forgot_password");
	template_list.Add("login");
	template_list.Add("logout");
	template_list.Add("register");
	template_list.Add("reset_password");
	template_list.Add("verify_email");

	MetaOverrideMember(pMeta, "type", "Type", "string", "", "page", false, "static", NULL);
	MetaOverrideMember(pMeta, "title", "Title", "string", "", "", false, "text", NULL);
	MetaOverrideMember(pMeta, "template", "Template", "string", "", "", false, "select", &template_list);
}

void CWPage::Clear()
{
	UserDefinedTemplate = false;
	Text = "";
	BackgroundImage = "";
	ContainerClass = "";
	CWComponent::Clear();
	RouteParams->Clear();
	CloseRoute = "";
	BackRoute = "";
	CloseRouteParams->Clear();
	BackRouteParams->Clear();
	Roles->Clear();
	Pages->Clear();
	RelatedQueries->Clear();
	ForceYieldSubpages = false;
	Zoneless = false;
	ParentLayout = false;
	LayoutTemplate = "";
	ControllerBeforeAction = "";
	ControllerAfterAction = "";
	// ---
	IncludeFiles->Clear();
}

bool CWPage::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	if(pJSON->HasMember("zoneless") && pJSON->GetBool("zoneless")) App()->Warning("Object \"" + Name + "\" is using deprecated property \"zoneless\". Now you can have \"free_zone\" and put \"zoneless\" pages there. Property \"zoneless\" will be removed in near future.");

	UserDefinedTemplate = pJSON->GetBool("user_defined_template");
	MetaDescription = pJSON->GetString("meta_description");
	MetaTitle = pJSON->GetString("meta_title");
	Text = UnescapeJSON(pJSON->GetString("text"));
	BackgroundImage = pJSON->GetString("background_image");
	ContainerClass = pJSON->GetString("container_class");
	JSONArrayToStringList(pJSON->GetArray("route_params"), RouteParams);
	CloseRoute = FromCamelCase(pJSON->GetString("close_route"), '_', true);
	BackRoute = FromCamelCase(pJSON->GetString("back_route"), '_', true);
	CloseRouteParams->LoadFromJSONArray(pJSON->GetArray("close_route_params"));
	BackRouteParams->LoadFromJSONArray(pJSON->GetArray("back_route_params"));
	JSONArrayToStringList(pJSON->GetArray("roles"), Roles);
	RenderSubpages = pJSON->GetString("render_subpages");

	// --- for backward compatibility - remove in the future
	ForceYieldSubpages = pJSON->GetBool("force_yield_subpages");
	if(ForceYieldSubpages == true) {
		RenderSubpages = "always";
	}
	if(RenderSubpages == "") {
		RenderSubpages = "auto";
	}
	// ---

	Zoneless = pJSON->GetBool("zoneless");
	ParentLayout = pJSON->GetBool("parent_layout");
	LayoutTemplate = pJSON->GetString("layout_template");
	ControllerBeforeAction = UnescapeJSON(pJSON->GetString("controller_before_action"));
	ControllerAfterAction = UnescapeJSON(pJSON->GetString("controller_after_action"));	

	// ------
	// this block is for backward compatibility with pre-0.9.48 only - remove in future
	CWJSONArray* menus = pJSON->GetArray("menus");
	if(menus != NULL)
	{
		App()->Warning("Object \"" + Name + "\" contains deprecated property \"menus\". Menu is just a component - so move your menu definitions into \"components\" array. Property \"menus\" will be removed in near future.");

		int menus_count = menus->Count();
		for(int i = 0; i < menus_count; i++)
		{
			CWJSONObject* menu = menus->Items[i]->GetObject();
			if(menu != NULL)
			{
				CWMenu* obj = new CWMenu(this);
				if(!obj->LoadFromJSON(menu, "", pErrorMessage))
				{
					delete obj;
					return false;
				}
				Components->Add(obj);
			}
		}
	}
	// ------

	// load pages
	CWJSONArray* pages = pJSON->GetArray("pages");
	if(pages)
	{
		int pages_count = pages->Count();
		for(int i = 0; i < pages_count; i++)
		{
			CWJSONObject* page = pages->Items[i]->GetObject();
			if(page != NULL)
			{
				CWPage* obj = new CWPage(this);
				if(!obj->LoadFromJSON(page, "", pErrorMessage))
				{
					delete obj;
					return false;
				}
				Pages->Add(obj);
			}
		}
	}

	// ------
	// this block is for backward compatibility with pre-0.9.48 only - remove in future versions
	CWJSONArray* queries = pJSON->GetArray("queries");
	if(queries)
	{
		App()->Warning("Object \"" + Name + "\" contains deprecated property \"queries\". Please move query definitions into \"application.queries\" array and set this object's \"related_queries\" array.");

		int query_count = queries->Count();
		for(int i = 0; i < query_count; i++)
		{
			CWJSONObject* query = queries->Items[i]->GetObject();
			if(query != NULL)
			{
				CWSubscription* subscr = new CWSubscription();

				subscr->Name = query->GetString("name");
				subscr->Params->LoadFromJSONArray(query->GetArray("params"));
				RelatedQueries->Add(subscr);

				if(App()->GetQuery(subscr->Name) == NULL)
				{
					CWQuery* qry = new CWQuery(App());
					if(!qry->LoadFromJSON(query, "", pErrorMessage))
						return false;

					App()->Queries->Add(qry);
				}
			}
		}
	}
	// ------


	CWJSONArray* subscriptions = pJSON->GetArray("related_queries");
	if(subscriptions != NULL && !RelatedQueries->LoadFromJSON(subscriptions, pErrorMessage))
		return false;

	return true;
}

bool CWPage::ReadSettings(CWPackages* pPackages, CWArray<CWFilePair*>* pCopyFiles, string* pErrorMessage)
{
	if(!CWComponent::ReadSettings(pPackages, pCopyFiles, pErrorMessage))
		return false;

	int page_count = Pages->Count();
	for(int i = 0; i < page_count; i++)
	{
		CWPage* page = Pages->Items[i];
		if(!page->ReadSettings(pPackages, pCopyFiles, pErrorMessage))
			return false;
	}

	return true;
}

bool CWPage::GetParentSubscriptions(CWSubscriptions *pSubscriptions, string* pErrorMessage)
{
	pSubscriptions->OwnsItems = false;
	CWPage* parent_page = ParentPage(false);
	if(parent_page != NULL && (parent_page->RenderSubpages == "always" || (parent_page->HasMenuWithRoute(Route()) && parent_page->RenderSubpages == "auto")))
	{
		if(!parent_page->GetParentSubscriptions(pSubscriptions, pErrorMessage))
			return false;

		if(!parent_page->GetSubscriptions(pSubscriptions, pErrorMessage))
			return false;
	}
	return true;
}

bool CWPage::GetSubscriptions(CWSubscriptions *pSubscriptions, string* pErrorMessage)
{
	pSubscriptions->OwnsItems = false;

	if(!CWComponent::GetSubscriptions(pSubscriptions, pErrorMessage))
		return false;

	pSubscriptions->MergeUnique(RelatedQueries);

	return true;
}

bool CWPage::HasMenuWithSubpageRoute()
{
	int page_count = Pages->Count();
	for(int i = 0; i < page_count; i++)
		if(HasMenuWithRoute(Pages->Items[i]->Route()))
			return true;
	return false;
}

CWPage* CWPage::RedirectToSubpage()
{
	int page_count = Pages->Count();
	if(RenderSubpages == "auto" || RenderSubpages == "always") {
		for(int i = 0; i < page_count; i++)
			if(HasMenuWithRoute(Pages->Items[i]->Route()))
				return Pages->Items[i];
	}

	if(RenderSubpages == "always" && page_count > 0) return Pages->Items[0];

	return NULL;
}

string CWPage::URL()
{
	string root_route = "";
	App()->Router->GetHomeRoutes(NULL, NULL, NULL, &root_route);

	string parent_url = "";
	CWPage* parent_page = ParentPage(false);
	if(parent_page != NULL) parent_url = parent_page->URL();

	string url = "";
	if(Name == root_route)
	{
		url = "/";
	}
	else
	{
		if(Name == "home_private")
			url = "/home_private";
		else
			url = EnsureLastChar(parent_url, '/') + Name;
	}
	// add params to route
	int param_count = RouteParams->Count();
	for(int i = 0; i < param_count; i++)
	{
		string param = RouteParams->Strings[i];
		url = EnsureLastChar(url, '/') + ":" + param;
	}

	return url;
}

string CWPage::Route()
{
	CWPage* parent_page = ParentPage(false);
	string parent_route = "";
	if(parent_page) parent_route = parent_page->Route();

	string route = "";
	if(parent_route == "")
		route = Name;
	else
		route = parent_route + "." + Name;

	return route;
}

string CWPage::TemplateName()
{
	string template_name = "";
	string templating_name = App()->TemplatingName();
	if(templating_name == "blaze") {
		template_name = 	ToCamelCase(ToCamelCase(Route(), '.', true), '_', true);
	} else {
		// add "Page" suffix to avoid same variable name conflicts with other objects
		string route_name = Route();
		if(FindSubString(&route_name, "_page") < 0 && FindSubString(&route_name, ".page") < 0) {
			route_name = route_name + ".page";
		}
		template_name = ToCamelCase(ToCamelCase(route_name, '.', true), '_', true);
	}
	return template_name;
}

string CWPage::ControllerName()
{
	return TemplateName() + "Controller";
}

string CWPage::GetTitle()
{
	if(Title != "") return Title;

	CWPage* parent_page = ParentPage(true);
	if(parent_page == NULL) return "";

	return parent_page->GetTitle();
}

string CWPage::GetMetaTitle()
{
	if(MetaTitle != "") return MetaTitle;

	CWPage* parent_page = ParentPage(true);
	if(parent_page == NULL) return App()->MetaTitle;

	return parent_page->GetMetaTitle();
}

string CWPage::GetDescription()
{
	if(MetaDescription != "") return MetaDescription;

	CWPage* parent_page = ParentPage(true);
	if(parent_page == NULL) return App()->MetaDescription;

	return parent_page->GetDescription();
}

string CWPage::GetFooterText()
{
	string footer_text = "";

	CWZone* zone = ParentZone();
	if(zone != NULL) {
		footer_text = zone->FooterText;
	}

	if(footer_text == "") {
		footer_text = App()->FooterText;
	}
	return footer_text;
}

string CWPage::TemplateFile()
{
	if(Template == "" && CustomTemplate == "")
	{
		if(HasMenuWithSubpageRoute() && (RenderSubpages == "auto" || RenderSubpages == "always"))
		{
			CWPage* parent_page = ParentPage(false);
			if(parent_page != NULL && parent_page->HasMenuWithRoute(Route()) && (parent_page->RenderSubpages == "auto" || parent_page->RenderSubpages == "always") && ExtractFileName(parent_page->TemplateFile()) != "page_subcontent_tabnav")
				return App()->TemplateUiPagesDir + "page_subcontent_tabnav";
			else
				return App()->TemplateUiPagesDir + "page_subcontent_sidenav";
		}
		else
		{
			if(RedirectToSubpage() != NULL)
				return App()->TemplateUiPagesDir + "page_subcontent";
			else
				return App()->TemplateUiPagesDir + "page_empty";
		}
	}

	if(CustomTemplate != "") return App()->InputDir + ChangeFileExt(CustomTemplate, "");

	return App()->TemplateUiPagesDir + ChangeFileExt(ExtractFileName(Template), "");
}

string CWPage::DestDir()
{
	return ReplaceSubString(EnsureLastChar(Route(), '.'), ".", DIR_SEPARATOR);
}

string CWPage::DestFilename()
{
	return Name;
}

void CWPage::GetYields(string* pTopTemplate, CWStringList* pYields, CWStringList* pTemplates, CWStringList* pRegions, bool* pZoneIsNotRoot)
{
	CWPage* parent_page = ParentPage(false);
	if(parent_page != NULL)
	{
		bool has_yields = false;
		if(parent_page->RenderSubpages == "always" || (parent_page->RenderSubpages == "auto" && parent_page->HasMenuWithRoute(Route())))
		{
			string region = parent_page->TemplateName() + "Subcontent";
			pTemplates->Add(TemplateName());
			pRegions->Add(region);
			pYields->Add("'" + TemplateName() + "': { to: '" + region + "'}");
			*pTopTemplate = parent_page->TemplateName();
			has_yields = true;
		}
		int yield_count = pYields->Count();
		if(!ParentLayout) {
			parent_page->GetYields(pTopTemplate, pYields, pTemplates, pRegions, pZoneIsNotRoot);
		}
		if(ParentLayout) {
			if(pZoneIsNotRoot != NULL) {
				*pZoneIsNotRoot = true;	
			}
		}
		// this is not yielded but parent is, replace parent's yield with this
		if(!has_yields && pYields->Count() != yield_count)
		{
			pYields->Strings[yield_count] = "'" + TemplateName() + "': { to: '" + pRegions->Strings[yield_count] + "'}";
			pTemplates->Strings[yield_count] = TemplateName();
		}
	}
}

void CWPage::GetAllRoutes(CWRouter* pRouter)
{
	if(dynamic_cast<CWZone*>(this) == NULL)
	{
		CWRoute* route = new CWRoute();
		pRouter->Map->Add(route);
		route->Zoneless = Zoneless;
		route->Type = GetZoneType();
		route->Route = Route();
		route->URL = URL();
		route->Title = GetTitle();
		route->ControllerName = ControllerName();
		GetRoles(route->Roles);
	}

	int page_count = Pages->Count();
	for(int i = 0; i < page_count; i++)
	{
		CWPage* page = Pages->Items[i];
		page->GetAllRoutes(pRouter);
	}
}

void CWPage::GetRoles(CWStringList* pRoles)
{
	if(Roles->Count() == 0)
	{
		if(ParentPage(false) != NULL)
			ParentPage(false)->GetRoles(pRoles);
	}
	else
		pRoles->Assign(Roles);
}

bool CWPage::GetAllRoles(CWStringList* pRoles, string* pErrorMessage)
{
	// check roles
	int role_count = Roles->Count();
	for(int i = 0; i < role_count; i++)
	{
		if(App()->Roles->Find(Roles->Strings[i]) < 0)
		{
			if(pErrorMessage) *pErrorMessage = "Page \"" + Name + "\" is restricted to non-existing role \"" + Roles->Strings[i] + "\". Please add this role to application.roles array.";
			return false;
		}
	}

	pRoles->Merge(Roles);

	int page_count = Pages->Count();
	for(int i = 0; i < page_count; i++)
	{
		CWPage* page = Pages->Items[i];
		if(!page->GetAllRoles(pRoles, pErrorMessage))
			return false;
	}
	return true;
}

bool CWPage::CreateSubscriptions(string* pJS, CWStringList* pCollectionIncludes, string* pErrorMessage)
{
	string params_path = "";
	if(App()->TemplatingName() == "blaze") params_path = "this.params";
	if(App()->TemplatingName() == "react") params_path = "props.routeParams";
	// ---
	// subscriptions
	// ---

	string before_subscription_template = "";
	string before_subscription_template_path = App()->TemplateCodeDir + "collection_subscribe_paged.js";
	if(!FileLoadString(before_subscription_template_path, &before_subscription_template, 0, pErrorMessage))
	{
		if(pErrorMessage != NULL) *pErrorMessage = "Error reading file: \"" + before_subscription_template_path + "\".";
		return false;
	}

	string subscriptions = "";
	CWStringList param_vars;

	CWSubscriptions subs;
	subs.OwnsItems = false;
	if(!GetSubscriptions(&subs, pErrorMessage))
		return false;

	CWSubscriptions parent_subs;
	parent_subs.OwnsItems = false;
	if(!GetParentSubscriptions(&parent_subs, pErrorMessage))
		return false;

	subs.MergeUnique(&parent_subs);

	// ---
	// following is needed because external query (query used in other query's var) is not subscription - it is just a query, 
	// so we need to create subscription for it. That limits us to query without params.
	// TODO: instead "query_name" in query->Variables we need "subscription" - that will allow to define params for the queries used in vars.
	int subscriptions_count = subs.Count();
	for(int x = 0; x < subscriptions_count; x++) {
		CWSubscription* subscription = subs.Items[x];
		CWQuery* query = App()->GetQuery(subscription->Name);
		if(query != NULL) {
			CWStringList query_vars;
			query->ExtractVars(&query_vars);
			
			int var_count = query_vars.Count();
			for(int i = 0; i < var_count; i++) {
				string var_name = query_vars.Strings[i];
				CWVariable* variable = query->Variables->GetVariable(var_name);
				if(variable != NULL) {
					CWQuery* ext_query = App()->GetQuery(variable->QueryName);
					if(ext_query != NULL) {
						if(subs.GetSubscription(ext_query->Name) == NULL) {
							// no subscription - create one
							CWSubscription* new_sub = new CWSubscription();
							new_sub->Name = ext_query->Name;
							subs.AddUnique(new_sub);
						}
					}
				}
			}
		}
	}
	// ---

	int subs_count = subs.Count();
	int q_counter = 0;
	for(int i = 0; i < subs_count; i++)
	{
		CWSubscription* sub = subs.Items[i];

		CWQuery* query = App()->GetQuery(sub->Name);
		if(query == NULL)
		{
			if(pErrorMessage) *pErrorMessage = "Error detected while creating controller for page \"" + Name + "\": query \"" + sub->Name + "\" not found.";
			return false;
		}
		if(query != NULL && query->Name != "users_null" && query->Name != "users_empty")
		{
			if(q_counter > 0) {
				subscriptions.append(",");
			}
			subscriptions.append(LINE_TERM);
			subscriptions.append("\t\t\t");
			subscriptions.append("Meteor.subscribe(\"" + query->Name + "\"");

			string count_subs = "";
			count_subs.append(",");
			count_subs.append(LINE_TERM);
			count_subs.append("\t\t\t");
			count_subs.append("Meteor.subscribe(\"" + query->Name + "_count\"");

			string extra_var = "";
			if(App()->TemplatingName() == "blaze") {
				extra_var = "this." + ToCamelCase(query->Name, '_', false) + "ExtraParams";
			}
			if(App()->TemplatingName() == "react") {
				extra_var = ToCamelCase(query->Name, '_', false) + "ExtraParams";
			}

			string arguments = "";
			CWStringList tmp_vars;
			sub->GetSubscriptionArguments(App(), true, &arguments, &tmp_vars);
			subscriptions.append(arguments);
			count_subs.append(arguments);
			param_vars.Append(&tmp_vars);

			if(query->UsedByDataview) {
				subscriptions.append(", " + extra_var);
				count_subs.append(", " + extra_var);
			}

			subscriptions.append(")");
			count_subs.append(")");
			
			if(query->UsedByDataview) {
				subscriptions.append(count_subs);
			}

			int default_page_size = 0;
			if(query->UsedByDataview) {
				CWArray<CWField*> *collection_fields = NULL;
				CWArray<CWComponent*> components_using_query;
				GetComponentsUsingQuery(query, &components_using_query);
				for(int z = 0; z < components_using_query.Count(); z++) {
					CWComponent* component_using_query = components_using_query.Items[z];
					CWDataView* dataview = dynamic_cast<CWDataView*>(component_using_query);
					if(dataview != NULL) {
						collection_fields = dataview->GetFields();
						default_page_size = dataview->PageSize;
					}
				}
				if(collection_fields == NULL) {
					CWCollection* collection = App()->GetCollection(query->Collection);
					if(collection != NULL) {
						collection_fields = collection->Fields;
					}
				}
				
				string search_fields = "";
				if(collection_fields != NULL) {
					// search fields
					int search_field_count = 0;
					for(int i = 0; i < collection_fields->Count(); i++)
					{
						CWField* field = collection_fields->Items[i];
						if(field != NULL)
						{
							if(field->Searchable)
							{
								if(search_field_count > 0)
									search_fields.append(", ");
								search_fields.append("\"" + field->Name + "\"");
								search_field_count++;
							}
						}
					}
				}

				string query_var = ToCamelCase(query->Name, '_', true);
				string subscription_params = before_subscription_template;
				ReplaceSubString(&subscription_params, "EXTRA_PARAMS", extra_var);
				ReplaceSubString(&subscription_params, "SEARCH_STRING_SESSION_VAR", query_var + "SearchString");
				ReplaceSubString(&subscription_params, "SEARCH_FIELDS_SESSION_VAR", query_var + "SearchFields");
				ReplaceSubString(&subscription_params, "/*SEARCH_FIELDS*/", search_fields);
				ReplaceSubString(&subscription_params, "SORT_BY_SESSION_VAR", query_var + "SortBy");
				ReplaceSubString(&subscription_params, "SORT_ASCENDING_SESSION_VAR", query_var + "SortAscending");
				ReplaceSubString(&subscription_params, "PAGE_NO_SESSION_VAR", query_var + "PageNo");
				ReplaceSubString(&subscription_params, "PAGE_SIZE_SESSION_VAR", query_var + "PageSize");
				ReplaceSubString(&subscription_params, "PAGE_COUNT_VAR", FromCamelCase(query_var + "PageSize", '_', true));
				ReplaceSubString(&subscription_params, "DEFAULT_PAGE_SIZE", IntToStr(default_page_size));
				
				BeforeSubscriptionCode.append(subscription_params);
				
				if(pCollectionIncludes != NULL) {
					pCollectionIncludes->AddUnique("import * as databaseUtils from \"" + App()->RelativeToOutputDir(App()->BothLibDir + "database_utils", true) + "\";");
				}
			}

			q_counter++;
		}
	}

	subscriptions.append(LINE_TERM);
	subscriptions.append("\t\t");
	ReplaceSubString(pJS, "/*SUBSCRIPTIONS*/", subscriptions);
	ReplaceSubString(pJS, "/*SUBSCRIPTION_PARAMS*/", param_vars.GetText());

	string before_subscription_code = "";
	GetBeforeSubscriptionCode(&before_subscription_code);
	ReplaceSubString(pJS, "/*BEFORE_SUBSCRIPTION_CODE*/", before_subscription_code);

	// ---
	// wait function
	// ---
	string wait_function = "";
	wait_function.append("return [");
	wait_function.append(subscriptions);
	wait_function.append("];");
	wait_function.append(LINE_TERM);
	wait_function.append("\t\t");
	ReplaceSubString(pJS, "/*WAIT_FUNCTION*/", wait_function);
	// ---

	// ---
	// data function
	// ---
	string data_object = "";
	param_vars.Clear();
	data_object.append("{");
	data_object.append(LINE_TERM);
	if(App()->TemplatingName() == "blaze")
	{
		data_object.append("\t\t\t");
		data_object.append("params: " + params_path + " || {}");
	}
	if(App()->TemplatingName() == "react")
	{
/*
		data_object.append("\t\t\t\t");
		data_object.append("routeParams: props.routeParams || {},");
		data_object.append(LINE_TERM);
		data_object.append("\t\t\t\t");
		data_object.append("routeQuery: props.routeQuery || {}");
*/
	}

	string custom_data_code = "";
	GetCustomDataCode(&custom_data_code);

	for(int i = 0; i < subs_count; i++)
	{
		CWSubscription* sub = subs.Items[i];
		CWQuery* query = App()->GetQuery(sub->Name);
		string find_function = "";
		if(!query->ClientFindFunction(sub->Params, &find_function, &param_vars, pCollectionIncludes, pErrorMessage)) {
			return false;
		}

		if((App()->TemplatingName() == "react" && i > 0) || App()->TemplatingName() == "blaze") data_object.append(",");

		data_object.append(LINE_TERM);
		data_object.append("\t\t\t");
		if(App()->TemplatingName() == "react") data_object.append("\t");

		data_object.append(query->Name + ": " + find_function);

		if(App()->TemplatingName() == "react" && !query->FindOne) data_object.append(".fetch()");
		
		string extra_var = "";
		if(App()->TemplatingName() == "blaze") {
			extra_var = "this." + ToCamelCase(query->Name, '_', false) + "ExtraParams";
		}
		if(App()->TemplatingName() == "react") {
			extra_var = ToCamelCase(query->Name, '_', false) + "ExtraParams";
		}
		
		string query_var = ToCamelCase(query->Name, '_', true);

		if(query->UsedByDataview) {
			data_object.append(",");
			data_object.append(LINE_TERM);
			data_object.append("\t\t\t");
			if(App()->TemplatingName() == "react") data_object.append("\t");
			data_object.append(query->Name + "_count: Counts.get(\"" + query->Name + "_count\")");

			string page_count_code = "";
			page_count_code.append(LINE_TERM);
			page_count_code.append("\t\t");
			page_count_code.append("data." + query->Name + "_page_count = " + extra_var + " && " + extra_var + ".pageSize ? Math.ceil(data." + query->Name + "_count / " + extra_var + ".pageSize) : 1;");
			page_count_code.append(LINE_TERM);
			
			page_count_code.append("\t\t");
			page_count_code.append("if(");
			if(App()->TemplatingName() == "blaze") page_count_code.append("this.isReady() && ");
			page_count_code.append(extra_var + ".pageNo >= data." + query->Name + "_page_count) {");
			page_count_code.append(LINE_TERM);

			page_count_code.append("\t\t\t");
			page_count_code.append("Session.set(\"" + query_var + "PageNo\", data." + query->Name + "_page_count > 0 ? data." + query->Name + "_page_count - 1 : 0);");
			page_count_code.append(LINE_TERM);

			page_count_code.append("\t\t");
			page_count_code.append("}");
			page_count_code.append(LINE_TERM);
			
			custom_data_code = page_count_code + custom_data_code;
		}
	}
	data_object.append(LINE_TERM);
	data_object.append("\t\t");
	if(App()->TemplatingName() == "react") data_object.append("\t");
	data_object.append("};");
	data_object.append(LINE_TERM);
	data_object.append("\t\t");

	string data_object_set = "data = " + data_object;
	string data_var_object_set = "var " + data_object_set;
	string data_function = "return " + data_object;

	ReplaceSubString(pJS, "/*DATA_OBJECT*/", data_object);
	ReplaceSubString(pJS, "/*DATA_OBJECT_SET*/", data_object_set);
	ReplaceSubString(pJS, "/*DATA_VAR_OBJECT_SET*/", data_var_object_set);
	InsertBeforeSubString(pJS, "/*DATA_FUNCTION*/", data_function);
	ReplaceSubString(pJS, "/*DATA_PARAMS*/", param_vars.GetText());
	ReplaceSubString(pJS, "/*CUSTOM_DATA_CODE*/", custom_data_code);
	
	CWZone* this_zone = dynamic_cast<CWZone*>(this);
	if(this_zone != NULL) {
		if(this_zone->ZoneType == ztFree) {
			ReplaceSubString(pJS, "/*FREE_DATA_OBJECT*/", data_object);
			ReplaceSubString(pJS, "/*FREE_DATA_OBJECT_SET*/", data_object_set);
			ReplaceSubString(pJS, "/*FREE_DATA_VAR_OBJECT_SET*/", data_var_object_set);
			ReplaceSubString(pJS, "/*FREE_DATA_PARAMS*/", param_vars.GetText());
			ReplaceSubString(pJS, "/*FREE_BEFORE_SUBSCRIPTION_CODE*/", before_subscription_code);
			ReplaceSubString(pJS, "/*FREE_CUSTOM_DATA_CODE*/", custom_data_code);
			ReplaceSubString(pJS, "/*FREE_DATA_FUNCTION*/", data_function);
		}
		if(this_zone->ZoneType == ztPublic) {
			ReplaceSubString(pJS, "/*PUBLIC_DATA_OBJECT*/", data_object);
			ReplaceSubString(pJS, "/*PUBLIC_DATA_OBJECT_SET*/", data_object_set);
			ReplaceSubString(pJS, "/*PUBLIC_DATA_VAR_OBJECT_SET*/", data_var_object_set);
			ReplaceSubString(pJS, "/*PUBLIC_DATA_PARAMS*/", param_vars.GetText());
			ReplaceSubString(pJS, "/*PUBLIC_BEFORE_SUBSCRIPTION_CODE*/", before_subscription_code);
			ReplaceSubString(pJS, "/*PUBLIC_CUSTOM_DATA_CODE*/", custom_data_code);
			ReplaceSubString(pJS, "/*PUBLIC_DATA_FUNCTION*/", data_function);
		}
		if(this_zone->ZoneType == ztPrivate) {
			ReplaceSubString(pJS, "/*PRIVATE_DATA_OBJECT*/", data_object);
			ReplaceSubString(pJS, "/*PRIVATE_DATA_OBJECT_SET*/", data_object_set);
			ReplaceSubString(pJS, "/*PRIVATE_DATA_VAR_OBJECT_SET*/", data_var_object_set);
			ReplaceSubString(pJS, "/*PRIVATE_DATA_PARAMS*/", param_vars.GetText());
			ReplaceSubString(pJS, "/*PRIVATE_BEFORE_SUBSCRIPTION_CODE*/", before_subscription_code);
			ReplaceSubString(pJS, "/*PRIVATE_CUSTOM_DATA_CODE*/", custom_data_code);
			ReplaceSubString(pJS, "/*PRIVATE_DATA_FUNCTION*/", data_function);
		}
	}
	// ---

	return true;
}

bool CWPage::CreateControllerBlaze(string* pJS, string* pErrorMessage)
{
	ReplaceSubString(pJS, "CONTROLLER_NAME", ControllerName());

	string controller_before_action = ControllerBeforeAction;
	string controller_after_action = ControllerAfterAction;

	if(controller_before_action == "") controller_before_action = "this.next();";

	ReplaceSubString(pJS, "/*BEFORE_FUNCTION*/", controller_before_action);
	ReplaceSubString(pJS, "/*AFTER_FUNCTION*/", controller_after_action);

	// ---
	// yields
	// ---
	string render_function = "";
	string top_template = "";
	CWStringList yields;
	CWStringList templates;
	CWStringList regions;
	bool zone_is_not_root = false;
	GetYields(&top_template, &yields, &templates, &regions, &zone_is_not_root);

	if(yields.Count() == 0)
	{
		ReplaceSubString(pJS, "TEMPLATE_NAME", TemplateName());
		render_function = "if(this.isReady()) { this.render(); } else { this.render(\"loading\"); }";
	}
	else
	{
		ReplaceSubString(pJS, "TEMPLATE_NAME", top_template);

		string yield_templates = "";
		int yield_count = yields.Count();
		for(int i = 0; i < yield_count; i++)
		{
			if(i > 0)
			{
				yield_templates.append(",");
				yield_templates.append(LINE_TERM);
				yield_templates.append("\t\t");
			}
			yield_templates.append(yields.Strings[i].c_str());
		}
		yield_templates.append(LINE_TERM);
		yield_templates.append("\t\t");
		ReplaceSubString(pJS, "/*YIELD_TEMPLATES*/", yield_templates);

		string render_loading = "this.render(\"loading\", { to: \"" + regions.Strings[regions.Count() - 1] + "\" });";
	
		if(zone_is_not_root) {
			render_function = "this.layout(\"" + top_template + "\");";
			render_function.append(LINE_TERM);
			render_function.append("\t\t");
		}

		render_function.append("if(this.isReady()) { this.render(); } else { this.render(\"" + top_template + "\"); " + render_loading + "}");
	}

	// layout template
	string layout_template = "";
	if(LayoutTemplate != "") {
		layout_template = "layoutTemplate: \"" + LayoutTemplate + "\",";	
	}

	if(ParentLayout)
	{
		CWPage* parent_page = ParentPage(false);
		if(parent_page != NULL)
			layout_template = "layoutTemplate: \"" + parent_page->TemplateName() + "\",";
	}
	ReplaceSubString(pJS, "/*LAYOUT_TEMPLATE*/", layout_template);
	// ---
	// action function
	// ---
	string action_function = render_function;

	if(Name == "logout") action_function = "App.logout();";

	// redirect to first subpage
	CWPage* redirect_to_subpage = RedirectToSubpage();
	if(redirect_to_subpage != NULL)//HasMenuWithSubpageRoute() !!!
	{
		action_function = "this.redirect('" + redirect_to_subpage->Route() + "', this.params || {}, { replaceState: true });";
	}

	action_function.append(LINE_TERM);
	action_function.append("\t\t");
	InsertBeforeSubString(pJS, "/*ACTION_FUNCTION*/", action_function);

	if(!CreateSubscriptions(pJS, NULL, pErrorMessage)) {
		return false;
	}

	ReplaceSubString(pJS, "META_TITLE", GetMetaTitle());
	ReplaceSubString(pJS, "META_DESCRIPTION", GetDescription());

	return true;
}

void MountSubtemplates(string* pMount, CWStringList* pTemplateNames, int iPos, int iStop, int iDepth)
{
	if(iPos < 0) return;

	string tabs = "";
	for(int i = 0; i < iDepth + 4; i++)
		tabs.append("\t");

	pMount->append(" subcontent={");
	pMount->append(LINE_TERM);
	pMount->append(tabs);
	pMount->append("\t<" + pTemplateNames->Strings[iPos] + "Container");
	pMount->append(" routeParams={routeParams}");
	if(iPos > iStop) { 
		MountSubtemplates(pMount, pTemplateNames, iPos - 1, iStop, iDepth + 1);
	}
	pMount->append(" />");
	pMount->append(LINE_TERM);
	pMount->append(tabs);
	pMount->append("}");
}

bool CWPage::CreateControllerReact(string* pJS, string* pErrorMessage)
{
	string relative_page_path = App()->RelativeToOutputDir(AddDirSeparator(App()->ClientViewsDir) + ChangeFileExt(DestDir() + DestFilename(), ".jsx"), true);
	string page_import_string = "import {" + TemplateName() + "Container} from \"" + relative_page_path + "\";" + LINE_TERM;

	InsertBeforeSubString(pJS, "/*IMPORTS*/", page_import_string);
	
	string route_template_filename = App()->TemplateCodeDir + "route_client.jsx";
	string route = "";
	if(!FileLoadString(route_template_filename, &route, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading \"" + route_template_filename + "\". " + *pErrorMessage;
		return false;
	}
	
	string controller_before_action = ControllerBeforeAction;
	string controller_after_action = ControllerAfterAction;

	// redirect to first subpage
	CWPage* redirect_to_subpage = RedirectToSubpage();
	if(redirect_to_subpage != NULL)
	{
		if(controller_before_action != "") {
			controller_before_action.append(LINE_TERM);
			controller_before_action.append("\t\t\t");
		}
		controller_before_action.append("FlowRouter.withReplaceState(function() {");
		controller_before_action.append(LINE_TERM);
		controller_before_action.append("\t\t\t\tredirect(\"" + redirect_to_subpage->Route() + "\", context.params, context.queryParams);");
		controller_before_action.append(LINE_TERM);
		controller_before_action.append("\t\t\t});");
		controller_before_action.append(LINE_TERM);
	}

	ReplaceSubString(&route, "/*BEFORE_FUNCTION*/", controller_before_action);
	ReplaceSubString(&route, "/*AFTER_FUNCTION*/", controller_after_action);

	string route_group = "";
	switch(GetZoneType())
	{
		case ztFree: route_group = "freeRoutes"; break;
		case ztPublic: route_group = "publicRoutes"; break;
		case ztPrivate: route_group = "privateRoutes"; break;
		default: route_group = "FlowRouter";
	}


	// ---
	// yields
	// ---
	string render_function = "";
	string top_template = "";
	CWStringList yields;
	CWStringList templates;
	CWStringList regions;
	bool zone_is_not_root = false;
	GetYields(&top_template, &yields, &templates, &regions, &zone_is_not_root);
	if(top_template == "") top_template = TemplateName();
	string mount_point = "";
	if(redirect_to_subpage == NULL)
	{
		if(zone_is_not_root && templates.Count() > 0) {
			mount_point.append("reactMount(" + top_template + "Container, {");
			mount_point.append(LINE_TERM);
			mount_point.append("\t\t\trouteParams: routeParams,");
			mount_point.append(LINE_TERM);
			mount_point.append("\t\t\tsubcontent: (");
			mount_point.append(LINE_TERM);
			mount_point.append("\t\t\t\t<" + templates.Strings[templates.Count() - 1] + "Container");
			mount_point.append(" routeParams={routeParams}");
			if(templates.Count() > 1) {
				MountSubtemplates(&mount_point, &templates, templates.Count() - 2, 0, 0);
			}
			mount_point.append(" />");
			mount_point.append(LINE_TERM);
			mount_point.append("\t\t\t)");
			mount_point.append(LINE_TERM);


			mount_point.append("\t\t});");
			mount_point.append(LINE_TERM);
		} else {
			mount_point.append("reactMount(LayoutContainer, {");
			mount_point.append(LINE_TERM);
			mount_point.append("\t\t\tcontent: (");
			mount_point.append(LINE_TERM);
			mount_point.append("\t\t\t\t<" + top_template + "Container");
			mount_point.append(" routeParams={routeParams}");
			MountSubtemplates(&mount_point, &templates, templates.Count() - 1, 0, 0);
			mount_point.append(" />");
			mount_point.append(LINE_TERM);
			mount_point.append("\t\t\t)");
			mount_point.append(LINE_TERM);
			mount_point.append("\t\t});");
			mount_point.append(LINE_TERM);
		}

	}

	// ---
	// action function
	// ---
	string action_function = mount_point;
	ReplaceSubString(&route, "/*ACTION_FUNCTION*/", action_function);

	ReplaceSubString(&route, "ROUTE_GROUP", route_group);
	ReplaceSubString(&route, "ROUTE_URL", URL());
	ReplaceSubString(&route, "ROUTE_NAME", Route());
	ReplaceSubString(&route, "ROUTE_TITLE", EscapeJSON(GetTitle()));
	ReplaceSubString(&route, "TEMPLATE_NAME", TemplateName());

	pJS->append(LINE_TERM);
	pJS->append(route);

	return true;
}

bool CWPage::CreateController(string* pJS, string* pErrorMessage)
{
	string templating_name = App()->TemplatingName();

	if(templating_name == "blaze" && !CreateControllerBlaze(pJS, pErrorMessage)) return false;
	if(templating_name == "react" && !CreateControllerReact(pJS, pErrorMessage)) return false;

	return true;
}

bool CWPage::CreatePageBlaze(CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string container_class = ContainerClass;

	// add zone's container class to page's container
	CWPage* parent_page = ParentPage(true);
	if(dynamic_cast<CWZone*>(parent_page) != NULL)
	{
		string parent_class = parent_page->ContainerClass;
		if(parent_class != "") container_class = parent_class + " " + container_class;
	}

	if(container_class == "" && !UserDefinedTemplate)
	{
		string frontend = App()->FrontendName();
		if(frontend == "bootstrap3-raw" || frontend == "bootstrap3") container_class = "container";
		if(frontend == "semantic-ui") container_class = "ui container";
	}

	CWNode* container_node = pHTML->FindChild(".page-container", true, true);
	if(container_node != NULL && container_class != "") container_node->AddClass(container_class);

	CWNode* title_node = pHTML->FindChild("#page_title", true, true);
	if(title_node && Title == "") pHTML->DeleteChild(title_node, true);

	CWNode* text_node = pHTML->FindChild("#page_text", true, true);
	if(text_node && Text == "") pHTML->DeleteChild(text_node, true);

	CWNode* content_node = pHTML->FindChild("#content", true, true);
	if(content_node && Class != "") content_node->AddClass(Class);

	CWNode* background_node = pHTML->FindChild("#background-image", true, true);
	if(background_node && BackgroundImage == "") pHTML->DeleteChild(background_node, true);

	CWNode* page_menu_node = pHTML->FindChild("#page_menu", true, true);
	if(page_menu_node != NULL && !HasComponentWithDestination("#page_menu", true)) pHTML->DeleteChild(page_menu_node, true);

	string title = Title;

	CWNode* title_icon_node = pHTML->FindChild("#page-title-icon", true, true);
	if(title_icon_node != NULL)
	{
		if(TitleIconClass == "")
			pHTML->DeleteChild(title_icon_node, true);
		else
		{
			if(title != "") title = "&nbsp;" + title;
			title_icon_node->Attr->DeleteNameValue("id");
		}
	}

	pHTML->Replace("PAGE_TITLE_ICON_CLASS", TitleIconClass, true, true);
	pHTML->Replace("PAGE_TITLE", title, true, true);
	pHTML->Replace("PAGE_TEXT", Text, true, true);
	pHTML->Replace("APP_TITLE", App()->Title, true, true);
	pHTML->Replace("FOOTER_TEXT", GetFooterText(), true, true);
	pHTML->Replace("BACKGROUND_IMAGE", BackgroundImage, true, true);

	CWNode* close_button = pHTML->FindChild("#page-close-button", true, true);
	if(close_button != NULL && CloseRoute == "") pHTML->DeleteChild(close_button, true);

	CWNode* back_button = pHTML->FindChild("#page-back-button", true, true);
	if(back_button && BackRoute == "") pHTML->DeleteChild(back_button, true);

	string close_link = "{{pathFor \'" + CloseRoute + "\'}}";
	string back_link = "{{pathFor \'" + BackRoute + "\'}}";

	pHTML->Replace("CLOSE_LINK", close_link, true, true);
	pHTML->Replace("BACK_LINK", back_link, true, true);

    if(CloseRoute != "")
    {
        string close_action_code = "";
        close_action_code.append(LINE_TERM);
        close_action_code.append("\t\"click #page-close-button\": function(e, t) {");
        close_action_code.append(LINE_TERM);
        close_action_code.append("\t\te.preventDefault();");
        close_action_code.append(LINE_TERM);
        close_action_code.append("\t\tRouter.go(\"" + CloseRoute + "\", mergeObjects(Router.currentRouteParams(), { " + CloseRouteParams->AsString() + " }));");
        close_action_code.append(LINE_TERM);
        close_action_code.append("\t}");

        if(AddEvents != "") AddEvents = EnsureLastChar(AddEvents, ',');
        AddEvents.append(close_action_code);
    }
	ReplaceSubString(pJS, "/*CLOSE_ROUTE_PARAMS*/", CloseRouteParams->AsString());
	ReplaceSubString(pJS, "CLOSE_ROUTE", CloseRoute);

    if(BackRoute != "")
    {
        string back_action_code = "";
        back_action_code.append(LINE_TERM);
        back_action_code.append("\t\"click #page-back-button\": function(e, t) {");
        back_action_code.append(LINE_TERM);
        back_action_code.append("\t\te.preventDefault();");
        back_action_code.append(LINE_TERM);
        back_action_code.append("\t\tRouter.go(\"" + BackRoute + "\", mergeObjects(Router.currentRouteParams(), { " + BackRouteParams->AsString() + " }));");
        back_action_code.append(LINE_TERM);
        back_action_code.append("\t}");

        if(AddEvents != "") AddEvents = EnsureLastChar(AddEvents, ',');
        AddEvents.append(back_action_code);
    }
	ReplaceSubString(pJS, "/*BACK_ROUTE_PARAMS*/", BackRouteParams->AsString());
	ReplaceSubString(pJS, "BACK_ROUTE", BackRoute);

	string events_code = AddEvents;
	if(events_code != "" && EventsCode != "") events_code = EnsureLastChar(events_code, ',') + LINE_TERM;
	events_code.append(EventsCode);
	if(events_code != "")
	{
		int events_pos = FindSubString(pJS, "/*EVENTS_CODE*/");
		if(events_pos >= 0)
		{
			size_t events_function_pos = pJS->rfind(".events", events_pos);
			if(events_function_pos != string::npos)
			{
				size_t last_closed_brace = pJS->rfind("}", events_pos);
				if(last_closed_brace != string::npos && last_closed_brace > events_function_pos)
				{
					pJS->insert(last_closed_brace + 1, ", ");
				}
			}
		}
	}

	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++) {
		CWComponent* component = Components->Items[i];
		if(component != NULL) {
			if(component->ShowCondition != "") {
				string show_condition_helper_name = ToCamelCase(component->Name, '_', true) + "ShowCondition";
				string show_condition_helper = "";
				show_condition_helper.append(LINE_TERM);
				show_condition_helper.append("\t\"" + show_condition_helper_name + "\": function() {" + LINE_TERM);
				show_condition_helper.append("\t\t" + component->ShowCondition + "\n");
				show_condition_helper.append("\t}");

				if(AddHelpers != "") AddHelpers = EnsureLastChar(AddHelpers, ',') + LINE_TERM;
				AddHelpers.append(show_condition_helper);
			}
		}
	}

	string helpers_code = AddHelpers;
	if(helpers_code != "" && HelpersCode != "") helpers_code = EnsureLastChar(helpers_code, ',') + LINE_TERM;
	helpers_code.append(HelpersCode);
	if(helpers_code != "")
	{
		int helpers_pos = FindSubString(pJS, "/*HELPERS_CODE*/");
		if(helpers_pos >= 0)
		{
			size_t helpers_function_pos = pJS->rfind(".helpers", helpers_pos);
			if(helpers_function_pos != string::npos)
			{
				size_t last_closed_brace = pJS->rfind("}", helpers_pos);
				if(last_closed_brace != string::npos && last_closed_brace > helpers_function_pos)
				{
					pJS->insert(last_closed_brace + 1, ", ");
				}
			}
		}
	}

	ReplaceSubString(pJS, "/*EVENTS_CODE*/", events_code);
	ReplaceSubString(pJS, "/*HELPERS_CODE*/", helpers_code);

	ReplaceSubString(pJS, "/*TEMPLATE_CREATED_CODE*/", TemplateCreatedCode);
	ReplaceSubString(pJS, "/*TEMPLATE_RENDERED_CODE*/", TemplateRenderedCode);
	ReplaceSubString(pJS, "/*TEMPLATE_DESTROYED_CODE*/", TemplateDestroyedCode);

	// special processing for login form
	if(ChangeFileExt(Template, "") == "login")
	{
		if(App()->Router->GetRoute("register") == NULL)
		{
			// delete link to register form
			CWNode* register_link = pHTML->FindChild("#register-link", true, true);
			if(register_link != NULL) pHTML->DeleteChild(register_link, true);
		}

		if(!App()->LoginWithGoogle) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-google", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithGithub) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-github", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithLinkedin) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-linkedin", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithFacebook) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-facebook", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithTwitter) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-twitter", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithMeteor) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-meteor", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithAuth0) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-auth0", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithPassword) {
			CWNode* pass_form = pHTML->FindChild("#login-with-password", true, true);
			if(pass_form != NULL) pHTML->DeleteChild(pass_form, true);
		}
	}

	return true;
}

bool CWPage::CreatePageReact(CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string container_class = ContainerClass;

	// add zone's container class to page's container
	CWPage* parent_page = ParentPage(true);
	if(dynamic_cast<CWZone*>(parent_page) != NULL)
	{
		string parent_class = parent_page->ContainerClass;
		if(parent_class != "") container_class = parent_class + " " + container_class;
	}

	if(container_class == "" && !UserDefinedTemplate)
	{
		string frontend = App()->FrontendName();
		if(frontend == "bootstrap3-raw" || frontend == "bootstrap3") container_class = "container";
		if(frontend == "semantic-ui") container_class = "ui container";
	}

	CWNode* container_node = pHTML->FindChild(".page-container", true, true);
	if(container_node != NULL && container_class != "") container_node->AddClass(container_class);

	CWNode* title_node = pHTML->FindChild("#page_title", true, true);
	if(title_node && Title == "") pHTML->DeleteChild(title_node, true);

	CWNode* background_node = pHTML->FindChild("#background-image", true, true);
	if(background_node && BackgroundImage == "") pHTML->DeleteChild(background_node, true);

	CWNode* text_node = pHTML->FindChild("#page_text", true, true);
	if(text_node && Text == "") pHTML->DeleteChild(text_node, true);

	CWNode* content_node = pHTML->FindChild("#content", true, true);
	if(content_node && Class != "") content_node->AddClass(Class);

	CWNode* page_menu_node = pHTML->FindChild("#page_menu", true, true);
	if(page_menu_node != NULL && !HasComponentWithDestination("#page_menu", true)) pHTML->DeleteChild(page_menu_node, true);

	string title = Title;

	CWNode* title_icon_node = pHTML->FindChild("#page-title-icon", true, true);
	if(title_icon_node != NULL)
	{
		if(TitleIconClass == "")
			pHTML->DeleteChild(title_icon_node, true);
		else
		{
			if(title != "") title = "&nbsp;" + title;
			title_icon_node->Attr->DeleteNameValue("id");
		}
	}

	pHTML->Replace("PAGE_TITLE_ICON_CLASS", TitleIconClass, true, true);
	pHTML->Replace("PAGE_TITLE", title, true, true);
	pHTML->Replace("PAGE_TEXT", Text, true, true);
	pHTML->Replace("APP_TITLE", App()->Title, true, true);
	pHTML->Replace("FOOTER_TEXT", GetFooterText(), true, true);
	pHTML->Replace("BACKGROUND_IMAGE", BackgroundImage, true, true);

	CWNode* close_button = pHTML->FindChild("#page-close-button", true, true);
	if(close_button != NULL) {
		if(CloseRoute == "") 
			pHTML->DeleteChild(close_button, true);
		else
		{
			close_button->Attr->SetValue("onClick", "{this.onClose}");
		}
	}

	CWNode* back_button = pHTML->FindChild("#page-back-button", true, true);
	if(back_button != NULL) {
		if(BackRoute == "") 
			pHTML->DeleteChild(back_button, true);
		else
		{
			CWNode* back_button_clickable = back_button->FindChild(".page-back-button", true, true);
			if(back_button_clickable != NULL) {
				back_button_clickable->Attr->SetValue("onClick", "{this.onBack}");				
			} else {
				back_button->Attr->SetValue("onClick", "{this.onBack}");				
			}
		}
	}

	string close_link = "{{pathFor \'" + CloseRoute + "\'}}";
	string back_link = "{{pathFor \'" + BackRoute + "\'}}";

	pHTML->Replace("CLOSE_LINK", close_link, true, true);
	pHTML->Replace("BACK_LINK", back_link, true, true);

    if(CloseRoute != "")
    {
        string close_action_code = "";
        close_action_code.append(LINE_TERM);
        close_action_code.append("\tonClose(e) {");
        close_action_code.append(LINE_TERM);
        close_action_code.append("\t\te.preventDefault();");
        close_action_code.append(LINE_TERM);
        close_action_code.append("\t\tFlowRouter.go(\"" + CloseRoute + "\", mergeObjects(this.props.data.routeParams, { " + CloseRouteParams->AsString() + " }));");
        close_action_code.append(LINE_TERM);
        close_action_code.append("\t}");

        AddEvents.append(close_action_code);
		AddBindings->Add("onClose");
    }
	pHTML->Replace("/*CLOSE_ROUTE_PARAMS*/", CloseRouteParams->AsString(), true, true);
	pHTML->Replace("CLOSE_ROUTE", CloseRoute, true, true);

    if(BackRoute != "")
    {
        string back_action_code = "";
        back_action_code.append(LINE_TERM);
        back_action_code.append("\tonBack(e) {");
        back_action_code.append(LINE_TERM);
        back_action_code.append("\t\te.preventDefault();");
        back_action_code.append(LINE_TERM);
        back_action_code.append("\t\tFlowRouter.go(\"" + BackRoute + "\", mergeObjects(this.props.data.routeParams, { " + BackRouteParams->AsString() + " }));");
        back_action_code.append(LINE_TERM);
        back_action_code.append("\t}");

        AddEvents.append(back_action_code);
		AddBindings->Add("onBack");
    }
	pHTML->Replace("/*BACK_ROUTE_PARAMS*/", BackRouteParams->AsString(), true, true);
	pHTML->Replace("BACK_ROUTE", BackRoute, true, true);


	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++) {
		CWComponent* component = Components->Items[i];
		if(component != NULL) {
			if(component->ShowCondition != "") {
				string show_condition_helper_name = ToCamelCase(component->Name, '_', true) + "ShowCondition";
				string show_condition_helper = "";
				show_condition_helper.append(LINE_TERM);
				show_condition_helper.append("\t" + show_condition_helper_name + "() {" + LINE_TERM);
				show_condition_helper.append("\t\t" + component->ShowCondition + "\n");
				show_condition_helper.append("\t}");
				show_condition_helper.append(LINE_TERM);
				AddHelpers.append(show_condition_helper);
			}
		}
	}

	string events_code = AddEvents;
	if(events_code != "" && EventsCode != "") events_code = events_code + LINE_TERM;
	events_code.append(EventsCode);
	pHTML->Replace("/*EVENTS_CODE*/", events_code, true, true);

	string helpers_code = AddHelpers;
	if(helpers_code != "" && HelpersCode != "") helpers_code = helpers_code + LINE_TERM;
	helpers_code.append(HelpersCode);
	pHTML->Replace("/*HELPERS_CODE*/", helpers_code, true, true);

	pHTML->Replace("/*TEMPLATE_CREATED_CODE*/", TemplateCreatedCode, true, true);
	pHTML->Replace("/*TEMPLATE_RENDERED_CODE*/", TemplateRenderedCode, true, true);
	pHTML->Replace("/*TEMPLATE_DESTROYED_CODE*/", TemplateDestroyedCode, true, true);

	string bindings = "";
	int bindings_count = AddBindings->Count();
	for(int i = 0; i < bindings_count; i++) {
		if(bindings != "") bindings = bindings + "\t\t";
		bindings = bindings + "this." + AddBindings->Strings[i] + " = this." + AddBindings->Strings[i] + ".bind(this);\n";
	}
	pHTML->Replace("/*BINDINGS*/", bindings, true, true);


	// special processing for login form
	if(ChangeFileExt(Template, "") == "login")
	{
		if(App()->Router->GetRoute("register") == NULL)
		{
			// delete link to register form
			CWNode* register_link = pHTML->FindChild("#register-link", true, true);
			if(register_link != NULL) pHTML->DeleteChild(register_link, true);
		}

		if(!App()->LoginWithGoogle) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-google", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithGithub) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-github", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithLinkedin) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-linkedin", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithFacebook) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-facebook", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithTwitter) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-twitter", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithMeteor) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-meteor", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithAuth0) {
			CWNode* oauth_button = pHTML->FindChild("#login-with-auth0", true, true);
			if(oauth_button != NULL) pHTML->DeleteChild(oauth_button, true);
		}

		if(!App()->LoginWithPassword) {
			CWNode* pass_form = pHTML->FindChild("#login-with-password", true, true);
			if(pass_form != NULL) pHTML->DeleteChild(pass_form, true);
		}
	}

	return true;
}

bool CWPage::CreatePage(CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string templating_name = App()->TemplatingName();

	if(templating_name == "blaze" && !CreatePageBlaze(pHTML, pJS, pErrorMessage)) return false;
	if(templating_name == "react" && !CreatePageReact(pHTML, pJS, pErrorMessage)) return false;

	return true;
}

bool CWPage::GeneratePageBlaze(string* pErrorMessage)
{
	App()->Log("Creating page \"" + Name + "\"...");




	CWNode* html = new CWNode();
	if(UserDefinedTemplate)
	{
		if(!html->ParseHTML(HTML, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error parsing HTML. " + *pErrorMessage;
			return false;
		}
	}
	else
	{
		// load html template
		string html_template_file = ChangeFileExt(TemplateFile(), ".html");
		if(!LoadHTML(html_template_file, html, pErrorMessage))
			return false;
	}
	CWNode* container_node = html->FindChild("template", true, true);
	if(container_node == NULL) container_node = html;

	string js = "";
	if(UserDefinedTemplate)
	{
		js = JS;
	}
	else
	{
		// load js template
		string js_template_file = ChangeFileExt(TemplateFile(), ".js");
		if(!FileLoadString(js_template_file, &js, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading \"" + js_template_file + "\". " + *pErrorMessage;
			return false;
		}
	}

	if(container_node->Name == "template")
	{
		container_node->Attr->SetValue("name", TemplateName());
		if(RedirectToSubpage() != NULL)
		{
			string subcontent_selector = "#subcontent";
			CWNode* subcontent_node = container_node->FindChild(subcontent_selector, true, true);
			if(subcontent_node == NULL)
			{
				subcontent_node = container_node->FindChild("#content", true, true);
				if(subcontent_node == NULL)
				{
					if(pErrorMessage) *pErrorMessage = "Error creating subpages. Template doesn't have #subcontent or #content element \"" + subcontent_selector + "\".";
					return false;
				}
			}
			subcontent_node->AppendText("{{> yield region='" + TemplateName() + "Subcontent'}}");
		}
	}
	ReplaceSubString(&js, "TEMPLATE_NAME", TemplateName());

	// create controller
	string controller_template_file = App()->TemplateCodeDir + "controller_client.js";
	string controller = "";
	if(!FileLoadString(controller_template_file, &controller, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading \"" + controller_template_file + "\". " + *pErrorMessage;
		return false;
	}
	if(!CreateController(&controller, pErrorMessage))
		return false;

	// create page
	if(!CreatePage(container_node, &js, pErrorMessage))
		return false;

	// create components
	for(int i = 0; i < Components->Count(); i++)
	{
		CWComponent* component = Components->Items[i];
		if(!component->Generate(html, container_node, &js, pErrorMessage))
			return false;
	}

	// if this page use reactive dict, add pageSession variable declaration to .js
	if(FindSubString(&js, "pageSession") >= 0 && FindSubString(&js, "var pageSession = new ReactiveDict();") < 0)
		js.insert(0, "var pageSession = new ReactiveDict();\n\n");

	// create destination directory
	string dest_dir = App()->ClientViewsDir + DestDir();
	if(!App()->MkDir(dest_dir, false, pErrorMessage))
		return false;

	// write html
	string html_dest_file = ChangeFileExt(dest_dir + DestFilename(), ".html");
	if(!App()->SaveHTML(html_dest_file, html, pErrorMessage))
		return false;

	// write js
	string js_dest_file = ChangeFileExt(dest_dir + DestFilename(), ".js");
	if(!App()->SaveString(js_dest_file, &js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing \"" + js_dest_file + "\". " + *pErrorMessage;
		return false;
	}

	// write controller
	string controller_dest_dir = dest_dir;
	if(!App()->MkDir(controller_dest_dir, false, pErrorMessage))
		return false;

	string controller_dest_file = controller_dest_dir + ExtractFileName(AddSuffixToFileName(js_dest_file, "_controller"));
	if(!App()->SaveString(controller_dest_file, &controller, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing \"" + controller_dest_file + "\". " + *pErrorMessage;
		return false;
	}

	// create sub pages
	int page_count = Pages->Count();
	for(int i = 0; i < page_count; i++)
		if(!Pages->Items[i]->GeneratePage(pErrorMessage))
			return false;

	return true;
}

bool CWPage::GeneratePageReact(string* pErrorMessage)
{
	App()->Log("Creating page \"" + Name + "\"...");


	CWNode* jsx = new CWNode();
	if(UserDefinedTemplate)
	{
		if(!jsx->ParseJSX(JSX, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error parsing JSX. " + *pErrorMessage;
			return false;
		}
	}
	else
	{
		// load html template
		string jsx_template_file = ChangeFileExt(TemplateFile(), ".jsx");
		if(!LoadJSX(jsx_template_file, jsx, pErrorMessage))
			return false;
	}

	jsx->Replace("TEMPLATE_NAME", TemplateName(), true, true);

	int includes_count = Imports->Count();
	for(int i = 0; i < includes_count; i++)
	{
		string include = EnsureLastChar(App()->ReplaceDirAlias(Imports->Strings[i], true, true), ';');
		if(IncludeFiles->Find(include) < 0)
			IncludeFiles->Add(include);
	}
/*
}
	if(jsx->Name == "template")
	{
		jsx->Attr->SetValue("name", TemplateName());
		if(RedirectToSubpage() != NULL)
		{
			string subcontent_selector = "#subcontent";
			CWNode* subcontent_node = jsx->FindChild(subcontent_selector, true, true);
			if(subcontent_node == NULL)
			{
				subcontent_node = jsx->FindChild("#content", true, true);
				if(subcontent_node == NULL)
				{
					if(pErrorMessage) *pErrorMessage = "Error creating subpages. Template doesn't have #subcontent or #content element \"" + subcontent_selector + "\".";
					return false;
				}
			}
			subcontent_node->AppendText("{{> yield region='" + TemplateName() + "Subcontent'}}");
		}
	}
*/
//	ReplaceSubString(&js, "TEMPLATE_NAME", TemplateName());

	// create controller
	string controller_template_file = App()->ClientRouterDir + "router.jsx";
	string controller = "";
	if(!FileLoadString(controller_template_file, &controller, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading \"" + controller_template_file + "\". " + *pErrorMessage;
		return false;
	}

	if(!CreateController(&controller, pErrorMessage))
		return false;

	if(!App()->SaveString(controller_template_file, &controller, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing \"" + controller_template_file + "\". " + *pErrorMessage;
		return false;
	}


	// create subscriptions
	string subscriptions_template_file = App()->TemplateCodeDir + "collection_subscribe.js";
	string subscriptions = "";
	if(!FileLoadString(subscriptions_template_file, &subscriptions, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading \"" + subscriptions_template_file + "\". " + *pErrorMessage;
		return false;
	}
	CWStringList collection_includes;
	if(!CreateSubscriptions(&subscriptions, &collection_includes, pErrorMessage))
		return false;
	jsx->Replace("/*SUBSCRIPTIONS*/", subscriptions, true, true);


	int collection_includes_count = collection_includes.Count();
	for(int i = 0; i < collection_includes_count; i++)
	{
		jsx->Replace("/*IMPORTS*/", collection_includes.Strings[i] + LINE_TERM + "/*IMPORTS*/", true, true);
	}

	// create page
	if(!CreatePage(jsx, NULL, pErrorMessage))
		return false;

	// create components
	for(int i = 0; i < Components->Count(); i++)
	{
		CWComponent* component = Components->Items[i];
		if(!component->Generate(jsx, jsx, NULL, pErrorMessage))
			return false;
	}

/*
	// if this page use reactive dict, add pageSession variable declaration to .js
	if(FindSubString(&js, "pageSession") >= 0 && FindSubString(&js, "var pageSession = new ReactiveDict();") < 0)
		js.insert(0, "var pageSession = new ReactiveDict();\n\n");
*/

	// create destination directory
	string dest_dir = App()->ClientViewsDir + DestDir();
	if(!App()->MkDir(dest_dir, false, pErrorMessage))
		return false;

	// replace global helpers
	jsx->Replace("{{userEmail}}", "{userEmail()}", true, true);
	jsx->Replace("{{userFullName}}", "{userFullName()}", true, true);
	if(jsx->GotSubstring("{userEmail()}", true, true) || jsx->GotSubstring("{userFullName()}", true, true))
	{
		string include_global_helpers = "import {userEmail, userFullName} from \"" + App()->RelativeToOutputDir(AddDirSeparator(App()->ClientLibDir) + "account_utils", true) + "\"";
		if(IncludeFiles->FindBeginWith(include_global_helpers) < 0) {
			IncludeFiles->Add(include_global_helpers);
		}
	}

	int include_files_count = IncludeFiles->Count();
	for(int i = 0; i < include_files_count; i++)
	{
		string include = EnsureLastChar(IncludeFiles->Strings[i], ';');
		if(jsx->Text->FindSubStr(include, true) < 0) {
			jsx->Replace("/*IMPORTS*/", include + LINE_TERM + "/*IMPORTS*/", true, true);
		}
	}
	jsx->Replace("/*IMPORTS*/", "", true, true);


	// write jsx
	string jsx_dest_file = ChangeFileExt(dest_dir + DestFilename(), ".jsx");
	if(!App()->SaveJSX(jsx_dest_file, jsx, pErrorMessage))
		return false;

	// create sub pages
	int page_count = Pages->Count();
	for(int i = 0; i < page_count; i++)
		if(!Pages->Items[i]->GeneratePage(pErrorMessage))
			return false;

	return true;
}

bool CWPage::GeneratePage(string* pErrorMessage)
{
	string templating_name = App()->TemplatingName();

	if(templating_name == "blaze" && !GeneratePageBlaze(pErrorMessage)) return false;
	if(templating_name == "react" && !GeneratePageReact(pErrorMessage)) return false;

	return true;
}

// ---------------------------------------------------

CWZone::CWZone(CWObject* pParent): CWPage(pParent)
{
	Type = "zone";
	ZoneType = ztUnknown;
	Layout = "";
	DefaultRoute = "";
	NavbarClass = "";
	FooterClass = "";
	FooterText = "";
}

CWZone::~CWZone()
{
	Clear();
}

void CWZone::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "zone", "page");

	CWStringList layout_list;
	layout_list.Add("");
	layout_list.Add("navbar");
	layout_list.Add("sidenav");
	layout_list.Add("landing");
	layout_list.Add("admin");
	layout_list.Add("sticky_footer");
	layout_list.Add("empty");

	MetaAddMember(pMeta, "layout", "Layout", "string", "", "", false, "select", &layout_list);
	MetaAddMember(pMeta, "default_route", "Default route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "navbar_class", "Navbar Class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "footer_class", "Footer Class", "string", "", "", false, "text", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
//		hide_members->AddString("html");
//		hide_members->AddString("js");
//		hide_members->AddString("jsx");
//		hide_members->AddString("gasoline");
//		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
		hide_members->AddString("dest_selector");
		hide_members->AddString("dest_position");

		hide_members->AddString("name");
		hide_members->AddString("class");
		hide_members->AddString("title");
		hide_members->AddString("title_icon_class");
		hide_members->AddString("text");
//		hide_members->AddString("query_name");
//		hide_members->AddString("query_params");
//		hide_members->AddString("related_queries");
		hide_members->AddString("controller_before_action");
		hide_members->AddString("controller_after_action");
		hide_members->AddString("route_params");
		hide_members->AddString("close_route");
		hide_members->AddString("close_route_params");
		hide_members->AddString("back_route");
		hide_members->AddString("back_route_params");
		hide_members->AddString("roles");
//		hide_members->AddString("events_code");
//		hide_members->AddString("helpers_code");
//		hide_members->AddString("template_created_code");
//		hide_members->AddString("template_rendered_code");
//		hide_members->AddString("template_destroyed_code");
		hide_members->AddString("meta_title");
		hide_members->AddString("meta_description");
		hide_members->AddString("force_yield_subpages");
		hide_members->AddString("zoneless");
		hide_members->AddString("parent_layout");
		hide_members->AddString("queries");
		hide_members->AddString("show_condition");
	}
	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "zone", false, "static", NULL);
}

void CWZone::Clear()
{
	CWPage::Clear();
	ZoneType = ztUnknown;
	Layout = "";
	DefaultRoute = "";
	NavbarClass = "";
	FooterClass = "";
	FooterText = "";
}

bool CWZone::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWPage::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Layout = pJSON->GetString("layout");
	DefaultRoute = FromCamelCase(pJSON->GetString("default_route"), '_', true);
	NavbarClass = pJSON->GetString("navbar_class");
	FooterClass = pJSON->GetString("footer_class");
	FooterText = UnescapeJSON(pJSON->GetString("footer_text"));

	return true;
}

string CWZone::URL()
{
	return "";
}

string CWZone::Route()
{
	return "";
}

string CWZone::TemplateName()
{
	if(ZoneType == ztFree) return "FreeLayout";
	if(ZoneType == ztPublic) return "PublicLayout";
	if(ZoneType == ztPrivate) return "PrivateLayout";
	return "";
}

string CWZone::TemplateFile()
{
	if(Layout == "") return App()->TemplateUiLayoutsDir + "layout_content_navbar.html";

	return App()->TemplateUiLayoutsDir + "layout_content_" + ChangeFileExt(Layout, "") + ".html";
}

string CWZone::DestDir()
{
	return string("layout") + DIR_SEPARATOR;
}

string CWZone::DestFilename()
{
	return "layout";
}

bool CWZone::GenerateZoneBlaze(string* pErrorMessage)
{
	App()->Log("Creating zone \"" + Name + "\"...");

	string frontend = App()->FrontendName();
	string dest_dir = App()->ClientViewsLayoutDir;
	string html_dest_file = dest_dir + "layout.html";
	string js_dest_file = dest_dir + "layout.js";

	string footer_text = GetFooterText();

	// load html template
	CWNode* html = new CWNode();
	if(!LoadHTML(html_dest_file, html, pErrorMessage))
		return false;

	// load layout html content template
	CWNode* content_html = new CWNode();
	if(UserDefinedTemplate) {
		if(!content_html->ParseHTML(HTML, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error parsing HTML. " + *pErrorMessage;
			return false;
		}
	} else {
		string content_html_file = ChangeFileExt(TemplateFile(), ".html");
		if(!LoadHTML(content_html_file, content_html, pErrorMessage))
			return false;
	}

	content_html->Replace("TEMPLATE_NAME", TemplateName(), true, true);

	string container_class = ContainerClass;
	if(container_class == "" && !UserDefinedTemplate)
	{
		if(frontend == "bootstrap3-raw" || frontend == "bootstrap3") container_class = "container";
		if(frontend == "semantic-ui") container_class = "ui container";
	}

	CWNode* navbar_container = content_html->FindChild(".navbar-container", true, true);
	if(navbar_container != NULL) navbar_container->AddClass(container_class);

	CWNode* menu_container = content_html->FindChild(".menu-container", true, true);
	if(menu_container != NULL) menu_container->AddClass(container_class);

	CWNode* footer_container = content_html->FindChild(".footer-container", true, true);
	if(footer_container != NULL) footer_container->AddClass(container_class);

	CWNode* footer_text_container = content_html->FindChild(".footer-text", true, true);
	if(footer_text_container != NULL && footer_text == "") content_html->DeleteChild(footer_text_container, true);

	CWNode* background_node = content_html->FindChild("#background-image", true, true);
	if(background_node && BackgroundImage == "") content_html->DeleteChild(background_node, true);

	html->AddChild(content_html);

	html->Replace("APP_TITLE", App()->Title, true, true);
	html->Replace("FOOTER_TEXT", footer_text, true, true);
	html->Replace("BACKGROUND_IMAGE", BackgroundImage, true, true);

	if(!UserDefinedTemplate) {
		CWNode* navbar_node = content_html->FindChild("#navbar", true, true);
		if(navbar_node == NULL) navbar_node = content_html->FindChild("#menu", true, true);

		if(navbar_node != NULL)
		{
			string navbar_class = NavbarClass;
			if(navbar_class == "")
			{
				if(Layout == "" || Layout == "navbar" || Layout == "landing" || Layout == "admin") {
					if(frontend == "bootstrap3-raw" || frontend == "bootstrap3") navbar_class = "navbar-fixed-top navbar-default";
				}
			}
			navbar_node->AddClass(navbar_class);
			if(!navbar_node->HasClass("navbar-fixed-top"))
			{
				CWNode* spacer_node = content_html->FindChild(".navbar-spacer", true, true);
				if(spacer_node != NULL) content_html->DeleteChild(spacer_node, true);
			}
		}

		CWNode* footer_node = content_html->FindChild("#footer", true, true);
		if(footer_node != NULL)
		{
			string footer_class = FooterClass;

			if(footer_class == "")
			{
				if(frontend == "bootstrap3-raw" || frontend == "bootstrap3") footer_class = "";
				if(frontend == "semantic-ui") footer_class = "ui inverted center aligned vertical footer segment";
			}

			if(footer_class != "") footer_node->AddClass(footer_class);
		}
	}

	// load js template
	string js = "";
	if(!FileLoadString(js_dest_file, &js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading \"" + js_dest_file + "\". " + *pErrorMessage;
		return false;
	}

	// load layout js content template
	string content_js = "";
	if(UserDefinedTemplate) {
		content_js = JS;
	} else {
		string content_js_file = ChangeFileExt(TemplateFile(), ".js");
		if(!FileLoadString(content_js_file, &content_js, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading \"" + content_js_file + "\". " + *pErrorMessage;
			return false;
		}
	}

	ReplaceSubString(&content_js, "TEMPLATE_NAME", TemplateName());
	js.append(LINE_TERM);
	js.append(content_js);

	if(!CreateSubscriptions(&js, NULL, pErrorMessage))
		return false;

	// create page
	CWNode* zone_node = html->FindChildByNameAndAttr("template", "name", TemplateName(), true, true);
	if(zone_node == NULL)
		zone_node = html;

	if(!CreatePage(zone_node, &js, pErrorMessage))
		return false;

	// create components
	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++)
	{
		CWComponent* component = Components->Items[i];
		if(!component->Generate(html, zone_node, &js, pErrorMessage))
			return false;
	}

	// write html
	if(!App()->SaveHTML(html_dest_file, html, pErrorMessage))
		return false;

	// write js
	if(!App()->SaveString(js_dest_file, &js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing \"" + js_dest_file + "\". " + *pErrorMessage;
		return false;
	}

	// create sub pages
	int page_count = Pages->Count();
	for(int i = 0; i < page_count; i++)
		if(!Pages->Items[i]->GeneratePage(pErrorMessage))
			return false;

	return true;
}

bool CWZone::GenerateZoneReact(string* pErrorMessage)
{
	App()->Log("Creating zone \"" + Name + "\"...");

	string frontend = App()->FrontendName();
	string dest_dir = App()->ClientViewsLayoutDir;
	string dest_filename = dest_dir + "layout.jsx";

	string footer_text = GetFooterText();

	// load jsx template
	CWNode* jsx = new CWNode();
	if(!LoadJSX(dest_filename, jsx, pErrorMessage))
		return false;

	// load layout jsx content template
	CWNode* content_jsx = new CWNode();
	if(UserDefinedTemplate)
	{
		if(!content_jsx->ParseJSX(JSX, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error parsing JSX. " + *pErrorMessage;
			return false;
		}
	}
	else
	{
		// load html template
		string content_filename = ChangeFileExt(TemplateFile(), ".jsx");
		if(!LoadJSX(content_filename, content_jsx, pErrorMessage))
			return false;
	}

	content_jsx->Replace("TEMPLATE_NAME", TemplateName(), true, true);

	string container_class = ContainerClass;
	if(container_class == "" && !UserDefinedTemplate)
	{
		if(frontend == "bootstrap3-raw" || frontend == "bootstrap3") container_class = "container";
		if(frontend == "semantic-ui") container_class = "ui container";
	}

	CWNode* navbar_container = content_jsx->FindChild(".navbar-container", true, true);
	if(navbar_container != NULL) navbar_container->AddClass(container_class);

	CWNode* menu_container = content_jsx->FindChild(".menu-container", true, true);
	if(menu_container != NULL) menu_container->AddClass(container_class);

	CWNode* footer_container = content_jsx->FindChild(".footer-container", true, true);
	if(footer_container != NULL) footer_container->AddClass(container_class);

	CWNode* footer_text_container = content_jsx->FindChild(".footer-text", true, true);
	if(footer_text_container != NULL && footer_text == "") content_jsx->DeleteChild(footer_text_container, true);

	CWNode* background_node = content_jsx->FindChild("#background-image", true, true);
	if(background_node && BackgroundImage == "") content_jsx->DeleteChild(background_node, true);

	jsx->AddChildsOfNode(content_jsx);

	jsx->Replace("APP_TITLE", App()->Title, true, true);
	jsx->Replace("FOOTER_TEXT", footer_text, true, true);
	jsx->Replace("BACKGROUND_IMAGE", BackgroundImage, true, true);

	if(!UserDefinedTemplate) {
		CWNode* navbar_node = content_jsx->FindChild("#navbar", true, true);
		if(navbar_node == NULL) navbar_node = content_jsx->FindChild("#menu", true, true);

		if(navbar_node != NULL)
		{
			string navbar_class = NavbarClass;
			if(navbar_class == "")
			{
				if(Layout == "" || Layout == "navbar" || Layout == "landing" || Layout == "admin") {
					if(frontend == "bootstrap3-raw" || frontend == "bootstrap3") navbar_class = "navbar-fixed-top navbar-default";
				}
				//if(frontend == "semantic-ui") navbar_class = "ui fixed menu";
			}
			navbar_node->AddClass(navbar_class);
			if(!navbar_node->HasClass("navbar-fixed-top") && !navbar_node->HasClass("fixed"))
			{
				CWNode* spacer_node = content_jsx->FindChild(".navbar-spacer", true, true);
				if(spacer_node != NULL) content_jsx->DeleteChild(spacer_node, true);
			}
		}

		CWNode* footer_node = content_jsx->FindChild("#footer", true, true);
		if(footer_node != NULL)
		{
			string footer_class = FooterClass;

			if(footer_class == "")
			{
				if(frontend == "bootstrap3-raw" || frontend == "bootstrap3") footer_class = "";
				if(frontend == "semantic-ui") footer_class = "ui inverted center aligned vertical footer segment";
			}

			if(footer_class != "") footer_node->AddClass(footer_class);
		}
	}

	// create subscriptions
	string subscriptions_template_file = App()->TemplateCodeDir + "collection_subscribe.js";
	string subscriptions = "";
	if(!FileLoadString(subscriptions_template_file, &subscriptions, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading \"" + subscriptions_template_file + "\". " + *pErrorMessage;
		return false;
	}
	CWStringList collection_includes;
	if(!CreateSubscriptions(&subscriptions, &collection_includes, pErrorMessage))
		return false;
	jsx->Replace("/*SUBSCRIPTIONS*/", subscriptions, true, true);

	int collection_includes_count = collection_includes.Count();
	for(int i = 0; i < collection_includes_count; i++)
	{
		jsx->Replace("/*IMPORTS*/", collection_includes.Strings[i] + LINE_TERM + "/*IMPORTS*/", true, true);
	}

	// create page
	if(!CreatePage(jsx, /*content_jsx,*/ NULL, pErrorMessage))
		return false;

	// create components
	int component_count = Components->Count();
	for(int i = 0; i < component_count; i++)
	{
		CWComponent* component = Components->Items[i];
		if(!component->Generate(jsx, content_jsx, NULL, pErrorMessage))
			return false;
	}

	// replace global helpers
	jsx->Replace("{{userEmail}}", "{userEmail()}", true, true);
	jsx->Replace("{{userFullName}}", "{userFullName()}", true, true);
	if(jsx->GotSubstring("{userEmail()}", true, true) || jsx->GotSubstring("{userFullName()}", true, true))
	{
		string include_global_helpers = "import {userEmail, userFullName} from \"" + App()->RelativeToOutputDir(AddDirSeparator(App()->ClientLibDir) + "account_utils", true) + "\"";
		if(IncludeFiles->FindBeginWith(include_global_helpers) < 0) {
			IncludeFiles->Add(include_global_helpers);
		}
	}

	int includes_count = Imports->Count();
	for(int i = 0; i < includes_count; i++)
	{
		string include = RemoveLastChar(App()->ReplaceDirAlias(Imports->Strings[i], true, true), ';');
		if(IncludeFiles->FindBeginWith(include) < 0) {
			IncludeFiles->Add(include);
		}
	}

	int include_files_count = IncludeFiles->Count();
	for(int i = 0; i < include_files_count; i++)
	{
		string include = EnsureLastChar(App()->ReplaceDirAlias(IncludeFiles->Strings[i], true, true), ';');
		jsx->Replace("/*IMPORTS*/", include + LINE_TERM + "/*IMPORTS*/", true, true);
	}

	// write jsx
	if(!App()->SaveJSX(dest_filename, jsx, pErrorMessage))
		return false;

	// create sub pages
	int page_count = Pages->Count();
	for(int i = 0; i < page_count; i++)
		if(!Pages->Items[i]->GeneratePage(pErrorMessage))
			return false;

	return true;
}

bool CWZone::GenerateZone(string* pErrorMessage)
{
	string templating_name = App()->TemplatingName();

	if(templating_name == "blaze" && !GenerateZoneBlaze(pErrorMessage)) return false;
	if(templating_name == "react" && !GenerateZoneReact(pErrorMessage)) return false;

	return true;
}

// ---------------------------------------------------

void CWFilePair::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "file_pair", "");

	MetaAddMember(pMeta, "source", "Source file", "string", "", "", true, "text", NULL);
	MetaAddMember(pMeta, "source_content", "Source content", "string", "", "", false, "textarea", NULL);
	MetaAddMember(pMeta, "dest", "Destination file", "string", "", "", true, "text", NULL);
}

// ---------------------------------------------------

CWPackages::CWPackages()
{
	Meteor = new CWStringList();
	Npm = new CWStringList();
	Mrt = new CWStringList();
}

CWPackages::~CWPackages()
{
	Clear();
	delete Mrt;
	delete Npm;
	delete Meteor;
}

void CWPackages::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "packages", "");

	MetaAddMember(pMeta, "meteor", "Meteor", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "npm", "NPM", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "mrt", "Meteorite", "array", "string", "", false, "stringlist", NULL);
}

void CWPackages::Clear()
{
	Meteor->Clear();
	Npm->Clear();
	Mrt->Clear();
}

bool CWPackages::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	Clear();

	JSONArrayToStringList(pJSON->GetArray("meteor"), Meteor);
	JSONArrayToStringList(pJSON->GetArray("npm"), Npm);
	JSONArrayToStringList(pJSON->GetArray("mrt"), Mrt);

	return true;
}


// ---------------------------------------------------

CWApplication::CWApplication(CWObject* pParent): CWObject(pParent)
{
	Title = "";
	Templating = "";
	Frontend = "";
	Theme = "";
	Animate = false;
	FooterText = "";
	Roles = new CWStringList();
	DefaultRole = "";
	UseCollection2 = false;
	Collections = new CWArray<CWCollection*>;
	Queries = new CWArray<CWQuery*>;

	FreeZone = NULL;
	PublicZone = NULL;
	PrivateZone = NULL;
	ServerSideRoutes = new CWArray<CWServerSideRoute*>;
	CopyFiles = new CWArray<CWFilePair*>;
	Packages = new CWPackages();
	RouterConfig = new CWJSONObject();

	LoginWithPassword = true;
	SendVerificationEmail = true;
	LoginWithGoogle = false;
	LoginWithGithub = false;
	LoginWithLinkedin = false;
	LoginWithFacebook = false;
	LoginWithTwitter = false;
	LoginWithMeteor = false;
	LoginWithAuth0 = false;

	ServerStartupCode = "";
	ClientStartupCode = "";
	OnUserCreatedCode = "";
	OnUserLoggedCode = "";
	GlobalOnRenderedCode = "";

	ServerStartupSourceFile = "";
	ClientStartupSourceFile = "";
	OnUserCreatedSourceFile = "";
	OnUserLoggedSourceFile = "";

	ServerStartupImports = new CWStringList();
	ClientStartupImports = new CWStringList();

	MobileConfig = "";
	Stylesheet = "";

	// ---
	UseAccounts = false;
	TemplateDir = "";
	TemplateUiDir = "";
	TemplateUiComponentsDir = "";
	TemplateUiPagesDir = "";
	TemplateUiLayoutsDir = "";
	TemplateCodeDir = "";
	PluginsDir = "";

	AutoImportDirsClient = new CWStringList();
	AutoImportDirsServer = new CWStringList();

	PackagesToAdd = new CWPackages();
	FilesToCopy = new CWArray<CWFilePair*>;
	AddToMeteorSettings = new CWJSONObject();

	Router = new CWRouter(this);

	FreshApp = true;

	// ---
	InputDir = "";
	OutputDir = "";

	StartupDir = "";

	ClientDir = "";
	ClientStartupDir = "";
	ClientUIDir = "";
	ClientLibDir = "";
	ClientGlobalsDir = "";
	ClientComponentsDir = "";
	ClientStylesDir = "";
	ClientStylesFrameworkDir = "";
	ClientStylesDefaultDir = "";
	ClientStylesThemeDir = "";
	ClientViewsDir = "";
	ClientViewsNotFoundDir = "";
	ClientViewsLoadingDir = "";
	ClientViewsLayoutDir = "";
	ClientRouterDir = "";
//	ClientActionsDir = "";
//	ClientContainersDir = "";
//	ClientConfigsDir = "";

	ImportsDir = "";
	LibDir = "";
	SettingsDir = "";
	PackagesDir = "";

	BothDir = "";
	BothLibDir = "";
	BothCollectionsDir = "";
	BothJoinsDir = "";

	PublicDir = "";
	PublicImagesDir = "";
	PublicFontsDir = "";

	PrivateDir = "";

	ServerDir = "";
	ServerStartupDir = "";
	ServerLibDir = "";
	ServerCollectionsDir = "";
	ServerCollectionsRulesDir = "";
	ServerPublishDir = "";
	ServerRouterDir = "";
	ServerMethodsDir = "";

	Coffee = false;
	Jade = false;

	TargetPlatforms = new CWStringList();
	
	ForceMeteorVersion = "";
	ForceTemplating = "";
	
	UnsafePerm = false;

	OldOutput = new CWJSONObject();
	OutputFiles = new CWStringList();
	OutputDirectories = new CWStringList();

	Warnings = new CWStringList();
	TempFiles = new CWStringList();
}

CWApplication::~CWApplication()
{
	Clear();

	delete TempFiles;

	delete Warnings;

	delete OutputDirectories;
	delete OutputFiles;
	delete OldOutput;

	delete ClientStartupImports;
	delete ServerStartupImports;

	delete TargetPlatforms;
	delete RouterConfig;
	delete Packages;
	delete CopyFiles;
	delete ServerSideRoutes;
	if(PrivateZone) delete PrivateZone;
	if(PublicZone) delete PublicZone;
	if(FreeZone) delete FreeZone;
	delete Queries;
	delete Collections;
	delete Roles;

	delete Router;

	delete AutoImportDirsServer;
	delete AutoImportDirsClient;

	delete PackagesToAdd;
	delete FilesToCopy;
	delete AddToMeteorSettings;
}

void CWApplication::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "application", "object");

	CWStringList templating_list;
	templating_list.Add("blaze");
	templating_list.Add("react");

	CWStringList template_list;
	template_list.Add("bootstrap3");
	template_list.Add("semantic-ui");
	template_list.Add("materialize");
	template_list.Add("aframe");
	
	CWStringList theme_list;
	theme_list.Add("bootswatch-amelia");
	theme_list.Add("bootswatch-cerulean");
	theme_list.Add("bootswatch-cosmo");
	theme_list.Add("bootswatch-cyborg");
	theme_list.Add("bootswatch-cyborg-darkly");
	theme_list.Add("bootswatch-darkly");
	theme_list.Add("bootswatch-flatly");
	theme_list.Add("bootswatch-journal");
	theme_list.Add("bootswatch-lumen");
	theme_list.Add("bootswatch-paper");
	theme_list.Add("bootswatch-readable");
	theme_list.Add("bootswatch-sandstone");
	theme_list.Add("bootswatch-simplex");
	theme_list.Add("bootswatch-slate");
	theme_list.Add("bootswatch-solar");
	theme_list.Add("bootswatch-spacelab");
	theme_list.Add("bootswatch-superhero");
	theme_list.Add("bootswatch-united");
	theme_list.Add("bootswatch-yeti");
	theme_list.Add("flat-ui");


	MetaAddMember(pMeta, "title", "Title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "meta_description", "Meta Description", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "meta_title", "Meta Title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "templating", "Templating framework", "string", "", "blaze", false, "select", &templating_list);
	MetaAddMember(pMeta, "frontend", "Frontend", "string", "", "bootstrap3", false, "select", &template_list);
	MetaAddMember(pMeta, "theme", "Theme", "string", "", "", false, "text", &theme_list);
	MetaAddMember(pMeta, "animate", "Animate", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "footer_text", "Footer text", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "roles", "User roles", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "default_role", "Default role for new users", "string", "", "", false, "text", NULL);

	MetaAddMember(pMeta, "use_collection2", "Use Collection2", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "collections", "Collections", "array", "collection", "", false, "", NULL);
	MetaAddMember(pMeta, "queries", "Queries", "array", "query", "", false, "", NULL);
	MetaAddMember(pMeta, "free_zone", "Free zone", "zone", "", "", false, "", NULL);
	MetaAddMember(pMeta, "public_zone", "Public zone", "zone", "", "", false, "", NULL);
	MetaAddMember(pMeta, "private_zone", "Private zone", "zone", "", "", false, "", NULL);

	MetaAddMember(pMeta, "login_with_password", "Login with password", "bool", "", "true", false, "checkbox", NULL);
	MetaAddMember(pMeta, "send_verification_email", "Send verification e-mail", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "login_with_google", "Login with Google", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "login_with_github", "Login with GitHub", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "login_with_linkedin", "Login with LinkedIn", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "login_with_facebook", "Login with Facebook", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "login_with_twitter", "Login with Twitter", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "login_with_meteor", "Login with Meteor", "bool", "", "false", false, "checkbox", NULL);
	MetaAddMember(pMeta, "login_with_auth0", "Login with Auth0", "bool", "", "false", false, "checkbox", NULL);

	MetaAddMember(pMeta, "server_startup_code", "Server startup code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "client_startup_code", "Client startup code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "on_user_created_code", "On user created code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "on_user_logged_code", "On user logged code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "global_on_rendered_code", "Global onRendered code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "server_startup_source_file", "Server startup source file", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "client_startup_source_file", "Client startup source file", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "on_user_created_source_file", "On user created source file", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "on_user_logged_source_file", "On user logged source file", "string", "", "", false, "text", NULL);

	MetaAddMember(pMeta, "server_startup_imports", "Import modules to server startup", "array", "string", "", false, "stringlist", NULL);
	MetaAddMember(pMeta, "client_startup_imports", "Import modules to client startup", "array", "string", "", false, "stringlist", NULL);

	MetaAddMember(pMeta, "mobile_config", "mobile-config.js", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "stylesheet", "CSS/LESS stylesheet", "string", "", "", false, "css", NULL);

	MetaAddMember(pMeta, "server_side_routes", "Server side routes", "array", "server_side_route", "", false, "", NULL);
	MetaAddMember(pMeta, "copy_files", "Copy files", "array", "file_pair", "", false, "", NULL);
	MetaAddMember(pMeta, "packages", "Packages", "packages", "", "", false, "", NULL);
	MetaAddMember(pMeta, "router_config", "Router configuration", "object", "", "", false, "json", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}
}

void CWApplication::Clear()
{
	CWObject::Clear();

	// ---
	Title = "";
	Templating = "";
	Frontend = "";
	Theme = "";
	Animate = false;
	FooterText = "";
	Roles->Clear();
	DefaultRole = "";
	UseCollection2 = false;
	Collections->Clear();
	Queries->Clear();

	if(FreeZone) { delete FreeZone; FreeZone = NULL; }
	if(PublicZone) { delete PublicZone; PublicZone = NULL; }
	if(PrivateZone) { delete PrivateZone; PrivateZone = NULL; }
	ServerSideRoutes->Clear();
	CopyFiles->Clear();
	Packages->Clear();
	RouterConfig->Clear();

	LoginWithPassword = true;
	SendVerificationEmail = true;
	LoginWithGoogle = false;
	LoginWithGithub = false;
	LoginWithLinkedin = false;
	LoginWithFacebook = false;
	LoginWithTwitter = false;
	LoginWithMeteor = false;
	LoginWithAuth0 = false;

	ServerStartupCode = "";
	ClientStartupCode = "";
	OnUserCreatedCode = "";
	OnUserLoggedCode = "";
	GlobalOnRenderedCode = "";

	ServerStartupSourceFile = "";
	ClientStartupSourceFile = "";
	OnUserCreatedSourceFile = "";
	OnUserLoggedSourceFile = "";

	ServerStartupImports->Clear();
	ClientStartupImports->Clear();

	MobileConfig = "";
	Stylesheet = "";

	// ---
	UseAccounts = false;
	TemplateDir = "";
	TemplateUiDir = "";
	TemplateUiComponentsDir = "";
	TemplateUiPagesDir = "";
	TemplateUiLayoutsDir = "";
	TemplateCodeDir = "";
	PluginsDir = "";

	AutoImportDirsClient->Clear();
	AutoImportDirsServer->Clear();

	PackagesToAdd->Clear();
	FilesToCopy->Clear();
	AddToMeteorSettings->Clear();

	Router->Clear();

	FreshApp = true;

	// ---
	InputDir = "";
	OutputDir = "";

	StartupDir = "";

	ClientDir = "";
	ClientStartupDir = "";
	ClientUIDir = "";
	ClientLibDir = "";
	ClientGlobalsDir = "";
	ClientComponentsDir = "";
	ClientStylesDir = "";
	ClientStylesFrameworkDir = "";
	ClientStylesDefaultDir = "";
	ClientStylesThemeDir = "";
	ClientViewsDir = "";
	ClientViewsNotFoundDir = "";
	ClientViewsLoadingDir = "";
	ClientViewsLayoutDir = "";
	ClientRouterDir = "";
//	ClientActionsDir = "";
//	ClientContainersDir = "";
//	ClientConfigsDir = "";

	ImportsDir = "";
	LibDir = "";
	SettingsDir = "";
	PackagesDir = "";

	BothDir = "";
	BothLibDir = "";
	BothCollectionsDir = "";
	BothJoinsDir = "";

	PublicDir = "";
	PublicImagesDir = "";
	PublicFontsDir = "";

	PrivateDir = "";

	ServerDir = "";
	ServerStartupDir = "";
	ServerLibDir = "";
	ServerCollectionsDir = "";
	ServerCollectionsRulesDir = "";
	ServerPublishDir = "";
	ServerRouterDir = "";
	ServerMethodsDir = "";

	Coffee = false;
	Jade = false;

	Warnings->Clear();
	TempFiles->Clear();

	OldOutput->Clear();
	OutputFiles->Clear();
	OutputDirectories->Clear();
}

void CWApplication::Log(string sText)
{
	printf("%s%s", sText.c_str(), LINE_TERM);
}

void CWApplication::Warning(string sText)
{
	Warnings->Add(sText);
	printf("WARNING: %s%s", sText.c_str(), LINE_TERM);
}

bool CWApplication::SaveString(string sFileName, const string& sString, int iTimeoutMS, string* pErrorMessage)
{
	string filename = sFileName;
	if(FindSubString(&filename, OutputDir) == 0) {
		filename.erase(0, OutputDir.size());
	}
	if(filename != "") OutputFiles->AddUnique(filename);
	return FileSaveString(sFileName, sString, iTimeoutMS, pErrorMessage);
}

bool CWApplication::SaveString(string sFileName, string* pString, int iTimeoutMS, string* pErrorMessage)
{
	string filename = sFileName;
	if(FindSubString(&filename, OutputDir) == 0) {
		filename.erase(0, OutputDir.size());
	}
	if(filename != "") OutputFiles->AddUnique(filename);

	return FileSaveString(sFileName, pString, iTimeoutMS, pErrorMessage);	
}

bool CWApplication::SaveHTML(string sPath, CWNode* pNode, string* pErrorMessage)
{
	string tmpstr = pNode->GetHTML(false);
	if(!SaveString(sPath, &tmpstr, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing file \"" + sPath + "\". " + *pErrorMessage;
		return false;
	}
	return true;
}

bool CWApplication::SaveJSX(string sPath, CWNode* pNode, string* pErrorMessage)
{
	pNode->Flatten();
	string tmpstr = pNode->GetJSX();
	if(!SaveString(sPath, &tmpstr, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing file \"" + sPath + "\". " + *pErrorMessage;
		return false;
	}
	return true;
}

bool CWApplication::SaveJade(string sPath, CWNode* pNode, string* pErrorMessage)
{
	string tmpstr = pNode->GetJade();
	if(!SaveString(sPath, &tmpstr, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing file \"" + sPath + "\". " + *pErrorMessage;
		return false;
	}
	return true;
}

bool CWApplication::HTMLtoJade(string sHTMLPath, string sJadePath, string* pErrorMessage)
{
	CWNode node;
	if(!LoadHTML(sHTMLPath, &node, pErrorMessage))
		return false;

	if(!SaveJade(sJadePath, &node, pErrorMessage))
		return false;

	return true;
}

bool CWApplication::FCopy(string sSource, string sDest, bool bFailIfExists, int iTimeoutMS, string* pErrorMessage)
{
	string filename = sDest;
	if(FindSubString(&filename, OutputDir) == 0) {
		filename.erase(0, OutputDir.size());
	}
	if(filename != "") OutputFiles->AddUnique(filename);

	bool source_is_temp = false;
	string source_file = sSource;
	string ext = ExtractFileExt(sDest);

	// convert dir aliases in import statements
	if(ext == ".js" || ext == ".jsx") {
		string code = "";
		if(!FileLoadString(sSource, &code, 0, pErrorMessage)) {
			return false;
		}
	
		CWStringList lines;
		lines.SetText(code);
		bool something_replaced = false;
		int line_count = lines.Count();
		for(int i = 0; i < line_count; i++) {
			string line = lines.Strings[i];
			if(FindSubString(&line, "import") >= 0 && FindSubString(&line, "from") >= 0) {
				lines.Strings[i] = ReplaceDirAlias(line, true, true);
				something_replaced = true;
			}
		}
		if(something_replaced) {
			source_is_temp = true;
			source_file = TempDir() + RandomString(10) + ".tmp";
			code = lines.GetText();
			if(!FileSaveString(source_file, code, 0, pErrorMessage)) {
				return false;
			}
		}
	}

	if(!FileCopy(source_file, sDest, bFailIfExists, iTimeoutMS, pErrorMessage)) {
		return false;
	}
	
	if(source_is_temp) {
		if(source_is_temp) {
			if(!FileDelete(source_file, pErrorMessage)) {
				return false;
			}
		}
	}
	
	return true;
}

bool CWApplication::MkDir(string sDirName, bool bFailIfExists, string* pErrorMessage)
{
	string dirname = AddDirSeparator(sDirName);
	if(FindSubString(&dirname, OutputDir) == 0) {
		dirname.erase(0, OutputDir.size());
	}
	if(dirname != "") OutputDirectories->AddUnique(dirname);
	
	if(DirectoryExists(sDirName)) return true;

	return MakeDir(sDirName, bFailIfExists, pErrorMessage);
}


bool CWApplication::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Name = FromCamelCase(pJSON->GetString("name"), '_', true);
	if(Name == "") Name = "application";
	Title = pJSON->GetString("title");
	MetaDescription = pJSON->GetString("meta_description");
	MetaTitle = pJSON->GetString("meta_title");
	Templating = pJSON->GetString("templating");
	Frontend = pJSON->GetString("frontend");
	Theme = pJSON->GetString("theme");
	Animate = pJSON->HasMember("animate") ? pJSON->GetBool("animate") : false;

	LoginWithPassword = pJSON->HasMember("login_with_password") ? pJSON->GetBool("login_with_password") : true;
	SendVerificationEmail = pJSON->HasMember("send_verification_email") ? pJSON->GetBool("send_verification_email") : false;
	LoginWithGoogle = pJSON->HasMember("login_with_google") ? pJSON->GetBool("login_with_google") : false;
	LoginWithGithub = pJSON->HasMember("login_with_github") ? pJSON->GetBool("login_with_github") : false;
	LoginWithLinkedin = pJSON->HasMember("login_with_linkedin") ? pJSON->GetBool("login_with_linkedin") : false;
	LoginWithFacebook = pJSON->HasMember("login_with_facebook") ? pJSON->GetBool("login_with_facebook") : false;
	LoginWithTwitter = pJSON->HasMember("login_with_twitter") ? pJSON->GetBool("login_with_twitter") : false;
	LoginWithMeteor = pJSON->HasMember("login_with_meteor") ? pJSON->GetBool("login_with_meteor") : false;
	LoginWithAuth0 = pJSON->HasMember("login_with_auth0") ? pJSON->GetBool("login_with_auth0") : false;

	ServerStartupCode = UnescapeJSON(pJSON->GetString("server_startup_code"));
	ClientStartupCode = UnescapeJSON(pJSON->GetString("client_startup_code"));
	OnUserCreatedCode = UnescapeJSON(pJSON->GetString("on_user_created_code"));
	OnUserLoggedCode = UnescapeJSON(pJSON->GetString("on_user_logged_code"));
	GlobalOnRenderedCode = UnescapeJSON(pJSON->GetString("global_on_rendered_code"));

	ServerStartupSourceFile = ConvertDirSeparator(pJSON->GetString("server_startup_source_file"));
	ClientStartupSourceFile = ConvertDirSeparator(pJSON->GetString("client_startup_source_file"));
	OnUserCreatedSourceFile = ConvertDirSeparator(pJSON->GetString("on_user_created_source_file"));
	OnUserLoggedSourceFile = ConvertDirSeparator(pJSON->GetString("on_user_logged_source_file"));

	JSONArrayToStringList(pJSON->GetArray("server_startup_imports"), ServerStartupImports, true);
	JSONArrayToStringList(pJSON->GetArray("client_startup_imports"), ClientStartupImports, true);

	MobileConfig = UnescapeJSON(pJSON->GetString("mobile_config"));
	Stylesheet = UnescapeJSON(pJSON->GetString("stylesheet"));

	FooterText = UnescapeJSON(pJSON->GetString("footer_text"));

	JSONArrayToStringList(pJSON->GetArray("roles"), Roles);

	DefaultRole = UnescapeJSON(pJSON->GetString("default_role"));

	UseCollection2 = pJSON->HasMember("use_collection2") ? pJSON->GetBool("use_collection2") : false;

	// load collections
	CWJSONArray* collections = pJSON->GetArray("collections");
	if(collections)
	{
		int collections_count = collections->Count();
		for(int i = 0; i < collections_count; i++)
		{
			CWJSONObject* collection = collections->Items[i]->GetObject();
			if(collection != NULL)
			{
				CWCollection* obj = new CWCollection(this);
				if(!obj->LoadFromJSON(collection, "", pErrorMessage))
				{
					delete obj;
					return false;
				}
				Collections->Add(obj);
			}
		}
	}

	// load queries
	CWJSONArray* queries = pJSON->GetArray("queries");
	if(queries)
	{
		int queries_count = queries->Count();
		for(int i = 0; i < queries_count; i++)
		{
			CWJSONObject* query = queries->Items[i]->GetObject();
			if(query != NULL)
			{
				CWQuery* obj = new CWQuery(this);
				if(!obj->LoadFromJSON(query, "", pErrorMessage))
				{
					delete obj;
					return false;
				}
				Queries->Add(obj);
			}
		}
	}

	// load free zone
	CWJSONObject* free_zone = pJSON->GetObject("free_zone");
	if(free_zone)
	{
		FreeZone = new CWZone(this);
		if(!FreeZone->LoadFromJSON(free_zone, "free_zone", pErrorMessage))
			return false;
		FreeZone->ZoneType = ztFree;
	}

	// load public zone
	CWJSONObject* public_zone = pJSON->GetObject("public_zone");
	if(public_zone)
	{
		PublicZone = new CWZone(this);
		if(!PublicZone->LoadFromJSON(public_zone, "public_zone", pErrorMessage))
			return false;
		PublicZone->ZoneType = ztPublic;
	}

	// load private zone
	CWJSONObject* private_zone = pJSON->GetObject("private_zone");
	if(private_zone)
	{
		PrivateZone = new CWZone(this);
		if(!PrivateZone->LoadFromJSON(private_zone, "private_zone", pErrorMessage))
			return false;
		PrivateZone->ZoneType = ztPrivate;
	}

	// load server side routes
	CWJSONArray* server_routes = pJSON->GetArray("server_side_routes");
	if(server_routes != NULL)
	{
		int server_routes_count = server_routes->Count();
		for(int i = 0; i < server_routes_count; i++)
		{
			CWJSONObject* route = server_routes->Items[i]->GetObject();
			if(route != NULL)
			{
				CWServerSideRoute* server_route = new CWServerSideRoute(this);
				if(!server_route->LoadFromJSON(route, "", pErrorMessage))
				{
					delete server_route;
					return false;
				}
				ServerSideRoutes->Add(server_route);
			}
		}
	}

	// load list of files to copy
	CWJSONArray* copy_files = pJSON->GetArray("copy_files");
	if(copy_files != NULL)
	{
		int copy_files_count = copy_files->Count();
		for(int i = 0; i < copy_files_count; i++)
		{
			CWJSONObject* pair = copy_files->Items[i]->GetObject();
			if(pair != NULL)
			{
				string source_file = pair->GetString("source");
				if(source_file.find("http://") != 0 && source_file.find("https://") != 0) {
					source_file = ConvertDirSeparator(source_file);
				}
				string source_content = UnescapeJSON(pair->GetString("source_content"));
				string dest_file = ConvertDirSeparator(pair->GetString("dest"));
				if(FindFilePair(CopyFiles, source_file, source_content, dest_file) < 0)
				{
					CWFilePair* file_pair = new CWFilePair();
					file_pair->Source = source_file;
					file_pair->SourceContent = source_content;
					file_pair->Dest = dest_file;
					file_pair->NoEcho = false;
					CopyFiles->Add(file_pair);
				}
			}
		}
	}

	// load packages to add
	CWJSONObject* packages = pJSON->GetObject("packages");
	if(packages != NULL)
	{
		if(!Packages->LoadFromJSON(packages, "packages", pErrorMessage))
			return false;
	}

	// load router config
	CWJSONObject* router_config = pJSON->GetObject("router_config");
	if(router_config != NULL) RouterConfig->CopyFrom(router_config);

	return true;
}

bool CWApplication::LoadFromFile(string sInputFile, string* pErrorMessage)
{
	Log("Reading input file... ");

	string input_string = "";
	if(!FileLoadString(sInputFile, &input_string, 0, pErrorMessage))
		return false;

	CWJSONObject json;
	if(!json.Parse(input_string, pErrorMessage))
		return false;

	CWJSONObject* application = json.GetObject("application");
	if(application == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Invalid input file structure: \"application\" object not found.";
		return false;
	}

	if(!LoadFromJSON(application, "application", pErrorMessage))
		return false;

	return true;
}

CWCollection* CWApplication::GetCollection(string sName)
{
	int collection_count = Collections->Count();
	for(int i = 0; i < collection_count; i++)
	{
		CWCollection* collection = Collections->Items[i];
		if(collection->Name == sName)
			return collection;
	}
	return NULL;
}

void CWApplication::ExtractImports(string sFileContent, CWStringList* pImports)
{
	if(pImports == NULL) {
		return;
	}
	
	pImports->Clear();
	CWStringList lines;
	lines.SetText(sFileContent);
	int line_count = lines.Count();
	for(int i = 0; i < line_count; i++) {
		string line = lines.Strings[i];
		if(FindSubString(&line, "import", true, 0, true) >= 0 && FindSubString(&line, "from", true, 0, true) >= 0) {
			pImports->Add(line);
		}
	}
}

void CWApplication::GetCollectionImportsForFile(string sFileContent, CWStringList* pImports, bool bUsersOnly)
{
	if(pImports == NULL) {
		return;
	}
	
	pImports->Clear();

	CWStringList original_imports;
	ExtractImports(sFileContent, &original_imports);
	
	CWStringList imports;
	if(!bUsersOnly) {
		int collection_count = Collections->Count();
		for(int i = 0; i < collection_count; i++)
		{
			CWCollection* collection = Collections->Items[i];
			string collection_name = collection->Name;
			string collection_var = collection->Variable();
			if(FindSubString(&sFileContent, collection_var, true, 0, true) >= 0 && FindSubString(&sFileContent, collection_var + ".") >= 0) {
				string shared_js_import = "";
				if(collection_name == "users") {
					shared_js_import = "import {Users} from \"meteor-user-roles\";";
				} else {
					string shared_js_dest = App()->BothCollectionsDir + ChangeFileExt(collection_name, ".js");
					string shared_js_dest_relative = App()->RelativeToOutputDir(shared_js_dest, true);
					shared_js_import = "import {" + collection_var + "} from \"" + shared_js_dest_relative + "\";";
				}

				if(original_imports.Find(shared_js_import) < 0) {
					imports.AddUnique(shared_js_import);
				}
			}
		}
		
		if(FindSubString(&sFileContent, "databaseUtils", true, 0, true) >= 0) {
			string import_database_utils = "import * as databaseUtils from \"" + App()->RelativeToOutputDir(App()->BothLibDir + "database_utils.js", true) + "\";";
			if(original_imports.Find(import_database_utils) < 0) {
				imports.AddUnique(import_database_utils);
			}
		}

		if(FindSubString(&sFileContent, "objectUtils", true, 0, true) >= 0) {
			string import_object_utils = "import * as objectUtils from \"" + App()->RelativeToOutputDir(App()->BothLibDir + "object_utils.js", true) + "\";";
			if(original_imports.Find(import_object_utils) < 0) {
				imports.AddUnique(import_object_utils);
			}
		}
	}

	string collection_name = "users";
	string collection_var = "Users";
	if(FindSubString(&sFileContent, collection_var, true, 0, true) >= 0 && FindSubString(&sFileContent, collection_var + ".") >= 0) {
		string shared_js_import = "import {Users} from \"meteor-user-roles\";";
		if(original_imports.Find(shared_js_import) < 0) {
			imports.AddUnique(shared_js_import);
		}
	}

	pImports->Append(&imports);	
}

bool CWApplication::ReadSettings(string* pErrorMessage)
{
	AutoImportDirsClient->Clear();
	AutoImportDirsServer->Clear();

	PackagesToAdd->Clear();
	FilesToCopy->Clear();
	AddToMeteorSettings->Clear();

	PackagesToAdd->Meteor->Append(Packages->Meteor);
	PackagesToAdd->Npm->Append(Packages->Npm);
	PackagesToAdd->Mrt->Append(Packages->Mrt);

	if(Coffee && PackagesToAdd->Meteor->Find("coffeescript") < 0) PackagesToAdd->Meteor->Add("coffeescript");
	if(Jade && PackagesToAdd->Meteor->Find("mquandalle:jade") < 0) PackagesToAdd->Meteor->Add("mquandalle:jade");

	if(Animate && PackagesToAdd->Meteor->Find("natestrauser:animate-css") < 0) PackagesToAdd->Meteor->Add("natestrauser:animate-css");

	if(UseCollection2 && PackagesToAdd->Meteor->Find("aldeed:collection2") < 0) PackagesToAdd->Meteor->Add("aldeed:collection2");
	if(UseCollection2 && PackagesToAdd->Npm->Find("simpl-schema") < 0) PackagesToAdd->Npm->Add("simpl-schema");

	bool oauth = UseAccounts && (LoginWithGoogle || LoginWithGithub || LoginWithLinkedin || LoginWithFacebook || LoginWithTwitter || LoginWithMeteor || LoginWithAuth0);

	CWJSONObject* public_settings = new CWJSONObject();
	AddToMeteorSettings->SetObject("public", public_settings);

	CWJSONObject* oauth_settings = new CWJSONObject();

	if(oauth && PackagesToAdd->Meteor->Find("service-configuration") < 0) PackagesToAdd->Meteor->Add("service-configuration");

	if(oauth && LoginWithGoogle && PackagesToAdd->Meteor->Find("accounts-google") < 0) PackagesToAdd->Meteor->Add("accounts-google");
	if(oauth && LoginWithGithub)
	{
		if(PackagesToAdd->Meteor->Find("accounts-github") < 0) PackagesToAdd->Meteor->Add("accounts-github");
		if(PackagesToAdd->Meteor->Find("bruz:github-api") < 0) PackagesToAdd->Meteor->Add("bruz:github-api");
	}
	if(oauth && LoginWithLinkedin && PackagesToAdd->Meteor->Find("pauli:accounts-linkedin") < 0) PackagesToAdd->Meteor->Add("pauli:accounts-linkedin");
	if(oauth && LoginWithFacebook && PackagesToAdd->Meteor->Find("accounts-facebook") < 0) PackagesToAdd->Meteor->Add("accounts-facebook");
	if(oauth && LoginWithTwitter && PackagesToAdd->Meteor->Find("accounts-twitter") < 0) PackagesToAdd->Meteor->Add("accounts-twitter");
	if(oauth && LoginWithMeteor && PackagesToAdd->Meteor->Find("accounts-meteor-developer") < 0) PackagesToAdd->Meteor->Add("accounts-meteor-developer");
	if(oauth && LoginWithAuth0 && PackagesToAdd->Meteor->Find("perak:accounts-auth0") < 0) PackagesToAdd->Meteor->Add("perak:accounts-auth0");

	if(UseAccounts && LoginWithPassword && PackagesToAdd->Meteor->Find("accounts-password") < 0) PackagesToAdd->Meteor->Add("accounts-password");

	if(oauth && LoginWithGoogle) {
		CWJSONObject* oauth_service = new CWJSONObject();
		oauth_service->SetString("clientId", "");
		oauth_service->SetString("secret", "");
		oauth_settings->SetObject("google", oauth_service);
	}
	if(oauth && LoginWithGithub) {
		CWJSONObject* oauth_service = new CWJSONObject();
		oauth_service->SetString("clientId", "");
		oauth_service->SetString("secret", "");
		oauth_settings->SetObject("github", oauth_service);
	}
	if(oauth && LoginWithLinkedin) {
		CWJSONObject* oauth_service = new CWJSONObject();
		oauth_service->SetString("clientId", "");
		oauth_service->SetString("secret", "");
		oauth_settings->SetObject("linkedin", oauth_service);
	}
	if(oauth && LoginWithFacebook) {
		CWJSONObject* oauth_service = new CWJSONObject();
		oauth_service->SetString("appId", "");
		oauth_service->SetString("secret", "");
		oauth_settings->SetObject("facebook", oauth_service);
	}
	if(oauth && LoginWithTwitter) {
		CWJSONObject* oauth_service = new CWJSONObject();
		oauth_service->SetString("clientId", "");
		oauth_service->SetString("secret", "");
		oauth_settings->SetObject("twitter", oauth_service);
	}
	if(oauth && LoginWithMeteor) {
		CWJSONObject* oauth_service = new CWJSONObject();
		oauth_service->SetString("clientId", "");
		oauth_service->SetString("secret", "");
		oauth_settings->SetObject("meteor", oauth_service);
	}
	if(oauth && LoginWithAuth0) {
		CWJSONObject* oauth_service = new CWJSONObject();
		oauth_service->SetString("domain", "");
		oauth_service->SetString("clientId", "");
		oauth_service->SetString("secret", "");
		oauth_settings->SetObject("auth0", oauth_service);
	}

	if(oauth) {
		AddToMeteorSettings->SetObject("oauth", oauth_settings);
	} else {
		delete oauth_settings;
	}

	for(int i = 0; i < Collections->Count(); i++)
	{
		CWCollection* collection = Collections->Items[i];
		for(int x = 0; x < collection->Fields->Count(); x++)
		{
			CWField* field = collection->Fields->Items[x];
			if((field->JoinCollection != "" || field->JoinCollectionField != "" || field->FileCollection != "") && PackagesToAdd->Meteor->Find("perak:joins") < 0) PackagesToAdd->Meteor->Add("perak:joins");
		}

		if(StrCmpi(collection->Type, "bigchaindb") == 0)
		{
			if(PackagesToAdd->Meteor->Find("perak:bigchaindb-collection") < 0) PackagesToAdd->Meteor->Add("perak:bigchaindb-collection");
		}

		if(StrCmpi(collection->Type, "file_collection") == 0)
		{
			if(PackagesToAdd->Meteor->Find("cfs:standard-packages") < 0) PackagesToAdd->Meteor->Add("cfs:standard-packages");

			CWStringList adapters;
			adapters.Assign(collection->StorageAdapters);
			if(collection->StorageAdapterOptions->GetObject("gridfs") != NULL && adapters.Find("gridfs") < 0) adapters.Add("gridfs");
			if(collection->StorageAdapterOptions->GetObject("filesystem") != NULL && adapters.Find("filesystem") < 0) adapters.Add("filesystem");
			if(collection->StorageAdapterOptions->GetObject("s3") != NULL && adapters.Find("s3") < 0) adapters.Add("s3");
			if(collection->StorageAdapterOptions->GetObject("dropbox") != NULL && adapters.Find("dropbox") < 0) adapters.Add("dropbox");

			int adapter_count = adapters.Count();
			if(adapter_count == 0)
			{
				if(PackagesToAdd->Meteor->Find("cfs:gridfs") < 0) PackagesToAdd->Meteor->Add("cfs:gridfs");
			}
			else
			{
				bool unknown_adapter = true;
				for(int x = 0; x < adapter_count; x++)
				{
					string adapter_name = adapters.Strings[x];
					if(adapter_name == "gridfs")
					{
						unknown_adapter = false;
						if(PackagesToAdd->Meteor->Find("cfs:gridfs") < 0) PackagesToAdd->Meteor->Add("cfs:gridfs");
					}
					if(adapter_name == "filesystem")
					{
						unknown_adapter = false;
						if(PackagesToAdd->Meteor->Find("cfs:filesystem") < 0) PackagesToAdd->Meteor->Add("cfs:filesystem");
					}
					if(adapter_name == "s3")
					{
						unknown_adapter = false;
						if(PackagesToAdd->Meteor->Find("cfs:s3") < 0) PackagesToAdd->Meteor->Add("cfs:s3");
					}
					if(adapter_name == "dropbox")
					{
						unknown_adapter = false;
						if(PackagesToAdd->Meteor->Find("cfs:dropbox") < 0) PackagesToAdd->Meteor->Add("cfs:dropbox");
					}

					if(unknown_adapter)
					{
						if(pErrorMessage) *pErrorMessage = "Error in collection \"" + collection->Name + "\": unknown storage adapter \"" + adapter_name + "\".";
						return false;
					}
				}
			}
		}
	}
	
	for(int i = 0; i < Queries->Count(); i++) {
		CWQuery* query = Queries->Items[i];
		if(query->UsedByDataview) {
			if(PackagesToAdd->Meteor->Find("tmeasday:publish-counts") < 0) PackagesToAdd->Meteor->Add("tmeasday:publish-counts");
		}
	}

	int tmp_count = CopyFiles->Count();
	for(int i = 0; i < tmp_count; i++)
	{
		CWFilePair* old_pair = CopyFiles->Items[i];
		CWFilePair* new_pair = new CWFilePair();

		new_pair->Source = old_pair->Source;
		new_pair->SourceContent = old_pair->SourceContent;
		new_pair->Dest = old_pair->Dest;
		new_pair->NoEcho = old_pair->NoEcho;

		FilesToCopy->Add(new_pair);
	}

	string settings_filename = "";
	if(UseAccounts)
		settings_filename = TemplateCodeDir + "app_accounts.json";
	else
		settings_filename = TemplateCodeDir + "app_simple.json";

	CWJSONObject settings_json;
	if(!ParseJSONFile(settings_filename, &settings_json, false, pErrorMessage))
		return false;

	CWJSONObject* packages_json = settings_json.GetObject("packages");
	if(packages_json != NULL)
	{
		CWStringList meteor_packages;
		CWStringList npm_packages;
		CWStringList mrt_packages;

		JSONArrayToStringList(packages_json->GetArray("meteor"), &meteor_packages);
		JSONArrayToStringList(packages_json->GetArray("npm"), &npm_packages);
		JSONArrayToStringList(packages_json->GetArray("mrt"), &mrt_packages);

		PackagesToAdd->Meteor->Merge(&meteor_packages);
		PackagesToAdd->Npm->Merge(&npm_packages);
		PackagesToAdd->Mrt->Merge(&mrt_packages);
	}

	// load list of files to copy
	CWJSONArray* copy_files = settings_json.GetArray("copy_files");
	if(copy_files != NULL)
	{
		int copy_files_count = copy_files->Count();
		for(int i = 0; i < copy_files_count; i++)
		{
			CWJSONObject* pair = copy_files->Items[i]->GetObject();
			if(pair != NULL)
			{
				CWFilePair* file_pair = new CWFilePair();

				string source_file = pair->GetString("source");
				if(source_file.find("http://") != 0 && source_file.find("https://") != 0) {
					source_file = ConvertDirSeparator(source_file);
				}
				file_pair->Source = source_file;
				file_pair->SourceContent = UnescapeJSON(pair->GetString("source_content"));
				file_pair->Dest = ConvertDirSeparator(pair->GetString("dest"));
				FilesToCopy->Add(file_pair);
			}
		}
	}

	// load list of directories whose files will be included into client/main.js and server/main.js
	CWJSONObject* import_dirs_json = settings_json.GetObject("import_files");
	if(import_dirs_json != NULL)
	{
		CWStringList tmp_import_dirs_client;
		CWStringList tmp_import_dirs_server;

		JSONArrayToStringList(import_dirs_json->GetArray("client"), &tmp_import_dirs_client);
		JSONArrayToStringList(import_dirs_json->GetArray("server"), &tmp_import_dirs_server);

		AutoImportDirsClient->Merge(&tmp_import_dirs_client);
		AutoImportDirsServer->Merge(&tmp_import_dirs_server);
	}

	// ui framework settings
	string frontend = FrontendName();
	string template_settings_filename = TemplateUiDir + frontend + ".json";
	CWJSONObject template_settings_json;
	if(!ParseJSONFile(template_settings_filename, &template_settings_json, true, pErrorMessage))
		return false;

	CWJSONObject* template_packages_json = template_settings_json.GetObject("packages");
	if(template_packages_json != NULL)
	{
		CWStringList meteor_packages;
		CWStringList npm_packages;
		CWStringList mrt_packages;

		JSONArrayToStringList(template_packages_json->GetArray("meteor"), &meteor_packages);
		JSONArrayToStringList(template_packages_json->GetArray("npm"), &npm_packages);
		JSONArrayToStringList(template_packages_json->GetArray("mrt"), &mrt_packages);

		PackagesToAdd->Meteor->Merge(&meteor_packages);
		PackagesToAdd->Npm->Merge(&npm_packages);
		PackagesToAdd->Mrt->Merge(&mrt_packages);
	}

	// load list of files to copy
	CWJSONArray* template_copy_files = template_settings_json.GetArray("copy_files");
	if(template_copy_files != NULL)
	{
		int template_copy_files_count = template_copy_files->Count();
		for(int i = 0; i < template_copy_files_count; i++)
		{
			CWJSONObject* pair = template_copy_files->Items[i]->GetObject();
			if(pair != NULL)
			{
				CWFilePair* file_pair = new CWFilePair();

				string source_file = pair->GetString("source");
				if(source_file.find("http://") != 0 && source_file.find("https://") != 0) {
					source_file = ConvertDirSeparator(source_file);
				}
				file_pair->Source = source_file;
				file_pair->SourceContent = UnescapeJSON(pair->GetString("source_content"));
				file_pair->Dest = ConvertDirSeparator(pair->GetString("dest"));
				FilesToCopy->Add(file_pair);
			}
		}
	}

	// load list of directories whose files will be included into client/main.js and server/main.js
	CWJSONObject* template_import_dirs_json = template_settings_json.GetObject("import_files");
	if(template_import_dirs_json != NULL)
	{
		CWStringList tmp_import_dirs_client;
		CWStringList tmp_import_dirs_server;

		JSONArrayToStringList(template_import_dirs_json->GetArray("client"), &tmp_import_dirs_client);
		JSONArrayToStringList(template_import_dirs_json->GetArray("server"), &tmp_import_dirs_server);

		AutoImportDirsClient->Merge(&tmp_import_dirs_client);
		AutoImportDirsServer->Merge(&tmp_import_dirs_server);
	}

	// ---


	if(FreeZone && !FreeZone->ReadSettings(PackagesToAdd, FilesToCopy, pErrorMessage))
		return false;

	if(PublicZone && !PublicZone->ReadSettings(PackagesToAdd, FilesToCopy, pErrorMessage))
		return false;

	if(PrivateZone && !PrivateZone->ReadSettings(PackagesToAdd, FilesToCopy, pErrorMessage))
		return false;

	return true;
}

string CWApplication::FrontendName()
{
	string frontend = Frontend;
	if(frontend == "") frontend = "bootstrap3";
	return frontend;
}

string CWApplication::TemplatingName()
{
	string templating = ForceTemplating;
	if(templating == "") templating = Templating;
	if(templating == "") templating = "blaze";
	return templating;
}


CWQuery* CWApplication::GetQuery(string sName)
{
	if(sName == "") return NULL;

	string msg = "";
	int query_count = Queries->Count();
	for(int i = 0; i < query_count; i++)
		if(Queries->Items[i]->Name == sName)
			return Queries->Items[i];

	return NULL;
}

bool CWApplication::Prepare(string* pErrorMessage)
{
	if(FreeZone == NULL && PublicZone == NULL && PrivateZone == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Error: \"application\" object must have at least one zone: \"free_zone\" and/or \"public_zone\" and \"private_zone\".";
		return false;
	}

	if((PublicZone != NULL && PrivateZone == NULL) || (PublicZone == NULL && PrivateZone != NULL))
	{
		if(pErrorMessage) *pErrorMessage = "Error: \"application\" object must have both \"public_zone\" and \"private_zone\" (or just only \"free_zone\").";
		return false;
	}

	string frontend = FrontendName();

	UseAccounts = false;
	if(PublicZone != NULL && PublicZone->Pages->Count() > 0) UseAccounts = true;
	if(PrivateZone != NULL && PrivateZone->Pages->Count() > 0) UseAccounts = true;

	TemplateDir = AddDirSeparator(AddDirSeparator(GetFullPath(AddDirSeparator(AddDirSeparator(ExtractFileDir(GetSelfPath())) + "..") + "templates")) + TemplatingName());
	TemplateUiDir = AddDirSeparator(AddDirSeparator(TemplateDir + "ui") + frontend);
	TemplateUiComponentsDir = AddDirSeparator(TemplateUiDir + "components");
	TemplateUiPagesDir = AddDirSeparator(TemplateUiDir + "pages");
	TemplateUiLayoutsDir = AddDirSeparator(TemplateUiDir + "layouts");
	TemplateCodeDir = AddDirSeparator(TemplateDir + "code");

	PluginsDir = AddDirSeparator(GetFullPath(AddDirSeparator(AddDirSeparator(ExtractFileDir(GetSelfPath())) + "..") + "plugins"));

	if(!DirectoryExists(TemplateDir))
	{
		if(pErrorMessage) *pErrorMessage = "Error: template directory not found \"" + TemplateDir + "\".";
		return false;
	}

	if(!DirectoryExists(TemplateUiDir))
	{
		if(pErrorMessage) *pErrorMessage = "Error: template directory not found \"" + TemplateUiDir + "\".";
		return false;
	}

	if(!DirectoryExists(TemplateCodeDir))
	{
		if(pErrorMessage) *pErrorMessage = "Error: template directory not found \"" + TemplateCodeDir + "\".";
		return false;
	}

	if(UseAccounts && Roles->Find("admin") < 0) {
		Roles->Add("admin");
	}

	if(UseAccounts && Roles->Find("blocked") < 0) {
		Roles->Add("blocked");
	}

	if(!ReadSettings(pErrorMessage))
		return false;

	if(!Router->Prepare(pErrorMessage))
		return false;

	return true;
}

string CWApplication::RelativeToOutputDir(string sFileName, bool bForceSlash)
{
	string filename = sFileName;
	if(FindSubString(&filename, OutputDir) == 0) {
		filename.erase(0, OutputDir.size());
		if(FindSubString(&filename, "\\") == 0 || FindSubString(&filename, "/") == 0) {
			filename.erase(0, OutputDir.size());
		}
		filename = EnsureFirstChar(filename, DIR_SEPARATOR_CHAR);
	}

	if(bForceSlash) {
		filename = ReplaceSubString(filename, "\\", "/");
	}
	
	return filename;
}

string CWApplication::ReplaceDirAlias(string sPath, string sAlias, string sDir, bool bRelativeToOutputDir, bool bForceSlash)
{
    string res = sPath;
	string dir = sDir;

	if(bRelativeToOutputDir) {
		dir = RelativeToOutputDir(dir, bForceSlash);
	}

	ReplaceSubString(&res, AddDirSeparator(sAlias), AddDirSeparator(dir));
	ReplaceSubString(&res, sAlias, AddDirSeparator(dir));

	if(bForceSlash) {
		res = ReplaceSubString(res, "\\", "/");
	}

	return res;
}

string CWApplication::ReplaceDirAlias(string sPath, bool bRelativeToOutputDir, bool bForceSlash)
{
	string res = sPath;

	res = ReplaceDirAlias(res, "TEMPLATE_DIR", TemplateDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "TEMPLATE_UI_DIR", TemplateUiDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "TEMPLATE_UI_COMPONENTS_DIR", TemplateUiComponentsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "TEMPLATE_UI_PAGES_DIR", TemplateUiPagesDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "TEMPLATE_CODE_DIR", TemplateCodeDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "INPUT_DIR", InputDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "OUTPUT_DIR", OutputDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_DIR", ClientDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_STARTUP_DIR", ClientStartupDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_UI_DIR", ClientUIDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_LIB_DIR", ClientLibDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_GLOBALS_DIR", ClientGlobalsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_COMPONENTS_DIR", ClientComponentsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_STYLES_DIR", ClientStylesDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_STYLES_FRAMEWORK_DIR", ClientStylesFrameworkDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_STYLES_DEFAULT_DIR", ClientStylesDefaultDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_STYLES_THEME_DIR", ClientStylesThemeDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_VIEWS_DIR", ClientViewsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_VIEWS_NOT_FOUND_DIR", ClientViewsNotFoundDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_VIEWS_LOADING_DIR", ClientViewsLoadingDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_VIEWS_LAYOUT_DIR", ClientViewsLayoutDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "CLIENT_ROUTER_DIR", ClientRouterDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "IMPORTS_DIR", ImportsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "SETTINGS_DIR", SettingsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "PACKAGES_DIR", PackagesDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "BOTH_DIR", BothDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "BOTH_LIB_DIR", BothLibDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "BOTH_COLLECTIONS_DIR", BothCollectionsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "BOTH_JOINS_DIR", BothJoinsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "PUBLIC_DIR", PublicDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "PUBLIC_IMAGES_DIR", PublicImagesDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "PUBLIC_FONTS_DIR", PublicFontsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "PRIVATE_DIR", PrivateDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "SERVER_DIR", ServerDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "SERVER_STARTUP_DIR", ServerStartupDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "SERVER_LIB_DIR", ServerLibDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "SERVER_COLLECTIONS_DIR", ServerCollectionsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "SERVER_COLLECTIONS_RULES_DIR", ServerCollectionsRulesDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "SERVER_PUBLISH_DIR", ServerPublishDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "SERVER_ROUTER_DIR", ServerRouterDir, bRelativeToOutputDir, bForceSlash);
	// deprecated - remove in future
	res = ReplaceDirAlias(res, "SERVER_CONTROLLERS_DIR", ServerRouterDir, bRelativeToOutputDir, bForceSlash);
	//
	res = ReplaceDirAlias(res, "SERVER_METHODS_DIR", ServerMethodsDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "LIB_DIR", LibDir, bRelativeToOutputDir, bForceSlash);
	res = ReplaceDirAlias(res, "STARTUP_DIR", StartupDir, bRelativeToOutputDir, bForceSlash);

	return res;
}

void CWApplication::ReplaceDirAlias(CWStringList* pPathList, bool bRelativeToOutputDir, bool bForceSlash)
{
	if(pPathList == NULL) {
		return;
	}
	
	int count = pPathList->Count();
	for(int i = 0; i < count; i++) {
		pPathList->Strings[i] = ReplaceDirAlias(pPathList->Strings[i], bRelativeToOutputDir, bForceSlash);
	}
}

bool CWApplication::ImportsForFileOrDir(string sPath, string sCommaDelimitedExtensions, CWStringList* pImports, bool bCSS, string* pErrorMessage)
{
	string dirpath = ReplaceDirAlias(sPath);
	CWStringList extensions;
	StringToList(sCommaDelimitedExtensions, ',', &extensions);

	string import_keyword = "import";
	if(bCSS) {
		import_keyword = "@import";
	}
	
	if(DirectoryExists(dirpath))
	{
		// get all files from the directory
		CWStringList tmp_files;
		if(DirectoryExists(dirpath) && !ListDir(dirpath, &tmp_files, false, NULL))
		{
			if(pErrorMessage) *pErrorMessage = "Cannot read directory \"" + dirpath + "\".";
			return false;
		}

		int tmp_files_count = tmp_files.Count();
		for(int j = 0; j < tmp_files_count; j++) {
			string tmp_file = tmp_files.Strings[j];
			string tmp_ext = ExtractFileExt(tmp_file);
			if(extensions.Find(tmp_ext) >= 0 && FindSubString(&tmp_file, ".import.") < 0) {
				if(j == 0 && pImports->Count() > 0) {
					pImports->Add("");
				}

				pImports->AddUnique(import_keyword + " \"" + RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(tmp_file, App()->OutputDir, ""), '/'), true) + "\";");
			}
		}
	} else {
		if(FileExists(dirpath)) {
			string tmp_ext = ExtractFileExt(dirpath);
			if(extensions.Find(tmp_ext) >= 0 && FindSubString(&dirpath, ".import.") < 0) {
				if(pImports->Count() > 0) {
					pImports->Add("");
				}
				pImports->AddUnique(import_keyword + " \"" + RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(dirpath, App()->OutputDir, ""), '/'), true) + "\";");
			}
		}
	}
	return true;
}

bool CWApplication::MeteorCreate(string sOutputDir, string* pErrorMessage)
{
	if(DirectoryExists(sOutputDir) && DirectoryExists(sOutputDir + AddDirSeparator(".meteor")))
	{
		FreshApp = false;
		if(ForceMeteorVersion != "")
		{
			string version_filename = sOutputDir + AddDirSeparator(".meteor") + "release";
			string current_version = "";
			if(FileExists(version_filename)) FileLoadString(version_filename, &current_version, 0, NULL);

			CWStringList tmp_version;
			tmp_version.SetText(current_version);

			string new_version = "METEOR@" + ForceMeteorVersion;

			if(tmp_version.Find(new_version) < 0)
			{
				int tmp_pos = tmp_version.FindBeginWith("METEOR@");
				if(tmp_pos >= 0)
				{
					Log("Updating project to meteor release \"" + ForceMeteorVersion + "\"...");
					tmp_version.Strings[tmp_pos] = new_version;
					string tmp_version_str = tmp_version.GetText();
					if(!SaveString(version_filename, &tmp_version_str, 0, pErrorMessage))
					{
						if(pErrorMessage != NULL) *pErrorMessage = "Cannot update meteor to version \"" + ForceMeteorVersion + "\"." + LINE_TERM + *pErrorMessage; 
						return false;
					}
					Log("OK");
				}
			}

		}
		return true;
	}
	
	FreshApp = true;

	// execute "meteor create" command
	string args = "create " + sOutputDir;
	args = args + " --bare";
	
	if(ForceMeteorVersion != "") args = args + " --release " + ForceMeteorVersion;
	if(UnsafePerm) args = args + " --unsafe-perm";

	Log("Executing \"meteor " + args + "\"...");

	if(!Execute(GetExecutablePath("meteor"), args.c_str(), true, pErrorMessage))
	{
		if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"meteor " + args + "\". " + *pErrorMessage;
		return false;
	}

	// remove files created by meteor
	string msg = "";
	string app_name = ExtractFileName(RemoveLastChar(RemoveLastChar(sOutputDir, '\\'), '/'));
	FileDelete(sOutputDir + app_name + ".html", &msg);
	FileDelete(sOutputDir + app_name + ".js", &msg);
	FileDelete(sOutputDir + app_name + ".css", &msg);
	FileDelete(AddDirSeparator(sOutputDir + "client") + "main.html", &msg);
	FileDelete(AddDirSeparator(sOutputDir + "client") + "main.js", &msg);
	FileDelete(AddDirSeparator(sOutputDir + "client") + "main.css", &msg);
	FileDelete(AddDirSeparator(sOutputDir + "server") + "main.js", &msg);

	return true;
}

bool CWApplication::MeteorRemove(CWStringList* pRemovePackages, string* pErrorMessage)
{
	Log("Checking installed packages...");

	if(!ChDir(OutputDir, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Cannot change current directory to \"" + OutputDir + "\". " + *pErrorMessage;
		return false;
	}

	CWStringList packages_to_remove_meteor;
	CWStringList packages_to_remove_npm;
	CWStringList packages_to_remove_mrt;

	packages_to_remove_meteor.Assign(pRemovePackages);

	CWJSONObject* old_packages = OldOutput->GetObject("packages");
	CWJSONArray* old_packages_meteor = NULL;
	CWJSONArray* old_packages_npm = NULL;
	CWJSONArray* old_packages_mrt = NULL;
	if(old_packages != NULL) {
		old_packages_meteor = old_packages->GetArray("meteor");
		old_packages_npm = old_packages->GetArray("npm");
		old_packages_mrt = old_packages->GetArray("mrt");
	}

	if(old_packages_meteor != NULL) {
		CWStringList new_packages_meteor;
		new_packages_meteor.Assign(PackagesToAdd->Meteor);
		new_packages_meteor.TerminateAllAtChar('@');

		int old_packages_meteor_count = old_packages_meteor->Count();
		for(int i = 0; i < old_packages_meteor_count; i++) {
			string old_package_name = TerminateAtChar(old_packages_meteor->Items[i]->GetString(), '@');
			if(new_packages_meteor.Find(old_package_name) < 0) {
				packages_to_remove_meteor.AddUnique(old_package_name);
			}
		}
	}

	if(old_packages_mrt != NULL) {
		CWStringList new_packages_mrt;
		new_packages_mrt.Assign(PackagesToAdd->Mrt);
		new_packages_mrt.TerminateAllAtChar('@');

		int old_packages_mrt_count = old_packages_mrt->Count();
		for(int i = 0; i < old_packages_mrt_count; i++) {
			string old_package_name = TerminateAtChar(old_packages_mrt->Items[i]->GetString(), '@');
			if(new_packages_mrt.Find(old_package_name) < 0) {
				packages_to_remove_mrt.AddUnique(old_package_name);
			}
		}
	}

	if(old_packages_npm != NULL) {
		CWStringList new_packages_npm;
		new_packages_npm.Assign(PackagesToAdd->Npm);
		new_packages_npm.TerminateAllAtChar('@');

		int old_packages_npm_count = old_packages_npm->Count();
		for(int i = 0; i < old_packages_npm_count; i++) {
			string old_package_name = TerminateAtChar(old_packages_npm->Items[i]->GetString(), '@');
			if(new_packages_npm.Find(old_package_name) < 0) {
				packages_to_remove_npm.AddUnique(old_package_name);
			}
		}
	}


	// meteor
	if(packages_to_remove_meteor.Count() > 0)
	{
		// load package list
		string packages_path = OutputDir + AddDirSeparator(".meteor") + "packages";
		string tmp_packages = "";
		if(!FileLoadString(packages_path, &tmp_packages, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Cannot read meteor packages file \"" + packages_path + "\". " + *pErrorMessage;
			return false;
		}
		CWStringList packages;
		packages.SetText(tmp_packages);
		packages.TerminateAllAtChar('#');
		packages.TerminateAllAtChar('@');
		packages.TrimAll();

		string package_list = "";
		int meteor_package_count = packages_to_remove_meteor.Count();
		for(int i = 0; i < meteor_package_count; i++)
		{
			string package_name = packages_to_remove_meteor.Strings[i];
			if(packages.Find(package_name, true) >= 0) package_list.append(" " + package_name);
		}

		if(package_list != "")
		{
			// executing "meteor remove" command...
			string args = "remove" + package_list;
			if(UnsafePerm) args = args + " --unsafe-perm";

			Log("Executing \"meteor " + args + "\"...");
			if(!Execute(GetExecutablePath("meteor"), args.c_str(), true, pErrorMessage))
			{
				if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"meteor " + args + "\". " + *pErrorMessage;
				return false;
			}
		}
	}

	// mrt
	if(packages_to_remove_mrt.Count() > 0)
	{
		// load package list
		string packages_path = OutputDir + AddDirSeparator(".meteor") + "packages";
		string tmp_packages = "";
		if(!FileLoadString(packages_path, &tmp_packages, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Cannot read mrt packages file \"" + packages_path + "\". " + *pErrorMessage;
			return false;
		}
		CWStringList packages;
		packages.SetText(tmp_packages);
		packages.TerminateAllAtChar('#');
		packages.TerminateAllAtChar('@');
		packages.TrimAll();

		string package_list = "";
		int mrt_package_count = packages_to_remove_mrt.Count();
		for(int i = 0; i < mrt_package_count; i++)
		{
			string package_name = packages_to_remove_mrt.Strings[i];
			if(packages.Find(package_name, true) >= 0) package_list.append(" " + package_name);
		}

		if(package_list != "")
		{
			// executing "mrt remove" command...
			string args = "remove" + package_list;
			if(UnsafePerm) args = args + " --unsafe-perm";

			Log("Executing \"mrt " + args + "\"...");
			if(!Execute(GetExecutablePath("mrt"), args.c_str(), true, pErrorMessage))
			{
				if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"mrt " + args + "\". " + *pErrorMessage;
				return false;
			}
		}
	}


	// npm
	if(packages_to_remove_npm.Count() > 0)
	{
		CWStringList packages;
		CWStringList versions;
		string packages_path = OutputDir + "package.json";
		bool found_packages_json = true;
		if(!FileExists(packages_path))
		{
			found_packages_json = false;
			// execute "npm init" command
			string args = "init -f";
			Log("Executing \"npm " + args + "\"...");
			if(!Execute(GetExecutablePath("npm"), args.c_str(), true, pErrorMessage))
			{
				if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"npm\". " + *pErrorMessage;
				return false;
			}
		}

		CWJSONObject tmp_json;
		if(!ParseJSONFile(packages_path, &tmp_json, false, pErrorMessage)) return false;

		CWJSONObject* dependencies = tmp_json.GetObject("dependencies");
		if(dependencies != NULL)
		{
			int dep_count = dependencies->Members->Count();
			for(int i = 0; i < dep_count; i++) {
				packages.Add(dependencies->Members->Items[i]->Name);
				versions.Add(dependencies->Members->Items[i]->Value->GetString());
			}
		}

		string package_list = "";
		int npm_package_count = packages_to_remove_npm.Count();
		for(int i = 0; i < npm_package_count; i++)
		{
			string package_name = packages_to_remove_npm.Strings[i];
			bool npm_package_missing = packages.Find(package_name, true) < 0;
			if(npm_package_missing && FindSubString(&package_name, "http") >= 0 && FindSubString(&package_name, "git") >= 0) {
				npm_package_missing = versions.Find("git+" + package_name, true) < 0;
			}
				
			if(!npm_package_missing) {
				package_list.append(" " + package_name);
			}
		}

		if(package_list != "")
		{
			if(found_packages_json) {
				// newer version of meteor, use meteor's npm
				string args = "npm remove " + package_list;
				Log("Executing \"meteor " + args + "\"...");
				if(!Execute(GetExecutablePath("meteor"), args.c_str(), true, pErrorMessage))
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"npm\". " + *pErrorMessage;
					return false;
				}
			} else {
				// must be older version of meteor, use system's npm
				// execute "npm remove" command
				string args = "remove " + package_list;
				Log("Executing \"npm " + args + "\"...");
				if(!Execute(GetExecutablePath("npm"), args.c_str(), true, pErrorMessage))
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"npm\". " + *pErrorMessage;
					return false;
				}
			}
		}
	}

	return true;
}

bool CWApplication::MeteorAdd(string* pErrorMessage)
{
	Log("Checking installed packages...");

	if(!ChDir(OutputDir, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Cannot change current directory to \"" + OutputDir + "\". " + *pErrorMessage;
		return false;
	}

	// update meteor packages
	if(PackagesToAdd->Meteor->Count() > 0)
	{
		// load package list
		string packages_path = OutputDir + AddDirSeparator(".meteor") + "packages";
		string tmp_packages = "";
		if(!FileLoadString(packages_path, &tmp_packages, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Cannot read meteor packages file \"" + packages_path + "\". " + *pErrorMessage;
			return false;
		}
		CWStringList packages;
		packages.SetText(tmp_packages);
		packages.TerminateAllAtChar('#');
		packages.TrimAll();

		string package_list = "";
		int meteor_package_count = PackagesToAdd->Meteor->Count();
		for(int i = 0; i < meteor_package_count; i++)
		{
			string package_name = PackagesToAdd->Meteor->Strings[i];
			
			if(packages.Find(package_name, true) < 0) {
				package_list.append(" " + package_name);

				if(package_name == "cfs:gridfs") {
					// clone fixed version of the package
					string gridfs_dir = AddDirSeparator("packages") + AddDirSeparator("gridfs");
//					string args = "clone https://github.com/perak/meteor-gridfs.git " + gridfs_dir;
					string args = "submodule add https://github.com/perak/meteor-gridfs.git " + gridfs_dir;

					Log("Executing \"git " + args + "\"...");
					if(!Execute(GetExecutablePath("git"), args.c_str(), true, pErrorMessage))
					{
						if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"git " + args + "\". " + *pErrorMessage;
						return false;
					}
					
					string gitmodules_path = AddDirSeparator(OutputDir) + ".gitmodules";
					if(FileExists(gitmodules_path)) {
						string gitmodules = "";
						if(FileLoadString(gitmodules_path, &gitmodules, 0, NULL)) {
							InsertAfterSubString(&gitmodules, "[submodule \"packages/gridfs\"]", (string)LINE_TERM + "\tignore = all");
							FileSaveString(gitmodules_path, &gitmodules, 0, NULL);
						}
					}
				}
			}
		}

		if(package_list != "")
		{
			// execute "meteor add" command
			string args = "add" + package_list;
			if(UnsafePerm) args = args + " --unsafe-perm";

			Log("Executing \"meteor " + args + "\"...");
			if(!Execute(GetExecutablePath("meteor"), args.c_str(), true, pErrorMessage))
			{
				if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"meteor " + args + "\". " + *pErrorMessage;
				return false;
			}
		}
	}

	// update mrt packages
	if(PackagesToAdd->Mrt->Count() > 0)
	{
		// load package list
		string packages_path = OutputDir + AddDirSeparator(".meteor") + "packages";
		string tmp_packages = "";
		if(!FileLoadString(packages_path, &tmp_packages, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Cannot read .meteor packages file. " + *pErrorMessage;
			return false;
		}
		CWStringList packages;
		packages.SetText(tmp_packages);
		packages.TerminateAllAtChar('#');
		packages.TrimAll();

		int mrt_package_count = PackagesToAdd->Mrt->Count();
		for(int i = 0; i < mrt_package_count; i++)
		{
			string package_name = PackagesToAdd->Mrt->Strings[i];
			if(packages.Find(package_name, true) < 0)
			{
				// execute "mrt add" command
				string args = "add " + package_name;
				Log("Executing \"mrt " + args + "\"...");
				if(!Execute(GetExecutablePath("mrt"), args.c_str(), true, pErrorMessage))
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"mrt\". " + *pErrorMessage;
					return false;
				}
			}
		}
	}

	// update npm packages
	if(PackagesToAdd->Npm->Count() > 0)
	{
		CWStringList packages;
		CWStringList versions;
		string packages_path = OutputDir + "package.json";
		bool found_packages_json = true;
		if(!FileExists(packages_path))
		{
			found_packages_json = false;
			// execute "npm init" command
			string args = "init -f";
			Log("Executing \"npm " + args + "\"...");
			if(!Execute(GetExecutablePath("npm"), args.c_str(), true, pErrorMessage))
			{
				if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"npm\". " + *pErrorMessage;
				return false;
			}
		}

		CWJSONObject tmp_json;
		if(!ParseJSONFile(packages_path, &tmp_json, false, pErrorMessage)) return false;

		CWJSONObject* dependencies = tmp_json.GetObject("dependencies");
		if(dependencies != NULL)
		{
			int dep_count = dependencies->Members->Count();
			for(int i = 0; i < dep_count; i++) {
				packages.Add(dependencies->Members->Items[i]->Name);
				versions.Add(dependencies->Members->Items[i]->Value->GetString());
			}
		}

		string package_list = "";
		int npm_package_count = PackagesToAdd->Npm->Count();
		for(int i = 0; i < npm_package_count; i++)
		{
			string package_name = PackagesToAdd->Npm->Strings[i];
			bool npm_package_missing = packages.Find(package_name, true) < 0;
			if(npm_package_missing && FindSubString(&package_name, "http") >= 0 && FindSubString(&package_name, "git") >= 0) {
				npm_package_missing = versions.Find("git+" + package_name, true) < 0;
			}
				
			if(npm_package_missing) {
				package_list.append(" " + package_name);
			}
		}

		if(package_list != "")
		{
			if(found_packages_json) {
				// newer version of meteor, use meteor's npm
				// execute "meteor npm add" command
				string args = "npm install --save " + package_list;
				Log("Executing \"meteor " + args + "\"...");
				if(!Execute(GetExecutablePath("meteor"), args.c_str(), true, pErrorMessage))
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"npm\". " + *pErrorMessage;
					return false;
				}
			} else {
				// must be older version of meteor, use system's npm
				// execute "npm add" command
				string args = "i --save " + package_list;
				Log("Executing \"npm " + args + "\"...");
				if(!Execute(GetExecutablePath("npm"), args.c_str(), true, pErrorMessage))
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"npm\". " + *pErrorMessage;
					return false;
				}
			}
		}
	}
	
	return true;
}

bool CWApplication::MeteorNpmInstall(string* pErrorMessage)
{
	// this app is just created, let's do "meteor npm install"
	string args = "npm install";
	Log("Executing \"meteor " + args + "\"...");
	if(!Execute(GetExecutablePath("meteor"), args.c_str(), true, pErrorMessage))
	{
		if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"npm\". " + *pErrorMessage;
		return false;
	}
	return true;
}

bool CWApplication::MeteorAddPlatforms(string* pErrorMessage)
{
	if(TargetPlatforms->Count() <= 0) return true;

	Log("Adding target platforms...");

	if(!ChDir(OutputDir, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Cannot change current directory to \"" + OutputDir + "\". " + *pErrorMessage;
		return false;
	}

	// read already installed platforms
	string platforms_path = OutputDir + AddDirSeparator(".meteor") + "platforms";
	string tmp_platforms = "";
	if(!FileLoadString(platforms_path, &tmp_platforms, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Cannot read meteor platforms file \"" + platforms_path + "\". " + *pErrorMessage;
		return false;
	}
	CWStringList platforms;
	platforms.SetText(tmp_platforms);


	int platform_count = TargetPlatforms->Count();
	for(int i = 0; i < platform_count; i++)
	{
		string platform_name = TargetPlatforms->Strings[i];
		if(platforms.Find(platform_name, false) < 0)
		{
			string args = "add-platform " + platform_name;
			if(UnsafePerm) args = args + " --unsafe-perm";
			Log("Executing \"meteor " + args + "\"...");
			if(!Execute(GetExecutablePath("meteor"), args.c_str(), true, pErrorMessage))
			{
				if(pErrorMessage != NULL) *pErrorMessage = "Error executing \"meteor " + args + "\". " + *pErrorMessage;
				return false;
			}
		}
	}

	return true;
}


bool CWApplication::CreateDirectoryStructureBlaze(string* pErrorMessage)
{
	ImportsDir = AddDirSeparator(OutputDir + "imports");
	StartupDir = AddDirSeparator(OutputDir);

	ClientDir = AddDirSeparator(OutputDir + "client");
	ClientStartupDir = AddDirSeparator(StartupDir + "client");
	ClientUIDir = AddDirSeparator(OutputDir + "client");
	ClientLibDir = AddDirSeparator(ClientUIDir + "lib");
	ClientGlobalsDir = AddDirSeparator(ClientLibDir + "globals");
	ClientComponentsDir = AddDirSeparator(ClientUIDir + "components");
	ClientStylesDir = AddDirSeparator(ClientUIDir + "styles");
	ClientStylesFrameworkDir = AddDirSeparator(ClientStylesDir + "framework");
	ClientStylesDefaultDir = AddDirSeparator(ClientStylesDir + "styles");
	ClientStylesThemeDir = AddDirSeparator(ClientStylesDefaultDir + "theme");
	ClientViewsDir = AddDirSeparator(ClientUIDir + "views");
	ClientViewsNotFoundDir = AddDirSeparator(ClientViewsDir + "not_found");
	ClientViewsLoadingDir = AddDirSeparator(ClientViewsDir + "loading");
	ClientViewsLayoutDir = AddDirSeparator(ClientViewsDir + "layout");
	ClientRouterDir = AddDirSeparator(ClientUIDir + "views");

	LibDir = AddDirSeparator(OutputDir + "lib");
	SettingsDir = AddDirSeparator(OutputDir);
	PackagesDir = AddDirSeparator(OutputDir + "packages");

	BothDir = AddDirSeparator(OutputDir + "both");
	BothLibDir = AddDirSeparator(BothDir + "lib");
	BothCollectionsDir = AddDirSeparator(BothDir + "collections");
	BothJoinsDir = AddDirSeparator(BothDir + "joins");

	PublicDir = AddDirSeparator(OutputDir + "public");
	PublicImagesDir = AddDirSeparator(PublicDir + "images");
	PublicFontsDir = AddDirSeparator(PublicDir + "fonts");

	PrivateDir = AddDirSeparator(OutputDir + "private");

	ServerDir = AddDirSeparator(OutputDir + "server");
	ServerStartupDir = AddDirSeparator(StartupDir + "server");
	ServerLibDir = AddDirSeparator(ServerDir + "lib");
	ServerCollectionsDir = AddDirSeparator(ServerDir + "collections");
	ServerCollectionsRulesDir = AddDirSeparator(ServerDir + "collections");
	ServerPublishDir = AddDirSeparator(ServerDir + "publish");
	ServerRouterDir = AddDirSeparator(ServerDir + "controllers");
	ServerMethodsDir = AddDirSeparator(ServerDir + "methods");

	return true;
}

bool CWApplication::CreateDirectoryStructureReact(string* pErrorMessage)
{
	ImportsDir = AddDirSeparator(OutputDir + "imports");
	StartupDir = AddDirSeparator(ImportsDir + "startup");
	ClientStartupDir = AddDirSeparator(StartupDir + "client");
	ServerStartupDir = AddDirSeparator(StartupDir + "server");

	LibDir = AddDirSeparator(ImportsDir + "modules");
	BothLibDir = AddDirSeparator(LibDir + "both");
	ClientLibDir = AddDirSeparator(LibDir + "client");
	ClientGlobalsDir = AddDirSeparator(ClientLibDir + "globals");
	ServerLibDir = AddDirSeparator(LibDir + "server");

	ClientDir = AddDirSeparator(OutputDir + "client");

	ClientUIDir = AddDirSeparator(ImportsDir + "ui");
	ClientComponentsDir = AddDirSeparator(ClientUIDir + "components");
	ClientStylesDir = AddDirSeparator(ClientUIDir + "stylesheets");
	ClientStylesFrameworkDir = AddDirSeparator(ClientStylesDir + "framework");
	ClientStylesDefaultDir = AddDirSeparator(ClientStylesDir + "styles");
	ClientStylesThemeDir = AddDirSeparator(ClientStylesDefaultDir + "theme");
	ClientViewsDir = AddDirSeparator(ClientUIDir + "pages");
	ClientViewsNotFoundDir = AddDirSeparator(ClientViewsDir + "not_found");
	ClientViewsLoadingDir = AddDirSeparator(ClientViewsDir + "loading");
	ClientViewsLayoutDir = AddDirSeparator(ClientUIDir + "layouts");
	ClientRouterDir = AddDirSeparator(ClientUIDir + "router");

	SettingsDir = AddDirSeparator(OutputDir);
	PackagesDir = AddDirSeparator(OutputDir + "packages");
	PublicDir = AddDirSeparator(OutputDir + "public");
	PublicImagesDir = AddDirSeparator(PublicDir + "images");
	PublicFontsDir = AddDirSeparator(PublicDir + "fonts");
	PrivateDir = AddDirSeparator(OutputDir + "private");

	BothDir = AddDirSeparator(ImportsDir + "api");
	BothCollectionsDir = AddDirSeparator(AddDirSeparator(BothDir + "collections") + "both");
	BothJoinsDir = AddDirSeparator(BothCollectionsDir + "joins");

	ServerCollectionsDir = AddDirSeparator(AddDirSeparator(BothDir + "collections") + "server");
	ServerCollectionsRulesDir = AddDirSeparator(ServerCollectionsDir + "rules");
	ServerPublishDir = AddDirSeparator(AddDirSeparator(AddDirSeparator(BothDir + "collections") + "server") + "publications");

	ServerMethodsDir = AddDirSeparator(BothDir + "methods");
	ServerRouterDir = AddDirSeparator(BothDir + "server_routes");

	ServerDir = AddDirSeparator(OutputDir + "server");

	return true;
}

bool CWApplication::CreateDirectoryStructure(string* pErrorMessage)
{
	string templating_name = TemplatingName();

	if(templating_name != "blaze" && templating_name != "react")
	{
		if(pErrorMessage != NULL) *pErrorMessage = "Unknown templating library \"" + templating_name + "\".";
		return false;
	}

	if(templating_name == "blaze" && !CreateDirectoryStructureBlaze(pErrorMessage)) return false;
	if(templating_name == "react" && !CreateDirectoryStructureReact(pErrorMessage)) return false;

	// create directories
	Log("Creating directory structure...");

	if(!MkDir(ImportsDir, false, pErrorMessage)) return false;

	if(!MkDir(StartupDir, false, pErrorMessage)) return false;

	if(!MkDir(ClientDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientStartupDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientUIDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientLibDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientGlobalsDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientComponentsDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientStylesDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientStylesFrameworkDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientStylesDefaultDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientStylesThemeDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientViewsDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientViewsNotFoundDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientViewsLoadingDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientViewsLayoutDir, false, pErrorMessage)) return false;
	if(!MkDir(ClientRouterDir, false, pErrorMessage)) return false;

	if(!MkDir(LibDir, false, pErrorMessage)) return false;
	if(!MkDir(SettingsDir, false, pErrorMessage)) return false;
	if(!MkDir(PackagesDir, false, pErrorMessage)) return false;

	if(!MkDir(BothDir, false, pErrorMessage)) return false;
	if(!MkDir(BothLibDir, false, pErrorMessage)) return false;
	if(!MkDir(BothCollectionsDir, false, pErrorMessage)) return false;
	if(!MkDir(BothJoinsDir, false, pErrorMessage)) return false;

	if(!MkDir(PublicDir, false, pErrorMessage)) return false;
	if(!MkDir(PublicImagesDir, false, pErrorMessage)) return false;
	if(!MkDir(PublicFontsDir, false, pErrorMessage)) return false;

	if(!MkDir(PrivateDir, false, pErrorMessage)) return false;

	if(!MkDir(ServerDir, false, pErrorMessage)) return false;
	if(!MkDir(ServerStartupDir, false, pErrorMessage)) return false;
	if(!MkDir(ServerLibDir, false, pErrorMessage)) return false;
	if(!MkDir(ServerCollectionsDir, false, pErrorMessage)) return false;
	if(!MkDir(ServerCollectionsRulesDir, false, pErrorMessage)) return false;
	if(!MkDir(ServerPublishDir, false, pErrorMessage)) return false;
	if(!MkDir(ServerRouterDir, false, pErrorMessage)) return false;
	if(!MkDir(ServerMethodsDir, false, pErrorMessage)) return false;
	
	return true;
}

bool CWApplication::Generate(string sInputFile, string sInputDir, string sOutputDir, bool bCoffee, bool bJade, CWStringList* pTargetPlatforms, string sForceMeteorVersion, string sForceTemplating, bool bUnsafePerm, bool bInputFileIsInTempDir, string sCWD, string* pErrorMessage)
{
	if(!FileExists(sInputFile))
	{
		if(pErrorMessage) *pErrorMessage = "Error: input file not found \"" + sInputFile + "\".";
		return false;
	}

	if(!LoadFromFile(sInputFile, pErrorMessage))
		return false;

	InputDir = sInputDir;//AddDirSeparator(ExtractFileDir(GetFullPath(sInputFile)));

	Coffee = bCoffee;
	Jade = bJade;

	TargetPlatforms->Assign(pTargetPlatforms);

	ForceMeteorVersion = sForceMeteorVersion;
	ForceTemplating = sForceTemplating;
	
	UnsafePerm = bUnsafePerm;
	
	InputFileIsInTempDir = bInputFileIsInTempDir;
	
	CWD = sCWD;

	string templating_name = TemplatingName();

	if(!Prepare(pErrorMessage))
		return false;

	if(!MeteorCreate(sOutputDir, pErrorMessage))
		return false;

	if(!DirectoryExists(sOutputDir))
	{
		if(pErrorMessage != NULL) *pErrorMessage = "Error: output directory not found \"" + sOutputDir + "\".";
		return false;
	}

	OutputDir = AddDirSeparator(GetFullPath(sOutputDir));

	if(FileExists(OutputDir + ".meteor-kitchen.json")) {
		if(!LoadJSON(OutputDir + ".meteor-kitchen.json", OldOutput, pErrorMessage)) {
			return false;
		}

		CWJSONArray* old_files_array = OldOutput->GetArray("output_files");
		if(old_files_array != NULL)
		{
			int old_files_count = old_files_array->Count();
			for(int i = 0; i < old_files_count; i++)
			{
				CWJSONObject* old_file_entry = old_files_array->Items[i]->GetObject();
				if(old_file_entry != NULL)
				{
					string old_filename = ConvertDirSeparator(old_file_entry->GetString("path"));
					if(FileExists(OutputDir + old_filename))
					{
						string checksum = "";
						if(!FileSHA1(OutputDir + old_filename, &checksum, pErrorMessage)) {
							if(pErrorMessage != NULL) *pErrorMessage = "Error calculating file checksum. " + *pErrorMessage;
							return false;
						}
						old_file_entry->SetString("latest_checksum", checksum);
					}
				}
			}
		}
	}

	if(!CreateDirectoryStructure(pErrorMessage))
		return false;

	// remove unnecessary packages
    CWStringList remove_packages;
    remove_packages.Add("insecure");
    remove_packages.Add("autopublish");
	remove_packages.Add("static-html");
	if(!MeteorRemove(&remove_packages, pErrorMessage))
		return false;

	// add used packages
	if(!MeteorAdd(pErrorMessage))
		return false;

	if(FreshApp && !MeteorNpmInstall(pErrorMessage))
		return false;

	// create router
	if(!Router->Generate(pErrorMessage))
		return false;


	// read client template
	string client_js_template_file = "";
	if(UseAccounts)
		client_js_template_file = TemplateCodeDir + "client_accounts.js";
	else
		client_js_template_file = TemplateCodeDir + "client_simple.js";

	string client_js = "";
	if(!FileLoadString(client_js_template_file, &client_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading client template \"" + client_js_template_file + "\". " + *pErrorMessage;
		return false;
	}

	string client_startup_code = "";
	if(ClientStartupCode != "") client_startup_code = LINE_TERM + ClientStartupCode;
	if(ClientStartupSourceFile != "")
	{
		string client_startup_source_file = App()->InputDir + ClientStartupSourceFile;
		if(!FileExists(client_startup_source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: client startup source file not found \"" + client_startup_source_file + "\".";
			return false;
		}

		client_startup_source_file = GetFullPath(client_startup_source_file);

		string tmp_source = "";
		if(!FileLoadString(client_startup_source_file, &tmp_source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + client_startup_source_file + "\".";
			return false;
		}

		client_startup_code.append(LINE_TERM);
		client_startup_code.append(tmp_source);
	}

	if(Animate) {
		client_startup_code.append(LINE_TERM);
		client_startup_code.append("\t$(window).on(\"scroll resize\", function() {");
		client_startup_code.append(LINE_TERM);
		client_startup_code.append("\t\tanimateVisible();");
		client_startup_code.append(LINE_TERM);
		client_startup_code.append("\t});");
	}

	string client_startup_imports = "";
	client_startup_imports = ReplaceDirAlias(ClientStartupImports->GetText(), true, true);
	client_startup_imports.append(LINE_TERM);
	ReplaceSubString(&client_js, "/*CLIENT_STARTUP_IMPORTS*/", client_startup_imports);

	ReplaceSubString(&client_js, "APP_TITLE", Title);
	ReplaceSubString(&client_js, "/*CLIENT_STARTUP_CODE*/", client_startup_code);
	

	string global_on_rendered_code = "";
	if(GlobalOnRenderedCode != "") global_on_rendered_code = LINE_TERM + GlobalOnRenderedCode;

	if(Animate) {
		global_on_rendered_code.append(LINE_TERM);
		global_on_rendered_code.append("\tanimateVisible();");
	}

	ReplaceSubString(&client_js, "/*GLOBAL_ON_RENDERED_CODE*/", global_on_rendered_code);

	// write client code
	string client_js_dest_file = ClientStartupDir + "client.js";
	if(!SaveString(client_js_dest_file, &client_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing file \"" + client_js_dest_file + "\". " + *pErrorMessage;
		return false;
	}
	
	// styles hub
	string client_styles_dest_file = ClientStartupDir + "client.less";
	

	// index.html
	string client_html_template_file = TemplateCodeDir + "index.html";
	if(FileExists(client_html_template_file))
	{
		CWNode client_html;
		if(!LoadHTML(client_html_template_file, &client_html, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading client template \"" + client_html_template_file + "\". " + *pErrorMessage;
			return false;
		}
		
		client_html.Replace("APP_TITLE", Title, true, true);
		
		string client_html_dest_file = ClientDir + "index.html";
		if(!SaveHTML(client_html_dest_file, &client_html, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error writing client template \"" + client_html_dest_file + "\". " + *pErrorMessage;
			return false;
		}		
	}

	// read server template
	string server_template_file = "";
	if(UseAccounts)
		server_template_file = TemplateCodeDir + "server_accounts.js";
	else
		server_template_file = TemplateCodeDir + "server_simple.js";

	string server_js = "";
	if(!FileLoadString(server_template_file, &server_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading server template \"" + server_template_file + "\". " + *pErrorMessage;
		return false;
	}

	string server_startup_code = "";
	if(ServerStartupCode != "") server_startup_code = LINE_TERM + ServerStartupCode;
	if(ServerStartupSourceFile != "")
	{
		string server_startup_source_file = App()->InputDir + ServerStartupSourceFile;
		if(!FileExists(server_startup_source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: server startup source file not found \"" + server_startup_source_file + "\".";
			return false;
		}

		server_startup_source_file = GetFullPath(server_startup_source_file);

		string tmp_source = "";
		if(!FileLoadString(server_startup_source_file, &tmp_source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + server_startup_source_file + "\".";
			return false;
		}

		server_startup_code.append(LINE_TERM);
		server_startup_code.append(tmp_source);
	}

	string on_user_created_code = "";
	if(OnUserCreatedCode != "") on_user_created_code = LINE_TERM + OnUserCreatedCode;
	if(OnUserCreatedSourceFile != "")
	{
		string on_user_created_source_file = App()->InputDir + OnUserCreatedSourceFile;
		if(!FileExists(on_user_created_source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: on_user_created source file not found \"" + on_user_created_source_file + "\".";
			return false;
		}

		on_user_created_source_file = GetFullPath(on_user_created_source_file);

		string tmp_source = "";
		if(!FileLoadString(on_user_created_source_file, &tmp_source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + on_user_created_source_file + "\".";
			return false;
		}

		on_user_created_code.append(LINE_TERM);
		on_user_created_code.append(tmp_source);
	}

	string on_user_logged_code = "";
	if(OnUserLoggedCode != "") on_user_logged_code = LINE_TERM + OnUserLoggedCode;
	if(OnUserLoggedSourceFile != "")
	{
		string on_user_logged_source_file = App()->InputDir + OnUserLoggedSourceFile;
		if(!FileExists(on_user_logged_source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: on_user_logged source file not found \"" + on_user_logged_source_file + "\".";
			return false;
		}

		on_user_logged_source_file = GetFullPath(on_user_logged_source_file);

		string tmp_source = "";
		if(!FileLoadString(on_user_logged_source_file, &tmp_source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + on_user_logged_source_file + "\".";
			return false;
		}

		on_user_logged_code.append(LINE_TERM);
		on_user_logged_code.append(tmp_source);
	}

	string default_role = "";
	if(DefaultRole != "") default_role = "\"" + DefaultRole + "\"";


	ReplaceSubString(&server_js, "APP_TITLE", Title);

	if(SendVerificationEmail)
		ReplaceSubString(&server_js, "SEND_VERIFICATION_EMAIL", "true");
	else
		ReplaceSubString(&server_js, "SEND_VERIFICATION_EMAIL", "false");
		
	if(UseAccounts && Roles->Find("admin") >= 0) {
		// first user is admin
		InsertBeforeSubString(&server_js, "/*ON_USER_CREATED_CODE*/", "if(!Users.findOne({ roles: \"admin\" }) && user.roles.indexOf(\"admin\") < 0) {\n\t\tuser.roles = [\"admin\"];\n\t }\n");
	}

	string server_startup_imports = "";
	server_startup_imports = ReplaceDirAlias(ServerStartupImports->GetText(), true, true);
	server_startup_imports.append(LINE_TERM);

	ReplaceSubString(&server_js, "/*SERVER_STARTUP_IMPORTS*/", server_startup_imports);
	ReplaceSubString(&server_js, "/*SERVER_STARTUP_CODE*/", server_startup_code);
	ReplaceSubString(&server_js, "/*ON_USER_CREATED_CODE*/", on_user_created_code);
	ReplaceSubString(&server_js, "/*ON_USER_LOGGED_CODE*/", on_user_logged_code);
	ReplaceSubString(&server_js, "/*DEFAULT_ROLE*/", default_role);

	// write server code
	string server_dest_file = ServerStartupDir + "server.js";
	if(!SaveString(server_dest_file, &server_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing file \"" + server_dest_file + "\". " + *pErrorMessage;
		return false;
	}

	if(templating_name == "blaze")
	{
		// not found page
		string not_found_template_file = TemplateUiPagesDir + "page_not_found.html";
		string not_found_dest_file = ClientViewsNotFoundDir + "not_found.html";

		if(!FCopy(not_found_template_file, not_found_dest_file, false, 0, pErrorMessage))
			return false;
		if(!FCopy(ChangeFileExt(not_found_template_file, ".js"), ChangeFileExt(not_found_dest_file, ".js"), false, 0, pErrorMessage))
			return false;

		// loading page
		string loading_template_file = TemplateUiPagesDir + "page_loading.html";
		string loading_dest_file = ClientViewsLoadingDir + "loading.html";
		if(!FCopy(loading_template_file, loading_dest_file, false, 0, pErrorMessage))
			return false;
		if(!FCopy(ChangeFileExt(loading_template_file, ".js"), ChangeFileExt(loading_dest_file, ".js"), false, 0, pErrorMessage))
			return false;
	}
	
	if(templating_name == "react")
	{
		// not found page
		string not_found_template_file = TemplateUiPagesDir + "page_not_found.jsx";
		string not_found_dest_file = ClientViewsNotFoundDir + "not_found.jsx";
		if(!FCopy(not_found_template_file, not_found_dest_file, false, 0, pErrorMessage))
			return false;

		// loading page
		string loading_template_file = TemplateUiPagesDir + "page_loading.jsx";
		string loading_dest_file = ClientViewsLoadingDir + "loading.jsx";
		if(!FCopy(loading_template_file, loading_dest_file, false, 0, pErrorMessage))
			return false;
	}

	// styles
	string styles_template_file = TemplateUiDir + "styles.less";
	string styles_dest_file = ClientStylesDefaultDir + "styles.less";

	string styles = "";
	if(!FileLoadString(styles_template_file, &styles, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading styles template \"" + styles_template_file + "\". " + *pErrorMessage;
		return false;
	}

	if(Theme != "")
	{
		Log("Using theme \"" + Theme + "\"...");
		string theme_dir = AddDirSeparator(AddDirSeparator(TemplateUiDir + "themes") + Theme);
		if(!DirectoryExists(theme_dir))
		{
			if(pErrorMessage) *pErrorMessage = "Theme \"" + Theme + "\" not found. Expecting directory \"" + theme_dir + "\".";
			return false;
		}

		string theme_file = theme_dir + "theme.import.less";
		if(!FileExists(theme_file))
		{
			if(pErrorMessage) *pErrorMessage = "Theme \"" + Theme + "\" is invalid. Expecting file \"" + theme_file + "\".";
			return false;
		}

		ReplaceSubString(&styles, "/*IMPORT_THEME*/", "@import \"theme/" + ExtractFileName(theme_file) + "\";");

		// copy all files from theme directory
		CWStringList theme_files;
		if(!ListDir(theme_dir, &theme_files, true, NULL))
		{
			if(pErrorMessage) *pErrorMessage = "Cannot read theme directory \"" + theme_dir + "\".";
			return false;
		}

		int theme_files_count = theme_files.Count();
		if(theme_files_count > 0)
			Log("Copying theme files...");

		for(int i = 0; i < theme_files_count; i++)
		{
			string theme_source_file = theme_files.Strings[i];
			string theme_file_dest_dir = ReplaceSubString(ExtractFileDir(theme_source_file), theme_dir, ClientStylesThemeDir);

			// fonts dir to /public/fonts
			if(FindSubString(&theme_source_file, AddDirSeparator(AddDirSeparator(theme_dir) + "fonts")) == 0)
				theme_file_dest_dir = ReplaceSubString(ExtractFileDir(theme_source_file), AddDirSeparator(theme_dir) + "fonts", PublicFontsDir);

			// images dir to /public/images
			if(FindSubString(&theme_source_file, AddDirSeparator(AddDirSeparator(theme_dir) + "images")) == 0)
				theme_file_dest_dir = ReplaceSubString(ExtractFileDir(theme_source_file), AddDirSeparator(theme_dir) + "fonts", PublicImagesDir);

			string theme_dest_file = theme_file_dest_dir + ExtractFileName(theme_source_file);
			if(!MkDir(theme_file_dest_dir, false, pErrorMessage))
				return false;

			if(!FCopy(theme_source_file, theme_dest_file, false, 0, pErrorMessage))
				return false;
		}
	}
	else
	{
		if(FrontendName() == "bootstrap3") {
			InsertAfterSubString(&styles, "/*IMPORT_THEME*/", "\n@navbar_height: 50px;");
		}
		ReplaceSubString(&styles, "/*IMPORT_THEME*/", "");
	}

	Log("Creating stylesheet...");
	if(!SaveString(styles_dest_file, &styles, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error writing file \"" + styles_dest_file + "\". " + *pErrorMessage;
		return false;
	}

	Log("Creating layout...");
	if(templating_name == "blaze")
	{
		string html_template_file = "";
		string js_template_file = "";
		if(UseAccounts)
		{
			html_template_file = ChangeFileExt(TemplateUiLayoutsDir + "layout_container_accounts", ".html");
			js_template_file = ChangeFileExt(TemplateUiLayoutsDir + "layout_container_accounts", ".js");
		}
		else
		{
			html_template_file = ChangeFileExt(TemplateUiLayoutsDir + "layout_container_simple", ".html");
			js_template_file = ChangeFileExt(TemplateUiLayoutsDir + "layout_container_simple", ".js");		
		}

		string dest_dir = ClientViewsLayoutDir;
		string html_dest_file = dest_dir + "layout.html";
		string js_dest_file = dest_dir + "layout.js";
		if(!FCopy(html_template_file, html_dest_file, false, 0, pErrorMessage))
			return false;
		if(!FCopy(js_template_file, js_dest_file, false, 0, pErrorMessage))
			return false;
	}

	if(templating_name == "react")
	{
		string jsx_template_file = "";
		if(UseAccounts)
			jsx_template_file = ChangeFileExt(TemplateUiLayoutsDir + "layout_container_accounts", ".jsx");
		else
			jsx_template_file = ChangeFileExt(TemplateUiLayoutsDir + "layout_container_simple", ".jsx");

		string dest_dir = ClientViewsLayoutDir;
		string jsx_dest_file = dest_dir + "layout.jsx";
		if(!FCopy(jsx_template_file, jsx_dest_file, false, 0, pErrorMessage))
			return false;
	}

	// create pages
	if(FreeZone != NULL)
	{
		if(!FreeZone->GenerateZone(pErrorMessage))
			return false;
	}

	if(PublicZone != NULL && PrivateZone != NULL)
	{
		if(!PublicZone->GenerateZone(pErrorMessage))
			return false;

		if(!PrivateZone->GenerateZone(pErrorMessage))
			return false;
	}
	
	// cleanup layout
	if(templating_name == "react")
	{
		string dest_dir = ClientViewsLayoutDir;
		string jsx_dest_file = dest_dir + "layout.jsx";
		string tmp_layout = "";
		if(!FileLoadString(jsx_dest_file, &tmp_layout, 0, pErrorMessage))
			return false;

		ReplaceSubString(&tmp_layout, "/*IMPORTS*/", "");

		if(!SaveString(jsx_dest_file, &tmp_layout, 0, pErrorMessage))
			return false;
	}
	
	// create collections
	string joins_js = "";
	CWStringList join_imports;

	CWStringList bdb_connection_register;
	CWStringList bdb_connection_imports;

	int collection_count = Collections->Count();
	for(int i = 0; i < collection_count; i++)
	{
		CWCollection* collection = Collections->Items[i];
		if(!collection->Create(pErrorMessage))
			return false;

		// ---
		// Joins
		string join_list = "";
		for(int x = 0; x < collection->Fields->Count(); x++)
		{
			CWField* field = collection->Fields->Items[x];

			if(field->JoinCollection != "" && field->JoinCollectionField != "")
			{
				if(pErrorMessage) *pErrorMessage = "Collection field \"" + field->Name + "\" error while creating join: you cannot set both \"join_collection\" and \"join_collection_field\".";
				return false;
			}

			// simple join
			if(field->JoinCollection != "")
			{
				string col_variable = "";
				string col_name = "";
				if(field->JoinCollection == "users")
				{
					col_variable = "Users";
					col_name = "users";
				}
				else
				{
					CWCollection* join_collection = App()->GetCollection(field->JoinCollection);
					if(join_collection == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "You are trying to join with non-existing collection \"" + field->JoinCollection + "\".";
						return false;
					}
					col_variable = join_collection->Variable();
					col_name = join_collection->Name;
				}

				if(join_list == "")
				{
					join_list.append("// " + collection->Variable());
					join_list.append(LINE_TERM);
				}

				string join_fields = "";
				for(int y = 0; y < field->JoinFields->Count(); y++)
				{
					if(y > 0) join_fields.append(", ");
					join_fields.append("\"" + field->JoinFields->Strings[y] + "\"");
				}

				join_list.append(collection->Variable() + ".join(" + col_variable + ", \"" + field->Name + "\", \"" + field->JoinContainer + "\", [");
				join_list.append(join_fields);
				join_list.append("]);");
				join_list.append(LINE_TERM);

				string tmp_import_path_1 = "";
				if(collection->Name == "users") {
					tmp_import_path_1 = "meteor-user-roles";
				} else {
					tmp_import_path_1 = ChangeFileExt(App()->BothCollectionsDir + collection->Name, ".js");
					tmp_import_path_1 = App()->RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(tmp_import_path_1, App()->OutputDir, ""), '/'), true);
				}
				string tmp_import_1 = "import {" + collection->Variable() + "} from \"" + tmp_import_path_1 + "\";";

				string tmp_import_path_2 = "";
				if(col_name == "users") {
					tmp_import_path_2 = "meteor-user-roles";
				} else {
					tmp_import_path_2 = ChangeFileExt(App()->BothCollectionsDir + col_name, ".js");
					tmp_import_path_2 = App()->RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(tmp_import_path_2, App()->OutputDir, ""), '/'), true);
				}
				string tmp_import_2 = "import {" + col_variable + "} from \"" + tmp_import_path_2 + "\";";

				if(join_imports.Find(tmp_import_1) < 0) {
					join_imports.Add(tmp_import_1);
				}
				if(join_imports.Find(tmp_import_2) < 0) {
					join_imports.Add(tmp_import_2);
				}
			}

			// generic join
			if(field->JoinCollectionField != "")
			{
				if(join_list == "")
				{
					join_list.append("// " + collection->Variable());
					join_list.append(LINE_TERM);
				}
				join_list.append(collection->Variable() + ".genericJoin(\"" + field->JoinCollectionField + "\", \"" + field->Name + "\", \"" + field->JoinContainer + "\");");
				join_list.append(LINE_TERM);

				string tmp_import_path_1 = "";
				if(collection->Name == "users") {
					tmp_import_path_1 = "meteor-user-roles";
				} else {
					tmp_import_path_1 = ChangeFileExt(App()->BothCollectionsDir + collection->Name, ".js");
					tmp_import_path_1 = App()->RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(tmp_import_path_1, App()->OutputDir, ""), '/'), true);
				}
				string tmp_import_1 = "import {" + collection->Variable() + "} from \"" + tmp_import_path_1 + "\";";

				if(join_imports.Find(tmp_import_1) < 0) {
					join_imports.Add(tmp_import_1);
				}
			}

			// file collection join
			if(field->FileCollection != "")
			{
				CWCollection* file_collection = App()->GetCollection(field->FileCollection);
				if(file_collection == NULL)
				{
					if(pErrorMessage) *pErrorMessage = "You've specified non-existing file collection \"" + field->FileCollection + "\".";
					return false;
				}

				if(file_collection->Type != "file_collection")
				{
					if(pErrorMessage) *pErrorMessage = "File collection must be of type \"file_collection\".";
					return false;
				}

				if(join_list == "")
				{
					join_list.append("// " + collection->Variable());
					join_list.append(LINE_TERM);
				}

				join_list.append(collection->Variable() + ".join(" + file_collection->Variable() + ".files, \"" + field->Name + "\", \"" + field->FileContainer + "\");");
				join_list.append(LINE_TERM);

				string tmp_import_path_1 = "";
				if(collection->Name == "users") {
					tmp_import_path_1 = "meteor-user-roles";
				} else {
					tmp_import_path_1 = ChangeFileExt(App()->BothCollectionsDir + collection->Name, ".js");
					tmp_import_path_1 = App()->RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(tmp_import_path_1, App()->OutputDir, ""), '/'), true);
				}
				string tmp_import_1 = "import {" + collection->Variable() + "} from \"" + tmp_import_path_1 + "\";";

				string tmp_import_path_2 = "";
				if(file_collection->Name == "users") {
					tmp_import_path_2 = "meteor-user-roles";
				} else {
					tmp_import_path_2 = ChangeFileExt(App()->BothCollectionsDir + file_collection->Name, ".js");
					tmp_import_path_2 = App()->RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(tmp_import_path_2, App()->OutputDir, ""), '/'), true);
				}
				string tmp_import_2 = "import {" + file_collection->Variable() + "} from \"" + tmp_import_path_2 + "\";";

				if(join_imports.Find(tmp_import_1) < 0) {
					join_imports.Add(tmp_import_1);
				}
				if(join_imports.Find(tmp_import_2) < 0) {
					join_imports.Add(tmp_import_2);
				}

			}
		}
		if(join_list != "")
		{
			joins_js.append(join_list);
			joins_js.append(LINE_TERM);
		}
		
		// BDBConnection
		if(collection->Type == "bigchaindb") {
			// import collection
			string tmp_import_path = "";
			if(collection->Name == "users") {
				tmp_import_path = "meteor-user-roles";
			} else {
				tmp_import_path = ChangeFileExt(App()->BothCollectionsDir + collection->Name, ".js");
				tmp_import_path = App()->RelativeToOutputDir(EnsureFirstChar(ReplaceSubString(tmp_import_path, App()->OutputDir, ""), '/'), true);
			}
			string tmp_import = "import {" + collection->Variable() + "} from \"" + tmp_import_path + "\";";
			bdb_connection_imports.AddUnique(tmp_import);

			// register collection
			bdb_connection_register.AddUnique("\tBDBC.registerCollection(" + collection->Variable() + ");");
		}
	}

	// write joins
	if(joins_js != "")
	{
		// add imports
		if(templating_name == "react") {
			if(join_imports.Count() > 0) {
				joins_js = join_imports.GetText() + LINE_TERM + LINE_TERM + joins_js;
			}
		}

		// write file
		string joins_js_dest = BothJoinsDir + "joins.js";
		if(!SaveString(joins_js_dest, &joins_js, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error writing file \"" + joins_js_dest + "\". " + *pErrorMessage;
			return false;
		}
	}
	
	// write bdb connection
	if(bdb_connection_imports.Count() > 0 || bdb_connection_register.Count() > 0) {
		string bdb_connection_source = TemplateCodeDir + "bigchaindb_connection.js";
		string bdb_connection_js = "";

		if(!FileLoadString(bdb_connection_source, &bdb_connection_js, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file \"" + bdb_connection_source + "\". " + *pErrorMessage;
			return false;
		}
		
		ReplaceSubString(&bdb_connection_js, "/*IMPORTS*/", bdb_connection_imports.GetText());
		ReplaceSubString(&bdb_connection_js, "/*REGISTER_COLLECTIONS*/", bdb_connection_register.GetText());

		Log("Writing bigchaindb_connection.js...");
		string bdb_connection_dest = ServerCollectionsDir + "bigchaindb_connection.js";
		if(!SaveString(bdb_connection_dest, &bdb_connection_js, 0, pErrorMessage))
			return false;
	}


	if(MobileConfig != "")
	{
		Log("Writing mobile-config.js...");
		string mobile_config_path = OutputDir + "mobile-config.js";
		if(!SaveString(mobile_config_path, &MobileConfig, 0, pErrorMessage))
			return false;
	}

	if(Stylesheet != "")
	{
		Log("Writing user_styles.less...");
		string user_styles_path = ClientStylesDir + "user_styles.less";
		if(!SaveString(user_styles_path, &Stylesheet, 0, pErrorMessage))
			return false;
	}

	if(Animate) {
		// animate_visible.js
		string animate_visible_source = TemplateCodeDir + "animate_visible.js";
		string animate_visible_dest = ClientStylesDefaultDir + "animate_visible.js";
		if(!FCopy(animate_visible_source, animate_visible_dest, false, 0, pErrorMessage))
			return false;
	}

	int copy_files_count = FilesToCopy->Count();
	if(copy_files_count > 0)
	{
		Log("Copying files...");
		for(int i = 0; i < copy_files_count; i++)
		{
			bool source_is_temp = false;
			if(FilesToCopy->Items[i]->Source == "" && FilesToCopy->Items[i]->SourceContent == "")
			{
				if(pErrorMessage) *pErrorMessage = "Error in list of files to copy: both copy_files[" + IntToStr(i) + "].source and copy_files[" + IntToStr(i) + "].source_content are blank. Please set one of these.";
				return false;
			}

			if(FilesToCopy->Items[i]->Dest == "")
			{
				if(pErrorMessage) *pErrorMessage = "Error in list of files to copy: copy_files[" + IntToStr(i) + "].dest cannot be blank.";
				return false;
			}

			string raw_source_file = FilesToCopy->Items[i]->Source;
			if(raw_source_file == "") {
				source_is_temp = true;
				raw_source_file = TempDir() + RandomString(10) + ".tmp";
				if(!FileSaveString(raw_source_file, FilesToCopy->Items[i]->SourceContent, 0, pErrorMessage)) {
					return false;
				}
			}

			if(raw_source_file.find("http://") == 0 || raw_source_file.find("https://") == 0) {
				source_is_temp = true;
				string source_file_url = raw_source_file;
				raw_source_file = TempDir() + RandomString(10) + ".tmp";
				if(!CURLDownload(source_file_url, raw_source_file, true, pErrorMessage))
					return false;
			}

			string source_file = "";
			if(source_is_temp) {
				source_file = raw_source_file;
			} else {
				if(
					FindSubString(&raw_source_file, "TEMPLATE_DIR") >= 0 ||
					FindSubString(&raw_source_file, "TEMPLATE_UI_DIR") >= 0 ||
					FindSubString(&raw_source_file, "TEMPLATE_CODE_DIR") >= 0
				)
					source_file = ReplaceDirAlias(raw_source_file);
				else
					source_file = InputDir + raw_source_file;

				string expanded_source_file = source_file;
				source_file = GetFullPath(source_file, pErrorMessage);
				if(source_file == "")
				{
					if(pErrorMessage) *pErrorMessage = "Error copying files: source file not found \"" + expanded_source_file + "\".";
					return false;
				}
			}

			string source_dir = "";
			string dest_dir = "";
			CWStringList source_files;
			string dest_path = "";
			if(DirectoryExists(source_file))
			{
				source_dir = AddDirSeparator(source_file);
				if(!ListDir(source_dir, &source_files, true, pErrorMessage))
					return false;
				dest_dir = AddDirSeparator(ReplaceDirAlias(FilesToCopy->Items[i]->Dest));
				dest_path = dest_dir;
			}
			else
			{
				if(!FileExists(source_file))
				{
					if(pErrorMessage) *pErrorMessage = "Error copying files: source file not found \"" + source_file + "\".";
					return false;
				}
				else
				{
					source_dir = AddDirSeparator(ExtractFileDir(source_file));
					source_files.Add(source_file);
					dest_path = ReplaceDirAlias(FilesToCopy->Items[i]->Dest);
					dest_dir = AddDirSeparator(ExtractFileDir(dest_path));
				}
			}

			source_file = "";
			for(int y = 0; y < source_files.Count(); y++)
			{
				source_file = source_files.Strings[y];
				string source_filename = source_file;
				source_filename.erase(0, source_dir.size());
				
				string dest_file = dest_path;
				string dest_filename = dest_path;
				dest_filename.erase(0, dest_dir.size());
				if(dest_filename == "") dest_file = dest_dir + source_filename;
				if(FindSubString(&dest_file, OutputDir) != 0)
				{
					if(pErrorMessage) *pErrorMessage = "Error copying files: destination file path must be inside output dir: \"" + dest_file + "\".";
					return false;
				}

				string dest_directory = AddDirSeparator(ExtractFileDir(dest_file));
				if(!MkDir(dest_directory, false, pErrorMessage))
					return false;

				if(!FilesToCopy->Items[i]->NoEcho) Log("Copying \"" + source_file + "\" to \"" + dest_file + "\"...");
				if(!FCopy(source_file, dest_file, false, 0, pErrorMessage))
					return false;
			}
			
			if(source_is_temp) {
				if(!FileDelete(raw_source_file, pErrorMessage)) {
					return false;
				}
			}
		}
	}

	string meteor_settings_path = SettingsDir + "settings.json";
	CWJSONObject meteor_settings;
	if(FileExists(meteor_settings_path)) {
		if(!LoadJSON(meteor_settings_path, &meteor_settings, pErrorMessage)) {
			return false;
		}
	}

	CWJSONObject extended_meteor_settings;
	extended_meteor_settings.Merge(AddToMeteorSettings);
	extended_meteor_settings.Merge(&meteor_settings);

	string meteor_settings_str = extended_meteor_settings.Stringify(false, false, false, false);
	if(!SaveString(meteor_settings_path, meteor_settings_str, 0, pErrorMessage)) {
		return false;
	}

	if(Coffee)
	{
		Log("Converting JavaScript files to CoffeeScript...");
		CWStringList js_files;
		if(!ListDir(OutputDir, &js_files, true, NULL))
		{
			if(pErrorMessage) *pErrorMessage = "Cannot read output directory \"" + OutputDir + "\".";
			return false;
		}

		int js_files_count = js_files.Count();
		for(int i = 0; i < js_files_count; i++)
		{
			string js_source_file = js_files.Strings[i];
			string js_ext = ExtractFileExt(js_source_file);
			if(FindSubString(&js_source_file, string(DIR_SEPARATOR) + ".") < 0 && FindSubString(&js_source_file, ClientStylesDir) < 0 && js_ext == ".js")
			{
				string coffee_dest_file = ChangeFileExt(js_source_file, ".coffee");

				string args = js_source_file + " > " + coffee_dest_file;
				string cmd = "js2coffee " + args;
				string tmp_out = "";
				Log("Executing \"js2coffee " + args + "\"...");
				if(!Popen(cmd, &tmp_out, pErrorMessage))
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Error converting js to coffee. " + *pErrorMessage;
					return false;
				}
				if(FindSubString(&tmp_out, "error", false) >= 0)
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Error converting js to coffee.";
					return false;
				}

				if(!FileDelete(js_source_file, pErrorMessage))
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Cannot delete file \"" + js_source_file + "\". " + *pErrorMessage;
					return false;
				}
				
				OutputFiles->ReplaceStr(ReplaceSubString(js_source_file, OutputDir, ""), ReplaceSubString(coffee_dest_file, OutputDir, ""));
			}
		}

	}

	// convert html to jade
	if(Jade)
	{
		Log("Converting HTML files to Jade...");
		CWStringList html_files;
		if(!ListDir(OutputDir, &html_files, true, NULL))
		{
			if(pErrorMessage) *pErrorMessage = "Cannot read output directory \"" + OutputDir + "\".";
			return false;
		}

		int html_files_count = html_files.Count();
		for(int i = 0; i < html_files_count; i++)
		{
			string html_source_file = html_files.Strings[i];
			string html_ext = ExtractFileExt(html_source_file);
			if(FindSubString(&html_source_file, string(DIR_SEPARATOR) + ".") < 0 && html_ext == ".html")
			{
				string jade_dest_file = ChangeFileExt(html_source_file, ".jade");

				Log("Converting \"" + html_source_file + "\" to Jade...");

				// convert html file to jade
				if(!HTMLtoJade(html_source_file, jade_dest_file, pErrorMessage))
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Error converting HTML to Jade. " + *pErrorMessage;
					return false;
				}

				// remove original html file
				if(!FileDelete(html_source_file, pErrorMessage))
				{
					if(pErrorMessage != NULL) *pErrorMessage = "Cannot delete file \"" + html_source_file + "\". " + *pErrorMessage;
					return false;
				}

				OutputFiles->ReplaceStr(ReplaceSubString(html_source_file, OutputDir, ""), ReplaceSubString(jade_dest_file, OutputDir, ""));
			}
		}
	}

	// auto import files from directories into startup/server/server.js
	int auto_import_server_count = AutoImportDirsServer->Count();
	if(auto_import_server_count > 0) {
		CWStringList server_imports;
		for(int i = 0; i < auto_import_server_count; i++) {
			if(!ImportsForFileOrDir(AutoImportDirsServer->Strings[i], ".js", &server_imports, false, pErrorMessage))
				return false;
		}

		// write imports to server.js
		server_js = "";
		if(!FileLoadString(server_dest_file, &server_js, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file \"" + server_dest_file + "\". " + *pErrorMessage;
			return false;
		}

		ReplaceSubString(&server_js, "/*IMPORTS*/", server_imports.GetText());

		if(!SaveString(server_dest_file, &server_js, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error writing file \"" + server_dest_file + "\". " + *pErrorMessage;
			return false;
		}
	}


	// auto import files from directories into startup/client/client.js
	int auto_import_client_count = AutoImportDirsClient->Count();
	if(auto_import_client_count > 0) {
		CWStringList client_imports;
		CWStringList style_imports;

		for(int i = 0; i < auto_import_client_count; i++) {
			if(!ImportsForFileOrDir(AutoImportDirsClient->Strings[i], ".js,.jsx", &client_imports, false, pErrorMessage))
				return false;
		}

		for(int i = 0; i < auto_import_client_count; i++) {
			if(!ImportsForFileOrDir(AutoImportDirsClient->Strings[i], ".css,.less,.scss", &style_imports, true, pErrorMessage))
				return false;
		}

		if(client_imports.Count() > 0) {
			// write imports to client.js
			client_js = "";
			if(!FileLoadString(client_js_dest_file, &client_js, 0, pErrorMessage))
			{
				if(pErrorMessage) *pErrorMessage = "Error reading file \"" + client_js_dest_file + "\". " + *pErrorMessage;
				return false;
			}

			ReplaceSubString(&client_js, "/*IMPORTS*/", client_imports.GetText());

			if(!SaveString(client_js_dest_file, &client_js, 0, pErrorMessage))
			{
				if(pErrorMessage) *pErrorMessage = "Error writing file \"" + client_js_dest_file + "\". " + *pErrorMessage;
				return false;
			}
		}
		
		string client_styles = style_imports.GetText();
		if(!SaveString(client_styles_dest_file, &client_styles, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error writing file \"" + client_styles_dest_file + "\". " + *pErrorMessage;
			return false;
		}
	}

	// write .meteor-kitchen.json
	Log("Calculating checksums...");
	CWJSONObject generator_json;
	CWJSONArray* output_files_array = new CWJSONArray();
	generator_json.SetArray("output_files", output_files_array);
	int output_files_count = OutputFiles->Count();
	for(int i = 0; i < output_files_count; i++)
	{
		CWJSONObject* output_file_entry = new CWJSONObject();
		string output_filename = OutputFiles->Strings[i];
		output_file_entry->SetString("path", ReplaceSubString(output_filename, "\\", "/"));
		string checksum = "";
		if(!FileSHA1(OutputDir + output_filename, &checksum, pErrorMessage)) {
			if(pErrorMessage != NULL) *pErrorMessage = "Error calculating file checksum. " + *pErrorMessage;
			return false;
		}
		output_file_entry->SetString("checksum", checksum);
		output_files_array->AddObject(output_file_entry);
	}
	CWJSONArray* output_directories_array = new CWJSONArray();
	generator_json.SetArray("output_directories", output_directories_array);

	CWJSONObject* added_packages_object = new CWJSONObject();
	generator_json.SetObject("packages", added_packages_object);
	CWJSONArray* added_packages_meteor = new CWJSONArray();
	CWJSONArray* added_packages_npm = new CWJSONArray();
	CWJSONArray* added_packages_mrt = new CWJSONArray();
	added_packages_object->SetArray("meteor", added_packages_meteor);
	added_packages_object->SetArray("npm", added_packages_npm);
	added_packages_object->SetArray("mrt", added_packages_mrt);

	added_packages_meteor->AddStringList(PackagesToAdd->Meteor);
	added_packages_npm->AddStringList(PackagesToAdd->Npm);
	added_packages_mrt->AddStringList(PackagesToAdd->Mrt);

	CWStringList tmp_dir_list;
	tmp_dir_list.Assign(OutputDirectories);
	tmp_dir_list.Sort();

	int output_directories_count = tmp_dir_list.Count();
	for(int i = 0; i < output_directories_count; i++)
	{
		string output_dirname = tmp_dir_list.Strings[i];
		output_directories_array->AddString(ReplaceSubString(output_dirname, "\\", "/"));
	}

	if(!FileSaveString(OutputDir + ".meteor-kitchen.json", generator_json.Stringify(false), 0, pErrorMessage))
	{
		if(pErrorMessage != NULL) *pErrorMessage = "Error writing file list. " + *pErrorMessage;
		return false;
	}

	// remove junk files
	Log("Removing junk files...");
	CWJSONArray* old_files_array = OldOutput->GetArray("output_files");
	if(old_files_array != NULL)
	{
		int old_files_count = old_files_array->Count();
		for(int i = 0; i < old_files_count; i++)
		{
			CWJSONObject* old_file_entry = old_files_array->Items[i]->GetObject();
			if(old_file_entry != NULL)
			{
				string output_filename = old_file_entry->GetString("path");
				CWJSONObject* output_file_entry = output_files_array->GetObjectWithStringValue("path", output_filename);
				if(output_file_entry == NULL && FileExists(OutputDir + output_filename))
				{
					Log("Deleting file \"" + OutputDir + output_filename + "\"...");
					output_filename = ConvertDirSeparator(output_filename);
					if(!FileDelete(OutputDir + output_filename, pErrorMessage))
						return false;
				}
			}
		}
	}
	Log("Removing junk directories...");
	CWJSONArray* old_directories_array = OldOutput->GetArray("output_directories");
	CWStringList tmp_old_dir_list;
	if(old_directories_array != NULL)
	{
		int old_directories_count = old_directories_array->Count();
		for(int i = 0; i < old_directories_count; i++)
		{
			string output_dirname = old_directories_array->Items[i]->GetString();
			if(output_dirname != "")
			{
				tmp_old_dir_list.Add(output_dirname);
			}
		}
	}
	tmp_old_dir_list.Sort(true);

	for(int i = 0; i < tmp_old_dir_list.Count(); i++)
	{
		string output_dirname = tmp_old_dir_list.Strings[i];
		if(output_directories_array->FindString(output_dirname) < 0)
		{
			output_dirname = ConvertDirSeparator(output_dirname);
			if(DirectoryExists(OutputDir + output_dirname))
			{
				if(!DirectoryIsEmpty(OutputDir + output_dirname))
				{
					Log("Directory \"" + OutputDir + output_dirname + "\" is not removed because is not empty.");
				}
				else
				{
					Log("Deleting directory \"" + OutputDir + output_dirname + "\"...");
					if(!RmDirExt(OutputDir + output_dirname, true, pErrorMessage))
						return false;
				}
			}
		}
	}

	if(!MeteorAddPlatforms(pErrorMessage)) {
		return false;
	}

	return true;
}


// ***************************************************
// COMPONENTS
// ***************************************************

CWMenuItem::CWMenuItem(CWObject* pParent): CWObject(pParent)
{
	Title = "";
	Route = "";
	RouteParams = new CWParams();
	URL = "";
	ActionCode = "";
	Target = "";
	Class = "";
	ItemsContainerClass = "";
	IconClass = "";
	Items = new CWArray<CWMenuItem*>;
}

CWMenuItem::~CWMenuItem()
{
	Clear();
	delete RouteParams;
	delete Items;
}

void CWMenuItem::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "menu_item", "object");

	MetaAddMember(pMeta, "title", "Title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "route", "Route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "route_params", "Route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "url", "URL", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "target", "Set HTML target attr value", "string", "", "", false, "text", NULL);
//	MetaAddMember(pMeta, "action_code", "Action Code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "class", "Class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "items_container_class", "Items container class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "icon_class", "Icon class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "items", "Sub items", "array", "menu_item", "", false, "", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}
}

void CWMenuItem::Clear()
{
	CWObject::Clear();
	Title = "";
	Route = "";
	RouteParams->Clear();
	URL = "";
	Target = "";
	ActionCode = "";
	Class = "";
	ItemsContainerClass = "";
	IconClass = "";
	Items->Clear();
}

bool CWMenuItem::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Title = pJSON->GetString("title");
	Route = FromCamelCase(pJSON->GetString("route"), '_', true);
	RouteParams->LoadFromJSONArray(pJSON->GetArray("route_params"));
	URL = pJSON->GetString("url");
	Target = pJSON->GetString("target");
	ActionCode = UnescapeJSON(pJSON->GetString("action_code"));

	Class = pJSON->GetString("class");
	ItemsContainerClass = pJSON->GetString("items_container_class");
	IconClass = pJSON->GetString("icon_class");

	// load items
	CWJSONArray* items = pJSON->GetArray("items");
	if(items)
	{
		int items_count = items->Count();
		for(int i = 0; i < items_count; i++)
		{
			CWJSONObject* item = items->Items[i]->GetObject();
			if(item != NULL)
			{
				CWMenuItem* obj = new CWMenuItem(this);
				if(!obj->LoadFromJSON(item, "item" + IntToStr(i + 1), pErrorMessage))
				{
					delete obj;
					return false;
				}
				Items->Add(obj);
			}
		}
	}

	return true;
}

bool CWMenuItem::CreateBlaze(CWNode* pTemplate, CWNode* pDestHTML, int iItemIndex, string* pErrorMessage)
{
	string item_class = Class;
	if(item_class == "" && App()->FrontendName() == "semantic-ui") item_class = "item";
	string item_link = "#";
	string icon_class = IconClass;
	string title = Title;

	if(Route != "")
	{
		string route_params = "";
		for(int i = 0; i < RouteParams->Count(); i++)
		{
			CWParam* param = RouteParams->Items[i];
			route_params.append(" " + param->Name + "=" + param->Value);
		}

		item_link = "{{pathFor '" + Route + "'";
		item_link.append(route_params);
		item_link.append("}}");
		if(item_class != "") item_class.append(" ");
		item_class.append("{{menuItemClass '" + Route + "'}}");
	}
	else
	{
		if(URL != "") item_link = URL;
	}

	if(Target != "")
	{
		CWNode* link_node = NULL;
		if(pDestHTML->Name == "a")
			link_node = pDestHTML;
		else
			link_node = pDestHTML->FindChild("a", true, true);

		if(link_node != NULL) link_node->Attr->SetValue("target", Target);
	}

	CWNode* title_node = pDestHTML->FindChild(".item-title", true, true);
	if(title_node != NULL && title == "") pDestHTML->DeleteChild(title_node, true);

	CWNode* icon_node = pDestHTML->FindChild("#item-icon", true, true);
	if(icon_node != NULL)
	{
		if(icon_class == "")
			pDestHTML->DeleteChild(icon_node, true);
		else
		{
			if(title != "") title = "&nbsp;" + title;
			icon_node->Attr->DeleteNameValue("id");
		}
	}

	pDestHTML->Replace("ITEM_ID", RandomString(5), true, true);
	pDestHTML->Replace("ITEM_CLASS", item_class, true, true);
	pDestHTML->Replace("ITEM_LINK", item_link, true, true);
	pDestHTML->Replace("ITEM_TITLE", title, true, true);
	pDestHTML->Replace("ITEM_INDEX", IntToStr(iItemIndex), true, true);
	pDestHTML->Replace("ICON_CLASS", icon_class, true, true);

	int item_count = Items->Count();
	if(item_count > 0)
	{
		string items_dest_selector = "#menu-items";
		CWNode* items_dest_node = pDestHTML->FindChild(items_dest_selector, true, true);
		if(items_dest_node == NULL) items_dest_node = pDestHTML;

		if(ItemsContainerClass != "")
		{
			CWNode* tmp = new CWNode("div");
			tmp->AddClass(ItemsContainerClass);
			items_dest_node->AddChild(tmp);
			items_dest_node = tmp;
		}

		for(int i = 0; i < item_count; i++)
		{
			CWMenuItem* item = Items->Items[i];

			string item_template_selector = "";
			if(item->Items->Count() > 0)
				item_template_selector = "#menu-item-dropdown";
			else
				item_template_selector = "#menu-item-simple";

			CWNode* item_template = pTemplate->FindChild(item_template_selector, true, true);

			if(item_template == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Cannot find menu item template element \"" + item_template_selector + "\".";
				return false;
			}

			CWNode* item_node = new CWNode();
			item_node->CopyFrom(item_template);

			if(!item->CreateBlaze(pTemplate, item_node, i, pErrorMessage))
			{
				delete item_node;
				return false;
			}

			item_node->Attr->DeleteNameValue("id");
			items_dest_node->AddChild(item_node);
		}
	}

	return true;
}

bool CWMenuItem::CreateReact(CWNode* pTemplate, CWNode* pDestHTML, int iItemIndex, string* pErrorMessage)
{
	string item_class = Class;
	CWMenu* parent_menu = dynamic_cast<CWMenu*>(Parent);
	if(parent_menu != NULL) {
		if(item_class == "") {
			if(parent_menu->Template == "menu") {
				if(App()->FrontendName() == "semantic-ui") item_class = "item";
			}
			if(parent_menu->Template == "menu_buttons") {
				if(App()->FrontendName() == "bootstrap3") item_class = "btn btn-default";
				if(App()->FrontendName() == "semantic-ui") item_class = "button";
			}
		}
	} else {
		if(App()->FrontendName() == "semantic-ui") item_class = "item";
	}

	string item_link = "#";
	string icon_class = IconClass;
	string title = Title;

	if(Route != "")
	{
		string route_params = RouteParams->AsString();
		ReplaceSubString(&route_params, "this.params.", "this.props.routeParams.");
		item_link = "{pathFor('" + Route + "', {" + route_params + "})}";
		if(item_class != "") item_class.append(" ");
		item_class.append("${menuItemClass('" + Route + "')}");
	}
	else
	{
		if(URL != "") item_link = URL;
	}

	if(Target != "")
	{
		CWNode* link_node = NULL;
		if(pDestHTML->Name == "a")
			link_node = pDestHTML;
		else
			link_node = pDestHTML->FindChild("a", true, true);

		if(link_node != NULL) link_node->Attr->SetValue("target", Target);
	}

	CWNode* title_node = pDestHTML->FindChild(".item-title", true, true);
	if(title_node != NULL && title == "") pDestHTML->DeleteChild(title_node, true);

	CWNode* icon_node = pDestHTML->FindChild("#item-icon", true, true);
	if(icon_node != NULL)
	{
		if(icon_class == "")
			pDestHTML->DeleteChild(icon_node, true);
		else
		{
			if(title != "") title = "&nbsp;" + title;
			icon_node->Attr->DeleteNameValue("id");
		}
	}

	pDestHTML->Replace("ITEM_ID", RandomString(5), true, true);
	pDestHTML->Replace("ITEM_CLASS", item_class, true, true);
	pDestHTML->Replace("ITEM_LINK", item_link, true, true);
	pDestHTML->Replace("ITEM_TITLE", title, true, true);
	pDestHTML->Replace("ITEM_INDEX", IntToStr(iItemIndex), true, true);
	pDestHTML->Replace("ICON_CLASS", icon_class, true, true);

	int item_count = Items->Count();
	if(item_count > 0)
	{
		string items_dest_selector = "#menu-items";
		CWNode* items_dest_node = pDestHTML->FindChild(items_dest_selector, true, true);
		if(items_dest_node == NULL) items_dest_node = pDestHTML;

		if(ItemsContainerClass != "")
		{
			CWNode* tmp = new CWNode("div");
			tmp->AddClass(ItemsContainerClass);
			items_dest_node->AddChild(tmp);
			items_dest_node = tmp;
		}

		for(int i = 0; i < item_count; i++)
		{
			CWMenuItem* item = Items->Items[i];

			string item_template_selector = "";
			if(item->Items->Count() > 0)
				item_template_selector = "#menu-item-dropdown";
			else
				item_template_selector = "#menu-item-simple";

			CWNode* item_template = pTemplate->FindChild(item_template_selector, true, true);

			if(item_template == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Cannot find menu item template element \"" + item_template_selector + "\".";
				return false;
			}

			CWNode* item_node = new CWNode();
			item_node->CopyFrom(item_template);

			if(!item->CreateReact(pTemplate, item_node, i, pErrorMessage))
			{
				delete item_node;
				return false;
			}

			item_node->Attr->DeleteNameValue("id");
			items_dest_node->AddChild(item_node);
		}
	}

	return true;
}

bool CWMenuItem::HasItemWithRoute(string sRouteName)
{
	int item_count = Items->Count();
	for(int i = 0; i < item_count; i++)
		if(Items->Items[i]->Route == sRouteName || Items->Items[i]->HasItemWithRoute(sRouteName))
			return true;

	return false;
}

// ---------------------------------------------------

CWMenu::CWMenu(CWObject* pParent): CWComponent(pParent)
{
	Items = new CWArray<CWMenuItem*>;
	ItemsContainerClass = "";
	ScrollSpySelector = "";
}

CWMenu::~CWMenu()
{
	Clear();
	delete Items;
}

void CWMenu::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "menu", "component");

	MetaAddMember(pMeta, "items", "Sub items", "array", "menu_item", "", false, "", NULL);
	MetaAddMember(pMeta, "items_container_class", "Items container class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "scroll_spy_selector", "ScrollSpy selector", "string", "", "", false, "text", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "menu", false, "static", NULL);

	CWStringList template_list;
	template_list.Add("menu");
	template_list.Add("menu_buttons");
	MetaOverrideMember(pMeta, "template", "Template", "string", "", "", false, "select", &template_list);
}

void CWMenu::Clear()
{
	CWComponent::Clear();
	Items->Clear();
	ItemsContainerClass = "";
	ScrollSpySelector = "";
}

bool CWMenu::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	if(Type == "") Type = "menu";

	// load items
	CWJSONArray* items = pJSON->GetArray("items");
	if(items)
	{
		int items_count = items->Count();
		for(int i = 0; i < items_count; i++)
		{
			CWJSONObject* item = items->Items[i]->GetObject();
			if(item != NULL)
			{
				CWMenuItem* obj = new CWMenuItem(this);
				if(!obj->LoadFromJSON(item, "item" + IntToStr(i + 1), pErrorMessage))
				{
					delete obj;
					return false;
				}
				Items->Add(obj);
			}
		}
	}

	ItemsContainerClass = pJSON->GetString("items_container_class");
	ScrollSpySelector = pJSON->GetString("scroll_spy_selector");

	return true;
}

bool CWMenu::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string items_template_file = ChangeFileExt(TemplateFile(), ".html");
	CWNode items_template;
	if(!LoadHTML(items_template_file, &items_template, pErrorMessage))
		return false;

	string items_container_class = ItemsContainerClass;

	int item_count = Items->Count();
	if(item_count > 0)
	{
		string items_dest_selector = "#menu-items";
		CWNode* items_dest_node = pHTML->FindChild(items_dest_selector, true, true);
		if(items_dest_node == NULL)
		{
			if(pErrorMessage) *pErrorMessage = "Cannot find menu items destination element \"" + items_dest_selector + "\".";
			return false;
		}

		if(dynamic_cast<CWZone*>(ParentPage(true)) != NULL)
		{
			if(Class == "" && items_container_class == "")
			{
				string frontend = App()->FrontendName();

				if(frontend == "semantic-ui")
				{
					string container_class = dynamic_cast<CWZone*>(ParentPage(true))->ContainerClass;
					if(container_class == "") container_class = "ui container";
					items_container_class = container_class;
				}
			}
		}

		if(items_container_class != "")
		{
			CWNode* tmp = new CWNode("div");
			tmp->AddClass(items_container_class);
			items_dest_node->AddChild(tmp);
			items_dest_node = tmp;
		}

		for(int i = 0; i < item_count; i++)
		{
			CWMenuItem* item = Items->Items[i];

			string item_template_selector = "";
			if(item->Items->Count() > 0)
			{
				if(FindSubString(&Class, "nav-stacked") >= 0 || FindSubString(&Class, "nav-list") >= 0)
					item_template_selector = "#menu-item-collapse";
				else
					item_template_selector = "#menu-item-dropdown";
			}
			else
				item_template_selector = "#menu-item-simple";

			CWNode* item_template = items_template.FindChild(item_template_selector, true, true);

			if(item_template == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Cannot find menu item template element \"" + item_template_selector + "\".";
				return false;
			}

			CWNode* item_node = new CWNode();
			item_node->CopyFrom(item_template);

			if(!item->CreateBlaze(&items_template, item_node, i, pErrorMessage))
			{
				delete item_node;
				return false;
			}

			items_dest_node->AddChild(item_node);
		}
	}

	// scrollspy
	if(ScrollSpySelector != "")
	{
		string dest_selector = DestSelector;
		if(dest_selector == "") dest_selector = "#" + Type;

		if(dest_selector == "")
		{
			if(pErrorMessage) *pErrorMessage = "Scrollspy-ing menu must have \"dest_selector\".";
			return false;
		}

		string spy_code = "";
		spy_code.append("\n\t$(\"" + ScrollSpySelector + "\").css({ \"position\": \"relative\" });");
		spy_code.append("\n\t$(\"" + ScrollSpySelector + "\").attr({ \"data-spy\": \"scroll\", \"data-target\": \"" + dest_selector + "\", \"data-offset\": \"70\" });");
		TemplateRenderedCode.append(spy_code);
	}

	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	return true;
}

bool CWMenu::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string items_template_file = ChangeFileExt(AddSuffixToFileName(TemplateFile(), "_items"), ".jsx");
	CWNode items_template;
	if(!LoadJSX(items_template_file, &items_template, pErrorMessage))
		return false;

	string items_container_class = ItemsContainerClass;

	int item_count = Items->Count();
	if(item_count > 0)
	{
		string items_dest_selector = "#menu-items";
		CWNode* items_dest_node = pHTML->FindChild(items_dest_selector, true, true);
		if(items_dest_node == NULL)
		{
			if(pErrorMessage) *pErrorMessage = "Cannot find menu items destination element \"" + items_dest_selector + "\".";
			return false;
		}

		if(dynamic_cast<CWZone*>(ParentPage(true)) != NULL)
		{
			if(Class == "" && items_container_class == "")
			{
				string frontend = App()->FrontendName();

				if(frontend == "semantic-ui")
				{
					string container_class = dynamic_cast<CWZone*>(ParentPage(true))->ContainerClass;
					if(container_class == "") container_class = "ui container";
					items_container_class = container_class;
				}
			}
		}

		if(items_container_class != "")
		{
			CWNode* tmp = new CWNode("div");
			tmp->AddClass(items_container_class);
			items_dest_node->AddChild(tmp);
			items_dest_node = tmp;
		}

		for(int i = 0; i < item_count; i++)
		{
			CWMenuItem* item = Items->Items[i];

			string item_template_selector = "";
			if(item->Items->Count() > 0)
			{
				if(FindSubString(&Class, "nav-stacked") >= 0 || FindSubString(&Class, "nav-list") >= 0)
					item_template_selector = "#menu-item-collapse";
				else
					item_template_selector = "#menu-item-dropdown";
			}
			else
				item_template_selector = "#menu-item-simple";

			CWNode* item_template = items_template.FindChild(item_template_selector, true, true);

			if(item_template == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Cannot find menu item template element \"" + item_template_selector + "\".";
				return false;
			}

			CWNode* item_node = new CWNode();
			item_node->CopyFrom(item_template);

			if(!item->CreateReact(&items_template, item_node, i, pErrorMessage))
			{
				delete item_node;
				return false;
			}

			items_dest_node->AddChild(item_node);
		}
	}

	// scrollspy
	if(ScrollSpySelector != "")
	{
		string dest_selector = DestSelector;
		if(dest_selector == "") dest_selector = "#" + Type;

		if(dest_selector == "")
		{
			if(pErrorMessage) *pErrorMessage = "Scrollspy-ing menu must have \"dest_selector\".";
			return false;
		}
/*
		string spy_code = "";
		spy_code.append("\n\t$(\"" + ScrollSpySelector + "\").css({ \"position\": \"relative\" });");
		spy_code.append("\n\t$(\"" + ScrollSpySelector + "\").attr({ \"data-spy\": \"scroll\", \"data-target\": \"" + dest_selector + "\", \"data-offset\": \"70\" });");
		TemplateRenderedCode.append(spy_code);
*/
	}

	if(!CWComponent::CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	return true;
}

bool CWMenu::HasItemWithRoute(string sRouteName)
{
	int item_count = Items->Count();
	for(int i = 0; i < item_count; i++)
		if(Items->Items[i]->Route == sRouteName || Items->Items[i]->HasItemWithRoute(sRouteName))
			return true;

	return false;
}

// ---------------------------------------------------

CWJumbotron::CWJumbotron(CWObject* pParent): CWComponent(pParent)
{
	Text = "";
	ImageURL = "";
	ButtonTitle = "";
	ButtonRoute = "";
	ButtonRouteParams = new CWParams();
	ButtonClass = "";
}

CWJumbotron::~CWJumbotron()
{
	Clear();
	delete ButtonRouteParams;
}

void CWJumbotron::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "jumbotron", "component");

	MetaAddMember(pMeta, "text", "Text", "string", "", "", false, "textarea", NULL);
	MetaAddMember(pMeta, "image_url", "Image URL", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "button_title", "Button title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "button_route", "Button route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "button_route_params", "Button route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "button_class", "Button CSS class", "string", "", "", false, "text", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "jumbotron", false, "static", NULL);
}

void CWJumbotron::Clear()
{
	Text = "";
	ImageURL = "";
	ButtonTitle = "";
	ButtonRoute = "";
	ButtonRouteParams->Clear();
	ButtonClass = "";
}

bool CWJumbotron::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Text = UnescapeJSON(pJSON->GetString("text"));
	ImageURL = pJSON->GetString("image_url");
	ButtonTitle = pJSON->GetString("button_title");
	ButtonRoute = FromCamelCase(pJSON->GetString("button_route"), '_', true);
	ButtonRouteParams->LoadFromJSONArray(pJSON->GetArray("button_route_params"));
	ButtonClass = pJSON->GetString("button_class");

	return true;
}

bool CWJumbotron::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string frontend = App()->FrontendName();

	pHTML->Replace("JUMBOTRON_TEXT", Text, true, true);

	CWNode* button_node = pHTML->FindChild("#jumbotron-button", true, true);
	if(button_node && ButtonRoute == "") pHTML->DeleteChild(button_node, true);

	string button_class = ButtonClass;
	if(button_class == "")
	{
		if(frontend == "bootstrap3") button_class = "btn btn-primary btn-lg";
		if(frontend == "semantic-ui") button_class = "ui large primary button";
	}

	string button_link = "{{pathFor \'" + ButtonRoute + "\'}}";

	if(ImageURL != "")
	{
		CWNode* jumbotron_node = pHTML->FindChild(".jumbotron", true, true);
		if(jumbotron_node != NULL) jumbotron_node->Attr->SetValue("style", "background-image: url('" + ImageURL + "');");
	}

	pHTML->Replace("BUTTON_CLASS", button_class, true, true);
	pHTML->Replace("BUTTON_TITLE", ButtonTitle, true, true);
	pHTML->Replace("BUTTON_LINK", button_link, true, true);

	ReplaceSubString(pJS, "/*BUTTON_ROUTE_PARAMS*/", ButtonRouteParams->AsString());
	ReplaceSubString(pJS, "BUTTON_ROUTE", ButtonRoute);

	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	return true;
}

bool CWJumbotron::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string frontend = App()->FrontendName();

	pHTML->Replace("JUMBOTRON_TEXT", Text, true, true);

	CWNode* button_node = pHTML->FindChild("#jumbotron-button", true, true);
	if(button_node && ButtonRoute == "") pHTML->DeleteChild(button_node, true);

	string button_class = ButtonClass;
	if(button_class == "")
	{
		if(frontend == "bootstrap3") button_class = "btn btn-primary btn-lg";
		if(frontend == "semantic-ui") button_class = "ui large primary button";
	}

	string button_link = "{pathFor(\'" + ButtonRoute + "\')}";

	if(ImageURL != "")
	{
		CWNode* jumbotron_node = pHTML->FindChild(".jumbotron", true, true);
		if(jumbotron_node != NULL) jumbotron_node->Attr->SetValue("style", "{{backgroundImage: \"url('" + ImageURL + "')\"}}");
	}

	pHTML->Replace("BUTTON_CLASS", button_class, true, true);
	pHTML->Replace("BUTTON_TITLE", ButtonTitle, true, true);
	pHTML->Replace("BUTTON_LINK", button_link, true, true);

//	ReplaceSubString(pJS, "/*BUTTON_ROUTE_PARAMS*/", ButtonRouteParams->AsString());
//	ReplaceSubString(pJS, "BUTTON_ROUTE", ButtonRoute);

	if(!CWComponent::CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	return true;
}

// ---------------------------------------------------


CWForm::CWForm(CWObject* pParent): CWComponent(pParent)
{
	Mode = "insert";
	Layout = "default";
	Autofocus = true;
	SubmitRoute = "";
	CancelRoute = "";
	CloseRoute = "";
	BackRoute = "";

	SubmitRouteParams = new CWParams();
	CancelRouteParams = new CWParams();
	CloseRouteParams = new CWParams();
	BackRouteParams = new CWParams();

	SubmitCode = "";
	CancelCode = "";

	SubmitButtonTitle = "";
	CancelButtonTitle = "";
	CloseButtonTitle = "";

	Fields = new CWArray<CWField*>;
	HiddenFields = new CWArray<CWHiddenField*>;

	ExternalFields = NULL;
}

CWForm::~CWForm()
{
	Clear();
	delete HiddenFields;
	delete Fields;
	delete CloseRouteParams;
	delete CancelRouteParams;
	delete SubmitRouteParams;
	delete BackRouteParams;
}

void CWForm::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "form", "component");

	CWStringList mode_list;
	mode_list.Add("insert");
	mode_list.Add("update");
	mode_list.Add("read_only");

	CWStringList layout_list;
	layout_list.Add("default");
	layout_list.Add("horizontal");
	layout_list.Add("inline");

	MetaAddMember(pMeta, "mode", "Mode", "string", "", "", true, "select", &mode_list);
	MetaAddMember(pMeta, "layout", "Form layout", "string", "", "default", false, "select", &layout_list);
	MetaAddMember(pMeta, "autofocus", "Autofocus", "bool", "", "true", false, "checkbox", NULL);

	MetaAddMember(pMeta, "submit_route", "Submit route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "cancel_route", "Cancel route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "close_route", "Close route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "back_route", "Back route", "string", "route_name", "", false, "select_route", NULL);

	MetaAddMember(pMeta, "submit_code", "Submit code", "string", "", "", false, "javascript", NULL);
	MetaAddMember(pMeta, "cancel_code", "Cancel code", "string", "", "", false, "javascript", NULL);

	MetaAddMember(pMeta, "submit_button_title", "Submit button title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "cancel_button_title", "Cancel button title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "close_button_title", "Close button title", "string", "", "", false, "text", NULL);

	MetaAddMember(pMeta, "submit_route_params", "Submit route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "cancel_route_params", "Cancel route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "close_route_params", "Close route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "back_route_params", "Back route params", "array", "param", "", false, "", NULL);

	MetaAddMember(pMeta, "fields", "Fields", "array", "field", "", false, "", NULL);
	MetaAddMember(pMeta, "hidden_fields", "Hidden fields", "array", "hidden_field", "", false, "", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "form", false, "static", NULL);
}

void CWForm::Clear()
{
	CWComponent::Clear();
	Mode = "";
	Layout = "";
	Autofocus = true;
	SubmitRoute = "";
	CancelRoute = "";
	CloseRoute = "";
	BackRoute = "";
	SubmitRouteParams->Clear();
	CancelRouteParams->Clear();
	CloseRouteParams->Clear();
	BackRouteParams->Clear();
	SubmitCode = "";
	CancelCode = "";
	SubmitButtonTitle = "";
	CancelButtonTitle = "";
	CloseButtonTitle = "";

	Fields->Clear();
	HiddenFields->Clear();
}

bool CWForm::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Mode = pJSON->GetString("mode");
	if(Mode == "") {
		Mode = "insert";
	}
	Layout = pJSON->GetString("layout");
	Autofocus = pJSON->HasMember("autofocus") ? pJSON->GetBool("autofocus") : true;
	SubmitRoute = FromCamelCase(pJSON->GetString("submit_route"), '_', true);
	CancelRoute = FromCamelCase(pJSON->GetString("cancel_route"), '_', true);
	CloseRoute = FromCamelCase(pJSON->GetString("close_route"), '_', true);
	BackRoute = FromCamelCase(pJSON->GetString("back_route"), '_', true);
	SubmitRouteParams->LoadFromJSONArray(pJSON->GetArray("submit_route_params"));
	CancelRouteParams->LoadFromJSONArray(pJSON->GetArray("cancel_route_params"));
	CloseRouteParams->LoadFromJSONArray(pJSON->GetArray("close_route_params"));
	BackRouteParams->LoadFromJSONArray(pJSON->GetArray("back_route_params"));
	SubmitCode = UnescapeJSON(pJSON->GetString("submit_code"));
	CancelCode = UnescapeJSON(pJSON->GetString("cancel_code"));
	SubmitButtonTitle = pJSON->GetString("submit_button_title");
	CancelButtonTitle = pJSON->GetString("cancel_button_title");
	CloseButtonTitle = pJSON->GetString("close_button_title");

	// load fields
	CWJSONArray* fields = pJSON->GetArray("fields");
	if(fields != NULL)
	{
		int fields_count = fields->Count();
		for(int i = 0; i < fields_count; i++)
		{
			CWJSONObject* field = fields->Items[i]->GetObject();
			if(field != NULL)
			{
				CWField* obj = new CWField(this);
				if(!obj->LoadFromJSON(field, "", pErrorMessage))
				{
					delete obj;
					return false;
				}
				Fields->Add(obj);
			}
		}
	}

	CWJSONArray* hidden_fields = pJSON->GetArray("hidden_fields");
	if(hidden_fields != NULL)
	{
		int fields_count = hidden_fields->Count();
		for(int i = 0; i < fields_count; i++)
		{
			CWJSONObject* field = hidden_fields->Items[i]->GetObject();
			if(field != NULL)
			{
				CWHiddenField* obj = new CWHiddenField();
				obj->Name = field->GetString("name");
				obj->Value = field->GetString("value");
				HiddenFields->Add(obj);
			}
		}
	}

	// force "findOne"
	CWQuery* main_query = GetMainQuery();
	if(main_query != NULL && !main_query->FindOne)
	{
		App()->Warning("Form \"" + Name + "\" is trying to use query \"" + main_query->Name + "\" which returns multiple rows. Please use query with \"find_one\" set to \"true\" in form.");

		string q_name = main_query->Name + "_find_one";
		CWQuery* q = App()->GetQuery(q_name);
		if(q == NULL)
		{
			q = new CWQuery(App());
            q->CopyFrom(main_query);
			q->Name = q_name;
			q->FindOne = true;
			App()->Queries->Add(q);
		}
	}

	return true;
}


bool CWForm::GetSubscriptions(CWSubscriptions* pSubscriptions, string* pErrorMessage)
{
	pSubscriptions->OwnsItems = false;

	// lookup subscriptions
	if(Mode == "insert" || Mode == "update")
	{
		CWArray<CWField*> *fields = GetFields();
		int field_count = fields->Count();
		for(int i = 0; i < field_count; i++)
		{
			CWField* field = fields->Items[i];
			CWSubscription* lookup_subscription = field->GetLookupSubscription();
			if(lookup_subscription != NULL && ((Mode == "insert" && field->ShowInInsertForm) || (Mode == "update" && field->ShowInUpdateForm)))
			{
				pSubscriptions->AddUnique(lookup_subscription);
			}
		}
	}

	return CWComponent::GetSubscriptions(pSubscriptions, pErrorMessage);
}

CWArray<CWField*> *CWForm::GetFields()
{
	if(ExternalFields) return ExternalFields;

	if(Fields->Count() == 0)
	{
		CWArray<CWField*> *collection_fields = CWComponent::GetFields();
		if(collection_fields && collection_fields->Count() > 0)
			return collection_fields;
	}
	return Fields;
}

bool CWForm::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	CWPage* parent_page = ParentPage(false);

	string form_node_name = "form";
	CWNode* form_node = pHTML->FindChild(form_node_name, true, true);
	if(form_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Form fields destination node \"" + form_node_name + "\" not found.";
		return false;
	}

	CWCollection* collection = NULL;
	CWQuery* main_query = GetMainQuery();
	string query_name = GetQueryName();

	if(main_query != NULL)
	{
		collection = GetCollection();
		if(collection == NULL && main_query->Collection != "users")
		{
			if(pErrorMessage) *pErrorMessage = "Collection \"" + main_query->Collection + "\" not found.";
			return false;
		}
	}

	string form_mode = Mode;
	if(form_mode == "edit") form_mode = "update";
	if(form_mode != "insert" && form_mode != "update" && form_mode != "read_only")
	{
		if(pErrorMessage) *pErrorMessage = "Form \"mode\" should be one of: \"insert\", \"update\" or \"read_only\".";
		return false;
	}

	string form_mode_var = ToCamelCase(TemplateName() + "_mode", '_', false);

	string info_message_var = ToCamelCase(TemplateName() + "_info_message", '_', false);
	string error_message_var = ToCamelCase(TemplateName() + "_error_message", '_', false);

	string form_layout = Layout;
	if(form_layout == "") form_layout = "default";
	if(form_layout != "default" && form_layout != "horizontal" && form_layout != "inline")
	{
		if(pErrorMessage) *pErrorMessage = "Form \"layout\" should be one of: \"default\", \"horizontal\" or \"inline\" (or just leave it empty).";
		return false;
	}
	bool autofocus = Autofocus;

	CWArray<CWField*> *form_fields = GetFields();

	// create fields
	int field_count = form_fields->Count();
	int focusable_count = 0;
	for(int i = 0; i < field_count; i++)
	{
		CWField* field = form_fields->Items[i];
		if(field != NULL)
		{
			string field_name = field->Name;
			string field_title = field->Title;
			string field_input = field->Input;
			string field_input_template = field->InputTemplate;
			string field_input_template_code = field->InputTemplateCode;
			string field_input_group_class = field->InputGroupClass;
			string field_input_control_class = field->InputControlClass;
			if(field_input == "") field_input = "text";
			string field_default = field->Default;
			string field_min = field->Min;
			string field_max = field->Max;
			string field_value = field->Default;
			bool field_required = field->Required;
			string field_type = field->Type;
			string field_format = field->Format;
			string field_id = ReplaceSubString(ReplaceSubString("field-" + FromCamelCase(field_name, '-', true), ".", "-"), "--", "-");
			string display_helper = field->DisplayHelper;
			string array_item_type = field->ArrayItemType;
			string crud_insert_title = field->CrudInsertTitle;
			string crud_insert_form_title = crud_insert_title;
			string crud_insert_button_title = crud_insert_title;
			if(crud_insert_form_title == "") crud_insert_form_title = "Insert";
			if(crud_insert_button_title == "") crud_insert_button_title = "Add";

			if(form_mode == "read_only")
			{
				if(field_input != "crud")
				{
					if(field_type == "file")
						field_input = "link";
					else
						field_input = "read-only";
				}
			}

			if(form_mode == "update" || form_mode == "read_only")
			{
				field_value = "{{" + query_name + "." + field_name + "}}";

				if(field_type == "file") field_value = "{{" + query_name + "." + field_name + ".url}}";
				if(field_type == "time") field_value = "{{secondsToTime " + query_name + "." + field_name + " \'" + field_format + "\'}}";
				if(field_type == "date") field_value = "{{formatDate " + query_name + "." + field_name + " \'" + field_format + "\'}}";
				if(display_helper != "") field_value = "{{" + display_helper + " " + query_name + "." + field_name + " " + query_name + "}}";
			}

			if(form_mode == "read_only") {
				if(field_type == "bool") field_value = "{{booleanToYesNo " + query_name + "." + field_name + "}}";
			}

			if(form_mode == "insert")
			{
				if(field_default != "")
				{
					if(field_type == "random_string") field_value = "{{randomString " + field_default + "}}";
					if(field_type == "time") field_value = "{{secondsToTime \'" + field_default + "\' \'" + field_format + "\'}}";
					if(field_type == "date") field_value = "{{formatDate \'" + field_default + "\' \'" + field_format + "\'}}";
					if(display_helper != "") field_value = "{{" + display_helper + " " + field_default + "}}";
				}
			}

			bool show_field = true;
			if(field_input == "none") show_field = false;
			if(form_mode == "insert" && !field->ShowInInsertForm) show_field = false;
			if(form_mode == "update" && !field->ShowInUpdateForm) show_field = false;
			if(form_mode == "read_only" && !field->ShowInReadOnlyForm) show_field = false;

			if(show_field)
			{
				CWNode* field_tmp_node = NULL;
				if(field_input == "custom")
				{
					if(field_input_template == "" && field_input_template_code == "")
					{
						if(pErrorMessage != NULL) *pErrorMessage = "Error creating form field \"" + field_name + "\": you must specify either \"input_template\" or \"input_template_code\" for \"custom\" input fields.";
						return false;
					}

					field_tmp_node = new CWNode();
					if(field_input_template != "") {
						string custom_input_template = "";
						if(App()->InputFileIsInTempDir) {
							custom_input_template = GetFullPath(ChangeFileExt(field_input_template, ".html"));
							if(custom_input_template == "") {
								custom_input_template = GetFullPath(AddDirSeparator(App()->CWD) + ChangeFileExt(field_input_template, ".html"));
							}
							if(custom_input_template == "") {
								custom_input_template = ChangeFileExt(field_input_template, ".html");
							}
						} else {
							custom_input_template = App()->InputDir + ChangeFileExt(field_input_template, ".html");
						}
						if(!LoadHTML(custom_input_template, field_tmp_node, pErrorMessage))
						{
							if(pErrorMessage != NULL) *pErrorMessage = "Error loading form input template file \"" + custom_input_template + "\". " + *pErrorMessage;
							return false;
						}
					}
					
					if(field_input_template_code != "") {
						// append template code to field_tmp_node (in case both input_template and input_template_code is specified).
						if(!field_tmp_node->ParseHTML(field_tmp_node->GetHTML(false) + "\n" + field_input_template_code, pErrorMessage)) {
							if(pErrorMessage != NULL) *pErrorMessage = "Error parsing form input template. " + *pErrorMessage;
							return false;
						}
					}
				}
				else
					field_tmp_node = pRawTemplate->FindChild("#form-input-" + field_input, true, true);

				if(field_tmp_node == NULL)
				{
					if(pErrorMessage) *pErrorMessage = "Field source element \"#form-input-" + field_input + "\" not found.";
					return false;
				}

				CWNode* field_source_node = new CWNode();
				field_source_node->CopyFrom(field_tmp_node);
				field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

				if(field_input == "text")
				{
					// find input element
					CWNode* input_element = field_source_node->FindChildByName("input", true, true);

					if(input_element)
					{
						if(autofocus && focusable_count == 0) input_element->Attr->SetValue("autofocus", "autofocus");
						if(field_required) input_element->Attr->SetValue("required", "required");
						if(field_type != "") input_element->Attr->SetValue("data-type", field_type);
						if(field_format != "") input_element->Attr->SetValue("data-format", field_format);
						if(field_min != "") input_element->Attr->SetValue("data-min", field_min);
						if(field_max != "") input_element->Attr->SetValue("data-max", field_max);
					}

					focusable_count++;
				}

				if(field_input == "datepicker")
				{
					// find input element
					CWNode* input_element = field_source_node->FindChildByName("input", true, true);

					if(input_element)
					{
						if(autofocus && focusable_count == 0) input_element->Attr->SetValue("autofocus", "autofocus");
						if(field_required) input_element->Attr->SetValue("required", "required");
						if(field_type != "") input_element->Attr->SetValue("data-type", field_type);
						if(field_format != "") input_element->Attr->SetValue("data-format", field_format);
						if(field_min != "") input_element->Attr->SetValue("data-min", field_min);
						if(field_max != "") input_element->Attr->SetValue("data-max", field_max);
					}

					focusable_count++;
				}

				if(field_input == "radio")
				{
					CWNode* item_tmp_node = pRawTemplate->FindChild("#form-input-" + field_input + "-item", true, true);
					if(item_tmp_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item source element \"#form-input-" + field_input + "-item\" not found.";
						return false;
					}

					CWNode* item_dest_node = field_source_node->FindChild("#form-input-" + field_input + "-items", true, true);
					if(item_dest_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item destination element \"#form-input-" + field_input + "-items\" not found.";
						return false;
					}

					CWNode* items_container_node = field_source_node->FindParentOfChild(item_dest_node);
					if(items_container_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item destination element \"#form-input-" + field_input + "-items\" not found.";
						return false;
					}

					int input_items_count = field->InputItems->Count();
					for(int x = 0; x < input_items_count; x++)
					{
						CWNode* item_source_node = new CWNode();
						item_source_node->CopyFrom(item_tmp_node);
						item_source_node->Attr->Delete(item_source_node->Attr->FindName("id"));

						CWInputItem* field_item = field->InputItems->Items[x];
						string item_title = field_item->Title;
						string item_value = field_item->Value;

						item_source_node->Replace("ITEM_TITLE", item_title, true, true);
						item_source_node->Replace("ITEM_VALUE", item_value, true, true);

						// find input element
						CWNode* input_element = item_source_node->FindChildByName("input", true, true);
						if(input_element != NULL)
						{
							if(field_type != "") input_element->Attr->SetValue("data-type", field_type);
							if(autofocus && focusable_count == 0) input_element->Attr->SetValue("autofocus", "autofocus");

							if(form_mode == "insert")
							{
								if(field_default != "")
								{
									if(item_value == field_default) input_element->Attr->Add("checked");
								}
								else
								{
									if(x == 0) input_element->Attr->Add("checked");
								}
							}

							if(form_mode == "update")
							{
								if(field_type == "integer" || field_type == "bool")
									input_element->Attr->Add("{{itemIsChecked " + query_name + "." + field_name + " " + item_value + "}}");
								else
									input_element->Attr->Add("{{itemIsChecked " + query_name + "." + field_name + " \"" + item_value + "\"}}");
							}

							focusable_count++;
						}
						items_container_node->InsertChild(item_source_node, items_container_node->IndexOfChild(item_dest_node));
					}
					field_source_node->DeleteChild(item_dest_node, true);
				}

				if(field_input == "checkbox")
				{
					CWNode* item_tmp_node = pRawTemplate->FindChild("#form-input-" + field_input + "-item", true, true);
					if(item_tmp_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item source element \"#form-input-" + field_input + "-item\" not found.";
						return false;
					}

					CWNode* item_dest_node = field_source_node->FindChild("#form-input-" + field_input + "-items", true, true);
					if(item_dest_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item destination element \"#form-input-" + field_input + "-items\" not found.";
						return false;
					}

					CWNode* items_container_node = field_source_node->FindParentOfChild(item_dest_node);
					if(items_container_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item destination element \"#form-input-" + field_input + "-items\" not found.";
						return false;
					}

					if(field_required) items_container_node->Attr->SetValue("data-required", "true");

					int input_items_count = field->InputItems->Count();
					if(input_items_count == 0)
					{
						CWNode* item_source_node = new CWNode();
						item_source_node->CopyFrom(item_tmp_node);
						item_source_node->Attr->Delete(item_source_node->Attr->FindName("id"));

						// remove label
						CWNode* label_node = field_source_node->FindChildByName("label", true, true);
						if(label_node != NULL)
						{
							if(form_layout == "horizontal")
								label_node->Replace("FIELD_TITLE", "&nbsp;", true, true);
							else
								field_source_node->DeleteChild(label_node, true);
						}

						string item_title = field_title;
						string item_value = field_value;

						item_source_node->Replace("ITEM_TITLE", item_title, true, true);
						item_source_node->Replace("ITEM_VALUE", item_value, true, true);

						// find input element
						CWNode* input_element = item_source_node->FindChildByName("input", true, true);
						if(input_element != NULL)
						{
							if(field_type != "") input_element->Attr->SetValue("data-type", field_type);
							if(autofocus && focusable_count == 0) input_element->Attr->SetValue("autofocus", "autofocus");

							if(form_mode == "insert")
							{
								if(field_default == "true" || field_default == "1") input_element->Attr->Add("checked");
							}

							if(form_mode == "update")
							{
								input_element->Attr->Add("{{itemIsChecked " + query_name + "." + field_name + " true}}");
							}

							focusable_count++;
						}
						items_container_node->InsertChild(item_source_node, items_container_node->IndexOfChild(item_dest_node));
					}
					else
					{
						for(int x = 0; x < input_items_count; x++)
						{
							CWNode* item_source_node = new CWNode();
							item_source_node->CopyFrom(item_tmp_node);
							item_source_node->Attr->Delete(item_source_node->Attr->FindName("id"));

							CWInputItem* field_item = field->InputItems->Items[x];
							string item_title = field_item->Title;
							string item_value = field_item->Value;

							item_source_node->Replace("ITEM_TITLE", item_title, true, true);
							item_source_node->Replace("ITEM_VALUE", item_value, true, true);

							// find input element
							CWNode* input_element = item_source_node->FindChildByName("input", true, true);
							if(input_element != NULL)
							{
								if(field_type != "") input_element->Attr->SetValue("data-type", field_type);
								if(autofocus && focusable_count == 0) input_element->Attr->SetValue("autofocus", "autofocus");

								if(form_mode == "update")
								{
									input_element->Attr->Add("{{itemIsChecked " + query_name + "." + field_name + " \"" + item_value + "\"}}");
								}

								focusable_count++;
							}
							items_container_node->InsertChild(item_source_node, items_container_node->IndexOfChild(item_dest_node));
						}
					}
					field_source_node->DeleteChild(item_dest_node, true);
				}


				if(field_input == "select" || field_input == "select-multiple")
				{
					CWNode* item_tmp_node = pRawTemplate->FindChild("#form-input-" + field_input + "-item", true, true);
					if(item_tmp_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item source element \"#form-input-" + field_input + "-item\" not found.";
						return false;
					}

					// find input element
					CWNode* input_node = field_source_node->FindChild("select", true, true);
					if(input_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field input element \"select\" not found.";
						return false;
					}

					if(field_type != "") input_node->Attr->SetValue("data-type", field_type);
					if(field_required) input_node->Attr->SetValue("required", "required");
					if(autofocus && focusable_count == 0) input_node->Attr->SetValue("autofocus", "autofocus");
					focusable_count++;

					int input_items_count = field->InputItems->Count();
					for(int x = 0; x < input_items_count; x++)
					{
						CWNode* item_source_node = new CWNode();
						item_source_node->CopyFrom(item_tmp_node);
						item_source_node->Attr->Delete(item_source_node->Attr->FindName("id"));

						CWInputItem* field_item = field->InputItems->Items[x];
						string item_title = field_item->Title;
						string item_value = field_item->Value;

						if(form_mode == "insert")
						{
							if(field_default != "")
							{
								if(item_value == field_default || (field_input == "select-multiple" && field_default == "SELECT_ALL")) item_source_node->Attr->Add("selected");
							}
							else
							{
								if(x == 0) item_source_node->Attr->Add("selected");
							}
						}

						if(form_mode == "update")
						{
							if(field_input == "select-multiple" && field_default == "SELECT_ALL")
								item_source_node->Attr->Add("selected");
							else
							{
								if(query_name == "")
									item_source_node->Attr->Add("{{optionIsSelected " + field_name + " \"" + item_value + "\"}}");
								else
									item_source_node->Attr->Add("{{optionIsSelected " + query_name + "." + field_name + " \"" + item_value + "\"}}");
							}
						}

						item_source_node->Replace("ITEM_TITLE", item_title, true, true);
						item_source_node->Replace("ITEM_VALUE", item_value, true, true);

						input_node->AddChild(item_source_node);
					}

					string lookup_query_name = field->GetLookupQueryName();
					if(lookup_query_name != "")
					{
						CWNode* item_source_node = new CWNode();
						item_source_node->CopyFrom(item_tmp_node);
						item_source_node->Attr->Delete(item_source_node->Attr->FindName("id"));

						string item_value = "{{" + field->LookupKey + "}}";
						string item_title = "{{" + field->LookupField + "}}";

						if(form_mode == "update")
						{
							if(field_input == "select-multiple" && field_default == "SELECT_ALL")
								item_source_node->Attr->Add("selected");
							else
							{
								if(query_name == "")
									item_source_node->Attr->Add("{{optionIsSelected ../" + field_name + " " + field->LookupKey + "}}");
								else
									item_source_node->Attr->Add("{{optionIsSelected ../" + query_name + "." + field_name + " " + field->LookupKey + "}}");
							}
						}

						item_source_node->Replace("ITEM_TITLE", item_title, true, true);
						item_source_node->Replace("ITEM_VALUE", item_value, true, true);

						input_node->AddChild(item_source_node, "{{#each " + lookup_query_name + "}}", "{{/each}}");
					}
				}

				if(field_input == "tags")
				{
					CWNode* item_tmp_node = pRawTemplate->FindChild("#form-input-" + field_input + "-item", true, true);
					if(item_tmp_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item source element \"#form-input-" + field_input + "-item\" not found.";
						return false;
					}

					// find input element
					CWNode* input_node = field_source_node->FindChild("select", true, true);
					if(input_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field input element \"select\" not found.";
						return false;
					}

					if(field_type != "") input_node->Attr->SetValue("data-type", field_type);
					if(field_required) input_node->Attr->SetValue("required", "required");
					if(autofocus && focusable_count == 0) input_node->Attr->SetValue("autofocus", "autofocus");
					focusable_count++;

					ReplaceSubString(&field_value, "{{", "");
					ReplaceSubString(&field_value, "}}", "");

					if(form_mode == "insert" || field_value == "") field_value = "\"" + field_value + "\"";
				}

				if(field_input == "file")
				{
                    // input change event
					string file_event_source_js = AddSuffixToFileName(ChangeFileExt(TemplateFile(), ".js"), "_file_event");
					string file_event_js = "";
					if(!FileLoadString(file_event_source_js, &file_event_js, 0, pErrorMessage))
					{
						if(pErrorMessage) *pErrorMessage = "Error reading file \"" + file_event_source_js + "\". " + *pErrorMessage;
						return false;
					}

					CWCollection* file_collection = App()->GetCollection(field->FileCollection);
					if(file_collection != NULL) {
						ReplaceSubString(&file_event_js, "FILE_COLLECTION_INSERT_METHOD", file_collection->InsertMethodName());
						ReplaceSubString(&file_event_js, "FILE_COLLECTION", file_collection->Variable());
					}
					else
					{
						if(field->FileCollection == "")
							App()->Warning("In form \"" + Name + "\", field \"" + field->Name + "\" doesn't have \"file_collection\" specified.");
						else
							App()->Warning("In form \"" + Name + "\", field \"" + field->Name + "\", \"file_collection\": \"" + field->FileCollection + "\" is specified but that file collection is not found.");
					}

					ReplaceSubString(&file_event_js, "FIELD_ID", field_id);

					if(AddEvents != "") AddEvents = EnsureLastChar(AddEvents, ',') + LINE_TERM;
					AddEvents.append(file_event_js);
				}

				if(field_input == "crud")
				{
					if(field_type != "array")
					{
						if(pErrorMessage) *pErrorMessage = "Field input of type \"crud\" is currently allowed only for fields of data type \"array\".";
						return false;
					}

					string field_crud_items_helper = ToCamelCase(ReplaceSubString(field_name, ".", "_"), '_', false) + "CrudItems";

					string init_crud_items_code = "";
					if(form_mode == "insert")
						init_crud_items_code = "pageSession.set(\"" + field_crud_items_helper + "\", []);\n";
					else
						init_crud_items_code = "pageSession.set(\"" + field_crud_items_helper + "\", this.data." + query_name + "." + field_name + " || []);\n";
					InsertAfterSubString(pJS, "/*TEMPLATE_RENDERED_CODE*/", init_crud_items_code);

					if(AddHelpers != "") AddHelpers = EnsureLastChar(AddHelpers, ',') + LINE_TERM;
					AddHelpers.append("\t\"" + field_crud_items_helper + "\": function() {" + LINE_TERM);
					AddHelpers.append("\t\treturn pageSession.get(\"" + field_crud_items_helper + "\");\n");
					AddHelpers.append("\t}");

					if(array_item_type == "")
					{
						if(pErrorMessage) *pErrorMessage = "Please set \"array_item_type\" property for field \"" + field_name + "\".";
						return false;
					}

					if(array_item_type != "object")
					{
						if(pErrorMessage) *pErrorMessage = "\"crud\" input in form is currently implemented only for \"array_item_type\": \"object\". Sorry :)";
						return false;
					}

					if(array_item_type == "object")
					{
						int crud_field_count = field->CrudFields->Count();
						CWNode* crud_head_node = field_source_node->FindChild(".crud-table-header", true, true);
						if(crud_head_node != NULL)
						{
							for(int z = 0; z < crud_field_count; z++)
							{
								CWField* crud_field = field->CrudFields->Items[z];
								if(crud_field->ShowInDataview)
								{
									string crud_field_title = crud_field->Title;
									if(crud_field_title == "") crud_field_title = crud_field->Name;
									crud_head_node->AddChild("th", crud_field_title);
								}
							}

							if(form_mode != "read_only") crud_head_node->AddChild("th", "&nbsp;");
						}

						CWNode* crud_row_node = field_source_node->FindChild(".crud-table-row", true, true);
						if(crud_row_node != NULL)
						{
							for(int z = 0; z < crud_field_count; z++)
							{
								CWField* crud_field = field->CrudFields->Items[z];
								if(crud_field->ShowInDataview)
								{
									string crud_field_name = crud_field->Name;
									string crud_field_type = crud_field->Type;
									string crud_field_format = crud_field->Format;
									string crud_display_helper = crud_field->DisplayHelper;

									string crud_field_value = "{{" + crud_field_name + "}}";
									if(crud_field_type == "bool") crud_field_value = "{{booleanToYesNo " + crud_field_name + "}}";
									if(crud_field_type == "file") crud_field_value = "{{" + crud_field_name + ".url}}";
									if(crud_field_type == "time") crud_field_value = "{{secondsToTime " + crud_field_name + " \'" + crud_field_format + "\'}}";
									if(crud_field_type == "date") crud_field_value = "{{formatDate " + crud_field_name + " \'" + crud_field_format + "\'}}";
									if(crud_display_helper != "") crud_field_value = "{{" + crud_display_helper + " " + crud_field_name + "}}";

									crud_row_node->AddChild("td", crud_field_value);
								}
							}

							// crud delete icon
							if(form_mode != "read_only")
							{
								CWNode* crud_delete_cell_node = crud_row_node->AddChild("td");
								crud_delete_cell_node->AddClass("td-icon delete-icon");
								CWNode* crud_delete_icon_node = crud_delete_cell_node->AddChild("span");
								crud_delete_icon_node->AddClass("fa fa-trash-o");
								crud_delete_icon_node->Attr->SetValue("title", "Delete");

								if(AddEvents != "") AddEvents = EnsureLastChar(AddEvents, ',') + LINE_TERM;
								AddEvents.append("'click ." + field_id + " .crud-table-row .delete-icon': function(e, t) { e.preventDefault(); var self = this; bootbox.dialog({ message: 'Delete? Are you sure?', title: 'Delete', animate: false, buttons: { success: { label: 'Yes', className: 'btn-success', callback: function() { var items = pageSession.get('" + field_crud_items_helper + "'); var index = -1; _.find(items, function(item, i) { if(item._id == self._id) { index = i; return true; }; }); if(index >= 0) items.splice(index, 1); pageSession.set('" + field_crud_items_helper + "', items); } }, danger: { label: 'No', className: 'btn-default' } } }); return false; }");
							}
						}

						string crud_insert_form_container_id = field_id + "-insert-form";
						string crud_insert_form_container_name = ReplaceSubString(crud_insert_form_container_id, "-", "_");
						CWNode* crud_insert_form_container_node = field_source_node->FindChild(".crud-insert-form-container", true, true);
						if(crud_insert_form_container_node != NULL)
						{
							if(form_mode == "read_only")
								field_source_node->DeleteChild(crud_insert_form_container_node, true);
							else
							{
								field_source_node->DetachChild(crud_insert_form_container_node, true);
								crud_insert_form_container_node->Attr->SetValue("id", crud_insert_form_container_id);

								CWCustomComponent* crud_form_container_component = new CWCustomComponent(ParentPage(true));
								crud_form_container_component->Name = crud_insert_form_container_name + "_container";
								crud_form_container_component->Type = "custom_component";
								crud_form_container_component->HTML = crud_insert_form_container_node->GetHTML(false);

								CWForm* crud_insert_form = new CWForm(crud_form_container_component);
								crud_insert_form->Name = crud_insert_form_container_name;
								crud_insert_form->Type = "form";
								crud_insert_form->Title = crud_insert_form_title;
								crud_insert_form->Mode = "insert";
								crud_insert_form->ExternalFields = field->CrudFields;
								crud_insert_form->DestSelector = ".modal-body";
								crud_insert_form->SubmitCode = "var data = pageSession.get(\"" + field_crud_items_helper + "\") || []; values._id = Random.id(); data.push(values); pageSession.set(\"" + field_crud_items_helper + "\", data); $(\"#" + crud_insert_form_container_id + "\").modal(\"hide\"); e.currentTarget.reset();";
								crud_insert_form->CancelCode = "$(\"#" + crud_insert_form_container_id + "\").modal(\"hide\"); t.find(\"form\").reset();";

								crud_form_container_component->Components->Add(crud_insert_form);
								ParentPage(true)->Components->Add(crud_form_container_component);

								if(SubmitCode != "") SubmitCode.append(LINE_TERM);
								SubmitCode.append("values." + field_name + " = pageSession.get(\"" + field_crud_items_helper + "\");");

								field_source_node->Replace("CRUD_INSERT_FORM_CONTAINER_ID", crud_insert_form_container_id, true, true);
							}
						}

						CWNode* crud_table_controls_node = field_source_node->FindChild(".crud-table-controls", true, true);
						if(crud_table_controls_node != NULL)
						{
                            if(form_mode == "read_only") field_source_node->DeleteChild(crud_table_controls_node, true);
						}
						field_source_node->Replace("CRUD_INSERT_BUTTON_TITLE", crud_insert_button_title, true, true);
						field_source_node->Replace("CRUD_FIELD_COUNT", IntToStr(crud_field_count), true, true);
					}
					field_source_node->Replace("FIELD_CRUD_ITEMS", field_crud_items_helper, true, true);
				}

				string field_value_raw = field_value;
				field_value_raw = ReplaceSubString(field_value_raw, "{{", "");
				field_value_raw = ReplaceSubString(field_value_raw, "}}", "");
				field_value_raw = Trim(field_value_raw);
				if(FindSubString(&field_value_raw, " ") < 0)
				{
					if(form_mode == "insert") field_value_raw = "\'" + field_value_raw + "\'";
				}
				else
				{
					field_value_raw = "(" + field_value_raw + ")";
				}

				field_source_node->Replace("FIELD_ID", field_id, true, true);
				field_source_node->Replace("FIELD_NAME", field_name, true, true);
				field_source_node->Replace("FIELD_TITLE", field_title, true, true);
				field_source_node->Replace("FIELD_VALUE_RAW", field_value_raw, true, true);
				field_source_node->Replace("FIELD_VALUE", field_value, true, true);
				field_source_node->Replace("FIELD_FORMAT", field_format, true, true);
				field_source_node->Replace("FIELD_GROUP_CLASS", field_input_group_class, true, true);
				field_source_node->Replace("FIELD_CONTROL_CLASS", field_input_control_class, true, true);

				if(form_layout == "horizontal")
				{
					CWNode* input_div_node = field_source_node->FindChildByClass("input-div", true, true);
					if(input_div_node != NULL)
					{
						input_div_node->AddClass("col-sm-9");
						CWNode* label_node = field_source_node->FindChildByName("label", true, true);
						if(label_node != NULL)
						{
							label_node->AddClass("col-sm-3");
							label_node->AddClass("control-label");
						}
						else
							input_div_node->AddClass("col-sm-offset-3");
					}
				}

				form_node->AddChild(field_source_node);
			}
		}
	}

	// ---
	// submit
	// ---
	string submit_tmp_node_id = "#form-input-submit";
	CWNode* submit_tmp_node = pRawTemplate->FindChild(submit_tmp_node_id, true, true);
	if(submit_tmp_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Field source element \"" + submit_tmp_node_id + "\" not found.";
		return false;
	}

	CWNode* submit_source_node = new CWNode();
	submit_source_node->CopyFrom(submit_tmp_node);
	submit_source_node->Attr->Delete(submit_source_node->Attr->FindName("id"));

	string submit_link = "{{pathFor \'" + SubmitRoute + "\'}}";
	string cancel_link = "{{pathFor \'" + CancelRoute + "\'}}";
	string close_link = "{{pathFor \'" + CloseRoute + "\'}}";
	string back_link = "{{pathFor \'" + BackRoute + "\'}}";

	submit_source_node->Replace("SUBMIT_LINK", submit_link, true, true);
	submit_source_node->Replace("CANCEL_LINK", cancel_link, true, true);
	submit_source_node->Replace("CLOSE_LINK", close_link, true, true);
	submit_source_node->Replace("BACK_LINK", back_link, true, true);

	CWNode* submit_button = submit_source_node->FindChild("#form-submit-button", true, true);
	if(submit_button && ((SubmitRoute == "" && SubmitCode == "") || form_mode == "read_only")) submit_source_node->DeleteChild(submit_button, true);

	CWNode* cancel_button = submit_source_node->FindChild("#form-cancel-button", true, true);
	if(cancel_button && ((CancelRoute == "" && CancelCode == "") || form_mode == "read_only")) submit_source_node->DeleteChild(cancel_button, true);

	CWNode* close_button = submit_source_node->FindChild("#form-close-button", true, true);
	if(close_button && (CloseRoute == "" || form_mode != "read_only" || (parent_page && parent_page->RedirectToSubpage() != NULL))) submit_source_node->DeleteChild(close_button, true);

	CWNode* back_button = pHTML->FindChild("#form-back-button", true, true);
	if(back_button && (BackRoute == "" || form_mode != "read_only")) pHTML->DeleteChild(back_button, true);

	if(form_layout == "horizontal")
	{
		CWNode* submit_div_node = submit_source_node->FindChildByClass("submit-div", true, true);
		if(submit_div_node != NULL)
		{
			submit_div_node->AddClass("col-sm-9");
			submit_div_node->AddClass("col-sm-offset-3");
		}
	}

	form_node->AddChild(submit_source_node);

	string submit_button_title = SubmitButtonTitle;
	string cancel_button_title = CancelButtonTitle;
	string close_button_title = CloseButtonTitle;
	if(submit_button_title == "") submit_button_title = "Save";
	if(cancel_button_title == "") cancel_button_title = "Cancel";
	if(close_button_title == "") close_button_title = "OK";

	form_node->Replace("SUBMIT_BUTTON_TITLE", submit_button_title, true, true);
	form_node->Replace("CANCEL_BUTTON_TITLE", cancel_button_title, true, true);
	form_node->Replace("CLOSE_BUTTON_TITLE", close_button_title, true, true);

	if(form_layout == "horizontal") form_node->AddClass("form-horizontal");
	if(form_layout == "inline") form_node->AddClass("form-inline");

	// ---
	// create js
	// ---
	string hidden_fields = "";
	int hidden_fields_count = HiddenFields->Count();
	for(int i = 0; i < hidden_fields_count; i++)
	{
		CWHiddenField* hidden_field = HiddenFields->Items[i];
		if(i > 0) {
			hidden_fields.append(LINE_TERM);
			hidden_fields.append("\t\t\t\t");
		}
		hidden_fields.append("values." + hidden_field->Name + " = " + ReplaceSubString(hidden_field->Value, "this.", "self.") + ";");
	}
	ReplaceSubString(pJS, "/*HIDDEN_FIELDS*/", hidden_fields);


	string submit_code = SubmitCode;
	if(form_mode == "insert")
	{
		if(main_query != NULL)
		{
			if(main_query->Collection == "users")
			{
				if(submit_code != "") submit_code.append(" ");
				submit_code.append("Meteor.call(\"createUserAccount\", values, function(e, r) { if(e) errorAction(e); else submitAction(r); });");
			}
			else
			{
				if(submit_code != "") submit_code.append(" ");
				submit_code.append("Meteor.call(\"INSERT_METHOD_NAME\", values, function(e, r) { if(e) errorAction(e); else submitAction(r); });");
			}
		}
	}

	if(form_mode == "update")
	{
		if(main_query != NULL)
		{
			if(main_query->Collection == "users")
			{
				if(submit_code != "") submit_code.append(" ");
				submit_code.append("Meteor.call(\"updateUserAccount\", t.data.QUERY_NAME._id, values, function(e, r) { if(e) errorAction(e); else submitAction(r); });");
			}
			else
			{
				if(submit_code != "") submit_code.append(" ");
				submit_code.append("Meteor.call(\"UPDATE_METHOD_NAME\", t.data.QUERY_NAME._id, values, function(e, r) { if(e) errorAction(e); else submitAction(r); });");
			}
		}
	}

	string cancel_code = CancelCode;

	ReplaceSubString(pJS, "/*SUBMIT_CODE*/", submit_code);
	ReplaceSubString(pJS, "/*CANCEL_CODE*/", cancel_code);

	ReplaceSubString(pJS, "FORM_MODE_VAR", form_mode_var);
	ReplaceSubString(pJS, "FORM_MODE", form_mode);

	ReplaceSubString(pJS, "INFO_MESSAGE_VAR", info_message_var);
	ReplaceSubString(pJS, "ERROR_MESSAGE_VAR", error_message_var);

	if(SubmitRoute != "") ReplaceSubString(pJS, "/*SUBMIT_REDIRECT*/", "Router.go(\"SUBMIT_ROUTE\", mergeObjects(Router.currentRouteParams(), {/*SUBMIT_ROUTE_PARAMS*/}));");
	if(CancelRoute != "") ReplaceSubString(pJS, "/*CANCEL_REDIRECT*/", "Router.go(\"CANCEL_ROUTE\", mergeObjects(Router.currentRouteParams(), {/*CANCEL_ROUTE_PARAMS*/}));");
	if(CloseRoute != "") ReplaceSubString(pJS, "/*CLOSE_REDIRECT*/", "Router.go(\"CLOSE_ROUTE\", mergeObjects(Router.currentRouteParams(), {/*CLOSE_ROUTE_PARAMS*/}));");
	if(BackRoute != "") ReplaceSubString(pJS, "/*BACK_REDIRECT*/", "Router.go(\"BACK_ROUTE\", mergeObjects(Router.currentRouteParams(), {/*BACK_ROUTE_PARAMS*/}));");

	ReplaceSubString(pJS, "/*SUBMIT_ROUTE_PARAMS*/", ReplaceSubString(SubmitRouteParams->AsString(), "this.", "self."));
	ReplaceSubString(pJS, "/*CANCEL_ROUTE_PARAMS*/", CancelRouteParams->AsString());
	ReplaceSubString(pJS, "/*CLOSE_ROUTE_PARAMS*/", CloseRouteParams->AsString());
	ReplaceSubString(pJS, "/*BACK_ROUTE_PARAMS*/", BackRouteParams->AsString());

	ReplaceSubString(pJS, "SUBMIT_ROUTE", SubmitRoute);
	ReplaceSubString(pJS, "CANCEL_ROUTE", CancelRoute);
	ReplaceSubString(pJS, "CLOSE_ROUTE", CloseRoute);
	ReplaceSubString(pJS, "BACK_ROUTE", BackRoute);
	// ---

	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	return true;
}


bool CWForm::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	CWPage* parent_page = ParentPage(false);

	string form_node_name = "form";
	CWNode* form_node = pHTML->FindChild(form_node_name, true, true);
	if(form_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Form fields destination node \"" + form_node_name + "\" not found.";
		return false;
	}

	CWCollection* collection = NULL;
	CWQuery* main_query = GetMainQuery();
	string query_name = GetQueryName();

	if(main_query != NULL)
	{
		collection = GetCollection();
		if(collection == NULL && main_query->Collection != "users")
		{
			if(pErrorMessage) *pErrorMessage = "Collection \"" + main_query->Collection + "\" not found.";
			return false;
		}
	}

	string form_mode = Mode;
	if(form_mode == "edit") form_mode = "update";
	if(form_mode != "insert" && form_mode != "update" && form_mode != "read_only")
	{
		if(pErrorMessage) *pErrorMessage = "Form \"mode\" should be one of: \"insert\", \"update\" or \"read_only\".";
		return false;
	}
	
	bool autofocus = Autofocus;

	string form_mode_var = ToCamelCase(TemplateName() + "_mode", '_', false);

	string info_message_var = ToCamelCase(TemplateName() + "_info_message", '_', false);
	string error_message_var = ToCamelCase(TemplateName() + "_error_message", '_', false);

	string form_layout = Layout;
	if(form_layout == "") form_layout = "default";
	if(form_layout != "default" && form_layout != "horizontal" && form_layout != "inline")
	{
		if(pErrorMessage) *pErrorMessage = "Form \"layout\" should be one of: \"default\", \"horizontal\" or \"inline\" (or just leave it empty).";
		return false;
	}

	// load controls template
	CWNode controls_template;
	string html_controls_template_file = ChangeFileExt(AddSuffixToFileName(TemplateFile(), "_controls"), ".jsx");
	if(!LoadJSX(html_controls_template_file, &controls_template, pErrorMessage))
		return false;

	CWArray<CWField*> *form_fields = GetFields();

	// create fields
	int field_count = form_fields->Count();
	int focusable_count = 0;
	for(int i = 0; i < field_count; i++)
	{
		CWField* field = form_fields->Items[i];
		if(field != NULL)
		{
			string field_name = field->Name;
			string field_title = field->Title;
			string field_input = field->Input;
			string field_input_template = field->InputTemplate;
			string field_input_template_code = field->InputTemplateCode;
			string field_input_group_class = field->InputGroupClass;
			string field_input_control_class = field->InputControlClass;
			if(field_input == "") field_input = "text";
			string field_default = field->Default;
			string field_min = field->Min;
			string field_max = field->Max;
			string field_value = field->Default;
			bool field_required = field->Required;
			string field_type = field->Type;
			string field_format = field->Format;
			string field_id = ReplaceSubString(ReplaceSubString("field-" + FromCamelCase(field_name, '-', true), ".", "-"), "--", "-");
			string display_helper = field->DisplayHelper;
			string array_item_type = field->ArrayItemType;
			string crud_insert_title = field->CrudInsertTitle;
			string crud_insert_form_title = crud_insert_title;
			string crud_insert_button_title = crud_insert_title;
			if(crud_insert_form_title == "") crud_insert_form_title = "Insert";
			if(crud_insert_button_title == "") crud_insert_button_title = "Add";

			if(form_mode == "read_only")
			{
				if(field_input != "crud")
				{
					if(field_type == "file")
						field_input = "link";
					else
						field_input = "read-only";
				}
			}

			string dot_query_name = query_name;
			if(dot_query_name != "") dot_query_name = "." + dot_query_name;

			if(form_mode == "update" || form_mode == "read_only")
			{
				field_value = "{this.props.data" + dot_query_name + "." + field_name + "}";

				if(field_type == "file") field_value = "{this.props.data" + dot_query_name + "." + field_name + ".url}";
				if(field_type == "time") field_value = "{dateUtils.secondsToTime(this.props.data" + dot_query_name + "." + field_name + ", \'" + field_format + "\')}";
				if(field_type == "date") field_value = "{dateUtils.formatDate(this.props.data" + dot_query_name + "." + field_name + ", \'" + field_format + "\')}";
				if(display_helper != "") field_value = "{" + display_helper + "(this.props.data" + dot_query_name + "." + field_name + ", this.props.data" + dot_query_name + ")}";
			}

			if(form_mode == "read_only") {
				if(field_type == "bool") field_value = "{this.props.data" + dot_query_name + "." + field_name + " ? \"Yes\" : \"No\"}";
			}

			if(form_mode == "insert")
			{
				if(field_default != "")
				{
					if(field_type == "random_string") field_value = "{stringUtils.randomString(" + field_default + ")}";
					if(field_type == "time") field_value = "{dateUtils.secondsToTime(\'" + field_default + "\', \'" + field_format + "\')}";
					if(field_type == "date") field_value = "{dateUtils.formatDate(\'" + field_default + "\', \'" + field_format + "\')}";
					if(display_helper != "") field_value = "{" + display_helper + "(" + field_default + ")}";
				}
			}

			bool show_field = true;
			if(field_input == "none") show_field = false;
			if(form_mode == "insert" && !field->ShowInInsertForm) show_field = false;
			if(form_mode == "update" && !field->ShowInUpdateForm) show_field = false;
			if(form_mode == "read_only" && !field->ShowInReadOnlyForm) show_field = false;

			if(show_field)
			{
				CWNode* field_tmp_node = NULL;
				if(field_input == "custom")
				{
					if(field_input_template == "" && field_input_template_code == "")
					{
						if(pErrorMessage != NULL) *pErrorMessage = "Error creating form field \"" + field_name + "\": you must specify either \"input_template\" or \"input_template_code\" for \"custom\" input fields.";
						return false;
					}

					field_tmp_node = new CWNode();
					if(field_input_template != "") {
						string custom_input_template = "";
						if(App()->InputFileIsInTempDir) {
							custom_input_template = GetFullPath(ChangeFileExt(field_input_template, ".jsx"));
							if(custom_input_template == "") {
								custom_input_template = GetFullPath(AddDirSeparator(App()->CWD) + ChangeFileExt(field_input_template, ".jsx"));
							}
							if(custom_input_template == "") {
								custom_input_template = ChangeFileExt(field_input_template, ".jsx");
							}
						} else {
							custom_input_template = App()->InputDir + ChangeFileExt(field_input_template, ".jsx");
						}


						field_tmp_node = new CWNode();
						if(!LoadJSX(custom_input_template, field_tmp_node, pErrorMessage))
						{
							if(pErrorMessage != NULL) *pErrorMessage = "Error loading form input template file \"" + custom_input_template + "\". " + *pErrorMessage;
							return false;
						}
					}
						
					if(field_input_template_code != "") {
						// append template code to field_tmp_node (in case both input_template and input_template_code is specified).
						if(!field_tmp_node->ParseJSX(field_tmp_node->GetJSX(false) + "\n" + field_input_template_code, pErrorMessage)) {
							if(pErrorMessage != NULL) *pErrorMessage = "Error parsing form input template. " + *pErrorMessage;
							return false;
						}
					}
				}
				else
					field_tmp_node = controls_template.FindChild("#form-input-" + field_input, true, true);

				if(field_tmp_node == NULL)
				{
					if(pErrorMessage) *pErrorMessage = "Field source element \"#form-input-" + field_input + "\" not found.";
					return false;
				}

				CWNode* field_source_node = new CWNode();
				field_source_node->CopyFrom(field_tmp_node);
				field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

				if(field_input == "text")
				{
					// find input element
					CWNode* input_element = field_source_node->FindChildByName("input", true, true);

					if(input_element)
					{
						if(autofocus && focusable_count == 0) input_element->Attr->SetValue("autoFocus", "autoFocus");
						if(field_required) input_element->Attr->SetValue("required", "required");
						if(field_type != "") input_element->Attr->SetValue("data-type", field_type);
						if(field_format != "") input_element->Attr->SetValue("data-format", field_format);
						if(field_min != "") input_element->Attr->SetValue("data-min", field_min);
						if(field_max != "") input_element->Attr->SetValue("data-max", field_max);
					}

					focusable_count++;
				}

				if(field_input == "datepicker")
				{
					// find input element
					CWNode* input_element = field_source_node->FindChildByName("input", true, true);

					if(input_element)
					{
						if(autofocus && focusable_count == 0) input_element->Attr->SetValue("autoFocus", "autoFocus");
						if(field_required) input_element->Attr->SetValue("required", "required");
						if(field_type != "") input_element->Attr->SetValue("data-type", field_type);
						if(field_format != "") input_element->Attr->SetValue("data-format", field_format);
						if(field_min != "") input_element->Attr->SetValue("data-min", field_min);
						if(field_max != "") input_element->Attr->SetValue("data-max", field_max);
					}

					focusable_count++;
				}

				if(field_input == "radio")
				{
					CWNode* item_tmp_node = controls_template.FindChild("#form-input-" + field_input + "-item", true, true);
					if(item_tmp_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item source element \"#form-input-" + field_input + "-item\" not found.";
						return false;
					}

					CWNode* item_dest_node = field_source_node->FindChild("#form-input-" + field_input + "-items", true, true);
					if(item_dest_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item destination element \"#form-input-" + field_input + "-items\" not found.";
						return false;
					}

					CWNode* items_container_node = field_source_node->FindParentOfChild(item_dest_node);
					if(items_container_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item destination element \"#form-input-" + field_input + "-items\" not found.";
						return false;
					}

					int input_items_count = field->InputItems->Count();
					for(int x = 0; x < input_items_count; x++)
					{
						CWNode* item_source_node = new CWNode();
						item_source_node->CopyFrom(item_tmp_node);
						item_source_node->Attr->Delete(item_source_node->Attr->FindName("id"));

						CWInputItem* field_item = field->InputItems->Items[x];
						string item_title = field_item->Title;
						string item_value = field_item->Value;

						item_source_node->Replace("ITEM_TITLE", item_title, true, true);
						item_source_node->Replace("ITEM_VALUE", item_value, true, true);

						// find input element
						CWNode* input_element = item_source_node->FindChildByName("input", true, true);
						if(input_element != NULL)
						{
							if(field_type != "") input_element->Attr->SetValue("data-type", field_type);
							if(autofocus && focusable_count == 0) input_element->Attr->SetValue("autoFocus", "autoFocus");

							if(form_mode == "insert")
							{
								if(field_default != "")
								{
									if(item_value == field_default) input_element->Attr->Add("defaultChecked");
								}
								else
								{
									if(x == 0) input_element->Attr->Add("defaultChecked");
								}
							}

							if(form_mode == "update")
							{
								if(field_type == "integer" || field_type == "bool")
									input_element->Attr->Add("defaultChecked={formUtils.itemIsChecked(this.props.data." + query_name + "." + field_name + ", " + item_value + ")}");
								else
									input_element->Attr->Add("defaultChecked={formUtils.itemIsChecked(this.props.data." + query_name + "." + field_name + ", \"" + item_value + "\")}");
							}

							focusable_count++;
						}
						items_container_node->InsertChild(item_source_node, items_container_node->IndexOfChild(item_dest_node));
					}
					field_source_node->DeleteChild(item_dest_node, true);
				}

				if(field_input == "checkbox")
				{
					CWNode* item_tmp_node = controls_template.FindChild("#form-input-" + field_input + "-item", true, true);
					if(item_tmp_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item source element \"#form-input-" + field_input + "-item\" not found.";
						return false;
					}

					CWNode* item_dest_node = field_source_node->FindChild("#form-input-" + field_input + "-items", true, true);
					if(item_dest_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item destination element \"#form-input-" + field_input + "-items\" not found.";
						return false;
					}

					CWNode* items_container_node = field_source_node->FindParentOfChild(item_dest_node);
					if(items_container_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item destination element \"#form-input-" + field_input + "-items\" not found.";
						return false;
					}

					if(field_required) items_container_node->Attr->SetValue("data-required", "true");

					int input_items_count = field->InputItems->Count();
					if(input_items_count == 0)
					{
						CWNode* item_source_node = new CWNode();
						item_source_node->CopyFrom(item_tmp_node);
						item_source_node->Attr->Delete(item_source_node->Attr->FindName("id"));

						// remove label
						CWNode* label_node = field_source_node->FindChildByName("label", true, true);
						if(label_node != NULL)
						{
							if(form_layout == "horizontal")
								label_node->Replace("FIELD_TITLE", "&nbsp;", true, true);
							else
								field_source_node->DeleteChild(label_node, true);
						}

						string item_title = field_title;
						string item_value = field_value;

						item_source_node->Replace("ITEM_TITLE", item_title, true, true);
						item_source_node->Replace("ITEM_VALUE", item_value, true, true);

						// find input element
						CWNode* input_element = item_source_node->FindChildByName("input", true, true);
						if(input_element != NULL)
						{
							if(field_type != "") input_element->Attr->SetValue("data-type", field_type);
							if(autofocus && focusable_count == 0) input_element->Attr->SetValue("autoFocus", "autoFocus");

							if(form_mode == "insert")
							{
								if(field_default == "true" || field_default == "1") input_element->Attr->Add("defaultChecked");
							}

							if(form_mode == "update")
							{
								input_element->Attr->Add("defaultChecked={formUtils.itemIsChecked(this.props.data." + query_name + "." + field_name + ", true)}");
							}

							focusable_count++;
						}
						items_container_node->InsertChild(item_source_node, items_container_node->IndexOfChild(item_dest_node));
					}
					else
					{
						for(int x = 0; x < input_items_count; x++)
						{
							CWNode* item_source_node = new CWNode();
							item_source_node->CopyFrom(item_tmp_node);
							item_source_node->Attr->Delete(item_source_node->Attr->FindName("id"));

							CWInputItem* field_item = field->InputItems->Items[x];
							string item_title = field_item->Title;
							string item_value = field_item->Value;

							item_source_node->Replace("ITEM_TITLE", item_title, true, true);
							item_source_node->Replace("ITEM_VALUE", item_value, true, true);

							// find input element
							CWNode* input_element = item_source_node->FindChildByName("input", true, true);
							if(input_element != NULL)
							{
								if(field_type != "") input_element->Attr->SetValue("data-type", field_type);
								if(autofocus && focusable_count == 0) input_element->Attr->SetValue("autoFocus", "autoFocus");

								if(form_mode == "update")
								{
									input_element->Attr->Add("defaultChecked={formUtils.itemIsChecked(this.props.data." + query_name + "." + field_name + ", \"" + item_value + "\")}");
								}

								focusable_count++;
							}
							items_container_node->InsertChild(item_source_node, items_container_node->IndexOfChild(item_dest_node));
						}
					}
					field_source_node->DeleteChild(item_dest_node, true);
				}


				if(field_input == "select" || field_input == "select-multiple")
				{
					CWNode* item_tmp_node = controls_template.FindChild("#form-input-" + field_input + "-item", true, true);
					if(item_tmp_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item source element \"#form-input-" + field_input + "-item\" not found.";
						return false;
					}

					// find input element
					CWNode* input_node = field_source_node->FindChild("select", true, true);
					if(input_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field input element \"select\" not found.";
						return false;
					}

					if(field_type != "") input_node->Attr->SetValue("data-type", field_type);
					if(field_required) input_node->Attr->SetValue("required", "required");
					if(autofocus && focusable_count == 0) input_node->Attr->SetValue("autoFocus", "autoFocus");
					focusable_count++;

					int input_items_count = field->InputItems->Count();
					string default_value = "";
					for(int x = 0; x < input_items_count; x++)
					{
						CWNode* item_source_node = new CWNode();
						item_source_node->CopyFrom(item_tmp_node);
						item_source_node->Attr->Delete(item_source_node->Attr->FindName("id"));

						CWInputItem* field_item = field->InputItems->Items[x];
						string item_title = field_item->Title;
						string item_value = field_item->Value;

						if(form_mode == "insert")
						{
							if(field_default != "")
							{
								if(item_value == field_default || (field_input == "select-multiple" && field_default == "SELECT_ALL")) {
									if(default_value != "") {
										default_value = default_value + ", ";
									}
									default_value = default_value + "\"" + item_value + "\"";
								}
							}
							else
							{
								if(x == 0) {
									if(default_value != "") {
										default_value = default_value + ", ";
									}
									default_value = default_value + "\"" + item_value + "\"";
								}
							}
						}

						if(form_mode == "update")
						{
							if(field_input == "select-multiple" && field_default == "SELECT_ALL") {
								if(default_value != "") {
									default_value = default_value + ", ";
								}
								default_value = default_value + "\"" + item_value + "\"";
							}
							else
							{
								if(default_value != "") {
									default_value = default_value + ", ";
								}

								if(query_name == "")
									default_value = default_value + field_name;
								else
									default_value = default_value + "this.props.data." + query_name + "." + field_name;
							}
						}

						item_source_node->Replace("ITEM_KEY", "static-" + IntToStr(x), true, true);
						item_source_node->Replace("ITEM_TITLE", item_title, true, true);
						item_source_node->Replace("ITEM_VALUE", item_value, true, true);

						input_node->AddChild(item_source_node);
					}
					
					string lookup_query_name = field->GetLookupQueryName();
					if(lookup_query_name != "")
					{
						CWNode* item_source_node = new CWNode();
						item_source_node->CopyFrom(item_tmp_node);
						item_source_node->Attr->Delete(item_source_node->Attr->FindName("id"));

						string item_value = "item." + field->LookupKey;
						string item_title = "item." + field->LookupField;

						if(form_mode == "update")
						{
							if(field_input == "select-multiple" && field_default == "SELECT_ALL") {
								if(default_value != "") {
									default_value = default_value + ", ";
								}
								default_value = default_value + "\"" + item_value + "\"";
							}
							else
							{
								if(default_value != "") {
									default_value = default_value + ", ";
								}

								if(query_name == "")
									default_value = default_value + field_name;
								else
									default_value = default_value + "this.props.data." + query_name + "." + field_name;
							}
						}

						item_source_node->Replace("ITEM_KEY", "{\"dynamic-\" + index}", true, true);
						item_source_node->Replace("ITEM_TITLE", "{" + item_title + "}", true, true);
						item_source_node->Replace("ITEM_VALUE", "{" + item_value + "}", true, true);

						input_node->AddChild(item_source_node, "{this.props.data." + lookup_query_name + ".map(function(item, index) { return(", "); }) }");
					}

					// set default value
					if(default_value != "") {
						if(field_input == "select-multiple") {
							default_value = "[" + default_value + "]";
						}
						input_node->Attr->SetValue("defaultValue", "{" + default_value + "}");						
					}
				}

				if(field_input == "tags")
				{
					CWNode* item_tmp_node = controls_template.FindChild("#form-input-" + field_input + "-item", true, true);
					if(item_tmp_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field item source element \"#form-input-" + field_input + "-item\" not found.";
						return false;
					}

					// find input element
					CWNode* input_node = field_source_node->FindChild("select", true, true);
					if(input_node == NULL)
					{
						if(pErrorMessage) *pErrorMessage = "Field input element \"select\" not found.";
						return false;
					}

					if(field_type != "") input_node->Attr->SetValue("data-type", field_type);
					if(field_required) input_node->Attr->SetValue("required", "required");
					if(autofocus && focusable_count == 0) input_node->Attr->SetValue("autoFocus", "autoFocus");
					focusable_count++;

					ReplaceSubString(&field_value, "{{", "");
					ReplaceSubString(&field_value, "}}", "");

					if(form_mode == "insert" || field_value == "") field_value = "\"" + field_value + "\"";
				}

				if(field_input == "file")
				{
                    // input change event
					string file_event_source_js = AddSuffixToFileName(ChangeFileExt(TemplateFile(), ".js"), "_file_event");
					string file_event_js = "";
					if(!FileLoadString(file_event_source_js, &file_event_js, 0, pErrorMessage))
					{
						if(pErrorMessage) *pErrorMessage = "Error reading file \"" + file_event_source_js + "\". " + *pErrorMessage;
						return false;
					}

					CWCollection* file_collection = App()->GetCollection(field->FileCollection);
					if(file_collection != NULL) {
						ReplaceSubString(&file_event_js, "FILE_COLLECTION", file_collection->Variable());
						InternalImports->AddUnique("import {" + file_collection->Variable() + "} from \"BOTH_COLLECTIONS_DIR/" + file_collection->Name + ".js\";");
					}
					else
					{
						if(field->FileCollection == "")
							App()->Warning("In form \"" + Name + "\", field \"" + field->Name + "\" doesn't have \"file_collection\" specified.");
						else
							App()->Warning("In form \"" + Name + "\", field \"" + field->Name + "\", \"file_collection\": \"" + field->FileCollection + "\" is specified but that file collection is not found.");
					}

					ReplaceSubString(&file_event_js, "FIELD_ID", field_id);

					if(AddEvents != "") AddEvents = AddEvents + LINE_TERM;
					AddEvents.append(file_event_js);
				}

				if(field_input == "crud")
				{
					if(field_type != "array")
					{
						if(pErrorMessage) *pErrorMessage = "Field input of type \"crud\" is currently allowed only for fields of data type \"array\".";
						return false;
					}

					string field_crud_items_helper = ToCamelCase(ReplaceSubString(field_name, ".", "_"), '_', false) + "CrudItems";


					string init_crud_items_code = "";
					init_crud_items_code.append("let self = this;");
					init_crud_items_code.append(LINE_TERM);
					
					if(form_mode == "insert")
						init_crud_items_code.append("\t\tSession.set(\"" + field_crud_items_helper + "\", []);\n");
					else
						init_crud_items_code.append("\t\tSession.set(\"" + field_crud_items_helper + "\", this.props.data." + query_name + "." + field_name + " || []);\n");
/*
					init_crud_items_code.append(LINE_TERM);
					init_crud_items_code.append("\t\tTracker.autorun(function() {\n\t\t\tSession.get(\"" + field_crud_items_helper + "\");\n\t\t\tself.setState({ random: Random.id() });\n\t\t});");
					init_crud_items_code.append(LINE_TERM);
*/

					string tmp = "/*TEMPLATE_RENDERED_CODE*/";
					pHTML->Replace(tmp, tmp + init_crud_items_code, true, true);

					if(array_item_type == "")
					{
						if(pErrorMessage) *pErrorMessage = "Please set \"array_item_type\" property for field \"" + field_name + "\".";
						return false;
					}

					if(array_item_type != "object")
					{
						if(pErrorMessage) *pErrorMessage = "\"crud\" input in form is currently implemented only for \"array_item_type\": \"object\". Sorry :)";
						return false;
					}

					if(array_item_type == "object")
					{
						int crud_field_count = field->CrudFields->Count();
						CWNode* crud_head_node = field_source_node->FindChild(".crud-table-header", true, true);
						if(crud_head_node != NULL)
						{
							for(int z = 0; z < crud_field_count; z++)
							{
								CWField* crud_field = field->CrudFields->Items[z];
								if(crud_field->ShowInDataview)
								{
									string crud_field_title = crud_field->Title;
									if(crud_field_title == "") crud_field_title = crud_field->Name;
									crud_head_node->AddChild("th", crud_field_title);
								}
							}

							if(form_mode != "read_only") crud_head_node->AddChild("th", "&nbsp;");
						}

						CWNode* crud_row_node = field_source_node->FindChild(".crud-table-row", true, true);
						if(crud_row_node != NULL)
						{
							for(int z = 0; z < crud_field_count; z++)
							{
								CWField* crud_field = field->CrudFields->Items[z];
								if(crud_field->ShowInDataview)
								{
									string crud_field_name = crud_field->Name;
									string crud_field_type = crud_field->Type;
									string crud_field_format = crud_field->Format;
									string crud_display_helper = crud_field->DisplayHelper;

									string crud_field_value = "{item." + crud_field_name + "}";
									if(crud_field_type == "bool") crud_field_value = "{item." + crud_field_name + " + \"\"}";
									if(crud_field_type == "file") crud_field_value = "{item." + crud_field_name + ".url}";
									if(crud_field_type == "time") crud_field_value = "{dateUtils.secondsToTime(item." + crud_field_name + ", \'" + crud_field_format + "\')}";
									if(crud_field_type == "date") crud_field_value = "{dateUtils.formatDate(item." + crud_field_name + ", \'" + crud_field_format + "\')}";
									if(crud_display_helper != "") crud_field_value = "{" + crud_display_helper + "(item." + crud_field_name + ")}";

									crud_row_node->AddChild("td", crud_field_value);
								}
							}

							// crud delete icon
							if(form_mode != "read_only")
							{
								CWNode* crud_delete_cell_node = crud_row_node->AddChild("td");
								crud_delete_cell_node->AddClass("td-icon delete-icon");
								CWNode* crud_delete_icon_node = crud_delete_cell_node->AddChild("span");
								crud_delete_icon_node->AddClass("fa fa-trash-o");
								crud_delete_icon_node->Attr->SetValue("title", "Delete");
								crud_delete_icon_node->Attr->SetValue("onClick", "{self.onCrudItemDelete}");
								crud_delete_icon_node->Attr->SetValue("data-id", "{item._id}");

								if(AddEvents != "") AddEvents = AddEvents + LINE_TERM;
								AddEvents.append("onCrudItemDelete(e) {\n\t\te.preventDefault();\n\t\tvar self = this;\n\t\tvar itemId = $(e.currentTarget).attr(\"data-id\");\n\t\tConfirmationDialog({\n\t\t\tmessage: 'Delete? Are you sure?',\n\t\t\ttitle: 'Delete',\n\t\t\tpayload: itemId,\n\t\t\tbuttonYesTitle: 'Yes',\n\t\t\tonYes: function(id) {\n\t\t\t\tvar items = Session.get(\"" + field_crud_items_helper + "\") || [];\n\t\t\t\tvar index = items.findIndex(function(i) {\n\t\t\t\t\treturn i._id == id;\n\t\t\t\t});\n\t\t\t\tif(index >= 0) {\n\t\t\t\t\titems.splice(index, 1);\n\t\t\t\t\tSession.set(\"" + field_crud_items_helper + "\", items);\n\t\t\t\t}\n\t\t\t}\n\t\t});\n\t\treturn false;\n\t}");
							}
						}

						string crud_insert_form_container_id = field_id + "-insert-form";
						string crud_insert_form_container_name = ReplaceSubString(crud_insert_form_container_id, "-", "_");
						CWNode* crud_insert_form_container_node = field_source_node->FindChild(".crud-insert-form-container", true, true);
						if(crud_insert_form_container_node != NULL)
						{
							if(form_mode == "read_only")
								field_source_node->DeleteChild(crud_insert_form_container_node, true);
							else
							{
								field_source_node->DetachChild(crud_insert_form_container_node, true);
								crud_insert_form_container_node->Attr->SetValue("id", crud_insert_form_container_id);

								CWCustomComponent* crud_form_container_component = new CWCustomComponent(ParentPage(true));
								crud_form_container_component->Name = crud_insert_form_container_name + "_container";
								crud_form_container_component->Type = "custom_component";
								crud_form_container_component->JSX = crud_insert_form_container_node->GetHTML(false);

								CWForm* crud_insert_form = new CWForm(crud_form_container_component);
								crud_insert_form->Name = crud_insert_form_container_name;
								crud_insert_form->Type = "form";
								crud_insert_form->Title = crud_insert_form_title;
								crud_insert_form->Mode = "insert";
								crud_insert_form->ExternalFields = field->CrudFields;
								crud_insert_form->DestSelector = ".modal-body";
								crud_insert_form->SubmitCode = "var items = Session.get(\"" + field_crud_items_helper + "\") || []; values._id = Random.id(); items.push(values); Session.set(\"" + field_crud_items_helper + "\", items); $(\"#" + crud_insert_form_container_id + "\").modal(\"hide\"); e.currentTarget.reset();";
								crud_insert_form->CancelCode = "$(\"#" + crud_insert_form_container_id + "\").modal(\"hide\"); $(\"#" + crud_insert_form_container_id + "\").find(\"form\")[0].reset();";

								crud_form_container_component->Components->Add(crud_insert_form);
								ParentPage(true)->Components->Add(crud_form_container_component);

								if(SubmitCode != "") SubmitCode.append(LINE_TERM);
								SubmitCode.append("values." + field_name + " = Session.get(\"" + field_crud_items_helper + "\") || [];");

								field_source_node->Replace("CRUD_INSERT_FORM_CONTAINER_ID", crud_insert_form_container_id, true, true);
							}
						}

						CWNode* crud_table_controls_node = field_source_node->FindChild(".crud-table-controls", true, true);
						if(crud_table_controls_node != NULL)
						{
                            if(form_mode == "read_only") field_source_node->DeleteChild(crud_table_controls_node, true);
						}
						field_source_node->Replace("CRUD_INSERT_BUTTON_TITLE", crud_insert_button_title, true, true);
						field_source_node->Replace("CRUD_FIELD_COUNT", IntToStr(crud_field_count), true, true);
					}
					field_source_node->Replace("FIELD_CRUD_ITEMS", field_crud_items_helper, true, true);
				}


				string field_value_raw = field_value;
				field_value_raw = ReplaceSubString(field_value_raw, "{{", "");
				field_value_raw = ReplaceSubString(field_value_raw, "}}", "");
				field_value_raw = ReplaceSubString(field_value_raw, "{", "");
				field_value_raw = ReplaceSubString(field_value_raw, "}", "");
				field_value_raw = Trim(field_value_raw);
				if(FindSubString(&field_value_raw, " ") < 0)
				{
					if(form_mode == "insert" && field_value_raw == "") field_value_raw = "\'" + field_value_raw + "\'";
				}
				else
				{
					field_value_raw = "(" + field_value_raw + ")";
				}

				field_source_node->Replace("FIELD_ID", field_id, true, true);
				field_source_node->Replace("FIELD_NAME", field_name, true, true);
				field_source_node->Replace("FIELD_TITLE", field_title, true, true);
				field_source_node->Replace("FIELD_VALUE_RAW", field_value_raw, true, true);
				field_source_node->Replace("FIELD_VALUE", field_value, true, true);
				field_source_node->Replace("FIELD_FORMAT", field_format, true, true);
				field_source_node->Replace("FIELD_GROUP_CLASS", field_input_group_class, true, true);
				field_source_node->Replace("FIELD_CONTROL_CLASS", field_input_control_class, true, true);

				if(form_layout == "horizontal")
				{
					CWNode* input_div_node = field_source_node->FindChildByClass("input-div", true, true);
					if(input_div_node != NULL)
					{
						input_div_node->AddClass("col-sm-9");
						CWNode* label_node = field_source_node->FindChildByName("label", true, true);
						if(label_node != NULL)
						{
							label_node->AddClass("col-sm-3");
							label_node->AddClass("control-label");
						}
						else
							input_div_node->AddClass("col-sm-offset-3");
					}
				}

				form_node->AddChild(field_source_node);
			}
		}
	}

	// ---
	// submit
	// ---
	string submit_tmp_node_id = "#form-input-submit";
	CWNode* submit_tmp_node = controls_template.FindChild(submit_tmp_node_id, true, true);
	if(submit_tmp_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Field source element \"" + submit_tmp_node_id + "\" not found.";
		return false;
	}

	CWNode* submit_source_node = new CWNode();
	submit_source_node->CopyFrom(submit_tmp_node);
	submit_source_node->Attr->Delete(submit_source_node->Attr->FindName("id"));

	string submit_link = "{pathFor(\'" + SubmitRoute + "\')}";
	string cancel_link = "{pathFor(\'" + CancelRoute + "\')}";
	string close_link = "{pathFor(\'" + CloseRoute + "\')}";
	string back_link = "{pathFor(\'" + BackRoute + "\')}";

	submit_source_node->Replace("SUBMIT_LINK", submit_link, true, true);
	submit_source_node->Replace("CANCEL_LINK", cancel_link, true, true);
	submit_source_node->Replace("CLOSE_LINK", close_link, true, true);
	submit_source_node->Replace("BACK_LINK", back_link, true, true);

	CWNode* submit_button = submit_source_node->FindChild("#form-submit-button", true, true);
	if(submit_button && ((SubmitRoute == "" && SubmitCode == "") || form_mode == "read_only")) submit_source_node->DeleteChild(submit_button, true);

	CWNode* cancel_button = submit_source_node->FindChild("#form-cancel-button", true, true);
	if(cancel_button && ((CancelRoute == "" && CancelCode == "") || form_mode == "read_only")) submit_source_node->DeleteChild(cancel_button, true);

	CWNode* close_button = submit_source_node->FindChild("#form-close-button", true, true);
	if(close_button && (CloseRoute == "" || form_mode != "read_only" || (parent_page && parent_page->RedirectToSubpage() != NULL))) submit_source_node->DeleteChild(close_button, true);

	CWNode* back_button = pHTML->FindChild("#form-back-button", true, true);
	if(back_button && (BackRoute == "" || form_mode != "read_only")) pHTML->DeleteChild(back_button, true);

	if(form_layout == "horizontal")
	{
		CWNode* submit_div_node = submit_source_node->FindChildByClass("submit-div", true, true);
		if(submit_div_node != NULL)
		{
			submit_div_node->AddClass("col-sm-9");
			submit_div_node->AddClass("col-sm-offset-3");
		}
	}

	form_node->AddChild(submit_source_node);

	string submit_button_title = SubmitButtonTitle;
	string cancel_button_title = CancelButtonTitle;
	string close_button_title = CloseButtonTitle;
	if(submit_button_title == "") submit_button_title = "Save";
	if(cancel_button_title == "") cancel_button_title = "Cancel";
	if(close_button_title == "") close_button_title = "OK";

	form_node->Replace("SUBMIT_BUTTON_TITLE", submit_button_title, true, true);
	form_node->Replace("CANCEL_BUTTON_TITLE", cancel_button_title, true, true);
	form_node->Replace("CLOSE_BUTTON_TITLE", close_button_title, true, true);

	if(form_layout == "horizontal") form_node->AddClass("form-horizontal");
	if(form_layout == "inline") form_node->AddClass("form-inline");

	// ---
	// create js
	// ---
	string hidden_fields = "";
	int hidden_fields_count = HiddenFields->Count();
	for(int i = 0; i < hidden_fields_count; i++)
	{
		CWHiddenField* hidden_field = HiddenFields->Items[i];
		if(i > 0) {
			hidden_fields.append(LINE_TERM);
			hidden_fields.append("\t\t\t\t");
		}
		string hidden_value = hidden_field->Value;
		ReplaceSubString(&hidden_value, "this.params.", "self.props.routeParams.");
		ReplaceSubString(&hidden_value, "this.", "self.");
		
		hidden_fields.append("values." + hidden_field->Name + " = " + hidden_value + ";");
	}
	pHTML->Replace("/*HIDDEN_FIELDS*/", hidden_fields, true, true);


	string submit_code = SubmitCode;
	if(form_mode == "insert")
	{
		if(main_query != NULL)
		{
			if(main_query->Collection == "users")
			{
				if(submit_code != "") submit_code.append(" ");
				submit_code.append("Meteor.call(\"createUserAccount\", values, function(e, r) { if(e) errorAction(e); else submitAction(r); });");
			}
			else
			{
				if(submit_code != "") submit_code.append(" ");
				submit_code.append("Meteor.call(\"INSERT_METHOD_NAME\", values, function(e, r) { if(e) errorAction(e); else submitAction(r); });");
			}
		}
	}

	if(form_mode == "update")
	{
		if(main_query != NULL)
		{
			if(main_query->Collection == "users")
			{
				if(submit_code != "") submit_code.append(" ");
				submit_code.append("Meteor.call(\"updateUserAccount\", self.props.data.QUERY_NAME._id, values, function(e, r) { if(e) errorAction(e); else submitAction(r); });");
			}
			else
			{
				if(submit_code != "") submit_code.append(" ");
				submit_code.append("Meteor.call(\"UPDATE_METHOD_NAME\", self.props.data.QUERY_NAME._id, values, function(e, r) { if(e) errorAction(e); else submitAction(r); });");
			}
		}
	}

	string cancel_code = CancelCode;

	pHTML->Replace("/*SUBMIT_CODE*/", submit_code, true, true);
	pHTML->Replace("/*CANCEL_CODE*/", cancel_code, true, true);

	pHTML->Replace("FORM_MODE_VAR", form_mode_var, true, true);
	pHTML->Replace("FORM_MODE", form_mode, true, true);

	pHTML->Replace("INFO_MESSAGE_VAR", info_message_var, true, true);
	pHTML->Replace("ERROR_MESSAGE_VAR", error_message_var, true, true);

	if(SubmitRoute != "") pHTML->Replace("/*SUBMIT_REDIRECT*/", "FlowRouter.go(\"SUBMIT_ROUTE\", objectUtils.mergeObjects(FlowRouter.current().params, {/*SUBMIT_ROUTE_PARAMS*/}));", true, true);
	if(CancelRoute != "") pHTML->Replace("/*CANCEL_REDIRECT*/", "FlowRouter.go(\"CANCEL_ROUTE\", objectUtils.mergeObjects(FlowRouter.current().params, {/*CANCEL_ROUTE_PARAMS*/}));", true, true);
	if(CloseRoute != "") pHTML->Replace("/*CLOSE_REDIRECT*/", "FlowRouter.go(\"CLOSE_ROUTE\", objectUtils.mergeObjects(FlowRouter.current().params, {/*CLOSE_ROUTE_PARAMS*/}));", true, true);
	if(BackRoute != "") pHTML->Replace("/*BACK_REDIRECT*/", "FlowRouter.go(\"BACK_ROUTE\", objectUtils.mergeObjects(FlowRouter.current().params, {/*BACK_ROUTE_PARAMS*/}));", true, true);

	string submit_route_params = SubmitRouteParams->AsString();
	ReplaceSubString(&submit_route_params, "this.params.", "self.props.routeParams.");
	ReplaceSubString(&submit_route_params, "this.", "self.");

	string cancel_route_params = CancelRouteParams->AsString();
	ReplaceSubString(&cancel_route_params, "this.params.", "self.props.routeParams.");
	ReplaceSubString(&cancel_route_params, "this.", "self.");

	string close_route_params = CloseRouteParams->AsString();
	ReplaceSubString(&close_route_params, "this.params.", "self.props.routeParams.");
	ReplaceSubString(&close_route_params, "this.", "self.");

	string back_route_params = BackRouteParams->AsString();
	ReplaceSubString(&back_route_params, "this.params.", "self.props.routeParams.");
	ReplaceSubString(&back_route_params, "this.", "self.");

	pHTML->Replace("/*SUBMIT_ROUTE_PARAMS*/", submit_route_params, true, true);
	pHTML->Replace("/*CANCEL_ROUTE_PARAMS*/", cancel_route_params, true, true);
	pHTML->Replace("/*CLOSE_ROUTE_PARAMS*/", close_route_params, true, true);
	pHTML->Replace("/*BACK_ROUTE_PARAMS*/", back_route_params, true, true);

	pHTML->Replace("SUBMIT_ROUTE", SubmitRoute, true, true);
	pHTML->Replace("CANCEL_ROUTE", CancelRoute, true, true);
	pHTML->Replace("CLOSE_ROUTE", CloseRoute, true, true);
	pHTML->Replace("BACK_ROUTE", BackRoute, true, true);
	// ---

	if(!CWComponent::CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	return true;	
}


// ---------------------------------------------------


CWDataView::CWDataView(CWObject* pParent): CWComponent(pParent)
{
	TextIfEmpty = "";
	TextIfNotFound = "";
	DeleteConfirmationMessage = "";
	PageSize = 0;

	InsertRoute = "";
	DetailsRoute = "";
	EditRoute = "";
	DeleteRoute = "";

	InsertRouteParams = new CWParams();
	DetailsRouteParams = new CWParams();
	EditRouteParams = new CWParams();
	DeleteRouteParams = new CWParams();

	Actions = new CWActions();
	ItemActions = new CWActions();

	InsertButtonTitle = "";
	DetailsButtonTitle = "";
	EditButtonTitle = "";
	DeleteButtonTitle = "";

	SearchEngineStyle = false;

	OnItemClickedCode = "";


	Views = new CWStringList();
	Fields = new CWArray<CWField*>;
	
	// ---

	AddItemBindings = new CWStringList();

}

CWDataView::~CWDataView()
{
	Clear();
	delete AddItemBindings;

	delete Fields;
	delete Views;

	delete ItemActions;
	delete Actions;
	delete DeleteRouteParams;
	delete EditRouteParams;
	delete DetailsRouteParams;
	delete InsertRouteParams;
}

void CWDataView::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "data_view", "component");

	CWStringList view_list;
	view_list.Add("table");
	view_list.Add("blog");
	view_list.Add("list");
	view_list.Add("cards");

	MetaAddMember(pMeta, "text_if_empty", "Text if empty", "string", "", "No data here", false, "text", NULL);
	MetaAddMember(pMeta, "text_if_not_found", "Text if not found", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "delete_confirmation_message", "Delete confirmation message", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "page_size", "Page size", "string", "", "0", false, "text", NULL);

	MetaAddMember(pMeta, "insert_route", "Insert route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "details_route", "Details route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "edit_route", "Edit route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "delete_route", "Delete route", "string", "route_name", "", false, "select_route", NULL);

	MetaAddMember(pMeta, "insert_route_params", "Insert route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "details_route_params", "Details route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "edit_route_params", "Edit route params", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "delete_route_params", "Delete route params", "array", "param", "", false, "", NULL);

//	MetaAddMember(pMeta, "actions", "Custom Actions", "array", "action", "", false, "", NULL);
	MetaAddMember(pMeta, "item_actions", "Custom Item Actions", "array", "action", "", false, "", NULL);

	MetaAddMember(pMeta, "insert_button_title", "Insert button title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "details_button_title", "Details button title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "update_button_title", "Update button title", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "delete_button_title", "Delete button title", "string", "", "", false, "text", NULL);
    MetaAddMember(pMeta, "on_item_clicked_code", "OnItemClicked code", "string", "", "", false, "javascript", NULL);

	MetaAddMember(pMeta, "views", "View styles", "array", "string", "", false, "stringlist", &view_list);
	MetaAddMember(pMeta, "search_engine_style", "Search engine style", "bool", "", "false", false, "checkbox", NULL);

	MetaAddMember(pMeta, "fields", "Fields", "array", "field", "", false, "", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "data_view", false, "static", NULL);
}

void CWDataView::Clear()
{
	CWComponent::Clear();
	TextIfEmpty = "";
	TextIfNotFound = "";
	DeleteConfirmationMessage = "";
	PageSize = 0;

	InsertRoute = "";
	DetailsRoute = "";
	EditRoute = "";
	DeleteRoute = "";
	InsertRouteParams->Clear();
	DetailsRouteParams->Clear();
	EditRouteParams->Clear();
	DeleteRouteParams->Clear();

	Actions->Clear();
	ItemActions->Clear();

	InsertButtonTitle = "";
	DetailsButtonTitle = "";
	EditButtonTitle = "";
	DeleteButtonTitle = "";

	SearchEngineStyle = false;

	OnItemClickedCode = "";
	Views->Clear();
	Fields->Clear();

	AddItemBindings->Clear();
}

bool CWDataView::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	TextIfEmpty = pJSON->GetString("text_if_empty");
	TextIfNotFound = pJSON->GetString("text_if_not_found");
	DeleteConfirmationMessage = pJSON->GetString("delete_confirmation_message");
	PageSize = StrToIntDef(pJSON->GetString("page_size"), 0);

	InsertRoute = FromCamelCase(pJSON->GetString("insert_route"), '_', true);
	DetailsRoute = FromCamelCase(pJSON->GetString("details_route"), '_', true);
	EditRoute = FromCamelCase(pJSON->GetString("edit_route"), '_', true);
	DeleteRoute = FromCamelCase(pJSON->GetString("delete_route"), '_', true);
	InsertRouteParams->LoadFromJSONArray(pJSON->GetArray("insert_route_params"));
	DetailsRouteParams->LoadFromJSONArray(pJSON->GetArray("details_route_params"));
	EditRouteParams->LoadFromJSONArray(pJSON->GetArray("edit_route_params"));
	DeleteRouteParams->LoadFromJSONArray(pJSON->GetArray("delete_route_params"));

	Actions->LoadFromJSONArray(pJSON->GetArray("actions"));
	ItemActions->LoadFromJSONArray(pJSON->GetArray("item_actions"));

	InsertButtonTitle = pJSON->GetString("insert_button_title");
	DetailsButtonTitle = pJSON->GetString("details_button_title");
	EditButtonTitle = pJSON->GetString("edit_button_title");
	DeleteButtonTitle = pJSON->GetString("delete_button_title");

	OnItemClickedCode = UnescapeJSON(pJSON->GetString("on_item_clicked_code"));
	JSONArrayToStringList(pJSON->GetArray("views"), Views);

	SearchEngineStyle = pJSON->GetBool("search_engine_style");

	// load fields
	CWJSONArray* fields = pJSON->GetArray("fields");
	if(fields)
	{
		int fields_count = fields->Count();
		for(int i = 0; i < fields_count; i++)
		{
			CWJSONObject* field = fields->Items[i]->GetObject();
			if(field != NULL)
			{
				CWField* obj = new CWField(this);
				if(!obj->LoadFromJSON(field, "", pErrorMessage))
				{
					delete obj;
					return false;
				}
				Fields->Add(obj);
			}
		}
	}
	
	// Paging
	if(QueryName != "") {
		CWQuery* query = App()->GetQuery(QueryName);
		if(query != NULL) {
			if(!query->FindOne) {
				string paged_query_name = query->Name + "_paged";
				CWQuery* paged_query = App()->GetQuery(paged_query_name);
				if(paged_query == NULL) {
					CWJSONObject tmp;
					if(!query->SaveToJSON(&tmp, pErrorMessage)) {
						return false;
					}

					paged_query = new CWQuery(App());
					if(!paged_query->LoadFromJSON(&tmp, "", pErrorMessage)) {
						delete paged_query;
						return false;
					}
					paged_query->Name = paged_query_name;
					paged_query->UsedByDataview = true;
					App()->Queries->Add(paged_query);
				}
				QueryName = paged_query_name;
				Subscription->Name = FromCamelCase(QueryName, '_', true);
			}
		}
	}

	return true;
}

CWArray<CWField*> *CWDataView::GetFields()
{
	if(Fields->Count() == 0)
	{
		CWArray<CWField*> *collection_fields = CWComponent::GetFields();
		if(collection_fields && collection_fields->Count() > 0)
			return collection_fields;
	}
	return Fields;
}

void CWDataView::ExtractDataMembers(string sCode, string sObjectVar, CWStringList* pList)
{
	CWStringList words;
	StringToListExt(sCode, ' ', &words, ":;(){}[]\r\n\t", "");
	int word_count = words.Count();
	for(int i = 0; i < word_count; i++) {
		string word = Trim(words.Strings[i], true, true);
		if(FindSubString(&word, sObjectVar, true, 0, true) == 0) {
			CWStringList pair;
			StringToList(word, '.', &pair);
			if(pair.Count() > 1) {
				string data_member = pair.Strings[1];
				if(pList->Find(data_member) < 0) {
					pList->Add(data_member);
				}
			}
		}
	}
}


bool CWDataView::CreateTableBlaze(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	string frontend = App()->FrontendName();

	CWArray<CWField*> *collection_fields = GetFields();
	string collection_name = GetCollectionName();

	string delete_confirmation_message = DeleteConfirmationMessage;
	if(delete_confirmation_message == "") delete_confirmation_message = "Delete? Are you sure?";

	// ---
	// create table
	// ---
	string data_source_html = AddSuffixToFileName(ChangeFileExt(TemplateFile(), ".html"), "_table");
	CWNode* data_node = new CWNode();
	if(!LoadHTML(data_source_html, data_node, pErrorMessage))
		return false;

	CWNode* data_source_node = data_node->FindChild("template", true, true);
	if(data_source_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Table template node not found.";
		return false;
	}

	string data_template_name = TemplateName() + "Table";
	data_source_node->Attr->SetValue("name", data_template_name);

	CWNode* table_node = data_source_node->FindChild("table", true, true);
	if(table_node)
	{
		if(DetailsRoute != "")
		{
			if(frontend == "bootstrap3") table_node->AddClass("table-hover");
			if(frontend == "semantic-ui") table_node->AddClass("selectable");
		}
	}

	string data_dest_node_id = "#dataview-data";
	CWNode* data_dest_node = pParentHTML->FindChild(data_dest_node_id, true, true);
	if(data_dest_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Data destination node \"" + data_dest_node_id + "\" not found.";
		return false;
	}
	data_dest_node->AppendText("{{#if viewAsTable}} {{> " + data_template_name + "}} {{/if}}");

	string data_source_js = AddSuffixToFileName(ChangeFileExt(TemplateFile(), ".js"), "_table");
	string data_js = "";
	if(!FileLoadString(data_source_js, &data_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading file \"" + data_source_js + "\". " + *pErrorMessage;
		return false;
	}

	ReplaceSubString(&data_js, "TEMPLATE_NAME", data_template_name);
	// ---

	// ---
	// create table header
	// ---
	for(int i = 0; i < collection_fields->Count(); i++)
	{
		CWField* field = collection_fields->Items[i];
		if(field->ShowInDataview)
		{
			string field_name = field->Name;
			string field_title = field->Title;
			if(field_title == "") field_title = field_name;
			bool field_sortable = field->Sortable;

			string field_tmp_node_id = "#dataview-table-header-cell";
			CWNode* field_tmp_node = data_node->FindChild(field_tmp_node_id, true, true);
			if(field_tmp_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data header cell source node \"" + field_tmp_node_id + "\" not found.";
				return false;
			}

			CWNode* field_source_node = new CWNode();
			field_source_node->CopyFrom(field_tmp_node);
			field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

			field_source_node->Replace("FIELD_TITLE", field_title, true, true);
			if(field_sortable)
			{
				field_source_node->AddClass("th-sortable");
				field_source_node->Attr->SetValue("data-sort", field_name);
			}

			string field_dest_node_id = "#dataview-table-header-row";
			CWNode* field_dest_node = data_source_node->FindChild(field_dest_node_id, true, true);
			if(field_dest_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data header cell dest node \"" + field_dest_node_id + "\" not found.";
				return false;
			}

			field_dest_node->AddChild(field_source_node);
		}
	}

	// column for edit button
	if(EditRoute != "")
	{
		string field_dest_node_id = "#dataview-table-header-row";
		CWNode* field_dest_node = data_node->FindChild(field_dest_node_id, true, true);
		if(field_dest_node == NULL)
		{
			if(pErrorMessage) *pErrorMessage = "Data header cell dest node \"" + field_dest_node_id + "\" not found.";
			return false;
		}

		field_dest_node->AddChild("th", "&nbsp;");
	}

	// column for delete button
	if(InsertRoute != "" && collection_name != "users")
	{
		string field_dest_node_id = "#dataview-table-header-row";
		CWNode* field_dest_node = data_source_node->FindChild(field_dest_node_id, true, true);
		if(field_dest_node == NULL)
		{
			if(pErrorMessage) *pErrorMessage = "Data header cell dest node \"" + field_dest_node_id + "\" not found.";
			return false;
		}

		field_dest_node->AddChild("th", "&nbsp;");
	}
	// ---

	// columns for custom item actions
	int item_actions_count = ItemActions->Count();
	if(item_actions_count > 0) {
		for(int i = 0; i < item_actions_count; i++) {
			string field_dest_node_id = "#dataview-table-header-row";
			CWNode* field_dest_node = data_source_node->FindChild(field_dest_node_id, true, true);
			if(field_dest_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data header cell dest node \"" + field_dest_node_id + "\" not found.";
				return false;
			}
			field_dest_node->AddChild("th", "&nbsp;");
		}
	}


	// ---
	// create table items
	// ---
	string data_items_source_html = AddSuffixToFileName(data_source_html, "_items");
	CWNode* data_items_node = new CWNode();
	if(!LoadHTML(data_items_source_html, data_items_node, pErrorMessage))
		return false;

	CWNode* data_items_source_node = data_items_node->FindChild("template", true, true);
	if(data_items_source_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Data items template node not found.";
		return false;
	}

	string data_items_template_name = data_template_name + "Items";

	data_items_source_node->Attr->SetValue("name", data_items_template_name);

	for(int i = 0; i < collection_fields->Count(); i++)
	{
		CWField* field = collection_fields->Items[i];
		if(field->ShowInDataview)
		{
			string field_name = field->Name;
			string field_type = field->Type;
			string field_format = field->Format;
			string display_helper = field->DisplayHelper;
			string field_input = field->Input;
			bool field_edit_inline = field->EditInline;

			string field_tmp_node_id = "#dataview-table-items-cell";
			if(field_edit_inline) {
				if(field_input == "checkbox") field_tmp_node_id = "#dataview-table-items-checkbox-cell";
			}

			CWNode* field_tmp_node = data_items_node->FindChild(field_tmp_node_id, true, true);
			if(field_tmp_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data items cell source node \"" + field_tmp_node_id + "\" not found.";
				return false;
			}

			CWNode* field_source_node = new CWNode();
			field_source_node->CopyFrom(field_tmp_node);
			field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

			string field_value = "{{" + field_name + "}}";
			if(field_type == "bool") field_value = "{{booleanToYesNo " + field_name + "}}";
			if(field_type == "file") field_value = "{{" + field_name + ".url}}";
			if(field_type == "time") field_value = "{{secondsToTime " + field_name + " \'" + field_format + "\'}}";
			if(field_type == "date") field_value = "{{formatDate " + field_name + " \'" + field_format + "\'}}";
			if(display_helper != "") field_value = "{{" + display_helper + " " + field_name + " this}}";

			field_source_node->Replace("FIELD_VALUE", field_value, true, true);
			field_source_node->Replace("FIELD_NAME", field_name, true, true);

			string details_link = "{{pathFor \'" + DetailsRoute + "\'}}";
			field_source_node->Replace("DETAILS_LINK", details_link, true, true);

			string field_dest_node_id = "#dataview-table-items-row";
			CWNode* field_dest_node = data_items_source_node->FindChild(field_dest_node_id, true, true);
			if(field_dest_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data items cell dest node \"" + field_dest_node_id + "\" not found.";
				return false;
			}

			field_dest_node->AddChild(field_source_node);
		}
	}

	// edit button
	if(EditRoute != "")
	{
		string field_tmp_node_id = "#dataview-table-items-edit-cell";
		CWNode* field_tmp_node = data_items_node->FindChild(field_tmp_node_id, true, true);
		if(field_tmp_node != NULL)
		{
			CWNode* field_source_node = new CWNode();
			field_source_node->CopyFrom(field_tmp_node);
			field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

			string field_dest_node_id = "#dataview-table-items-row";
			CWNode* field_dest_node = data_items_source_node->FindChild(field_dest_node_id, true, true);
			if(field_dest_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data items cell dest node \"" + field_dest_node_id + "\" not found.";
				return false;
			}

			field_dest_node->AddChild(field_source_node);
		}
	}
	// ---

	// delete button
	if(InsertRoute != "" && collection_name != "users")
	{
		string field_tmp_node_id = "#dataview-table-items-delete-cell";
		CWNode* field_tmp_node = data_items_node->FindChild(field_tmp_node_id, true, true);
		if(field_tmp_node != NULL)
		{
			CWNode* field_source_node = new CWNode();
			field_source_node->CopyFrom(field_tmp_node);
			field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

			string field_dest_node_id = "#dataview-table-items-row";
			CWNode* field_dest_node = data_items_source_node->FindChild(field_dest_node_id, true, true);
			if(field_dest_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data items cell dest node \"" + field_dest_node_id + "\" not found.";
				return false;
			}

			field_dest_node->AddChild(field_source_node);
		}
	}
	// ---

	CWStringList parent_data_for_items;

	// columns for custom item actions
	string item_actions_code = "";
	string item_actions_enabled_code = "";
	if(item_actions_count > 0) {
		for(int i = 0; i < item_actions_count; i++) {
			CWAction* item_action = ItemActions->Items[i];
			string field_tmp_node_id = "#dataview-table-items-action-cell-icon";

			string item_action_title = item_action->Title;
			if(item_action_title == "") item_action_title = item_action->Name;
			
			if(item_action->IconClass == "") {
				field_tmp_node_id = "#dataview-table-items-action-cell-button";
			}

			CWNode* field_tmp_node = data_items_node->FindChild(field_tmp_node_id, true, true);

			if(field_tmp_node != NULL)
			{
				CWNode* field_source_node = new CWNode();
				field_source_node->CopyFrom(field_tmp_node);
				field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

				string item_action_enabled_helper_start = "";
				string item_action_enabled_helper_end = "";
				if(item_action->Rule != "") {
					string item_action_enabled_helper = "isEnabled" + ToCamelCase(item_action->Name, '_', true);
					item_action_enabled_helper_start = "{{#if " + item_action_enabled_helper + "}}";
					item_action_enabled_helper_end = "{{/if}}";

					string item_action_enabled_code = "";
					item_action_enabled_code.append("\"" + item_action_enabled_helper + "\": function() {");
					item_action_enabled_code.append(LINE_TERM);
					
					string item_action_rule = item_action->Rule;
					ReplaceSubString(&item_action_rule, "PARENT_DATA", "Template.parentData()");

					item_action_enabled_code.append("return !!(" + item_action_rule + ")");
					item_action_enabled_code.append(LINE_TERM);
					
					item_action_enabled_code.append("},");
					item_action_enabled_code.append(LINE_TERM);
					item_actions_enabled_code.append(item_action_enabled_code);
				}

				field_source_node->Replace("ACTION_ENABLED_HELPER_START", item_action_enabled_helper_start, true, true);
				field_source_node->Replace("ACTION_ENABLED_HELPER_END", item_action_enabled_helper_end, true, true);
				field_source_node->Replace("ACTION_NAME", item_action->Name, true, true);
				field_source_node->Replace("ACTION_ICON_CLASS", item_action->IconClass, true, true);
				field_source_node->Replace("ACTION_TITLE", item_action_title, true, true);

				string field_dest_node_id = "#dataview-table-items-row";
				CWNode* field_dest_node = data_items_source_node->FindChild(field_dest_node_id, true, true);
				if(field_dest_node == NULL)
				{
					if(pErrorMessage) *pErrorMessage = "Data items cell dest node \"" + field_dest_node_id + "\" not found.";
					return false;
				}

				field_dest_node->AddChild(field_source_node);

				string item_action_code = "";
				item_action_code.append("\"click [data-action='" + item_action->Name + "']\": function(e, t) {");
				item_action_code.append(LINE_TERM);

				string item_action_action_code = item_action->ActionCode;
				ReplaceSubString(&item_action_action_code, "PARENT_DATA", "Template.parentData()");
				item_action_code.append(item_action_action_code);
				item_action_code.append(LINE_TERM);

				item_action_code.append("},");
				item_action_code.append(LINE_TERM);
				item_action_code.append(LINE_TERM);

				item_actions_code.append(item_action_code);

				CWStringList tmp_list;
				ExtractDataMembers(item_action->Rule, "PARENT_DATA", &parent_data_for_items);
				ExtractDataMembers(item_action->ActionCode, "PARENT_DATA", &parent_data_for_items);
			}
		}
	}


	string data_items_dest_node_id = "#dataview-table-items";
	CWNode* data_items_dest_node = data_source_node->FindChild(data_items_dest_node_id, true, true);
	if(data_items_dest_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Data destination node \"" + data_items_dest_node_id + "\" not found.";
		return false;
	}
	data_items_dest_node->AppendText("{{#each " + GetQueryName() + "}} {{> " + data_items_template_name + "}} {{/each}}");

	string data_items_source_js = AddSuffixToFileName(data_source_js, "_items");
	string data_items_js = "";
	if(!FileLoadString(data_items_source_js, &data_items_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading file \"" + data_items_source_js + "\". " + *pErrorMessage;
		return false;
	}

    string on_item_clicked_code = OnItemClickedCode;

	string edit_button_class = "";
	string delete_button_class = "";

	string edit_button_class_helper = "";
	string delete_button_class_helper = "";

	if(App()->UseAccounts)
	{
		edit_button_class = "{{editButtonClass}}";
		delete_button_class = "{{deleteButtonClass}}";

		edit_button_class_helper.append("\"editButtonClass\": function() {");
		edit_button_class_helper.append(LINE_TERM);
		if(collection_name == "users")
			edit_button_class_helper.append("\t\treturn Users.isAdmin(Meteor.userId()) ? \"\" : \"hidden\";");
		else
			edit_button_class_helper.append("\t\treturn COLLECTION_VARIABLE.userCanUpdate(Meteor.userId(), this) ? \"\" : \"hidden\";");
		edit_button_class_helper.append(LINE_TERM);
		edit_button_class_helper.append("\t},");

		delete_button_class_helper.append("\"deleteButtonClass\": function() {");
		delete_button_class_helper.append(LINE_TERM);
		if(collection_name == "users")
			delete_button_class_helper.append("\t\treturn Users.isAdmin(Meteor.userId()) ? \"\" : \"hidden\";");
		else
			delete_button_class_helper.append("\t\treturn COLLECTION_VARIABLE.userCanRemove(Meteor.userId(), this) ? \"\" : \"hidden\";");
		delete_button_class_helper.append(LINE_TERM);
		delete_button_class_helper.append("\t}");
	}

	string details_button_title = DetailsButtonTitle;
	if(details_button_title == "") details_button_title = "Details";

	string edit_button_title = EditButtonTitle;
	if(edit_button_title == "") edit_button_title = "Edit";

	string delete_button_title = DeleteButtonTitle;
	if(delete_button_title == "") delete_button_title = "Delete";

	data_items_source_node->Replace("DETAILS_BUTTON_TITLE", details_button_title, true, true);
	data_items_source_node->Replace("EDIT_BUTTON_TITLE", edit_button_title, true, true);
	data_items_source_node->Replace("DELETE_BUTTON_TITLE", delete_button_title, true, true);

	data_items_source_node->Replace("EDIT_BUTTON_CLASS", edit_button_class, true, true);
	data_items_source_node->Replace("DELETE_BUTTON_CLASS", delete_button_class, true, true);

	if(edit_button_class_helper != "" || delete_button_class_helper != "")
	{
		int helpers_pos = FindSubString(&data_items_js, "/*EDIT_BUTTON_CLASS_HELPER*/");
		if(helpers_pos >= 0)
		{
			size_t helpers_function_pos = data_items_js.rfind(".helpers", helpers_pos);
			if(helpers_function_pos != string::npos)
			{
				size_t last_closed_brace = data_items_js.rfind("}", helpers_pos);
				if(last_closed_brace != string::npos && last_closed_brace > helpers_function_pos)
				{
					data_items_js.insert(last_closed_brace + 1, ", ");
				}
			}
		}
	}

	ReplaceSubString(&data_items_js, "/*EDIT_BUTTON_CLASS_HELPER*/", edit_button_class_helper);
	ReplaceSubString(&data_items_js, "/*DELETE_BUTTON_CLASS_HELPER*/", delete_button_class_helper);
	ReplaceSubString(&data_items_js, "TEMPLATE_NAME", data_items_template_name);
	ReplaceSubString(&data_items_js, "/*ITEM_ACTIONS_CODE*/", item_actions_code);
	ReplaceSubString(&data_items_js, "/*ITEM_ACTIONS_HELPER_CODE*/", item_actions_enabled_code);
	ReplaceSubString(&data_items_js, "/*ON_ITEM_CLICKED_CODE*/", on_item_clicked_code);
	ReplaceSubString(&data_items_js, "DELETE_CONFIRMATION_MESSAGE", delete_confirmation_message);
	// ---


	// insert into parent
	pRootHTML->AddChild(data_source_node);
	pParentJS->append(LINE_TERM);
	pParentJS->append(LINE_TERM);
	pParentJS->append(data_js);

	pRootHTML->AddChild(data_items_source_node);
	pParentJS->append(LINE_TERM);
	pParentJS->append(LINE_TERM);
	pParentJS->append(data_items_js);

	return true;
}

bool CWDataView::CreateBlogBlaze(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	string frontend = App()->FrontendName();

	CWArray<CWField*> *collection_fields = GetFields();
	string collection_name = GetCollectionName();

	string delete_confirmation_message = DeleteConfirmationMessage;
	if(delete_confirmation_message == "") delete_confirmation_message = "Delete? Are you sure?";

	// ---
	// create blog container
	// ---
	string data_source_html = AddSuffixToFileName(ChangeFileExt(TemplateFile(), ".html"), "_blog");
	CWNode* data_node = new CWNode();
	if(!LoadHTML(data_source_html, data_node, pErrorMessage))
		return false;

	CWNode* data_source_node = data_node->FindChild("template", true, true);
	if(data_source_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Blog template node not found.";
		return false;
	}

	string data_template_name = TemplateName() + "Blog";
	data_source_node->Attr->SetValue("name", data_template_name);


	string data_dest_node_id = "#dataview-data";
	CWNode* data_dest_node = pParentHTML->FindChild(data_dest_node_id, true, true);
	if(data_dest_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Data destination node \"" + data_dest_node_id + "\" not found.";
		return false;
	}
	data_dest_node->AppendText("{{#if viewAsBlog}} {{> " + data_template_name + "}} {{/if}}");

	string data_source_js = AddSuffixToFileName(ChangeFileExt(TemplateFile(), ".js"), "_blog");
	string data_js = "";
	if(!FileLoadString(data_source_js, &data_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading file \"" + data_source_js + "\". " + *pErrorMessage;
		return false;
	}

	ReplaceSubString(&data_js, "TEMPLATE_NAME", data_template_name);


	// ---
	// create items
	// ---
	string data_items_source_html = AddSuffixToFileName(data_source_html, "_items");
	CWNode* data_items_node = new CWNode();
	if(!LoadHTML(data_items_source_html, data_items_node, pErrorMessage))
		return false;

	CWNode* data_items_source_node = data_items_node->FindChild("template", true, true);
	if(data_items_source_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Data items template node not found.";
		return false;
	}

	string data_items_template_name = data_template_name + "Items";

	data_items_source_node->Attr->SetValue("name", data_items_template_name);

	CWNode* blog_title_node = data_items_source_node->FindChild(".blog-title", true, true);
	CWNode* blog_subtitle_node = data_items_source_node->FindChild(".blog-subtitle", true, true);
	CWNode* blog_text_node = data_items_source_node->FindChild(".blog-text", true, true);
	CWNode* blog_date_node = data_items_source_node->FindChild(".blog-date", true, true);
	bool got_title = false;
	bool got_subtitle = false;
	bool got_text = false;
	bool got_date = false;

	for(int i = 0; i < collection_fields->Count(); i++)
	{
		CWField* field = collection_fields->Items[i];
		if(field->RoleInBlog == "title" && blog_title_node != NULL) {
			blog_title_node->AppendText("{{" + field->Name + "}}");
			got_title = true;
		}
		if(field->RoleInBlog == "subtitle" && blog_subtitle_node != NULL) {
			blog_subtitle_node->AppendText("{{" + field->Name + "}}");
			got_subtitle = true;
		}
		if(field->RoleInBlog == "text" && blog_text_node != NULL) {
			blog_text_node->AppendText("{{#markdown}}{{" + field->Name + "}}{{/markdown}}");
			got_text = true;
		}
		if(field->RoleInBlog == "date" && blog_date_node != NULL) {
			blog_date_node->AppendText("{{" + field->Name + "}}");
			got_date = true;
		}
	}
	if(!got_title && blog_title_node != NULL) data_items_source_node->DeleteChild(blog_title_node, true);
	if(!got_subtitle && blog_subtitle_node != NULL) data_items_source_node->DeleteChild(blog_subtitle_node, true);
	if(!got_text && blog_text_node != NULL) data_items_source_node->DeleteChild(blog_text_node, true);
	if(!got_date && blog_date_node != NULL) data_items_source_node->DeleteChild(blog_date_node, true);


	bool got_details_control = false;
	bool got_edit_control = false;
	bool got_delete_control = false;

	CWNode* blog_controls_node = data_items_source_node->FindChild(".blog-controls", true, true);
	CWNode* blog_details_node = data_items_source_node->FindChild(".blog-details", true, true);
	CWNode* blog_edit_node = data_items_source_node->FindChild(".blog-edit", true, true);
	CWNode* blog_delete_node = data_items_source_node->FindChild(".blog-delete", true, true);

	// details button
	if(DetailsRoute == "") {
		if(blog_details_node != NULL) {
			data_items_source_node->DeleteChild(blog_details_node, true);
		}
	} else {
		got_details_control = true;
	}

	// edit button
	if(EditRoute == "") {
		if(blog_edit_node != NULL) {
			data_items_source_node->DeleteChild(blog_edit_node, true);
		}
	} else {
		got_edit_control = true;
	}

	// delete button
	if(InsertRoute == "" || collection_name == "users") {
		if(blog_delete_node != NULL) {
			data_items_source_node->DeleteChild(blog_delete_node, true);
		}
	} else {
		got_delete_control = true;
	}

	// remove controls container if no buttons
	if(!got_details_control && !got_edit_control && !got_delete_control && blog_controls_node != NULL) {
		data_items_source_node->DeleteChild(blog_controls_node, true);
	}

	// ---
	string data_items_dest_node_id = ".blog-container";
	CWNode* data_items_dest_node = data_source_node->FindChild(data_items_dest_node_id, true, true);
	if(data_items_dest_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Data destination node \"" + data_items_dest_node_id + "\" not found.";
		return false;
	}
	data_items_dest_node->AppendText("{{#each " + GetQueryName() + "}} {{> " + data_items_template_name + "}} {{/each}}");

	string data_items_source_js = AddSuffixToFileName(data_source_js, "_items");
	string data_items_js = "";
	if(!FileLoadString(data_items_source_js, &data_items_js, 0, pErrorMessage))
	{
		if(pErrorMessage) *pErrorMessage = "Error reading file \"" + data_items_source_js + "\". " + *pErrorMessage;
		return false;
	}


    string on_item_clicked_code = OnItemClickedCode;

	string edit_button_class = "";
	string delete_button_class = "";

	string edit_button_class_helper = "";
	string delete_button_class_helper = "";

	if(App()->UseAccounts)
	{
		edit_button_class = "{{editButtonClass}}";
		delete_button_class = "{{deleteButtonClass}}";

		edit_button_class_helper.append("\"editButtonClass\": function() {");
		edit_button_class_helper.append(LINE_TERM);
		if(collection_name == "users")
			edit_button_class_helper.append("\t\treturn Users.isAdmin(Meteor.userId()) ? \"\" : \"hidden\";");
		else
			edit_button_class_helper.append("\t\treturn COLLECTION_VARIABLE.userCanUpdate(Meteor.userId(), this) ? \"\" : \"hidden\";");
		edit_button_class_helper.append(LINE_TERM);
		edit_button_class_helper.append("\t},");

		delete_button_class_helper.append("\"deleteButtonClass\": function() {");
		delete_button_class_helper.append(LINE_TERM);
		if(collection_name == "users")
			delete_button_class_helper.append("\t\treturn Users.isAdmin(Meteor.userId()) ? \"\" : \"hidden\";");
		else
			delete_button_class_helper.append("\t\treturn COLLECTION_VARIABLE.userCanRemove(Meteor.userId(), this) ? \"\" : \"hidden\";");
		delete_button_class_helper.append(LINE_TERM);
		delete_button_class_helper.append("\t}");
	}

	string details_button_title = DetailsButtonTitle;
	if(details_button_title == "") details_button_title = "Details";

	string edit_button_title = EditButtonTitle;
	if(edit_button_title == "") edit_button_title = "Edit";

	string delete_button_title = DeleteButtonTitle;
	if(delete_button_title == "") delete_button_title = "Delete";

	data_items_source_node->Replace("DETAILS_BUTTON_TITLE", details_button_title, true, true);
	data_items_source_node->Replace("EDIT_BUTTON_TITLE", edit_button_title, true, true);
	data_items_source_node->Replace("DELETE_BUTTON_TITLE", delete_button_title, true, true);

	data_items_source_node->Replace("EDIT_BUTTON_CLASS", edit_button_class, true, true);
	data_items_source_node->Replace("DELETE_BUTTON_CLASS", delete_button_class, true, true);

	if(edit_button_class_helper != "" || delete_button_class_helper != "")
	{
		int helpers_pos = FindSubString(&data_items_js, "/*EDIT_BUTTON_CLASS_HELPER*/");
		if(helpers_pos >= 0)
		{
			size_t helpers_function_pos = data_items_js.rfind(".helpers", helpers_pos);
			if(helpers_function_pos != string::npos)
			{
				size_t last_closed_brace = data_items_js.rfind("}", helpers_pos);
				if(last_closed_brace != string::npos && last_closed_brace > helpers_function_pos)
				{
					data_items_js.insert(last_closed_brace + 1, ", ");
				}
			}
		}
	}

	ReplaceSubString(&data_items_js, "/*EDIT_BUTTON_CLASS_HELPER*/", edit_button_class_helper);
	ReplaceSubString(&data_items_js, "/*DELETE_BUTTON_CLASS_HELPER*/", delete_button_class_helper);
	ReplaceSubString(&data_items_js, "TEMPLATE_NAME", data_items_template_name);
	ReplaceSubString(&data_items_js, "/*ON_ITEM_CLICKED_CODE*/", on_item_clicked_code);
	ReplaceSubString(&data_items_js, "DELETE_CONFIRMATION_MESSAGE", delete_confirmation_message);


	// insert into parent
	pRootHTML->AddChild(data_source_node);
	pParentJS->append(LINE_TERM);
	pParentJS->append(LINE_TERM);
	pParentJS->append(data_js);

	pRootHTML->AddChild(data_items_source_node);
	pParentJS->append(LINE_TERM);
	pParentJS->append(LINE_TERM);
	pParentJS->append(data_items_js);

	return true;
}

bool CWDataView::CreateListBlaze(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	return true;
}

bool CWDataView::CreateCardsBlaze(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	return true;
}

bool CWDataView::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string text_if_empty = TextIfEmpty;
	string text_if_not_found = TextIfNotFound;
	string delete_confirmation_message = DeleteConfirmationMessage;
	if(text_if_empty == "") text_if_empty = "Empty.";
	if(text_if_not_found == "") text_if_not_found = "\"{{searchString}}\" not found.";
	if(delete_confirmation_message == "") delete_confirmation_message = "Delete? Are you sure?";

	string query_var = ToCamelCase(GetQueryName(), '_', true);
	string search_string_session_var = query_var + "SearchString";
	string search_fields_session_var = query_var + "SearchFields";
	string sort_by_session_var = query_var + "SortBy";
	string sort_ascending_session_var = query_var + "SortAscending";
	string page_no_session_var = query_var + "PageNo";
	string page_size_session_var = query_var + "PageSize";
	string page_count_var = FromCamelCase(query_var + "PageCount", '_', true);
	string export_method_name = ToCamelCase(GetQueryName() + "_export", '_', false);

	string view_style_session_var = TemplateName() + "Style";
	string export_function = TemplateName() + "Export";
	CWArray<CWField*> *collection_fields = GetFields();
	string collection_name = GetCollectionName();

	bool search_engine_style = SearchEngineStyle;
	
	string export_arguments = "";
	CWStringList export_vars;
	if(Subscription != NULL) {
		Subscription->GetSubscriptionArguments(App(), false, &export_arguments, &export_vars);
	}

	//---
	// Create views
	//---
	string initial_view_style = "";
	CWStringList view_styles;
	view_styles.Assign(Views);
	int view_count = view_styles.Count();
	for(int i = view_count - 1; i >= 0; i--)
		if(view_styles.Strings[i] != "table" && view_styles.Strings[i] != "blog" && view_styles.Strings[i] != "cards" && view_styles.Strings[i] != "list")
			view_styles.Delete(i);
	if(view_styles.Count() == 0) view_styles.Add("table");
	for(int i = 0; i < view_styles.Count(); i++)
	{
		string view_style = view_styles.Strings[i];
		if(i == 0) initial_view_style = view_style;

		if(view_style == "table" && !CreateTableBlaze(pRootHTML, pHTML, pJS, pErrorMessage)) return false;
		if(view_style == "blog" && !CreateBlogBlaze(pRootHTML, pHTML, pJS, pErrorMessage)) return false;
		if(view_style == "list" && !CreateListBlaze(pRootHTML, pHTML, pJS, pErrorMessage)) return false;
		if(view_style == "cards" && !CreateCardsBlaze(pRootHTML, pHTML, pJS, pErrorMessage)) return false;
	}
	// ---

	// search fields
	string search_fields = "";
	int search_field_count = 0;
	for(int i = 0; i < collection_fields->Count(); i++)
	{
		CWField* field = collection_fields->Items[i];
		if(field != NULL)
		{
			if(field->Searchable)
			{
				if(search_field_count > 0)
					search_fields.append(", ");
				search_fields.append("\"" + field->Name + "\"");
				search_field_count++;
			}
		}
	}

	if(search_field_count == 0) {
		search_engine_style = false;
	}

	// export fields
	string export_fields = "";
	int export_field_count = 0;
	for(int i = 0; i < collection_fields->Count(); i++)
	{
		CWField* field = collection_fields->Items[i];
		if(field != NULL)
		{
			if(field->Exportable)
			{
				if(export_field_count > 0)
					export_fields.append(", ");
				export_fields.append("\"" + field->Name + "\"");
				export_field_count++;
			}
		}
	}

	// ---
	// create controls
	// ---
	CWNode* controls_dest_node = pHTML->FindChild("#dataview-controls", true, true);
	if(controls_dest_node != NULL)
	{
		// create insert control
		if(InsertRoute != "")
		{
			CWNode* insert_tmp_node = pRawTemplate->FindChild("#dataview-controls-insert", true, true);
			if(insert_tmp_node != NULL)
			{
				CWNode* insert_node = new CWNode();
				insert_node->CopyFrom(insert_tmp_node);

				// modify insert node here
				string insert_link = "{{pathFor \'" + InsertRoute + "\'}}";
				insert_node->Replace("INSERT_LINK", insert_link, true, true);

				controls_dest_node->AddChild(insert_node);
			}
		}

		// create search control
		if(search_field_count > 0)
		{
			CWNode* search_tmp_node = pRawTemplate->FindChild("#dataview-controls-search", true, true);
			if(search_tmp_node != NULL)
			{
				CWNode* search_node = new CWNode();
				search_node->CopyFrom(search_tmp_node);

				// modify search node here
				controls_dest_node->AddChild(search_node);
			}
		}

		// create export control
		if(export_field_count > 0)
		{
			CWNode* export_tmp_node = pRawTemplate->FindChild("#dataview-controls-export", true, true);
			if(export_tmp_node != NULL)
			{
				CWNode* export_node = new CWNode();
				export_node->CopyFrom(export_tmp_node);

				// modify export node here
				controls_dest_node->AddChild(export_node);
			}
		}
	}
	// ---

	string insert_button_title = InsertButtonTitle;
	if(insert_button_title == "") insert_button_title = "Add new";

	string insert_button_class = "";
	string insert_button_class_helper = "";

	if(App()->UseAccounts && collection_name != "users")
	{
		insert_button_class = "{{insertButtonClass}}";

		insert_button_class_helper.append("\"insertButtonClass\": function() {");
		insert_button_class_helper.append(LINE_TERM);
		insert_button_class_helper.append("\t\treturn COLLECTION_VARIABLE.userCanInsert(Meteor.userId(), {}) ? \"\" : \"hidden\";");
		insert_button_class_helper.append(LINE_TERM);
		insert_button_class_helper.append("\t},");
	}

	string details_button_title = DetailsButtonTitle;
	if(details_button_title == "") details_button_title = "Details";

	string edit_button_title = EditButtonTitle;
	if(edit_button_title == "") edit_button_title = "Edit";

	string delete_button_title = DeleteButtonTitle;
	if(delete_button_title == "") delete_button_title = "Delete";


	if(search_engine_style) {
		if(controls_dest_node != NULL) {
			CWNode* controls_parent = pHTML->FindParentOfChild(controls_dest_node);
			if(controls_parent != NULL) {
				CWNode* engine_tmp_node = pRawTemplate->FindChild("#search-engine-form", true, true);
				if(engine_tmp_node != NULL) {
					CWNode* engine_node = new CWNode();
					engine_node->CopyFrom(engine_tmp_node);

					controls_parent->AppendTextBeforeChild("{{#if searchString}}", controls_dest_node);
					controls_parent->AddChild(engine_node, "{{else}}", "{{/if}}");
				}
			}
		}
	}

	pHTML->Replace("TEXT_IF_EMPTY", text_if_empty, true, true);
	pHTML->Replace("TEXT_IF_NOT_FOUND", text_if_not_found, true, true);
	pHTML->Replace("DELETE_CONFIRMATION_MESSAGE", delete_confirmation_message, true, true);
	pHTML->Replace("INSERT_BUTTON_TITLE", insert_button_title, true, true);
	pHTML->Replace("DETAILS_BUTTON_TITLE", details_button_title, true, true);
	pHTML->Replace("EDIT_BUTTON_TITLE", edit_button_title, true, true);
	pHTML->Replace("DELETE_BUTTON_TITLE", delete_button_title, true, true);

	pHTML->Replace("SEARCH_STRING_SESSION_VAR", search_string_session_var, true, true);
	pHTML->Replace("SEARCH_FIELDS_SESSION_VAR", search_fields_session_var, true, true);
	pHTML->Replace("SORT_BY_SESSION_VAR", sort_by_session_var, true, true);
	pHTML->Replace("SORT_ASCENDING_SESSION_VAR", sort_ascending_session_var, true, true);
	pHTML->Replace("PAGE_NO_SESSION_VAR", page_no_session_var, true, true);
	pHTML->Replace("PAGE_SIZE_SESSION_VAR", page_size_session_var, true, true);
	pHTML->Replace("PAGE_COUNT_VAR", page_count_var, true, true);
	pHTML->Replace("EXPORT_METHOD_NAME", export_method_name, true, true);
	pHTML->Replace("/*EXPORT_PARAMS*/", export_vars.GetText(), true, true);
	pHTML->Replace("/*EXPORT_ARGUMENTS*/", export_arguments, true, true);
	pHTML->Replace("EXPORT_FUNCTION", export_function, true, true);

	pHTML->Replace("INSERT_ROUTE", InsertRoute, true, true);
	pHTML->Replace("DETAILS_ROUTE", DetailsRoute, true, true);
	pHTML->Replace("EDIT_ROUTE", EditRoute, true, true);
	pHTML->Replace("DELETE_ROUTE", DeleteRoute, true, true);

	pHTML->Replace("INSERT_BUTTON_CLASS", insert_button_class, true, true);

	pHTML->Replace("VIEW_STYLE_SESSION_VAR", view_style_session_var, true, true);
	pHTML->Replace("INITIAL_VIEW_STYLE", initial_view_style, true, true);

	ReplaceSubString(pJS, "/*INSERT_BUTTON_CLASS_HELPER*/", insert_button_class_helper);

	ReplaceStrings->Add(string("TEXT_IF_EMPTY=") + text_if_empty);
	ReplaceStrings->Add(string("TEXT_IF_NOT_FOUND=") + text_if_not_found);
	ReplaceStrings->Add(string("DELETE_CONFIRMATION_MESSAGE") + delete_confirmation_message);

	ReplaceStrings->Add(string("INSERT_BUTTON_TITLE=") + insert_button_title);
	ReplaceStrings->Add(string("DETAILS_BUTTON_TITLE=") + details_button_title);
	ReplaceStrings->Add(string("EDIT_BUTTON_TITLE=") + edit_button_title);
	ReplaceStrings->Add(string("DELETE_BUTTON_TITLE=") + delete_button_title);

	ReplaceStrings->Add(string("SEARCH_STRING_SESSION_VAR=") + search_string_session_var);
	ReplaceStrings->Add(string("SEARCH_FIELDS_SESSION_VAR=") + search_fields_session_var);
	ReplaceStrings->Add(string("SORT_BY_SESSION_VAR=") + sort_by_session_var);
	ReplaceStrings->Add(string("SORT_ASCENDING_SESSION_VAR=") + sort_ascending_session_var);
	ReplaceStrings->Add(string("PAGE_NO_SESSION_VAR=") + page_no_session_var);
	ReplaceStrings->Add(string("PAGE_SIZE_SESSION_VAR=") + page_size_session_var);
	ReplaceStrings->Add(string("PAGE_COUNT_VAR=") + page_count_var);
	ReplaceStrings->Add(string("EXPORT_METHOD_NAME=") + export_method_name);
	ReplaceStrings->Add(string("/*EXPORT_PARAMS*/=") + export_vars.GetText());
	ReplaceStrings->Add(string("/*EXPORT_ARGUMENTS*/=") + export_arguments);
	ReplaceStrings->Add(string("EXPORT_FUNCTION=") + export_function);

	ReplaceStrings->Add(string("/*INSERT_ROUTE_PARAMS*/=") + InsertRouteParams->AsString());
	ReplaceStrings->Add(string("/*DETAILS_ROUTE_PARAMS*/=") + DetailsRouteParams->AsString());
	ReplaceStrings->Add(string("/*EDIT_ROUTE_PARAMS*/=") + EditRouteParams->AsString());
	ReplaceStrings->Add(string("/*DELETE_ROUTE_PARAMS*/=") + DeleteRouteParams->AsString());

	if(InsertRoute != "") ReplaceStrings->Add(string("/*INSERT_ROUTE*/=") + "Router.go(\"" + InsertRoute + "\", mergeObjects(Router.currentRouteParams(), {" + InsertRouteParams->AsString() + "}));");
	if(DetailsRoute != "") ReplaceStrings->Add(string("/*DETAILS_ROUTE*/=") + "Router.go(\"" + DetailsRoute + "\", mergeObjects(Router.currentRouteParams(), {" + DetailsRouteParams->AsString() + "}));");
	if(EditRoute != "") ReplaceStrings->Add(string("/*EDIT_ROUTE*/=") + "Router.go(\"" + EditRoute + "\", mergeObjects(Router.currentRouteParams(), {" + EditRouteParams->AsString() + "}));");
	if(DeleteRoute != "") ReplaceStrings->Add(string("/*DELETE_ROUTE*/=") + "Router.go(\"" + DeleteRoute + "\", mergeObjects(Router.currentRouteParams(), {" + DeleteRouteParams->AsString() + "}));");


	ReplaceStrings->Add(string("INSERT_ROUTE=") + InsertRoute);
	ReplaceStrings->Add(string("DETAILS_ROUTE=") + DetailsRoute);
	ReplaceStrings->Add(string("EDIT_ROUTE=") + EditRoute);
	ReplaceStrings->Add(string("DELETE_ROUTE=") + DeleteRoute);

	ReplaceStrings->Add(string("VIEW_STYLE_SESSION_VAR=") + view_style_session_var);
	ReplaceStrings->Add(string("INITIAL_VIEW_STYLE=") + initial_view_style);

	ReplaceStrings->Add(string("/*SEARCH_FIELDS*/=") + search_fields);
	ReplaceStrings->Add(string("/*EXPORT_FIELDS*/=") + export_fields);
	ReplaceStrings->Add(string("DEFAULT_PAGE_SIZE") + IntToStr(PageSize));

	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	return true;
}

bool CWDataView::CreateTableReact(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	string frontend = App()->FrontendName();

	CWArray<CWField*> *collection_fields = GetFields();
	string collection_name = GetCollectionName();

	string data_template_name = TemplateName() + "Table";
	string data_items_template_name = data_template_name + "Items";

	// ---
	// create table
	// ---
	string data_source_html = AddSuffixToFileName(ChangeFileExt(TemplateFile(), ".jsx"), "_table");
	CWNode* data_node = new CWNode();
	if(!LoadJSX(data_source_html, data_node, pErrorMessage))
		return false;

	string data_source_items_html = AddSuffixToFileName(data_source_html, "_items");
	CWNode* data_source_items_node = new CWNode();
	if(!LoadJSX(data_source_items_html, data_source_items_node, pErrorMessage))
		return false;

	CWNode* data_source_node = data_node->FindChild("#dataview-table", true, true);
	if(data_source_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Table template node not found.";
		return false;
	}

	CWNode* table_node = data_node->FindChild("table", true, true);
	if(table_node != NULL)
	{
		if(DetailsRoute != "")
		{
			if(frontend == "bootstrap3") table_node->AddClass("table-hover");
			if(frontend == "semantic-ui") table_node->AddClass("selectable");
		}
	}
	// ---

	CWNode* items_node = data_source_node->FindChild("TEMPLATE_NAME_TABLE_ITEMS", true, true);
	if(items_node != NULL) {
		items_node->Name = data_items_template_name;
	}

	// ---
	// create table header
	// ---
	for(int i = 0; i < collection_fields->Count(); i++)
	{
		CWField* field = collection_fields->Items[i];
		if(field->ShowInDataview)
		{
			string field_name = field->Name;
			string field_title = field->Title;
			if(field_title == "") field_title = field_name;
			bool field_sortable = field->Sortable;

			string field_tmp_node_id = "#dataview-table-header-cell";
			CWNode* field_tmp_node = data_node->FindChild(field_tmp_node_id, true, true);
			if(field_tmp_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data header cell source node \"" + field_tmp_node_id + "\" not found.";
				return false;
			}

			CWNode* field_source_node = new CWNode();
			field_source_node->CopyFrom(field_tmp_node);
			field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

			field_source_node->Replace("FIELD_TITLE", field_title, true, true);
			if(field_sortable)
			{
				field_source_node->AddClass("th-sortable");
				field_source_node->Attr->SetValue("data-sort", field_name);
				field_source_node->Attr->SetValue("onClick", "{this.onSort}");
			}

			string field_dest_node_id = "#dataview-table-header-row";
			CWNode* field_dest_node = data_source_node->FindChild(field_dest_node_id, true, true);
			if(field_dest_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data header cell dest node \"" + field_dest_node_id + "\" not found.";
				return false;
			}

			field_dest_node->AddChild(field_source_node);
		}
	}

	// column for edit button
	if(EditRoute != "")
	{
		string field_dest_node_id = "#dataview-table-header-row";
		CWNode* field_dest_node = data_node->FindChild(field_dest_node_id, true, true);
		if(field_dest_node == NULL)
		{
			if(pErrorMessage) *pErrorMessage = "Data header cell dest node \"" + field_dest_node_id + "\" not found.";
			return false;
		}

		field_dest_node->AddChild("th", "&nbsp;");
	}

	// column for delete button
	if(InsertRoute != "" && collection_name != "users")
	{
		string field_dest_node_id = "#dataview-table-header-row";
		CWNode* field_dest_node = data_source_node->FindChild(field_dest_node_id, true, true);
		if(field_dest_node == NULL)
		{
			if(pErrorMessage) *pErrorMessage = "Data header cell dest node \"" + field_dest_node_id + "\" not found.";
			return false;
		}

		field_dest_node->AddChild("th", "&nbsp;");
	}
	// ---

	// columns for custom item actions
	int item_actions_count = ItemActions->Count();
	if(item_actions_count > 0) {
		for(int i = 0; i < item_actions_count; i++) {
			string field_dest_node_id = "#dataview-table-header-row";
			CWNode* field_dest_node = data_source_node->FindChild(field_dest_node_id, true, true);
			if(field_dest_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data header cell dest node \"" + field_dest_node_id + "\" not found.";
				return false;
			}
			field_dest_node->AddChild("th", "&nbsp;");
		}
	}

	// ---
	// create table items
	// ---
	string items_data_source_html = AddSuffixToFileName(data_source_html, "_items_data");
	CWNode* items_data_source_node = new CWNode();
	if(!LoadJSX(items_data_source_html, items_data_source_node, pErrorMessage))
		return false;

	if(items_data_source_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Items template node not found.";
		return false;
	}

	for(int i = 0; i < collection_fields->Count(); i++)
	{
		CWField* field = collection_fields->Items[i];
		if(field->ShowInDataview)
		{
			string field_name = field->Name;
			string field_type = field->Type;
			string field_format = field->Format;
			string display_helper = field->DisplayHelper;
			string field_input = field->Input;
			bool field_edit_inline = field->EditInline;

			string field_tmp_node_id = "#dataview-table-items-cell";
			if(field_edit_inline) {
				if(field_input == "checkbox") field_tmp_node_id = "#dataview-table-items-checkbox-cell";
			}

			CWNode* field_tmp_node = items_data_source_node->FindChild(field_tmp_node_id, true, true);
			if(field_tmp_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data items cell source node \"" + field_tmp_node_id + "\" not found.";
				return false;
			}

			CWNode* field_source_node = new CWNode();
			field_source_node->CopyFrom(field_tmp_node);
			field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

			string field_value = "{this.props.data." + field_name + "}";
			if(field_type == "bool") field_value = "{this.props.data." + field_name + " ? \"Yes\" : \"No\"}";
			if(field_type == "file") field_value = "{this.props.data." + field_name + ".url}";
			if(field_type == "time") field_value = "{dateUtils.secondsToTime(this.props.data." + field_name + ", \"" + field_format + "\"}";
			if(field_type == "date") field_value = "{dateUtils.formatDate(this.props.data." + field_name + ", \"" + field_format + "\")}";
			if(display_helper != "") field_value = "{" + display_helper + "(this.props.data." + field_name + ", this.props.data)}";

			field_source_node->Replace("FIELD_VALUE", field_value, true, true);
			field_source_node->Replace("FIELD_NAME", field_name, true, true);

			string details_link = "{pathFor(\"" + DetailsRoute + "\")}";
			field_source_node->Replace("DETAILS_LINK", details_link, true, true);

			string field_dest_node_id = "#dataview-table-items-row";
			CWNode* field_dest_node = data_source_items_node->FindChild(field_dest_node_id, true, true);
			if(field_dest_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data items cell dest node \"" + field_dest_node_id + "\" not found.";
				return false;
			}

			field_dest_node->AddChild(field_source_node);
		}
	}

	// edit button
	if(EditRoute != "")
	{
		string field_tmp_node_id = "#dataview-table-items-edit-cell";
		CWNode* field_tmp_node = items_data_source_node->FindChild(field_tmp_node_id, true, true);
		if(field_tmp_node != NULL)
		{
			CWNode* field_source_node = new CWNode();
			field_source_node->CopyFrom(field_tmp_node);
			field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

			string field_dest_node_id = "#dataview-table-items-row";
			CWNode* field_dest_node = data_source_items_node->FindChild(field_dest_node_id, true, true);
			if(field_dest_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data items cell dest node \"" + field_dest_node_id + "\" not found.";
				return false;
			}

			field_dest_node->AddChild(field_source_node);
		}
	}
	// ---

	// delete button
	if(InsertRoute != "" && collection_name != "users")
	{
		string field_tmp_node_id = "#dataview-table-items-delete-cell";
		CWNode* field_tmp_node = items_data_source_node->FindChild(field_tmp_node_id, true, true);
		if(field_tmp_node != NULL)
		{
			CWNode* field_source_node = new CWNode();
			field_source_node->CopyFrom(field_tmp_node);
			field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

			string field_dest_node_id = "#dataview-table-items-row";
			CWNode* field_dest_node = data_source_items_node->FindChild(field_dest_node_id, true, true);
			if(field_dest_node == NULL)
			{
				if(pErrorMessage) *pErrorMessage = "Data items cell dest node \"" + field_dest_node_id + "\" not found.";
				return false;
			}

			field_dest_node->AddChild(field_source_node);
		}
	}
	
	CWStringList parent_data_for_items;

	// columns for custom item actions
	string item_actions_code = "";
	string item_actions_enabled_code = "";
	if(item_actions_count > 0) {
		for(int i = 0; i < item_actions_count; i++) {
			CWAction* item_action = ItemActions->Items[i];
			string field_tmp_node_id = "#dataview-table-items-action-cell-icon";

			string item_action_title = item_action->Title;
			if(item_action_title == "") item_action_title = item_action->Name;
			
			if(item_action->IconClass == "") {
				field_tmp_node_id = "#dataview-table-items-action-cell-button";
			}

			CWNode* field_tmp_node = items_data_source_node->FindChild(field_tmp_node_id, true, true);

			if(field_tmp_node != NULL)
			{
				CWNode* field_source_node = new CWNode();
				field_source_node->CopyFrom(field_tmp_node);
				field_source_node->Attr->Delete(field_source_node->Attr->FindName("id"));

				string item_action_enabled_start = "";
				string item_action_enabled_end = "";
				if(item_action->Rule != "") {
					string item_action_enabled_helper = "isEnabled" + ToCamelCase(item_action->Name, '_', true);
					item_action_enabled_start = "{this." + item_action_enabled_helper + "() ? ";
					item_action_enabled_end = " : null}";

					string item_action_enabled_code = "";
					item_action_enabled_code.append(item_action_enabled_helper + "() {");
					item_action_enabled_code.append(LINE_TERM);
					
					string item_action_rule = item_action->Rule;
					ReplaceSubString(&item_action_rule, "PARENT_DATA", "this.props.parentData");
					item_action_enabled_code.append("return !!(" + item_action_rule + ");");
					item_action_enabled_code.append(LINE_TERM);
					
					item_action_enabled_code.append("}");
					item_action_enabled_code.append(LINE_TERM);
					item_actions_enabled_code.append(item_action_enabled_code);
				}

				field_source_node->Replace("ACTION_ENABLED_HELPER_START", item_action_enabled_start, true, true);
				field_source_node->Replace("ACTION_ENABLED_HELPER_END", item_action_enabled_end, true, true);
				field_source_node->Replace("ACTION_NAME", item_action->Name, true, true);
				field_source_node->Replace("ACTION_ICON_CLASS", item_action->IconClass, true, true);
				field_source_node->Replace("ACTION_TITLE", item_action_title, true, true);

				string item_action_event_name = ToCamelCase("on_item_" + item_action->Name, '_', false);
				CWNode* field_source_node_first_child = field_source_node->Childs->Count() ? field_source_node->Childs->Items[0] : field_source_node;
				field_source_node_first_child->Attr->SetValue("onClick", "{this." + item_action_event_name + "}");


				string field_dest_node_id = "#dataview-table-items-row";
				CWNode* field_dest_node = data_source_items_node->FindChild(field_dest_node_id, true, true);
				if(field_dest_node == NULL)
				{
					if(pErrorMessage) *pErrorMessage = "Data items cell dest node \"" + field_dest_node_id + "\" not found.";
					return false;
				}

				field_dest_node->AddChild(field_source_node);
				
				if(AddItemBindings->Find(item_action_event_name) < 0) {
					AddItemBindings->Add(item_action_event_name);
				}

				string item_action_code = "";
				item_action_code.append(item_action_event_name + "(e) {");
				item_action_code.append(LINE_TERM);

				string item_action_action_code = item_action->ActionCode;
				ReplaceSubString(&item_action_action_code, "PARENT_DATA", "this.props.parentData");
				item_action_code.append(item_action_action_code);
				item_action_code.append(LINE_TERM);

				item_action_code.append("}");
				item_action_code.append(LINE_TERM);
				item_action_code.append(LINE_TERM);

				item_actions_code.append(item_action_code);

				ExtractDataMembers(item_action->Rule, "PARENT_DATA", &parent_data_for_items);
				ExtractDataMembers(item_action->ActionCode, "PARENT_DATA", &parent_data_for_items);
			}
		}
	}

    string on_item_clicked_code = OnItemClickedCode;

	string edit_button_class = "";
	string delete_button_class = "";

	string edit_button_class_helper = "";
	string delete_button_class_helper = "";

	if(App()->UseAccounts)
	{
		edit_button_class = "${this.editButtonClass()}";
		delete_button_class = "${this.deleteButtonClass()}";

		edit_button_class_helper.append("editButtonClass() {");
		edit_button_class_helper.append(LINE_TERM);
		if(collection_name == "users")
			edit_button_class_helper.append("\t\treturn Users.isAdmin(Meteor.userId()) ? \"\" : \"hidden\";");
		else
			edit_button_class_helper.append("\t\treturn COLLECTION_VARIABLE.userCanUpdate(Meteor.userId(), this.props.data) ? \"\" : \"hidden\";");
		edit_button_class_helper.append(LINE_TERM);
		edit_button_class_helper.append("\t}");

		delete_button_class_helper.append("deleteButtonClass() {");
		delete_button_class_helper.append(LINE_TERM);
		if(collection_name == "users")
			delete_button_class_helper.append("\t\treturn Users.isAdmin(Meteor.userId()) ? \"\" : \"hidden\";");
		else
			delete_button_class_helper.append("\t\treturn COLLECTION_VARIABLE.userCanRemove(Meteor.userId(), this.props.data) ? \"\" : \"hidden\";");
		delete_button_class_helper.append(LINE_TERM);
		delete_button_class_helper.append("\t}");
	}

	string details_button_title = DetailsButtonTitle;
	if(details_button_title == "") details_button_title = "Details";

	string edit_button_title = EditButtonTitle;
	if(edit_button_title == "") edit_button_title = "Edit";

	string delete_button_title = DeleteButtonTitle;
	if(delete_button_title == "") delete_button_title = "Delete";

	data_source_items_node->Replace("DETAILS_BUTTON_TITLE", details_button_title, true, true);
	data_source_items_node->Replace("EDIT_BUTTON_TITLE", edit_button_title, true, true);
	data_source_items_node->Replace("DELETE_BUTTON_TITLE", delete_button_title, true, true);

	data_source_items_node->Replace("/*ON_ITEM_CLICKED_CODE*/", on_item_clicked_code, true, true);
	data_source_items_node->Replace("/*EDIT_BUTTON_CLASS_HELPER*/", edit_button_class_helper, true, true);
	data_source_items_node->Replace("/*DELETE_BUTTON_CLASS_HELPER*/", delete_button_class_helper, true, true);
	data_source_items_node->Replace("EDIT_BUTTON_CLASS", edit_button_class, true, true);
	data_source_items_node->Replace("DELETE_BUTTON_CLASS", delete_button_class, true, true);

//	pParentHTML->Replace("DELETE_CONFIRMATION_MESSAGE", delete_confirmation_message, true, true);


	// ---


	// insert into parent
//	pRootHTML->AddChild(data_source_node);
//	pRootHTML->AddChild(data_items_data_source_node);

	string items_parent_data = "";
	for(int i = 0; i < parent_data_for_items.Count(); i++) {
		if(items_parent_data != "") {
			items_parent_data.append(", ");
		}
		items_parent_data.append(parent_data_for_items.Strings[i] + ": this.props.data." + parent_data_for_items.Strings[i]);
	}

	string dest_node_id = "#dataview-data-table";
	CWNode* dest_node = pParentHTML->FindChild(dest_node_id, true, true);
	if(dest_node == NULL) {
		if(pErrorMessage) *pErrorMessage = "Table destination node \"" + dest_node_id + "\" not found.";
		return false;		
	}

	dest_node->AddChild(data_source_node);

	pParentHTML->AddChild(data_source_items_node);

	pParentHTML->Replace("/*ITEM_ACTIONS_CODE*/", item_actions_code, true, true);
	pParentHTML->Replace("/*ITEM_ACTIONS_HELPER_CODE*/", item_actions_enabled_code, true, true);
	pParentHTML->Replace("TEMPLATE_NAME_TABLE_ITEMS", data_items_template_name, true, true);
	pParentHTML->Replace("/*ITEMS_PARENT_DATA*/", items_parent_data, true, true);

	return true;
}


bool CWDataView::CreateBlogReact(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	string frontend = App()->FrontendName();

	CWArray<CWField*> *collection_fields = GetFields();
	string collection_name = GetCollectionName();

	string delete_confirmation_message = DeleteConfirmationMessage;
	if(delete_confirmation_message == "") delete_confirmation_message = "Delete? Are you sure?";

	// ---
	// create blog container
	// ---
	string data_source_html = AddSuffixToFileName(ChangeFileExt(TemplateFile(), ".jsx"), "_blog");
	CWNode* data_node = new CWNode();
	if(!LoadJSX(data_source_html, data_node, pErrorMessage))
		return false;

	CWNode* data_source_node = data_node->FindChild(".blog-container", true, true);
	if(data_source_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Blog template node not found.";
		return false;
	}

	string data_template_name = TemplateName() + "Blog";
	string data_items_template_name = data_template_name + "Items";
/*
	string data_dest_node_id = "#dataview-data";
	CWNode* data_dest_node = pParentHTML->FindChild(data_dest_node_id, true, true);
	if(data_dest_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Data destination node \"" + data_dest_node_id + "\" not found.";
		return false;
	}
	data_dest_node->AppendText("{{#if viewAsBlog}} {{> " + data_template_name + "}} {{/if}}");
*/

//	ReplaceSubString(&data_js, "TEMPLATE_NAME", data_template_name);

	CWNode* items_node = data_source_node->FindChild("TEMPLATE_NAME_BLOG_ITEMS", true, true);
	if(items_node != NULL) {
		items_node->Name = data_items_template_name;
	}

	// ---
	// create items
	// ---
	string data_items_source_html = AddSuffixToFileName(data_source_html, "_items");
	CWNode* data_items_node = new CWNode();
	if(!LoadJSX(data_items_source_html, data_items_node, pErrorMessage))
		return false;

	CWNode* data_items_source_node = data_items_node;
	if(data_items_source_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Data items template node not found.";
		return false;
	}

	CWNode* blog_title_node = data_items_source_node->FindChild(".blog-title", true, true);
	CWNode* blog_subtitle_node = data_items_source_node->FindChild(".blog-subtitle", true, true);
	CWNode* blog_text_node = data_items_source_node->FindChild(".blog-text", true, true);
	CWNode* blog_date_node = data_items_source_node->FindChild(".blog-date", true, true);
	bool got_title = false;
	bool got_subtitle = false;
	bool got_text = false;
	bool got_date = false;

	for(int i = 0; i < collection_fields->Count(); i++)
	{
		CWField* field = collection_fields->Items[i];
		string field_name = field->Name;
		string field_type = field->Type;
		string field_format = field->Format;
		string display_helper = field->DisplayHelper;
		string field_input = field->Input;
		string field_value = "{this.props.data." + field_name + "}";

		if(field->RoleInBlog == "title" && blog_title_node != NULL) {
			if(field_type == "file") field_value = "{this.props.data." + field_name + ".url}";
			if(field_type == "time") field_value = "{dateUtils.secondsToTime(this.props.data." + field_name + ", \"" + field_format + "\"}";
			if(field_type == "date") field_value = "{dateUtils.formatDate(this.props.data." + field_name + ", \"" + field_format + "\")}";
			if(display_helper != "") field_value = "{" + display_helper + "(this.props.data." + field_name + ", this.props.data)}";

			blog_title_node->AppendText(field_value);
			got_title = true;
		}
		if(field->RoleInBlog == "subtitle" && blog_subtitle_node != NULL) {
			if(field_type == "file") field_value = "{this.props.data." + field_name + ".url}";
			if(field_type == "time") field_value = "{dateUtils.secondsToTime(this.props.data." + field_name + ", \"" + field_format + "\"}";
			if(field_type == "date") field_value = "{dateUtils.formatDate(this.props.data." + field_name + ", \"" + field_format + "\")}";
			if(display_helper != "") field_value = "{" + display_helper + "(this.props.data." + field_name + ", this.props.data)}";
			blog_subtitle_node->AppendText(field_value);
			got_subtitle = true;
		}
		if(field->RoleInBlog == "text" && blog_text_node != NULL) {
			if(field_type == "file") field_value = "{this.props.data." + field_name + ".url}";
			if(field_type == "time") field_value = "{dateUtils.secondsToTime(this.props.data." + field_name + ", \"" + field_format + "\"}";
			if(field_type == "date") field_value = "{dateUtils.formatDate(this.props.data." + field_name + ", \"" + field_format + "\")}";
			if(display_helper != "") field_value = "{" + display_helper + "(this.props.data." + field_name + ", this.props.data)}";
			blog_text_node->AppendText(field_value);
			got_text = true;
		}
		if(field->RoleInBlog == "date" && blog_date_node != NULL) {
			if(field_type == "file") field_value = "{this.props.data." + field_name + ".url}";
			if(field_type == "time") field_value = "{dateUtils.secondsToTime(this.props.data." + field_name + ", \"" + field_format + "\"}";
			if(field_type == "date") field_value = "{dateUtils.formatDate(this.props.data." + field_name + ", \"" + field_format + "\")}";
			if(display_helper != "") field_value = "{" + display_helper + "(this.props.data." + field_name + ", this.props.data)}";
			blog_date_node->AppendText(field_value);
			got_date = true;
		}
	}
	if(!got_title && blog_title_node != NULL) data_items_source_node->DeleteChild(blog_title_node, true);
	if(!got_subtitle && blog_subtitle_node != NULL) data_items_source_node->DeleteChild(blog_subtitle_node, true);
	if(!got_text && blog_text_node != NULL) data_items_source_node->DeleteChild(blog_text_node, true);
	if(!got_date && blog_date_node != NULL) data_items_source_node->DeleteChild(blog_date_node, true);


	bool got_details_control = false;
	bool got_edit_control = false;
	bool got_delete_control = false;

	CWNode* blog_controls_node = data_items_source_node->FindChild(".blog-controls", true, true);
	CWNode* blog_details_node = data_items_source_node->FindChild(".blog-details", true, true);
	CWNode* blog_edit_node = data_items_source_node->FindChild(".blog-edit", true, true);
	CWNode* blog_delete_node = data_items_source_node->FindChild(".blog-delete", true, true);

	// details button
	if(DetailsRoute == "") {
		if(blog_details_node != NULL) {
			data_items_source_node->DeleteChild(blog_details_node, true);
		}
	} else {
		got_details_control = true;
	}

	// edit button
	if(EditRoute == "") {
		if(blog_edit_node != NULL) {
			data_items_source_node->DeleteChild(blog_edit_node, true);
		}
	} else {
		got_edit_control = true;
	}

	// delete button
	if(InsertRoute == "" || collection_name == "users") {
		if(blog_delete_node != NULL) {
			data_items_source_node->DeleteChild(blog_delete_node, true);
		}
	} else {
		got_delete_control = true;
	}

	// remove controls container if no buttons
	if(!got_details_control && !got_edit_control && !got_delete_control && blog_controls_node != NULL) {
		data_items_source_node->DeleteChild(blog_controls_node, true);
	}

	// ---
/*
	string data_items_dest_node_id = ".blog-container";
	CWNode* data_items_dest_node = data_source_node->FindChild(data_items_dest_node_id, true, true);
	if(data_items_dest_node == NULL)
	{
		if(pErrorMessage) *pErrorMessage = "Data destination node \"" + data_items_dest_node_id + "\" not found.";
		return false;
	}
	data_items_dest_node->AppendText("{{#each " + GetQueryName() + "}} {{> " + data_items_template_name + "}} {{/each}}");
*/

    string on_item_clicked_code = OnItemClickedCode;

	string edit_button_class = "";
	string delete_button_class = "";

	string edit_button_class_helper = "";
	string delete_button_class_helper = "";

	if(App()->UseAccounts)
	{
		edit_button_class = "${this.editButtonClass()}";
		delete_button_class = "${this.deleteButtonClass()}";

		edit_button_class_helper.append("editButtonClass() {");
		edit_button_class_helper.append(LINE_TERM);
		if(collection_name == "users")
			edit_button_class_helper.append("\t\treturn Users.isAdmin(Meteor.userId()) ? \"\" : \"hidden\";");
		else
			edit_button_class_helper.append("\t\treturn COLLECTION_VARIABLE.userCanUpdate(Meteor.userId(), this.props.data) ? \"\" : \"hidden\";");
		edit_button_class_helper.append(LINE_TERM);
		edit_button_class_helper.append("\t}");

		delete_button_class_helper.append("deleteButtonClass() {");
		delete_button_class_helper.append(LINE_TERM);
		if(collection_name == "users")
			delete_button_class_helper.append("\t\treturn Users.isAdmin(Meteor.userId()) ? \"\" : \"hidden\";");
		else
			delete_button_class_helper.append("\t\treturn COLLECTION_VARIABLE.userCanRemove(Meteor.userId(), this.props.data) ? \"\" : \"hidden\";");
		delete_button_class_helper.append(LINE_TERM);
		delete_button_class_helper.append("\t}");
	}

	string details_button_title = DetailsButtonTitle;
	if(details_button_title == "") details_button_title = "Details";

	string edit_button_title = EditButtonTitle;
	if(edit_button_title == "") edit_button_title = "Edit";

	string delete_button_title = DeleteButtonTitle;
	if(delete_button_title == "") delete_button_title = "Delete";

	data_items_source_node->Replace("DETAILS_BUTTON_TITLE", details_button_title, true, true);
	data_items_source_node->Replace("EDIT_BUTTON_TITLE", edit_button_title, true, true);
	data_items_source_node->Replace("DELETE_BUTTON_TITLE", delete_button_title, true, true);

	data_items_source_node->Replace("/*EDIT_BUTTON_CLASS_HELPER*/", edit_button_class_helper, true, true);
	data_items_source_node->Replace("/*DELETE_BUTTON_CLASS_HELPER*/", delete_button_class_helper, true, true);

	data_items_source_node->Replace("EDIT_BUTTON_CLASS", edit_button_class, true, true);
	data_items_source_node->Replace("DELETE_BUTTON_CLASS", delete_button_class, true, true);


//	ReplaceSubString(&data_items_js, "TEMPLATE_NAME", data_items_template_name);
	data_items_source_node->Replace("/*ON_ITEM_CLICKED_CODE*/", on_item_clicked_code, true, true);
//	ReplaceSubString(&data_items_js, "DELETE_CONFIRMATION_MESSAGE", delete_confirmation_message);
/*
	// insert into parent
	pRootHTML->AddChild(data_source_node);

	pRootHTML->AddChild(data_items_source_node);
*/

	string dest_node_id = "#dataview-data-blog";
	CWNode* dest_node = pRootHTML->FindChild(dest_node_id, true, true);
	if(dest_node == NULL) {
		if(pErrorMessage) *pErrorMessage = "Blog destination node \"" + dest_node_id + "\" not found.";
		return false;		
	}

	dest_node->AddChild(data_source_node);
	
	pParentHTML->AddChild(data_items_node);

	pParentHTML->Replace("TEMPLATE_NAME_BLOG_ITEMS", data_items_template_name, true, true);


	return true;
}

bool CWDataView::CreateListReact(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage)
{
	return true;
}

bool CWDataView::CreateCardsReact(CWNode* pRootHTML, CWNode* pHTML, string* pParentJS, string* pErrorMessage)
{
	return true;
}

bool CWDataView::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string query_var = ToCamelCase(GetQueryName(), '_', true);
	string search_string_session_var = query_var + "SearchString";
	string search_fields_session_var = query_var + "SearchFields";
	string sort_by_session_var = query_var + "SortBy";
	string sort_ascending_session_var = query_var + "SortAscending";
	string page_no_session_var = query_var + "PageNo";
	string page_size_session_var = query_var + "PageSize";
	string page_count_var = FromCamelCase(query_var + "PageCount", '_', true);
	string export_method_name = ToCamelCase(GetQueryName() + "_export", '_', false);

	string view_style_session_var = TemplateName() + "Style";
	string export_function = TemplateName() + "Export";
	CWArray<CWField*> *collection_fields = GetFields();
	string collection_name = GetCollectionName();
	string text_if_empty = TextIfEmpty;
	string text_if_not_found = TextIfNotFound;
	string delete_confirmation_message = DeleteConfirmationMessage;

	bool search_engine_style = SearchEngineStyle;

	string export_arguments = "";
	CWStringList export_vars;
	if(Subscription != NULL) {
		Subscription->GetSubscriptionArguments(App(), false, &export_arguments, &export_vars);
	}

	if(text_if_empty == "") text_if_empty = "Empty.";
	if(text_if_not_found == "") text_if_not_found = "{\"\\\"\" + Session.get(\"" + search_string_session_var + "\") + \"\\\" not found.\"}";
	if(delete_confirmation_message == "") delete_confirmation_message = "Delete? Are you sure?";
	// load controls template
	CWNode controls_template;
	string html_controls_template_file = ChangeFileExt(AddSuffixToFileName(TemplateFile(), "_controls"), ".jsx");
	if(!LoadJSX(html_controls_template_file, &controls_template, pErrorMessage))
		return false;

	//---
	// Create views
	//---
	string initial_view_style = "";
	CWStringList view_styles;
	view_styles.Assign(Views);
	int view_count = view_styles.Count();
	for(int i = view_count - 1; i >= 0; i--)
		if(view_styles.Strings[i] != "table" && view_styles.Strings[i] != "blog" && view_styles.Strings[i] != "cards" && view_styles.Strings[i] != "list")
			view_styles.Delete(i);
	if(view_styles.Count() == 0) view_styles.Add("table");
	for(int i = 0; i < view_styles.Count(); i++)
	{
		string view_style = view_styles.Strings[i];
		if(i == 0) initial_view_style = view_style;

		if(view_style == "table" && !CreateTableReact(pRootHTML, pHTML, pJS, pErrorMessage)) return false;
		if(view_style == "blog" && !CreateBlogReact(pRootHTML, pHTML, pJS, pErrorMessage)) return false;
		if(view_style == "list" && !CreateListReact(pRootHTML, pHTML, pJS, pErrorMessage)) return false;
		if(view_style == "cards" && !CreateCardsReact(pRootHTML, pHTML, pJS, pErrorMessage)) return false;
	}
	// ---

	// search fields
	string search_fields = "";
	int search_field_count = 0;
	for(int i = 0; i < collection_fields->Count(); i++)
	{
		CWField* field = collection_fields->Items[i];
		if(field != NULL)
		{
			if(field->Searchable)
			{
				if(search_field_count > 0)
					search_fields.append(", ");
				search_fields.append("\"" + field->Name + "\"");
				search_field_count++;
			}
		}
	}
	
	if(search_field_count == 0) {
		search_engine_style = false;
	}

	// export fields
	string export_fields = "";
	int export_field_count = 0;
	for(int i = 0; i < collection_fields->Count(); i++)
	{
		CWField* field = collection_fields->Items[i];
		if(field != NULL)
		{
			if(field->Exportable)
			{
				if(export_field_count > 0)
					export_fields.append(", ");
				export_fields.append("\"" + field->Name + "\"");
				export_field_count++;
			}
		}
	}

	// ---
	// create controls
	// ---
	CWNode* controls_dest_node = pHTML->FindChild("#dataview-controls", true, true);
	if(controls_dest_node != NULL)
	{
		// create insert control
		if(InsertRoute != "")
		{
			CWNode* insert_tmp_node = controls_template.FindChild("#dataview-controls-insert", true, true);
			if(insert_tmp_node != NULL)
			{
				CWNode* insert_node = new CWNode();
				insert_node->CopyFrom(insert_tmp_node);

				// modify insert node here
				string insert_link = "{pathFor(\"" + InsertRoute + "\")}";
				insert_node->Replace("INSERT_LINK", insert_link, true, true);

				controls_dest_node->AddChild(insert_node);
			}
		}

		// create search control
		if(search_field_count > 0)
		{
			CWNode* search_tmp_node = controls_template.FindChild("#dataview-controls-search", true, true);
			if(search_tmp_node != NULL)
			{
				CWNode* search_node = new CWNode();
				search_node->CopyFrom(search_tmp_node);

				// modify search node here
				controls_dest_node->AddChild(search_node);
			}
		}

		// create export control
		if(export_field_count > 0)
		{
			CWNode* export_tmp_node = controls_template.FindChild("#dataview-controls-export", true, true);
			if(export_tmp_node != NULL)
			{
				CWNode* export_node = new CWNode();
				export_node->CopyFrom(export_tmp_node);

				// modify export node here
				controls_dest_node->AddChild(export_node);
			}
		}
	}
	// ---

	string insert_button_title = InsertButtonTitle;
	if(insert_button_title == "") insert_button_title = "Add new";

	string insert_button_class = "";
	string insert_button_class_helper = "";

	if(App()->UseAccounts && collection_name != "users")
	{
		insert_button_class = "${this.insertButtonClass()}";

		insert_button_class_helper.append("insertButtonClass() {");
		insert_button_class_helper.append(LINE_TERM);
		insert_button_class_helper.append("\t\treturn COLLECTION_VARIABLE.userCanInsert(Meteor.userId(), {}) ? \"\" : \"hidden\";");
		insert_button_class_helper.append(LINE_TERM);
		insert_button_class_helper.append("\t}");
	}

	string details_button_title = DetailsButtonTitle;
	if(details_button_title == "") details_button_title = "Details";

	string edit_button_title = EditButtonTitle;
	if(edit_button_title == "") edit_button_title = "Edit";

	string delete_button_title = DeleteButtonTitle;
	if(delete_button_title == "") delete_button_title = "Delete";

	pHTML->Replace("/*INSERT_BUTTON_CLASS_HELPER*/", insert_button_class_helper, true, true);

	if(search_engine_style) {
		CWNode* controls_row = pHTML->FindChild("#controls-row", true, true);
		if(controls_row != NULL) {
			CWNode* controls_parent = pHTML->FindParentOfChild(controls_row);
			if(controls_parent != NULL) {
				CWNode* engine_tmp_node = controls_template.FindChild("#search-engine-form", true, true);
				if(engine_tmp_node != NULL) {
					CWNode* engine_node = new CWNode();
					engine_node->CopyFrom(engine_tmp_node);

					controls_parent->AppendTextBeforeChild("{!!Session.get(\"SEARCH_STRING_SESSION_VAR\") ? (<div>", controls_row);
					controls_parent->AddChild(engine_node, "</div>) : (", ")}");
				}
			}
		}
	}

	pHTML->Replace("TEXT_IF_EMPTY", text_if_empty, true, true);
	pHTML->Replace("TEXT_IF_NOT_FOUND", text_if_not_found, true, true);
	pHTML->Replace("DELETE_CONFIRMATION_MESSAGE", delete_confirmation_message, true, true);

	pHTML->Replace("INSERT_BUTTON_TITLE", insert_button_title, true, true);
	pHTML->Replace("DETAILS_BUTTON_TITLE", details_button_title, true, true);
	pHTML->Replace("EDIT_BUTTON_TITLE", edit_button_title, true, true);
	pHTML->Replace("DELETE_BUTTON_TITLE", delete_button_title, true, true);

	pHTML->Replace("SEARCH_STRING_SESSION_VAR", search_string_session_var, true, true);
	pHTML->Replace("SEARCH_FIELDS_SESSION_VAR", search_fields_session_var, true, true);
	pHTML->Replace("SORT_BY_SESSION_VAR", sort_by_session_var, true, true);
	pHTML->Replace("SORT_ASCENDING_SESSION_VAR", sort_ascending_session_var, true, true);
	pHTML->Replace("PAGE_NO_SESSION_VAR", page_no_session_var, true, true);
	pHTML->Replace("PAGE_SIZE_SESSION_VAR", page_size_session_var, true, true);
	pHTML->Replace("PAGE_COUNT_VAR", page_count_var, true, true);
	pHTML->Replace("EXPORT_METHOD_NAME", export_method_name, true, true);
	pHTML->Replace("/*EXPORT_PARAMS*/", export_vars.GetText(), true, true);
	pHTML->Replace("/*EXPORT_ARGUMENTS*/", export_arguments, true, true);
	pHTML->Replace("EXPORT_FUNCTION", export_function, true, true);

	pHTML->Replace("INSERT_BUTTON_CLASS", insert_button_class, true, true);

	pHTML->Replace("VIEW_STYLE_SESSION_VAR", view_style_session_var, true, true);
	pHTML->Replace("INITIAL_VIEW_STYLE", initial_view_style, true, true);


	string insert_route_params;
	insert_route_params = InsertRouteParams->AsString();
	ReplaceSubString(&insert_route_params, "this.params.", "THIS.props.routeParams.");
	ReplaceSubString(&insert_route_params, "this.", "THIS.props.data.QUERY_VAR.");
	ReplaceSubString(&insert_route_params, "THIS.", "this.");

	string details_route_params;
	details_route_params = DetailsRouteParams->AsString();
	ReplaceSubString(&details_route_params, "UI._parentData(1).params.", "THIS.props.routeParams.");
	ReplaceSubString(&details_route_params, "this.params.", "THIS.props.routeParams.");
	ReplaceSubString(&details_route_params, "this.", "THIS.props.data.");
	ReplaceSubString(&details_route_params, "THIS.", "this.");

	string edit_route_params;
	edit_route_params = EditRouteParams->AsString();
	ReplaceSubString(&edit_route_params, "UI._parentData(1).params.", "THIS.props.routeParams.");
	ReplaceSubString(&edit_route_params, "this.params.", "THIS.props.routeParams.");
	ReplaceSubString(&edit_route_params, "this.", "THIS.props.data.");
	ReplaceSubString(&edit_route_params, "THIS.", "this.");

	string delete_route_params;
	delete_route_params = DeleteRouteParams->AsString();
	ReplaceSubString(&delete_route_params, "UI._parentData(1).params.", "THIS.props.routeParams.");
	ReplaceSubString(&delete_route_params, "this.params.", "THIS.props.routeParams.");
	ReplaceSubString(&delete_route_params, "this.", "THIS.props.data.");
	ReplaceSubString(&delete_route_params, "THIS.", "this.");

	pHTML->Replace("/*INSERT_ROUTE_PARAMS*/", insert_route_params, true, true);
	pHTML->Replace("/*DETAILS_ROUTE_PARAMS*/", details_route_params, true, true);
	pHTML->Replace("/*EDIT_ROUTE_PARAMS*/", edit_route_params, true, true);
	pHTML->Replace("/*DELETE_ROUTE_PARAMS*/", delete_route_params, true, true);

	if(InsertRoute != "") pHTML->Replace("/*INSERT_ROUTE*/", "FlowRouter.go(\"" + InsertRoute + "\", objectUtils.mergeObjects(FlowRouter.current().params, {" + insert_route_params + "}));", true, true);
	if(DetailsRoute != "") pHTML->Replace("/*DETAILS_ROUTE*/", "FlowRouter.go(\"" + DetailsRoute + "\", objectUtils.mergeObjects(FlowRouter.current().params, {" + details_route_params + "}));", true, true);
	if(EditRoute != "") pHTML->Replace("/*EDIT_ROUTE*/", "FlowRouter.go(\"" + EditRoute + "\", objectUtils.mergeObjects(FlowRouter.current().params, {" + edit_route_params + "}));", true, true);
	if(DeleteRoute != "") pHTML->Replace("/*DELETE_ROUTE*/", "FlowRouter.go(\"" + DeleteRoute + "\", objectUtils.mergeObjects(FlowRouter.current().params, {" + delete_route_params + "}));", true, true);

	pHTML->Replace("INSERT_ROUTE", InsertRoute, true, true);
	pHTML->Replace("DETAILS_ROUTE", DetailsRoute, true, true);
	pHTML->Replace("EDIT_ROUTE", EditRoute, true, true);
	pHTML->Replace("DELETE_ROUTE", DeleteRoute, true, true);

	pHTML->Replace("VIEW_STYLE_SESSION_VAR", view_style_session_var, true, true);
	pHTML->Replace("INITIAL_VIEW_STYLE", initial_view_style, true, true);

	pHTML->Replace("/*SEARCH_FIELDS*/", search_fields, true, true);
	pHTML->Replace("/*EXPORT_FIELDS*/", export_fields, true, true);
	pHTML->Replace("DEFAULT_PAGE_SIZE", IntToStr(PageSize), true, true);

	string item_bindings = "";
	int bindings_count = AddItemBindings->Count();
	for(int i = 0; i < bindings_count; i++) {
		if(item_bindings != "") item_bindings = item_bindings + "\t\t";
		item_bindings = item_bindings + "this." + AddItemBindings->Strings[i] + " = this." + AddItemBindings->Strings[i] + ".bind(this);\n";
	}

	pHTML->Replace("/*ITEM_BINDINGS*/", item_bindings, true, true);

	if(!search_engine_style/* && Title != ""*/) {
		CWNode* title_node = pHTML->FindChild("#component-title", true, true);
		if(title_node != NULL) {
			CWNode* controls_row = pHTML->FindChild("#controls-row", true, true);
		
			if(controls_row != NULL) {
				pHTML->DetachChild(controls_row, true);
				title_node->AddChild(controls_row);
				controls_row->Attr->SetValue("style", "{{float: \"right\"}}");
			}
		}
	}


	if(!CWComponent::CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	return true;
}

// ---------------------------------------------------


CWTreeView::CWTreeView(CWObject* pParent): CWComponent(pParent)
{
	ItemNameField = "";
	ItemTypeField = "";

	CollapsedIconClass = "";
	ExpandedIconClass = "";

	ItemRoute = "";
	ItemRouteParams = new CWParams();

	FolderRoute = "";
	FolderRouteParams = new CWParams();
}

CWTreeView::~CWTreeView()
{
	Clear();
	delete FolderRouteParams;
	delete ItemRouteParams;
}

void CWTreeView::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "tree_view", "component");

	MetaAddMember(pMeta, "item_name_field", "Item name field", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "item_type_field", "Item type field", "string", "", "", false, "text", NULL);

	MetaAddMember(pMeta, "collapsed_icon_class", "Collapsed icon class", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "expanded_icon_class", "Expanded icon class", "string", "", "", false, "text", NULL);

	MetaAddMember(pMeta, "item_route", "Item route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "item_route_params", "Item route params", "array", "param", "", false, "", NULL);

	MetaAddMember(pMeta, "folder_route", "Folder route", "string", "route_name", "", false, "select_route", NULL);
	MetaAddMember(pMeta, "folder_route_params", "Folder route params", "array", "param", "", false, "", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "tree_view", false, "static", NULL);
}

void CWTreeView::Clear()
{
	CWComponent::Clear();
	ItemNameField = "";
	ItemTypeField = "";

	CollapsedIconClass = "";
	ExpandedIconClass = "";

	ItemRoute = "";
	ItemRouteParams->Clear();

	FolderRoute = "";
	FolderRouteParams->Clear();
}

bool CWTreeView::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	ItemNameField = pJSON->GetString("item_name_field");
	ItemTypeField = pJSON->GetString("item_type_field");

	CollapsedIconClass = pJSON->GetString("collapsed_icon_class");
	ExpandedIconClass = pJSON->GetString("expanded_icon_class");

	ItemRoute = FromCamelCase(pJSON->GetString("item_route"), '_', true);
	ItemRouteParams->LoadFromJSONArray(pJSON->GetArray("item_route_params"));

	FolderRoute = FromCamelCase(pJSON->GetString("folder_route"), '_', true);
	FolderRouteParams->LoadFromJSONArray(pJSON->GetArray("folder_route_params"));

	return true;
}

bool CWTreeView::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	string collapsed_icon_class = CollapsedIconClass;
	string expanded_icon_class = ExpandedIconClass;
	if(collapsed_icon_class == "") collapsed_icon_class = "fa fa-caret-right";
	if(expanded_icon_class == "") expanded_icon_class = "fa fa-caret-down";

	pRawTemplate->Replace("ITEM_NAME_FIELD", ItemNameField, true, true);
	pRawTemplate->Replace("ITEM_TYPE_FIELD", ItemTypeField, true, true);
	pRawTemplate->Replace("COLLAPSED_ICON_CLASS", collapsed_icon_class, true, true);
	pRawTemplate->Replace("EXPANDED_ICON_CLASS", expanded_icon_class, true, true);

	ReplaceSubString(pJS, "ITEM_NAME_FIELD", ItemNameField);
	ReplaceSubString(pJS, "ITEM_TYPE_FIELD", ItemTypeField);
	ReplaceSubString(pJS, "COLLAPSED_ICON_CLASS", collapsed_icon_class);
	ReplaceSubString(pJS, "EXPANDED_ICON_CLASS", expanded_icon_class);

	ReplaceSubString(pJS, "/*ITEM_ROUTE_PARAMS*/", ItemRouteParams->AsString());
	if(ItemRoute != "") ReplaceSubString(pJS, "/*ITEM_ROUTE*/", "Router.go(\"" + ItemRoute + "\", mergeObjects(Router.currentRouteParams(), {" + ItemRouteParams->AsString() + "}));");
	ReplaceSubString(pJS, "ITEM_ROUTE", ItemRoute);

	ReplaceSubString(pJS, "/*FOLDER_ROUTE_PARAMS*/", FolderRouteParams->AsString());
	if(FolderRoute != "") ReplaceSubString(pJS, "/*FOLDER_ROUTE*/", "Router.go(\"" + FolderRoute + "\", mergeObjects(Router.currentRouteParams(), {" + FolderRouteParams->AsString() + "}));");
	ReplaceSubString(pJS, "FOLDER_ROUTE", FolderRoute);

	return true;
}

// ---------------------------------------------------

CWMarkdown::CWMarkdown(CWObject* pParent): CWComponent(pParent)
{
	Source = "";
	SourceFile = "";
}

CWMarkdown::~CWMarkdown()
{
	Clear();
}

void CWMarkdown::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "markdown", "component");

	MetaAddMember(pMeta, "source", "Source", "string", "", "", false, "markdown", NULL);
	MetaAddMember(pMeta, "source_file", "Markdown source file", "string", "", "", false, "text", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
		hide_members->AddString("class");
		hide_members->AddString("events_code");
		hide_members->AddString("helpers_code");
		hide_members->AddString("template_created_code");
		hide_members->AddString("template_rendered_code");
		hide_members->AddString("template_destroyed_code");
		hide_members->AddString("title");
		hide_members->AddString("title_icon_class");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "markdown", false, "static", NULL);
}

void CWMarkdown::Clear()
{
	Source = "";
	SourceFile = "";
}

bool CWMarkdown::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Source = UnescapeJSON(pJSON->GetString("source"));
	SourceFile = ConvertDirSeparator(pJSON->GetString("source_file"));

	return true;
}

bool CWMarkdown::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string source = Source;
	if(SourceFile != "")
	{
		string source_file = App()->InputDir + SourceFile;
		if(!FileExists(source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: markdown source file not found \"" + source_file + "\".";
			return false;
		}

		source_file = GetFullPath(source_file);

		if(!FileLoadString(source_file, &source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + source_file + "\".";
			return false;
		}
	}

	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->AppendText("{{#markdown}}");
	pHTML->AppendText(source);
	pHTML->AppendText("{{/markdown}}");

	return true;
}

bool CWMarkdown::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	string source = Source;
	if(SourceFile != "")
	{
		string source_file = App()->InputDir + SourceFile;
		if(!FileExists(source_file))
		{
			if(pErrorMessage) *pErrorMessage = "Error: markdown source file not found \"" + source_file + "\".";
			return false;
		}

		source_file = GetFullPath(source_file);

		if(!FileLoadString(source_file, &source, 0, pErrorMessage))
		{
			if(pErrorMessage) *pErrorMessage = "Error reading file: \"" + source_file + "\".";
			return false;
		}
	}

	if(!CWComponent::CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("/*TEXT*/", "\"" + EscapeJSON(source) + "\"", true, true);
	pHTML->Replace("/*SANITIZE*/", "false", true, true);

	return true;
}

// ---------------------------------------------------


CWDiv::CWDiv(CWObject* pParent): CWComponent(pParent)
{
	Text = "";
}

CWDiv::~CWDiv()
{
	Clear();
}

void CWDiv::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "div", "component");

	MetaAddMember(pMeta, "text", "Text", "string", "", "", false, "textarea", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
		hide_members->AddString("events_code");
		hide_members->AddString("helpers_code");
		hide_members->AddString("template_created_code");
		hide_members->AddString("template_rendered_code");
		hide_members->AddString("template_destroyed_code");
		hide_members->AddString("title");
		hide_members->AddString("title_icon_class");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "div", false, "static", NULL);
}

void CWDiv::Clear()
{
	Text = "";
	CWComponent::Clear();
}

bool CWDiv::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Text = UnescapeJSON(pJSON->GetString("text"));

	return true;
}

bool CWDiv::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("/*TEXT*/", Text, true, true);
	pHTML->Attr->SetValue("id", GetComponentID());

	return true;
}

bool CWDiv::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("/*TEXT*/", Text, true, true);
	pHTML->Attr->SetValue("id", GetComponentID());

	return true;
}

// ---------------------------------------------------


CWSection::CWSection(CWObject* pParent): CWComponent(pParent)
{
	Text = "";
}

CWSection::~CWSection()
{
	Clear();
}

void CWSection::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "section", "component");

	MetaAddMember(pMeta, "text", "Text", "string", "", "", false, "textarea", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
		hide_members->AddString("events_code");
		hide_members->AddString("helpers_code");
		hide_members->AddString("template_created_code");
		hide_members->AddString("template_rendered_code");
		hide_members->AddString("template_destroyed_code");
		hide_members->AddString("title");
		hide_members->AddString("title_icon_class");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "section", false, "static", NULL);
}

void CWSection::Clear()
{
	Text = "";
	CWComponent::Clear();
}

bool CWSection::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	Text = UnescapeJSON(pJSON->GetString("text"));

	return true;
}

bool CWSection::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("/*TEXT*/", Text, true, true);
	pHTML->Attr->SetValue("id", GetComponentID());

	return true;
}

bool CWSection::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("/*TEXT*/", Text, true, true);
	pHTML->Attr->SetValue("id", GetComponentID());

	return true;
}


// ---------------------------------------------------


CWChart::CWChart(CWObject* pParent): CWComponent(pParent)
{
	ChartType = "";
	ValueField = "";
	CategoryField = "";
	TimeSeriesField = "";
	DateFormat = "";
}

CWChart::~CWChart()
{
	Clear();
}

void CWChart::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "chart", "component");

	CWStringList type_list;
	type_list.Add("line");
	type_list.Add("spline");
	type_list.Add("step");
	type_list.Add("area");
	type_list.Add("area-spline");
	type_list.Add("area-step");
	type_list.Add("bar");
	type_list.Add("scatter");
	type_list.Add("pie");
	type_list.Add("donut");
	type_list.Add("gauge");

	MetaAddMember(pMeta, "chart_type", "Chart Type", "string", "", "line", true, "select", &type_list);
	MetaAddMember(pMeta, "value_field", "Value field", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "category_field", "Category field", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "time_series_field", "Time series field", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "date_format", "Date format", "string", "", "", false, "text", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
		hide_members->AddString("events_code");
		hide_members->AddString("helpers_code");
		hide_members->AddString("template_created_code");
		hide_members->AddString("template_rendered_code");
		hide_members->AddString("template_destroyed_code");
		hide_members->AddString("title");
		hide_members->AddString("title_icon_class");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "chart", false, "static", NULL);
}

void CWChart::Clear()
{
	ChartType = "";
	CWComponent::Clear();
}

bool CWChart::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	ChartType = pJSON->GetString("chart_type");
	ValueField = pJSON->GetString("value_field");
	CategoryField = pJSON->GetString("category_field");
	TimeSeriesField = pJSON->GetString("time_series_field");
	DateFormat = pJSON->GetString("date_format");

	return true;
}

bool CWChart::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("CHART_TYPE", ChartType, true, true);
	pHTML->Replace("VALUE_FIELD", ValueField, true, true);
	pHTML->Replace("CATEGORY_FIELD", CategoryField, true, true);
	pHTML->Replace("TIME_SERIES_FIELD", TimeSeriesField, true, true);
	pHTML->Replace("DATE_FORMAT", DateFormat, true, true);
	pHTML->Attr->SetValue("id", GetComponentID());

	ReplaceSubString(pJS, "CHART_TYPE", ChartType);
	ReplaceSubString(pJS, "VALUE_FIELD", ValueField);
	ReplaceSubString(pJS, "CATEGORY_FIELD", CategoryField);
	ReplaceSubString(pJS, "TIME_SERIES_FIELD", TimeSeriesField);
	ReplaceSubString(pJS, "DATE_FORMAT", DateFormat);

	return true;
}

bool CWChart::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("CHART_TYPE", ChartType, true, true);
	pHTML->Replace("VALUE_FIELD", ValueField, true, true);
	pHTML->Replace("CATEGORY_FIELD", CategoryField, true, true);
	pHTML->Replace("TIME_SERIES_FIELD", TimeSeriesField, true, true);
	pHTML->Replace("DATE_FORMAT", DateFormat, true, true);
	pHTML->Attr->SetValue("id", GetComponentID());

	return true;
}


// ---------------------------------------------------


CWEditableContent::CWEditableContent(CWObject* pParent): CWComponent(pParent)
{
	TextIfEmpty = "";
}

CWEditableContent::~CWEditableContent()
{
	Clear();
}

void CWEditableContent::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "editable_content", "component");

	MetaAddMember(pMeta, "text_if_empty", "Text if empty", "string", "", "", false, "textarea", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
		hide_members->AddString("events_code");
		hide_members->AddString("helpers_code");
		hide_members->AddString("template_created_code");
		hide_members->AddString("template_rendered_code");
		hide_members->AddString("template_destroyed_code");
		hide_members->AddString("title");
		hide_members->AddString("title_icon_class");

		hide_members->AddString("query_name");
		hide_members->AddString("query_params");
		hide_members->AddString("components");
		hide_members->AddString("before_subscription_code");
		hide_members->AddString("custom_data_code");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "editable_content", false, "static", NULL);
}

void CWEditableContent::Clear()
{
	TextIfEmpty = "";
	CWComponent::Clear();
}

bool CWEditableContent::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	TextIfEmpty = UnescapeJSON(pJSON->GetString("text_if_empty"));

	return true;
}

bool CWEditableContent::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("CONTENT_NAME", Name, true, true);
	pHTML->Replace("TEXT_IF_EMPTY", TextIfEmpty, true, true);
	pHTML->Replace("CONTAINER_CLASS", Class, true, true);
	pHTML->Attr->SetValue("id", GetComponentID());

	return true;
}

bool CWEditableContent::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("CONTENT_NAME", Name, true, true);
	pHTML->Replace("TEXT_IF_EMPTY", TextIfEmpty, true, true);
	pHTML->Replace("CONTAINER_CLASS", Class, true, true);
	pHTML->Attr->SetValue("id", GetComponentID());

	return true;
}


// ---------------------------------------------------

// ---------------------------------------------------


CWCMSContent::CWCMSContent(CWObject* pParent): CWComponent(pParent)
{
	TextIfEmpty = "";
}

CWCMSContent::~CWCMSContent()
{
	Clear();
}

void CWCMSContent::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "cms_content", "component");

	MetaAddMember(pMeta, "text_if_empty", "Text if empty", "string", "", "", false, "textarea", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");
		hide_members->AddString("html");
		hide_members->AddString("js");
		hide_members->AddString("jsx");
		hide_members->AddString("gasoline");
		hide_members->AddString("use_gasoline");

		hide_members->AddString("custom_template");
		hide_members->AddString("events_code");
		hide_members->AddString("helpers_code");
		hide_members->AddString("template_created_code");
		hide_members->AddString("template_rendered_code");
		hide_members->AddString("template_destroyed_code");
		hide_members->AddString("title");
		hide_members->AddString("title_icon_class");

		hide_members->AddString("query_name");
		hide_members->AddString("query_params");
		hide_members->AddString("components");
		hide_members->AddString("before_subscription_code");
		hide_members->AddString("custom_data_code");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "cms_content", false, "static", NULL);
}

void CWCMSContent::Clear()
{
	TextIfEmpty = "";
	CWComponent::Clear();
}

bool CWCMSContent::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWComponent::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	TextIfEmpty = UnescapeJSON(pJSON->GetString("text_if_empty"));

	return true;
}

bool CWCMSContent::CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateBlaze(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("CONTENT_NAME", Name, true, true);
	pHTML->Replace("TEXT_IF_EMPTY", TextIfEmpty, true, true);
	pHTML->Replace("CONTAINER_CLASS", Class, true, true);
	pHTML->Attr->SetValue("id", GetComponentID());

	return true;
}

bool CWCMSContent::CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage)
{
	if(!CWComponent::CreateReact(pRootHTML, pRawTemplate, pHTML, pJS, pErrorMessage))
		return false;

	pHTML->Replace("CONTENT_NAME", Name, true, true);
	pHTML->Replace("TEXT_IF_EMPTY", TextIfEmpty, true, true);
	pHTML->Replace("CONTAINER_CLASS", Class, true, true);
	pHTML->Attr->SetValue("id", GetComponentID());

	return true;
}


// ---------------------------------------------------

CWCustomComponent::CWCustomComponent(CWObject* pParent): CWComponent(pParent)
{
	CustomHTML = true;
	CustomJS = true;
	CustomJSX = true;
}

CWCustomComponent::~CWCustomComponent()
{
	Clear();
}

void CWCustomComponent::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "custom_component", "component");

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("template");

		hide_members->AddString("events_code");
		hide_members->AddString("helpers_code");
		hide_members->AddString("template_created_code");
		hide_members->AddString("template_rendered_code");
		hide_members->AddString("template_destroyed_code");
		hide_members->AddString("class");
		hide_members->AddString("title");
		hide_members->AddString("title_icon_class");
		hide_members->AddString("text");
	}

	// override super class members
	MetaOverrideMember(pMeta, "type", "Type", "string", "", "custom_component", false, "static", NULL);
	MetaOverrideMember(pMeta, "html", "HTML code", "string", "", "", false, "html", NULL);
	MetaOverrideMember(pMeta, "js", "JS code", "string", "", "", false, "javascript", NULL);
	MetaOverrideMember(pMeta, "jsx", "JSX code", "string", "", "", false, "javascript", NULL);
	MetaOverrideMember(pMeta, "gasoline", "Generic Template", "gasoline", "", "", false, "", NULL);
	MetaOverrideMember(pMeta, "use_gasoline", "Use visual designer", "bool", "", "false", false, "checkbox", NULL);

	MetaOverrideMember(pMeta, "custom_template", "Custom template", "string", "", "", false, "text", NULL);
}


// --------------------------------


CWGasoline::CWGasoline(CWObject* pParent): CWObject(pParent)
{
	Templates = new CWArray<CWGasTemplate*>;
}

CWGasoline::~CWGasoline()
{
	Clear();
	delete Templates;
}


void CWGasoline::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gasoline", "object");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "gasoline", true, "static", NULL);
	MetaAddMember(pMeta, "templates", "Templates", "array", "gas_template", "", false, "", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}
}


void CWGasoline::Clear()
{
	CWObject::Clear();
	Templates->Clear();
}

bool CWGasoline::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasoline::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}

// --------------------------------

CWGasEvent::CWGasEvent(CWObject* pParent): CWObject(pParent)
{
	Event = "";
	Handler = "";
}

CWGasEvent::~CWGasEvent()
{
	Clear();
}


void CWGasEvent::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_event", "object");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "event", true, "static", NULL);
	MetaAddMember(pMeta, "event", "Event name", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "handler", "Handler name", "string", "", "", false, "text", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}
}


void CWGasEvent::Clear()
{
	CWObject::Clear();
	Event = "";
	Handler = "";
}

bool CWGasEvent::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasEvent::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------

CWGasHandler::CWGasHandler(CWObject* pParent): CWObject(pParent)
{
	Code = "";
}

CWGasHandler::~CWGasHandler()
{
	Clear();
}


void CWGasHandler::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_handler", "object");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "handler", true, "static", NULL);
	MetaAddMember(pMeta, "code", "Code", "string", "", "", false, "javascript", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
	}
}


void CWGasHandler::Clear()
{
	CWObject::Clear();
	Code = "";
}

bool CWGasHandler::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasHandler::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------

CWGasHelper::CWGasHelper(CWObject* pParent): CWObject(pParent)
{
	Code = "";
}

CWGasHelper::~CWGasHelper()
{
	Clear();
}


void CWGasHelper::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_helper", "object");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "helper", true, "static", NULL);
	MetaAddMember(pMeta, "code", "Code", "string", "", "", false, "javascript", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
	}
}


void CWGasHelper::Clear()
{
	CWObject::Clear();
	Code = "";
}

bool CWGasHelper::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasHelper::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------

CWGasNode::CWGasNode(CWObject* pParent): CWObject(pParent)
{

}

CWGasNode::~CWGasNode()
{
	Clear();
}


void CWGasNode::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_node", "object");

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
	}
}


void CWGasNode::Clear()
{
	CWObject::Clear();

}

bool CWGasNode::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWObject::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasNode::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------


CWGasText::CWGasText(CWObject* pParent): CWGasNode(pParent)
{
	Text = "";
}

CWGasText::~CWGasText()
{
	Clear();
}


void CWGasText::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_text", "gas_node");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "text", true, "static", NULL);
	MetaAddMember(pMeta, "text", "Text", "string", "", "", false, "textarea", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}
}


void CWGasText::Clear()
{
	CWGasNode::Clear();
	Text = "";
}

bool CWGasText::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWGasNode::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasText::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------


CWGasElement::CWGasElement(CWObject* pParent): CWGasNode(pParent)
{
	Children = new CWArray<CWGasNode*>;
}

CWGasElement::~CWGasElement()
{
	Clear();
	delete Children;
}


void CWGasElement::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_element", "gas_node");

	MetaAddMember(pMeta, "children", "Children", "array", "gas_node", "", false, "", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
	}
}


void CWGasElement::Clear()
{
	CWGasNode::Clear();
	Children->Clear();
}

bool CWGasElement::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWGasNode::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasElement::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------


CWGasTemplate::CWGasTemplate(CWObject* pParent): CWGasElement(pParent)
{
	Handlers = new CWArray<CWGasHandler*>;
	Helpers = new CWArray<CWGasHelper*>;
}

CWGasTemplate::~CWGasTemplate()
{
	Clear();
	delete Helpers;
	delete Handlers;
}


void CWGasTemplate::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_template", "gas_element");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "template", true, "static", NULL);
	MetaAddMember(pMeta, "handlers", "Event handlers", "array", "gas_handler", "", false, "", NULL);
	MetaAddMember(pMeta, "helpers", "Helpers", "array", "gas_helper", "", false, "", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{

	}
}


void CWGasTemplate::Clear()
{
	CWGasElement::Clear();
	Handlers->Clear();
	Helpers->Clear();
}

bool CWGasTemplate::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWGasElement::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasTemplate::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------


CWGasHTML::CWGasHTML(CWObject* pParent): CWGasElement(pParent)
{
	Element = "div";
	Selector = "";
	Attributes = new CWArray<CWParam*>;
	Events = new CWArray<CWGasEvent*>;
}

CWGasHTML::~CWGasHTML()
{
	Clear();
	delete Events;
	delete Attributes;
}


void CWGasHTML::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_html", "gas_element");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "html", true, "static", NULL);
	MetaAddMember(pMeta, "element", "Element", "string", "", "div", true, "static", NULL);
	MetaAddMember(pMeta, "selector", "Selector", "string", "", "", false, "text", NULL);
	MetaAddMember(pMeta, "attributes", "Attributes", "array", "param", "", false, "", NULL);
	MetaAddMember(pMeta, "events", "Events", "array", "gas_event", "", false, "", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}

}


void CWGasHTML::Clear()
{
	CWGasElement::Clear();
	Element = "div";
	Selector = "";
	Attributes->Clear();
	Events->Clear();
}

bool CWGasHTML::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWGasElement::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasHTML::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------


CWGasLoop::CWGasLoop(CWObject* pParent): CWGasElement(pParent)
{
	Dataset = "";
}

CWGasLoop::~CWGasLoop()
{
	Clear();
}


void CWGasLoop::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_loop", "gas_element");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "loop", true, "static", NULL);
	MetaAddMember(pMeta, "dataset", "Dataset", "string", "", "", false, "text", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}

}


void CWGasLoop::Clear()
{
	CWGasElement::Clear();
	Dataset = "";
}

bool CWGasLoop::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWGasElement::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasLoop::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------


CWGasCondition::CWGasCondition(CWObject* pParent): CWGasElement(pParent)
{
	Condition = "";
}

CWGasCondition::~CWGasCondition()
{
	Clear();
}


void CWGasCondition::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_condition", "gas_element");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "condition", true, "static", NULL);
	MetaAddMember(pMeta, "condition", "Condition", "string", "", "", false, "text", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}

}


void CWGasCondition::Clear()
{
	CWGasElement::Clear();
	Condition = "";
}

bool CWGasCondition::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWGasElement::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasCondition::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------

CWGasConditionTrue::CWGasConditionTrue(CWObject* pParent): CWGasElement(pParent)
{
}

CWGasConditionTrue::~CWGasConditionTrue()
{
	Clear();
}


void CWGasConditionTrue::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_condition_true", "gas_element");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "condition-true", true, "static", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}

}


void CWGasConditionTrue::Clear()
{
	CWGasElement::Clear();
}

bool CWGasConditionTrue::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWGasElement::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasConditionTrue::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------

CWGasConditionFalse::CWGasConditionFalse(CWObject* pParent): CWGasElement(pParent)
{
}

CWGasConditionFalse::~CWGasConditionFalse()
{
	Clear();
}


void CWGasConditionFalse::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_condition_false", "gas_element");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "condition-false", true, "static", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}

}


void CWGasConditionFalse::Clear()
{
	CWGasElement::Clear();
}

bool CWGasConditionFalse::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWGasElement::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasConditionFalse::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}


// --------------------------------


CWGasInclusion::CWGasInclusion(CWObject* pParent): CWGasElement(pParent)
{
	Template = "";
}

CWGasInclusion::~CWGasInclusion()
{
	Clear();
}


void CWGasInclusion::GetMetadata(CWJSONObject* pMeta)
{
	MetaInit(pMeta, "gas_inclusion", "gas_element");

	MetaAddMember(pMeta, "type", "Gasoline Type", "string", "", "inclusion", true, "static", NULL);
	MetaAddMember(pMeta, "template", "Template name", "string", "", "", false, "text", NULL);

	CWJSONArray* hide_members = pMeta->GetArray("hideMembers");
	if(hide_members != NULL)
	{
		hide_members->AddString("name");
	}

}

void CWGasInclusion::Clear()
{
	CWGasElement::Clear();
	Template = "";
}

bool CWGasInclusion::LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage)
{
	if(!CWGasElement::LoadFromJSON(pJSON, sDefaultName, pErrorMessage))
		return false;

	return true;
}

bool CWGasInclusion::SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage)
{
	return true;
}
