Template.EditableContent.onCreated(function() {
	this.subscribe("editable_content", this.data.name);
});

Template.EditableContent.events({
	"click .edit-button, dblclick .editable-content.read-write": function(e, t) {
		var userCanUpdate = EditableContentCollection.userCanUpdate(Meteor.userId());
		if(!userCanUpdate) {
			return;
		}

		var content = "";
		var dataReady = t.subscriptionsReady();

		if(dataReady) {
			var data = EditableContentCollection.findOne({ name: t.data.name }, {});
			content = data ? data.content || "" : "";
		}

		InputDialog({
			message: "Text (markdown)",
			title: "Edit Content",
			onSubmit: function(text, payload) {
				Meteor.call("update_editable_content", t.data.name, text, function(e, t) {
					if(e) {
						alert(e);
						return;
					}
				});
			},
			onCancel: function(payload) {
			},
			buttonSubmitTitle: "OK",
			buttonCancelTitle: "Cancel",
			multiline: true,
			text: content,
			payload: null
		});
	}
});

Template.EditableContent.helpers({
	userCanUpdate: function() {
		return EditableContentCollection.userCanUpdate(Meteor.userId());
	},

	editableContentClass: function() {
		let userCanUpdate = EditableContentCollection.userCanUpdate(Meteor.userId());

		let classString = "editable-content" + (userCanUpdate ? " read-write" : " read-only");

		var content = "";
		var dataReady = Template.instance().subscriptionsReady();

		if(dataReady) {
			var data = EditableContentCollection.findOne({ name: this.name }, {});
			content = data ? data.content || "" : "";
		}

		if(!content) {
			classString = classString + " empty-content";
		}

		return classString;
	},

	content: function() {
		var content = "";
		var dataReady = Template.instance().subscriptionsReady();

		if(dataReady) {
			var data = EditableContentCollection.findOne({ name: this.name }, {});
			content = data ? data.content || "" : "";

			if(!content) {
				content = this.textIfEmpty || "&nbsp;<br />&nbsp;";
			}
		} else {
			content = "<div class=\"loading\"><i class=\"fa fa-circle-o-notch fa-2x fa-spin\"/></div>";
		}

		return content;
	}
});
