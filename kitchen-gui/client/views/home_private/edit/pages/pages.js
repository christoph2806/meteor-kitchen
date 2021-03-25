this.gasoline = require("gasoline-turbo");

var pageSession = new ReactiveDict();

var objectDisplayName = function(obj) {
	if(obj._className == "zone") {
		return obj.getParentKeyName();
	}

	if(obj._className == "gasoline") {
		return "designer";
	}

	if(obj._className == "gas_template") {
		return obj.name || obj.type;
	}

	if(obj._className == "gas_html") {
		return obj.element || "html";
	}

	if(obj.isInheritedFrom("gas_node") || obj.isInheritedFrom("gas_element")) {
		return obj.type;
	}

	return obj.name;
};

var objectDisplayName2 = function(obj) {
	if(obj._className == "base_array") {
		return "Array";
	}

	if(obj._className == "zone") {
		return toTitleCase(obj.getParentKeyName());
	}

	if(obj._className == "gasoline") {
		return "Designer";
	}

	if(obj._className == "gas_template") {
		return toTitleCase(obj.type);
	}

	if(obj._className == "gas_html") {
		return obj.element ? "<" + obj.element + ">" : "HTML node";
	}

	if(obj.isInheritedFrom("gas_node") || obj.isInheritedFrom("gas_element")) {
		return toTitleCase(obj.type);
	}

	return toTitleCase(obj._className);
};

var pageTreeAddObject = function(parent, componentsOnly, dontSelect) {
	var displayName = "";
	if(parent._className == "zone") {
		displayName = parent.getParentKeyName();
	} else {
		displayName = parent.name;			
	}

	if(parent._className == "gasoline") {
		pageEditorAddObject(parent, "gas_template", newObjectPostProcessing, dontSelect);
		return false;
	}


	var typeList = [];

	if(parent.isInheritedFrom("gas_element")) {

		var skipClassNames = ["gas_template", "gas_element", "gas_node", "gas_condition_true", "gas_condition_false", "gas_html"];

		var typeNames = ClassKitchen.getClassNamesInheritedFrom("gas_node", skipClassNames, []);
		typeNames.map(typeName => {

			var typeTitle = typeName;
			if(typeTitle.indexOf("gas_") == 0) {
				typeTitle = typeTitle.substring(4);
			}

			typeTitle = toTitleCase(typeTitle);

			typeList.push({ value: typeName, label: typeTitle });
		});

		typeNames = ClassKitchen.getClassNamesInheritedFrom("gas_element", skipClassNames, []);
		typeNames.map(typeName => {
			var typeTitle = typeName;
			if(typeTitle.indexOf("gas_") == 0) {
				typeTitle = typeTitle.substring(4);
			}

			typeTitle = toTitleCase(typeTitle);

			typeList.push({ value: typeName, label: typeTitle });
		});

		typeList.push({ value: "importHTML", label: "Import HTML (Blaze)"});
	} else {
		var skipClassNames = ["zone", "component"];
		var skipInheritedFrom = [];
		if(componentsOnly || (parent._className != "zone" && parent._className != "page" && parent.isInheritedFrom("component"))) {
			skipClassNames.push("page");
			skipInheritedFrom.push("page");
		}

		var typeNames = ClassKitchen.getClassNamesInheritedFrom("component", skipClassNames, skipInheritedFrom);
		typeNames.map(typeName => {
			typeList.push({ value: typeName, label: typeName });
		});

		if(parent._className == "zone" || parent._className == "page" || parent.getParentOfType("page")) {
			typeList.push({ value: "crud_wizard", label: "CRUD" });
		}
	}

	if(!typeList.length) {
		console.log("Cannot add into parent object");
	}

	choiceBox(
		"Add object to " + objectDisplayName2(parent) + (displayName ? " \"" + displayName + "\"" : ""),
		"Object type to add:",
		typeList,
		typeList[0].value,
		function(el, objectType) {
			switch(objectType) {
				case "importHTML": {
					importBlazeBox("Import HTML (Blaze)", "\n", "\n", function(el, gas) {

						var object = null;
						if(gas.templates && gas.templates.length) {
							if(gas.templates.length > 1) {
								object = { templates: gas.templates };
							} else {
								object = gas.templates[0];
							}
						} else {
							if(gas.naked && gas.naked.children && gas.naked.children.length) {
								if(gas.naked.children.length > 1) {
									object = {
										type: "html",
										element: "div",
										children: gas.naked.children
									};
								} else {
									object = gas.naked.children[0];
								}
							}
						}

						if(!gas) {
							return;
						}

						designerAddObject(parent._id, object);
					});
				}; break;
				case "crud_wizard": {
					startCrudWizard(parent, newObjectPostProcessing, dontSelect);
				}; break;
				default: {
					pageEditorAddObject(parent, objectType, newObjectPostProcessing, dontSelect);
				}
			}
		}, 
		function(el) {

		}, {
			approveButtonTitle: "OK",
			denyButtonTitle: "Cancel"
		}
	);
};

var pageEditorAddObject = function(parent, newType, successCallback, dontSelect) {
	if(!newType) {
		return false;
	}

	var destArray = null;
	var expandNode = null;

	var newObject = ClassKitchen.create(newType, parent);

	if(parent._className == "gasoline") {
		destArray = parent.templates;
		expandNode = parent;
	} else {
		if(newObject.isInheritedFrom("page")) {
			destArray = parent.pages;
			expandNode = parent;
		} else {
			if(newObject.isInheritedFrom("component")) {
				destArray = parent.components;
				expandNode = parent;
			} else {
				if(newObject.isInheritedFrom("gas_node") || newObject.isInheritedFrom("gas_element")) {
					destArray = parent.children;
					expandNode = parent;
				}
			}
		}
	}



	if(!destArray) {
		alert("Unknown destination array");
		return false;
	}

	delete newObject;
	newObject = ClassKitchen.create(newType, destArray);
	newObject.name = destArray.getUniqueItemName(newObject);

	newObjectSettings(newObject, function(e) {
		if(e) {
			alert(e);
			return;
		}

		newObject.name = destArray.getUniqueItemName(newObject);

		destArray.push(newObject);

		let createdNewPageId = "";
		if(newObject._className == "page") {
			createdNewPageId = newObject._id;
		}

		var expandedNodes = Session.get("pageEditorExpandedNodes") || [];
		var index = expandedNodes.indexOf(expandNode._id);
		if(index < 0) {
			expandedNodes.push(expandNode._id);
			Session.set("pageEditorExpandedNodes", expandedNodes);
		}

		if(!dontSelect) {
			Session.set("pageEditorSelectedObject", newObject._id);
		} else {
			Session.set("pageEditorSelectedObject", parent._id);			
		}

		Session.set("pageEditorFocusedObject", newObject._id);

		App.setModified();

		if(successCallback) {
			successCallback({
				createdNewPageId: createdNewPageId
			});
		}
	});
};

var newObjectSettings = function(object, callback) {
	switch(object.type) {
		case "custom_component": {
			object.html = "<template name=\"TEMPLATE_NAME\">\n\n</template>\n";
			object.js = "Template.TEMPLATE_NAME.created = function() {\n\n};\n\nTemplate.TEMPLATE_NAME.destroyed = function() {\n\n};\n\nTemplate.TEMPLATE_NAME.rendered = function() {\n\n};\n\nTemplate.TEMPLATE_NAME.helpers({\n\n});\n\nTemplate.TEMPLATE_NAME.events({\n\n});\n";
			object.jsx = "export class TEMPLATE_NAME extends Component {\n\trender() {\n\t\treturn (\n\t\t\t<div>\n\t\t\t</div>\n\t\t);\n\t}\n}\n";
/*
			var gasTemplate = ClassKitchen.create("gas_template", object.gasoline);
			gasTemplate.name = "TEMPLATE_NAME";
			object.gasoline.templates.push(gasTemplate);
*/
		}; break;

		case "form": {
			if(!object.mode) {
				object.mode = "insert";
			}
		}; break;

		case "page": {
			var self = this;

			pageWizard(
				function(el, values) {
					object.template = values.template;
					object.name = toSnakeCase(values.name);
					if(!object.name && object.template) {
						object.name = object.template;
					}

					switch(object.template) {
						case "reset_password": {
							object.route_params = ["resetPasswordToken"];
						}; break;
						case "verify_email": {
							object.route_params = ["verifyEmailToken"];
						}; break;
					}

					if(callback) {
						callback();
					}
				}, 
				function(el) {

				}, {
					defaultName: object.name
				}
			);
			return;

		}; break;
	}

	if(object._className != "gas_template" && (object.isInheritedFrom("gas_node") || object.isInheritedFrom("gas_element"))) {
		if(callback) {
			callback();
		}

		return;
	}

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
};

var startCrudWizard = function(parentObject, successCallback, dontSelect) {
	crudWizard(parentObject, "{}", function(el, result) {
		result.namePlural = result.namePlural.trim();
		result.nameSingular = result.nameSingular.trim();

		let nodesToExpand = [];
		let parentPage = null;
		let parentComponent = null;
		let createdNewPageId = "";
		if(result.createPage) {
			parentPage = ClassKitchen.create("page", parentObject.pages);
			parentPage.name = toSnakeCase(result.namePlural);
			parentPage.name = parentObject.pages.getUniqueItemName(parentPage);
			parentObject.pages.push(parentPage);
			nodesToExpand.push(parentObject._id);

			createdNewPageId = parentPage._id;

			parentComponent = parentPage;
		} else {
			switch(parentObject._className) {
				case "zone": {
					parentPage = parentObject;
					parentComponent = parentObject;
				}; break;

				case "page": {
					parentPage = parentObject;
					parentComponent = parentObject;
				}; break;

				default: {
					parentPage = parentObject.getParentOfType("page");
					parentComponent = parentObject;
				}
			}
		}

		// get root
		let kitchen = parentComponent.getRoot();
		let application = kitchen.application;

		// get collection
		let collection = kitchen.findObjectById(result.collectionId);

		// param name
		let paramName = toCamelCase(result.nameSingular) + "Id";

		// create query (list all)
		let queryAll = ClassKitchen.create("query", application.queries);
		queryAll.name = toSnakeCase(result.nameSingular) + "_list";
		queryAll.name = application.queries.getUniqueItemName(queryAll);
		queryAll.collection = collection.name;
		queryAll.filter = result.queryFilter;
		application.queries.push(queryAll);

		// create dataview
		let dataview = ClassKitchen.create("data_view", parentComponent.components);
		dataview.name = "view";
		dataview.name = parentComponent.components.getUniqueItemName(dataview);
		dataview.title = toTitleCase(result.namePlural);
		dataview.query_name = queryAll.name;

		parentComponent.components.push(dataview);

		if(result.createInsertForm) {
			// create query (for insert form)
			let queryNull = ClassKitchen.create("query", application.queries);
			queryNull.name = toSnakeCase(result.namePlural) + "_null";
			queryNull.name = application.queries.getUniqueItemName(queryNull);
			queryNull.filter = JSON.stringify({ _id: null });
			queryNull.collection = collection.name;
			queryNull.find_one = true;
			application.queries.push(queryNull);

			// create insert page
			let insertPage = ClassKitchen.create("page", parentPage.pages);
			insertPage.name = "insert";
			insertPage.name = parentPage.pages.getUniqueItemName(insertPage);
			parentPage.pages.push(insertPage);

			// create insert form
			let insertForm = ClassKitchen.create("form", insertPage.components);
			insertForm.name = "form";
			insertForm.name = insertForm.components.getUniqueItemName(insertForm);
			insertForm.mode = "insert";
			insertForm.title = "New " + toTitleCase(result.nameSingular);
			insertForm.query_name = queryNull.name;
			insertForm.submit_route = parentPage.getRoute();
			insertForm.cancel_route = parentPage.getRoute();
			insertPage.components.push(insertForm);

			dataview.insert_route = insertPage.getRoute();
		}

		if(result.createUpdateForm || result.createDetailsForm) {
			// create query (for edit form)
			let querySingle = ClassKitchen.create("query", application.queries);
			querySingle.name = toSnakeCase(result.nameSingular);
			querySingle.name = application.queries.getUniqueItemName(querySingle);
			querySingle.filter = JSON.stringify({ _id: ":" + paramName });
			querySingle.collection = collection.name;
			querySingle.find_one = true;
			application.queries.push(querySingle);

			if(result.createUpdateForm) {
				// create update page
				let updatePage = ClassKitchen.create("page", parentPage.pages);
				updatePage.name = "update";
				updatePage.name = parentPage.pages.getUniqueItemName(updatePage);
				updatePage.route_params.push(paramName);
				parentPage.pages.push(updatePage);

				// create update form
				let updateForm = ClassKitchen.create("form", updatePage.components);
				updateForm.name = "form";
				updateForm.name = updateForm.components.getUniqueItemName(updateForm);
				updateForm.mode = "update";
				updateForm.title = "Edit " + toTitleCase(result.nameSingular);
				updateForm.query_name = querySingle.name;
				updateForm.submit_route = parentPage.getRoute();
				updateForm.cancel_route = parentPage.getRoute();
				updatePage.components.push(updateForm);

				dataview.edit_route = updatePage.getRoute();

				let editRouteParam = ClassKitchen.create("param", dataview.edit_route_params);
				editRouteParam.name = paramName;
				editRouteParam.value = "this._id";
				dataview.edit_route_params.push(editRouteParam);
			}

			if(result.createDetailsForm) {
				// create details page
				let detailsPage = ClassKitchen.create("page", parentPage.pages);
				detailsPage.name = "details";
				detailsPage.name = parentPage.pages.getUniqueItemName(detailsPage);
				detailsPage.route_params.push(paramName);
				parentPage.pages.push(detailsPage);

				// create details form
				let detailsForm = ClassKitchen.create("form", detailsPage.components);
				detailsForm.name = "form";
				detailsForm.name = detailsForm.components.getUniqueItemName(detailsForm);
				detailsForm.mode = "read_only";
				detailsForm.title = toTitleCase(result.nameSingular) + " Details";
				detailsForm.query_name = querySingle.name;
				detailsForm.close_route = parentPage.getRoute();
				detailsForm.back_route = parentPage.getRoute();
				detailsPage.components.push(detailsForm);

				dataview.details_route = detailsPage.getRoute();

				let detailsRouteParam = ClassKitchen.create("param", dataview.details_route_params);
				detailsRouteParam.name = paramName;
				detailsRouteParam.value = "this._id";
				dataview.details_route_params.push(detailsRouteParam);
			}
		}

		// ---
		nodesToExpand.push(parentComponent._id);
		nodesToExpand.push(parentPage._id);

		if(nodesToExpand.length) {
			var expandedNodes = Session.get("pageEditorExpandedNodes") || [];

			nodesToExpand.map(expand => {
				var index = expandedNodes.indexOf(expand);
				if(index < 0) {
					expandedNodes.push(expand);
				}
			});
			Session.set("pageEditorExpandedNodes", expandedNodes);
		}

		if(!dontSelect) {
			Session.set("pageEditorSelectedObject", dataview._id);
		} else {
			Session.set("pageEditorSelectedObject", parentObject._id);
		}

		Session.set("pageEditorFocusedObject", dataview._id);


		App.setModified();

		if(successCallback) {
			successCallback({
				createdNewPageId: createdNewPageId
			});
		}
	}, function() {
		// ---
	}, {
		// ---
	});
};

