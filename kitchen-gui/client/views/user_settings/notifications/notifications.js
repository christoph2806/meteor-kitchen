Template.UserSettingsNotifications.rendered = function() {
	Meteor.defer(function() {
		$(".ui.checkbox").checkbox();

		$("input[name='newsletters']").on("change", function(e) {
			if($(this).is(":checked")) {
				Meteor.call("subscribeUserToNewsletters");
			} else {
				Meteor.call("unsubscribeUserToNewsletters");
			}
		});

		$("input[name='unread-messages']").on("change", function(e) {
			if($(this).is(":checked")) {
				Meteor.call("subscribeUserToUnreadMessages");
			} else {
				Meteor.call("unsubscribeUserToUnreadMessages");
			}
		});
	});
};

Template.UserSettingsNotifications.helpers({
	"newslettersChecked": function() {
		var user = Meteor.user();
		if(!user) {
			return "";
		}
		return user.profile.subscribedToNewsletters ? "checked" : "";
	},

	"unreadMessagesChecked": function() {
		var user = Meteor.user();
		if(!user) {
			return "";
		}
		return user.profile.subscribedToUnreadMessages ? "checked" : "";
	}

});
