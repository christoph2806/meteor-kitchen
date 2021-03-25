this.Newsletters = new Mongo.Collection("newsletters");

this.Newsletters.userCanInsert = function(userId, doc) {
	return Users.isInRoles(userId, ["admin"]);
}

this.Newsletters.userCanUpdate = function(userId, doc) {
	return Users.isInRoles(userId, ["admin"]);
}

this.Newsletters.userCanRemove = function(userId, doc) {
	return Users.isInRoles(userId, ["admin"]);
}
