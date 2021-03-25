Meteor.methods({
	"update_editable_content": function(name, text) {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(401, "Access denied.");
		}

		let obj = {
			name: name,
			content: text
		};

		EditableContentCollection.upsert({ name: name }, { $set: obj });
	}
});
