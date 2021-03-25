Meteor.publish({
	"editable_content": function(name) {
		return EditableContentCollection.find({ name: name });
	}
});
