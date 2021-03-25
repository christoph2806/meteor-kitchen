global.sendUnreadMessagesEmails = function() {
	var notifyUsers = {};

	var unreadMessages = Messenger.find({
		notified: { 
			$ne: true 
		},
		notifyError: {
			$ne: true
		},
		unread: true
	}, { fields: { toUserId: true } }).map(function(doc) {
		if(notifyUsers[doc.toUserId]) {
			notifyUsers[doc.toUserId]++;
		} else {
			notifyUsers[doc.toUserId] = 1;
		}
	});

	for(var userId in notifyUsers) {
		var user = Users.findOne({ _id: userId });
		if(user && user.emails && user.emails.length && user.profile) {
			Messenger.update({ toUserId: userId, unread: true, notified: { $ne: true } }, { $set: { notified: true, notifyError: false }}, { multi: true });
			if(user.profile.subscribedToUnreadMessages || typeof user.profile.subscribedToUnreadMessages == "undefined") {
				var options = {
					to: user.emails[0].address,
					text: "Hello " + user.profile.name + ",\n\nYou have " + notifyUsers[userId] + " unread messages in Meteor Kitchen Messenger.\n\nPlease login into https://www.meteorkitchen.com/ to see the messages.\n\nIf you want to stop receiving this notification then please goto your profile setings -> notifications, and turn off \"Receive unread messages notifications via e-mail\" switch.",
					subject: "You have " + notifyUsers[userId] + " unread messages",
					tags: [
						"unreadMessages"
					]
				}

				console.log("Sending unread messages notification e-mail to " + options.to + "...");

				sendEmail(options);
			}
		}


	}

};


Meteor.methods({
	"sendMessage": function(contactId, message) {

		var contact = Contacts.findOne({
			_id: contactId,

			$or: [
				{ fromUserId: this.userId },
				{ toUserId: this.userId }
			],

			blocked: false
		});

		if(!contact) {
			return this.ready();
		}
		
		var toUserId = contact.fromUserId == this.userId ? contact.toUserId : contact.fromUserId;

		var messageId = Messenger.insert({
			contactId: contactId,
			fromUserId: this.userId,
			toUserId: toUserId,
			message: message
		});

		// --- 
		// if dest user did not mark message as "unread: false" after 2 seconds, mark message as "unread: true"
		// ---
		Meteor.setTimeout(function() {
			var writtenMessage = Messenger.findOne({ _id: messageId });
			if(!writtenMessage) {
				return;
			}

			if(typeof writtenMessage.unread == "undefined") {
				Messenger.update({ _id: messageId }, { $set: { unread: true } });
			}
		}, 2000);

		return messageId;
	},

	"markMessagesAsRead": function(contactId) {
		if(!this.userId) {
			return;
		}

		Contacts.update({ _id: contactId, fromUserId: this.userId }, { $set: { unreadMessagesFrom: 0 }});
		Contacts.update({ _id: contactId, toUserId: this.userId }, { $set: { unreadMessagesTo: 0 }});
	},

	"subscribeUserToUnreadMessages": function() {
		if(!this.userId) {
			return;
		}
		Users.update({ _id: this.userId }, { $set: { "profile.subscribedToUnreadMessages": true } });
	},

	"unsubscribeUserToUnreadMessages": function() {
		if(!this.userId) {
			return;
		}
		Users.update({ _id: this.userId }, { $set: { "profile.subscribedToUnreadMessages": false } });		
	}
});
