Meteor.publish({
	"messages": function(contactId) {
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


		return Messenger.find({ contactId: contactId });
	}
});
