var databaseEditorAddObject = function(parent, dontSelect) {
	var newType = "";
	switch(parent._className) {
		case "base_array": newType = parent._defaultItemType; break;
		case "collection": newType = "field"; break;
	}

	if(!newType) {
		return false;
	}

	var destArray = null;
	var expandNode = null;
	switch(newType) {
		case "collection": {
			destArray = parent;
			expandNode = parent;
		}; break;
		case "query": {
			destArray = parent;
			expandNode = parent;
		}; break;
		case "field": {
			destArray = parent.fields;
			expandNode = parent;
		}; break;
	}

	if(!destArray) {
		alert("unknown destination array");
		return false;
	}

	var newObject = ClassKitchen.create(newType, destArray);
	newObject.name = destArray.getUniqueItemName(newObject);

	if(newType == "field") {
		newObject.name = toCamelCase(newObject.name);
	}

	newObjectSettings(newObject, function(e) {
		if(e) {
			alert(e);
			return;
		}

		newObject.name = destArray.getUniqueItemName(newObject);

		destArray.push(newObject);

		var expandedNodes = Session.get("databaseEditorExpandedNodes") || [];
		var index = expandedNodes.indexOf(expandNode._id);
		if(index < 0) {
			expandedNodes.push(expandNode._id);
			Session.set("databaseEditorExpandedNodes", expandedNodes);
		}

		if(!dontSelect) {
			Session.set("databaseEditorSelectedObject", newObject._id);
		} else {
			Session.set("databaseEditorSelectedObject", parent._id);			
		}

		Session.set("databaseEditorFocusedObject", newObject._id);

		App.setModified();
	});
};

var newObjectSettings = function(object, callback) {
	switch(object._className) {
		case "query": {
			addQueryForm(object.name, function(el, data) {

				let kitchen = object.getRoot();
				let application = kitchen.application;

				// get collection
				let collection = kitchen.findObjectById(data.collectionId);
				if(collection) {
					object.collection = collection.name;
				}

				object.name = toSnakeCase(data.name);

				if(callback) {
					callback();
				}
			}, function() {

			}, {

			});
		}; break;

		case "field": {
			addFieldForm(object.name, function(el, data) {

				let kitchen = object.getRoot();
				let application = kitchen.application;

				object.name = data.name.replace(new RegExp("[^0-9a-zA-Z.]", "g"), "_");
				object.title = toTitleCase(data.name);
				object.required = data.required;

				if(callback) {
					callback();
				}
			}, function() {

			}, {

			});
		}; break;

		default: {
			// Ask user for object name
			inputBox(
				"New " + toTitleCase(object._className),
				toTitleCase(object._className) + " name",
				object.name,
				function(el, newName) {
					object.name = toSnakeCase(newName);

					// OK
					if(callback) {
						callback();
					}
				}, function() {
					// Cancel

				}, {

				}
			);
		}
	}
};

Template.HomePrivateEditDatabase.created = function() {
};


Template.HomePrivateEditDatabase.rendered = function() {
	var resizeContainers = function() {
		$(".scrollable-area").each(function() {
			$(this).css({ width: $(this).closest(".column").width() + "px" });
			$(this).parent().css({ width: $(this).closest(".column").width() + "px" });
			$(this).css({ height: $(this).closest(".editor-column").height() - $(this).position().top });
		});
		$(".main-column .secondary.menu").css({ width: $(".main-column").width() + "px" });
	};

	Meteor.defer(function() {
		resizeContainers();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeContainers();
	});
};

// ----------------------------------------------------------------------------
// HomePrivateEditDatabaseLeftColumn

Template.HomePrivateEditDatabaseLeftColumn.created = function() {
};


Template.HomePrivateEditDatabaseLeftColumn.rendered = function() {
};

Template.HomePrivateEditDatabaseLeftColumn.helpers({
	"application": function() {
		if(!App.project) {
			return null;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return null;
		}
		return kitchen.application;
	}
});

Template.HomePrivateEditDatabaseLeftColumn.events({

});


// ----------------------------------------------------------------------------
// HomePrivateEditDatabaseCollectionTree

Template.HomePrivateEditDatabaseCollectionTree.created = function() {
};


Template.HomePrivateEditDatabaseCollectionTree.rendered = function() {
};

Template.HomePrivateEditDatabaseCollectionTree.helpers({
	"collectionList": function() {
		var root = this.root;
		if(root) {
			if(root._className == "application") {
				pageList = [];
				pageList.push(root.collections);
				pageList.push(root.queries);
				return pageList;				
			}
			if(root._className == "base_array") {
				return root;
			}
//			if(root._className == "collection") {
//				return root.fields;
//			}
		}
		return [];
	}
});

Template.HomePrivateEditDatabaseCollectionTree.events({
});


