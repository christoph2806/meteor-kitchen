import {Meteor} from "meteor/meteor";

export const userEmail = function() {
	let user = Meteor.user();
	if(!user) {
		return "";
	}

	if(user.emails && user.emails.length) {
		return user.emails[0].address || "";
	}

	if(user.profile && user.profile.email) {
		return user.profile.email;
	}

	return "";
};

export const userFullName = function() {
	let user = Meteor.user();
	if(!user || !user.profile) {
		return "";
	}

	if(Meteor.user().profile.firstName || Meteor.user().profile.lastName) {
		return Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName;
	} else {
		return Meteor.user().profile.name || "";
	}
};
