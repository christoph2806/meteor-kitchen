var globalSkipProperties = {
	"component": {
		"components": true,
		"query_name": true,
		"query_params": true,
//		"custom_data_code": true,
		"custom_template": true,
		"helpers_code": true,
		"events_code": true,
		"template_rendered_code": true,
		"controller_before_action": true,
		"controller_after_action": true,

		"html": true,
		"js": true,
		"jsx": true,
		"gasoline": true,
		"use_gasoline": true

	},
	"page": {
		"pages": true,
		"user_defined_template": true,
		"html": true,
		"js": true,
		"jsx": true,
		"gasoline": true,
		"use_gasoline": true

	},
	"zone": {
		"components": true,
		"pages": true,
		"query_name": true,
		"query_params": true,
		"layout_template": true,
		"user_defined_template": true,
		"template_rendered_code": true,
		"html": true,
		"js": true,
		"jsx": true,
		"gasoline": true,
		"use_gasoline": true
	},
	"gas_template": {
		"handlers": true,
		"helpers": true
	},
	"gas_element": {
		"type": true,
		"children": true,
		"attributes": true,
		"events": true
	},
	"gas_node": {
		"type": true
	},
	"gasoline": {
		"type": true
	}
};

var skipProperties = {
	"zone": {
	},

	"page": {
		"roles": true,
		"route_params": true
	},

	"collection": {
		"fields": true,

		"roles_allowed_to_read": true,
		"roles_allowed_to_insert": true,
		"roles_allowed_to_update": true,
		"roles_allowed_to_delete": true,
		"roles_allowed_to_download": true,

		"before_insert_code": true,
		"before_update_code": true,
		"before_remove_code": true,

		"after_insert_code": true,
		"after_update_code": true,
		"after_remove_code": true,

		"before_insert_source_file": true,
		"before_update_source_file": true,
		"before_remove_source_file": true,

		"after_insert_source_file": true,
		"after_update_source_file": true,
		"after_remove_source_file": true,
	},

	"query": {
		"filter": true,
		"options": true
	},

	"custom_component": {
	},

	"menu": {
		"items": true
	},

	"menu_item": {
		"items": true
	},

	"markdown": {
		"source": true,
		"source_file": true
	},

	"form": {
		"fields": true,
		"submit_code": true,
		"cancel_code": true
	},

	"data_view": {
		"fields": true,
		"on_item_clicked_code": true
	},

	"gasoline": {
		"templates": true
	}
};


var pageSession = new ReactiveDict();

Template.PropertyEditor.created = function() {

};

Template.PropertyEditor.rendered = function() {
	pageSession.set("editingProperty", "");
};

Template.PropertyEditor.helpers({
	"gotAttributes": function() {
		if(!this.object) {
			return false;
		}

		return this.object._className == "gas_html";
	},

	"objectAttributes": function() {
		if(!this.object) {
			return null;
		}

		return this.object.attributes;
	},

	"gotEvents": function() {
		if(!this.object) {
			return false;
		}

		return this.object._className == "gas_html";
	},

	"objectEvents": function() {
		if(!this.object) {
			return null;
		}

		return this.object.events;
	},

	"objectProperties": function() {
		if(!this.object) {
			return [];
		}

		var skipProperty = skipProperties[this.object._className];

		var parentClasses = [];
		for(var className in globalSkipProperties) {
			if(this.object.isInheritedFrom(className)) {
				parentClasses.push(className);
			}
		}

		var properties = [];
		this.object._properties.map(property => {
			var skip = false;

			if(skipProperty && skipProperty[property.name]) {
				skip = true;
			}

			if(this.object.isInheritedFrom("component")) {
				if(property.input == "select_route") {
					skip = true;
				}
				if(property.type == "base_array" && property.subType == "param") {
					skip = true;
				}
			}

			if(!skip) {
				parentClasses.map(parentClass => {
					if(globalSkipProperties[parentClass][property.name]) {
						skip = true;
					}
				});
			}

			if(!skip) {
				properties.push(property);
			}
		});

		return properties;
	}
});