Template.HomePrivateEditDatabaseCollectionTreeItem.helpers({
	"isExpanded": function() {
		if(!this) {
			return false;
		}
		var expandedNodes = Session.get("databaseEditorExpandedNodes") || [];
		return expandedNodes.indexOf(this._id) >= 0;
	},

	"displayName": function() {
		if(!this) {
			return "";
		}

		switch(this._className) {
			case "collection": return this.name; break;
			case "field": return this.name; break;
			case "query": return this.name; break;
			case "base_array": return this.getParentKeyName(); break;
		}
		return "";
	},

	"treeLinkClass": function() {
		if(!this) {
			return "";
		}

		var databaseEditorSelectedObject = Session.get("databaseEditorSelectedObject");
		var databaseEditorFocusedObject = Session.get("databaseEditorFocusedObject");

		var treeLinkClass = "";
		if(this._id == databaseEditorSelectedObject && this._id == databaseEditorFocusedObject) {
			treeLinkClass += treeLinkClass ? " " : "";
			treeLinkClass += "focused";
		} else {
			if(this._id == databaseEditorSelectedObject) {
				treeLinkClass += treeLinkClass ? " " : "";
				treeLinkClass += "selected";
			}			
		}

		return treeLinkClass;
	},

	"caretClass": function() {
		if(!this) {
			return "";
		}

		var caretClass = "";

		var parentKey = this.getParentKeyName();
		if(
			(parentKey != "collections" && parentKey != "queries") ||
			(parentKey == "collections" && !this.length) || 
			(parentKey == "queries" && !this.length)
		) {
			caretClass += caretClass ? " " : "";
			caretClass += "transparent";
		}

		var expandedNodes = Session.get("databaseEditorExpandedNodes") || [];
		if(expandedNodes.indexOf(this._id) >= 0) {
			caretClass += caretClass ? " " : "";
			caretClass += "fa-caret-down";			
		} else {
			caretClass += caretClass ? " " : "";
			caretClass += "fa-caret-right";
		}

		return caretClass;
	},

	"iconClass": function() {
		switch(this._className) {
			case "base_array": {
				var expandedNodes = Session.get("databaseEditorExpandedNodes") || [];
				return expandedNodes.indexOf(this._id) >= 0 ? "fa-folder-open" : "fa-folder";				
			}; break;
			case "collection": return "fa-database"; break;
			case "query": return "fa-filter"; break;
			default: {
				return "fa-file-o";
			}
		}
	},

	"canRemove": function() {
		if(!this) {
			return false;
		}

		return this._className != "base_array";
	},

	"canInsert": function() {
		if(!this) {
			return false;
		}

		return this._className == "base_array" || this._className == "collection";
	}
});


Template.HomePrivateEditDatabaseCollectionTreeItem.events({
	"click .tree-link": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var focusedId = Session.get("databaseEditorFocusedObject");
		if(selectedId == this._id) {
			if(focusedId == this._id) {
				var expandedNodes = Session.get("databaseEditorExpandedNodes") || [];
				var index = expandedNodes.indexOf(this._id);
				if(index >= 0) {
					expandedNodes.splice(index, 1);
				} else {
					expandedNodes.push(this._id);
				}
				Session.set("databaseEditorExpandedNodes", expandedNodes);
			} else {
				Session.set("databaseEditorFocusedObject", this._id);
			}
		} else {
			Session.set("databaseEditorSelectedObject", this._id);
			Session.set("databaseEditorFocusedObject", this._id);
		}

		return false;
	},

	"click .add-object": function(e, t) {
		e.preventDefault();

		databaseEditorAddObject(this);

		return false;
	},

	"click .remove-object": function(e, t) {
		e.preventDefault();
		var self = this;
		confirmationBox(
			"Delete " + self._className,
			"Are you sure you want to delete " + self._className + " \"" + self.name + "\"?",
			function(el) {
				if(self.getRoot().removeObjectById(self._id, true)) {
					App.setModified();
				}
			}, 
			function(el) {

			}, {
				approveButtonTitle: "Yes",
				denyButtonTitle: "No"
			}
		);

		return false;
	}
});



