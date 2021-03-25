this.Jobs = new Mongo.Collection("jobs");

this.Jobs.userCanInsert = function(userId, doc) {
	return Users.isInRoles(userId, ["admin","user"]);
};

this.Jobs.userCanUpdate = function(userId, doc) {
	return userId && doc.createdBy == userId;
};

this.Jobs.userCanRemove = function(userId, doc) {
	return userId && doc.createdBy == userId;
};
