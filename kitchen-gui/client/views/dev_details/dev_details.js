Template.DevDetails.events({
	"click .contact-me-button": function() {
		Meteor.call("createContact", this.user._id, function(e, r) {
			if(e) {
				alert(e.message);
				return;
			}
			Router.go("messenger", { contactId: r });
		});
	},

	"click .login-first-button": function() {
		confirmationBox("Contact", "You must be logged into Meteor Kitchen in order to proceed.", function() {
			Router.go("login", {});
		}, function() {

		}, {
			approveButtonTitle: "Login",
			denyButtonTitle: "Cancel"
		});
	}
});

Template.DevDetails.helpers({
	"canContactUser": function() {
		return this.user && Meteor.user() && Meteor.userId() && this.user._id != Meteor.userId() && (!this.contact || (this.contact && !this.contact.blocked));
	}
});


Template.DevDetailsMenu.events({
});

Template.DevDetailsMenu.helpers({
});
