this.EditableContentCollection = new Mongo.Collection("editable_content");

this.EditableContentCollection.userCanInsert = function(userId, doc) {
	return Users.isAdmin(userId);
};

this.EditableContentCollection.userCanUpdate = function(userId, doc) {
	return Users.isAdmin(userId);
};

this.EditableContentCollection.userCanRemove = function(userId, doc) {
	return Users.isAdmin(userId);
};
