import {Meteor} from "meteor/meteor";
import {Users} from "meteor-user-roles";

export const userEmail = function(userId) {
	let user = userId ? Users.findOne({ _id: userId }) : Meteor.user();
	if(!user) {
		return "";
	}

	if(user.emails && user.emails.length) {
		return user.emails[0].address || "";
	}

	if(user.private && user.private.email) {
		return user.private.email;
	}

	return "";
};

export const userFullName = function(userId) {
	let user = userId ? Users.findOne({ _id: userId }) : Meteor.user();
	if(!user || !user.profile) {
		return "";
	}

	if(user.profile.firstName || user.profile.lastName) {
		return (user.profile.firstName || "") + (user.profile.lastName ? (" " + (user.profile.lastName || "")) : "");
	}
	return user.profile.name || "";
};
