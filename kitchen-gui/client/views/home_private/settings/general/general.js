var pageSession = new ReactiveDict();


Template.HomePrivateSettingsGeneralForm.rendered = function() {
	

	pageSession.set("homePrivateSettingsGeneralFormInfoMessage", "");
	pageSession.set("homePrivateSettingsGeneralFormErrorMessage", "");

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

Template.HomePrivateSettingsGeneralForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("homePrivateSettingsGeneralFormInfoMessage", "");
		pageSession.set("homePrivateSettingsGeneralFormErrorMessage", "");
		$(".error-text").addClass("hidden");
		$(".error-text").text("");

		var self = this;

		function submitAction(result, msg) {
			var homePrivateSettingsGeneralFormMode = "update";
			if(!t.find("#form-cancel-button")) {
				switch(homePrivateSettingsGeneralFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("homePrivateSettingsGeneralFormInfoMessage", message);
					}; break;
				}
			}

			Router.go("home.settings.general", { applicationId: t.data.application._id });
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("homePrivateSettingsGeneralFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				if(values.slug != convertToSlug(values.slug)) {
					var errorElem = $(".field-slug").find(".error-text.field-slug-error");
					errorElem.text("Slug can contain only letters, numbers and dashes (no spaces, no symbols).");
					errorElem.removeClass("hidden");
					return false;
				}
				$("#form-submit-button").addClass('disabled loading');
				Meteor.call("appSlugIsUnique", t.data.application._id, values.slug, function(err, res) {
					$("#form-submit-button").removeClass('disabled loading');
					if(err) {
						errorAction(e);
					} else {
						if(!res) {
							$("input[name='slug']").focus();
							var errorElem = $(".field-slug").find(".error-text.field-slug-error");
							errorElem.text("Slug \"" + values.slug + "\" already exists.");
							errorElem.removeClass("hidden");
							return false;
						}
				
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

Template.HomePrivateSettingsGeneralForm.helpers({
	"infoMessage": function() {
		return pageSession.get("homePrivateSettingsGeneralFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("homePrivateSettingsGeneralFormErrorMessage");
	}
});
