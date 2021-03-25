import {Users} from "meteor-user-roles";

export const CMSContentCollection = new Mongo.Collection("cms_content");

CMSContentCollection.userCanInsert = function(userId, doc) {
	return Users.isAdmin(userId);
};

CMSContentCollection.userCanUpdate = function(userId, doc) {
	return Users.isAdmin(userId);
};

CMSContentCollection.userCanRemove = function(userId, doc) {
	return Users.isAdmin(userId);
};

