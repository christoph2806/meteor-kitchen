Blog.allow({
	insert: function (userId, doc) {
		return Blog.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return Blog.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return Blog.userCanRemove(userId, doc);
	}
});

Blog.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;
});

Blog.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;
});

Blog.before.remove(function(userId, doc) {
	
});

Blog.after.insert(function(userId, doc) {

});

Blog.after.update(function(userId, doc, fieldNames, modifier, options) {	

});

Blog.after.remove(function(userId, doc) {

});