// !!! 
//
// TODO:
//
// if zone is "free" add item to both public and private zones (?)
//
// !!!
var newPageAddToMenu = function(createdNewPageId) {

		let kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		let newPage = kitchen.findObjectById(createdNewPageId);
		if(!newPage) {
			return;
		}

		let parentPage = newPage.parentPageOrZone();
		if(!parentPage) {
			return;
		}

		let choices = [];
		choices.push({ label: "No", value: "no" });
		let menus = parentPage.components.getObjectsOfType("menu", true);
		menus.map(menu => {
			choices.push({ label: "Add to \"" + menu.name + "\"", value: menu._id });
		});
		choices.push({ label: "Create new menu", value: "new" });

		choiceBox(
			"New page created",
			"New page is created. Do you want link to this page to be added to parent's menu?",
			choices,
			choices[1].value,
			function(el, choice) {
				let destMenu = null;
				switch(choice) {
					case "no": break;
					case "new": {
						destMenu = ClassKitchen.create("menu", parentPage.components);
						destMenu.name = "menu";
						destMenu.name = parentPage.components.getUniqueItemName(destMenu);
						parentPage.components.push(destMenu);
					}; break;
					default: {
						destMenu = parentPage.components.findObjectById(choice, true);
					}
				}

				if(destMenu) {
					let menuItem = ClassKitchen.create("menu_item", destMenu.items);
					menuItem.title = toTitleCase(newPage.name);
					menuItem.route = newPage.getRoute();
					destMenu.items.push(menuItem);					
					App.setModified();
				}
			}, 
			function(el) {

			}, {
				approveButtonTitle: "OK",
				noDenyButton: true
			}
		);
};

var newObjectPostProcessing = function(options) {
	if(options.createdNewPageId) {
		newPageAddToMenu(options.createdNewPageId);
	}
};

var menuEditorAddItem = function(destArray) {
	if(!destArray) {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "menu") {
			return "";
		}

		destArray = selectedObject.items;
	}

	var newItem = ClassKitchen.create("menu_item", destArray);
	destArray.push(newItem);

	Session.set("pageEditorFocusedObject", newItem._id);

	var expandedItems = Session.get("menuEditorExpandedNodes") || [];
	if(expandedItems.indexOf(destArray._parent._id) < 0) {
		expandedItems.push(destArray._parent._id);
		Session.set("menuEditorExpandedNodes", expandedItems);
	}

	App.setModified();
};


var getSelectedObject = function() {
	if(!App.project) {
		return null;
	}

	var kitchen = App.project.get();
	if(!kitchen) {
		return null;
	}

	var selectedId = Session.get("pageEditorSelectedObject");
	return kitchen.findObjectById(selectedId);
};

var getGasolineObject = function() {
	var obj = getSelectedObject();
	if(!obj) {
		return null;
	}

	if(obj.getProperty("gasoline")) {
		return obj.gasoline;
	}

	if(obj._className == "gasoline") {
		return obj;
	}

	return obj.getParentOfType("gasoline");
};

var getGasTemplate = function() {
	var obj = getSelectedObject();

	if(!obj) {
		return null;
	}

	if(obj._className == "gas_template") {
		return obj;
	}

	return obj.getParentOfType("gas_template");
};

var showDesignerUI = function(obj) {
	return !!getGasTemplate();
};


var setGasSessionKeys = function() {
	var gasolineObject = getGasolineObject();
	var gasTemplate = gasolineObject ? getGasTemplate() : null;
	var gasTemplateName = gasTemplate ? gasTemplate.name : "";

	var input = gasolineObject ? gasolineObject.save(null, false, false, true) : null;

	Session.set("gasolineObject", input);
	Session.set("gasTemplateName", gasTemplateName);

	// !!!!!!! REMOVE THIS (?)
	if(input) {
		var component = gasolineObject.getParentWithProperty("use_gasoline");
		if(component && component.use_gasoline) {
			gasoline.getBlaze(input, function(err, html, js) {
				if(err) {
					return;
				}
				component.html = html;
				component.js = js;
			});

			gasoline.getReact(input, function(err, jsx) {
				if(err) {
					return;
				}
				component.jsx = jsx;
			}, {
				meteorKitchen: true,
				createContainer: (component._className == "zone" || component._className == "page")
			});
		}
	}
	// !!!!!!!!!!

};

var designerAddObject = function(targetObjectId, data) {
	if(!App.project) {
		return null;
	}

	var kitchen = App.project.get();
	if(!kitchen) {
		return null;
	}

	var input = Session.get("gasolineObject");

	var targetObject = gasoline.findObject(input, targetObjectId);
	if(!targetObject) {
		return;
	}
	if(targetObject.type == "text") {
		return;
	}

	var newObject = JSON.parse(JSON.stringify(data));
	delete newObject._id;

	if(!newObject) {
		return;
	}

	if(newObject.templates) {
		if(!input.templates) {
			return;
		}

		var tmp = JSON.parse(JSON.stringify(newObject));
		newObject = null;
		if(tmp.templates.length) {
			newObject = {
				type: "inclusion",
				template: tmp.templates[0].name || "TEMPLATE_NAME"
			};
		}

		input.templates.concat(tmp.templates);
	}

	if(newObject.type == "template") {
		if(!input.templates) {
			return;
		}

		var tmp = JSON.parse(JSON.stringify(newObject));
		newObject = null;
		newObject = {
			type: "inclusion",
			template: tmp.name || "TEMPLATE_NAME"
		};

		input.templates.push(tmp);
	}

	if(!newObject) {
		return;
	}

	// add new object
	var addedObject = gasoline.addObject(input, targetObjectId, newObject);

	if(addedObject) {

		var gas = kitchen.findObjectById(input._id);
		if(gas) {
			gas.load(input, true);
			App.setModified();
		}

		gasoline.selectObject(input, addedObject._id);

		var expandedNodes = Session.get("pageEditorExpandedNodes") || [];
		var parent = gasoline.findParentObject(input, addedObject._id);
		while(parent) {
			if(expandedNodes.indexOf(parent._id) < 0) {
				expandedNodes.push(parent._id);
			}
			parent = gasoline.findParentObject(input, parent._id);
		}

		Session.set("pageEditorExpandedNodes", expandedNodes);
		Session.set("pageEditorSelectedObject", addedObject._id);
		Session.set("pageEditorFocusedObject", addedObject._id);

		App.setModified();
	}
};

var gotoDesigner = function(objectId) {
	if(!App.project) {
		return;
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return;
	}

	var selectedObject = kitchen.findObjectById(objectId);
	if(!selectedObject || !selectedObject.use_gasoline || !selectedObject.getProperty("gasoline")) {
		return;
	}

	var gasoline = selectedObject.gasoline;

	var selectTemplate = null;
	if(gasoline.templates && gasoline.templates.length) {
		selectTemplate = gasoline.templates[0];
	} else {
		selectTemplate = ClassKitchen.create("gas_template", gasoline);
		selectTemplate.name = "TEMPLATE_NAME";
		gasoline.templates.push(selectTemplate);
		App.setModified();
	}

	// expand nodes
	var expandedNodes = Session.get("pageEditorExpandedNodes") || [];
	var refreshExpandedNodes = false;
	var index = expandedNodes.indexOf(selectedObject._id);
	if(index < 0) {
		expandedNodes.push(selectedObject._id);
		refreshExpandedNodes = true;
	}
	index = expandedNodes.indexOf(gasoline._id);
	if(index < 0) {
		expandedNodes.push(gasoline._id);
		refreshExpandedNodes = true;
	}
	if(refreshExpandedNodes) {
		Session.set("pageEditorExpandedNodes", expandedNodes);		
	}


	Meteor.defer(function() {
		Session.set("pageEditorSelectedObject", selectTemplate._id);
		Session.set("pageEditorFocusedObject", selectTemplate._id);
	});
};

var toggleDesigner = function(objectId) {
	if(!App.project) {
		return;
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return;
	}

	var selectedObject = kitchen.findObjectById(objectId);
	if(!selectedObject) {
		return;
	}

	var title = "";
	var message = "";
	if(selectedObject.use_gasoline) {
		title = "Turn designer off";
		message = "Do you want to turn designer off for this component and continue editing code manually? Warning: if you later decide to turn designer on, your manual code edits will be lost.";
	} else {
		title = "Turn designer on";
		message = "Do you want to turn designer on for this component? Warning: your manual code edits will be lost.";
	}

	confirmationBox(title, message, function() {
		selectedObject.use_gasoline = !selectedObject.use_gasoline;
		App.setModified();

		if(selectedObject.use_gasoline) {
			gotoDesigner(selectedObject._id);
		}
	}, function() {

	}, {

	});
};

var importGasFromCommunity = function(groupId) {
	importSharedGasBox("Browse Shared Blocks", function(el) {

	}, function() {

	}, {
		noDenyButton: true,
		approveButtonTitle: "OK",
		onImport: function(itemId, onDone) {
			Meteor.call("importSharedToGasolinePalette", itemId, groupId, function(e, r) {
				if(onDone) {
					onDone();
				}

				if(e) {
					alert(e.message);
					return;
				}
			});
		}
	});
};


var toggleUserDefinedTemplate = function(objectId) {
	if(!App.project) {
		return;
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return;
	}

	var selectedObject = kitchen.findObjectById(objectId);
	if(!selectedObject) {
		return;
	}

	var title = "";
	var message = "";
	if(selectedObject.user_defined_template) {
		title = "Use built-in template";
		message = "Do you want to use built-in template? Warning: Your manual edits will be lost.";
	} else {
		title = "Turn editing on";
		message = "Do you want to turn off built-in template and edit the code manually? Warning: if you later decide to switch back to built-in template then your manual edits will be lost.";
	}

	confirmationBox(title, message, function() {

		if(!selectedObject.user_defined_template) {
			var frontend = "";
			var template = "";
			switch(selectedObject._className) {
				case "zone": {
					frontend = kitchen.application.frontend || "bootstrap3";
					template = selectedObject.layout || "";

					Meteor.call("getLayoutGasTemplate", template, frontend, function(e, r) {
						if(!e && r) {
							selectedObject.gasoline.load(r);

							gasoline.getBlaze(r, function(err, html, js) {
								if(!err) {
									selectedObject.html = html;
									selectedObject.js = js;
								}
							});

							gasoline.getReact(r, function(err, jsx) {
								if(!err) {
									selectedObject.jsx = jsx;
								}
							}, {
								meteorKitchen: true,
								createContainer: (selectedObject._className == "zone" || selectedObject._className == "page")
							});
						}
						selectedObject.user_defined_template = true;
						App.setModified();
					});
				}; break;

				case "page": {
					frontend = kitchen.application.frontend || "bootstrap3";
					template = selectedObject.template || "";

					Meteor.call("getPageGasTemplate", template, frontend, function(e, r) {
						if(!e && r) {
							selectedObject.gasoline.load(r);

							gasoline.getBlaze(r, function(err, html, js) {
								if(!err) {
									selectedObject.html = html;
									selectedObject.js = js;
								}
							});

							gasoline.getReact(r, function(err, jsx) {
								if(!err) {
									selectedObject.jsx = jsx;
								}
							}, {
								meteorKitchen: true,
								createContainer: (selectedObject._className == "zone" || selectedObject._className == "page")
							});
						}
						selectedObject.user_defined_template = true;
						App.setModified();
					});
				}; break;

				default: {
					selectedObject.user_defined_template = true;
					App.setModified();
				}
			}
		} else {
			selectedObject.user_defined_template = false;
			App.setModified();
		}

	}, function() {

	}, {

	});
};


// ----------------------------------------------------------------------------
// HomePrivateEditPages

Template.HomePrivateEditPages.created = function() {
};


