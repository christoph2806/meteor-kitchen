GasolinePaletteGroups.allow({
	insert: function (userId, doc) {
		return GasolinePaletteGroups.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return GasolinePaletteGroups.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return GasolinePaletteGroups.userCanRemove(userId, doc);
	}
});

GasolinePaletteGroups.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;
});

GasolinePaletteGroups.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;
});

GasolinePaletteGroups.before.remove(function(userId, doc) {
	
});

GasolinePaletteGroups.after.insert(function(userId, doc) {

});

GasolinePaletteGroups.after.update(function(userId, doc, fieldNames, modifier, options) {	

});

GasolinePaletteGroups.after.remove(function(userId, doc) {

});
