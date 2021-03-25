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

#include "cppw_htmlparser.h"

void EscapeHTMLString(string* pHTML)
{
    ReplaceSubString(pHTML, "<", "&lt;");
    ReplaceSubString(pHTML, ">", "&gt;");
    ReplaceSubString(pHTML, "&", "&amp;");
    ReplaceSubString(pHTML, "\"", "&quot;");
    ReplaceSubString(pHTML, "\'", "&#39;");
    ReplaceSubString(pHTML, "\r", "&#13;");
    ReplaceSubString(pHTML, "\n", "&#10;");
}

string EscapeHTMLString(const string& sHTML)
{
    string res = sHTML;
    EscapeHTMLString(&res);
    return res;
}

CWNode* CreateEmptyPage(string sDocType, string sLang, string sCharset, string sTitle)
{
    CWNode* root = new CWNode();
    root->AddChild("!doctype");
    if(sDocType == "")
        root->Attr->Add("html");
    else
        root->Attr->Add(sDocType);

    CWNode* html = root->AddChild("html");
    if(sLang != "")
        html->Attr->SetValue("lang", sLang);

    CWNode* head = html->AddChild("head");
    if(sCharset != "")
    {
        CWNode* meta_charset = head->AddChild("meta");
        meta_charset->Attr->SetValue("charset", sCharset);

    }
    head->AddChild("title", sTitle);

    html->AddChild("body");
    return root;
}

bool IsVoidElement(const string &sName)
{
	if((strcasecmp(sName.c_str(), "?xml") == 0) ||
		(strcasecmp(sName.c_str(), "!doctype") == 0) ||
		(strcasecmp(sName.c_str(), "area") == 0) ||
		(strcasecmp(sName.c_str(), "base") == 0) ||
		(strcasecmp(sName.c_str(), "br") == 0) ||
		(strcasecmp(sName.c_str(), "col") == 0) ||
		(strcasecmp(sName.c_str(), "command") == 0) ||
		(strcasecmp(sName.c_str(), "embed") == 0) ||
		(strcasecmp(sName.c_str(), "hr") == 0) ||
		(strcasecmp(sName.c_str(), "img") == 0) ||
		(strcasecmp(sName.c_str(), "input") == 0) ||
		(strcasecmp(sName.c_str(), "keygen") == 0) ||
		(strcasecmp(sName.c_str(), "link") == 0) ||
		(strcasecmp(sName.c_str(), "meta") == 0) ||
		(strcasecmp(sName.c_str(), "param") == 0) ||
		(strcasecmp(sName.c_str(), "source") == 0) ||
		(strcasecmp(sName.c_str(), "track") == 0) ||
		(strcasecmp(sName.c_str(), "wbr") == 0))
			return true;
    return false;
}

bool IsInlineElement(const string &sName)
{
    if((strcasecmp(sName.c_str(), "b") == 0) ||
        (strcasecmp(sName.c_str(), "big") == 0) ||
        (strcasecmp(sName.c_str(), "i") == 0) ||
        (strcasecmp(sName.c_str(), "small") == 0) ||
        (strcasecmp(sName.c_str(), "tt") == 0) ||
        (strcasecmp(sName.c_str(), "abbr") == 0) ||
        (strcasecmp(sName.c_str(), "acronym") == 0) ||
        (strcasecmp(sName.c_str(), "cite") == 0) ||
        (strcasecmp(sName.c_str(), "code") == 0) ||
        (strcasecmp(sName.c_str(), "dfn") == 0) ||
        (strcasecmp(sName.c_str(), "em") == 0) ||
        (strcasecmp(sName.c_str(), "kbd") == 0) ||
        (strcasecmp(sName.c_str(), "strong") == 0) ||
        (strcasecmp(sName.c_str(), "samp") == 0) ||
        (strcasecmp(sName.c_str(), "var") == 0) ||
        (strcasecmp(sName.c_str(), "a") == 0) ||
        (strcasecmp(sName.c_str(), "bdo") == 0) ||
        (strcasecmp(sName.c_str(), "br") == 0) ||
        (strcasecmp(sName.c_str(), "img") == 0) ||
        (strcasecmp(sName.c_str(), "map") == 0) ||
        (strcasecmp(sName.c_str(), "object") == 0) ||
        (strcasecmp(sName.c_str(), "q") == 0) ||
        (strcasecmp(sName.c_str(), "script") == 0) ||
        (strcasecmp(sName.c_str(), "span") == 0) ||
        (strcasecmp(sName.c_str(), "sub") == 0) ||
        (strcasecmp(sName.c_str(), "sup") == 0) ||
        (strcasecmp(sName.c_str(), "button") == 0) ||
        (strcasecmp(sName.c_str(), "input") == 0) ||
        (strcasecmp(sName.c_str(), "label") == 0) ||
        (strcasecmp(sName.c_str(), "select") == 0) ||
        (strcasecmp(sName.c_str(), "textarea") == 0))
			return true;

	return false;
}

bool IsBlockElement(const string &sName)
{
    if((strcasecmp(sName.c_str(), "address") == 0) ||
        (strcasecmp(sName.c_str(), "figcaption") == 0) ||
        (strcasecmp(sName.c_str(), "ol") == 0) ||
        (strcasecmp(sName.c_str(), "article") == 0) ||
        (strcasecmp(sName.c_str(), "figure") == 0) ||
        (strcasecmp(sName.c_str(), "output") == 0) ||
        (strcasecmp(sName.c_str(), "aside") == 0) ||
        (strcasecmp(sName.c_str(), "footer") == 0) ||
        (strcasecmp(sName.c_str(), "p") == 0) ||
        (strcasecmp(sName.c_str(), "audio") == 0) ||
        (strcasecmp(sName.c_str(), "form") == 0) ||
        (strcasecmp(sName.c_str(), "pre") == 0) ||
        (strcasecmp(sName.c_str(), "blockquote") == 0) ||
        (strcasecmp(sName.c_str(), "h1") == 0) ||
        (strcasecmp(sName.c_str(), "h2") == 0) ||
        (strcasecmp(sName.c_str(), "h3") == 0) ||
        (strcasecmp(sName.c_str(), "h4") == 0) ||
        (strcasecmp(sName.c_str(), "h5") == 0) ||
        (strcasecmp(sName.c_str(), "h6") == 0) ||
        (strcasecmp(sName.c_str(), "section") == 0) ||
        (strcasecmp(sName.c_str(), "canvas") == 0) ||
        (strcasecmp(sName.c_str(), "header") == 0) ||
        (strcasecmp(sName.c_str(), "table") == 0) ||
        (strcasecmp(sName.c_str(), "dd") == 0) ||
        (strcasecmp(sName.c_str(), "hgroup") == 0) ||
        (strcasecmp(sName.c_str(), "tfoot") == 0) ||
        (strcasecmp(sName.c_str(), "div") == 0) ||
        (strcasecmp(sName.c_str(), "hr") == 0) ||
        (strcasecmp(sName.c_str(), "ul") == 0) ||
        (strcasecmp(sName.c_str(), "dl") == 0) ||
        (strcasecmp(sName.c_str(), "video") == 0) ||
        (strcasecmp(sName.c_str(), "fieldset") == 0) ||
        (strcasecmp(sName.c_str(), "noscript") == 0))
			return true;

	return false;
}

