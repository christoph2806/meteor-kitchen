import {Users} from "meteor-user-roles";

export const EditableContentCollection = new Mongo.Collection("editable_content");

EditableContentCollection.userCanInsert = function(userId, doc) {
	return Users.isAdmin(userId);
};

EditableContentCollection.userCanUpdate = function(userId, doc) {
	return Users.isAdmin(userId);
};

EditableContentCollection.userCanRemove = function(userId, doc) {
	return Users.isAdmin(userId);
};

