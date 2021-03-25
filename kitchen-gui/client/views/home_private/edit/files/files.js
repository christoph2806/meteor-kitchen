var rootDirs = [
	{ name: "OUTPUT_DIR", displayName: "OUTPUT_DIR", readOnly: true },
	{ name: "STARTUP_DIR", displayName: "STARTUP_DIR", readOnly: true },
	{ name: "CLIENT_DIR", displayName: "CLIENT_DIR", readOnly: true },
	{ name: "CLIENT_STARTUP_DIR", displayName: "CLIENT_STARTUP_DIR", readOnly: true },
	{ name: "CLIENT_UI_DIR", displayName: "CLIENT_UI_DIR", readOnly: true },
	{ name: "CLIENT_LIB_DIR", displayName: "CLIENT_LIB_DIR", readOnly: true },
	{ name: "CLIENT_GLOBALS_DIR", displayName: "CLIENT_GLOBALS_DIR", readOnly: true },
	{ name: "CLIENT_COMPONENTS_DIR", displayName: "CLIENT_COMPONENTS_DIR", readOnly: true },
	{ name: "CLIENT_STYLES_DIR", displayName: "CLIENT_STYLES_DIR", readOnly: true },
	{ name: "CLIENT_STYLES_FRAMEWORK_DIR", displayName: "CLIENT_STYLES_FRAMEWORK_DIR", readOnly: true },
	{ name: "CLIENT_STYLES_DEFAULT_DIR", displayName: "CLIENT_STYLES_DEFAULT_DIR", readOnly: true },
	{ name: "CLIENT_STYLES_THEME_DIR", displayName: "CLIENT_STYLES_THEME_DIR", readOnly: true },
	{ name: "CLIENT_VIEWS_DIR", displayName: "CLIENT_VIEWS_DIR", readOnly: true },
	{ name: "CLIENT_VIEWS_NOT_FOUND_DIR", displayName: "CLIENT_VIEWS_NOT_FOUND_DIR", readOnly: true },
	{ name: "CLIENT_VIEWS_LOADING_DIR", displayName: "CLIENT_VIEWS_LOADING_DIR", readOnly: true },
	{ name: "CLIENT_VIEWS_LAYOUT_DIR", displayName: "CLIENT_VIEWS_LAYOUT_DIR", readOnly: true },
	{ name: "CLIENT_ROUTER_DIR", displayName: "CLIENT_ROUTER_DIR", readOnly: true },
	{ name: "IMPORTS_DIR", displayName: "IMPORTS_DIR", readOnly: true },
	{ name: "SETTINGS_DIR", displayName: "SETTINGS_DIR", readOnly: true },
	{ name: "PACKAGES_DIR", displayName: "PACKAGES_DIR", readOnly: true },
	{ name: "BOTH_DIR", displayName: "BOTH_DIR", readOnly: true },
	{ name: "BOTH_LIB_DIR", displayName: "BOTH_LIB_DIR", readOnly: true },
	{ name: "BOTH_COLLECTIONS_DIR", displayName: "BOTH_COLLECTIONS_DIR", readOnly: true },
	{ name: "BOTH_JOINS_DIR", displayName: "BOTH_JOINS_DIR", readOnly: true },
	{ name: "PUBLIC_DIR", displayName: "PUBLIC_DIR", readOnly: true },
	{ name: "PUBLIC_IMAGES_DIR", displayName: "PUBLIC_IMAGES_DIR", readOnly: true },
	{ name: "PUBLIC_FONTS_DIR", displayName: "PUBLIC_FONTS_DIR", readOnly: true },
	{ name: "PRIVATE_DIR", displayName: "PRIVATE_DIR", readOnly: true },
	{ name: "SERVER_DIR", displayName: "SERVER_DIR", readOnly: true },
	{ name: "SERVER_STARTUP_DIR", displayName: "SERVER_STARTUP_DIR", readOnly: true },
	{ name: "SERVER_LIB_DIR", displayName: "SERVER_LIB_DIR", readOnly: true },
	{ name: "SERVER_COLLECTIONS_DIR", displayName: "SERVER_COLLECTIONS_DIR", readOnly: true },
	{ name: "SERVER_COLLECTIONS_RULES_DIR", displayName: "SERVER_COLLECTIONS_RULES_DIR", readOnly: true },
	{ name: "SERVER_PUBLISH_DIR", displayName: "SERVER_PUBLISH_DIR", readOnly: true },
	{ name: "SERVER_ROUTER_DIR", displayName: "SERVER_ROUTER_DIR", readOnly: true },
	{ name: "SERVER_METHODS_DIR", displayName: "SERVER_METHODS_DIR", readOnly: true },
	{ name: "LIB_DIR", displayName: "LIB_DIR", readOnly: true }
];


