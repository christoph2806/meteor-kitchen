Files.allow({
	insert: function (userId, doc) {
		return Files.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return Files.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return Files.userCanRemove(userId, doc);
	}
});

Files.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;
});

Files.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;
});

Files.before.remove(function(userId, doc) {
	
});

Files.after.insert(function(userId, doc) {

});

Files.after.update(function(userId, doc, fieldNames, modifier, options) {	

});

Files.after.remove(function(userId, doc) {

});