CWNode::CWNode(const string& sName, const string& sText)
{
    Attr = new CWStringList();
    Text = new CWStringList();
    Childs = new CWNodeList();

    Reset(sName, sText);
}

CWNode::~CWNode()
{
    delete Childs;
    delete Text;
    delete Attr;
}

void CWNode::Clear()
{
    Name = "";
    SelfClosing = false;
    Void = false;
	NewLineAfter = false;
	SpaceAfter = false;
    Attr->Clear();
    Text->Clear();
    Text->Add("");
    Childs->Clear();
}

void CWNode::Reset(const string& sName, const string& sText)
{
    Clear();
    Name = sName;
    if(Name != "") Void = IsVoidElement(Name);
    SetText(sText);
}

void CWNode::CopyFrom(CWNode* pCopyFrom)
{
    Clear();
    if(pCopyFrom == NULL)
        return;

    Name = pCopyFrom->Name;
    SelfClosing = pCopyFrom->SelfClosing;
    Void = pCopyFrom->Void;
    Attr->Assign(pCopyFrom->Attr);
    Text->Assign(pCopyFrom->Text);
    Childs->CopyFrom(pCopyFrom->Childs);
}
/*
void CWNode::ParseTag(const char* cInput, int iPos, int* pTagEnd)
{
    int pos = iPos;
    *pTagEnd = -1;

    CWStringList tokens;
    int word_start = iPos;
    bool inside_double_quotes = false;
    bool inside_single_quotes = false;
    bool inside_helper = false;
    bool tag_end = false;
    while(cInput[pos] != 0 && !tag_end)
    {
        // ignore text under quotes
        if(cInput[pos] == '\"' && !inside_single_quotes) inside_double_quotes = !inside_double_quotes;

		if(cInput[pos] == '{' && cInput[pos + 1] == '{' && !inside_single_quotes && !inside_double_quotes)
		{
			inside_helper = true;
			pos++;
		}

		if(cInput[pos] == '}' && cInput[pos + 1] == '}' && !inside_single_quotes && !inside_double_quotes)
		{
			inside_helper = false;
			pos++;
		}

        // space, tab, '<', '>' and '=' is end of word
        if(!inside_double_quotes && !inside_single_quotes && !inside_helper && (cInput[pos] == ' ' || cInput[pos] == '\t' || cInput[pos] == '\r' || cInput[pos] == '\n' || cInput[pos] == '<' || cInput[pos] == '>' || cInput[pos] == '=' || cInput[pos] == '/'))
        {
            // add word
            if(word_start < pos)
            {
                int cstart = word_start;
                int cpos = pos;
                int clen = pos - word_start;

                if(cInput[cstart] == '\"' || cInput[cstart] == '\'')
                {
                    cstart++;
                    if(cInput[word_start + (clen - 1)] == '\"' || cInput[word_start + (clen - 1)] == '\'')
                        cpos--;
                }
                tokens.Add(string(cInput + cstart, cpos - cstart));
            }

            if(cInput[pos] == '<' || cInput[pos] == '>' || cInput[pos] == '=' || cInput[pos] == '/')
            {
                tokens.Add(string(cInput + pos, 1));
                if(cInput[pos] == '>')
                {
                    tag_end = true;
                    *pTagEnd = pos;
                }
                pos++;
            }
            else
            {
                // remove duplicate spaces, tabs and newlines
                while(cInput[pos] == ' ' || cInput[pos] == '\t' || cInput[pos] == '\r' || cInput[pos] == '\n')
                    pos++;
            }
            word_start = pos;
        }
        else
            pos++;
    }

    // find name and attributes
    int token_count = tokens.Count();
    int name_found = false;
    for(int i = 0; i < token_count; i++)
    {
        string token = tokens.Strings[i];

        string minus1 = "";
        string plus1 = "";
        string plus2 = "";

        if(i > 0) minus1 = tokens.Strings[i - 1];
        if(i < token_count - 1) plus1 = tokens.Strings[i + 1];
        if(i < token_count - 2) plus2 = tokens.Strings[i + 2];

        if(token != "<" && token != ">" && token != "/")
        {
            if(!name_found)
            {
                Name = token;
                name_found = true;
            }
            else
            {
                if(plus1 == "=")
                {
                    Attr->Add(token + "=" + plus2);
                    i+= 2;
                }
                else
                {
					Attr->Add(token);
                }
            }
        }
        // self closing or void?
        if(token == ">")
        {
            if(minus1 == "/")
            {
                // self closing
                SelfClosing = true;
            }
            else
            {
                Void = IsVoidElement(Name);
            }
        }

    }
}
*/

