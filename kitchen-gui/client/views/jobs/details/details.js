Template.JobsDetails.rendered = function() {

};

Template.JobsDetails.helpers({
	"userOwnsJob": function() {
		return !!Meteor.userId() && this && this.createdBy == Meteor.userId();
	},
	"starIconClass": function() {
		if(!Meteor.userId()) {
			return "";
		}

		var starredByMe = Stars.findOne({
			jobId: this._id,
			createdBy: Meteor.userId()
		});
		return starredByMe ? "active" : "";
	},

	isExpanded: function() {
		var parentData = Template.parentData();

		if(!parentData.expandedItemsVariable) {
			return false;
		}

		var expandedItems = Session.get(parentData.expandedItemsVariable) || [];
		return expandedItems.indexOf(this._id) >= 0;
	},
	"userCanStarJob": function() {
		return !!Meteor.userId();
	},
	"starredByMe": function() {
		if(!this) {
			return false;
		}

		var userId = Meteor.userId();
		if(!userId) {
			return false;
		}
		var starredByMe = Stars.findOne({
			jobId: this._id,
			createdBy: userId
		});

		return !!starredByMe;
	},
	"canContactUser": function() {
		return Meteor.user() && this.createdBy != Meteor.userId();
	}
});

Template.JobsDetails.events({
	"click .star-button": function(e, t) {
		e.preventDefault();
		if(Meteor.userId()) {
			Meteor.call("toggleStarJob", this._id, function(err, res) {
				if(err) {
					alert(err.message);
					return false;
				}
			});
		}
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
	},

	"click .contact-me-button": function() {
		Meteor.call("createContact", this.createdBy, function(e, r) {
			if(e) {
				alert(e.message);
				return;
			}
			Router.go("messenger", { contactId: r });
		});
	}
});
