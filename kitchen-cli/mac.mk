##
## Auto Generated makefile by CodeLite IDE
## any manual changes will be erased      
##
## Release
ProjectName            :=kitchen-cli
ConfigurationName      :=Release
WorkspacePath          :=/Users/pera/meteor/meteor-kitchen/kitchen-cli
ProjectPath            :=/Users/pera/meteor/meteor-kitchen/kitchen-cli
IntermediateDirectory  :=./Release
OutDir                 := $(IntermediateDirectory)
CurrentFileName        :=
CurrentFilePath        :=
CurrentFileFullPath    :=
User                   :=Petar Korponaić
Date                   :=09/08/2019
CodeLitePath           :="/Users/pera/Library/Application Support/codelite"
LinkerName             :=/usr/bin/g++
SharedObjectLinkerName :=/usr/bin/g++ -dynamiclib -fPIC
ObjectSuffix           :=.o
DependSuffix           :=.o.d
PreprocessSuffix       :=.i
DebugSwitch            :=-g 
IncludeSwitch          :=-I
LibrarySwitch          :=-l
OutputSwitch           :=-o 
LibraryPathSwitch      :=-L
PreprocessorSwitch     :=-D
SourceSwitch           :=-c 
OutputFile             :=./bin/meteor-kitchen
Preprocessors          :=$(PreprocessorSwitch)NDEBUG 
ObjectSwitch           :=-o 
ArchiveOutputSwitch    := 
PreprocessOnlySwitch   :=-E
ObjectsFileList        :="kitchen-cli.txt"
PCHCompileFlags        :=
MakeDirCommand         :=mkdir -p
LinkOptions            :=  -framework CoreFoundation -framework Security
IncludePath            :=  $(IncludeSwitch). $(IncludeSwitch). $(IncludeSwitch)../cppweb $(IncludeSwitch)../libgit2/output/include 
IncludePCH             := 
RcIncludePath          := 
Libs                   := $(LibrarySwitch)curl $(LibrarySwitch)z $(LibrarySwitch)iconv $(LibrarySwitch)git2 
ArLibs                 :=  "curl" "z" "iconv" "git2" 
LibPath                := $(LibraryPathSwitch). $(LibraryPathSwitch)../libgit2/output/lib 

##
## Common variables
## AR, CXX, CC, AS, CXXFLAGS and CFLAGS can be overriden using an environment variables
##
AR       := /usr/bin/ar rcu
CXX      := /usr/bin/g++
CC       := /usr/bin/gcc
CXXFLAGS :=  -O2 -Wall $(Preprocessors)
CFLAGS   :=  -O2 -Wall $(Preprocessors)
ASFLAGS  := 
AS       := /usr/bin/as


##
## User defined environment variables
##
CodeLiteDir:=/Applications/codelite.app/Contents/SharedSupport/
Objects0=$(IntermediateDirectory)/up_cppweb_cppw_git.cpp$(ObjectSuffix) $(IntermediateDirectory)/up_cppweb_cppw_meteor_kitchen.cpp$(ObjectSuffix) $(IntermediateDirectory)/up_cppweb_cppw_sha1.cpp$(ObjectSuffix) $(IntermediateDirectory)/up_cppweb_cppw_sock.cpp$(ObjectSuffix) $(IntermediateDirectory)/up_cppweb_cppw_string.cpp$(ObjectSuffix) $(IntermediateDirectory)/up_cppweb_cppw_time.cpp$(ObjectSuffix) $(IntermediateDirectory)/up_cppweb_cppw_process.cpp$(ObjectSuffix) $(IntermediateDirectory)/up_cppweb_cppw_jsonparser.cpp$(ObjectSuffix) $(IntermediateDirectory)/up_cppweb_cppw_file.cpp$(ObjectSuffix) $(IntermediateDirectory)/up_cppweb_cppw_htmlparser.cpp$(ObjectSuffix) \
	$(IntermediateDirectory)/up_cppweb_cppw_array.cpp$(ObjectSuffix) $(IntermediateDirectory)/main.cpp$(ObjectSuffix) 



Objects=$(Objects0) 

##
## Main Build Targets 
##
.PHONY: all clean PreBuild PrePreBuild PostBuild MakeIntermediateDirs
all: $(OutputFile)

$(OutputFile): $(IntermediateDirectory)/.d $(Objects) 
	@$(MakeDirCommand) $(@D)
	@echo "" > $(IntermediateDirectory)/.d
	@echo $(Objects0)  > $(ObjectsFileList)
	$(LinkerName) $(OutputSwitch)$(OutputFile) @$(ObjectsFileList) $(LibPath) $(Libs) $(LinkOptions)

