#include "cppw_sock.h"

#include <stdlib.h>
#include <string.h>
#include <stdio.h>

#include "cppw_file.h"
#include "cppw_process.h"

#ifdef _WIN32

    #include <winsock2.h>
    #include <ws2tcpip.h>

    const char *inet_ntop(int af, const void *src, char *dst, socklen_t size)
    {
      struct sockaddr_storage ss;
      unsigned long s = size;

      ZeroMemory(&ss, sizeof(ss));
      ss.ss_family = af;

      switch(af) {
        case AF_INET:
          ((struct sockaddr_in *)&ss)->sin_addr = *(struct in_addr *)src;
          break;
        case AF_INET6:
          ((struct sockaddr_in6 *)&ss)->sin6_addr = *(struct in6_addr *)src;
          break;
        default:
          return NULL;
      }
      /* cannot direclty use &size because of strict aliasing rules */
      return (WSAAddressToString((struct sockaddr *)&ss, sizeof(ss), NULL, dst, &s) == 0)?
              dst : NULL;
    }


    int inet_pton(int af, const char *src, void *dst)
    {
      struct sockaddr_storage ss;
      int size = sizeof(ss);
      char src_copy[INET6_ADDRSTRLEN+1];

      ZeroMemory(&ss, sizeof(ss));
      /* stupid non-const API */
      strncpy (src_copy, src, INET6_ADDRSTRLEN+1);
      src_copy[INET6_ADDRSTRLEN] = 0;

      if (WSAStringToAddress(src_copy, af, NULL, (struct sockaddr *)&ss, &size) == 0) {
        switch(af) {
          case AF_INET:
        *(struct in_addr *)dst = ((struct sockaddr_in *)&ss)->sin_addr;
        return 1;
          case AF_INET6:
        *(struct in6_addr *)dst = ((struct sockaddr_in6 *)&ss)->sin6_addr;
        return 1;
        }
      }
      return 0;
    }

    bool wsa_startup(string* pErrorMessage)
    {
        WSADATA wsaData;
        if (WSAStartup(MAKEWORD(2, 0), &wsaData) != 0)
        {
            if(pErrorMessage != NULL) *pErrorMessage = "WSAStartup() failed";
            return false;
        }
        return true;
    }

    bool wsa_cleanup()
    {
        if(WSACleanup() != 0)
			return false;
		return true;
    }

    bool CloseTCPSocket(int iSocket)
    {
        if(closesocket(iSocket) != 0)
			return false;

        return wsa_cleanup();
    }

#else
    #include <sys/socket.h>
    #include <arpa/inet.h>
    #include <netdb.h>
    #include <unistd.h>

    bool wsa_startup(string* pErrorMessage)
    {
        return true;
    }

    bool wsa_cleanup()
    {
        return true;
    }

    bool CloseTCPSocket(int iSocket)
    {
        if(close(iSocket) != 0)
			return false;

		return true;
    }

#endif

bool CreateTCPSocket(int* pSocket, string* pErrorMessage)
{
    if(!wsa_startup(pErrorMessage))
		return false;

    int sock;
    if((sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)) < 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Can't create TCP socket";
        return false;
    }

	*pSocket = sock;

    return true;
}

bool GetIP(string sHost, string* pIPAddress, string* pErrorMessage)
{
    if(!wsa_startup(pErrorMessage))
		return false;

    struct hostent *hent;
    int iplen = 15; //XXX.XXX.XXX.XXX
    char *ip = (char *)malloc(iplen+1);
    memset(ip, 0, iplen+1);
    char* host = (char*)sHost.c_str();
    if((hent = gethostbyname(host)) == NULL)
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Can't get IP";
        return false;
    }

    if(inet_ntop(AF_INET, (void *)hent->h_addr_list[0], ip, iplen) == NULL)
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Can't resolve host";
        return false;
    }

    *pIPAddress = ip;
    free(ip);

    wsa_cleanup();

    return true;
}

