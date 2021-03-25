var pageSession = new ReactiveDict();


Template.AdminNewslettersEditEditForm.rendered = function() {
	

	pageSession.set("adminNewslettersEditEditFormInfoMessage", "");
	pageSession.set("adminNewslettersEditEditFormErrorMessage", "");

	Meteor.defer(function() {
		this.$(".ui.dropdown").dropdown();

		this.$("input[type='text']").on("focus", function(e, t) {
			$(this).select();
		});

	});
};

Template.AdminNewslettersEditEditForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("adminNewslettersEditEditFormInfoMessage", "");
		pageSession.set("adminNewslettersEditEditFormErrorMessage", "");

		var self = this;

		function submitAction(result, msg) {
			var adminNewslettersEditEditFormMode = "update";
			if(!t.find("#form-cancel-button")) {
				switch(adminNewslettersEditEditFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("adminNewslettersEditEditFormInfoMessage", message);
					}; break;
				}
			}

			Router.go("admin.newsletters", {});
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("adminNewslettersEditEditFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				

				Meteor.call("newslettersUpdate", t.data.newsletter._id, values, function(e, r) { if(e) errorAction(e); else submitAction(r); });
			}
		);

		return false;
	},
	"click #form-cancel-button": function(e, t) {
		e.preventDefault();

		

		Router.go("admin.newsletters", {});
	},
	"click #form-close-button": function(e, t) {
		e.preventDefault();

		/*CLOSE_REDIRECT*/
	},
	"click #form-back-button": function(e, t) {
		e.preventDefault();

		/*BACK_REDIRECT*/
	}

	
});

Template.AdminNewslettersEditEditForm.helpers({
	"infoMessage": function() {
		return pageSession.get("adminNewslettersEditEditFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("adminNewslettersEditEditFormErrorMessage");
	},
	"mailingLists": function() {
		return MailingLists;
	}
});
