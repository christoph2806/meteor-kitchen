var pageSession = new ReactiveDict();


Template.JobsEdit.rendered = function() {
	pageSession.set("jobsEditInfoMessage", "");
	pageSession.set("jobsEditErrorMessage", "");

	$("input[autofocus]").focus();
	$(".ui.dropdown").dropdown();
	$('.ui.checkbox').checkbox();
};

Template.JobsEdit.helpers({
	"infoMessage": function() {
		return pageSession.get("jobsEditInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("jobsEditErrorMessage");
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
	},
	"devType": function() {
		return DevProperties.devType;
	},
	"uiFrameworks": function() {
		return DevProperties.uiFrameworks;
	},
	"stack": function() {
		return DevProperties.stack;
	}
});

Template.JobsEdit.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("jobsEditInfoMessage", "");
		pageSession.set("jobsEditErrorMessage", "");

		var self = this;

		function submitAction(result, msg) {
			Router.go("jobs", {});
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("jobsEditErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				values.devType = values.devType ? values.devType.split(",") : [];
				values.uiFrameworks = values.uiFrameworks ? values.uiFrameworks.split(",") : [];
				Meteor.call("jobsUpdate", self.job._id, values, function(e, r) { if(e) errorAction(e); else submitAction(r); });
			},

			{
			}
		);

		return false;
	},

	"click #form-cancel-button": function(e, t) {
		e.preventDefault();

		Router.go("jobs", {});
	}
});
