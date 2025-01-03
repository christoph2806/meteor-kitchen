var pageSession = new ReactiveDict();


Template.AdminUsersEditEditForm.rendered = function() {
	

	pageSession.set("adminUsersEditEditFormInfoMessage", "");
	pageSession.set("adminUsersEditEditFormErrorMessage", "");

	$(".input-group.date").each(function() {
		var format = $(this).find("input[type='text']").attr("data-format");

		if(format) {
			format = format.toLowerCase();
		}
		else {
			format = "mm/dd/yyyy";
		}

		$(this).datepicker({
			autoclose: true,
			todayHighlight: true,
			todayBtn: true,
			forceParse: false,
			keyboardNavigation: false,
			format: format
		});
	});

	$("input[autofocus]").focus();
};

Template.AdminUsersEditEditForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("adminUsersEditEditFormInfoMessage", "");
		pageSession.set("adminUsersEditEditFormErrorMessage", "");

		var self = this;

		function submitAction(result, msg) {
			var adminUsersEditEditFormMode = "update";
			if(!t.find("#form-cancel-button")) {
				switch(adminUsersEditEditFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("adminUsersEditEditFormInfoMessage", message);
					}; break;
				}
			}

			Router.go("admin.users", {});
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("adminUsersEditEditFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				

				Meteor.call("updateUserAccount", t.data.admin_user._id, values, function(e, r) { if(e) errorAction(e); else submitAction(r); });
			}
		);

		return false;
	},
	"click #form-cancel-button": function(e, t) {
		e.preventDefault();

		

		Router.go("admin.users", {});
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

Template.AdminUsersEditEditForm.helpers({
	"infoMessage": function() {
		return pageSession.get("adminUsersEditEditFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("adminUsersEditEditFormErrorMessage");
	}
	
});
