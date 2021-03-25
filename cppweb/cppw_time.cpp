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

#include "cppw_time.h"

#ifdef _WIN32
    #include <time.h>
    #include <windows.h>

    #if defined(_MSC_VER) || defined(_MSC_EXTENSIONS) || defined(__BORLANDC__)
      #define DELTA_EPOCH_IN_MICROSECS  116444736000000000Ui64
    #else
      #define DELTA_EPOCH_IN_MICROSECS  116444736000000000ULL
    #endif

    void SleepMS(int iMsec)
    {
        Sleep(iMsec);
    }

    #ifdef __MINGW32__
        #include <sys/time.h>
    #else
        struct timezone
        {
          int  tz_minuteswest; // minutes W of Greenwich
          int  tz_dsttime;     // type of dst correction
        };

        int gettimeofday(struct timeval *tv, struct timezone *tz)
        {
          FILETIME ft;
          static int tzflag;

          if (NULL != tv)
          {
            GetSystemTimeAsFileTime(&ft);

            unsigned __int64 tmpres = 0;
            tmpres |= ft.dwHighDateTime;
            tmpres <<= 32;
            tmpres |= ft.dwLowDateTime;

            // converting file time to unix epoch
            tmpres -= DELTA_EPOCH_IN_MICROSECS;
            tmpres /= 10;  // convert into microseconds
            tv->tv_sec = (long)(tmpres / 1000000UL);
            tv->tv_usec = (long)(tmpres % 1000000UL);
          }

          if (NULL != tz)
          {
            if (!tzflag)
            {
              _tzset();
              tzflag++;
            }
            tz->tz_minuteswest = _timezone / 60;
            tz->tz_dsttime = _daylight;
          }

          return 0;
        }
    #endif
#else

    #include <unistd.h>
    #include <sys/time.h>
	#include <ctime>

    void SleepMS(int iMillisec)
    {
        usleep(iMillisec * 1000);
    }

#endif

double GetTimeMS()
{
    struct timeval tvs;
    gettimeofday(&tvs, NULL);

    double res = 0;
    res += tvs.tv_sec * 1000.0; // sec to ms
    res += tvs.tv_usec / 1000.0; // us to ms

    return res;
}

void GetTime(bool bLocalTime, int* pYear, int* pMonth, int* pDay, int* pHour, int* pMin, int* pSec, int* pTtsec) {
    timeval tv;
    gettimeofday(&tv, NULL);

    struct tm * timeinfo;
    time_t rawtime = tv.tv_sec;
	if(bLocalTime) {
		timeinfo = localtime(&rawtime);
	} else {
		timeinfo = gmtime(&rawtime);
	}

    if(pTtsec != NULL) *pTtsec = tv.tv_usec / 100;
    if(pSec != NULL) *pSec = timeinfo->tm_sec;
    if(pMin != NULL) *pMin = timeinfo->tm_min;
    if(pHour != NULL) *pHour = timeinfo->tm_hour;
    if(pDay != NULL) *pDay = timeinfo->tm_mday;
    if(pMonth != NULL) *pMonth = timeinfo->tm_mon + 1;
    if(pYear != NULL) *pYear = timeinfo->tm_year + 1900;
}

double GetElapsedMS(double fOffsetMS)
{
    return GetTimeMS() - fOffsetMS;
}