void CWNode::ParseTag(const char* cInput, int iPos, bool bXML, bool bJSX, int* pTagEnd)
{
    int pos = iPos;
    *pTagEnd = -1;

	int token_starts[1024];
	int token_lenghts[1024];
	int token_flags[1024];
	int token_count = 0;
    int word_start = iPos;
    bool inside_double_quotes = false;
    bool inside_helper = false;
    bool tag_end = false;
    while(cInput[pos] != 0 && !tag_end)
    {
        // ignore text under quotes
        if(cInput[pos] == '\"') {
			inside_double_quotes = !inside_double_quotes;
		}

		if(!bXML && !bJSX)
		{
			// spacebars helper start
			if(cInput[pos] == '{' && cInput[pos + 1] == '{' && !inside_double_quotes)
			{
				inside_helper = true;
				pos++;
			}

			// spacebars helper end
			if(cInput[pos] == '}' && cInput[pos + 1] == '}' && !inside_double_quotes)
			{
				inside_helper = false;
				pos++;
			}
		}
		
		if(bJSX)
		{
			if(cInput[pos] == '=' && cInput[pos + 1] == '{')
			{
				inside_helper = true;
				pos++;
			}

			if(cInput[pos] == '}' && inside_helper)
			{
				inside_helper = false;
			}
		}

        // space, tab, '<', '>', '=', '/' or newline is end of word
        if(!inside_double_quotes && !inside_helper && (cInput[pos] == ' ' || cInput[pos] == '\t' || cInput[pos] == '\r' || cInput[pos] == '\n' || cInput[pos] == '<' || cInput[pos] == '>' || cInput[pos] == '=' || cInput[pos] == '/'))
        {
            // add word
            if(word_start < pos)
            {
                int cstart = word_start;
                int cpos = pos;
                int clen = pos - word_start;

				bool was_inside_double_quotes = false;
                if(cInput[cstart] == '\"' || cInput[cstart] == '\'')
                {
                    cstart++;
                    if(cInput[word_start + (clen - 1)] == '\"' || cInput[word_start + (clen - 1)] == '\'') {
						was_inside_double_quotes = true;
                        cpos--;
					}
                }
				token_starts[token_count] = cstart;
				token_lenghts[token_count] = cpos - cstart;
				token_flags[token_count] = was_inside_double_quotes ? 1 : 0; // flag=1 means this token was inside double quotes
				token_count++;
            }

            if(cInput[pos] == '<' || cInput[pos] == '>' || cInput[pos] == '=' || cInput[pos] == '/')
            {
				token_starts[token_count] = pos;
				token_lenghts[token_count] = 1;
				token_flags[token_count] = 0;
				token_count++;

                if(cInput[pos] == '>')
                {
                    tag_end = true;
                    *pTagEnd = pos;
                }
                pos++;
            }
            else
            {
                // remove duplicate spaces, tabs and newlines
                while(cInput[pos] == ' ' || cInput[pos] == '\t' || cInput[pos] == '\r' || cInput[pos] == '\n')
                    pos++;
            }
            word_start = pos;
        }
        else
            pos++;
    }

    // find name and attributes
    int name_found = false;
    for(int i = 0; i < token_count; i++)
    {
		char current = cInput[token_starts[i]];
		char minus1 = 0;
		char plus1 = 0;

//		int current_flag = token_flags[i];
		int minus1_flag = 0;
//		int plus1_flag = 0;

        if(i > 0) {
			minus1 = cInput[token_starts[i - 1]];
			minus1_flag = token_flags[i - 1];
		}
        if(i < token_count - 1) {
			plus1 = cInput[token_starts[i + 1]];
//			plus1_flag = token_flags[i + 1];
		}

        if(current != '<' && current != '>' && current != '/')
        {
            if(!name_found)
            {
                Name = string(cInput + token_starts[i], token_lenghts[i]);
                name_found = true;
            }
            else
            {
                if(plus1 == '=')
                {
					string attr_name = string(cInput + token_starts[i], token_lenghts[i]);
					if(bJSX && attr_name == "className") attr_name = "class";
                    Attr->Add(attr_name + "=" + string(cInput + token_starts[i + 2], token_lenghts[i + 2]));
                    i+= 2;
                }
                else
                {
					string attr_name = string(cInput + token_starts[i], token_lenghts[i]);
					if(bJSX && attr_name == "className") attr_name = "class";
					Attr->Add(attr_name);
                }
            }
        }
        // self closing or void?
        if(current == '>')
        {
            if(minus1 == '/' && minus1_flag == 0)
            {
                // self closing
                SelfClosing = true;
            }
            else
            {
                Void = IsVoidElement(Name);
            }
        }

    }
}

bool CWNode::Parse(const char* cInput, int* pPos, int iLen, bool bXML, bool bJSX, string* pErrorMessage)
{
    const char* input = cInput;
    int pos = 0;
    if(pPos != NULL) pos = *pPos;
    int len = iLen;
    string text = "";

    bool tag_closed = false;

    bool inside_comment = false;
    bool inside_double_quotes = false;
    bool inside_script = !bXML && (strcasecmp(Name.c_str(), "script") == 0 || strcasecmp(Name.c_str(), "style") == 0);
    bool inside_markdown = false;
    while(pos < len)
    {
        char current = 0;
        char plus1 = 0;
        char plus2 = 0;
        char plus3 = 0;
        char minus1 = 0;
        char minus2 = 0;

        current = input[pos];
        if(pos < len - 1) plus1 = input[pos + 1];
        if(pos < len - 2) plus2 = input[pos + 2];
        if(pos < len - 3) plus3 = input[pos + 3];

        if(pos > 0) minus1 = input[pos - 1];
        if(pos > 1) minus2 = input[pos - 2];

		if(!bXML)
		{
			// markdown start?
			if(!inside_script && !inside_double_quotes && !inside_comment && !inside_markdown && current == '{' && plus1 == '{' && plus2 == '#' && strncmp(input + pos, "{{#markdown}}", 13) == 0) inside_markdown = true;
			// markdown end?
			if(!inside_script && !inside_double_quotes && !inside_comment && inside_markdown && current == '{' && plus1 == '{' && plus2 == '/' && strncmp(input + pos, "{{/markdown}}", 13) == 0) inside_markdown = false;
		}

        // begin of string?
        if(!inside_script && !inside_markdown && !inside_comment && current == '\"' && minus1 != '\\') inside_double_quotes = !inside_double_quotes;

        // comment start?
        if(!inside_script && !inside_markdown && !inside_double_quotes && !inside_comment && current == '<' && plus1 == '!' && plus2 == '-' && plus3 == '-') inside_comment = true;
        // comment end?
        if(!inside_script && !inside_markdown && !inside_double_quotes && inside_comment && current == '>' && minus1 == '-' && minus2 == '-') inside_comment = false;

        if(!inside_comment && !inside_double_quotes && !inside_markdown)
        {
            if(!inside_script && current == '<' && isalpha(plus1))
            {
                CWNode* node = new CWNode();
                AddChild(node, text, "");
                text = "";

                int tag_end = 0;
                node->ParseTag(input, pos, bXML, bJSX, &tag_end);
                if(tag_end < 0)
                {
                    if(pErrorMessage != NULL) *pErrorMessage = "Malformed input.";
                    return false;
                }

                pos = tag_end;

                if(!node->SelfClosing && !node->Void)
                {
                    pos++;
                    if(!node->Parse(input, &pos, len, bXML, bJSX, pErrorMessage))
                        return false;
                }
            }
            else
            {
                if(current == '<' && plus1 == '/')
                {
                    int tag_end = FindChar(input, '>', pos);
                    if(tag_end < 0)
                    {
                        if(pErrorMessage != NULL) *pErrorMessage = "Malformed input.";
                        return false;
                    }
                    pos = tag_end;
                    tag_closed = true;
                    break;
                }
                else
					text.append(input + pos, 1);
            }
        }
        else
			text.append(input + pos, 1);

        pos++;
    }
    AppendText(text);

    if(pPos != NULL) *pPos = pos;

    if(pPos != NULL && !tag_closed)
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Malformed input.";
        return false;
    }
    return true;
}

bool CWNode::ParseHTML(const string& sInput, string* pErrorMessage)
{
    Clear();
    int input_len = sInput.size();
    const char* input = sInput.c_str();
    return Parse(input, NULL, input_len, false, false, pErrorMessage);
}

