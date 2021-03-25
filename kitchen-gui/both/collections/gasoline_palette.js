this.GasolinePalette = new Mongo.Collection("gasoline_palette");

this.GasolinePalette.userCanInsert = function(userId, doc) {
	return Users.isInRoles(userId, ["admin", "user"]);
}

this.GasolinePalette.userCanUpdate = function(userId, doc) {
	return userId && doc.createdBy == userId;
}

this.GasolinePalette.userCanRemove = function(userId, doc) {
	return userId && doc.createdBy == userId;
}