char *build_get_query(char *host, char *page, char* useragent, char* params, char* cookies)
{
    char *query;
    int content_length = strlen(params);

    char* getpage = (char *)malloc(strlen(page) + strlen(params) + 1);
	char* getpage_ptr = getpage;
    strcpy(getpage, page);
    if(content_length > 0)
    {
        strcat(getpage, "?");
        strcat(getpage, params);
    }

    if(getpage[0] == '/')
        getpage = getpage + 1;

    char tpl[255];
    strcpy(tpl, "GET /%s HTTP/1.1\r\nHost: %s\r\nUser-Agent: %s\r\nConnection: close\r\n");

    if(strlen(cookies) != 0)
	{
		strcat(tpl, "Cookie: %s\r\n\r\n");
		query = (char *)malloc(strlen(host) + strlen(getpage) + strlen(params) + strlen(useragent) + strlen(cookies) + strlen(tpl));
		sprintf(query, tpl, getpage, host, useragent, cookies);
	}
	else
	{
		strcat(tpl, "\r\n");
		query = (char *)malloc(strlen(host) + strlen(getpage) + strlen(params) + strlen(useragent) + strlen(tpl));
		sprintf(query, tpl, getpage, host, useragent);
	}

    free(getpage_ptr);
    return query;
}

char *build_post_query(char *host, char *page, char* useragent, char* params, char* cookies)
{
    char *getpage = page;
    if(getpage[0] == '/') {
        getpage = getpage + 1;
	}

	char* query = NULL;

    char tpl[255];
    strcpy(tpl, "POST /%s HTTP/1.1\r\nHost: %s\r\nUser-Agent: %s\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: %d\r\nConnection: close\r\n");
	if(strlen(cookies) != 0)
	{
		strcat(tpl, "Cookie: %s\r\n\r\n%s");
		query = (char *)malloc(strlen(host) + strlen(getpage) + strlen(params) + strlen(useragent) + strlen(cookies) + strlen(tpl));
		sprintf(query, tpl, getpage, host, useragent, strlen(params), cookies, params);
	}
	else
	{
		strcat(tpl, "\r\n%s");
		query = (char *)malloc(strlen(host) + strlen(getpage) + strlen(params) + strlen(useragent) + strlen(tpl));
		sprintf(query, tpl, getpage, host, useragent, strlen(params), params);
	}

    return query;
}

void SplitURL(string sURL, string* pProtocol, string* pHost, int* pPort, string* pPage, string* pRequest)
{
	*pProtocol = "";
	*pHost = "";
	*pPort = 80;
	*pPage = "";
	*pRequest = "";

	string url = sURL;
	int request_pos = FindChar(sURL.c_str(), '?', 0);
	if(request_pos > 0)
	{
		url = sURL.substr(0, request_pos);
		*pRequest = sURL.substr(request_pos + 1, sURL.size() - (request_pos + 1));
	}

	CWStringList path_list;
	StringToList(url, '/', &path_list);
	if(path_list.Count() > 2)
	{
		*pProtocol = path_list.Strings[0];

		string host = path_list.Strings[2];
		CWStringList host_list;
		StringToList(host, ':', &host_list);
		if(host_list.Count() > 1)
		{
			*pHost = host_list.Strings[0];
			*pPort = StrToIntDef(host_list.Strings[1], *pPort);
		}
		else
			*pHost = host;

		string page = "";
		for(int i = 3; i < path_list.Count(); i++)
		{
			if(i > 3) page = page + "/";
			page = page + path_list.Strings[i];
		}
		*pPage = page;
	}
}

bool IsIP(string sString)
{
	CWStringList list;
	StringToList(sString, '.', &list);

	if(list.Count() != 4) return false;

	for(int i = 0; i < list.Count(); i++)
		if(StrToIntDef(list.Strings[i], -1) < 0)
			return false;

	return true;
}

