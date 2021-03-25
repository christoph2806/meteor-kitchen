Template.CustomActionsEditor.helpers({
	"actionList": function() {
		if(!this.object || !this.property) {
			return null;
		}
		return this.object[this.property.name];
	}
});

Template.CustomActionsEditor.events({
	"click .add-action": function(e, t) {
		var selectedObject = this.object;
		if(!selectedObject) {
			return;
		}

		let actionsProperty = selectedObject.getProperty(this.property.name);
		if(!actionsProperty) {
			return;
		}

		let actions = selectedObject[actionsProperty.name];
		let newAction = ClassKitchen.create(actions._defaultItemType, actions);
		newAction.name = actions.getUniqueItemName(newAction);

		actions.push(newAction);

		Session.set("pageEditorFocusedObject", newAction._id);

		App.setModified();

		return false;
	}
});



// ----------------------------------------------------------------------------
// CustomActionsEditorItem

Template.CustomActionsEditorItem.helpers({
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


Template.CustomActionsEditorItem.events({
	"click .object-table-row": function(e, t) {
		e.preventDefault();
		if(!this) {
			return false;
		}

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
