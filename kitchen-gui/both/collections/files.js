this.Files = new Mongo.Collection("files");

this.Files.userCanInsert = function(userId, doc) {
	return Users.isInRoles(userId, ["admin","user"]);
}

this.Files.userCanUpdate = function(userId, doc) {
	return userId && doc.createdBy == userId;
}

this.Files.userCanRemove = function(userId, doc) {
	return userId && doc.createdBy == userId;
}