var getFileIndex = function(filename) {
	if(!App.project) {
		return -1;
	}

	var kitchen = App.project.get();
	if(!kitchen) {
		return -1;
	}

	var index = -1;
	kitchen.application.copy_files.map((filePair, ndx) => {
		if(filePair.dest == filename) {
			index = ndx;
		}
	});
	return index;
};

var getFilePair = function(filename) {
	if(!App.project) {
		return -1;
	}

	var kitchen = App.project.get();
	if(!kitchen) {
		return -1;
	}

	var self = this;
	var pair = null;
	kitchen.application.copy_files.map(filePair => {
		if(filePair.dest == filename) {
			pair = filePair;
		}
	});
	return pair;
};

var folderIsEmpty = function(folder) {
	if(!App.project) {
		return true;
	}

	var kitchen = App.project.get();
	if(!kitchen) {
		return true;
	}

	var empty = true;
	kitchen.application.copy_files.map(filePair => {
		if(filePair.dest == folder || filePair.dest.indexOf(folder + "/") == 0) {
			empty = false;
		}
	});

	return empty;
}

Template.HomePrivateEditFiles.rendered = function() {
	var resizeContainers = function() {
		$(".scrollable-area").each(function() {
			$(this).css({ width: $(this).closest(".column").width() + "px" });
			$(this).parent().css({ width: $(this).closest(".column").width() + "px" });
			$(this).css({ height: $(this).closest(".editor-column").height() - $(this).position().top });
		});
	};

	Meteor.defer(function() {
		resizeContainers();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeContainers();
	});
};

Template.HomePrivateEditFilesLeftColumn.rendered = function() {
	var selectedName = Session.get("fileEditorSelectedFile");
	if(selectedName) {
		var parentDir = selectedName.split("/").length ? selectedName.split("/")[0] : "";
		if(parentDir) {
			var expandedNodes = Session.get("fileEditorExpandedNodes") || [];
			var index = expandedNodes.indexOf(parentDir);
			if(index < 0) {
				expandedNodes.push(parentDir);
			}
			Session.set("fileEditorExpandedNodes", expandedNodes);
		}
	}
};

Template.HomePrivateEditFilesLeftColumn.helpers({
	"rootDirs": function() {
		return rootDirs;
	}
});

Template.HomePrivateEditFilesDir.helpers({
	"fileList": function() {
		if(!App.project) {
			return [];
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return [];
		}

		var self = this;
		var files = [];
		kitchen.application.copy_files.map(filePair => {
			var dest = filePair.dest;
			if(dest) {
				if(dest == self.name || dest.indexOf(self.name + "/") == 0) {
					files.push({ 
						name: filePair.dest, 
						displayName: filePair.dest.substring(self.name.length + 1) || "(noname)" 
					});
				}
			}
		});

		return files;
	},

	"caretClass": function() {
		var caretClass = "";

		var expandedNodes = Session.get("fileEditorExpandedNodes") || [];
		if(expandedNodes.indexOf(this.name) >= 0) {
			caretClass += caretClass ? " " : "";
			caretClass += "fa-caret-down";			
		} else {
			caretClass += caretClass ? " " : "";
			caretClass += "fa-caret-right";
		}

		return caretClass;
	},

	"iconClass": function() {
		var expandedNodes = Session.get("fileEditorExpandedNodes") || [];
		var open = expandedNodes.indexOf(this.name) >= 0;
		var empty = folderIsEmpty(this.name);

		return open ? (empty ? "fa-folder-open-o" : "fa-folder-open") : (empty ? "fa-folder-o" : "fa-folder");
	},

	"canRemove": function() {
		return !this.readOnly;
	},

	"canInsert": function() {
		return true;
	},
	"isExpanded": function() {
		var expandedNodes = Session.get("fileEditorExpandedNodes") || [];
		return expandedNodes.indexOf(this.name) >= 0;
	}
});

