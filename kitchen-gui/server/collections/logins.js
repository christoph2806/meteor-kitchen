Logins.allow({
	insert: function (userId, doc) {
		return Logins.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return Logins.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return Logins.userCanRemove(userId, doc);
	}
});

Logins.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;
});

Logins.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;
});

Logins.before.remove(function(userId, doc) {
	
});

Logins.after.insert(function(userId, doc) {

});

Logins.after.update(function(userId, doc, fieldNames, modifier, options) {	

});

Logins.after.remove(function(userId, doc) {

});
