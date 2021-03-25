Template.Messenger.onRendered(function() {
	resizeContainer = function() {
		var container = $(".messenger-container");
		if(!container.length) {
			return;
		}
		container.css({ height: ($(window).height() - container.offset().top) + "px" });

		var footer = container.find(".scrollable-footer");

		$(".scrollable-area").each(function() {
			$(this).css({ width: $(this).closest(".column").width() + "px", height: (($(window).height() - $(this).offset().top) - footer.height()) + "px" });
			$(this).parent().css({ width: $(this).closest(".column").width() + "px" });
		});
	};

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeContainer();
	});


	Meteor.defer(function(){ 
		resizeContainer();
	});
});


Template.Messenger.events({
	"submit .add-contact-form": function(e, t) {
		e.preventDefault();

		var inputBox = $(e.currentTarget).find("input[type='text']");
		var username = inputBox.val();

		if(!username) {
			return;
		}

		Meteor.call("createContactByUsername", username, function(e, r) {
			if(e) {
				inputBox.focus();
				alert(e.message);
				return;
			}
			inputBox.val("");
			inputBox.focus();

			Router.go("messenger", { contactId: r });
		});
	}
});



Template.MessengerContacts.helpers({
	"gotContacts": function() {
		return this.contacts && this.contacts.count();
	}
});

Template.MessengerContacts.events({

});



Template.MessengerContactsItem.helpers({
	"itemClass": function() {
		var parentData = Template.parentData(1) || {};
		if(!parentData || !parentData.params) {
			return "";
		}

		return this._id == parentData.params.contactId ? "active": "";
	},

	"userData": function() {
		if(Meteor.userId() == this.fromUserId) {
			return this.toUser;
		}
		if(Meteor.userId() == this.toUserId) {
			return this.fromUser;
		}
		return {}
	},

	"unreadMessagesCount": function() {
		if(Meteor.userId() == this.toUserId) {
			return this.unreadMessagesTo || 0;
		}
		if(Meteor.userId() == this.fromUserId) {
			return this.unreadMessagesFrom || 0;
		}

		return 0;
	}
});

Template.MessengerContactsItem.events({
	"click .messenger-item": function(e, t) {
		e.preventDefault();
		Router.go("messenger", { contactId: this._id });
	}
});

Template.MessengerMain.onRendered(function() {
	var self = this;

	function scrollToBottom() {
		var scroller = self.$(".scrollable-area");
		scroller.scrollTop(scroller[0].scrollHeight - scroller[0].clientHeight);
	}

	function markMessagesAsRead() {
		Meteor.call("markMessagesAsRead", self.data.params.contactId);
	}

	this.autorun(function() {
		var messageCount = Messenger.find({ contactId: self.data.params.contactId }).count();

		if(messageCount) {
			scrollToBottom();

			markMessagesAsRead();
		}
	});

	Meteor.defer(function() {
		this.$("input[type='text']").focus();
	});
});

Template.MessengerMain.helpers({
	"gotMessages": function() {
		return this.messages && this.messages.count();
	},

	"groupedMessages": function() {
		var messages = this.messages.fetch();
		var groups = [];
		var lastFromUserId = null;
		var lastTime = null;
		var currentGroup = null;
		var groupAdded = false;
		messages.map(function(msg) {
			if(msg.fromUserId != lastFromUserId || ((lastTime && Math.abs(msg.createdAt.getTime() - lastTime.getTime())) / 1000) > 180) {
				if(currentGroup) {
					groups.push(currentGroup);
					groupAdded = true;
				}
				currentGroup = msg;
				currentGroup["list"] = [];
				lastFromUserId = msg.fromUserId;
				groupAdded = false;
			} else {
				currentGroup.list.push(msg.message);
			}
			lastTime = msg.createdAt;
		});

		if(!groupAdded && currentGroup) {
			groups.push(currentGroup);
		}

		return groups;
	},

	"userData": function() {
		if(Meteor.userId() == this.contact.fromUserId) {
			return this.contact.toUser;
		}
		if(Meteor.userId() == this.contact.toUserId) {
			return this.contact.fromUser;
		}
		return {}
	}
});

Template.MessengerMain.events({
	"submit .message-form": function(e, t) {
		e.preventDefault();

		var inputBox = $(e.currentTarget).find("input[type='text']");
		var message = inputBox.val();

		if(!message) {
			return;
		}

		Meteor.call("sendMessage", this.params.contactId, message, function(e, r) {
			if(e) {
				inputBox.focus();
				alert(e.message);
				return;
			}
			inputBox.val("");
			inputBox.focus();
		});
	}
});


Template.MessengerMainMessage.helpers({
	"userData": function() {
		var contact = Template.parentData(1).contact;
		if(!contact) {
			return {};
		}

		if(this.fromUserId == contact.fromUserId) {
			return contact.fromUser;
		}

		if(this.fromUserId == contact.toUserId) {
			return contact.toUser;
		}

		return {}
	}
});
