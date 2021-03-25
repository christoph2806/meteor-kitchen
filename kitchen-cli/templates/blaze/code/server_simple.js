Meteor.startup(function() {
	// read environment variables from Meteor.settings
	if(Meteor.settings && Meteor.settings.env && _.isObject(Meteor.settings.env)) {
		for(var variableName in Meteor.settings.env) {
			process.env[variableName] = Meteor.settings.env[variableName];
		}
	}

	/*SERVER_STARTUP_CODE*/
});

Meteor.methods({
	"detectUsersCountryCode": function() {
		var ip = null;
		if (this.connection) {
			ip = this.connection.clientAddress || null;
			if (!ip && this.connection.httpHeaders) {
				ip = this.connection.httpHeaders["x-forwarded-for"] || null;
			}
		}

		if (!ip) {
			return "";
		}

		var res = HTTP.get("https://ipinfo.io/" + ip);
		if(res && res.statusCode == 200 && res.data && !res.data.bogon) {
			return res.data.country;
		}

		return "";
	},

	/* DANGER! */
	"sendMail": function(options) {
		this.unblock();

		Email.send(options);
	}
});