bool CWNode::ParseXML(const string& sInput, string* pErrorMessage)
{
    Clear();
    int input_len = sInput.size();
    const char* input = sInput.c_str();
    return Parse(input, NULL, input_len, true, false, pErrorMessage);
}

bool CWNode::ParseXML(const char* cInput, int iLen, string* pErrorMessage)
{
    return Parse(cInput, NULL, iLen, true, false, pErrorMessage);
}

bool CWNode::ParseJSX(const string& sInput, string* pErrorMessage)
{
    Clear();
    int input_len = sInput.size();
    const char* input = sInput.c_str();
    return Parse(input, NULL, input_len, false, true, pErrorMessage);
}

string CWNode::GetHTML(bool bMinify, int iIndent)
{
	int child_indent = iIndent + 1;
	if(Name == "")
	{
		iIndent--;
		child_indent--;
	}
	string tabs = "";
	if(iIndent > 0) tabs = string(iIndent, '\t');
	string child_tabs = "";
	if(child_indent > 0) child_tabs = string(child_indent, '\t');

    string text = "";

    bool dont_minify_text = Name == "textarea" || Name == "pre" || Name == "code" || Name == "style";
	bool force_minify_tag = Name == "textarea" || Name == "option";

    if(Name != "")
    {
		if(!bMinify) text.append(tabs);
        text.append("<");
        text.append(Name);
        int attr_count = Attr->Count();
        for(int i = 0; i < attr_count; i++)
        {
            if(Attr->IsNameValue(i))
            {
				string attr_name = Attr->GetName(i);
				string escaped_value = Attr->GetValue(i);
				ReplaceSubString(&escaped_value, "\"", "&quot;");
				text.append(" " + attr_name + "=\"" + escaped_value + "\"");
            }
            else
			{
				string attr_name = Attr->Strings[i];
                text.append(" " + attr_name);
			}
        }

        if(!SelfClosing && !Void)
        {
			text.append(">");
			if(!bMinify && !force_minify_tag) text.append("\n");
        }
    }

    int child_count = Childs->Count();
    for(int i = 0; i < child_count; i++)
    {
        if(dont_minify_text)
            text.append(Text->Strings[i]);
        else
        {
			string tmp = Trim(Text->Strings[i], true, true);
			if(bMinify)
			{
				ReplaceSubString(&tmp, "\r\n", " ");
				ReplaceSubString(&tmp, "\r", " ");
				ReplaceSubString(&tmp, "\n", " ");
			}
			else
			{
				ReplaceSubString(&tmp, "\r\n", "\a");
				ReplaceSubString(&tmp, "\r", "\a");
				ReplaceSubString(&tmp, "\n", "\a");
				ReplaceSubString(&tmp, "\a", LINE_TERM);
			}
			if(!bMinify && tmp.size() > 0) text.append(child_tabs);
            text.append(tmp);
			if(!bMinify && tmp.size() > 0) text.append(LINE_TERM);
        }
        text.append(Childs->Items[i]->GetHTML(bMinify, child_indent));
    }

    if(dont_minify_text)
        text.append(Text->Strings[child_count]);
	else
    {
		string tmp = Trim(Text->Strings[child_count], true, true);

		if(bMinify)
		{
			ReplaceSubString(&tmp, "\r\n", " ");
			ReplaceSubString(&tmp, "\r", " ");
			ReplaceSubString(&tmp, "\n", " ");
		}
		else
		{
			ReplaceSubString(&tmp, "\r\n", "\a");
			ReplaceSubString(&tmp, "\r", "\a");
			ReplaceSubString(&tmp, "\n", "\a");
			ReplaceSubString(&tmp, "\a", LINE_TERM);
			if(tmp.size() > 0) text.append(child_tabs);
		}
		text.append(tmp);
    }

    if(Name != "")
    {
        if(SelfClosing)
		{
            text.append(" />");
		}
        else
        {
            if(Void)
                text.append(">");
            else
            {
				if(!bMinify && !force_minify_tag)
				{
					text = EnsureLastChar(text, '\n');
					text.append(tabs);
				}
                text.append("</");
                text.append(Name);
                text.append(">");
            }
			if(!bMinify)
			{
				text.append("\n");
				if(NewLineAfter || Name == "template")
					text.append(LINE_TERM);
			}
			else
			{
				if(SpaceAfter)
					text.append(" ");
			}
        }
    }
	else
		text = EnsureLastChar(text, '\n');

    return text;
}

string CWNode::GetJSX(int iIndent, string sWhitespace)
{
	int child_indent = iIndent + 1;
	if(Name == "")
	{
		iIndent--;
		child_indent--;
	}
	string tabs = "";
	if(iIndent > 0) tabs = string(iIndent, '\t');
	string indent = sWhitespace + tabs;

	string child_tabs = "";
	if(child_indent > 0) child_tabs = string(child_indent, '\t');


    string text = "";

    bool dont_minify_text = Name == "textarea" || Name == "pre" || Name == "code" || Name == "style";
	bool force_minify_tag = Name == "textarea" || Name == "option";

	// OPEN TAG
    if(Name != "")
    {
		text.append(indent);
        text.append("<");
        text.append(Name);
        int attr_count = Attr->Count();
        for(int i = 0; i < attr_count; i++)
        {
            if(Attr->IsNameValue(i))
            {
				string attr_name = Attr->GetName(i);
				string escaped_value = Attr->GetValue(i);

				if(attr_name == "class") attr_name = "className";

				if(escaped_value.size() > 1 && escaped_value[0] == '{' && escaped_value[escaped_value.size() - 1] == '}')
				{
					text.append(" " + attr_name + "=" + escaped_value);
				}
				else
					text.append(" " + attr_name + "=\"" + escaped_value + "\"");
            }
            else
			{
				string attr_name = Attr->Strings[i];
				if(attr_name == "class") attr_name = "className";
                text.append(" " + attr_name);
			}
        }

        if(!SelfClosing && !Void)
        {
			text.append(">");
			if(!force_minify_tag) {
				text.append(LINE_TERM);
			}
        }
    }

	// CHILDS
    int child_count = Childs->Count();
    for(int i = 0; i < child_count; i++)
    {
		// TEXT BEFORE CHILD ELEMENT
		string last_line_whitespace = "";
        if(dont_minify_text)
            text.append(Text->Strings[i]);
        else
        {
			last_line_whitespace = LastLineWhitespace(Text->Strings[i]);

			string tmp = Trim(Text->Strings[i], true, true);
			ReplaceSubString(&tmp, "\r\n", "\a");
			ReplaceSubString(&tmp, "\r", "\a");
			ReplaceSubString(&tmp, "\n", "\a");
			ReplaceSubString(&tmp, "\a", LINE_TERM);
			if(tmp.size() > 0) text.append(sWhitespace + child_tabs);
            text.append(tmp);
			if(tmp.size() > 0) text.append(LINE_TERM);
        }
		
		// CHILD ELEMENT
		string child_whitespace = last_line_whitespace;
		if(child_whitespace == "") {
			child_whitespace = sWhitespace;
		}

		if(Name == "") child_indent++;
        text.append(Childs->Items[i]->GetJSX(child_indent, child_whitespace));
		if(Name == "") child_indent--;

		text.append(last_line_whitespace);
    }

	// TEXT INSIDE ELEMENT (AFTER LAST CHILD/BEFORE CLOSING TAG)
    if(dont_minify_text)
        text.append(Text->Strings[child_count]);
	else
    {
		string tmp = Trim(Text->Strings[child_count], true, true);

		ReplaceSubString(&tmp, "\r\n", "\a");
		ReplaceSubString(&tmp, "\r", "\a");
		ReplaceSubString(&tmp, "\n", "\a");
		ReplaceSubString(&tmp, "\a", LINE_TERM);
		if(tmp.size() > 0) text.append(sWhitespace + child_tabs);
		text.append(tmp);
    }

	// CLOSING TAG
    if(Name != "")
    {
        if(SelfClosing)
		{
            text.append(" />");
			text.append(LINE_TERM);
		}
        else
        {
            if(Void)
                text.append(">");
            else
            {
				if(!force_minify_tag)
				{
					text = EnsureLastChar(text, '\n');
					text.append(indent);
				}
                text.append("</");
                text.append(Name);
                text.append(">");
            }
			text.append("\n");
			if(NewLineAfter || Name == "template") {
				text.append(LINE_TERM);
			}
        }
    } else {
		text = TrimRight(text, false, true);
		text.append(LINE_TERM);
		text.append(LINE_TERM);	
	}

    return text;
}