Template.HomePrivateEditFilesDir.events({
	"click .tree-link": function(e, t) {
		e.preventDefault();
		var expandedNodes = Session.get("fileEditorExpandedNodes") || [];
		var index = expandedNodes.indexOf(this.name);
		if(index >= 0) {
			expandedNodes.splice(index, 1);
		} else {
			expandedNodes.push(this.name);
		}
		Session.set("fileEditorExpandedNodes", expandedNodes);

		return false;
	},

	"click .add-file": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var self = this;
		addFileForm("Add file", "", self.name, rootDirs, function(el, values) {
			var filename = values.fileName;

			if(!filename) {
				return false;
			}

			if(filename.charAt(0) != "/") {
				filename = "/" + filename;
			}

			var destPath = values.destDir + filename;
			var sourceURL = "";
			if(values.fileSource == "external") {
				sourceURL = values.source;
			}

			var alreadyExistsIndex = -1;
			kitchen.application.copy_files.map((fp, ndx) => {
				if(fp.dest == destPath) {
					alreadyExistsIndex = ndx;
				}
			});

			function addFile(source, dest) {
				var filePair = ClassKitchen.create(kitchen.application.copy_files._defaultItemType, kitchen.application.copy_files);
				filePair.source = source;
				filePair.dest = dest;
				if(filePair.source) {
					filePair.source_content = "";
				}
				var expandedNodes = Session.get("fileEditorExpandedNodes") || [];
				if(expandedNodes.indexOf(values.destDir) < 0) {
					expandedNodes.push(values.destDir);
				}
				Session.set("fileEditorExpandedNodes", expandedNodes);
				Session.set("fileEditorSelectedFile", dest);

				kitchen.application.copy_files.push(filePair);
				App.setModified();
			}


			if(alreadyExistsIndex >= 0) {
				confirmationBox("File already exists", "File \"" + destPath + "\" already exists. Do you want to overwrite existing file?", function() {
					kitchen.application.copy_files.splice(alreadyExistsIndex, 1);
					addFile(sourceURL, destPath);
				}, function() {

				});
			} else {
				addFile(sourceURL, destPath);
			}
		},
		function() {

		},
		{
			required: true
		});

		return false;
	}
});



Template.HomePrivateEditFilesItem.helpers({
	"treeLinkClass": function() {
		var fileEditorSelectedFile = Session.get("fileEditorSelectedFile") || "";

		var treeLinkClass = "";
		if(this.name == fileEditorSelectedFile) {
			treeLinkClass += treeLinkClass ? " " : "";
			treeLinkClass += "focused";
		}

		return treeLinkClass;
	},

	"iconClass": function() {
		var filePair = getFilePair(this.name);
		if(!filePair) {
			return "fa-file-o";
		}

		return filePair.source ?  "fa-link" : "fa-file-o";
	},

	"canRemove": function() {
		return true;
	},

	"canEdit": function() {
		return true;
	}
});

Template.HomePrivateEditFilesItem.events({
	"click .tree-link": function(e, t) {
		Session.set("fileEditorSelectedFile", this.name);
	},

	"click .remove-file": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var self = this;
		confirmationBox(
			"Delete File",
			"Are you sure you want to delete file \"" + self.name + "\"?",
			function(el) {
				var indexes = [];
				kitchen.application.copy_files.map((filePair, ndx) => {
					if(filePair.dest == self.name) {
						indexes.push(ndx);
					}
				});
				for(var i = indexes.length - 1; i >= 0; i--) {
					kitchen.application.copy_files.splice(indexes[i], 1);
				}

				App.setModified();
				Session.set("fileEditorSelectedFile", "");
			}, 
			function(el) {

			}, {
				approveButtonTitle: "Yes",
				denyButtonTitle: "No"
			}
		);

		return false;
	},

	"click .rename-file": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedPair = getFilePair(this.name);
		if(!selectedPair) {
			return;
		}


		var self = this;
		addFileForm("Rename file", selectedPair.source, selectedPair.dest, rootDirs, function(el, values) {
			var filename = values.fileName;

			if(!filename) {
				return false;
			}

			if(filename.charAt(0) != "/") {
				filename = "/" + filename;
			}

			var destPath = values.destDir + filename;
			var sourceURL = "";
			if(values.fileSource == "external") {
				sourceURL = values.source;
			}

			var alreadyExistsIndex = -1;
			kitchen.application.copy_files.map((fp, ndx) => {
				if(fp.dest == destPath) {
					alreadyExistsIndex = ndx;
				}
			});


			function updateFile(source, dest) {
				selectedPair.source = source;
				selectedPair.dest = dest;
				if(selectedPair.source) {
					selectedPair.source_content = "";
				}
				App.setModified();

				var expandedNodes = Session.get("fileEditorExpandedNodes") || [];
				if(expandedNodes.indexOf(values.destDir) < 0) {
					expandedNodes.push(values.destDir);
				}
				Session.set("fileEditorExpandedNodes", expandedNodes);
				Session.set("fileEditorSelectedFile", dest);
			}

			if(alreadyExistsIndex >= 0 && alreadyExistsIndex != getFileIndex(self.name)) {
				alert("File \"" + destPath + "\" already exists.");
			} else {
				updateFile(sourceURL, destPath);
			}
		},
		function() {

		},
		{
			required: true
		});

		return false;
	}
});

