/*IMPORTS*/

export const COLLECTION_VAR = new FS.Collection("COLLECTION_NAME", {
	stores: [FS_STORE_LIST]
});

COLLECTION_VAR.userCanInsert = function(userId, doc) {
	return INSERT_RULE;
};

COLLECTION_VAR.userCanUpdate = function(userId, doc) {
	return UPDATE_RULE;
};

COLLECTION_VAR.userCanRemove = function(userId, doc) {
	return REMOVE_RULE;
};

COLLECTION_VAR.userCanDownload = function(userId, doc) {
	return DOWNLOAD_RULE;
};