MakeIntermediateDirs:
	@test -d ./Release || $(MakeDirCommand) ./Release


$(IntermediateDirectory)/.d:
	@test -d ./Release || $(MakeDirCommand) ./Release

PreBuild:


##
## Objects
##
$(IntermediateDirectory)/up_cppweb_cppw_git.cpp$(ObjectSuffix): ../cppweb/cppw_git.cpp $(IntermediateDirectory)/up_cppweb_cppw_git.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_git.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_git.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_git.cpp$(DependSuffix): ../cppweb/cppw_git.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_git.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_git.cpp$(DependSuffix) -MM ../cppweb/cppw_git.cpp

$(IntermediateDirectory)/up_cppweb_cppw_git.cpp$(PreprocessSuffix): ../cppweb/cppw_git.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_git.cpp$(PreprocessSuffix) ../cppweb/cppw_git.cpp

$(IntermediateDirectory)/up_cppweb_cppw_meteor_kitchen.cpp$(ObjectSuffix): ../cppweb/cppw_meteor_kitchen.cpp $(IntermediateDirectory)/up_cppweb_cppw_meteor_kitchen.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_meteor_kitchen.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_meteor_kitchen.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_meteor_kitchen.cpp$(DependSuffix): ../cppweb/cppw_meteor_kitchen.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_meteor_kitchen.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_meteor_kitchen.cpp$(DependSuffix) -MM ../cppweb/cppw_meteor_kitchen.cpp

$(IntermediateDirectory)/up_cppweb_cppw_meteor_kitchen.cpp$(PreprocessSuffix): ../cppweb/cppw_meteor_kitchen.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_meteor_kitchen.cpp$(PreprocessSuffix) ../cppweb/cppw_meteor_kitchen.cpp

$(IntermediateDirectory)/up_cppweb_cppw_sha1.cpp$(ObjectSuffix): ../cppweb/cppw_sha1.cpp $(IntermediateDirectory)/up_cppweb_cppw_sha1.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_sha1.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_sha1.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_sha1.cpp$(DependSuffix): ../cppweb/cppw_sha1.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_sha1.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_sha1.cpp$(DependSuffix) -MM ../cppweb/cppw_sha1.cpp

$(IntermediateDirectory)/up_cppweb_cppw_sha1.cpp$(PreprocessSuffix): ../cppweb/cppw_sha1.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_sha1.cpp$(PreprocessSuffix) ../cppweb/cppw_sha1.cpp

$(IntermediateDirectory)/up_cppweb_cppw_sock.cpp$(ObjectSuffix): ../cppweb/cppw_sock.cpp $(IntermediateDirectory)/up_cppweb_cppw_sock.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_sock.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_sock.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_sock.cpp$(DependSuffix): ../cppweb/cppw_sock.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_sock.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_sock.cpp$(DependSuffix) -MM ../cppweb/cppw_sock.cpp

$(IntermediateDirectory)/up_cppweb_cppw_sock.cpp$(PreprocessSuffix): ../cppweb/cppw_sock.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_sock.cpp$(PreprocessSuffix) ../cppweb/cppw_sock.cpp

$(IntermediateDirectory)/up_cppweb_cppw_string.cpp$(ObjectSuffix): ../cppweb/cppw_string.cpp $(IntermediateDirectory)/up_cppweb_cppw_string.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_string.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_string.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_string.cpp$(DependSuffix): ../cppweb/cppw_string.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_string.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_string.cpp$(DependSuffix) -MM ../cppweb/cppw_string.cpp

$(IntermediateDirectory)/up_cppweb_cppw_string.cpp$(PreprocessSuffix): ../cppweb/cppw_string.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_string.cpp$(PreprocessSuffix) ../cppweb/cppw_string.cpp

$(IntermediateDirectory)/up_cppweb_cppw_time.cpp$(ObjectSuffix): ../cppweb/cppw_time.cpp $(IntermediateDirectory)/up_cppweb_cppw_time.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_time.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_time.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_time.cpp$(DependSuffix): ../cppweb/cppw_time.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_time.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_time.cpp$(DependSuffix) -MM ../cppweb/cppw_time.cpp

$(IntermediateDirectory)/up_cppweb_cppw_time.cpp$(PreprocessSuffix): ../cppweb/cppw_time.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_time.cpp$(PreprocessSuffix) ../cppweb/cppw_time.cpp

