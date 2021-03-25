this.Messenger = new Mongo.Collection("messenger");

this.Messenger.userCanInsert = function(userId, doc) {
	return Users.isInRoles(userId, ["admin","user"]);
};

this.Messenger.userCanUpdate = function(userId, doc) {
	return false;
};

this.Messenger.userCanRemove = function(userId, doc) {
	return doc && (doc.fromUserId == userId || doc.toUserId == userId);
};
