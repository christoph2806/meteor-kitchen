this.Contacts = new Mongo.Collection("contacts");

this.Contacts.userCanInsert = function(userId, doc) {
	return Users.isInRoles(userId, ["admin","user"]);
};

this.Contacts.userCanUpdate = function(userId, doc) {
	return false;
};

this.Contacts.userCanRemove = function(userId, doc) {
	return doc && (doc.fromUserId == userId || doc.toUserId == userId);
};
