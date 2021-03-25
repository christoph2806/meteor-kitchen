var pageSession = new ReactiveDict();


Template.HomePrivateInsertForm.rendered = function() {
	
	var newAppData = null;
	if(this.data.forkedApp) {
		var appName = this.data.forkedApp.name + " - clone";
		newAppData = {
			public: true,
			name: appName,
			slug: convertToSlug(appName),
			description: this.data.forkedApp.description
		};
		Session.set("newAppData", newAppData);
	} else {
		newAppData = Session.get("newAppData");
	}

	if(!newAppData) {
		newAppData = {
			public: true,
			name: "",
			description: ""
		};
		Session.set("newAppData", newAppData);
	}

	pageSession.set("homePrivateInsertFormInfoMessage", "");
	pageSession.set("homePrivateInsertFormErrorMessage", "");
	pageSession.set("homePrivateInsertFormIsPublicApplication", newAppData.public);

	$("input[autofocus]").focus();
};

Template.HomePrivateInsertForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("homePrivateInsertFormInfoMessage", "");
		pageSession.set("homePrivateInsertFormErrorMessage", "");
		$(".error-text").addClass("hidden");
		$(".error-text").text("");

		var self = this;

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("homePrivateInsertFormErrorMessage", message);
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
				Meteor.call("appSlugIsUnique", null, values.slug, function(err, res) {
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

						if(self.forkedApp) {
							values.forkedAppId = self.forkedApp._id;
							values.data = self.forkedApp.data;
							$("#form-submit-button").addClass('disabled loading');
							Applications.insert(values, function(e, r) {
								$("#form-submit-button").removeClass('disabled loading');
								if(e) {
									errorAction(e);							
								} else {
									delete Session.keys["newAppData"];
									Router.go("home.edit", { applicationId: r });
								}
							});
						} else {
							values.forkedAppId = null;
							values.data = {};
							Session.set("newAppData", values);
							Router.go("home.init");
						}

					}
				});
			}
		);

		return false;
	},
	"click #form-cancel-button": function(e, t) {
		e.preventDefault();

		delete Session.keys["newAppData"];
		
		Router.go("home", {});
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
		}
	},
	"input input[name='slug']": function(e, t) {
		var errorElem = $(".field-slug").find(".error-text.field-slug-error");
		errorElem.text("");
		errorElem.addClass("hidden");
	}
});

Template.HomePrivateInsertForm.helpers({
	"newAppData": function() {
		return Session.get("newAppData") || {};
	},
	"infoMessage": function() {
		return pageSession.get("homePrivateInsertFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("homePrivateInsertFormErrorMessage");
	},
	"isPublicApplication": function() {
		return !!pageSession.get("homePrivateInsertFormIsPublicApplication");
	}
});
