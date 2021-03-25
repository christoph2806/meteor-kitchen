import {Users} from "meteor-user-roles";
/*IMPORTS*/

Meteor.startup(function() {
	// read environment variables from Meteor.settings
	if(Meteor.settings && Meteor.settings.env) {
		for(var variableName in Meteor.settings.env) {
			process.env[variableName] = Meteor.settings.env[variableName];
		}
	}

	//
	// Setup OAuth login service configuration (read from Meteor.settings)
	//
	// Your settings file should look like this:
	//
	// {
	//     "oauth": {
	//         "google": {
	//             "clientId": "yourClientId",
	//             "secret": "yourSecret"
	//         },
	//         "github": {
	//             "clientId": "yourClientId",
	//             "secret": "yourSecret"
	//         }
	//         "linkedin": {
	//             "clientId": "yourClientId",
	//             "secret": "yourSecret"
	//         }
	//     }
	// }
	//
	if(Accounts && Accounts.loginServiceConfiguration && Meteor.settings && Meteor.settings.oauth) {
		// google
		if(Meteor.settings.oauth.google) {
			// remove old configuration
			Accounts.loginServiceConfiguration.remove({
				service: "google"
			});

			var settingsObject = Meteor.settings.oauth.google;
			settingsObject.service = "google";

			// add new configuration
			Accounts.loginServiceConfiguration.insert(settingsObject);
		}
		// github
		if(Meteor.settings.oauth.github) {
			// remove old configuration
			Accounts.loginServiceConfiguration.remove({
				service: "github"
			});

			var settingsObject = Meteor.settings.oauth.github;
			settingsObject.service = "github";

			// add new configuration
			Accounts.loginServiceConfiguration.insert(settingsObject);
		}
		// linkedin
		if(Meteor.settings.oauth.linkedin) {
			// remove old configuration
			Accounts.loginServiceConfiguration.remove({
				service: "linkedin"
			});

			var settingsObject = Meteor.settings.oauth.linkedin;
			settingsObject.service = "linkedin";

			// add new configuration
			Accounts.loginServiceConfiguration.insert(settingsObject);
		}
		// facebook
		if(Meteor.settings.oauth.facebook) {
			// remove old configuration
			Accounts.loginServiceConfiguration.remove({
				service: "facebook"
			});

			var settingsObject = Meteor.settings.oauth.facebook;
			settingsObject.service = "facebook";

			// add new configuration
			Accounts.loginServiceConfiguration.insert(settingsObject);
		}
		// twitter
		if(Meteor.settings.oauth.twitter) {
			// remove old configuration
			Accounts.loginServiceConfiguration.remove({
				service: "twitter"
			});

			var settingsObject = Meteor.settings.oauth.twitter;
			settingsObject.service = "twitter";

			// add new configuration
			Accounts.loginServiceConfiguration.insert(settingsObject);
		}
		// meteor
		if(Meteor.settings.oauth.meteor) {
			// remove old configuration
			Accounts.loginServiceConfiguration.remove({
				service: "meteor-developer"
			});

			var settingsObject = Meteor.settings.oauth.meteor;
			settingsObject.service = "meteor-developer";

			// add new configuration
			Accounts.loginServiceConfiguration.insert(settingsObject);
		}
	}

	/*SERVER_STARTUP_CODE*/
});


var verifyEmail = SEND_VERIFICATION_EMAIL;

Accounts.config({ sendVerificationEmail: verifyEmail });

Accounts.onCreateUser(function (options, user) {
	user.roles = [/*DEFAULT_ROLE*/];

	if(options.profile) {
		user.profile = options.profile;
	}

	/*ON_USER_CREATED_CODE*/
	return user;
});

Accounts.validateLoginAttempt(function(info) {
	// reject users with role "blocked"
	if(info.user && Users.isInRole(info.user._id, "blocked")) {
		throw new Meteor.Error(403, "Your account is blocked.");
	}

	// reject user without verified e-mail address
	if(verifyEmail && info.user && info.user.emails && info.user.emails.length && !info.user.emails[0].verified) {
		throw new Meteor.Error(499, "E-mail not verified.");
	}

	return true;
});

Accounts.onLogin(function (info) {
	/*ON_USER_LOGGED_CODE*/
});

Accounts.urls.resetPassword = function (token) {
	return Meteor.absoluteUrl('reset_password/' + token);
};

Accounts.urls.verifyEmail = function (token) {
	return Meteor.absoluteUrl('verify_email/' + token);
};

Accounts.urls.enrollAccount = function (token) {
	return Meteor.absoluteUrl('create_password/' + token);
};

Meteor.methods({
	"updateUserAccount": function(userId, data) {
		if(!data || !Object.keys(data).length) {
			return;
		}

		// Only admin or owner
		if(!(Users.isAdmin(this.userId) || userId == this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		// non-admin user can change only .profile, .private and .public
		var userData = JSON.parse(JSON.stringify(data));
		if(!Users.isAdmin(this.userId)) {
			let allowedKeys = ["profile", "private", "public"];
			for(var key in userData) {
				if(allowedKeys.indexOf(key) < 0) {
					throw new Meteor.Error(403, "You are not allowed to modify \"" + key + "\".");
				}
			}
		}

		// flatten: convert { x: { y: "val" }} into { "x.y": "val" }
		for(var key in userData) {
			var obj = userData[key];
			if(_.isObject(obj)) {
				for(var k in obj) {
					userData[key + "." + k] = obj[k];
				}
				delete userData[key];
			}
		}

		// update
		Users.update(userId, { $set: userData });
	}
});
