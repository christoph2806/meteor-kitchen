this.GasolinePaletteGroups = new Mongo.Collection("gasoline_palette_groups");

this.GasolinePaletteGroups.userCanInsert = function(userId, doc) {
	return Users.isInRoles(userId, ["admin"]);
}

this.GasolinePaletteGroups.userCanUpdate = function(userId, doc) {
	return Users.isInRoles(userId, ["admin"]);
}

this.GasolinePaletteGroups.userCanRemove = function(userId, doc) {
	return Users.isInRoles(userId, ["admin"]);
}