Template.HomePrivateEditPages.rendered = function() {
	var resizeContainers = function() {
		$(".scrollable-area").each(function() {
			$(this).css({ width: $(this).closest(".column").width() + "px" });
			$(this).parent().css({ width: $(this).closest(".column").width() + "px" });

			var height = $(this).closest(".editor-column").height() - $(this).position().top;

			if($(this).hasClass("height-half")) {
				height = height / 2;
			}

			$(this).css({ height: height + "px" });
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

Template.HomePrivateEditPages.helpers({

});

Template.HomePrivateEditPages.events({

});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesLeftColumn

Template.HomePrivateEditPagesLeftColumn.created = function() {
};


Template.HomePrivateEditPagesLeftColumn.rendered = function() {
	this.autorun(function (tracker) {
		Session.get("pageEditorSelectedObject");

		setGasSessionKeys();

		App.refreshWindowSize();
	});
};

Template.HomePrivateEditPagesLeftColumn.helpers({
	"application": function() {
		if(!App.project) {
			return null;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return null;
		}
		return kitchen.application;
	},

	"showDesignerUI": function() {
		return showDesignerUI();
	},

	"treeHeightClass": function() {
		return showDesignerUI() ? "height-half" : "height-max";
	},

	"treeScrollHeightClass": function() {
		return showDesignerUI() ? "height-half" : "";
	}
});

Template.HomePrivateEditPagesLeftColumn.events({

});

// ----------------------------------------------------------------------------
// HomePrivateEditPagesGasolinePalette

Template.HomePrivateEditPagesGasolinePalette.rendered = function() {
	var expandedNodes = Session.get("gasolinePaletteExpandedNodes");
	if(!expandedNodes) {
		Session.set("gasolinePaletteExpandedNodes", []);
	}
};

Template.HomePrivateEditPagesGasolinePalette.helpers({
	"iconClass": function() {
		if(!this) {
			return "";
		}

		var expandedNodes = Session.get("gasolinePaletteExpandedNodes") || [];
		return expandedNodes.indexOf(this._id) >= 0 ? "fa-folder-open" : "fa-folder";
	},

	"caretClass": function() {
		if(!this) {
			return "";
		}

		var caretClass = "";
		var expandedNodes = Session.get("gasolinePaletteExpandedNodes") || [];
		if(expandedNodes.indexOf(this._id) >= 0) {
			caretClass += caretClass ? " " : "";
			caretClass += "fa-caret-down";			
		} else {
			caretClass += caretClass ? " " : "";
			caretClass += "fa-caret-right";
		}
		
		return caretClass;
	},

	"canInsert": function() {
		if(!this) {
			return false;
		}

		return this.custom || this.community;
	},

	"paletteGroupItemClass": function() {
		if(!this) {
			return "";
		}

		var groupItemClass = "";

		if(this.custom) {
			groupItemClass += "accept-gas-elements";
		}

		return groupItemClass;
	},

	"isExpanded": function() {
		if(!this) {
			return false;
		}

		var expandedNodes = Session.get("gasolinePaletteExpandedNodes") || [];
		return expandedNodes.indexOf(this._id) >= 0;
	}
});

Template.HomePrivateEditPagesGasolinePalette.events({
	"click .tree-link": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		var expandedNodes = Session.get("gasolinePaletteExpandedNodes") || [];
		var index = expandedNodes.indexOf(this._id);
		if(index >= 0) {
			expandedNodes.splice(index, 1);
		} else {
			expandedNodes.push(this._id);
		}
		Session.set("gasolinePaletteExpandedNodes", expandedNodes);

		return false;
	},


	"dragover .accept-gas-elements": function(e, t) {
		e.preventDefault();
	},


	"drop .accept-gas-elements": function(e, t) {
		e.preventDefault();
		e.stopPropagation();

		// parse transfer
		var transfer = e.originalEvent.dataTransfer.getData("text");
		if(!transfer) {
			return;
		}
		var data = null;
		try {
			data = JSON.parse(transfer);
		} catch(err) {
			return;
		}

		if(!data || data.source != "gasoline-designer") {
			return;
		}

		var gasolineObject = getGasolineObject();
		if(!gasolineObject) {
			return;
		}

		var input = gasolineObject.save(null, false, false, true);
		if(!input) {
			return;
		}

		var object = gasoline.findObject(input, data.id);
		if(!object) {
			return;
		}

		delete object._id;
		delete object.object_type;

		var groupId = this._id;
		gasItemProperties(
			"Add to palette",
			"",
			false,
			function(el, data) { 
				Meteor.call("addToGasolinePalette", object, data.title, data.shared, groupId, function(err, res) {
					if(err) {
						alert(err.message);
					}
				});
			}, 
			function() {

			}, {

			}
		);
	},

	"click .add-object": function(e, t) {
		e.preventDefault();
		e.stopPropagation();

		var self = this;

		if(this.custom) {
			importBlazeBox("Import HTML (Blaze)", "\n", "\n", function(el, gas) {

				var object = null;
				if(gas.templates && gas.templates.length) {
					if(gas.templates.length > 1) {
						object = { templates: gas.templates };
					} else {
						object = gas.templates[0];
					}
				} else {
					if(gas.naked && gas.naked.children && gas.naked.children.length) {
						if(gas.naked.children.length > 1) {
							object = {
								type: "html",
								element: "div",
								children: gas.naked.children
							};
						} else {
							object = gas.naked.children[0];
						}
					}
				}

				if(!gas) {
					return;
				}

				var groupId = self._id;
				gasItemProperties(
					"Add to palette",
					"",
					false,
					function(el, data) { 
						Meteor.call("addToGasolinePalette", object, data.title, data.shared, groupId, function(err, res) {
							if(err) {
								alert(err.message);
							}
						});
					}, 
					function() {

					}, {

					}
				);
			}, null, null);
		}

		if(this.community) {
			importGasFromCommunity(this._id);
		}

		return false;
	}

});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesGasolinePaletteItems

Template.HomePrivateEditPagesGasolinePaletteItems.events({
	"dragstart .gasoline-palette-item": function(e, t) {
		e.stopPropagation();
		var itemId = $(e.currentTarget).attr("data-id");
		if(!itemId) {
			return;
		}

		var item = GasolinePalette.findOne({ _id: itemId });
		if(!item || !item.data) {
			return;
		}

		e.originalEvent.dataTransfer.setData("text", JSON.stringify({ 
			source: "gasoline-palette", 
			id: itemId, 
			data: item.data
		}));
	},

	"click .remove-item": function(e, t) {
		e.preventDefault();
		var self = this;
		confirmationBox(
			"Delete block",
			"Are you sure you want to delete \"" + self.title + "\" from the palette?",
			function(el) {
				Meteor.call("removeFromGasolinePalette", self._id, function(err, res) {
					if(err) {
						alert(err.message);
					}
				});
			}, 
			function(el) {

			}, {
				approveButtonTitle: "Yes",
				denyButtonTitle: "No"
			}
		);

		return false;
	},


	"click .edit-item": function(e, t) {
		var self = this;


		var original = this.data;

		if(!original.templates && original.type != "template") {
			original = { 
				naked: { 
					children: [
						JSON.parse(JSON.stringify(original))
					]
				}
			};
		}

		gasoline.getBlaze(original, function(err, html, js) {
			if(err) {
				console.log(err);
				alert(err.message);
				return;
			}

			importBlazeBox("Edit Block", html, js, function(el, gas) {
				var object = null;
				if(gas.templates && gas.templates.length) {
					if(gas.templates.length > 1) {
						object = { templates: gas.templates };
					} else {
						object = gas.templates[0];
					}
				} else {
					if(gas.naked && gas.naked.children && gas.naked.children.length) {
						if(gas.naked.children.length > 1) {
							object = {
								type: "html",
								element: "div",
								children: gas.naked.children
							};
						} else {
							object = gas.naked.children[0];
						}
					}
				}

				if(!object) {
					return;
				}

				Meteor.call("updateGasolinePaletteItemData", self._id, object, function(er, re) {
					if(er) {
						alert(er.message);
					}
				});

			}, null, null);
		});
	},

	"click .item-properties": function(e, t) {
		var self = this;
		gasItemProperties(
			"Edit block",
			self.title,
			self.shared,
			function(el, data) {
				Meteor.call("updateGasolinePaletteItem", self._id, data.title, data.shared, function(err, res) {
					if(err) {
						alert(err.message);
					}
				});
			}, 
			function() {

			}, {

			}
		);		
	},

	"click .import-from-community": function(e, t) {
		importGasFromCommunity(this.groupId);
	}
});

Template.HomePrivateEditPagesGasolinePaletteItems.helpers({
	"gasolinePaletteItems": function() {
		if(!this.groupId) {
			return null;
		}

		var items = [];
		if(this.community) {
			items = GasolinePalette.find({ groupId: this.groupId, createdBy: Meteor.userId(), originalCreatedBy: { $ne: Meteor.userId() } }, { sort: { title: 1 } }).fetch();
		} else {
			if(this.custom) {
				items = GasolinePalette.find({ groupId: this.groupId, createdBy: Meteor.userId(), originalCreatedBy: Meteor.userId() }, { sort: { title: 1 } }).fetch();
			} else {
				items = GasolinePalette.find({ groupId: this.groupId }, { sort: { title: 1 } }).fetch();
			}
		}
		return items;
	},

	"canRemove": function() {
		if(!this) {
			return false;
		}
		return this.userDefined && this.createdBy == Meteor.userId();
	},

	"canEdit": function() {
		if(!this) {
			return false;
		}
		return this.userDefined && this.createdBy == Meteor.userId();
	}

});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesPageTree

Template.HomePrivateEditPagesPageTree.created = function() {
};


Template.HomePrivateEditPagesPageTree.rendered = function() {
};

Template.HomePrivateEditPagesPageTree.helpers({
	"pageList": function() {
		var root = this.root;
		if(root) {
			if(root._className == "application") {
				pageList = [];
				pageList.push(root.free_zone);
				pageList.push(root.public_zone);
				pageList.push(root.private_zone);
				return pageList;				
			}
			if(root._className == "zone" || root._className == "page") {
				return root.pages;
			}
		}
		return [];
	},
	"componentList": function() {
		var root = this.root;
		if(root) {
			if(root._className == "application") {
				return [];
			}
			if(root._className == "zone" || root._className == "page" || root.isInheritedFrom("component")) {
				return root.components;
			}
		}
		return [];
	},

	"gasolineObjects": function() {
		var root = this.root;
		if(root && root.gasoline && root.use_gasoline) {
			return [root.gasoline];
		}
		return [];
	},

	"gasTemplateList": function() {
		var root = this.root;
		if(root) {
			if(root._className == "gasoline") {
				return root.templates;
			}
		}
		return [];
	},

	"gasNodes": function() {
		var root = this.root;
		if(root) {
			if(root.isInheritedFrom("gas_element")) {
				return root.children;
			}
		}
		return [];
	}

});

Template.HomePrivateEditPagesPageTree.events({
});

// ----------------------------------------------------------------------------
// HomePrivateEditPagesPageTreeItem

Template.HomePrivateEditPagesPageTreeItem.created = function() {
};


Template.HomePrivateEditPagesPageTreeItem.rendered = function() {
};

Template.HomePrivateEditPagesPageTreeItem.helpers({
	"isExpanded": function() {
		if(!this) {
			return false;
		}
		var expandedNodes = Session.get("pageEditorExpandedNodes") || [];
		return expandedNodes.indexOf(this._id) >= 0;
	},

	"displayName": function() {
		if(!this) {
			return "";
		}

		return objectDisplayName(this);
	},

	"treeLinkClass": function() {
		if(!this) {
			return "";
		}

		var pageEditorSelectedObject = Session.get("pageEditorSelectedObject");
		var pageEditorFocusedObject = Session.get("pageEditorFocusedObject");

		var treeLinkClass = "";
		if(this._id == pageEditorSelectedObject && this._id == pageEditorFocusedObject) {
			treeLinkClass += treeLinkClass ? " " : "";
			treeLinkClass += "focused";
		} else {
			if(this._id == pageEditorSelectedObject) {
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
		if(
			(!this.pages || !this.pages.length) && 
			(!this.components || !this.components.length) && 
			(!this.gasoline || !this.use_gasoline) &&
			(!this._className == "gasoline" || !this.templates || !this.templates.length) &&
			(!this.isInheritedFrom("gas_element") || !this.children || !this.children.length)
		) {
			caretClass += caretClass ? " " : "";
			caretClass += "transparent";
		}

		var expandedNodes = Session.get("pageEditorExpandedNodes") || [];
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
		if(!this) {
			return "";
		}

		switch(this._className) {
			case "zone": {
				var expandedNodes = Session.get("pageEditorExpandedNodes") || [];
				return expandedNodes.indexOf(this._id) >= 0 ? "fa-folder-open" : "fa-folder";
			}; break;

			case "page": return "fa-file-o"; break;

			case "gasoline": return "fa-puzzle-piece"; break;

			default: {
				if(this.isInheritedFrom("component")) {
					return "fa-cube";
				}
				if(this.isInheritedFrom("gas_node") || this.isInheritedFrom("gas_element")) {
					return "fa-code";
				}
			}
		}
		return "";
	},

	"canRemove": function() {
		if(!this) {
			return false;
		}
		return this._className != "zone" && this._className != "gasoline" && this._className != "gas_condition_true" && this._className != "gas_condition_false";
	},
	
	"canInsert": function() {
		if(!this) {
			return false;
		}

		return (
			this._className == "zone" || 
			this._className == "page" || 
			this._className == "gasoline" || 
			(this.isInheritedFrom("component") && (this.getProperty("components") || this.getProperty("pages"))) ||
			(this.isInheritedFrom("gas_element") && this._className != "gas_condition")
		);
	},

	"draggable": function() {

	}
});

Template.HomePrivateEditPagesPageTreeItem.events({
	"click .tree-link": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var focusedId = Session.get("pageEditorFocusedObject");
		if(selectedId == this._id) {
			if(focusedId == this._id) {
				var expandedNodes = Session.get("pageEditorExpandedNodes") || [];
				var index = expandedNodes.indexOf(this._id);
				if(index >= 0) {
					expandedNodes.splice(index, 1);
				} else {
					expandedNodes.push(this._id);
				}
				Session.set("pageEditorExpandedNodes", expandedNodes);
			} else {
				Session.set("pageEditorFocusedObject", this._id);
			}
		} else {
			Session.set("pageEditorSelectedObject", this._id);
			Session.set("pageEditorFocusedObject", this._id);
		}

		return false;
	},

	"click .add-object": function(e, t) {
		e.preventDefault();

		if(!this) {
			return false;
		}

		pageTreeAddObject(this, false, false);

		return false;
	},

	"click .remove-object": function(e, t) {
		e.preventDefault();
		var self = this;
		confirmationBox(
			"Delete " + objectDisplayName2(self),
			"Are you sure you want to delete " + objectDisplayName2(self) + (self.name ? " \"" + self.name + "\"?" : "?"),
			function(el) {
				var nextSelectedObject = self._parent;

				if(self.getRoot().removeObjectById(self._id, true)) {
					App.setModified();

					if(nextSelectedObject) {
						var expandedItems = Session.get("pageEditorExpandedNodes") || [];
						var selectId = null;
						if(expandedItems.indexOf(nextSelectedObject._id) >= 0) {
							selectId = nextSelectedObject._id;
						} else {
							nextSelectedObject = nextSelectedObject._parent;
							if(nextSelectedObject && expandedItems.indexOf(nextSelectedObject._id) >= 0) {
								selectId = nextSelectedObject._id;
							}
						}

						if(selectId) {
							Session.set("pageEditorSelectedObject", selectId);
							Session.set("pageEditorFocusedObject", selectId);
						}
					}
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


// ----------------------------------------------------------------------------
// HomePrivateEditPagesMainColumn

Template.HomePrivateEditPagesMainColumn.helpers({
	"selectedObjectDisplayName": function() {
		if(!App.project) {
			return "";
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return "";
		}

		var displayName = "";
		if(selectedObject._className == "zone") {
			return toTitleCase(selectedObject.getParentKeyName());
		}

		if(selectedObject._className == "gasoline") {
			return "Designer";
		}

		if(selectedObject._className == "gas_template") {
			return "Template: " + selectedObject.name;
		}

		if(selectedObject._className == "gas_html") {
			return "HTML element" + (selectedObject.element ? ": " + selectedObject.element : "");
		}

		if(selectedObject._className == "gas_text") {
			return "Static Text";
		}

		if(selectedObject._className == "gas_condition_true") {
			return "Condition (true)";
		}

		if(selectedObject._className == "gas_condition_false") {
			return "Condition (false)";
		}

		if(selectedObject.isInheritedFrom("gas_node") || selectedObject.isInheritedFrom("gas_element")) {
			return toTitleCase(selectedObject.type);
		}

		return toTitleCase(selectedObject._className) + ": " + selectedObject.name;
	},

	"mainViewMenuItems": function() {
		if(!App.project) {
			return [];
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return [];
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return [];
		}

		var items = [];
		var pageEditorMainView = Session.get("pageEditorMainView") || "";

		if(showDesignerUI(selectedObject)) {
			items.push({ view: "designer", id: "main-view-designer", class: pageEditorMainView == "designer" ? "active" : "", title: "Designer" });

			items.push({ view: "preview_html", id: "main-view-preview-html", class: pageEditorMainView == "preview_html" ? "active" : "", title: "HTML" });
			items.push({ view: "preview_js", id: "main-view-preview-js", class: pageEditorMainView == "preview_js" ? "active" : "", title: "JS" });
			items.push({ view: "preview_jsx", id: "main-view-preview-jsx", class: pageEditorMainView == "preview_jsx" ? "active" : "", title: "JSX" });
		}

		switch(selectedObject._className) {
			case "zone": {
				items.push({ view: "layout", id: "main-view-layout", class: pageEditorMainView == "layout" ? "active" : "", title: "Layout" });

				if(selectedObject.user_defined_template) {
					if(selectedObject.use_gasoline) {
						items.push({ view: "preview_html", id: "main-view-preview-html", class: pageEditorMainView == "preview_html" ? "active" : "", title: "HTML" });
						items.push({ view: "preview_js", id: "main-view-preview-js", class: pageEditorMainView == "preview_js" ? "active" : "", title: "JS" });
						items.push({ view: "preview_jsx", id: "main-view-preview-jsx", class: pageEditorMainView == "preview_jsx" ? "active" : "", title: "JSX" });
					} else {
						items.push({ view: "custom_html", id: "main-view-custom-html", class: pageEditorMainView == "custom_html" ? "active" : "", title: "HTML" });
						items.push({ view: "custom_js", id: "main-view-custom-js", class: pageEditorMainView == "custom_js" ? "active" : "", title: "JS" });
						items.push({ view: "custom_jsx", id: "main-view-custom-jsx", class: pageEditorMainView == "custom_jsx" ? "active" : "", title: "JSX" });
					}
				}

				items.push({ view: "data", id: "main-view-data", class: pageEditorMainView == "data" ? "active" : "", title: "Data Source" });
				items.push({ view: "helpers_events", id: "main-view-helpers-events", class: pageEditorMainView == "helpers_events" ? "active" : "", title: "Code" });
			}; break;
			case "page": {
				items.push({ view: "template", id: "main-view-template", class: pageEditorMainView == "template" ? "active" : "", title: "Template" });

				if(selectedObject.user_defined_template) {
					if(selectedObject.use_gasoline) {
						items.push({ view: "preview_html", id: "main-view-preview-html", class: pageEditorMainView == "preview_html" ? "active" : "", title: "HTML" });
						items.push({ view: "preview_js", id: "main-view-preview-js", class: pageEditorMainView == "preview_js" ? "active" : "", title: "JS" });
						items.push({ view: "preview_jsx", id: "main-view-preview-jsx", class: pageEditorMainView == "preview_jsx" ? "active" : "", title: "JSX" });
					} else {
						items.push({ view: "custom_html", id: "main-view-custom-html", class: pageEditorMainView == "custom_html" ? "active" : "", title: "HTML" });
						items.push({ view: "custom_js", id: "main-view-custom-js", class: pageEditorMainView == "custom_js" ? "active" : "", title: "JS" });
						items.push({ view: "custom_jsx", id: "main-view-custom-jsx", class: pageEditorMainView == "custom_jsx" ? "active" : "", title: "JSX" });
					}
				}

				items.push({ view: "roles", id: "main-view-roles", class: pageEditorMainView == "roles" ? "active" : "", title: "Access Rights" });
				items.push({ view: "route", id: "main-view-route", class: pageEditorMainView == "route" ? "active" : "", title: "Route" });
			}; break;
			case "custom_component": {
				items.push({ view: "toggle_designer", id: "main-view-toggle-designer", class: pageEditorMainView == "toggle_designer" ? "active" : "", title: "Designer" });
				if(selectedObject.use_gasoline) {
					items.push({ view: "preview_html", id: "main-view-preview-html", class: pageEditorMainView == "preview_html" ? "active" : "", title: "HTML" });
					items.push({ view: "preview_js", id: "main-view-preview-js", class: pageEditorMainView == "preview_js" ? "active" : "", title: "JS" });
					items.push({ view: "preview_jsx", id: "main-view-preview-jsx", class: pageEditorMainView == "preview_jsx" ? "active" : "", title: "JSX" });
				} else {
					items.push({ view: "custom_html", id: "main-view-custom-html", class: pageEditorMainView == "custom_html" ? "active" : "", title: "HTML" });
					items.push({ view: "custom_js", id: "main-view-custom-js", class: pageEditorMainView == "custom_js" ? "active" : "", title: "JS" });
					items.push({ view: "custom_jsx", id: "main-view-custom-jsx", class: pageEditorMainView == "custom_jsx" ? "active" : "", title: "JSX" });
				}
			}; break;
			case "menu": {
				items.push({ view: "menu_items", id: "main-view-menu-items", class: pageEditorMainView == "menu_items" ? "active" : "", title: "Menu Items" });
			}; break;
			case "markdown": {
				items.push({ view: "markdown", id: "main-view-markdown", class: pageEditorMainView == "markdown" ? "active" : "", title: "Markdown" });
			}; break;

			case "gasoline": {
				items.push({ view: "gasoline", id: "main-view-gasoline", class: pageEditorMainView == "gasoline" ? "active" : "", title: "Templates" });
			}; break;
		}

		if(selectedObject.isInheritedFrom("component")) {
			var gotQuery = !!selectedObject.getProperty("query_name");
			if(gotQuery) {
				items.push({ view: "data", id: "main-view-data", class: pageEditorMainView == "data" ? "active" : "", title: "Data Source" });
			}

			let gotFields = !!selectedObject._properties.find(property => {
				return property.type == "base_array" && property.subType == "field";
			});

			if(gotFields) {
				items.push({ view: "fields", id: "main-view-fields", class: pageEditorMainView == "fields" ? "active" : "", title: "Fields" });
			}

			let gotRoutes = !!selectedObject._properties.find(property => {
				return property.input == "select_route";
			});

			if(gotRoutes) {
				items.push({ view: "links", id: "main-view-links", class: pageEditorMainView == "links" ? "active" : "", title: "Links" });
			}

			let gotCustomActions = !!selectedObject._properties.find(property => {
				return property.type == "base_array" && property.subType == "action";
			});

			if(gotCustomActions) {
				items.push({ view: "custom_actions", id: "main-view-custom-actions", class: pageEditorMainView == "custom_actions" ? "active" : "", title: "Custom Actions" });
			}

			let gotHelpersEvents = !!selectedObject._properties.find(property => {
				return property.name == "events_code" || property.name == "helpers_code" || property.name == "template_rendered_code";
			});

			if(gotHelpersEvents && !selectedObject.user_defined_template) {
				items.push({ view: "helpers_events", id: "main-view-helpers-events", class: pageEditorMainView == "helpers_events" ? "active" : "", title: "Code" });
			}

		}

		switch(selectedObject._className) {
			case "form": {
				items.push({ view: "form_actions", id: "main-view-form-actions", class: pageEditorMainView == "form_actions" ? "active" : "", title: "Actions" });
			}; break;
			case "data_view": {
				items.push({ view: "data_view_actions", id: "main-view-data-view-actions", class: pageEditorMainView == "data_view_actions" ? "active" : "", title: "Actions" });
			}; break;
		}

		if(selectedObject.getProperty("pages")) {
			items.push({ view: "pages", id: "main-view-pages", class: pageEditorMainView == "pages" ? "active" : "", title: "Pages" });
		}

		if(selectedObject.getProperty("components")) {
			items.push({ view: "components", id: "main-view-components", class: pageEditorMainView == "components" ? "active" : "", title: "Components" });
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

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return "HomePrivateEditPagesNoSelectionView";
		}

		var pageEditorMainView = "";
		var pageEditorPreferView = Session.get("pageEditorPreferView") || "";

		var possibleViews = [];

		var selectedType = selectedObject._className == "base_array" ? selectedObject.getParentKeyName() : selectedObject._className;
		switch(selectedType) {
			case "zone": {
				possibleViews = ["layout", "data", "helpers_events"];

				if(selectedObject.user_defined_template) {
					if(selectedObject.use_gasoline) {
						possibleViews = possibleViews.concat(["preview_html", "preview_js", "preview_jsx"]);
					} else {
						possibleViews = possibleViews.concat(["custom_html", "custom_js", "custom_jsx"]);
					}
				}
			}; break;

			case "page": {
				possibleViews = ["template", "roles", "route"];

				if(selectedObject.user_defined_template) {
					if(selectedObject.use_gasoline) {
						possibleViews = possibleViews.concat(["preview_html", "preview_js", "preview_jsx"]);
					} else {
						possibleViews = possibleViews.concat(["custom_html", "custom_js", "custom_jsx"]);
					}
				}
			}; break;

			case "custom_component": {
				possibleViews = possibleViews.concat(["toggle_designer"]);
				if(selectedObject.use_gasoline) {
					possibleViews = possibleViews.concat(["preview_html", "preview_js", "preview_jsx"]);
				} else {
					possibleViews = possibleViews.concat(["custom_html", "custom_js", "custom_jsx"]);
				}
			}; break;
			case "menu": possibleViews = ["menu_items"]; break;
			case "markdown": possibleViews = ["markdown"]; break;
			case "gasoline": possibleViews = ["gasoline"]; break;
		}

		if(selectedObject.getProperty("pages")) {
			possibleViews.push("pages");
		}

		if(selectedObject.getProperty("components")) {
			possibleViews.push("components");
		}

		if(showDesignerUI(selectedObject)) {
			possibleViews = ["designer", "preview_html", "preview_js", "preview_jsx"].concat(possibleViews);
		}

		if(selectedObject.isInheritedFrom("component")) {
			var gotQuery = !!selectedObject.getProperty("query_name");

			if(gotQuery) {
				possibleViews.push("data");
			}

			let gotFields = !!selectedObject._properties.find(property => {
				return property.type == "base_array" && property.subType == "field";
			});

			if(gotFields) {
				possibleViews.push("fields");
			}

			let gotRoutes = !!selectedObject._properties.find(property => {
				return property.input == "select_route";
			});

			if(gotRoutes) {
				possibleViews.push("links");
			}

			let gotCustomActions = !!selectedObject._properties.find(property => {
				return property.type == "base_array" && property.subType == "action";
			});

			if(gotCustomActions) {
				possibleViews.push("custom_actions");
			}


			let gotHelpersEvents = !!selectedObject._properties.find(property => {
				return property.name == "events_code" || property.name == "helpers_code" || property.name == "template_rendered_code";
			});

			if(gotHelpersEvents && !selectedObject.user_defined_template) {
				possibleViews.push("helpers_events");
			}
		}

		switch(selectedType) {
			case "form": possibleViews.push("form_actions"); break;
			case "data_view": possibleViews.push("data_view_actions"); break;
		}

		if(pageEditorPreferView && possibleViews.indexOf(pageEditorPreferView) >= 0) {
			pageEditorMainView = pageEditorPreferView;
		}

		if(possibleViews.indexOf(pageEditorMainView) < 0) {
			pageEditorMainView = possibleViews.length ? possibleViews[0] : "";
		}

		Session.set("pageEditorMainView", pageEditorMainView);

		switch(pageEditorMainView) {
			case "pages": return "HomePrivateEditPagesPageListView"; break;
			case "components": return "HomePrivateEditPagesComponentListView"; break;
			case "layout": return "HomePrivateEditPagesLayoutView"; break;
			case "template": return "HomePrivateEditPagesTemplateView"; break;
			case "toggle_designer": return "HomePrivateEditPagesToggleDesignerView"; break;
			case "designer": return "HomePrivateEditPagesDesignerView"; break;
			case "preview_html": return "HomePrivateEditPagesPreviewHTML"; break;
			case "preview_js": return "HomePrivateEditPagesPreviewJS"; break;
			case "preview_jsx": return "HomePrivateEditPagesPreviewJSX"; break;
			case "roles": return "HomePrivateEditPagesRolesView"; break;
			case "route": return "HomePrivateEditPagesRouteView"; break;
			case "custom_html": return "HomePrivateEditPagesCustomHTMLView"; break;
			case "custom_js": return "HomePrivateEditPagesCustomJSView"; break;
			case "custom_jsx": return "HomePrivateEditPagesCustomJSXView"; break;
			case "menu_items": return "HomePrivateEditPagesMenuItemsView"; break;
			case "markdown": return "HomePrivateEditPagesMarkdownView"; break;
			case "gasoline": return "HomePrivateEditPagesGasolineView"; break;
			case "data": return "HomePrivateEditPagesDataView"; break;
			case "links": return "HomePrivateEditPagesLinksView"; break;
			case "custom_actions": return "HomePrivateEditPagesCustomActionsView"; break;
			case "fields": return "HomePrivateEditPagesFieldsView"; break;
			case "form_actions": return "HomePrivateEditPagesFormActionsView"; break;
			case "data_view_actions": return "HomePrivateEditPagesDataViewActionsView"; break;
			case "helpers_events": return "HomePrivateEditPagesHelpersEventsView"; break;
		}
		return "";
	}
});


Template.HomePrivateEditPagesMainColumn.events({
	"click #main-view-pages": function(e, t) {
		Session.set("pageEditorMainView", "pages");
		Session.set("pageEditorPreferView", "pages");
	},

	"click #main-view-components": function(e, t) {
		Session.set("pageEditorMainView", "components");
		Session.set("pageEditorPreferView", "components");
	},

	"click #main-view-layout": function(e, t) {
		Session.set("pageEditorMainView", "layout");
		Session.set("pageEditorPreferView", "layout");
	},
	"click #main-view-template": function(e, t) {
		Session.set("pageEditorMainView", "template");
		Session.set("pageEditorPreferView", "template");
	},
	"click #main-view-toggle-designer": function(e, t) {
		Session.set("pageEditorMainView", "toggle_designer");
		Session.set("pageEditorPreferView", "toggle_designer");
	},
	"click #main-view-designer": function(e, t) {
		Session.set("pageEditorMainView", "designer");
		Session.set("pageEditorPreferView", "designer");
	},
	"click #main-view-preview-html": function(e, t) {
		Session.set("pageEditorMainView", "preview_html");
		Session.set("pageEditorPreferView", "preview_html");
	},
	"click #main-view-preview-js": function(e, t) {
		Session.set("pageEditorMainView", "preview_js");
		Session.set("pageEditorPreferView", "preview_js");
	},
	"click #main-view-preview-jsx": function(e, t) {
		Session.set("pageEditorMainView", "preview_jsx");
		Session.set("pageEditorPreferView", "preview_jsx");
	},
	"click #main-view-roles": function(e, t) {
		Session.set("pageEditorMainView", "roles");
		Session.set("pageEditorPreferView", "roles");
	},
	"click #main-view-route": function(e, t) {
		Session.set("pageEditorMainView", "route");
		Session.set("pageEditorPreferView", "route");
	},
	"click #main-view-custom-html": function(e, t) {
		Session.set("pageEditorMainView", "custom_html");
		Session.set("pageEditorPreferView", "custom_html");
	},
	"click #main-view-custom-js": function(e, t) {
		Session.set("pageEditorMainView", "custom_js");
		Session.set("pageEditorPreferView", "custom_js");
	},
	"click #main-view-custom-jsx": function(e, t) {
		Session.set("pageEditorMainView", "custom_jsx");
		Session.set("pageEditorPreferView", "custom_jsx");
	},
	"click #main-view-menu-items": function(e, t) {
		Session.set("pageEditorMainView", "menu_items");
		Session.set("pageEditorPreferView", "menu_items");
	},
	"click #main-view-markdown": function(e, t) {
		Session.set("pageEditorMainView", "markdown");
		Session.set("pageEditorPreferView", "markdown");
	},
	"click #main-view-gasoline": function(e, t) {
		Session.set("pageEditorMainView", "gasoline");
		Session.set("pageEditorPreferView", "gasoline");
	},
	"click #main-view-data": function(e, t) {
		Session.set("pageEditorMainView", "data");
		Session.set("pageEditorPreferView", "data");
	},
	"click #main-view-links": function(e, t) {
		Session.set("pageEditorMainView", "links");
		Session.set("pageEditorPreferView", "links");
	},
	"click #main-view-custom-actions": function(e, t) {
		Session.set("pageEditorMainView", "custom_actions");
		Session.set("pageEditorPreferView", "custom_actions");
	},
	"click #main-view-fields": function(e, t) {
		Session.set("pageEditorMainView", "fields");
		Session.set("pageEditorPreferView", "fields");
	},
	"click #main-view-form-actions": function(e, t) {
		Session.set("pageEditorMainView", "form_actions");
		Session.set("pageEditorPreferView", "form_actions");
	},
	"click #main-view-data-view-actions": function(e, t) {
		Session.set("pageEditorMainView", "data_view_actions");
		Session.set("pageEditorPreferView", "data_view_actions");
	},
	"click #main-view-helpers-events": function(e, t) {
		Session.set("pageEditorMainView", "helpers_events");
		Session.set("pageEditorPreferView", "helpers_events");
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesPropertiesColumn

Template.HomePrivateEditPagesPropertiesColumn.created = function() {
};

Template.HomePrivateEditPagesPropertiesColumn.rendered = function() {
};

Template.HomePrivateEditPagesPropertiesColumn.helpers({
	"propertiesTitle": function() {
		if(!App.project) {
			return "Properties";
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return "Properties";
		}

		var focusedId = Session.get("pageEditorFocusedObject");
		var focusedObject = kitchen.findObjectById(focusedId);
		if(!focusedObject) {
			return "Properties";
		}

		return objectDisplayName2(focusedObject) + " properties";
	},

	"showDesignerUI": function() {
		return showDesignerUI();
	},

	"tableHeightClass": function() {
		return showDesignerUI() ? "height-half" : "height-max";
	},

	"tableScrollHeightClass": function() {
		return showDesignerUI() ? "height-half" : "";
	},

	"eventHandlers": function() {
		var template = getGasTemplate();
		if(!template || !template.handlers) {
			return null;
		}

		return template.handlers;
	},

	"helpers": function() {
		var template = getGasTemplate();
		if(!template || !template.helpers) {
			return null;
		}

		return template.helpers;
	}
});

Template.HomePrivateEditPagesPropertiesColumn.events({
	"click .add-handler": function(e, t) {
		var template = getGasTemplate();
		if(!template || !template.handlers) {
			return;
		}

		var newHandler = ClassKitchen.create(template.handlers._defaultItemType, template.handlers);
		newHandler.name = "newEventHandler";
		newHandler.name = template.handlers.getUniqueItemName(newHandler);
		template.handlers.push(newHandler);

		App.setModified();
		pageSession.set("editingHandler", newHandler._id);
	},

	"click .add-helper": function(e, t) {
		var template = getGasTemplate();
		if(!template || !template.helpers) {
			return;
		}

		var newHelper = ClassKitchen.create(template.helpers._defaultItemType, template.helpers);
		newHelper.name = "newHelper";
		newHelper.name = template.helpers.getUniqueItemName(newHelper);
		template.helpers.push(newHelper);

		App.setModified();
		pageSession.set("editingHelper", newHelper._id);
	}
});

// -----

Template.HomePrivateEditPagesHandlerRow.helpers({
	"editingHandler": function() {
		if(!this.handler) {
			return false;
		}
		var editingHandler = pageSession.get("editingHandler");
		return editingHandler == this.handler._id;
	}
});


Template.HomePrivateEditPagesHandlerRow.events({
	"click .handler-editor-row": function(e, t) {
		if(!this || !this.handler) {
			return;
		}

		var editingHandler = pageSession.get("editingHandler") || "";
		if(editingHandler != this.handler._id) {
			pageSession.set("editingHandler", this.handler._id);
			Meteor.defer(function() {
				t.$("input").first().focus();
			});
		}
	},

	"click .remove-handler": function(e, t) {
		e.stopPropagation();

		var template = getGasTemplate();

		if(!this || !this.handler || !template) {
			return;
		}

		var self = this;
		confirmationBox(
			"Delete event handler",
			"Are you sure you want to delete event handler?",
			function(el) {
				if(template.getRoot().removeObjectById(self.handler._id)) {
					App.setModified();
				}
			}, 
			function(el) {

			}, {
				approveButtonTitle: "Yes",
				denyButtonTitle: "No"
			}
		);
	},

	"keydown input": function(e, t) {
		if(e.keyCode == 13) {
			e.preventDefault();

			e.currentTarget.blur();

			return false;
		}

		if(e.keyCode == 27) {
			e.preventDefault();

			if(!this || !this.handler) {
				return;
			}

			var input = $(e.currentTarget);

			if(input.hasClass("edit-handler-name")) {
				input.val(this.handler.name + "");
			}

			e.currentTarget.blur();

			return false;
		}
	},

	"blur input": function(e, t) {
		var self = this;

		function leaveEditing() {
			Meteor.setTimeout(function() {
				var focusedEl = t.$(":focus");
				var leave = true;
				if(focusedEl.length) {
					if(focusedEl.attr("data-id") == self.handler._id) {
						leave = false;
					}
				}

				if(leave) {
					pageSession.set("editingHandler", "");
				}
			}, 10);
		}

		var template = getGasTemplate();

		if(!this || !this.handler || !template) {
			leaveEditing();
			return;
		}

		var input = $(e.currentTarget);

		var value = input.val() + "";
		value = value.trim();

		if(input.hasClass("edit-handler-name")) {
			if(this.handler.name == value) {
				leaveEditing();
				return;
			}
			this.handler.name = value;
		}

		App.setModified();
		leaveEditing();
	},

	"click .edit-handler-code": function(e, t) {
		e.stopPropagation();

		var self = this;

		if(!this || !this.handler) {
			return;
		}

		codeEditBox("Event handler", this.handler.code, function(el, code) {
			self.handler.code = code;
			App.setModified();
		}, null, { 
			language: "js" 
		});
	}
});

// ---






// -----

Template.HomePrivateEditPagesHelperRow.helpers({
	"editingHelper": function() {
		if(!this.helper) {
			return false;
		}
		var editingHelper = pageSession.get("editingHelper");
		return editingHelper == this.helper._id;
	}
});


Template.HomePrivateEditPagesHelperRow.events({
	"click .helper-editor-row": function(e, t) {
		if(!this || !this.helper) {
			return;
		}

		var editingHelper = pageSession.get("editingHelper") || "";
		if(editingHelper != this.helper._id) {
			pageSession.set("editingHelper", this.helper._id);
			Meteor.defer(function() {
				t.$("input").first().focus();
			});
		}
	},

	"click .remove-helper": function(e, t) {
		e.stopPropagation();

		var template = getGasTemplate();

		if(!this || !this.helper || !template) {
			return;
		}

		var self = this;
		confirmationBox(
			"Delete helper",
			"Are you sure you want to delete helper?",
			function(el) {
				if(template.getRoot().removeObjectById(self.helper._id)) {
					App.setModified();
				}
			}, 
			function(el) {

			}, {
				approveButtonTitle: "Yes",
				denyButtonTitle: "No"
			}
		);
	},

	"keydown input": function(e, t) {
		if(e.keyCode == 13) {
			e.preventDefault();

			e.currentTarget.blur();

			return false;
		}

		if(e.keyCode == 27) {
			e.preventDefault();

			if(!this || !this.helper) {
				return;
			}

			var input = $(e.currentTarget);

			if(input.hasClass("edit-helper-name")) {
				input.val(this.helper.name + "");
			}

			e.currentTarget.blur();

			return false;
		}
	},

	"blur input": function(e, t) {
		var self = this;

		function leaveEditing() {
			Meteor.setTimeout(function() {
				var focusedEl = t.$(":focus");
				var leave = true;
				if(focusedEl.length) {
					if(focusedEl.attr("data-id") == self.helper._id) {
						leave = false;
					}
				}

				if(leave) {
					pageSession.set("editingHelper", "");
				}
			}, 10);
		}

		var template = getGasTemplate();

		if(!this || !this.helper || !template) {
			leaveEditing();
			return;
		}

		var input = $(e.currentTarget);

		var value = input.val() + "";
		value = value.trim();

		if(input.hasClass("edit-helper-name")) {
			if(this.helper.name == value) {
				leaveEditing();
				return;
			}
			this.helper.name = value;
		}

		App.setModified();
		leaveEditing();
	},

	"click .edit-helper-code": function(e, t) {
		e.stopPropagation();

		var self = this;

		if(!this || !this.helper) {
			return;
		}

		codeEditBox("Helper", this.helper.code, function(el, code) {
			self.helper.code = code;
			App.setModified();
		}, null, { 
			language: "js" 
		});
	}
});

// ---






// ----------------------------------------------------------------------------
// HomePrivateEditDatabasePropertiesColumn

Template.HomePrivateEditPagesProperties.created = function() {
};

Template.HomePrivateEditPagesProperties.rendered = function() {
};

Template.HomePrivateEditPagesProperties.helpers({
	"focusedObject": function() {
		if(!App.project) {
			return null;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return null;
		}

		var focusedId = Session.get("pageEditorFocusedObject");
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

Template.HomePrivateEditPagesProperties.events({
});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesRolesView

Template.HomePrivateEditPagesRolesView.created = function() {

};

Template.HomePrivateEditPagesRolesView.rendered = function() {

};

Template.HomePrivateEditPagesRolesView.helpers({
	"pageRoles": function() {
		if(!App.project) {
			return [];
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return [];
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || !selectedObject.roles) {
			return [];
		}

		var pageRoles = [];
		var appRoles = ["admin", "blocked"];
		kitchen.application.roles.map(roleName => {
			if(appRoles.indexOf(roleName) < 0 && roleName != "owner" && roleName != "nobody") {
				appRoles.push(roleName);
			}
		});


		var reservedNames = ["admin", "blocked", "owner", "nobody"];

		appRoles.map(roleName => {
			var canDelete = reservedNames.indexOf(roleName) < 0;
			var allowed = selectedObject.roles.length == 0 || selectedObject.roles.indexOf(roleName) >= 0;
			var roleTitle = roleName;
			var access = allowed ? "Allowed" : "Denied";
			var iconClass = allowed ? "green fa fa-unlock" : "red fa fa-lock";

			pageRoles.push({
				roleTitle: roleTitle,
				roleName: roleName,
				canDelete: canDelete,
				access: access,
				iconClass: iconClass
			});
		});
		return pageRoles;
	}
});

Template.HomePrivateEditPagesRolesView.events({
	"click .add-role": function(e, t) {
		e.preventDefault();

		addRoleForm(function(el, result) {
		});

		return false;
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesRolesViewRow

Template.HomePrivateEditPagesRolesViewRow.created = function() {

};

Template.HomePrivateEditPagesRolesViewRow.rendered = function() {

};

Template.HomePrivateEditPagesRolesViewRow.helpers({

});

Template.HomePrivateEditPagesRolesViewRow.events({
	"click .lock-item": function(e, t) {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || !selectedObject.roles) {
			return;
		}

		var roleName = this.roleName;

		var appRoles = ["admin", "blocked"];
		kitchen.application.roles.map(roleName => {
			if(appRoles.indexOf(roleName) < 0 && roleName != "owner" && roleName != "nobody") {
				appRoles.push(roleName);
			}
		});

		if(!selectedObject.roles.length) {
			appRoles.map(r => {
				if(selectedObject.roles.indexOf(r) < 0 && r != "owner" && r != "nobody" && r != roleName) {
					selectedObject.roles.push(r);
				}
			});

			App.setModified();
			return;
		}

		var roleIndex = selectedObject.roles.indexOf(roleName);
		var allow = roleIndex < 0;

		if(allow) {
			selectedObject.roles.push(roleName);
		} else {
			selectedObject.roles.splice(roleIndex, 1);
		}

		if(selectedObject.roles.length) {
			var gotAllRoles = true;
			appRoles.map(r => {
				if(selectedObject.roles.indexOf(r) < 0) {
					gotAllRoles = false;
				}
			});

			if(gotAllRoles) {
				selectedObject.roles.splice(0, selectedObject.roles.length);
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
// HomePrivateEditPagesLayoutView

Template.HomePrivateEditPagesLayoutView.rendered = function() {
};

Template.HomePrivateEditPagesLayoutView.helpers({

	"userDefinedTemplate": function() {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		return selectedObject.user_defined_template;
	},

	useGasoline: function() {
		if(!App.project) {
			return "";
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return "";
		}

		return selectedObject.use_gasoline;
	}
});


Template.HomePrivateEditPagesLayoutView.events({
	"click .toggle-editing-button": function(e, t) {
		e.preventDefault();

		var selectedId = Session.get("pageEditorSelectedObject");
		toggleUserDefinedTemplate(selectedId);
	},

	"click .toggle-designer-button": function(e, t) {
		e.preventDefault();

		var selectedId = Session.get("pageEditorSelectedObject");
		toggleDesigner(selectedId);
	},

	"click .goto-designer-button": function(e, t) {
		e.preventDefault();

		var selectedId = Session.get("pageEditorSelectedObject");
		gotoDesigner(selectedId);
	}

});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesLayoutViewSelector


Template.HomePrivateEditPagesLayoutViewSelector.rendered = function() {
	$('.ui.dropdown').dropdown();

	this.autorun(function() {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		var val = selectedObject.layout;
		if(!val) val = " ";
		$("select[name='layout']").dropdown("set selected", val);
	});

	$("select[name='layout']").on("change", function(e) {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var val = $(this).val();
		if(!val || val == " ") val = "";

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		if(selectedObject.layout != val) {
			selectedObject.layout = val;
			App.setModified();
		}
	});
};


Template.HomePrivateEditPagesLayoutViewSelector.helpers({
	"layoutList": function() {
		if(!App.project) {
			return [];
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return [];
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return [];
		}

		var layoutProperty = selectedObject.getProperty("layout");
		if(!layoutProperty) {
			return [];
		}

		var layoutList = [
			{ name: " ", title: "Default (navbar)" }
		];
		layoutProperty.choiceItems.map(function(item) {
			if(item) {
				layoutList.push({ name: item, title: item });
			}
		});

		return layoutList;
	},

	"layoutSelected": function(layoutName) {
		if(!App.project) {
			return "";
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return "";
		}

		var val = layoutName;
		if(!val || val == " ") val = "";
		return selectedObject.layout == val ? "selected" : "";
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesTemplateView

Template.HomePrivateEditPagesTemplateView.rendered = function() {
};

Template.HomePrivateEditPagesTemplateView.helpers({
	"userDefinedTemplate": function() {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		return selectedObject.user_defined_template;
	},

	useGasoline: function() {
		if(!App.project) {
			return "";
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return "";
		}

		return selectedObject.use_gasoline;
	}
});


Template.HomePrivateEditPagesTemplateView.events({
	"click .toggle-editing-button": function(e, t) {
		e.preventDefault();

		var selectedId = Session.get("pageEditorSelectedObject");
		toggleUserDefinedTemplate(selectedId);
	},

	"click .toggle-designer-button": function(e, t) {
		e.preventDefault();

		var selectedId = Session.get("pageEditorSelectedObject");
		toggleDesigner(selectedId);
	},

	"click .goto-designer-button": function(e, t) {
		e.preventDefault();

		var selectedId = Session.get("pageEditorSelectedObject");
		gotoDesigner(selectedId);
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesTemplateViewSelector

Template.HomePrivateEditPagesTemplateViewSelector.rendered = function() {
	$('.ui.dropdown').dropdown();

	this.autorun(function() {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		var val = selectedObject.template;
		if(!val) val = " ";
		$("select[name='template']").dropdown("set selected", val);
	});

	$("select[name='template']").on("change", function(e) {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var val = $(this).val();
		if(!val || val == " ") val = "";

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		if(selectedObject.template != val) {
			selectedObject.template = val;
			App.setModified();
		}
	});
};

Template.HomePrivateEditPagesTemplateViewSelector.helpers({
	"templateList": function() {
		if(!App.project) {
			return [];
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return [];
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return [];
		}

		var templateProperty = selectedObject.getProperty("template");
		if(!templateProperty) {
			return [];
		}

		var templateList = [
			{ name: " ", title: "Default (auto)" }
		];
		templateProperty.choiceItems.map(function(item) {
			if(item) {
				templateList.push({ name: item, title: item });
			}
		});

		return templateList;
	},

	"templateSelected": function(templateName) {
		if(!App.project) {
			return "";
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return "";
		}

		var val = templateName;
		if(!val || val == " ") val = "";
		return selectedObject.template == val ? "selected" : "";
	}
});


// ----------------------------------------------------------------------------

var indexOfParamSpec = function(paramList, param) {
	var index = -1;
	paramList.map((paramName, ndx) => {
		if(paramName && paramName.charAt(paramName.length - 1) == "?") {
			paramName = paramName.slice(0, -1);
		}

		if(paramName == param) {
			index = ndx;
		}
	});
	return index;
};



// ----------------------------------------------------------------------------
// HomePrivateEditPagesPageListView

Template.HomePrivateEditPagesPageListView.helpers({
});

Template.HomePrivateEditPagesPageListView.events({
	"click .add-page": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || !selectedObject.getProperty("pages")) {
			return;
		}

		pageEditorAddObject(selectedObject, "page", newObjectPostProcessing, true);

		return false;
	}
});

// ----------------------------------------------------------------------------
// HomePrivateEditPagesPageList

Template.HomePrivateEditPagesPageList.helpers({
	"pageList": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || !selectedObject.getProperty("pages")) {
			return;
		}

		return selectedObject.pages || [];
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesPageListItem

Template.HomePrivateEditPagesPageListItem.helpers({
	"rowClass": function() {
		if(!this) {
			return "";
		}

		var rowClass = "";

		if(this._id == Session.get("pageEditorSelectedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "selected";
		}
		if(this._id == Session.get("pageEditorFocusedObject")) {
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


Template.HomePrivateEditPagesPageListItem.events({
	"click .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		Session.set("pageEditorFocusedObject", this._id);

		return false;
	},


	"dblclick .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}


		var expandedNodes = Session.get("pageEditorExpandedNodes") || [];
		var index = expandedNodes.indexOf(this._parent._id);
		if(index < 0) {
			expandedNodes.push(this._parent._id);
			Session.set("pageEditorExpandedNodes", expandedNodes);
		}

		Session.set("pageEditorSelectedObject", this._id);
		Session.set("pageEditorFocusedObject", this._id);

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
// HomePrivateEditPagesComponentListView

Template.HomePrivateEditPagesComponentListView.helpers({
});

Template.HomePrivateEditPagesComponentListView.events({
	"click .add-component": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || !selectedObject.getProperty("components")) {
			return;
		}

		pageTreeAddObject(selectedObject, true, true);

		return false;
	}
});

// ----------------------------------------------------------------------------
// HomePrivateEditPagesComponentList

Template.HomePrivateEditPagesComponentList.helpers({
	"componentList": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || !selectedObject.getProperty("components")) {
			return;
		}

		return selectedObject.components || [];
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesComponentListItem

Template.HomePrivateEditPagesComponentListItem.helpers({
	"rowClass": function() {
		if(!this) {
			return "";
		}

		var rowClass = "";

		if(this._id == Session.get("pageEditorSelectedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "selected";
		}
		if(this._id == Session.get("pageEditorFocusedObject")) {
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


Template.HomePrivateEditPagesComponentListItem.events({
	"click .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		Session.set("pageEditorFocusedObject", this._id);

		return false;
	},


	"dblclick .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}


		var expandedNodes = Session.get("pageEditorExpandedNodes") || [];
		var index = expandedNodes.indexOf(this._parent._id);
		if(index < 0) {
			expandedNodes.push(this._parent._id);
			Session.set("pageEditorExpandedNodes", expandedNodes);
		}

		Session.set("pageEditorSelectedObject", this._id);
		Session.set("pageEditorFocusedObject", this._id);

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
// HomePrivateEditPagesGasolineView

Template.HomePrivateEditPagesGasolineView.helpers({
});

Template.HomePrivateEditPagesGasolineView.events({
	"click .add-template": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "gasoline") {
			return;
		}

		pageEditorAddObject(selectedObject, "gas_template", newObjectPostProcessing, true);

		return false;
	}
});

// ----------------------------------------------------------------------------
// HomePrivateEditPagesGasolineTemplateList

Template.HomePrivateEditPagesGasolineTemplateList.helpers({
	"templateList": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "gasoline") {
			return;
		}

		return selectedObject.templates || [];
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesGasolineTemplateListItem

Template.HomePrivateEditPagesGasolineTemplateListItem.helpers({
	"rowClass": function() {
		if(!this) {
			return "";
		}

		var rowClass = "";

		if(this._id == Session.get("pageEditorSelectedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "selected";
		}
		if(this._id == Session.get("pageEditorFocusedObject")) {
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


Template.HomePrivateEditPagesGasolineTemplateListItem.events({
	"click .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		Session.set("pageEditorFocusedObject", this._id);

		return false;
	},


	"dblclick .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}


		var expandedNodes = Session.get("pageEditorExpandedNodes") || [];
		var index = expandedNodes.indexOf(this._parent._id);
		if(index < 0) {
			expandedNodes.push(this._parent._id);
			Session.set("pageEditorExpandedNodes", expandedNodes);
		}

		Session.set("pageEditorSelectedObject", this._id);
		Session.set("pageEditorFocusedObject", this._id);

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
// HomePrivateEditPagesToggleDesigner

Template.HomePrivateEditPagesToggleDesigner.events({
	"click .toggle-designer-button": function(e, t) {
		e.preventDefault();

		var selectedId = Session.get("pageEditorSelectedObject");
		toggleDesigner(selectedId);
	},

	"click .goto-designer-button": function(e, t) {
		e.preventDefault();

		var selectedId = Session.get("pageEditorSelectedObject");
		gotoDesigner(selectedId);
	}

});

Template.HomePrivateEditPagesToggleDesigner.helpers({
	useGasoline: function() {
		if(!App.project) {
			return "";
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return "";
		}

		return selectedObject.use_gasoline;
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesDesigner

Template.HomePrivateEditPagesDesigner.events({

});

Template.HomePrivateEditPagesDesigner.helpers({

});


// ----------------------------------------------------------------------------
// HomePrivateEditPageseventPreviewHTML

Template.HomePrivateEditPagesPreviewHTML.rendered = function() {
	var resizeCodemirror = function() {
		var mc = $(".main-column");
		var cm = this.$(".CodeMirror");

		cm.css({ width: (mc.width() - 28) + "px", height: ((mc.height() - cm.position().top) - 14) + "px" });
		this.$(".CodeMirror-scroll").css({ width: (mc.width() - 28) + "px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});

	var setup = false;
	App.addRefreshingSessionVar("customObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("customObjectChanged", true);
	});


	this.autorun(function() {
		var input = Session.get("gasolineObject") || null;
		if(!input) {
			return;
		}

		gasoline.getBlaze(input, function(err, html, js) {
			if(err) {
				pageSession.set("previewHTML", "");
				return;
			}
			Session.set("previewHTML" + input._id, html);
		});
	});
}

Template.HomePrivateEditPagesPreviewHTML.events({
});

Template.HomePrivateEditPagesPreviewHTML.helpers({
	"previewHTMLkey": function() {
		var input = Session.get("gasolineObject") || null;
		if(!input) {
			return;
		}
		return "previewHTML" + input._id;
	},

	"previewHTMLInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: true,
			mode: "htmlembedded",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	}
});


// ----------------------------------------------------------------------------
// HomePrivateEditPageseventPreviewJS

Template.HomePrivateEditPagesPreviewJS.rendered = function() {
	var resizeCodemirror = function() {
		var mc = $(".main-column");
		var cm = this.$(".CodeMirror");

		cm.css({ width: (mc.width() - 28) + "px", height: ((mc.height() - cm.position().top) - 14) + "px" });
		this.$(".CodeMirror-scroll").css({ width: (mc.width() - 28) + "px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});

	var setup = false;
	App.addRefreshingSessionVar("customObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("customObjectChanged", true);
	});


	this.autorun(function() {
		var input = Session.get("gasolineObject") || null;
		if(!input) {
			return;
		}

		gasoline.getBlaze(input, function(err, html, js) {
			if(err) {
				pageSession.set("previewJS", "");
				return;
			}
			Session.set("previewJS" + input._id, js);
		});
	});
}

Template.HomePrivateEditPagesPreviewJS.events({
});

Template.HomePrivateEditPagesPreviewJS.helpers({
	"previewJSkey": function() {
		var input = Session.get("gasolineObject") || null;
		if(!input) {
			return;
		}
		return "previewJS" + input._id;
	},

	"previewJSInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: true,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	}
});

// ----------------------------------------------------------------------------
// HomePrivateEditPageseventPreviewJSX

Template.HomePrivateEditPagesPreviewJSX.rendered = function() {
	var resizeCodemirror = function() {
		var mc = $(".main-column");
		var cm = this.$(".CodeMirror");

		cm.css({ width: (mc.width() - 28) + "px", height: ((mc.height() - cm.position().top) - 14) + "px" });
		this.$(".CodeMirror-scroll").css({ width: (mc.width() - 28) + "px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});

	var setup = false;
	App.addRefreshingSessionVar("customObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("customObjectChanged", true);
	});


	this.autorun(function() {
		var input = Session.get("gasolineObject") || null;
		if(!input) {
			return;
		}

		var gasolineObject = getGasolineObject();
		var component = gasolineObject.getParentWithProperty("use_gasoline");

		gasoline.getReact(input, function(err, jsx) {
			if(err) {
				pageSession.set("previewJSX", "");
				return;
			}
			Session.set("previewJSX" + input._id, jsx);
		}, {
			meteorKitchen: true,
			createContainer: (component._className == "zone" || component._className == "page")
		});
	});
}

Template.HomePrivateEditPagesPreviewJSX.events({
});

Template.HomePrivateEditPagesPreviewJSX.helpers({
	"previewJSXkey": function() {
		var input = Session.get("gasolineObject") || null;
		if(!input) {
			return;
		}
		return "previewJSX" + input._id;
	},

	"previewJSXInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: true,
			mode: "javascript",
//			lint: false,
			gutters: ["CodeMirror-lint-markers"]
		}
	}
});

// ----------------------------------------------------------------------------
// HomePrivateEditPagesDataView

Template.HomePrivateEditPagesDataView.rendered = function() {
	$('.ui.dropdown').dropdown();

	this.autorun(function() {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		var val = selectedObject.query_name;
		if(!val) val = " ";
		$("select[name='query_name']").dropdown("set selected", val);

		// merge params
		var query = kitchen.application.queries.findObjectByName(selectedObject.query_name, false);
		if(query) {
			var routeParamNames = selectedObject.routeParamNames ? selectedObject.routeParamNames() : [];
			var queryParamNames = query.extractParams();
			var objectParams = selectedObject.query_params;

			routeParamNames.map((routeParamName, ndx) => {
				if(routeParamName.charAt(routeParamName.length - 1) == "?") {
					routeParamName = routeParamName.slice(0, -1);
					routeParamNames[ndx] = routeParamName;
				}
			});

			// remove old params not used by query (only if param doesn't have a value)
			var removendx = [];
			objectParams.map((objectParam, paramIndex) => {
				if((queryParamNames.indexOf(objectParam.name) < 0 && !objectParam.value) || routeParamNames.indexOf(objectParam.name) >= 0) {
					removendx.push(paramIndex);
					App.setModified();
				}
			});
			for(var i = removendx.length - 1; i >= 0; i--) {
				objectParams.splice(i, 1);
			}

			// add params used by query that doesn't exists
			queryParamNames.map(paramName => {
				var objectParam = objectParams.findObjectByName(paramName, false);
				if(!objectParam && routeParamNames.indexOf(paramName) < 0) {
					objectParam = ClassKitchen.create(objectParams._defaultItemType, objectParams);
					objectParam.name = paramName;
					objectParams.push(objectParam);
					App.setModified();
				}
			});
		}

	});

	$("select[name='query_name']").on("change", function(e) {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var val = $(this).val();
		if(val == " ") val = "";

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		if(selectedObject.query_name != val) {
			selectedObject.query_name = val;
			App.setModified();
		}
	});
};

Template.HomePrivateEditPagesDataView.helpers({
	"queryList": function() {
		if(!App.project) {
			return [""];
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return [""];
		}

		var queryList = [" "];
		kitchen.application.queries.map(query => {
			queryList.push(query.name);
		});

		return queryList;
	},
	"querySelected": function(queryName) {
		if(!App.project) {
			return "";
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return "";
		}

		var val = queryName;
		if(val == " ") val = "";
		return selectedObject.query_name == val ? "selected" : "";
	},

	"queryParams": function() {
		if(!App.project) {
			return [];
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return [];
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return [];
		}

		var query = kitchen.application.queries.findObjectByName(selectedObject.query_name, false);
		if(!query) {
			return [];
		}

		var queryParamNames = query.extractParams();
		var thisParams = selectedObject.query_params;

		var params = [];
		var routeParamNames = selectedObject.routeParamNames ? selectedObject.routeParamNames() : [];
		routeParamNames.map((routeParamName, ndx) => {
			if(routeParamName.charAt(routeParamName.length - 1) == "?") {
				routeParamName = routeParamName.slice(0, -1);
				routeParamNames[ndx] = routeParamName;
			}
		});

		queryParamNames.map(queryParamName => {
			var thisParam = thisParams.findObjectByName(queryParamName, false);
			if(!thisParam && routeParamNames.indexOf(queryParamName) >= 0) {
				params.push({
					name: queryParamName,
					value: "",
					unknown: false,
					fromRoute: true,
					warning: false,
					status: "OK"
				});
			}
		});

		thisParams.map(param => {
			var unknown = queryParamNames.indexOf(param.name) < 0;
			var status = "";
			var warning = false;

			if(unknown) {
				status = "Unused";
				warning = true;
			} else {
				if(param.value) {
					status = "OK";
					warning = false;
				} else {
					status = "No value";
					warning = true;
				}
			}
			params.push({
				name: param.name,
				value: param.value,
				unknown: unknown,
				fromRoute: false,
				warning: warning,
				status: status
			});
		});

		return params;
	}
});



// ----------------------------------------------------------------------------
// HomePrivateEditPagesDataViewParam

Template.HomePrivateEditPagesDataViewParam.helpers({
	"isUnknown": function() {
		return this.unknown;
	},
	"isFromRoute": function() {
		return this.fromRoute;
	},
	"warning": function() {
		return this.warning;
	}
});

Template.HomePrivateEditPagesDataViewParam.events({
	"input .param-value": function(e, t) {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		var editingParam = selectedObject.query_params.findObjectByName(this.name, false);
		if(!editingParam) {
			return;
		}

		var val = e.currentTarget.value || "";

		if(editingParam.value != val) {
			editingParam.value = val;
			App.setModified();
		}
	},

	"click .remove-param": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		var removeParam = selectedObject.query_params.findObjectByName(this.name, false);
		if(!removeParam) {
			return;
		}

		var self = this;
		confirmationBox(
			"Delete Param",
			"Are you sure you want to delete param \"" + removeParam.name + "\"?",
			function(el) {
				if(selectedObject.query_params.removeObjectById(removeParam._id, true)) {
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


// ----------------------------------------------------------------------------
// HomePrivateEditPagesRouteView

Template.HomePrivateEditPagesRouteView.rendered = function() {
	var setup = false;
	App.addRefreshingSessionVar("routeObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("routeObjectChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		if(Session.get("routeObjectChanged")) {
			setup = false;
			Session.set("routeObjectChanged", false);
		}

		var controllerBeforeText = Session.get("controllerBeforeInputText");
		var controllerAfterText = Session.get("controllerAfterInputText");

		if(setup) {
			if(
				controllerBeforeText != selectedObject.controller_before_action ||
				controllerAfterText != selectedObject.controller_after_action
			) {
				selectedObject.controller_before_action = controllerBeforeText;
				selectedObject.controller_after_action = controllerAfterText;

				App.setModified();
			}
		} else {
			Session.set("controllerBeforeInputText", selectedObject.controller_before_action);
			Session.set("controllerAfterInputText", selectedObject.controller_after_action);
			setup = true;
		}

	});

};

Template.HomePrivateEditPagesRouteView.helpers({
	"routeName": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "page") {
			return;
		}

		return selectedObject.getRoute();
	},
	"routeURL": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "page") {
			return;
		}

		return selectedObject.getURL();
	},
	"routeParams": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "page") {
			return;
		}

		var params = [];
		selectedObject.route_params.map(param => {
			params.push({
				name: param
			});
		});

		return params;
	},

	"controllerBeforeInputOptions": function() {
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
	"controllerAfterInputOptions": function() {
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
	"controllerBeforeClass": function() {
		return Session.get("routeHideControllerBefore") ? "off" : "";
	},
	"controllerAfterClass": function() {
		return Session.get("routeHideControllerAfter") ? "off" : "";
	},
	"controllerBeforeIconClass": function() {
		return Session.get("routeHideControllerBefore") ? "fa-caret-right" : "fa-caret-down";
	},
	"controllerAfterIconClass": function() {
		return Session.get("routeHideControllerAfter") ? "fa-caret-right" : "fa-caret-down";
	}
});

Template.HomePrivateEditPagesRouteView.events({
	"click .add-param": function(e, t) {
		e.preventDefault();
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "page") {
			return;
		}

		var paramName = "newParam";
		var count = 0;
		while(selectedObject.route_params.indexOf(paramName + (count ? count : "")) >= 0) {
			count++;
		}

		paramName += (count ? count : "");
		selectedObject.route_params.push(paramName);
		App.setModified();

		Meteor.setTimeout(function() {
			$(t.find("input[data-value='" + paramName + "']")).focus().select();
		}, 50);

		return false;
	},

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


// ----
Template.HomePrivateEditPagesRouteViewParam.rendered = function() {
};

Template.HomePrivateEditPagesRouteViewParam.events({
	"click .remove-param": function(e, t) {
		e.preventDefault();
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "page") {
			return;
		}

		var paramIndex = selectedObject.route_params.indexOf(this.name);
		if(paramIndex < 0) {
			return;
		}

		var self = this;
		confirmationBox(
			"Delete Param",
			"Are you sure you want to delete param \"" + self.name + "\"?",
			function(el) {
				selectedObject.route_params.splice(paramIndex, 1);
				App.setModified();
			},
			function(el) {

			}, {
				approveButtonTitle: "Yes",
				denyButtonTitle: "No"
			}
		);
	},

	"input input[name='param-name']": function(e, t) {
		e.preventDefault();
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "page") {
			return;
		}

		var paramIndex = selectedObject.route_params.indexOf(this.name);
		if(paramIndex < 0) {
			return;
		}

		selectedObject.route_params.splice(paramIndex, 1, e.currentTarget.value);
		App.setModified();

	}
});


// ---

Template.HomePrivateEditPagesCustomHTMLView.rendered = function() {
	var resizeCodemirror = function() {
		var mc = $(".main-column");
		var cm = this.$(".CodeMirror");

		cm.css({ width: (mc.width() - 28) + "px", height: ((mc.height() - cm.position().top) - 14) + "px" });
		this.$(".CodeMirror-scroll").css({ width: (mc.width() - 28) + "px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});

	var setup = false;
	App.addRefreshingSessionVar("customObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("customObjectChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		if(Session.get("customObjectChanged")) {
			setup = false;
			Session.set("customObjectChanged", false);
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || !selectedObject.getProperty("html")) {
			return;
		}

		var code = Session.get("customHTMLInputText");

		if(setup) {
			if(selectedObject.html != code) {
				selectedObject.html = code;
				App.setModified();
			}
		} else {
			Session.set("customHTMLInputText", selectedObject.html);
			setup = true;
		}
	});
};


Template.HomePrivateEditPagesCustomHTMLView.helpers({
	"customHTMLInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "htmlembedded",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		};
	}
});


Template.HomePrivateEditPagesCustomHTMLView.events({
});

// ---

Template.HomePrivateEditPagesCustomJSView.rendered = function() {
	var resizeCodemirror = function() {
		var mc = $(".main-column");
		var cm = this.$(".CodeMirror");

		cm.css({ width: (mc.width() - 28) + "px", height: ((mc.height() - cm.position().top) - 14) + "px" });
		this.$(".CodeMirror-scroll").css({ width: (mc.width() - 28) + "px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});

	var setup = false;
	App.addRefreshingSessionVar("customObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("customObjectChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		if(Session.get("customObjectChanged")) {
			setup = false;
			Session.set("customObjectChanged", false);
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || !selectedObject.getProperty("js")) {
			return;
		}

		var code = Session.get("customJSInputText");

		if(setup) {
			if(selectedObject.js != code) {
				selectedObject.js = code;
				App.setModified();
			}
		} else {
			Session.set("customJSInputText", selectedObject.js);
			setup = true;
		}
	});
};


Template.HomePrivateEditPagesCustomJSView.helpers({
	"customJSInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		};
	}
});


Template.HomePrivateEditPagesCustomJSView.events({
});


// ---

Template.HomePrivateEditPagesCustomJSXView.rendered = function() {
	var resizeCodemirror = function() {
		var mc = $(".main-column");
		var cm = this.$(".CodeMirror");

		cm.css({ width: (mc.width() - 28) + "px", height: ((mc.height() - cm.position().top) - 14) + "px" });
		this.$(".CodeMirror-scroll").css({ width: (mc.width() - 28) + "px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});

	var setup = false;
	App.addRefreshingSessionVar("customObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("customObjectChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		if(Session.get("customObjectChanged")) {
			setup = false;
			Session.set("customObjectChanged", false);
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || !selectedObject.getProperty("jsx")) {
			return;
		}

		var code = Session.get("customJSXInputText");

		if(setup) {
			if(selectedObject.jsx != code) {
				selectedObject.jsx = code;
				App.setModified();
			}
		} else {
			Session.set("customJSXInputText", selectedObject.jsx);
			setup = true;
		}
	});
};


Template.HomePrivateEditPagesCustomJSXView.helpers({
	"customJSXInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
//			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		};
	}
});


Template.HomePrivateEditPagesCustomJSXView.events({
});


// ----

Template.HomePrivateEditPagesMenuItemsView.helpers({
	"object": function() {
		if(!App.project) {
			return null;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return null;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return null;
		}

		return selectedObject;
	}
});

Template.HomePrivateEditPagesMenuItemsView.events({
	"click .add-item": function(e, t) {
		e.preventDefault();

		menuEditorAddItem(null);

		return false;
	}
});


// ----


Template.HomePrivateEditPagesMenuItemsViewList.helpers({
	"itemIsExpanded": function() {
		if(!this) {
			return false;
		}
		var expandedNodes = Session.get("menuEditorExpandedNodes") || [];
		return expandedNodes.indexOf(this._id) >= 0;
	}
});


// ----


Template.HomePrivateEditPagesMenuItemsViewListItem.helpers({
	"displayName": function() {
		if(!this) {
			return "";
		}
		return this.title || "(untitled)";
	},

	"routeOrURL": function() {
		if(!this) {
			return "";
		}
		return this.route || this.url || "-";
	},

	"rowClass": function() {
		if(!this) {
			return "";
		}

		var rowClass = "";

		if(this._id == Session.get("pageEditorSelectedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "selected";
		}
		if(this._id == Session.get("pageEditorFocusedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "focused";
		}

		return rowClass;
	},

	"caretClass": function() {
		if(!this) {
			return "";
		}

		var caretClass = "";
		if(!this.items || !this.items.length) {
			caretClass += caretClass ? " " : "";
			caretClass += "fa-caret-right transparent";

			return caretClass;
		}

		var expandedNodes = Session.get("menuEditorExpandedNodes") || [];
		if(expandedNodes.indexOf(this._id) >= 0) {
			caretClass += caretClass ? " " : "";
			caretClass += "fa-caret-down";			
		} else {
			caretClass += caretClass ? " " : "";
			caretClass += "fa-caret-right";
		}
		
		return caretClass;
	},
	"parentItems": function() {
		if(!this) {
			return [];
		}

		var parentItems = [];
		var parents = this.getParents();
		parents.map(parent => {
			if(parent._className == "menu_item") {
				parentItems.push(parent._id);
			}
		});
		return parentItems;
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


Template.HomePrivateEditPagesMenuItemsViewListItem.events({
	"click .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		var focusedId = Session.get("pageEditorFocusedObject");
		if(focusedId == this._id) {
			var expandedNodes = Session.get("menuEditorExpandedNodes") || [];
			var index = expandedNodes.indexOf(this._id);
			if(index >= 0) {
				expandedNodes.splice(index, 1);
			} else {
				expandedNodes.push(this._id);
			}
			Session.set("menuEditorExpandedNodes", expandedNodes);
		} else {
			Session.set("pageEditorFocusedObject", this._id);
		}

		return false;
	},
	"click .add-item": function(e, t) {
		e.preventDefault();

		if(!this) {
			return false;
		}

		menuEditorAddItem(this.items);

		return false;
	},

	"click .remove-item": function(e, t) {
		e.preventDefault();

		if(!this) {
			return false;
		}

		var self = this;
		confirmationBox(
			"Delete " + self._className,
			"Are you sure you want to delete " + self._className + "?",
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


Template.HomePrivateEditPagesMarkdownView.rendered = function() {
	var resizeCodemirror = function() {
		var mc = $(".main-column");
		var cm = this.$(".CodeMirror");

		cm.css({ width: (mc.width() - 28) + "px", height: ((mc.height() - cm.position().top) - 14) + "px" });
		this.$(".CodeMirror-scroll").css({ width: (mc.width() - 28) + "px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});

	var setup = false;
	App.addRefreshingSessionVar("markdownObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("markdownObjectChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "markdown") {
			return;
		}

		if(Session.get("markdownObjectChanged")) {
			setup = false;
			Session.set("markdownObjectChanged", false);
		}

		var markdownCode = Session.get("markdownInputText");

		if(setup) {
			if(selectedObject.source != markdownCode) {
				selectedObject.source = markdownCode;
				App.setModified();
			}
		} else {
			Session.set("markdownInputText", selectedObject.source);
			setup = true;
		}

	});
};


Template.HomePrivateEditPagesMarkdownView.helpers({
	"markdownInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "gfm",
//			lint: false,
			gutters: ["CodeMirror-lint-markers"]
		}
	}
});

Template.HomePrivateEditPagesMarkdownView.events({
});



// ----------------------------------------------------------------------------
// HomePrivateEditPagesLinksView

Template.HomePrivateEditPagesLinksView.created = function() {

};

Template.HomePrivateEditPagesLinksView.rendered = function() {

};

Template.HomePrivateEditPagesLinksView.helpers({
	"selectedObject": function() {
		if(!App.project) {
			return null;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return null;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return null;
		}

		return selectedObject;
	}
});

Template.HomePrivateEditPagesLinksView.events({

});

var getFieldEditorQuery = function() {
	if(!App.project) {
		return null;
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return null;
	}
	var selectedId = Session.get("pageEditorSelectedObject");
	var selectedObject = kitchen.findObjectById(selectedId);
	if(!selectedObject) {
		return null;
	}

	let fieldsProperty = selectedObject._properties.find(property => {
		return property.type == "base_array" && property.subType == "field";
	});

	if(!fieldsProperty) {
		return null;
	}

	let queryProperty = selectedObject._properties.find(property => {
		return property.name == "query_name";
	});

	if(!queryProperty) {
		return null;
	}
	let queryObject = kitchen.findObjectByNameAndType(selectedObject[queryProperty.name], "query");
	if(!queryObject) {
		return null;
	}
	return queryObject;
};

var getCollectionFromQuery = function(queryObject) {
	if(!queryObject) {
		return null;
	}

	if(!App.project) {
		return null;
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return null;
	}

	let collectionName = queryObject.collection;
	if(!collectionName) {
		return null;
	}

	let collectionObject = kitchen.findObjectByNameAndType(collectionName, "collection");
	if(!collectionObject) {
		return null;
	}

	return collectionObject;
};

var getFieldEditorCollection = function() {
	var queryObject = getFieldEditorQuery();
	if(!queryObject) {
		return null;
	}

	return getCollectionFromQuery(queryObject);
};

var fieldsAreInherited = function() {
	if(!App.project) {
		return false;
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return false;
	}
	var selectedId = Session.get("pageEditorSelectedObject");
	var selectedObject = kitchen.findObjectById(selectedId);
	if(!selectedObject) {
		return false;
	}

	let fieldsProperty = selectedObject._properties.find(property => {
		return property.type == "base_array" && property.subType == "field";
	});

	if(!fieldsProperty) {
		return false;
	}

	let fields = selectedObject[fieldsProperty.name];
	let gotFields = fields ? !!fields.length : false;

	if(gotFields) {
		return false;
	}

	let collectionObject = getFieldEditorCollection();
	if(!collectionObject) {
		return false;
	}
	return !!collectionObject.fields.length;
};

// ----------------------------------------------------------------------------
// HomePrivateEditPagesFieldsView

Template.HomePrivateEditPagesFieldsView.helpers({
	"gotFields": function() {
		if(!App.project) {
			return false;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return false;
		}
		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return false;
		}

		let fieldsProperty = selectedObject._properties.find(property => {
			return property.type == "base_array" && property.subType == "field";
		});

		if(!fieldsProperty) {
			return false;
		}

		let fields = selectedObject[fieldsProperty.name];
		return fields ? !!fields.length : false;
	},
	"fieldsAreInherited": function() {
		return fieldsAreInherited();
	}
});

Template.HomePrivateEditPagesFieldsView.events({
	"click .override-fields": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return false;
		}
		let kitchen = App.project.get();
		if(!kitchen) {
			return false;
		}
		let selectedId = Session.get("pageEditorSelectedObject");
		let selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return false;
		}

		let fieldsProperty = selectedObject._properties.find(property => {
			return property.type == "base_array" && property.subType == "field";
		});

		if(!fieldsProperty) {
			return false;
		}

		let collection = getFieldEditorCollection();
		if(!collection) {
			return false;
		}

		collection.fields.map(field => {
			let clone = ClassKitchen.create(field._className, selectedObject[fieldsProperty.name]);
			clone.cloneFrom(field);
			selectedObject[fieldsProperty.name].push(clone);
		});

		Session.set("pageEditorFocusedObject", selectedObject._id);

		App.setModified();

		return false;
	},

	"click .add-field": function(e, t) {
		e.preventDefault();

		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		let fieldsProperty = selectedObject._properties.find(property => {
			return property.type == "base_array" && property.subType == "field";
		});
		if(!fieldsProperty) {
			return;
		}

		let fields = selectedObject[fieldsProperty.name];
		let newField = ClassKitchen.create(fields._defaultItemType, fields);
		newField.name = fields.getUniqueItemName(newField);

		fields.push(newField);

		Session.set("pageEditorFocusedObject", newField._id);

		App.setModified();

		return false;
	}

});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesFieldList

Template.HomePrivateEditPagesFieldList.helpers({
	"fieldList": function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		let fieldsProperty = selectedObject._properties.find(property => {
			return property.type == "base_array" && property.subType == "field";
		});
		if(!fieldsProperty) {
			return;
		}

		let fields = selectedObject[fieldsProperty.name];

		if(fields && fields.length) {
			return fields;
		}

		let queryProperty = selectedObject._properties.find(property => {
			return property.name == "query_name";
		});

		if(!queryProperty) {
			return;
		}
		let queryObject = kitchen.findObjectByNameAndType(selectedObject[queryProperty.name], "query");
		if(!queryObject) {
			return;
		}

		let collectionName = queryObject.collection;
		if(!collectionName) {
			return;
		}

		let collectionObject = kitchen.findObjectByNameAndType(collectionName, "collection");
		if(!collectionObject) {
			return;
		}

		return collectionObject.fields;
	}
});

Template.HomePrivateEditPagesFieldList.events({

});


// ----------------------------------------------------------------------------
// HomePrivateEditPagesFieldListItem

Template.HomePrivateEditPagesFieldListItem.helpers({
	"fieldsAreInherited": function() {
		return fieldsAreInherited();
	},

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

		if(this._id == Session.get("pageEditorSelectedObject")) {
			rowClass += rowClass ? " " : "";
			rowClass += "selected";
		}
		if(this._id == Session.get("pageEditorFocusedObject")) {
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

Template.HomePrivateEditPagesFieldListItem.events({
	"click .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

		Session.set("pageEditorFocusedObject", this._id);

		return false;
	},
	"click .delete-icon": function(e, t) {
		if(fieldsAreInherited()) {
			return false;
		}

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
		if(fieldsAreInherited()) {
			return;
		}

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



Template.HomePrivateEditPagesFormActionsView.rendered = function() {
	Meteor.defer(function() {
		App.refreshWindowSize();
	});

	var setup = false;
	App.addRefreshingSessionVar("formObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("formObjectChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject || selectedObject._className != "form") {
			return;
		}

		if(Session.get("formObjectChanged")) {
			setup = false;
			Session.set("formObjectChanged", false);
		}

		var onSubmitText = Session.get("onSubmitInputText");
		var onCancelText = Session.get("onCancelInputText");

		if(setup) {
			if(
				onSubmitText != selectedObject.submit_code ||
				onCancelText != selectedObject.cancel_code
			) {
				selectedObject.submit_code = onSubmitText;
				selectedObject.cancel_code = onCancelText;

				App.setModified();
			}
		} else {
			Session.set("onSubmitInputText", selectedObject.submit_code);
			Session.set("onCancelInputText", selectedObject.cancel_code);
			setup = true;
		}

	});

};


Template.HomePrivateEditPagesFormActionsView.helpers({
	"onSubmitInputOptions": function() {
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
	"onCancelInputOptions": function() {
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
	"onSubmitClass": function() {
		return Session.get("formActionsHideOnSubmit") ? "off" : "";
	},
	"onCancelClass": function() {
		return Session.get("formActionsHideOnCancel") ? "off" : "";
	},
	"onSubmitIconClass": function() {
		return Session.get("formActionsHideOnSubmit") ? "fa-caret-right" : "fa-caret-down";
	},
	"onCancelIconClass": function() {
		return Session.get("formActionsHideOnCancel") ? "fa-caret-right" : "fa-caret-down";
	}
});

Template.HomePrivateEditPagesFormActionsView.events({
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

// ----------

Template.HomePrivateEditPagesDataViewActionsView.rendered = function() {
	Meteor.defer(function() {
		App.refreshWindowSize();
	});

	var setup = false;
	App.addRefreshingSessionVar("dataviewObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("dataviewObjectChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		if(Session.get("dataviewObjectChanged")) {
			setup = false;
			Session.set("dataviewObjectChanged", false);
		}

		var onItemClickedText = Session.get("onItemClickedInputText");
		if(setup) {
			if(onItemClickedText != selectedObject.on_item_clicked_code) {
				selectedObject.on_item_clicked_code = onItemClickedText;

				App.setModified();
			}
		} else {
			Session.set("onItemClickedInputText", selectedObject.on_item_clicked_code);
			setup = true;
		}
	});
};


Template.HomePrivateEditPagesDataViewActionsView.helpers({
	"onItemClickedInputOptions": function() {
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
	"onItemClickedClass": function() {
		return Session.get("formActionsHideOnItemClicked") ? "off" : "";
	},
	"onItemClickedIconClass": function() {
		return Session.get("formActionsHideOnItemClicked") ? "fa-caret-right" : "fa-caret-down";
	}
});

Template.HomePrivateEditPagesDataViewActionsView.events({
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

// -----------

Template.HomePrivateEditPagesHelpersEventsView.rendered = function() {
	Meteor.defer(function() {
		App.refreshWindowSize();
	});

	var setup = false;
	App.addRefreshingSessionVar("helpersEventsObjectChanged");
	this.autorun(function() {
		var selectedId = Session.get("pageEditorSelectedObject");
		Session.set("helpersEventsObjectChanged", true);
	});

	this.autorun(function() {
		if(!App.project) {
			return;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return;
		}

		if(Session.get("helpersEventsObjectChanged")) {
			setup = false;
			Session.set("helpersEventsObjectChanged", false);
		}

		var onRenderedText = Session.get("onRenderedInputText");
		var helpersText = Session.get("helpersInputText");
		var eventsText = Session.get("eventsInputText");

		if(setup) {
			if(
				onRenderedText != selectedObject.template_rendered_code ||
				helpersText != selectedObject.helpers_code ||
				eventsText != selectedObject.events_code
			) {
				selectedObject.template_rendered_code = onRenderedText;
				selectedObject.helpers_code = helpersText;
				selectedObject.events_code = eventsText;

				App.setModified();
			}
		} else {
			Session.set("onRenderedInputText", selectedObject.template_rendered_code);
			Session.set("helpersInputText", selectedObject.helpers_code);
			Session.set("eventsInputText", selectedObject.events_code);
			setup = true;
		}

	});

};


Template.HomePrivateEditPagesHelpersEventsView.helpers({
	"onRenderedInputOptions": function() {
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
	"helpersInputOptions": function() {
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
	"eventsInputOptions": function() {
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
	"onRenderedClass": function() {
		return Session.get("helpersEventsHideOnRendered") ? "off" : "";
	},
	"helpersClass": function() {
		return Session.get("helpersEventsHideHelpers") ? "off" : "";
	},
	"eventsClass": function() {
		return Session.get("helpersEventsHideEvents") ? "off" : "";
	},
	"onRenderedIconClass": function() {
		return Session.get("helpersEventsHideOnRendered") ? "fa-caret-right" : "fa-caret-down";
	},
	"helpersIconClass": function() {
		return Session.get("helpersEventsHideHelpers") ? "fa-caret-right" : "fa-caret-down";
	},
	"eventsIconClass": function() {
		return Session.get("helpersEventsHideEvents") ? "fa-caret-right" : "fa-caret-down";
	}
});

Template.HomePrivateEditPagesHelpersEventsView.events({
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



// ----------------------------------------------------------------------------
// HomePrivateEditPagesCustomActionsView

Template.HomePrivateEditPagesCustomActionsView.created = function() {

};

Template.HomePrivateEditPagesCustomActionsView.rendered = function() {

};

Template.HomePrivateEditPagesCustomActionsView.helpers({
	"selectedObject": function() {
		if(!App.project) {
			return null;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return null;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return null;
		}

		return selectedObject;
	},

	"actionProperties": function() {
		if(!App.project) {
			return null;
		}

		var kitchen = App.project.get();
		if(!kitchen) {
			return null;
		}

		var selectedId = Session.get("pageEditorSelectedObject");
		var selectedObject = kitchen.findObjectById(selectedId);
		if(!selectedObject) {
			return null;
		}

		var actionProperties = selectedObject._properties.filter(function(property) {
			return property.type == "base_array" && property.subType == "action";
		});

		return actionProperties;
	}
});
