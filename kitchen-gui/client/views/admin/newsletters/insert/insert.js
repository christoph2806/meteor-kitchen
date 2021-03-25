var pageSession = new ReactiveDict();

Template.AdminNewslettersInsert.rendered = function() {
	
	Meteor.defer(function() {
		$("input[autofocus]").focus();
	});
};

Template.AdminNewslettersInsert.events({
	
});

Template.AdminNewslettersInsert.helpers({
	
});

Template.AdminNewslettersInsertInsertForm.rendered = function() {
	

	pageSession.set("newslettersInsertInsertFormInfoMessage", "");
	pageSession.set("newslettersInsertInsertFormErrorMessage", "");

	Meteor.defer(function() {
		this.$(".ui.dropdown").dropdown();

		this.$("input[type='text']").on("focus", function(e, t) {
			$(this).select();
		});

	});


	$("input[autofocus]").focus();
};

Template.AdminNewslettersInsertInsertForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("newslettersInsertInsertFormInfoMessage", "");
		pageSession.set("newslettersInsertInsertFormErrorMessage", "");

		var self = this;

		function submitAction(result, msg) {
			var newslettersInsertInsertFormMode = "insert";
			if(!t.find("#form-cancel-button")) {
				switch(newslettersInsertInsertFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("newslettersInsertInsertFormInfoMessage", message);
					}; break;
				}
			}

			Router.go("admin.newsletters", {});
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("newslettersInsertInsertFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {
				if(fieldName == "email" && !fieldValue) {
					return "Please specify recipient.";
				}
			},
			function(msg) {

			},
			function(values) {
				
				var submitButton = t.$("#form-submit-button");
				submitButton.addClass("disabled loading");
				Meteor.call("newslettersInsert", values, function(e, r) { 
					submitButton.removeClass('disabled loading');

					if(e) errorAction(e); else submitAction(r); 
				});
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

Template.AdminNewslettersInsertInsertForm.helpers({
	"infoMessage": function() {
		return pageSession.get("newslettersInsertInsertFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("newslettersInsertInsertFormErrorMessage");
	},
	"mailingLists": function() {
		return MailingLists;
	}
});