Template.HomePrivateEditDatabaseMainColumn.helpers({
	"selectedObjectDisplayName": function() {
		if(!App.project) {
			return "";
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return "";
		}

		switch(selectedObject._className) {
			case "collection": {
				return toTitleCase(selectedObject._className) + ": " + selectedObject.name;
			}; break;
			case "field": {
				return toTitleCase(selectedObject._className) + ": " + selectedObject.name;
			}; break;
			case "query": {
				return toTitleCase(selectedObject._className) + ": " + selectedObject.name;
			}; break;
			case "base_array": {
				return toTitleCase(selectedObject.getParentKeyName());
			}; break;
		}

		return "";
	},

	"mainViewMenuItems": function() {
		if(!App.project) {
			return [];
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return [];
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return [];
		}

		var items = [];
		var databaseEditorMainView = Session.get("databaseEditorMainView") || "";

		var selectedType = selectedObject._className == "base_array" ? selectedObject.getParentKeyName() : selectedObject._className;

		switch(selectedType) {
			case "collection": {
				items.push({ view: "fields", id: "main-view-fields", class: databaseEditorMainView == "fields" ? "active" : "", title: "Fields" });
				items.push({ view: "hooks", id: "main-view-hooks", class: databaseEditorMainView == "hooks" ? "active" : "", title: "Hooks" });
				items.push({ view: "roles", id: "main-view-roles", class: databaseEditorMainView == "roles" ? "active" : "", title: "Access Rights" });
			}; break;
			case "field": {}; break;
			case "query": {
				items.push({ view: "query", id: "main-view-query", class: databaseEditorMainView == "query" ? "active" : "", title: "Query" });
			}; break;
			case "collections": {
				items.push({ view: "collections", id: "main-view-collections", class: databaseEditorMainView == "collections" ? "active" : "", title: "Collections" });
			}; break;
			case "queries": {
				items.push({ view: "queries", id: "main-view-queries", class: databaseEditorMainView == "queries" ? "active" : "", title: "Queries" });
			}; break;
		}

		return items;
	},

	"mainViewTemplate": function() {
		if(!App.project) {
			return "";
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return "HomePrivateEditDatabaseNoSelectionView";
		}
		var databaseEditorMainView = "";
		var databaseEditorPreferView = Session.get("databaseEditorPreferView") || "";

		var possibleViews = [];
		var selectedType = selectedObject._className == "base_array" ? selectedObject.getParentKeyName() : selectedObject._className;
		switch(selectedType) {
			case "collection": possibleViews = ["fields", "hooks", "roles"]; break;
			case "field": possibleViews = []; break;
			case "query": possibleViews = ["query"]; break;
			case "collections": possibleViews = ["collections"]; break;
			case "queries": possibleViews = ["queries"]; break;
		}

		if(databaseEditorPreferView && possibleViews.indexOf(databaseEditorPreferView) >= 0) {
			databaseEditorMainView = databaseEditorPreferView;
		}
		if(possibleViews.indexOf(databaseEditorMainView) < 0) {
			databaseEditorMainView = possibleViews.length ? possibleViews[0] : "";
		}

		Session.set("databaseEditorMainView", databaseEditorMainView);

		switch(databaseEditorMainView) {
			case "collections": return "HomePrivateEditDatabaseCollectionsView"; break;
			case "queries": return "HomePrivateEditDatabaseQueriesView"; break;
			case "fields": return "HomePrivateEditDatabaseFieldsView"; break;
			case "hooks": return "HomePrivateEditDatabaseHooksView"; break;
			case "roles": return "HomePrivateEditDatabaseRolesView"; break;
			case "query": return "HomePrivateEditDatabaseQueryView"; break;
		}
		return "";
	}
});


Template.HomePrivateEditDatabaseMainColumn.events({
	"click #main-view-collections": function(e, t) {
		Session.set("databaseEditorMainView", "collections");
		Session.set("databaseEditorPreferView", "collections");
	},
	"click #main-view-queries": function(e, t) {
		Session.set("databaseEditorMainView", "queries");
		Session.set("databaseEditorPreferView", "queries");
	},
	"click #main-view-fields": function(e, t) {
		Session.set("databaseEditorMainView", "fields");
		Session.set("databaseEditorPreferView", "fields");
	},
	"click #main-view-hooks": function(e, t) {
		Session.set("databaseEditorMainView", "hooks");
		Session.set("databaseEditorPreferView", "hooks");
	},
	"click #main-view-roles": function(e, t) {
		Session.set("databaseEditorMainView", "roles");
		Session.set("databaseEditorPreferView", "roles");
	},
	"click #main-view-query": function(e, t) {
		Session.set("databaseEditorMainView", "query");
		Session.set("databaseEditorPreferView", "query");
	}
});



// ----------------------------------------------------------------------------
// HomePrivateEditDatabasePropertiesColumn

Template.HomePrivateEditDatabasePropertiesColumn.created = function() {
};

Template.HomePrivateEditDatabasePropertiesColumn.rendered = function() {
};

Template.HomePrivateEditDatabasePropertiesColumn.helpers({
	"propertiesTitle": function() {
		if(!App.project) {
			return "Properties";
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return "Properties";
		}

		var focusedId = Session.get("databaseEditorFocusedObject");
		var focusedObject = kitchen.findObjectById(focusedId);
		if(!focusedObject) {
			return "Properties";
		}

		if(focusedObject._className == "base_array") {
			return "Properties";
		}

		return toTitleCase(focusedObject._className) + " properties";
	}
});

Template.HomePrivateEditDatabasePropertiesColumn.events({
});


// ----------------------------------------------------------------------------
// HomePrivateEditDatabasePropertiesColumn

Template.HomePrivateEditDatabaseProperties.created = function() {
};

Template.HomePrivateEditDatabaseProperties.rendered = function() {
};

Template.HomePrivateEditDatabaseProperties.helpers({
	"focusedObject": function() {
		if(!App.project) {
			return null;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return null;
		}

		var focusedId = Session.get("databaseEditorFocusedObject");
		var focusedObject = kitchen.findObjectById(focusedId);
		if(!focusedObject) {
			return null;
		}

		if(focusedObject._className == "base_array") {
			return null;
		}

		return focusedObject;
	}
});

Template.HomePrivateEditDatabaseProperties.events({
});

// ----------------------------------------------------------------------------
// HomePrivateEditDatabaseRolesView

Template.HomePrivateEditDatabaseRolesView.created = function() {

};

