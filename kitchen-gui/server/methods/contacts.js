var createContact = function(thisUserId, toUserId) {
	var fromUser = Users.findOne({ _id: thisUserId });
	if(!fromUser) {
		throw new Meteor.Error("Unknown User");
	}

	var toUser = Users.findOne({ _id: toUserId });
	if(!toUser) {
		throw new Meteor.Error("Unknown User");
	}

	if(fromUser._id == toUser._id) {
		throw new Meteor.Error("Self reference");
	}

	var oldContact = Contacts.findOne({
		$or: [
			{ fromUserId: toUserId, toUserId: thisUserId },
			{ toUserId: toUserId, fromUserId: thisUserId }
		]
	});

	if(oldContact) {
		return oldContact._id;
	}

	return Contacts.insert({
		fromUserId: thisUserId,
		toUserId: toUserId,
		blocked: false
	});
};

Meteor.methods({
	"createContact": function(toUserId) {
		return createContact(this.userId, toUserId);
	},

	"createContactByUsername": function(username) {
		var user = Users.findOne({ username: username });
		if(!user) {
			throw new Meteor.Error("Unknown User");
		}
		return createContact(this.userId, user._id);
	}
});
