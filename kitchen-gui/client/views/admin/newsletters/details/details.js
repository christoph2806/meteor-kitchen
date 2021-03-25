var pageSession = new ReactiveDict();

Template.AdminNewslettersDetailsDetailsForm.rendered = function() {

	pageSession.set("adminNewslettersDetailsDetailsFormInfoMessage", "");
	pageSession.set("adminNewslettersDetailsDetailsFormErrorMessage", "");

	$("input[autofocus]").focus();
};

Template.AdminNewslettersDetailsDetailsForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("adminNewslettersDetailsDetailsFormInfoMessage", "");
		pageSession.set("adminNewslettersDetailsDetailsFormErrorMessage", "");

		var self = this;

		function submitAction(result, msg) {
			var adminNewslettersDetailsDetailsFormMode = "read_only";
			if(!t.find("#form-cancel-button")) {
				switch(adminNewslettersDetailsDetailsFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("adminNewslettersDetailsDetailsFormInfoMessage", message);
					}; break;
				}
			}

			/*SUBMIT_REDIRECT*/
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("adminNewslettersDetailsDetailsFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				

				
			}
		);

		return false;
	},
	"click #form-cancel-button": function(e, t) {
		e.preventDefault();

		

		/*CANCEL_REDIRECT*/
	},
	"click #form-close-button": function(e, t) {
		e.preventDefault();

		Router.go("admin.newsletters", {});
	},
	"click #form-back-button": function(e, t) {
		e.preventDefault();

		Router.go("admin.newsletters", {});
	}	
});

Template.AdminNewslettersDetailsDetailsForm.helpers({
	"infoMessage": function() {
		return pageSession.get("adminNewslettersDetailsDetailsFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("adminNewslettersDetailsDetailsFormErrorMessage");
	}
	
});
