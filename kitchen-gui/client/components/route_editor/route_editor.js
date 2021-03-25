var pageSession = new ReactiveDict();


var mergeParams = function(selectedObject, routeProperty, objectParams) {
	var page = selectedObject.getRoot().findPageByRoute(selectedObject[routeProperty.name]);
	if(!page) {
		return;
	}

	// remove old params not used by query (only if param doesn't have a value)
	var removendx = [];
	objectParams.map((objectParam, paramIndex) => {
		if(indexOfParamSpec(page.route_params, objectParam.name) < 0 && !objectParam.value) {
			removendx.push(paramIndex);
			App.setModified();
		}
	});
	for(var i = removendx.length - 1; i >= 0; i--) {
		objectParams.splice(i, 1);
	}
	// add params used by query that doesn't exists
	page.route_params.map(paramName => {
		if(paramName && paramName.charAt(paramName.length - 1) == "?") {
			paramName = paramName.slice(0, -1);
		}
		var objectParam = objectParams.findObjectByName(paramName, false);
		if(!objectParam) {
			objectParam = ClassKitchen.create(objectParams._defaultItemType, objectParams);
			objectParam.name = paramName;
			objectParams.push(objectParam);
			App.setModified();
		}
	});
};

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

Template.RouteEditor.rendered = function() {
};

Template.RouteEditor.helpers({
	"showProperties": function() {
		if(this.object._id != pageSession.get("routeEditorObjectId")) {
			pageSession.set("routeEditorObjectId", this.object._id);
			return false;
		}
		return true;
	},

	"routeProperties": function() {
		var properties = [];
		this.object._properties.map(property => {
			if(property.input == "select_route") {
				properties.push(property);
			}
		});

		return properties;
	}
});

Template.RouteEditor.events({

});


Template.RouteEditorItem.rendered = function() {
	var self = this;

	$(this.find('.ui.dropdown')).dropdown();

	$(this.find("select[name='routeName']")).on("change", function(e) {
		var val = $(this).val();
		if(val == " ") val = "";

		if(self.data.object[self.data.property.name] != val) {
			self.data.object[self.data.property.name] = val;

			mergeParams(self.data.object, self.data.property, self.data.object[self.data.property.name + "_params"]);
			App.setModified();
		}
	});

	mergeParams(self.data.object, self.data.property, self.data.object[self.data.property.name + "_params"]);
};

Template.RouteEditorItem.helpers({
	"routeList": function() {
		var routeList = [" "];
		var routes = this.object.getRoot().getAllRoutes();
		routes.map(route => {
			routeList.push(route);
		});
		routeList.sort();
		return routeList;
	},
	"routeSelected": function(routeName) {
		var parentData = Template.parentData(1);
		var val = routeName;
		if(val == " ") val = "";
		return parentData.object[parentData.property.name] == val ? "selected" : "";
	},
	"routeParams": function() {
		var routeName = this.object[this.property.name];
		if(!routeName) {
			return [];
		}

		var paramsProperty = this.object.getProperty(this.property.name + "_params");
		if(!paramsProperty) {
			return [];
		}

		var kitchen = this.object.getRoot();

		var page = kitchen.findPageByRoute(routeName);
		if(!page) {
			return [];
		}

		var thisParams = this.object[paramsProperty.name];

		var params = [];
		thisParams.map(param => {
			var unknown = indexOfParamSpec(page.route_params, param.name) < 0;
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
				warning: warning,
				status: status
			});
		});

		return params;
	},
	"routeParamsTitle": function() {
		var paramsProperty = this.object.getProperty(this.property.name + "_params");
		if(!paramsProperty) {
			return "";
		}
		return paramsProperty.title;
	}
});

Template.RouteEditorItem.events({
});



Template.RouteEditorItemParam.helpers({
	"isUnknown": function() {
		return this.unknown;
	},
	"warning": function() {
		return this.warning;
	}
});

Template.RouteEditorItemParam.events({
	"input .param-value": function(e, t) {
		var parentData = Template.parentData();
		var paramsProperty = parentData.object[parentData.property.name + "_params"];
		if(!paramsProperty) {
			return;
		}

		var editingParam = paramsProperty.findObjectByName(this.name, false);
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

		var parentData = Template.parentData();
		var paramsProperty = parentData.object[parentData.property.name + "_params"];
		if(!paramsProperty) {
			return;
		}

		var removeParam = paramsProperty.findObjectByName(this.name, false);
		if(!removeParam) {
			return;
		}

		var self = this;
		confirmationBox(
			"Delete Param",
			"Are you sure you want to delete param \"" + removeParam.name + "\"?",
			function(el) {
				if(paramsProperty.removeObjectById(removeParam._id, true)) {
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