string CWNode::JadeFormatedText(string sText, int* pIndent, bool bInLineWithTag)
{
	if(sText == "") return "";

	// --- put spacebars block statements into separate lines
	string tmp_block = "";
	int tmp_pos = FindBlock(&sText, "{{#", "}}", &tmp_block, true, 0);
	while(tmp_pos >= 0)
	{
		string new_block = "\n" + tmp_block + "\n";
		sText.replace(tmp_pos, tmp_block.size(), new_block);
		tmp_pos = FindBlock(&sText, "{{#", "}}", &tmp_block, true, tmp_pos + new_block.size());
	}

	tmp_block = "";
	tmp_pos = FindBlock(&sText, "{{/", "}}", &tmp_block, true, 0);
	while(tmp_pos >= 0)
	{
		string new_block = "\n" + tmp_block + "\n";
		sText.replace(tmp_pos, tmp_block.size(), new_block);
		tmp_pos = FindBlock(&sText, "{{/", "}}", &tmp_block, true, tmp_pos + new_block.size());
	}

	tmp_block = "";
	tmp_pos = FindBlock(&sText, "{{>", "}}", &tmp_block, true, 0);
	while(tmp_pos >= 0)
	{
		string new_block = "\n" + tmp_block + "\n";
		sText.replace(tmp_pos, tmp_block.size(), new_block);
		tmp_pos = FindBlock(&sText, "{{>", "}}", &tmp_block, true, tmp_pos + new_block.size());
	}

	ReplaceSubString(&sText, "{{else}}", "\n{{else}}\n");
	// ---

	// append text before child
	CWStringList tmp;
	tmp.Append(Trim(sText));
	int tmp_count = tmp.Count();

	if(tmp_count == 0) return "";

	string text = "";
	bool inside_markdown = false;
	for(int x = 0; x < tmp_count; x++)
	{
		string s = Trim(tmp.Strings[x]);
		bool skip = false;
		bool increase_indent = false;
		bool no_pipe = false;

		// spacebars block begin
		if(s.find("{{#") != string::npos)
		{
			ReplaceSubString(&s, "{{#", "");
			ReplaceSubString(&s, "}}", "");
			s = Trim(s);

			if(s == "markdown") inside_markdown = true;

			if(s != "if" && s != "each" && s != "with" && s != "unless") s = "+" + s;

			increase_indent = true;
			no_pipe = true;
		}

		// spacebars block end
		if(s.find("{{/") != string::npos)
		{
			ReplaceSubString(&s, "{{/", "");
			ReplaceSubString(&s, "}}", "");
			s = Trim(s);

			if(s == "markdown") inside_markdown = false;

			skip = true;
			*pIndent = *pIndent - 1;
		}

		// spacebars else
		if(s == "{{else}}")
		{
			s = "else";
			no_pipe = true;
			increase_indent = true;
			*pIndent = *pIndent - 1;
		}

		// inclusion tag
		if(s.find("{{>") != string::npos)
		{
			ReplaceSubString(&s, "{{>", "");
			ReplaceSubString(&s, "}}", "");
			s = Trim(s);
			s.insert(0, 1, '+');
			no_pipe = true;
		}

		if(!skip)
		{
			if(s != "" || inside_markdown)
			{
				text.append(LINE_TERM);
				text.append(string((*pIndent) * 2, ' '));

				if(!no_pipe && !inside_markdown) text.append("| ");

				if(!no_pipe && inside_markdown)
					text.append(ReplaceSubString(tmp.Strings[x], "\t", "    "));
				else
					text.append(s);

				if(increase_indent) *pIndent = *pIndent + 1;
			}
		}
	}
	return text;
}

string CWNode::GetJade(int iIndent)
{
	int child_indent = iIndent + 1;
	if(Name == "")
	{
		iIndent = 0;
		child_indent = 0;
	}
	string tabs(iIndent * 2, ' ');

    string text = "";
    if(Name != "")
    {
		text.append(LINE_TERM);
    	if(Name == "template") text.append(LINE_TERM);

		text.append(tabs);
        text.append(Name);
        int attr_count = Attr->Count();
		if(attr_count > 0)
		{
			text.append("(");
			for(int i = 0; i < attr_count; i++)
			{
				if(i > 0) text.append(" ");
				if(Attr->IsNameValue(i))
				{
					string escaped_value = Attr->GetValue(i);
					ReplaceSubString(&escaped_value, "\"", "&quot;");
					text.append(Attr->GetName(i) + "=\"" + escaped_value + "\"");
				}
				else
				{
					string tmp = Attr->Strings[i];
					string tmp_attr = "";
					int pos = FindBlock(&tmp, "{{", "}}", &tmp_attr);
					if(pos >= 0)
					{
						ReplaceSubString(&tmp, "\"", "\'");
						ReplaceSubString(&tmp, "{{", "$dyn=\"{{");
						ReplaceSubString(&tmp, "}}", "}}\"");
					}
					text.append(tmp);
				}
			}
			text.append(")");
		}
    }

    int child_count = Childs->Count();
    for(int i = 0; i < child_count; i++)
    {
		text.append(JadeFormatedText(Text->Strings[i], &child_indent, i == 0));
		// append child
        text.append(Childs->Items[i]->GetJade(child_indent));
    }

	// text after all childs

	text.append(JadeFormatedText(Text->Strings[child_count], &child_indent, child_count == 0));

	return text;
}