void DecodeHTTPField(const string& sField, string* pName, string* pValue)
{
	*pName = "";
	*pValue = "";
	CWStringList temp_list;
	StringToList(sField, ':', &temp_list);
	int count = temp_list.Count();
	if(count > 0)
		*pName = Trim(temp_list.Strings[0]);

	string val = "";
	for(int i = 1; i < count; i++)
	{
		if(i > 1)
			val.append(":");
		val.append(temp_list.Strings[i]);
	}

	*pValue = Trim(val);
}

void DecodeHTTPResponse(const string& sResponseHeader, CWStringList* pResponseFields)
{
	CWStringList temp_list;
	temp_list.SetText(sResponseHeader);
	int field_count = temp_list.Count();
	for(int i = 0; i < field_count; i++)
	{
		string name = "";
		string value = "";
		DecodeHTTPField(temp_list.Strings[i], &name, &value);

		// protocol version and status code
		if(name.find("HTTP/") == 0 && value == "")
		{
			CWStringList tmp;
			StringToList(name, ' ', &tmp);
			tmp.DeleteEmptyLines();
			if(tmp.Count() > 0) pResponseFields->Add("PROTOCOL_VERSION=" + tmp.Strings[0]);
			if(tmp.Count() > 1) pResponseFields->Add("STATUS_CODE=" + tmp.Strings[1]);
			if(tmp.Count() > 2)
			{
				string status_message = "";
				for(int x = 2; x < tmp.Count(); x++)
				{
					if(x > 2) status_message.append(" ");
					status_message.append(tmp.Strings[x]);
				}
				pResponseFields->Add("STATUS_MESSAGE=" + status_message);
			}
		}
		else
		{
			pResponseFields->Add(name + "=" + value);

			// extract cookies
			// ...
		}
	}
}

void DecodeChunkedContent(string* pChunked)
{
	size_t hexstart = 0;
	size_t hexend = string::npos;
	while((hexend = pChunked->find("\r\n", hexstart)) != string::npos)
	{
		string hexstr = pChunked->substr(hexstart, hexend - hexstart);
		pChunked->erase(hexstart, (hexend - hexstart) + 2);
		hexstart = hexstart + (int)strtol(hexstr.c_str(), NULL, 16);
		while(hexstart < pChunked->size() && (pChunked->at(hexstart) == '\r' || pChunked->at(hexstart) == '\n'))
			pChunked->erase(hexstart, 1);
	}
}

