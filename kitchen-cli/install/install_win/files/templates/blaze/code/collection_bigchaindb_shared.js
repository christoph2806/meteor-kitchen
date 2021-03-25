var BigchainCollection = require("meteor-bigchain-collection").BigchainCollection;

this.COLLECTION_VAR = new BigchainCollection("COLLECTION_NAME");

this.COLLECTION_VAR.userCanInsert = function(userId, doc) {
	return INSERT_RULE;
};

this.COLLECTION_VAR.userCanUpdate = function(userId, doc) {
	return UPDATE_RULE;
};

this.COLLECTION_VAR.userCanRemove = function(userId, doc) {
	return REMOVE_RULE;
};