int CWNode::IndexOfChild(CWNode* pNode)
{
    return Childs->IndexOf(pNode);
}

string CWNode::GetText()
{
    string res = "";
    int count = Text->Count();
    for(int i = 0; i < count; i++)
    {
        if(i > 0)
            res.append(LINE_TERM);
        res.append(Text->Strings[i]);
    }
    return res;
}

void CWNode::SetText(const string& sText)
{
    Text->Strings[Childs->Count()] = sText;
}

void CWNode::SetTextBeforeChild(const string& sText, int iChildIndex)
{
    // set text
    Text->Strings[iChildIndex] = sText;
}

void CWNode::SetTextBeforeChild(const string& sText, CWNode* pChild)
{
    // find child
    int index = IndexOfChild(pChild);

    // set text
    Text->Strings[index] = sText;
}

void CWNode::SetTextAfterChild(const string& sText, int iChildIndex)
{
    // set text
    Text->Strings[iChildIndex + 1] = sText;
}

void CWNode::SetTextAfterChild(const string& sText, CWNode* pChild)
{
    // find child
    int index = IndexOfChild(pChild);

    // set text
    Text->Strings[index + 1] = sText;
}

void CWNode::AppendText(const string& sText)
{
    Text->Strings[Childs->Count()].append(sText);
}

void CWNode::AppendTextBeforeChild(const string& sText, int iChildIndex)
{
    // set text
    Text->Strings[iChildIndex].append(sText);
}

void CWNode::AppendTextBeforeChildAndSubstring(const string& sText, int iChildIndex, string sSubString)
{
    // set text
	int pos = FindSubString(&(Text->Strings[iChildIndex]), sSubString, true);
	if(pos < 0)
		Text->Strings[iChildIndex].append(sText);
	else
		Text->Strings[iChildIndex].insert(pos, sText);
}

void CWNode::AppendTextBeforeChild(const string& sText, CWNode* pChild)
{
    // find child
    int index = IndexOfChild(pChild);

    // set text
    Text->Strings[index].append(sText);
}

void CWNode::AppendTextAfterChild(const string& sText, int iChildIndex)
{
    // set text
    Text->Strings[iChildIndex + 1].append(sText);
}

void CWNode::AppendTextAfterChild(const string& sText, CWNode* pChild)
{
    // find child
    int index = IndexOfChild(pChild);

    // set text
    Text->Strings[index + 1].append(sText);
}

void CWNode::ReplaceText(const string& sOld, const string& sNew, bool bCaseSensitive, bool bRecoursive)
{
	Text->ReplaceSubStr(sOld, sNew, bCaseSensitive);
	if(bRecoursive)
		Childs->ReplaceText(sOld, sNew, bCaseSensitive, bRecoursive);
}

void CWNode::ReplaceAttrValues(const string& sOld, const string& sNew, bool bCaseSensitive, bool bRecoursive)
{
	Attr->ReplaceValueSubstring(sOld, sNew, bCaseSensitive);
	if(bRecoursive)
		Childs->ReplaceAttrValues(sOld, sNew, bCaseSensitive, bRecoursive);
}

void CWNode::Replace(const string& sOld, const string& sNew, bool bCaseSensitive, bool bRecoursive)
{
	ReplaceText(sOld, sNew, bCaseSensitive, bRecoursive);
	ReplaceAttrValues(sOld, sNew, bCaseSensitive, bRecoursive);
}

bool CWNode::GotSubstring(const string& sText, bool bCaseSensitive, bool bRecoursive)
{
	if(Text->FindSubStr(sText, bCaseSensitive) >= 0) {
		return true;
	}

	if(bRecoursive)
		return Childs->GotSubstring(sText, bCaseSensitive, bRecoursive);

	return false;
}

void CWNode::AddClass(const string& sClass)
{
    if(sClass == "")
        return;

    CWStringList new_list;
    StringToList(sClass, ' ', &new_list);

    CWStringList old_list;
    StringToList(Attr->GetValue("class"), ' ', &old_list);

    int new_count = new_list.Count();
    for(int i = 0; i < new_count; i++)
    {
        if(new_list.Strings[i] != "" && old_list.Find(new_list.Strings[i], true) < 0)
            old_list.Add(new_list.Strings[i]);
    }
    Attr->SetValue("class", ListToString(&old_list, ' '));
}

void CWNode::RemoveClass(const string& sClass)
{
    if(sClass == "")
        return;

    CWStringList new_list;
    StringToList(sClass, ' ', &new_list);

    CWStringList old_list;
    StringToList(Attr->GetValue("class"), ' ', &old_list);

    int new_count = new_list.Count();
    for(int i = 0; i < new_count; i++)
    {
        if(new_list.Strings[i] != "")
        {
            int index = old_list.Find(new_list.Strings[i], true);
            if(index >= 0)
                old_list.Delete(index);
        }
    }
	Attr->SetValue("class", ListToString(&old_list, ' '));
}

bool CWNode::HasClass(const string& sClass)
{
	if(sClass == "") return false;

    CWStringList new_list;
    StringToList(sClass, ' ', &new_list);

    CWStringList old_list;
    StringToList(Attr->GetValue("class"), ' ', &old_list);

	int new_count = new_list.Count();
    for(int i = 0; i < new_count; i++)
		if(old_list.Find(new_list.Strings[i], true) < 0)
			return false;

	return true;
}


void CWNode::AddChild(CWNode* pNode, const string& sTextBefore, const string& sTextAfter)
{
    int child_count = Childs->Count();
    Text->Strings[child_count].append(sTextBefore);
    Childs->Add(pNode);
    Text->Add(sTextAfter);
}

CWNode* CWNode::AddChild(const string& sName, const string& sText)
{
    CWNode* child = new CWNode(sName, sText);
    AddChild(child);
    return child;
}

void CWNode::AddChildsOfNode(CWNode* pNode)
{
	int child_count = Childs->Count();
	Text->Strings[child_count].append(pNode->Text->Strings[0]);
	int source_child_count = pNode->Childs->Count();
	for(int i = 0; i < source_child_count; i++)
	{
		AddChild(pNode->Childs->Items[i], "", pNode->Text->Strings[i + 1]);
	}
}

void CWNode::InsertChildsOfNode(CWNode* pNode, int iIndex)
{
	int source_child_count = pNode->Childs->Count();
	for(int i = 0; i < source_child_count; i++)
	{
		InsertChildSpec(pNode->Childs->Items[i], iIndex + i);
		AppendTextBeforeChild(pNode->Text->Strings[i], iIndex + i);
	}
	AppendTextBeforeChild(pNode->Text->Strings[source_child_count], iIndex + source_child_count);
}

