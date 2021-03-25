this.Stars = new Mongo.Collection("stars");

this.Stars.userCanInsert = function(userId, doc) {
	return Users.isInRoles(userId, ["admin","user"]);
}

this.Stars.userCanUpdate = function(userId, doc) {
	return userId && doc.createdBy == userId;
}

this.Stars.userCanRemove = function(userId, doc) {
	return userId && doc.createdBy == userId;
}
