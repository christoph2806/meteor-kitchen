#ifndef CPPW_SOCK_H
#define CPPW_SOCK_H

#include "cppw_string.h"

bool wsa_startup(string* pErrorMessage);
bool wsa_cleanup();

bool CreateTCPSocket(int* pSocket, string* pErrorMessage);
bool CloseTCPSocket(int iSocket);

void SplitURL(string sURL, string* pProtocol, string* pHost, int* pPort, string* pPage, string* pRequest);

bool GetIP(string sHost, string* pIPAddress, string* pErrorMessage);
bool IsIP(string sString);

void DecodeHTTPResponse(const string& sResponseHeader, CWStringList* pResponseFields);
bool HTTPRequest(string sHost, int iPort, string sPage, string sURLEncodedRequest, bool bUsePostMethod, string sUserAgent, string sCookies, string* pHTMLContent, CWStringList *pResponseFields, string *pServerIP, string* pErrorMessage);
bool HTTPRequest(string sURL, bool bUsePostMethod, string sUserAgent, string sCookies, string* pHTMLContent, CWStringList *pResponseFields, string *pServerIP, string* pErrorMessage);
bool DownloadFile(string sURL, string sDestFile, string sUserAgent, string* pErrorMessage);
bool DownloadFile(string sURL, string sDestFile, string* pErrorMessage);

bool CURLDownload(string sURL, string sDestFile, bool bSilent, string* pErrorMessage);

#endif