void CWNode::InsertChild(CWNode* pNode, int iIndex, const string& sTextBefore, const string& sTextAfter)
{
	string old_text_before = Text->Strings[iIndex];
    Text->Strings[iIndex] = sTextBefore;
    Childs->Insert(pNode, iIndex);
    Text->Insert(sTextAfter + old_text_before, iIndex + 1);
}

void CWNode::InsertChildSpec(CWNode* pNode, int iIndex, const string& sTextBefore, const string& sTextAfter)
{
    Text->Strings[iIndex].append(sTextBefore);
    Childs->Insert(pNode, iIndex);
    Text->Insert(sTextAfter, iIndex + 1);	
}

CWNode* CWNode::InsertChild(const string& sName, int iIndex, const string& sText)
{
    CWNode* child = new CWNode();
    child->Name = sName;
    child->Void = IsVoidElement(child->Name);
    child->SetText(sText);
    InsertChild(child, iIndex);
    return child;
}

void CWNode::DeleteChild(int iIndex)
{
    Childs->Delete(iIndex);
    Text->Strings[iIndex].append(Text->Strings[iIndex + 1]);
    Text->Delete(iIndex + 1);
}

bool CWNode::DeleteChild(CWNode* pNode, bool bRecoursive)
{
    int child_id = IndexOfChild(pNode);
    if(child_id < 0)
    {
        if(bRecoursive)
        {
            if(Childs->Delete(pNode, bRecoursive))
                return true;
        }
        return false;
    }
    DeleteChild(child_id);
    return true;
}

CWNode* CWNode::DetachChild(int iIndex)
{
    CWNode* item = Childs->Detach(iIndex);
    if(item == NULL)
        return NULL;

    Text->Strings[iIndex].append(Text->Strings[iIndex + 1]);
    Text->Delete(iIndex + 1);
    return item;
}

bool CWNode::DetachChild(CWNode* pNode, bool bRecoursive)
{
    int child_id = IndexOfChild(pNode);
    if(child_id < 0)
    {
        if(bRecoursive)
        {
            if(Childs->Detach(pNode, bRecoursive))
                return true;
        }
        return false;
    }
    DetachChild(child_id);
    return true;
}

void CWNode::Flatten()
{
	int child_count = Childs->Count();
	for(int i = child_count - 1; i >= 0; i--)
	{
		CWNode* child = Childs->Items[i];
		child->Flatten();
		if(child->Name == "")
		{
			InsertChildsOfNode(child, i);
			DetachChild(child, true);
		}
	}
}

CWNode* CWNode::FindChildByName(const string& sName, bool bCaseSensitive, bool bRecoursive)
{
    return Childs->FindItemByName(sName, bCaseSensitive, bRecoursive);
}

CWNode* CWNode::FindChildByNameAndAttr(const string& sName, const string& sAttrName, const string& sAttrValue, bool bCaseSensitive, bool bRecoursive)
{
    return Childs->FindItemByNameAndAttr(sName, sAttrName, sAttrValue, bCaseSensitive, bRecoursive);
}

CWNode* CWNode::FindChildByID(const string& sID, bool bCaseSensitive, bool bRecoursive)
{
    return Childs->FindItemByID(sID, bCaseSensitive, bRecoursive);
}

CWNode* CWNode::FindChildByClass(const string& sClass, bool bCaseSensitive, bool bRecoursive)
{
    return Childs->FindItemByClass(sClass, bCaseSensitive, bRecoursive);
}

CWNode* CWNode::FindChild(const string& sSelector, bool bCaseSensitive, bool bRecoursive)
{
    if(sSelector == "")
        return NULL;

    if(sSelector[0] == '.') return FindChildByClass(sSelector.substr(1, sSelector.size() - 1), bCaseSensitive, bRecoursive);

    if(sSelector[0] == '#') return FindChildByID(sSelector.substr(1, sSelector.size() - 1), bCaseSensitive, bRecoursive);

    return FindChildByName(sSelector, bCaseSensitive, bRecoursive);
}

string CWNode::GetChildText(const string& sSelector, bool bCaseSensitive, bool bRecoursive)
{
	CWNode* child = FindChild(sSelector, bCaseSensitive, bRecoursive);
	if(child == NULL) return "";
	return child->GetText();
}

CWNode* CWNode::FindParentOfChild(CWNode* pChild)
{
    if(pChild == NULL) return NULL;

    int child_count = Childs->Count();
    for(int i = 0; i < child_count; i++)
    {
        if(Childs->Items[i] == pChild)
            return this;

        CWNode* parent = Childs->Items[i]->FindParentOfChild(pChild);
        if(parent != NULL) return parent;
    }
    return NULL;
}

bool CWNode::ReplaceChild(const string& sSelector, CWNode* pNewChild, bool bCaseSensitive, bool bRecoursive)
{
	CWNode* old_child = FindChild(sSelector, bCaseSensitive, bRecoursive);
	if(old_child == NULL) return false;

	CWNode* parent_node = FindParentOfChild(old_child);
	if(parent_node == NULL) return false;

	int old_index = parent_node->IndexOfChild(old_child);
	if(old_index < 0) return false;

    parent_node->DeleteChild(old_index);
    parent_node->InsertChild(pNewChild, old_index);

	return true;
}

void CWNode::FindChildsByName(const string& sName, bool bCaseSensitive, bool bRecoursive, CWNodeList* pResult, bool bClearResults)
{
    Childs->FindItemsByName(sName, bCaseSensitive, bRecoursive, pResult, bClearResults);
}

void CWNode::FindChildsByID(const string& sID, bool bCaseSensitive, bool bRecoursive, CWNodeList* pResult, bool bClearResults)
{
    Childs->FindItemsByID(sID, bCaseSensitive, bRecoursive, pResult, bClearResults);
}

// --------------


CWNodeList::CWNodeList(bool bOwnsObjects)
{
    OwnsObjects = bOwnsObjects;
}

CWNodeList::~CWNodeList()
{
    Clear();
}

int CWNodeList::Count()
{
    return Items.size();
}

void CWNodeList::Clear()
{
    if(OwnsObjects)
    {
        int item_count = Count();
        for(int i = 0; i < item_count; i++)
            delete Items[i];
    }

    Items.clear();
}

void CWNodeList::CopyFrom(CWNodeList* pCopyFrom)
{
    Clear();
    int child_count = pCopyFrom->Count();
    for(int i = 0; i < child_count; i++)
    {
        CWNode* child = new CWNode();
        child->CopyFrom(pCopyFrom->Items[i]);
        Add(child);
    }
}

int CWNodeList::IndexOf(CWNode* pItem)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
        if(Items[i] == pItem)
            return i;
    return -1;
}

