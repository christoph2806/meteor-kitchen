var pageSession = new ReactiveDict();


Template.UserSettingsProfileBasic.rendered = function() {
	

	pageSession.set("userSettingsProfileBasicInfoMessage", "");
	pageSession.set("userSettingsProfileBasicErrorMessage", "");

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

	$('.ui.dropdown').dropdown();
};

Template.UserSettingsProfileBasic.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("userSettingsProfileBasicInfoMessage", "");
		pageSession.set("userSettingsProfileBasicErrorMessage", "");

		var self = this;

		function submitAction(result, msg) {
			var userSettingsProfileBasicMode = "update";
			if(!t.find("#form-cancel-button")) {
				switch(userSettingsProfileBasicMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("userSettingsProfileBasicInfoMessage", message);
					}; break;
				}
			}

			Router.go("user_settings.profile", {});
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("userSettingsProfileBasicErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				

				Meteor.call("updateUserAccount", t.data.current_user_data._id, values, function(e, r) { if(e) errorAction(e); else submitAction(r); });
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
	}

	
});

Template.UserSettingsProfileBasic.helpers({
	"infoMessage": function() {
		return pageSession.get("userSettingsProfileBasicInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("userSettingsProfileBasicErrorMessage");
	},
	countries: function() {
		return CountryCodes.sort(function(a, b) {
			if (a.name < b.name ) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});
	}	
});


Template.UserSettingsProfileSkill.onRendered(function() {
	pageSession.set("userSettingsProfileSkillInfoMessage", "");
	pageSession.set("userSettingsProfileSkillErrorMessage", "");
	pageSession.set("availableForHire", this.data.current_user_data.profile.availableForHire);

	Meteor.defer(function() {
		$(".ui.checkbox").checkbox();
		$(".ui.dropdown").dropdown();
	});

	$("input[name='profile.availableForHire']").on("change", function(e) {
		pageSession.set("availableForHire", !!$(this).is(":checked"));

		Meteor.defer(function() {
			$(".ui.checkbox").checkbox();
			$(".ui.dropdown").dropdown();
		});
	});

});


Template.UserSettingsProfileSkill.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("userSettingsProfileSkillInfoMessage", "");
		pageSession.set("userSettingsProfileSkillErrorMessage", "");

		var self = this;

		function submitAction(result, msg) {
			var userSettingsProfileSkillMode = "update";
			if(!t.find("#form-cancel-button")) {
				switch(userSettingsProfileSkillMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("userSettingsProfileSkillInfoMessage", message);
					}; break;
				}
			}

			Router.go("user_settings.profile", {});
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("userSettingsProfileSkillErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				if(values.profile.devProfile) {
					values.profile.devProfile.devType = values.profile.devProfile.devType ? values.profile.devProfile.devType.split(",") : [];
					values.profile.devProfile.os = values.profile.devProfile.os ? values.profile.devProfile.os.split(",") : [];
					values.profile.devProfile.progLangs = values.profile.devProfile.progLangs ? values.profile.devProfile.progLangs.split(",") : [];
					values.profile.devProfile.uiFrameworks = values.profile.devProfile.uiFrameworks ? values.profile.devProfile.uiFrameworks.split(",") : [];
				}

				Meteor.call("updateUserAccount", t.data.current_user_data._id, values, function(e, r) { if(e) errorAction(e); else submitAction(r); });
			},

			{
				"profile.devProfile.devType": { required: true },
				"profile.devProfile.selfRating": { required: true },
				"profile.devProfile.uiFrameworks": { required: true },
				"profile.devProfile.stack": { required: true },
				"profile.devProfile.progLangs": { required: true },
				"profile.devProfile.os": { required: true }
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
	}
});


Template.UserSettingsProfileSkill.helpers({
	"infoMessage": function() {
		return pageSession.get("userSettingsProfileSkillInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("userSettingsProfileSkillErrorMessage");
	},
	"availableForHire": function() {
		return pageSession.get("availableForHire");
	},
	"devType": function() {
		return DevProperties.devType;
	},
	"osList": function() {
		return DevProperties.os;
	},
	"progLangs": function() {
		return DevProperties.progLangs;
	},
	"uiFrameworks": function() {
		return DevProperties.uiFrameworks;
	},
	"stack": function() {
		return DevProperties.stack;
	},
	"selfRating": function() {
		return DevProperties.selfRating;
	}
});



Template.UserSettingsProfileSkillTeam.onRendered(function() {
	pageSession.set("team", this.data.current_user_data.profile.devProfile.team);

	$(".ui.checkbox").checkbox();

	$("input[name='profile.devProfile.team']").on("change", function(e) {
		pageSession.set("team", $(this).val() == "false" ? false : true);
	});
});

Template.UserSettingsProfileSkillTeam.helpers({
	"team": function() {
		return pageSession.get("team");
	},
	"teamDistribution": function() {
		return DevProperties.teamDistribution;
	}
});
