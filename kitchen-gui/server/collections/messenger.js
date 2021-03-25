Messenger.allow({
	insert: function (userId, doc) {
		return Messenger.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return Messenger.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return Messenger.userCanRemove(userId, doc);
	}
});

Messenger.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;
});

Messenger.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;
});

Messenger.before.remove(function(userId, doc) {
	
});

Messenger.after.insert(function(userId, doc) {

});

Messenger.after.update(function(userId, doc, fieldNames, modifier, options) {	
	if(modifier.$set && modifier.$set.unread) {
		var unreadCount = Messenger.find({ contactId: doc.contactId, toUserId: doc.toUserId, unread: true }, { fields: { _id: true } }).count();
		Contacts.update({ _id: doc.contactId, fromUserId: doc.toUserId }, { $set: { unreadMessagesFrom: unreadCount }});
		Contacts.update({ _id: doc.contactId, toUserId: doc.toUserId }, { $set: { unreadMessagesTo: unreadCount }});
	}
});

Messenger.after.remove(function(userId, doc) {

});