void CWNodeList::Add(CWNode* pItem)
{
    Items.push_back(pItem);
}

void CWNodeList::Insert(CWNode* pItem, int iIndex)
{
    Items.insert(Items.begin() + iIndex, pItem);
}

void CWNodeList::Delete(int iIndex)
{
    if(OwnsObjects)
        delete Items[iIndex];
    Items.erase(Items.begin() + iIndex);
}

bool CWNodeList::Delete(CWNode* pNode, bool bRecoursive)
{
    int item_index = IndexOf(pNode);
    if(item_index < 0)
    {
        if(bRecoursive)
        {
            int item_count = Count();
            for(int i = 0; i < item_count; i++)
            {
                if(Items[i]->DeleteChild(pNode, bRecoursive))
                    return true;
            }
        }
        return false;
    }
    Delete(item_index);
    return true;
}

CWNode* CWNodeList::Detach(int iIndex)
{
    CWNode* item = Items[iIndex];
    Items.erase(Items.begin() + iIndex);
    return item;
}

bool CWNodeList::Detach(CWNode* pNode, bool bRecoursive)
{
    int item_index = IndexOf(pNode);
    if(item_index < 0)
    {
        if(bRecoursive)
        {
            int item_count = Count();
            for(int i = 0; i < item_count; i++)
            {
                if(Items[i]->DetachChild(pNode, bRecoursive))
                    return true;
            }
        }
        return false;
    }
    Detach(item_index);
    return true;
}

CWNode* CWNodeList::FindItemByName(const string& sName, bool bCaseSensitive, bool bRecoursive)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
    {
        if(bCaseSensitive)
        {
            if(Items[i]->Name == sName) return Items[i];
        }
        else
        {
            if(strcasecmp(Items[i]->Name.c_str(), sName.c_str()) == 0) return Items[i];
        }
    }

    if(bRecoursive)
    {
        for(int i = 0; i < item_count; i++)
        {
            CWNode* item = Items[i]->FindChildByName(sName, bCaseSensitive, bRecoursive);
            if(item != NULL) return item;
        }
    }

    return NULL;
}

CWNode* CWNodeList::FindItemByNameAndAttr(const string& sName, const string& sAttrName, const string& sAttrValue, bool bCaseSensitive, bool bRecoursive)
{
    CWNodeList list;
    list.OwnsObjects = false;

    FindItemsByName(sName, bCaseSensitive, bRecoursive, &list, true);

    int item_count = list.Count();
    for(int i = 0; i < item_count; i++)
    {
        CWNode* node = list.Items[i];
        if(bCaseSensitive)
        {
            if(node->Attr->GetValue(sAttrName) == sAttrValue) return node;
        }
        else
        {
            if(strcasecmp(node->Attr->GetValue(sAttrName).c_str(), sAttrValue.c_str()) == 0) return node;
        }
    }

    return NULL;
}

CWNode* CWNodeList::FindItemByID(const string& sID, bool bCaseSensitive, bool bRecoursive)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
    {
        if(bCaseSensitive)
        {
            if(Items[i]->Attr->GetValue("id") == sID) return Items[i];
        }
        else
        {
            if(strcasecmp(Items[i]->Attr->GetValue("id").c_str(), sID.c_str()) == 0) return Items[i];
        }

        if(bRecoursive)
        {
            CWNode* item = Items[i]->FindChildByID(sID, bCaseSensitive, bRecoursive);
            if(item != NULL) return item;
        }
    }

    return NULL;
}

CWNode* CWNodeList::FindItemByClass(const string& sClass, bool bCaseSensitive, bool bRecoursive)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
    {
        CWStringList class_list;
        StringToList(Items[i]->Attr->GetValue("class"), ' ', &class_list);
        if(class_list.Find(sClass, bCaseSensitive) >= 0)
            return Items[i];

        if(bRecoursive)
        {
            CWNode* item = Items[i]->FindChildByClass(sClass, bCaseSensitive, bRecoursive);
            if(item != NULL) return item;
        }
    }

    return NULL;
}

CWNode* CWNodeList::FindItem(const string& sSelector, bool bCaseSensitive, bool bRecoursive)
{
    if(sSelector == "") return NULL;

    if(sSelector[0] == '.') return FindItemByClass(sSelector.substr(1, sSelector.size() - 1), bCaseSensitive, bRecoursive);

    if(sSelector[0] == '#') return FindItemByID(sSelector.substr(1, sSelector.size() - 1), bCaseSensitive, bRecoursive);

    return FindItemByName(sSelector, bCaseSensitive, bRecoursive);
}

void CWNodeList::FindItemsByName(const string& sName, bool bCaseSensitive, bool bRecoursive, CWNodeList* pResult, bool bClearResults)
{
    if(bClearResults) pResult->Clear();

    int item_count = Count();
    for(int i = 0; i < item_count; i++)
    {
        if(bCaseSensitive)
        {
            if(Items[i]->Name == sName) pResult->Add(Items[i]);
        }
        else
        {
            if(strcasecmp(Items[i]->Name.c_str(), sName.c_str()) == 0) pResult->Add(Items[i]);
        }

        if(bRecoursive)
            Items[i]->FindChildsByName(sName, bCaseSensitive, bRecoursive, pResult, false);
    }
}

void CWNodeList::FindItemsByID(const string& sID, bool bCaseSensitive, bool bRecoursive, CWNodeList* pResult, bool bClearResults)
{
    if(bClearResults) pResult->Clear();

    int item_count = Count();
    for(int i = 0; i < item_count; i++)
    {
        if(bCaseSensitive)
        {
            if(Items[i]->Attr->GetValue("id") == sID) pResult->Add(Items[i]);
        }
        else
        {
            if(strcasecmp(Items[i]->Attr->GetValue("id").c_str(), sID.c_str()) == 0) pResult->Add(Items[i]);
        }

        if(bRecoursive)
            Items[i]->FindChildsByID(sID, bCaseSensitive, bRecoursive, pResult, false);
    }
}

void CWNodeList::ReplaceText(const string& sOld, const string& sNew, bool bCaseSensitive, bool bRecoursive)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
    	Items[i]->ReplaceText(sOld, sNew, bCaseSensitive, bRecoursive);
}

void CWNodeList::ReplaceAttrValues(const string& sOld, const string& sNew, bool bCaseSensitive, bool bRecoursive)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
    	Items[i]->ReplaceAttrValues(sOld, sNew, bCaseSensitive, bRecoursive);
}

bool CWNodeList::GotSubstring(const string& sText, bool bCaseSensitive, bool bRecoursive)
{
    int item_count = Count();
    for(int i = 0; i < item_count; i++)
		if(Items[i]->GotSubstring(sText, bCaseSensitive, bRecoursive))
			return true;

	return false;
}