bool HTTPRequest(string sHost, int iPort, string sPage, string sURLEncodedRequest, bool bUsePostMethod, string sUserAgent, string sCookies, string* pHTMLContent, CWStringList* pResponseFields, string *pServerIP, string* pErrorMessage)
{
	pResponseFields->Clear();

    struct sockaddr_in *remote;
    int sock;
    int tmpres;
    char *get;
    char buf[BUFSIZ+1];
    char *host = (char*)sHost.c_str();
    char *page = (char*)sPage.c_str();
    char *useragent = (char*)sUserAgent.c_str();
    char *params = (char*)sURLEncodedRequest.c_str();
    char* cookies = (char*)sCookies.c_str();

    bool res = true;

    if(!CreateTCPSocket(&sock, pErrorMessage))
		return false;

    string sip = "";
    if(!GetIP(host, &sip, pErrorMessage))
        return false;
    char* ip = (char*)sip.c_str();

    if(pServerIP != NULL) *pServerIP = ip;

    remote = (struct sockaddr_in *)malloc(sizeof(struct sockaddr_in *));
    remote->sin_family = AF_INET;
    tmpres = inet_pton(AF_INET, ip, (void *)(&(remote->sin_addr.s_addr)));
    if( tmpres < 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Can't set remote->sin_addr.s_addr";
        return false;
    }
    else if(tmpres == 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Invalid IP address";
        return false;
    }
    remote->sin_port = htons(iPort);

    if(connect(sock, (struct sockaddr *)remote, sizeof(struct sockaddr)) < 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Could not connect";
        return false;
    }

    if(bUsePostMethod)
        get = build_post_query(host, page, useragent, params, cookies);
    else
        get = build_get_query(host, page, useragent, params, cookies);

    //Send the query to the server
    unsigned int sent = 0;
    while(sent < strlen(get))
    {
        tmpres = send(sock, get+sent, strlen(get)-sent, 0);
        if(tmpres == -1)
        {
            if(pErrorMessage != NULL) *pErrorMessage = "Can't send query";
            return false;
        }
        sent += tmpres;
    }
    //now it is time to receive the page
    memset(buf, 0, sizeof(buf));

	string content = "";

    while((tmpres = recv(sock, buf, BUFSIZ, 0)) > 0)
    {
        if(tmpres > 0)
        {
            buf[tmpres] = '\0';
            content.append(buf);
        }
    }
    if(tmpres < 0)
    {
        if(pErrorMessage != NULL) *pErrorMessage = "Error receiving data";
        res = false;
    }

    // split header/content
    size_t head_end = content.find("\r\n\r\n");
    int head_term_len = 4;
    if(head_end == string::npos)
    {
		head_end = content.find("\n\n");
    	head_term_len = 2;
    }

    if(head_end != string::npos)
    {
    	CWStringList response_fields;
		string header = content.substr(0, head_end);
        content.erase(0, head_end + head_term_len);

		DecodeHTTPResponse(header, &response_fields);

		if(StrCmpi(response_fields.GetValue("Transfer-Encoding"), "Chunked") == 0)
			DecodeChunkedContent(&content);

        if(pResponseFields != NULL) pResponseFields->Assign(&response_fields);
    }
	if(pHTMLContent != NULL) pHTMLContent->assign(content);

    free(get);
    free(remote);
    CloseTCPSocket(sock);
    return res;
}

bool HTTPRequest(string sURL, bool bUsePostMethod, string sUserAgent, string sCookies, string* pHTMLContent, CWStringList *pResponseFields, string *pServerIP, string* pErrorMessage)
{
	string protocol = "";
	string host = "";
	int port = 80;
	string page = "";
	string request = "";
	SplitURL(sURL, &protocol, &host, &port, &page, &request);

	if(!HTTPRequest(host, port, page, request, bUsePostMethod, sUserAgent, sCookies, pHTMLContent, pResponseFields, pServerIP, pErrorMessage))
		return false;

	return true;
}

bool DownloadFile(string sURL, string sDestFile, string sUserAgent, string* pErrorMessage)
{
	string content = "";
	CWStringList response;
	if(!HTTPRequest(sURL, false, sUserAgent, "", &content, &response, NULL, pErrorMessage))
		return false;

	// check response
	if(response.GetValue("STATUS_CODE") != "200")
	{
		if(pErrorMessage != NULL) *pErrorMessage = response.GetValue("STATUS_CODE") + " " + EnsureLastChar(response.GetValue("STATUS_MESSAGE"), '.');
		return false;
	}

	if(!FileSaveString(sDestFile, &content, 0, pErrorMessage))
		return false;

	return true;
}

bool DownloadFile(string sURL, string sDestFile, string* pErrorMessage)
{
	return DownloadFile(sURL, sDestFile, "cppw", pErrorMessage);
}

bool CURLDownload(string sURL, string sDestFile, bool bSilent, string* pErrorMessage)
{
	string args = "";
	if(bSilent) args.append("-s -S ");
	args.append("-k -L -o ");
	args.append(sDestFile + " " + sURL);

    string curl_path = GetExecutablePath("curl");
    if(curl_path == "")
    {
		if(pErrorMessage != NULL) *pErrorMessage = "Error downloading file. Cannot find \"curl\".";
        return false;
    }

	if(!Execute(curl_path, args.c_str(), true, pErrorMessage))
	{
		if(pErrorMessage != NULL) *pErrorMessage = "Error downloading file. " + *pErrorMessage;
		return false;
	}

	return true;
}
