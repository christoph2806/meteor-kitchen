GasolinePalette.allow({
	insert: function (userId, doc) {
		return GasolinePalette.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return GasolinePalette.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return GasolinePalette.userCanRemove(userId, doc);
	}
});

GasolinePalette.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;

	if(!doc.originalCreatedBy) {
		doc.originalCreatedBy = userId;
	}

	if(!doc.originalId) {
		doc.originalId = doc._id;
	}
});

GasolinePalette.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;
});

GasolinePalette.before.remove(function(userId, doc) {
	
});

GasolinePalette.after.insert(function(userId, doc) {

});

GasolinePalette.after.update(function(userId, doc, fieldNames, modifier, options) {	

});

GasolinePalette.after.remove(function(userId, doc) {

});