Template.HomePrivateEditDatabaseRolesView.rendered = function() {

};

Template.HomePrivateEditDatabaseRolesView.helpers({
	"collectionRoles": function() {
		if(!App.project) {
			return [];
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return [];
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "collection") {
			return [];
		}

		var databaseRoles = [];

		var appRoles = ["admin", "owner", "blocked"];
		kitchen.application.roles.map(roleName => {
			if(appRoles.indexOf(roleName) < 0 && roleName != "nobody") {
				appRoles.push(roleName);
			}
		});
		appRoles.push("nobody");


		var reservedNames = ["admin", "blocked", "owner", "nobody"];
		appRoles.map(roleName => {
			var roleTitle = roleName;

			var canDelete = reservedNames.indexOf(roleName) < 0;
			var readAllowed = (selectedObject.roles_allowed_to_read.length == 0 && roleName != "nobody") || (selectedObject.roles_allowed_to_read.indexOf(roleName) >= 0);
			var readAccess = readAllowed ? "Allow" : "Deny";
			var readIconClass = readAllowed ? "green fa fa-unlock" : "red fa fa-lock";

			var insertAllowed = (selectedObject.roles_allowed_to_insert.length == 0 && roleName != "nobody") || (selectedObject.roles_allowed_to_insert.indexOf(roleName) >= 0);
			var insertAccess = insertAllowed ? "Allow" : "Deny";
			var insertIconClass = insertAllowed ? "green fa fa-unlock" : "red fa fa-lock";
			var insertRoleApplicable = roleName != "owner";

			var updateAllowed = (selectedObject.roles_allowed_to_update.length == 0 && roleName != "nobody") || (selectedObject.roles_allowed_to_update.indexOf(roleName) >= 0);
			var updateAccess = updateAllowed ? "Allow" : "Deny";
			var updateIconClass = updateAllowed ? "green fa fa-unlock" : "red fa fa-lock";

			var removeAllowed = (selectedObject.roles_allowed_to_delete.length == 0 && roleName != "nobody") || (selectedObject.roles_allowed_to_delete.indexOf(roleName) >= 0);
			var removeAccess = removeAllowed ? "Allow" : "Deny";
			var removeIconClass = removeAllowed ? "green fa fa-unlock" : "red fa fa-lock";


			if(roleName == "nobody") {
				readAccess = "";
				readIconClass = readAllowed ? "green fa fa-check" : "grey fa fa-minus";

				insertAccess = "";
				insertIconClass = insertAllowed ? "green fa fa-check" : "grey fa fa-minus";

				updateAccess = "";
				updateIconClass = updateAllowed ? "green fa fa-check" : "grey fa fa-minus";

				removeAccess = "";
				removeIconClass = removeAllowed ? "green fa fa-check" : "grey fa fa-minus";
			}

			databaseRoles.push({
				roleTitle: roleTitle,
				roleName: roleName,
				canDelete: canDelete,

				readAccess: readAccess,
				readIconClass: readIconClass,

				insertAccess: insertAccess,
				insertIconClass: insertIconClass,
				insertRoleApplicable: insertRoleApplicable,

				updateAccess: updateAccess,
				updateIconClass: updateIconClass,

				removeAccess: removeAccess,
				removeIconClass: removeIconClass
			});
		});
		return databaseRoles;
	}
});

