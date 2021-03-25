Template.AppDetails.events({
	"click .star-button": function(e, t) {
		e.preventDefault();
		$(".star-button").addClass('disabled loading');
		Meteor.call("toggleStarApplication", this.application._id, function(err, res) {
			$(".star-button").removeClass('disabled loading');
			if(err) {
				alert(err.message);
				return false;
			}
		});
		return false;
	},
	"click .fork-button": function(e, t) {
		e.preventDefault();
		Router.go("home.insert", { forkedAppId: this.application._id });
		return false;
	},
	"click .designer-button": function(e, t) {
		e.preventDefault();
		Router.go("home.edit", { applicationId: this.application._id });
		return false;
	},
	"click .settings-button": function(e, t) {
		e.preventDefault();
		Router.go("home.settings", { applicationId: this.application._id });
		return false;
	},

	"click .login-first-button": function() {
		confirmationBox("Login", "You must be logged into Meteor Kitchen in order to proceed.", function() {
			Router.go("login", {});
		}, function() {

		}, {
			approveButtonTitle: "Login",
			denyButtonTitle: "Cancel"
		});
	}
});

Template.AppDetails.helpers({
	"userOwnsApplication": function() {
		return !!Meteor.userId() && this.application && this.application.createdBy == Meteor.userId();
	},
	"userCanForkApplication": function() {
		return !!Meteor.userId();
	},
	"userCanStarApplication": function() {
		return !!Meteor.userId();
	},
	"starredByMe": function() {
		if(!this.application) {
			return false;
		}

		var userId = Meteor.userId();
		if(!userId) {
			return false;
		}

		var starredByMe = Stars.findOne({
			applicationId: this.application._id,
			createdBy: userId
		});

		return !!starredByMe;
	}
});


Template.AppDetailsMenu.events({
});

Template.AppDetailsMenu.helpers({
});
