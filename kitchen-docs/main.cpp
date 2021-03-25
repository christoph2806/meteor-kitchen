#include <iostream>
#include <cstdlib>

#include "cppw_string.h"
#include "cppw_file.h"
#include "cppw_jsonparser.h"

int main(int argc, char **argv)
{
	string home_dir = AddDirSeparator(getenv("HOME"));
	string header_path =   home_dir + "meteor/meteor-kitchen/cppweb/cppw_meteor_kitchen.h";
	string metadata_path = home_dir + "meteor/meteor-kitchen/kitchen-base/source/metadata.json";
	string output_path_1 = home_dir + "meteor/meteor-kitchen/kitchen-base/source/metadata.json";
	string output_path_2 = home_dir + "meteor/meteor-kitchen/kitchen-old/files/metadata.json";
	string output_markdown = home_dir + "meteor/meteor-kitchen/kitchen-old/files/api_reference.md";

	// load cppw_meteor_kitchen.h
	string err = "";
	string header_str = "";
	if(!FileLoadString(header_path, &header_str, 0, &err))
	{
		cout << "Error loading file \"" << header_path << "\". " << err << endl;
		return -1;
	}
	CWStringList header;
	header.SetText(header_str);
	
	CWJSONObject metadata;
	string metadata_str = "";
	if(!FileLoadString(metadata_path, &metadata_str, 0, &err))
	{
		cout << "Error loading file \"" << metadata_path << "\". " << err << endl;
		return -1;
	}
	if(!metadata.Parse(metadata_str, &err))
	{
		cout << "Error parsing json file \"" + metadata_path + "\". " << err << endl;
		return -1;
	}
	
	CWJSONArray* meta_class_list = metadata.GetArray("classList");
	if(meta_class_list == NULL)
	{
		cout << "Invalid metadata.json file format. Member \"classList\" (array) not found." << endl;
		return -1;
	}
	
	CWJSONObject* current_meta = NULL;
	CWJSONArray* current_meta_members = NULL;
	
	CWStringList all_member_descriptions;

	string current_class_name = "";
	string current_meta_name = "";
	string last_comment = "";
	bool inside_comment = false;
	bool inside_class = false;
	int header_count = header.Count();
	for(int i = 0; i < header_count; i++)
	{
		string line = header.Strings[i];
		if(FindSubString(&line, "/*") >= 0)
		{
			last_comment = "";
			inside_comment = true;
		}

		if(inside_comment)
		{
			if(last_comment != "") last_comment += LINE_TERM;
			last_comment += Trim(ReplaceSubString(ReplaceSubString(line, "/*", ""), "*/", ""), true, true);
		}
		
		if(FindSubString(&line, "*/") >= 0)
		{
			inside_comment = false;
		}
		
		if(FindSubString(&line, "class CW") == 0 && FindSubString(&line, ";") < 0)
		{
			CWStringList tmp_list;
			StringToList(line, ' ', &tmp_list);
			if(tmp_list.Count() > 1)
			{
				current_class_name = ReplaceSubString(tmp_list.Strings[1], ":", "");
				current_meta_name = FromCamelCase(ReplaceSubString(current_class_name, "CW", ""), '_', true);
				current_meta = meta_class_list->GetObjectWithStringValue("objectType", current_meta_name);
				if(current_meta == NULL)
				{
					cout << "WARNING: metadata for class \"" << current_class_name << "\" (\"" << current_meta_name << "\") not found." << endl; 
				}
				else
				{
					current_meta_members = current_meta->GetArray("members");
					if(current_meta_members == NULL)
					{
						cout << "WARNING: metadata for class \"" << current_class_name << "\" (\"" << current_meta_name << "\") doesn't have member \"members\" (array)." << endl;
					}
				}
			}
		}
		
		if(FindSubString(&line, "// --- properties") >= 0)
		{
			inside_class = true;
			if(current_meta != NULL && last_comment != "")
			{
				current_meta->SetString("description", EscapeJSON(Trim(last_comment, true, true)));
			}

		}
		else
		{
			if(FindSubString(&line, "// ---") >= 0)
			{
				current_class_name = "";
				current_meta_name = "";
				current_meta = NULL;
				last_comment = "";
				inside_class = false;
			}
			else
			{
				if(inside_class)
				{
					string member = Trim(line, true, true);
					CWStringList tmp_list;
					StringToList(member, ' ', &tmp_list);
					if(tmp_list.Count() > 1)
					{
						string class_member_name = ReplaceSubString(ReplaceSubString(tmp_list.Strings[1], "*", ""), ";", "");
						string meta_member_name = FromCamelCase(class_member_name, '_', true);
						string member_description = "";
						string description = "";
						int comment_pos = FindSubString(&member, "//");
						if(comment_pos >= 0)
						{
							member_description = Trim(member.substr(comment_pos + 2, member.size() - (comment_pos + 2)), true, true);
							if(member_description == "")
							{
								cout << "WARNING: member \"" << current_class_name << "::" << class_member_name << "\" doesn't have description." << endl;
							}
							else
							{
								description = EscapeJSON(member_description);
							}
						}

						all_member_descriptions.Add(current_meta_name + "." + meta_member_name + "=" + description);
						if(current_meta_members != NULL)
						{
							CWJSONObject* meta_member = current_meta_members->GetObjectWithStringValue("name", meta_member_name);
							if(meta_member == NULL)
							{
								cout << "WARNING: metadata for class \"" << current_class_name << "\" (\"" << current_meta_name << "\") doesn't have member \"" << meta_member_name << "\"." << endl;
							}
							else
							{
								meta_member->SetString("description", description);
							}
						}
					}
				}
			}
		}
	}
	
	// copy descriptions from superclass to derived members
	int meta_class_count = meta_class_list->Count();
	for(int i = 0; i < meta_class_count; i++)
	{
		CWJSONObject* derived_class = meta_class_list->Items[i]->GetObject();
		string derived_class_name = derived_class->GetString("objectType");
		CWJSONArray* derived_list = derived_class->GetArray("derivedFrom");
		if(derived_list != NULL)
		{
			CWStringList tmp_list;
			derived_list->ExtractStrings(&tmp_list);
			int derived_count = tmp_list.Count();
			for(int x = 0; x < derived_count; x++)
			{
				string super_class_name = tmp_list.Strings[x];
				CWJSONObject* super_class = meta_class_list->GetObjectWithStringValue("objectType", super_class_name);
				if(super_class == NULL)
				{
					cout << "WARNING: superclass \"" + super_class_name + "\" not found (referenced from class \"" + derived_class->GetString("name") + "\")." << endl;
				}
				else
				{
					CWJSONArray* derived_members = derived_class->GetArray("members");
					if(derived_members != NULL)
					{
						int member_count = derived_members->Count();
						for(int m = 0; m < member_count; m++)
						{
							CWJSONObject* derived_member = derived_members->Items[m]->GetObject();
							string derived_member_name = derived_member->GetString("name");
							if(derived_member->GetString("description") == "")
							{
								CWJSONArray* super_members = super_class->GetArray("members");
								if(super_members != NULL)
								{
									CWJSONObject* super_member = super_members->GetObjectWithStringValue("name", derived_member_name);
									if(super_member != NULL)
									{
										string desc = super_member->GetString("description");
										derived_member->SetString("description", desc);
									}
									else
									{
										string desc = all_member_descriptions.GetValue(super_class_name + "." + derived_member_name);
										if(desc != "")
											derived_member->SetString("description", desc);
										else
											cout << "WARNING: " << derived_class_name << "." << derived_member_name << " doesn't have description." << endl;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	string output_str = metadata.Stringify(false);
	if(!FileSaveString(output_path_1, &output_str, 0, &err))
	{
		cout << "Error writing file \"" << output_path_1 << "\". " << err << endl;
		return -1;
	}
	if(!FileSaveString(output_path_2, &output_str, 0, &err))
	{
		cout << "Error writing file \"" << output_path_2 << "\". " << err << endl;
		return -1;
	}
	
	// create documentation
	string doc = "";
	CWStringList sorted_class_names;
	for(int i = 0; i < meta_class_count; i++)
	{
		CWJSONObject* meta_class = meta_class_list->Items[i]->GetObject();
		string class_name = meta_class->GetString("objectType");
		sorted_class_names.Add(class_name);
	}
	sorted_class_names.Sort();
	
	for(int i = 0; i < meta_class_count; i++)
	{
		CWJSONObject* meta_class = meta_class_list->GetObjectWithStringValue("objectType", sorted_class_names.Strings[i]);	
		string class_name = meta_class->GetString("objectType");
		if(class_name != "root" && class_name != "object" && class_name != "component")
		{
			doc.append("# " + class_name);
			doc.append(LINE_TERM);
			doc.append(LINE_TERM);
			string description = meta_class->GetString("description");
			if(description != "")
			{
				doc.append(EscapeMarkdown(UnescapeJSON(description)));
				doc.append(LINE_TERM);
				doc.append(LINE_TERM);
			}
			CWJSONArray* member_list = meta_class->GetArray("members");
			if(member_list != NULL)
			{
				int member_count = member_list->Count();
				if(member_count > 0)
				{
					CWJSONObject skeleton;
					doc.append("Property | Type | Description");
					doc.append(LINE_TERM);
					doc.append("---------|------|------------");
					doc.append(LINE_TERM);
					for(int x = 0; x < member_list->Count(); x++)
					{
						CWJSONObject* member = member_list->Items[x]->GetObject();
						string member_name = member->GetString("name");
						string member_type = member->GetString("type");
						string member_subtype = member->GetString("subType");
						string member_description = member->GetString("description");
						string member_default = member->GetString("default");

						if(member_type == "string") skeleton.SetString(member_name, member_default);
						if(member_type == "integer") skeleton.SetInteger(member_name, StrToIntDef(member_default, 0));
						if(member_type == "bool") skeleton.SetBool(member_name, StrCmpi(member_default, "true") == 0 ? true : false);
						if(member_type == "array") skeleton.SetArray(member_name, new CWJSONArray());
						if(member_type != "string" && member_type != "integer" && member_type != "bool" && member_type != "array") skeleton.SetObject(member_name, new CWJSONObject());

						if(member_type != "string" && member_type != "integer" && member_type != "bool" && member_type != "array")
						{
							member_type = "<a href=\"#" + member_type + "\">" + EscapeMarkdown(UnescapeJSON(member_type)) + "</a>";
						}
						else
						{
							if(member_type == "array")
							{
								if(member_subtype != "string" && member_subtype != "integer" && member_subtype != "bool")
								{
									member_subtype = "<a href=\"#" + member_subtype + "\">" + EscapeMarkdown(UnescapeJSON(member_subtype)) + "</a>";
								}
								else
								{
									member_subtype = EscapeMarkdown(UnescapeJSON(member_subtype));
								}
								member_type = "array of " + member_subtype;
							}
							else
							{
								member_type = EscapeMarkdown(UnescapeJSON(member_type));
							}
						}
						
						doc.append(EscapeMarkdown(UnescapeJSON(member_name)) + " | " + member_type + " | " + EscapeMarkdown(UnescapeJSON(member_description)));
						doc.append(LINE_TERM);
					}
					doc.append(LINE_TERM);

					doc.append("Example:");
					doc.append(LINE_TERM);
					doc.append("```json");
					doc.append(LINE_TERM);
					doc.append(skeleton.Stringify(false));
					doc.append(LINE_TERM);
					doc.append("```");
					doc.append(LINE_TERM);
					doc.append(LINE_TERM);
				}
			}
		}
	}
	
	if(!FileSaveString(output_markdown, &doc, 0, &err))
	{
		cout << "Error writing file \"" << output_markdown << "\". " << err << endl;
		return -1;
	}

	return 0;
}
