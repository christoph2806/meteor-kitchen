/*
	options: {
		"to": "korponaic@gmail.com",
		"html": "<html><head></head><body>This is a test</body></html>",
		"text": "This is a test",
		"subject": "testSubject",
		"tags": [
			"some",
			"test",
			"tags"
		]
	}
*/

this.sendEmail = function(options, cb) {
	var mailOptions = JSON.parse(JSON.stringify(options));
	mailOptions.from = Accounts.emailTemplates.from;

	if(!MailGun) {
		var err = new Meteor.Error(500, "Mailgun API is not initialized.");
		if(cb) {
			cb(err);
			return;
		}
	}

	MailGun.api.messages().send(mailOptions, function(err, res) {
		if(err) {
			console.log("Error sending e-mail. Mailgun status code: " + err.statusCode);
		}

		if(cb) {
			cb(err, res);
			return;
		}
	});
};



/*
	options: {
		list: "users@meteorkitchen.com",
		user: {
			subscribed: true,
			address: 'petar.korponaic@gmail.com',
			name: 'Petar Korponaic',
			vars: { age: 40 },
			upsert: "yes"
		}
	}
*/

this.upsertUserToNewsletters = function(userId, options) {
	if(!MailGun) {
		throw new Meteor.Error(500, "Mailgun API is not initialized.");
	}


	var list = MailGun.api.lists(options.list);
	list.info(Meteor.bindEnvironment(function (err, res) {
		if(err) {
			console.log("Error reading mailing list info. Mailgun status code: " + err.statusCode);
		} else {
			list.members().create(options.user, Meteor.bindEnvironment(function (e, data) {
				if(e) {
					console.log("Error adding user to mailing list. Mailgun status code: " + e.statusCode);
				} else {
					Users.update({ _id: userId }, { $set: { "profile.subscribedToNewsletters": options.user.subscribed } });
				}
			}));
		}
	}));
};

this.subscribeUserToNewsletters = function(userId) {
	if(!MailGun) {
		throw new Meteor.Error(500, "Mailgun API is not initialized.");
	}

	var user = Users.findOne({ _id: userId });
	if(!user) {
		throw new Meteor.Error(500, "User not found.");
	}

	var options = {
		list: "users@meteorkitchen.com",
		user: {
			subscribed: true,
			address: user.emails[0].address,
			name: user.profile.name,
			upsert: "yes"
		}
	};

	upsertUserToNewsletters(userId, options);
};

this.unsubscribeUserToNewsletters = function(userId) {
	if(!MailGun) {
		throw new Meteor.Error(500, "Mailgun API is not initialized.");
	}

	var user = Users.findOne({ _id: userId });
	if(!user) {
		throw new Meteor.Error(500, "User not found.");
	}

	var options = {
		list: "users@meteorkitchen.com",
		user: {
			subscribed: false,
			address: user.emails[0].address,
			name: user.profile.name,
			upsert: "yes"
		}
	};

	upsertUserToNewsletters(userId, options);
};

Meteor.methods({
/*
	options: {
		"to": "korponaic@gmail.com",
		"html": "<html><head></head><body>This is a test</body></html>",
		"text": "This is a test",
		"subject": "testSubject",
		"tags": [
			"some",
			"test",
			"tags"
		]
	}
*/

	"sendEmail": function(options) {
		if(!MailGun) {
			throw new Meteor.Error(500, "Mailgun API is not initialized.");
		}

		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		var mailOptions = JSON.parse(JSON.stringify(options));
		mailOptions.from = Accounts.emailTemplates.from;


		this.unblock();

		MailGun.api.messages().send(mailOptions, function(err, res) {
			if(err) {
				console.log("Error sending e-mail. Mailgun status code: " + err.statusCode);
			}
		});
	},

	"subscribeUserToNewsletters": function() {
		subscribeUserToNewsletters(this.userId);
	},
	"unsubscribeUserToNewsletters": function() {
		unsubscribeUserToNewsletters(this.userId);
	},
	"getMailingList": function() {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		var csv = "";
		Users.find().map(function(user) {
			if(user.emails && user.emails.length && user.profile.subscribedToNewsletters) {
				if(csv) {
					csv += "\n";
				}

				csv += user.emails[0].address;
			}
		});

		return csv;
	}
});

