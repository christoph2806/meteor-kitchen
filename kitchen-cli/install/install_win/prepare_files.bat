rm ..\install_win.exe
rmdir /Q /S files
mkdir files
mkdir files\bin
copy ..\..\bin\meteor-kitchen.exe files\bin\
copy README.txt files\
xcopy ..\..\examples files\examples\ /s /e /h 
xcopy ..\..\node_modules files\node_modules\ /s /e /h
xcopy ..\..\plugins files\plugins\ /s /e /h
xcopy ..\..\templates files\templates\ /s /e /h
pause
