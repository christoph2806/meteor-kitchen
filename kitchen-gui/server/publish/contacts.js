Meteor.publish({
	"contacts": function() {
		if(!this.userId) {
			return this.ready();
		}

		var contacts = Contacts.find({ 
			$or: [
				{ fromUserId: this.userId },
				{ toUserId: this.userId }
			],

			blocked: false
		});

		return Contacts.publishJoinedCursors(contacts);
	},

	"contact": function(userId) {
		var contact = Contacts.find({
			$or: [
				{ fromUserId: userId, toUserId: this.userId },
				{ toUserId: userId, fromUserId: this.userId }
			]
		});

		return Contacts.publishJoinedCursors(contact);
	},

	"unreadContacts": function() {
		var contacts = Contacts.find({
			$or: [
				{ toUserId: this.userId, unreadMessagesTo: { $gt: 0 } },
				{ fromUserId: this.userId, unreadMessagesFrom: { $gt: 0 } }
			],

			blocked: false
		});

		return Contacts.publishJoinedCursors(contacts);		
	}
});
