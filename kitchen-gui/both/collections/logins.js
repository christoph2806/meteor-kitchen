this.Logins = new Mongo.Collection("logins");

this.Logins.userCanInsert = function(userId, doc) {
	return Users.isInRoles(userId, ["admin","user"]);
};

this.Logins.userCanUpdate = function(userId, doc) {
	return false;
};

this.Logins.userCanRemove = function(userId, doc) {
	return false;
};
