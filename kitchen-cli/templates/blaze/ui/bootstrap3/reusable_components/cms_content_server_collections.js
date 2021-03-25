CMSContentCollection.allow({
    insert: function (userId, doc) {
        return false;
    },

    update: function (userId, doc, fields, modifier) {
        return false;
    },

    remove: function (userId, doc) {
        return false;
    }
});

CMSContentCollection.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;

	
	if(!doc.createdBy) doc.createdBy = userId;
});

CMSContentCollection.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;

	
});

CMSContentCollection.before.upsert(function(userId, selector, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;
});


CMSFileCollection.allow({
	insert: function (userId, doc) {
		return CMSFileCollection.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return CMSFileCollection.userCanUpdate(userId, doc, fields, modifier);
	},

	remove: function (userId, doc) {
		return CMSFileCollection.userCanRemove(userId, doc);
	},

	download: function (userId, doc) {
		return CMSFileCollection.userCanDownload(userId, doc);
	}
});
