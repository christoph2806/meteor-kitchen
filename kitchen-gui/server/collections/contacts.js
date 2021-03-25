Contacts.allow({
	insert: function (userId, doc) {
		return Contacts.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return Contacts.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return Contacts.userCanRemove(userId, doc);
	}
});

Contacts.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;
});

Contacts.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;
});

Contacts.before.remove(function(userId, doc) {
	
});

Contacts.after.insert(function(userId, doc) {

});

Contacts.after.update(function(userId, doc, fieldNames, modifier, options) {	
	// mark all messages as read for this contact
	if(modifier.$set) {
		if(typeof modifier.$set.unreadMessagesFrom != "undefined" && modifier.$set.unreadMessagesFrom == 0) {
			Messenger.update({ contactId: doc._id, toUserId: doc.fromUserId, $or: [ { unread: true }, { unread: null } ] }, { $set: { unread: false } }, { multi: true });
		}

		if(typeof modifier.$set.unreadMessagesTo != "undefined" && modifier.$set.unreadMessagesTo == 0) {
			Messenger.update({ contactId: doc._id, toUserId: doc.toUserId, $or: [ { unread: true }, { unread: null } ] }, { $set: { unread: false } }, { multi: true });
		}

	}
});

Contacts.after.remove(function(userId, doc) {

});