Template.HomePrivateEditDatabaseRolesView.events({
	"click .add-role": function(e, t) {
		e.preventDefault();

		addRoleForm(function(el, result) {
		});

		return false;
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditDatabasesRolesViewRow

Template.HomePrivateEditDatabaseRolesViewRow.created = function() {

};

Template.HomePrivateEditDatabaseRolesViewRow.rendered = function() {

};

Template.HomePrivateEditDatabaseRolesViewRow.helpers({

});

Template.HomePrivateEditDatabaseRolesViewRow.events({
	"click .lock-item": function(e, t) {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "collection") {
			return;
		}

		var roleName = this.roleName;

		var rolesArray = null;
		var roleAction = e.currentTarget.getAttribute("data-action");
		switch(roleAction) {
			case "read": rolesArray = selectedObject.roles_allowed_to_read; break;
			case "insert": rolesArray = selectedObject.roles_allowed_to_insert; break;
			case "update": rolesArray = selectedObject.roles_allowed_to_update; break;
			case "remove": rolesArray = selectedObject.roles_allowed_to_delete; break;
		}
		if(!rolesArray) {
			return;
		}

		var appRoles = ["admin", "blocked", "nobody"];
		if(roleAction != "insert") {
			appRoles.push("owner");
		}
		kitchen.application.roles.map(r => {
			if(appRoles.indexOf(r) < 0 && !(roleAction == "insert" && r == "owner")) {
				appRoles.push(r);
			}
		});
		if(!rolesArray.length) {
			if(roleName == "nobody") {
				rolesArray.push("nobody");
			} else {
				appRoles.map(r => {
					if(rolesArray.indexOf(r) < 0 && r != roleName && r != "nobody") {
						rolesArray.push(r);
					}
				});				
			}

			App.setModified();
			return;
		}

		var roleIndex = rolesArray.indexOf(roleName);
		var allow = roleIndex < 0;

		if(allow) {
			if(roleName == "nobody") {
				rolesArray.splice(0, rolesArray.length);
			} else {
				var nobodyIndex = rolesArray.indexOf("nobody");
				if(nobodyIndex >= 0) {
					rolesArray.splice(nobodyIndex, 1);
				}
			}
			rolesArray.push(roleName);
		} else {
			rolesArray.splice(roleIndex, 1);
		}

		if(rolesArray.length) {
			var gotAllRoles = true;
			appRoles.map(r => {
				if(rolesArray.indexOf(r) < 0 && r != "nobody") {
					gotAllRoles = false;
				}
			});

			if(gotAllRoles) {
				rolesArray.splice(0, rolesArray.length);
			}
		} else {
			if(roleName != "nobody") {
				rolesArray.push("nobody");
			}
		}

		App.setModified();
	},
	"click .delete-icon": function(e, t) {
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
			"Delete Role",
			"Are you sure you want to delete role \"" + self.roleTitle + "\"?",
			function(el) {
				kitchen.findObject(obj => {
					let rolesArrays = [];
					if(obj._className == "page") {
						rolesArrays.push(obj.roles);
					}
					if(obj._className == "collection") {
						rolesArrays.push(obj.roles_allowed_to_read);
						rolesArrays.push(obj.roles_allowed_to_insert);
						rolesArrays.push(obj.roles_allowed_to_update);
						rolesArrays.push(obj.roles_allowed_to_delete);
					}

					rolesArrays.map(roleArray => {
						let index = roleArray.indexOf(self.roleName);
						if(index >= 0) {
							roleArray.splice(index, 1);
						}
					});
				});

				if(kitchen.application && kitchen.application.roles && kitchen.application.roles.length) {
					let index = kitchen.application.roles.indexOf(self.roleName);
					if(index >= 0) {
						kitchen.application.roles.splice(index, 1);
					}
				}

				App.setModified();
			}, 
			function(el) {
			}, {
				approveButtonTitle: "Yes",
				denyButtonTitle: "No"
			}
		);

		return false;
	}
});




// ----------------------------------------------------------------------------
// HomePrivateEditDatabasesFieldsView

Template.HomePrivateEditDatabaseFieldsView.helpers({
});

Template.HomePrivateEditDatabaseFieldsView.events({
	"click .add-field": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "collection") {
			return;
		}

		databaseEditorAddObject(selectedObject, true);

		return false;
	}
});

// ----------------------------------------------------------------------------
// HomePrivateEditDatabasesFieldList

