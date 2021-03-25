this.Blog = new Mongo.Collection("blog");

this.Blog.userCanInsert = function(userId, doc) {
	return Users.isInRoles(userId, ["admin"]);
}

this.Blog.userCanUpdate = function(userId, doc) {
	return Users.isInRoles(userId, ["admin"]);
}

this.Blog.userCanRemove = function(userId, doc) {
	return Users.isInRoles(userId, ["admin"]);
}