Template.PropertyEditor.events({
	"click .add-attribute": function(e, t) {
		e.stopPropagation();

		if(!this.object || !this.object.attributes) {
			return;
		}

		var newAttr = ClassKitchen.create(this.object.attributes._defaultItemType, this.object.attributes);

		this.object.attributes.push(newAttr);
		App.setModified();

		pageSession.set("editingAttribute", newAttr._id);
	},

	"click .add-event": function(e, t) {
		e.stopPropagation();

		if(!this.object || !this.object.events) {
			return;
		}

		var newEvt = ClassKitchen.create(this.object.events._defaultItemType, this.object.events);

		this.object.events.push(newEvt);
		App.setModified();

		pageSession.set("editingEvent", newEvt._id);
	}

});


// ---

Template.PropertyEditorAttributeRow.created = function() {

};

Template.PropertyEditorAttributeRow.rendered = function() {
};

Template.PropertyEditorAttributeRow.helpers({
	"editingAttribute": function() {
		if(!this.attribute) {
			return false;
		}
		var editingAttribute = pageSession.get("editingAttribute");
		return editingAttribute == this.attribute._id;
	}
});


Template.PropertyEditorAttributeRow.events({
	"click .attribute-editor-row": function(e, t) {
		if(!this || !this.attribute) {
			return;
		}

		var editingAttribute = pageSession.get("editingAttribute") || "";
		if(editingAttribute != this.attribute._id) {
			pageSession.set("editingAttribute", this.attribute._id);
			Meteor.defer(function() {
				t.$("input").first().focus();
			});
		}
	},

	"click .remove-attribute": function(e, t) {
		e.stopPropagation();

		if(!this || !this.attribute || !this.object) {
			return;
		}

		var self = this;
		confirmationBox(
			"Delete attribute",
			"Are you sure you want to delete attribute?",
			function(el) {
				if(self.object.getRoot().removeObjectById(self.attribute._id)) {
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

			if(!this || !this.attribute) {
				return;
			}

			var input = $(e.currentTarget);

			if(input.hasClass("edit-attribute-name")) {
				input.val(this.attribute.name + "");
			}

			if(input.hasClass("edit-attribute-value")) {
				input.val(this.attribute.value + "");
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
					if(focusedEl.attr("data-id") == self.attribute._id) {
						leave = false;
					}
				}

				if(leave) {
					pageSession.set("editingAttribute", "");
				}
			}, 10);
		}

		if(!this || !this.attribute || !this.object) {
			leaveEditing();
			return;
		}

		var input = $(e.currentTarget);

		var value = input.val() + "";
		value = value.trim();

		if(input.hasClass("edit-attribute-name")) {
			if(this.attribute.name == value) {
				leaveEditing();
				return;
			}
			this.attribute.name = value;
		}
		if(input.hasClass("edit-attribute-value")) {
			if(this.attribute.value == value) {
				leaveEditing();
				return;
			}
			this.attribute.value = value;
		}

		App.setModified();
		leaveEditing();
	}
});

// ---

Template.PropertyEditorEventRow.created = function() {

};

Template.PropertyEditorEventRow.rendered = function() {
};

Template.PropertyEditorEventRow.helpers({
	"editingEvent": function() {
		if(!this.event) {
			return false;
		}
		var editingEvent = pageSession.get("editingEvent");
		return editingEvent == this.event._id;
	}
});


Template.PropertyEditorEventRow.events({
	"click .event-editor-row": function(e, t) {
		if(!this || !this.event) {
			return;
		}

		var editingEvent = pageSession.get("editingEvent") || "";
		if(editingEvent != this.event._id) {
			pageSession.set("editingEvent", this.event._id);
			Meteor.defer(function() {
				t.$("input").first().focus();
			});
		}
	},

	"click .remove-event": function(e, t) {
		e.stopPropagation();

		if(!this || !this.event || !this.object) {
			return;
		}

		var self = this;
		confirmationBox(
			"Delete event",
			"Are you sure you want to delete event?",
			function(el) {
				if(self.object.getRoot().removeObjectById(self.event._id)) {
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

			if(!this || !this.event) {
				return;
			}

			var input = $(e.currentTarget);

			if(input.hasClass("edit-event-name")) {
				input.val(this.event.event + "");
			}

			if(input.hasClass("edit-event-handler")) {
				input.val(this.event.handler + "");
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
					if(focusedEl.attr("data-id") == self.event._id) {
						leave = false;
					}
				}

				if(leave) {
					pageSession.set("editingEvent", "");
				}
			}, 10);
		}

		if(!this || !this.event || !this.object) {
			leaveEditing();
			return;
		}

		var input = $(e.currentTarget);

		var value = input.val() + "";
		value = value.trim();

		if(input.hasClass("edit-event-name")) {
			if(this.event.event == value) {
				leaveEditing();
				return;
			}
			this.event.event = value;
		}
		if(input.hasClass("edit-event-handler")) {
			if(this.event.handler == value) {
				leaveEditing();
				return;
			}
			this.event.handler = value;
		}

		App.setModified();
		leaveEditing();
	}
});


