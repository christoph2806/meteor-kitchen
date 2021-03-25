this.CMSContentCollection = new Mongo.Collection("cms_content");

CMSContentCollection.userCanInsert = function(userId, doc) {
	return Users.isAdmin(userId);
};

CMSContentCollection.userCanUpdate = function(userId, doc) {
	return Users.isAdmin(userId);
};

CMSContentCollection.userCanRemove = function(userId, doc) {
	return Users.isAdmin(userId);
};

this.CMSFileCollection = new FS.Collection("cms_files", {
	stores: [
		new FS.Store.GridFS("cms_files", {})
	]
});

CMSFileCollection.userCanInsert = function(userId, doc) {
	return Users.isAdmin(userId);
};

CMSFileCollection.userCanUpdate = function(userId, doc) {
	return Users.isAdmin(userId);
};

CMSFileCollection.userCanRemove = function(userId, doc) {
	return Users.isAdmin(userId);
};

CMSFileCollection.userCanDownload = function(userId, doc) {
	return true;
};
