Template.CMSContent.onCreated(function() {
	this.subscribe("cms_content", this.data.name);
});

Template.CMSContent.events({
	"click .add-block": function(e, t) {
		var sessionKeyMode = "cms_content" + this.name + "Mode";
		Session.set(sessionKeyMode, "insert");
	}
});

Template.CMSContent.helpers({
	"insertMode": function() {
		var sessionKeyMode = "cms_content" + this.name + "Mode";
		return Session.get(sessionKeyMode) === "insert";
	},

	"dataReady": function() {
		return Template.instance().subscriptionsReady();
	},

	"userCanInsert": function() {
		return CMSContentCollection.userCanInsert(Meteor.userId());
	},

	"gotItems": function() {
		var dataReady = Template.instance().subscriptionsReady();
		if(!dataReady) {
			return false;
		}
		return !!CMSContentCollection.find({ name: this.name }, {}).count();
	},

	"cmsItems": function() {
		var items = [];
		var dataReady = Template.instance().subscriptionsReady();

		if(dataReady) {
			var data = CMSContentCollection.find({ name: this.name }, {});
			items = data.fetch();
		}

		return items;
	}
});


Template.CMSInsertForm.onCreated(function() {
});

Template.CMSInsertForm.onRendered(function() {
});

Template.CMSInsertForm.events({
	"submit form": function(e, t) {
		e.preventDefault();

		var self = this;
		function submitAction(result, msg) {
			var sessionKeyMode = "cms_content" + self.data.name + "Mode";
			var sessionKeyEditing = "cms_content" + self.data.name + "Editing";
			var editingItems = Session.get(sessionKeyEditing) || [];
			editingItems.push(result);

			Session.set(sessionKeyEditing, editingItems);
			Session.set(sessionKeyMode, null);
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			var sessionKeyError = "cms_content" + self.data.name + "ErrorMessage";
			Session.set(sessionKeyError, message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				var type = values.type;
				delete values.type;

				Meteor.call("insertCmsBlock", self.data.name, type, values, function(e, r) { 
					if(e) {
						errorAction(e); 
					} else {
						submitAction(r);
					}
				});
			}
		);

		return false;
	},

	"click .cancel-insert": function(e, t) {
		var sessionKeyMode = "cms_content" + this.data.name + "Mode";
		Session.set(sessionKeyMode, null);
	}
});

Template.CMSInsertForm.helpers({
	"errorMessage": function() {
		var sessionKeyError = "cms_content" + this.data.name + "ErrorMessage";
		return Session.get(sessionKeyError);		
	}
});



Template.CMSItem.onCreated(function() {
});

Template.CMSItem.onRendered(function() {
});

Template.CMSItem.helpers({
	"userCanUpdate": function() {
		var parentData = Template.parentData(1);
		var sessionKeyEditing = "cms_content" + parentData.name + "Editing";
		var editingItems = Session.get(sessionKeyEditing) || [];
		var editing = editingItems.indexOf(this._id) >= 0;

		return !editing && CMSContentCollection.userCanUpdate(Meteor.userId());
	},

	"classString": function() {
		let userCanUpdate = CMSContentCollection.userCanUpdate(Meteor.userId());

		let classString = "cms-content" + (userCanUpdate ? " read-write" : " read-only");

		var content = this.data ? this.data.content : "";

		if(!content) {
			classString = classString + " empty-content";
		}

		return classString;
	},

	"itemData": function() {
		var parentData = Template.parentData(1);
		var sessionKeyEditing = "cms_content" + parentData.name + "Editing";
		var editingItems = Session.get(sessionKeyEditing) || [];
		var itemData = {};
		itemData.editing = editingItems.indexOf(this._id) >= 0;
		itemData.parentName = parentData.name;
		return mergeObjects(itemData, this);
	},

	"itemTemplate": function() {
		switch(this.type) {
			case "markdown": return "CMSItemMarkdown"; break;
			case "html": return "CMSItemHTML"; break;
			case "text": return "CMSItemText"; break;
			default: return "CMSItemHTML";
		}
	}
});

Template.CMSItem.events({
	"click .edit-button": function(e, t) {
		var sessionKeyEditing = "cms_content" + this.name + "Editing";
		var editingItems = Session.get(sessionKeyEditing) || [];
		editingItems.push(this._id);
		Session.set(sessionKeyEditing, editingItems);
	},
	"click .remove-button": function(e, t) {
		ConfirmationDialog({
			message: "Are you sure you want to delete item?",
			title: "Delete",
			onYes: function(id) {
				Meteor.call("removeCmsBlock", id, function(e, r) { 
					if(e) {
						alert(e);
					} else {
					}
				});
			},
			onNo: function(id) {
			},
			onCancel: function(id) {
			},
			buttonYesTitle: "Yes",
			buttonNoTitle: "No",
			payload: this._id
		});
	}
});



Template.CMSItemMarkdown.onCreated(function() {
});

Template.CMSItemMarkdown.onRendered(function() {
});

Template.CMSItemMarkdown.helpers({
});

Template.CMSItemMarkdown.events({
});


Template.CMSItemHTML.onCreated(function() {
});

Template.CMSItemHTML.onRendered(function() {
});

Template.CMSItemHTML.helpers({
});

Template.CMSItemHTML.events({
});



Template.CMSItemText.onCreated(function() {
});

Template.CMSItemText.onRendered(function() {
});

Template.CMSItemText.helpers({
});

Template.CMSItemText.events({
});



Template.CMSUpdateFormSimple.onCreated(function() {
});

Template.CMSUpdateFormSimple.onRendered(function() {
});

Template.CMSUpdateFormSimple.helpers({
	"title": function() {
		switch(this.data.type) {
			case "markdown": return "Content (Markdown)"; break;
			case "html": return "Content (html)"; break;
			case "text": return "Content (text)"; break;
		}
		return "Content";
	},
	"errorMessage": function() {
		var sessionKeyError = "cmsItem_" + this.data._id + "_ErrorMessage";
		return Session.get(sessionKeyError);
	}
});

Template.CMSUpdateFormSimple.events({
	"submit form": function(e, t) {
		e.preventDefault();

		var self = this;

		function submitAction(result, msg) {
			var sessionKeyEditing = "cms_content" + self.data.parentName + "Editing";
			var editingItems = Session.get(sessionKeyEditing) || [];
			var index = editingItems.indexOf(self.data._id);
			if(index >= 0) {
				editingItems.splice(index, 1);
			}
			Session.set(sessionKeyEditing, editingItems);
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			var sessionKeyError = "cmsItem_" + self.data._id + "_ErrorMessage";
			Session.set(sessionKeyError, message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				Meteor.call("updateCmsBlock", self.data._id, values, function(e, r) { 
					if(e) {
						errorAction(e); 
					} else {
						submitAction(r);
					}
				});
			}
		);

		return false;
	},

	"click .cancel-update": function(e, t) {
		var sessionKeyEditing = "cms_content" + this.data.parentName + "Editing";
		var editingItems = Session.get(sessionKeyEditing) || [];
		var index = editingItems.indexOf(this.data._id);
		if(index >= 0) {
			editingItems.splice(index, 1);
		}
		Session.set(sessionKeyEditing, editingItems);
	}
});