// ---

Template.PropertyEditorRow.created = function() {

};

Template.PropertyEditorRow.rendered = function() {
	this.$(".property-description").popup();
};

Template.PropertyEditorRow.helpers({
	"rowStateClass": function() {
		if(!this.object || !this.property) {
			return "";
		}

		var cssClass = "";

		if(this.property.required && this.object.propertyHasValue && !this.object.propertyHasValue(this.property.name)) {
			cssClass = "error";
		}

		return cssClass;
	},

	"inputTemplate": function() {
		if(!this || !this.property) {
			return "";
		}

		var editingProperty = pageSession.get("editingProperty");
		if(editingProperty == this.property.name) {
			switch(this.property.input) {
				case "static": return "PropertyEditorStatic"; break;
				case "text": return "PropertyEditorText"; break;
				case "textarea": return "PropertyEditorTextarea"; break;
				case "checkbox": return "PropertyEditorCheckbox"; break;
				case "select": return "PropertyEditorSelect"; break;
				case "select_route": return "PropertyEditorSelectRoute"; break;
				case "select_collection": return "PropertyEditorSelectCollection"; break;
				case "select_query": return "PropertyEditorSelectQuery"; break;
				case "javascript": return "PropertyEditorJavascript"; break;
				default: {
					if(this.property.type == "base_array") {
						switch(this.property.subType) {
							case "string": return "PropertyEditorArray"; break;
							case "input_item": return "PropertyEditorArray"; break;
							case "param": return "PropertyEditorArray"; break;
							case "variable": return "PropertyEditorArray"; break;
							case "hidden_field": return "PropertyEditorArray"; break;
/*
							case "subscription": return "PropertyEditorArray"; break;
*/
						}
					}
				}
			}
		} else {
			if(this.property.type == "base_array") {
				return "PropertyEditorDisplayArray";
			}

			switch(this.property.input) {
				case "checkbox": return "PropertyEditorCheckbox"; break;
				case "textarea": return "PropertyEditorDisplayTextarea"; break;
				case "javascript": return "PropertyEditorDisplayJavascript"; break;
			}	

			return "PropertyEditorDisplayValue";
		}

		return "PropertyEditorUnknown";
	} 
});

Template.PropertyEditorRow.events({
	"click .property-editor-row": function(e, t) {
		if(!this || !this.property) {
			return;
		}
		pageSession.set("editingProperty", this.property.name);
	}
});

// display value

Template.PropertyEditorDisplayValue.helpers({
	"propertyValue": function() {
		return this.object[this.property.name] + "";
	}
});

// display array

Template.PropertyEditorDisplayArray.helpers({
	"propertyValue": function() {
		return this.object[this.property.name] || [];
	}
});

// static

Template.PropertyEditorStatic.helpers({
	"propertyValue": function() {
		return this.object[this.property.name] + "";
	}
});

// text

Template.PropertyEditorText.rendered = function() { 
	this.$("input").focus(); 
};

Template.PropertyEditorText.helpers({
	"propertyValue": function() {
		return this.object[this.property.name] + "";
	}
});

