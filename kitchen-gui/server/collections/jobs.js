Jobs.allow({
	insert: function (userId, doc) {
		return Jobs.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return Jobs.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return Jobs.userCanRemove(userId, doc);
	}
});

Jobs.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;
	doc.starCount = 0;

});

Jobs.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;

});

Jobs.before.remove(function(userId, doc) {
	
});

Jobs.after.insert(function(userId, doc) {

});

Jobs.after.update(function(userId, doc, fieldNames, modifier, options) {	

});

Jobs.after.remove(function(userId, doc) {
	Stars.remove({ jobId: doc._id });
});