$(IntermediateDirectory)/up_cppweb_cppw_process.cpp$(ObjectSuffix): ../cppweb/cppw_process.cpp $(IntermediateDirectory)/up_cppweb_cppw_process.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_process.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_process.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_process.cpp$(DependSuffix): ../cppweb/cppw_process.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_process.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_process.cpp$(DependSuffix) -MM ../cppweb/cppw_process.cpp

$(IntermediateDirectory)/up_cppweb_cppw_process.cpp$(PreprocessSuffix): ../cppweb/cppw_process.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_process.cpp$(PreprocessSuffix) ../cppweb/cppw_process.cpp

$(IntermediateDirectory)/up_cppweb_cppw_jsonparser.cpp$(ObjectSuffix): ../cppweb/cppw_jsonparser.cpp $(IntermediateDirectory)/up_cppweb_cppw_jsonparser.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_jsonparser.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_jsonparser.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_jsonparser.cpp$(DependSuffix): ../cppweb/cppw_jsonparser.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_jsonparser.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_jsonparser.cpp$(DependSuffix) -MM ../cppweb/cppw_jsonparser.cpp

$(IntermediateDirectory)/up_cppweb_cppw_jsonparser.cpp$(PreprocessSuffix): ../cppweb/cppw_jsonparser.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_jsonparser.cpp$(PreprocessSuffix) ../cppweb/cppw_jsonparser.cpp

$(IntermediateDirectory)/up_cppweb_cppw_file.cpp$(ObjectSuffix): ../cppweb/cppw_file.cpp $(IntermediateDirectory)/up_cppweb_cppw_file.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_file.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_file.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_file.cpp$(DependSuffix): ../cppweb/cppw_file.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_file.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_file.cpp$(DependSuffix) -MM ../cppweb/cppw_file.cpp

$(IntermediateDirectory)/up_cppweb_cppw_file.cpp$(PreprocessSuffix): ../cppweb/cppw_file.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_file.cpp$(PreprocessSuffix) ../cppweb/cppw_file.cpp

$(IntermediateDirectory)/up_cppweb_cppw_htmlparser.cpp$(ObjectSuffix): ../cppweb/cppw_htmlparser.cpp $(IntermediateDirectory)/up_cppweb_cppw_htmlparser.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_htmlparser.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_htmlparser.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_htmlparser.cpp$(DependSuffix): ../cppweb/cppw_htmlparser.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_htmlparser.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_htmlparser.cpp$(DependSuffix) -MM ../cppweb/cppw_htmlparser.cpp

$(IntermediateDirectory)/up_cppweb_cppw_htmlparser.cpp$(PreprocessSuffix): ../cppweb/cppw_htmlparser.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_htmlparser.cpp$(PreprocessSuffix) ../cppweb/cppw_htmlparser.cpp

$(IntermediateDirectory)/up_cppweb_cppw_array.cpp$(ObjectSuffix): ../cppweb/cppw_array.cpp $(IntermediateDirectory)/up_cppweb_cppw_array.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "../cppweb/cppw_array.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/up_cppweb_cppw_array.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/up_cppweb_cppw_array.cpp$(DependSuffix): ../cppweb/cppw_array.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/up_cppweb_cppw_array.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/up_cppweb_cppw_array.cpp$(DependSuffix) -MM ../cppweb/cppw_array.cpp

$(IntermediateDirectory)/up_cppweb_cppw_array.cpp$(PreprocessSuffix): ../cppweb/cppw_array.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/up_cppweb_cppw_array.cpp$(PreprocessSuffix) ../cppweb/cppw_array.cpp

$(IntermediateDirectory)/main.cpp$(ObjectSuffix): main.cpp $(IntermediateDirectory)/main.cpp$(DependSuffix)
	$(CXX) $(IncludePCH) $(SourceSwitch) "./main.cpp" $(CXXFLAGS) $(ObjectSwitch)$(IntermediateDirectory)/main.cpp$(ObjectSuffix) $(IncludePath)
$(IntermediateDirectory)/main.cpp$(DependSuffix): main.cpp
	@$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) -MG -MP -MT$(IntermediateDirectory)/main.cpp$(ObjectSuffix) -MF$(IntermediateDirectory)/main.cpp$(DependSuffix) -MM main.cpp

$(IntermediateDirectory)/main.cpp$(PreprocessSuffix): main.cpp
	$(CXX) $(CXXFLAGS) $(IncludePCH) $(IncludePath) $(PreprocessOnlySwitch) $(OutputSwitch) $(IntermediateDirectory)/main.cpp$(PreprocessSuffix) main.cpp


-include $(IntermediateDirectory)/*$(DependSuffix)
##
## Clean
##
clean:
	$(RM) -r ./Release/


