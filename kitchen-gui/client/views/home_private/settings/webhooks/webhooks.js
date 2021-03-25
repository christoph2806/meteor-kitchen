var pageSession = new ReactiveDict();


Template.HomePrivateSettingsWebhooksForm.rendered = function() {
	

	pageSession.set("homePrivateSettingsWebhooksFormInfoMessage", "");
	pageSession.set("homePrivateSettingsWebhooksFormErrorMessage", "");

	$("input[autofocus]").focus();
};

Template.HomePrivateSettingsWebhooksForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("homePrivateSettingsWebhooksFormInfoMessage", "");
		pageSession.set("homePrivateSettingsWebhooksFormErrorMessage", "");
		$(".error-text").addClass("hidden");
		$(".error-text").text("");

		var self = this;

		function submitAction(result, msg) {
			var homePrivateSettingsWebhooksFormMode = "update";
			if(!t.find("#form-cancel-button")) {
				switch(homePrivateSettingsWebhooksFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("homePrivateSettingsWebhooksFormInfoMessage", message);
					}; break;
				}
			}

			Router.go("home.settings.webhooks", { applicationId: t.data.application._id });
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("homePrivateSettingsWebhooksFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				$("#form-submit-button").addClass('disabled loading');

				Applications.update({ _id: t.data.application._id }, { $set: values }, function(e, r) { 
					$("#form-submit-button").removeClass('disabled loading');
					if(e) {
						errorAction(e);
					} else {
						submitAction(r);
					}
				});
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

		/*CLOSE_REDIRECT*/
	},
	"click #form-back-button": function(e, t) {
		e.preventDefault();

		/*BACK_REDIRECT*/
	},
	"change input[name='public']": function(e, t) {
		if(e.currentTarget) {
			pageSession.set("homePrivateInsertFormIsPublicApplication", $(e.currentTarget).is(":checked"));
		}
	},
	"focus input[name='slug'], blur input[name='slug']": function(e, t) {
		var nameInput = $("input[name='name']");
		var slugInput = $(e.currentTarget);
		var slug = slugInput.val();
		if(!slug) {
			slugInput.val(convertToSlug(nameInput.val()));
			var errorElem = $(".field-slug").find(".error-text.field-slug-error");
			errorElem.text("");
			errorElem.addClass("hidden");
		}
	},
	"keydown input[name='name']": function(e, t) {
		$(e.currentTarget).attr("data-old", $(e.currentTarget).val());
	},
	"input input[name='name']": function(e, t) {
		var nameInput = $(e.currentTarget);
		var slugInput = $("input[name='slug']");

		var oldVal = nameInput.attr("data-old");
		var slug = slugInput.val();

		if(!slug || slug == convertToSlug(oldVal)) {
			slugInput.val(convertToSlug(nameInput.val()));			
			var errorElem = $(".field-slug").find(".error-text.field-slug-error");
			errorElem.text("");
			errorElem.addClass("hidden");
		}
	},
	"input input[name='slug']": function(e, t) {
		var errorElem = $(".field-slug").find(".error-text.field-slug-error");
		errorElem.text("");
		errorElem.addClass("hidden");
	}
});

Template.HomePrivateSettingsWebhooksForm.helpers({
	"infoMessage": function() {
		return pageSession.get("homePrivateSettingsWebhooksFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("homePrivateSettingsWebhooksFormErrorMessage");
	}
});
