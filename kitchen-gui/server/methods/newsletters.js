Meteor.methods({
	"newslettersInsert": function(data) {
		if(!Newsletters.userCanInsert(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		Newsletters.insert({
			email: data.email || "",
			subject: data.subject || "",
			body: data.body || "",
			status: "new",
			error: ""
		});
	},

	"newslettersUpdate": function(newsletterId, data) {
		if(!Newsletters.userCanUpdate(this.userId, {})) {
			throw new Meteor.Error(403, "Access denied");
		}

		Newsletters.update({ _id: newsletterId }, { $set: data });
	},

	"sendNewsletter": function(newsletterId) {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		var newsletter = Newsletters.findOne({ _id: newsletterId });
		if(!newsletter) {
			throw new Meteor.Error(401, "Newsletter not found.");
		}

		if(newsletter.status == "sent") {
			throw new Meteor.Error(401, "Newsletter already sent.");
		}

		Newsletters.update({ _id: newsletterId }, { $set: { status: "sending" }});

		var options = {
			to: newsletter.email,
			subject: newsletter.subject,
			html: newsletter.html,
//			text: newsletter.body,
			tags: [
			]
		};

		this.unblock();

		Meteor.call("sendEmail", options, function(e, r) {
			if(e) {
				Newsletters.update({ _id: newsletterId }, { $set: { status: "error", error: e.message }});
				return;
			}

			Newsletters.update({ _id: newsletterId }, { $set: { status: "sent" }});
		});
	}
});