Template.PropertyEditorText.events({
	"keydown input": function(e, t) {
		if(e.keyCode == 13) {
			e.preventDefault();
			e.currentTarget.blur();
			return false;
		}
		if(e.keyCode == 27) {
			e.preventDefault();
			t.$("input").val(this.object[this.property.name]);
			e.currentTarget.blur();
			return false;
		}
	},
	"blur input": function(e, t) {
		function leaveEditing() {
			pageSession.set("editingProperty", "");
		}

		if(!this || !this.property || !this.object) {
			leaveEditing();
			return;
		}

		var oldValue = this.object[this.property.name];

		var value = t.$("input").val() + "";
		value = value.trim();

		if(oldValue == value) {
			leaveEditing();
			return;
		}

		switch(this.property.subType) {
			case "object_name": {
				// check if empty
				if(!value) {
					leaveEditing();
					return;
				}

				// convert name to correct case
				if(this.object._className == "field" || this.object._className == "gas_template") {
					value = value.replace(new RegExp("[^0-9a-zA-Z.]", "g"), "_");
				} else {
					value = toSnakeCase(value);					
				}

				// if property is .name
				if(this.property.name == "name") {
					// check if parent already contains object with the same name (but different id)
					var alreadyExists = false;
					this.object._parent.findObject(obj => {
						if(obj.name && obj.name == value && obj._id != this.object._id) {
							// object with the same name already exists
							alreadyExists = true;
							return true;
						}
					}, false);

					if(alreadyExists) {
						// object with the same name already exists, warn user
						t.$("input").val(this.object.name);
						Meteor.defer(function() {
							t.$("input").focus().select();
						});
						return;
					}

					// update other objects referencing renamed object
					if(this.object.updateRefs) {
						this.object.updateRefs(this.object[this.property.name], value);
					}
				}

			}; break;
		}


		this.object[this.property.name] = value;
		App.setModified();
		pageSession.set("editingProperty", "");
	}
});


// checkbox

Template.PropertyEditorCheckbox.helpers({
	"iconClass": function() {
		return this.object[this.property.name] ? "green checkmark icon" : "grey minus icon";
	}
});

Template.PropertyEditorCheckbox.events({
	"click .checkbox-icon": function(e, t) {
		e.preventDefault();
		this.object[this.property.name] = !this.object[this.property.name];
		App.setModified();
		return false;
	}
});


// select

Template.PropertyEditorSelect.rendered = function() {
	var self = this;
	Meteor.defer(function() {
		self.$(".ui.dropdown").dropdown({
			onHide: function() {
				Meteor.setTimeout(function() {
					if(pageSession.get("editingProperty") == self.data.property.name) {
						pageSession.set("editingProperty", "");
					}
				}, 100);
			}
		});
		self.$(".ui.dropdown").focus();
	});
};

Template.PropertyEditorSelect.events({
	"change #hidden-select": function(e, t) {
		if(!this || !this.property || !this.object) {
			pageSession.set("editingProperty", "");
			return;
		}

		var value = e.currentTarget.value;
		this.object[this.property.name] = value;
		App.setModified();
	}
});

Template.PropertyEditorSelect.helpers({
	"propertyValue": function() {
		return this.object[this.property.name] + "";
	}
});

// select route

Template.PropertyEditorSelectRoute.helpers({
	"choiceItems": function() {
		var choiceItems = [""];
		var routes = this.object.getRoot().getAllRoutes();
		routes.map(route => {
			choiceItems.push(route);
		});
		choiceItems.sort();
		return choiceItems;
	}
});


// select collection

Template.PropertyEditorSelectCollection.helpers({
	"choiceItems": function() {
		var choiceItems = [""];

		var collections = this.object.getRoot().getObjectsOfType("collection");
		collections.map(collection => {
			choiceItems.push(collection.name);
		});
		choiceItems.push("users");

		choiceItems.sort();
		return choiceItems;
	}
});


// select query

Template.PropertyEditorSelectQuery.helpers({
	"choiceItems": function() {
		var choiceItems = [""];

		var queries = this.object.getRoot().getObjectsOfType("query");
		queries.map(query => {
			choiceItems.push(query.name);
		});

		choiceItems.sort();
		return choiceItems;
	}
});

// select object

Template.PropertyEditorSelectObject.rendered = function() {
	var self = this;
	Meteor.defer(function() {
		self.$(".ui.dropdown").dropdown({
			onHide: function() {
				Meteor.setTimeout(function() {
					if(pageSession.get("editingProperty") == self.data.property.name) {
						pageSession.set("editingProperty", "");
					}
				}, 100);
			}
		});
		self.$(".ui.dropdown").focus();
	});
};

Template.PropertyEditorSelectObject.events({
	"change #hidden-select": function(e, t) {
		if(!this || !this.property || !this.object) {
			pageSession.set("editingProperty", "");
			return;
		}

		var value = e.currentTarget.value;
		this.object[this.property.name] = value;
		App.setModified();
	}
});

Template.PropertyEditorSelectObject.helpers({
	"propertyValue": function() {
		return this.object[this.property.name] + "";
	}
});


// textarea

Template.PropertyEditorTextarea.rendered = function() {
	this.$(".edit-text-link").focus();
};

Template.PropertyEditorTextarea.helpers({
});