Template.HomePrivateEditDatabaseFieldList.helpers({
	"fieldList": function() {
		if(!App.project) {
			return [];
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return [];
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "collection") {
			return [];
		}

		return selectedObject.fields;
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditDatabasesFieldListItem

Template.HomePrivateEditDatabaseFieldListItem.helpers({
	"displayType": function() {
		if(!this) {
			return "";
		}

		return this.type ? this.type : "string";
	},

	"rowClass": function() {
		if(!this) {
			return "";
		}

		var rowClass = "";

		if(this._id == Session.get("databaseEditorSelectedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "selected";
		}
		if(this._id == Session.get("databaseEditorFocusedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "focused";
		}

		return rowClass;
	},

	"requiredIconClass": function() {
		return this.required ? "green checkmark icon" : "grey minus icon";
	},

	"moveItemUpClass": function() {
		var selectedObject = this._parent;
		if(!selectedObject) {
			return "disabled";
		}

		if(!selectedObject.indexOfObjectById) {
			return "disabled";
		}

		return selectedObject.indexOfObjectById(this._id) > 0 ? "" : "disabled";
	},

	"moveItemDownClass": function() {
		var selectedObject = this._parent;
		if(!selectedObject) {
			return "disabled";
		}
		if(!selectedObject.indexOfObjectById) {
			return "disabled";
		}

		return selectedObject.indexOfObjectById(this._id) < selectedObject.length - 1 ? "" : "disabled";
	}

});


Template.HomePrivateEditDatabaseFieldListItem.events({
	"click .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		Session.set("databaseEditorFocusedObject", this._id);

		return false;
	},
	"click .delete-icon": function(e, t) {
		e.preventDefault();

		var self = this;
		confirmationBox(
			"Delete " + self._className,
			"Are you sure you want to delete " + self._className + " \"" + self.name + "\"?",
			function(el) {
				if(self.getRoot().removeObjectById(self._id, true)) {
					App.setModified();
				}
			}, 
			function(el) {

			}, {
				approveButtonTitle: "Yes",
				denyButtonTitle: "No"
			}
		);

		return false;
	},

	"click .required-icon": function(e, t) {
		this.required = !this.required;		
		App.setModified();
	},

	"click .move-up": function(e, t) {
		e.preventDefault();
		if(!this || !this._parent || !this._parent.moveItemUp) {
			return false;
		}

		this._parent.moveItemUp(this._id);
		App.setModified();
	},
	"click .move-down": function(e, t) {
		e.preventDefault();
		if(!this || !this._parent || !this._parent.moveItemDown) {
			return false;
		}

		this._parent.moveItemDown(this._id);
		App.setModified();
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditDatabaseCollectionsView

Template.HomePrivateEditDatabaseCollectionsView.rendered = function() {
};

Template.HomePrivateEditDatabaseCollectionsView.helpers({
	"gotCollections": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "base_array") {
			return false;
		}

		return !!selectedObject.length;
	}
});

Template.HomePrivateEditDatabaseCollectionsView.events({
	"click .add-collection": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "base_array") {
			return;
		}

		databaseEditorAddObject(selectedObject, true);

		return false;
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditDatabaseCollectionsViewExportButton

Template.HomePrivateEditDatabaseCollectionsViewExportButton.rendered = function() {
	$(".ui.dropdown").dropdown();
};

Template.HomePrivateEditDatabaseCollectionsViewExportButton.events({
	"click .export-sql": function(e, t) {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		if(!kitchen.application) {
			return;
		}

		var sql = kitchen.application.getSQL();

		downloadLocalResource(sql, App.projectData.slug + ".sql");
	},

	"click .export-gql": function(e, t) {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		if(!kitchen.application) {
			return;
		}

		var gql = kitchen.application.getGraphQL();

		downloadLocalResource(gql, App.projectData.slug + ".graphql");
	}
});

// ----------------------------------------------------------------------------
// HomePrivateEditDatabaseCollectionList

Template.HomePrivateEditDatabaseCollectionList.helpers({
	"collectionList": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "base_array") {
			return;
		}

		return selectedObject;
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditDatabaseCollectionListItem

Template.HomePrivateEditDatabaseCollectionListItem.helpers({
	"rowClass": function() {
		if(!this) {
			return "";
		}

		var rowClass = "";

		if(this._id == Session.get("databaseEditorSelectedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "selected";
		}
		if(this._id == Session.get("databaseEditorFocusedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "focused";
		}

		return rowClass;
	},

	"moveItemUpClass": function() {
		var selectedObject = this._parent;
		if(!selectedObject) {
			return "disabled";
		}

		if(!selectedObject.indexOfObjectById) {
			return "disabled";
		}

		return selectedObject.indexOfObjectById(this._id) > 0 ? "" : "disabled";
	},

	"moveItemDownClass": function() {
		var selectedObject = this._parent;
		if(!selectedObject) {
			return "disabled";
		}

		if(!selectedObject.indexOfObjectById) {
			return "disabled";
		}

		return selectedObject.indexOfObjectById(this._id) < selectedObject.length - 1 ? "" : "disabled";
	}

});


Template.HomePrivateEditDatabaseCollectionListItem.events({
	"click .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		Session.set("databaseEditorFocusedObject", this._id);

		return false;
	},

	"dblclick .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}


		var expandedNodes = Session.get("databaseEditorExpandedNodes") || [];
		var index = expandedNodes.indexOf(this._parent._id);
		if(index < 0) {
			expandedNodes.push(this._parent._id);
			Session.set("databaseEditorExpandedNodes", expandedNodes);
		}

		Session.set("databaseEditorSelectedObject", this._id);
		Session.set("databaseEditorFocusedObject", this._id);

		return false;
	},

	"click .delete-icon": function(e, t) {
		e.preventDefault();

		var self = this;
		confirmationBox(
			"Delete " + self._className,
			"Are you sure you want to delete " + self._className + " \"" + self.name + "\"?",
			function(el) {
				if(self.getRoot().removeObjectById(self._id, true)) {
					App.setModified();
				}
			}, 
			function(el) {

			}, {
				approveButtonTitle: "Yes",
				denyButtonTitle: "No"
			}
		);

		return false;
	},
	"click .move-up": function(e, t) {
		e.preventDefault();
		if(!this || !this._parent || !this._parent.moveItemUp) {
			return false;
		}

		this._parent.moveItemUp(this._id);
		App.setModified();
	},
	"click .move-down": function(e, t) {
		e.preventDefault();
		if(!this || !this._parent || !this._parent.moveItemDown) {
			return false;
		}

		this._parent.moveItemDown(this._id);
		App.setModified();
	}
});







// ----------------------------------------------------------------------------
// HomePrivateEditDatabaseQueriesView

Template.HomePrivateEditDatabaseQueriesView.helpers({
});

Template.HomePrivateEditDatabaseQueriesView.events({
	"click .add-query": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "base_array") {
			return;
		}

		databaseEditorAddObject(selectedObject, true);

		return false;
	}
});

// ----------------------------------------------------------------------------
// HomePrivateEditDatabaseQueryList

Template.HomePrivateEditDatabaseQueryList.helpers({
	"queryList": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "base_array") {
			return;
		}

		return selectedObject;
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditDatabaseQueryListItem

Template.HomePrivateEditDatabaseQueryListItem.helpers({
	"rowClass": function() {
		if(!this) {
			return "";
		}

		var rowClass = "";

		if(this._id == Session.get("databaseEditorSelectedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "selected";
		}
		if(this._id == Session.get("databaseEditorFocusedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "focused";
		}

		return rowClass;
	},

	"moveItemUpClass": function() {
		var selectedObject = this._parent;
		if(!selectedObject) {
			return "disabled";
		}

		if(!selectedObject.indexOfObjectById) {
			return "disabled";
		}

		return selectedObject.indexOfObjectById(this._id) > 0 ? "" : "disabled";
	},

	"moveItemDownClass": function() {
		var selectedObject = this._parent;
		if(!selectedObject) {
			return "disabled";
		}

		if(!selectedObject.indexOfObjectById) {
			return "disabled";
		}

		return selectedObject.indexOfObjectById(this._id) < selectedObject.length - 1 ? "" : "disabled";
	}

});


Template.HomePrivateEditDatabaseQueryListItem.events({
	"click .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		Session.set("databaseEditorFocusedObject", this._id);

		return false;
	},


	"dblclick .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}


		var expandedNodes = Session.get("databaseEditorExpandedNodes") || [];
		var index = expandedNodes.indexOf(this._parent._id);
		if(index < 0) {
			expandedNodes.push(this._parent._id);
			Session.set("databaseEditorExpandedNodes", expandedNodes);
		}

		Session.set("databaseEditorSelectedObject", this._id);
		Session.set("databaseEditorFocusedObject", this._id);

		return false;
	},


	"click .delete-icon": function(e, t) {
		e.preventDefault();

		var self = this;
		confirmationBox(
			"Delete " + self._className,
			"Are you sure you want to delete " + self._className + " \"" + self.name + "\"?",
			function(el) {
				if(self.getRoot().removeObjectById(self._id, true)) {
					App.setModified();
				}
			}, 
			function(el) {

			}, {
				approveButtonTitle: "Yes",
				denyButtonTitle: "No"
			}
		);

		return false;
	},

	"click .move-up": function(e, t) {
		e.preventDefault();
		if(!this || !this._parent || !this._parent.moveItemUp) {
			return false;
		}

		this._parent.moveItemUp(this._id);
		App.setModified();
	},
	"click .move-down": function(e, t) {
		e.preventDefault();
		if(!this || !this._parent || !this._parent.moveItemDown) {
			return false;
		}

		this._parent.moveItemDown(this._id);
		App.setModified();
	}
});



// -------

Template.HomePrivateEditDatabaseQueryView.rendered = function() {
/*
	function resizeCodemirror() {
		this.$(".CodeMirror").css({ width: ($(".main-column").width() - 80) + "px", height: "200px" });
		this.$(".CodeMirror-scroll").css({ width: $(".main-column").width() + "px", height: "200px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});
*/
	Meteor.defer(function() {
		App.refreshWindowSize();
	});


	var setup = false;
	App.addRefreshingSessionVar("queryObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("databaseEditorSelectedObject");
		Session.set("queryObjectChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "query") {
			return;
		}

		if(Session.get("queryObjectChanged")) {
			setup = false;
			Session.set("queryObjectChanged", false);
		}

		var filterCode = {};
		var optionsCode = {};

		var error = false;
		try {
			filterCode = JSON.parse(Session.get("queryFilterInputText") || "{}");
			optionsCode = JSON.parse(Session.get("queryOptionsInputText") || "{}");
		} catch(e) {
			error = true;
		}

		if(setup) {
			if(!error) {
				if(JSON.stringify(JSON.parse(selectedObject.filter || "{}"), null, 2) != JSON.stringify(filterCode, null, 2) || JSON.stringify(JSON.parse(selectedObject.options || "{}"), null, 2) != JSON.stringify(optionsCode, null, 2)) {
					selectedObject.filter = JSON.stringify(filterCode);
					selectedObject.options = JSON.stringify(optionsCode);
					App.setModified();
				}
			}
		} else {
			Session.set("queryFilterInputText", JSON.stringify(JSON.parse(selectedObject.filter || "{}"), null, 2));
			Session.set("queryOptionsInputText", JSON.stringify(JSON.parse(selectedObject.options || "{}"), null, 2));
			setup = true;
		}
	});
};

Template.HomePrivateEditDatabaseQueryView.helpers({
	"queryFilterInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},

	"queryOptionsInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},

	"queryFilterClass": function() {
		return Session.get("databaseEditorHideQueryFilter") ? "off" : "";
	},
	"queryOptionsClass": function() {
		return Session.get("databaseEditorHideQueryOptions") ? "off" : "";
	},
	"queryFilterIconClass": function() {
		return Session.get("databaseEditorHideQueryFilter") ? "fa-caret-right" : "fa-caret-down";
	},
	"queryOptionsIconClass": function() {
		return Session.get("databaseEditorHideQueryOptions") ? "fa-caret-right" : "fa-caret-down";
	}
});

Template.HomePrivateEditDatabaseQueryView.events({
	"click .toggler .title": function(e, t) {
		var toggler = $(e.currentTarget).closest(".toggler");
		var sessionKey = toggler.attr("data-session");
		var currentlyHidden = toggler.hasClass("off");
		if(currentlyHidden) {
			toggler.find(".content").show("fast", function() {
				Session.set(sessionKey, false);
				var editorId = toggler.find("textarea").attr("id");
				if(editorId && CodeMirrors[editorId]) {
					CodeMirrors[editorId].refresh();
				}
			});
		} else {
			toggler.find(".content").hide("fast", function() {
				Session.set(sessionKey, true);
			});
		}
	}
});


Template.HomePrivateEditDatabaseHooksView.rendered = function() {
	Meteor.defer(function() {
		App.refreshWindowSize();
	});

	var setup = false;
	App.addRefreshingSessionVar("collectionObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("databaseEditorSelectedObject");
		Session.set("collectionObjectChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("databaseEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "collection") {
			return;
		}

		if(Session.get("collectionObjectChanged")) {
			setup = false;
			Session.set("collectionObjectChanged", false);
		}

		var beforeInsertText = Session.get("beforeInsertInputText");
		var beforeUpdateText = Session.get("beforeUpdateInputText");
		var beforeRemoveText = Session.get("beforeRemoveInputText");

		var afterInsertText = Session.get("afterInsertInputText");
		var afterUpdateText = Session.get("afterUpdateInputText");
		var afterRemoveText = Session.get("afterRemoveInputText");

		if(setup) {
			if(
				beforeInsertText != selectedObject.before_insert_code ||
				beforeUpdateText != selectedObject.before_update_code ||
				beforeRemoveText != selectedObject.before_remove_code ||
				afterInsertText != selectedObject.after_insert_code ||
				afterUpdateText != selectedObject.after_update_code ||
				afterRemoveText != selectedObject.after_remove_code
			) {
				selectedObject.before_insert_code = beforeInsertText;
				selectedObject.before_update_code = beforeUpdateText;
				selectedObject.before_remove_code = beforeRemoveText;

				selectedObject.after_insert_code = afterInsertText;
				selectedObject.after_update_code = afterUpdateText;
				selectedObject.after_remove_code = afterRemoveText;
				App.setModified();
			}
		} else {
			Session.set("beforeInsertInputText", selectedObject.before_insert_code);
			Session.set("beforeUpdateInputText", selectedObject.before_update_code);
			Session.set("beforeRemoveInputText", selectedObject.before_remove_code);

			Session.set("afterInsertInputText", selectedObject.after_insert_code);
			Session.set("afterUpdateInputText", selectedObject.after_update_code);
			Session.set("afterRemoveInputText", selectedObject.after_remove_code);
			setup = true;
		}

	});
};


Template.HomePrivateEditDatabaseHooksView.helpers({
	"beforeInsertInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},
	"beforeUpdateInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},
	"beforeRemoveInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},

	"afterInsertInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},
	"afterUpdateInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},
	"afterRemoveInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},

	"beforeInsertClass": function() {
		return Session.get("databaseEditorShowBeforeInsert") ? "" : "off";
	},
	"beforeUpdateClass": function() {
		return Session.get("databaseEditorShowBeforeUpdate") ? "" : "off";
	},
	"beforeRemoveClass": function() {
		return Session.get("databaseEditorShowBeforeRemove") ? "" : "off";
	},
	"afterInsertClass": function() {
		return Session.get("databaseEditorShowAfterInsert") ? "" : "off";
	},
	"afterUpdateClass": function() {
		return Session.get("databaseEditorShowAfterUpdate") ? "" : "off";
	},
	"afterRemoveClass": function() {
		return Session.get("databaseEditorShowAfterRemove") ? "" : "off";
	},

	"beforeInsertIconClass": function() {
		return Session.get("databaseEditorShowBeforeInsert") ? "fa-caret-down" : "fa-caret-right";
	},
	"beforeUpdateIconClass": function() {
		return Session.get("databaseEditorShowBeforeUpdate") ? "fa-caret-down" : "fa-caret-right";
	},
	"beforeRemoveIconClass": function() {
		return Session.get("databaseEditorShowBeforeRemove") ? "fa-caret-down" : "fa-caret-right";
	},
	"afterInsertIconClass": function() {
		return Session.get("databaseEditorShowAfterInsert") ? "fa-caret-down" : "fa-caret-right";
	},
	"afterUpdateIconClass": function() {
		return Session.get("databaseEditorShowAfterUpdate") ? "fa-caret-down" : "fa-caret-right";
	},
	"afterRemoveIconClass": function() {
		return Session.get("databaseEditorShowAfterRemove") ? "fa-caret-down" : "fa-caret-right";
	}
});

Template.HomePrivateEditDatabaseHooksView.events({
	"click .toggler .title": function(e, t) {
		var toggler = $(e.currentTarget).closest(".toggler");
		var sessionKey = toggler.attr("data-session");
		var currentlyHidden = toggler.hasClass("off");
		if(currentlyHidden) {
			toggler.find(".content").show("fast", function() {
				Session.set(sessionKey, true);
				var editorId = toggler.find("textarea").attr("id");
				if(editorId && CodeMirrors[editorId]) {
					CodeMirrors[editorId].refresh();
				}
			});
		} else {
			toggler.find(".content").hide("fast", function() {
				Session.set(sessionKey, false);
			});
		}
	}
});
