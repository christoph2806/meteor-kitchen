this.MailGun = null;

var verifyEmail = true;

Accounts.config({ sendVerificationEmail: verifyEmail });

Meteor.startup(function() {
	Accounts.emailTemplates.siteName = "Meteor Kitchen";
	Accounts.emailTemplates.from = "Meteor Kitchen <noreply@meteorkitchen.com>";

	// read environment variables from Meteor.settings
	if(Meteor.settings) {
 		if(Meteor.settings.env && _.isObject(Meteor.settings.env)) {
			for(var variableName in Meteor.settings.env) {
				process.env[variableName] = Meteor.settings.env[variableName];
			}
		}

		if(Meteor.settings.mailgun) {
			MailGun = new Mailgun(Meteor.settings.mailgun);
		}
	}

	// indexes
	Applications._ensureIndex({ createdAt: -1 });
	Users._ensureIndex({ createdAt: -1 });
});

Accounts.onCreateUser(function (options, user) {
	user.roles = ["user"];

	if(!Users.findOne({ roles: "admin" }) && user.roles.indexOf("admin") < 0) {
		user.roles.push("admin");
	}

	if(options.profile) {
		user.profile = options.profile;
	}

	user.profile = user.profile || {};

	user.profile.availableForHire = false;
	user.profile.devProfile = user.profile.devProfile || {
		cvURL: "",
		team: false,
		teamSize: 2,
		devType: [],
		selfRating: "beginner",
		uiFrameworks: [],
		stack: "frontend",
		progLangs: [],
		os: []
	};

	user.profile.public = true;
	user.profile.subscribedToUnreadMessages = true;

	return user;
});

Accounts.validateLoginAttempt(function(info) {

	// reject users with role "blocked"
	if(info.user && Users.isInRole(info.user._id, "blocked")) {
		throw new Meteor.Error(403, "Your account is blocked.");
	}

	if(verifyEmail && info.user && info.user.emails && info.user.emails.length && !info.user.emails[0].verified ) {
		throw new Meteor.Error(499, "E-mail not verified.");
	}

	return true;
});


Accounts.onLogin(function (info) {
	if(info.user.profile && !info.user.profile.hasOwnProperty("subscribedToNewsletters")) {
		subscribeUserToNewsletters(info.user._id, function(e, r) {

		});
	}

	var lastLogin = info.user.stats ? info.user.stats.lastLogin : null;
	if(!lastLogin || ((new Date().getTime() - lastLogin.getTime()) / 1000) > 3) {
		Users.update({ _id: info.user._id }, { $inc: { "stats.loginCount": 1 }, $set: { "stats.lastLogin": new Date() } });
		var date = new Date();
		date.setHours(0, 0, 0, 0);
		Logins.update({ userId: info.user._id, date: date }, { $set: { userId: info.user._id, date: date } , $inc: { count: 1 } }, { upsert: true });
	}
});


Users.before.insert(function(userId, doc) {
	doc.profile.username = doc.username || "";
	doc.profile.publicProjectCount = doc.profile.publicProjectCount || 0;

	if(doc.emails && doc.emails[0] && doc.emails[0].address) {
		doc.profile = doc.profile || {};
		doc.profile.email = doc.emails[0].address;
	}

	if(!doc.secret) {
		doc.secret = {};
	}
});


Users.before.update(function(userId, doc, fieldNames, modifier, options) {
	if(modifier.$set) {
		if(modifier.$set.profile) {
			var profile = modifier.$set.profile;
			delete modifier.$set.profile;
			for(var key in profile) {
				modifier.$set["profile." + key] = profile[key];
			}
		}

		if(modifier.$set.emails && modifier.$set.emails.length && modifier.$set.emails[0].address) {
			modifier.$set["profile.email"] = modifier.$set.emails[0].address;
		}

		if(modifier.$set.username) {
			modifier.$set["profile.username"] = modifier.$set.username;
		}

		if(modifier.$set["secret.ip"] && !doc.profile.country) {
			modifier.$set["profile.country"] = modifier.$set["secret.ip"].country;
		}
	}
});

Users.after.remove(function(userId, doc) {
	Applications.remove({ createdBy: userId });

	Messenger.remove({ fromUserId: userId });
	Messenger.remove({ toUserId: userId });

	Contacts.remove({ fromUserId: userId });
	Contacts.remove({ toUserId: userId });

	GasolinePalette.remove({ createdBy: userId });
	GasolinePaletteGroups.remove({ createdBy: userId });

	Jobs.remove({ createdBy: userId });

//	Logins.remove({ userId: userId });

	Stars.remove({ createdBy: userId });

	unsubscribeUserToNewsletters(userId);
});

Accounts.urls.resetPassword = function (token) {
	return Meteor.absoluteUrl('reset_password/' + token);
};

Accounts.urls.verifyEmail = function (token) {
	return Meteor.absoluteUrl('verify_email/' + token);
};