Template.PropertyEditorTextarea.events({
	"click .edit-text-link": function(e, t) {
		var self = this;
		textareaBox("Edit text", this.property.title || "Text", this.object[this.property.name], function(el, text) {
			self.object[self.property.name] = text;

			App.setModified();
			pageSession.set("editingProperty", "");
		}, function() {
			pageSession.set("editingProperty", "");
		}, {
		});
	}
});

// javascript

Template.PropertyEditorJavascript.rendered = function() {
	this.$(".edit-js-link").focus();
};

Template.PropertyEditorJavascript.helpers({
});

Template.PropertyEditorJavascript.events({
	"click .edit-js-link": function(e, t) {
		var self = this;

		codeEditBox(this.property.title || "Edit code", this.object[this.property.name], function(el, code) {
			self.object[self.property.name] = code;
			App.setModified();
			pageSession.set("editingProperty", "");
		}, function() {
			pageSession.set("editingProperty", "");
		}, {
			language: "js"
		});
	}
});

// stringlist

Template.PropertyEditorArray.rendered = function() {
	this.$(".edit-array").focus();
};

Template.PropertyEditorArray.helpers({
	"propertyValue": function() {
		return this.object[this.property.name];
	}
});

Template.PropertyEditorArray.events({
	"click .edit-array": function(e, t) {
		var self = this;

		switch(this.property.subType) {
			case "string": {
				var items = this.property.choiceItems || [];

				stringList(this.property.title, "", items, this.object[this.property.name], function(el, values) {
					var obj = self.object[self.property.name];
					obj.clear();
					values.map(function(item) {
						obj.push(item);
					});

					App.setModified();
					pageSession.set("editingProperty", "");
				}, function() {
					pageSession.set("editingProperty", "");
				}, {
				});
			}; break;

			case "input_item": {
				var items = this.object[this.property.name] || [];
				nameValueBox(this.property.title, items, "value", "title", function(el, values) {
					var obj = self.object[self.property.name];
					obj.clear();
					values.map(function(item) {
						if(!(item.value == "" && item.title == "")) {
							var inputItem = ClassKitchen.create("input_item", obj);
							inputItem.value = item.value;
							inputItem.title = item.title;
							obj.push(inputItem);
						}
					});

					App.setModified();
					pageSession.set("editingProperty", "");
				}, function() {
					pageSession.set("editingProperty", "");
				}, {
				});
			}; break;

			case "param": {
				var items = this.object[this.property.name] || [];
				nameValueBox(this.property.title, items, "name", "value", function(el, values) {
					var obj = self.object[self.property.name];
					obj.clear();
					values.map(function(item) {
						if(!(item.name == "" && item.value == "")) {
							var inputItem = ClassKitchen.create("param", obj);
							inputItem.name = item.name;
							inputItem.value = item.value;
							obj.push(inputItem);
						}
					});

					App.setModified();
					pageSession.set("editingProperty", "");
				}, function() {
					pageSession.set("editingProperty", "");
				}, {
				});
			}; break;

			case "variable": {
				var items = this.object[this.property.name] || [];
				queryVarsBox(this.property.title, items, "name", "value", "query_name", function(el, values) {
					var obj = self.object[self.property.name];
					obj.clear();
					values.map(function(item) {
						if(!(item.name == "" && item.value == "" && item.query_name == "")) {
							var inputItem = ClassKitchen.create("variable", obj);
							inputItem.name = item.name;
							inputItem.value = item.value;
							inputItem.query_name = item.query_name;
							obj.push(inputItem);
						}
					});

					App.setModified();
					pageSession.set("editingProperty", "");
				}, function() {
					pageSession.set("editingProperty", "");
				}, {
				});
			}; break;

			case "hidden_field": {
				var items = this.object[this.property.name] || [];
				nameValueBox(this.property.title, items, "name", "value", function(el, values) {
					var obj = self.object[self.property.name];
					obj.clear();
					values.map(function(item) {
						if(!(item.name == "" && item.value == "")) {
							var inputItem = ClassKitchen.create("hidden_field", obj);
							inputItem.name = item.name;
							inputItem.value = item.value;
							obj.push(inputItem);
						}
					});

					App.setModified();
					pageSession.set("editingProperty", "");
				}, function() {
					pageSession.set("editingProperty", "");
				}, {
				});
			}; break;
		}
	}
});