Template.HomePrivateEditFilesMainColumn.helpers({
	"selectedFilename": function() {
		var filename = Session.get("fileEditorSelectedFile") || "";
		return filename ? (getFileIndex(filename) < 0 ? "" : filename) : "";
	},

	"mainViewTemplate": function() {
		var filename = Session.get("fileEditorSelectedFile") || "";
		if(!filename) {
			return "HomePrivateEditFilesEmptyView";
		}

		var fileIndex = getFileIndex(filename);
		if(fileIndex < 0) {
			return "HomePrivateEditFilesEmptyView";			
		}

		var filePair = getFilePair(filename);
		if(!filePair) {
			return "HomePrivateEditFilesEmptyView";			
		}

		if(filePair.source != "") {
			return "HomePrivateEditFilesExternalView";
		}

		return "HomePrivateEditFilesEditorView";			
	}
});


Template.HomePrivateEditFilesEditorView.rendered = function() {
	var setup = false;
	App.addRefreshingSessionVar("selectedFileChanged");
	this.autorun(function() {
		var selectedName = Session.get("fileEditorSelectedFile");
		Session.set("selectedFileChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedName = Session.get("fileEditorSelectedFile");
		var selectedPair = getFilePair(selectedName);

		if(selectedPair) {
			if(Session.get("selectedFileChanged")) {
				Meteor.defer(function() {
					setup = false;
					Session.set("selectedFileChanged", false);
				});
				return;
			}

			var fileContent = Session.get("contentInputText");

			if(setup) {
				if(selectedPair.source_content != fileContent) {
					selectedPair.source_content = fileContent;
					App.setModified();
				}
			} else {
				Session.set("contentInputText", selectedPair.source_content);
				setup = true;
			}
		}
	});
};


Template.HomePrivateEditFilesEditorView.helpers({
	"showEditor": function() {
		return !Session.get("selectedFileChanged");
	}
});

Template.HomePrivateEditFilesEditorView.events({
});


Template.HomePrivateEditFilesEditor.rendered = function() {
	function resizeCodemirror() {
		var cm = this.$(".CodeMirror");
		if(!cm.length) {
			return;
		}
		cm.css({ width: ($(".main-column").width() - 10) + "px", height: (($(".main-column").height() - cm.position().top) - 10) + "px" });
		this.$(".CodeMirror-scroll").css({ width: $(".main-column").width() + "px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});
};

Template.HomePrivateEditFilesEditor.helpers({
	"contentInputOptions": function() {
		var options = {
			lineNumbers: true,
			readOnly: false,

			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			gutters: ["CodeMirror-lint-markers"]
		}

		var selectedName = Session.get("fileEditorSelectedFile");
		if(!selectedName) {
			return options;
		}

		var fileExt = selectedName.split('.').pop();

		switch(fileExt) {
			case "js": {
				options.mode = "javascript";
				options.lint = true;
			}; break;
			case "html": {
				options.mode = "htmlembedded";
				options.lint = true;
			}; break;
			case "md": {
				options.mode = "gfm";
				options.lint = false;
			}; break;
		}
		return options;
	}
});

Template.HomePrivateEditFilesEditor.events({
});



Template.HomePrivateEditFilesExternalView.events({

});

Template.HomePrivateEditFilesExternalView.helpers({
	"sourceURL": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedName = Session.get("fileEditorSelectedFile");
		var selectedPair = getFilePair(selectedName);

		return selectedPair.source;
	}
});
