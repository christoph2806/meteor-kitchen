Template.HomePrivateEditGlobalConfigAccounts.rendered = function() {
	var kitchen = null;
	if(App && App.project) {
		kitchen = App.project.get();
	}

	function initData() {
		if(!kitchen || !kitchen.application) {
			return;
		}

		Session.set("onUserCreatedInputText", kitchen.application.on_user_created_code);
		Session.set("onUserLoggedInputText", kitchen.application.on_user_logged_code);
	}
	initData();

	this.autorun(function() {
		if(!kitchen || !kitchen.application) {
			return;
		}

		var onUserCreatedText = Session.get("onUserCreatedInputText");
		var onUserLoggedText = Session.get("onUserLoggedInputText");

		if(
			onUserCreatedText != kitchen.application.on_user_created_code ||
			onUserLoggedText != kitchen.application.on_user_logged_code
		) {
			kitchen.application.on_user_created_code = onUserCreatedText;
			kitchen.application.on_user_logged_code = onUserLoggedText;

			App.setModified();
		}
	});
};

Template.HomePrivateEditGlobalConfigAccounts.helpers({
	"appData": function() {
		if(!App.project) {
			return {};
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return {};
		}

		return kitchen.application;
	},
	"onUserCreatedInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},
	"onUserLoggedInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},
	"onUserCreatedClass": function() {
		return Session.get("loginOptionsHideOnUserCreated") ? "off" : "";
	},
	"onUserLoggedClass": function() {
		return Session.get("loginOptionsHideOnUserLogged") ? "off" : "";
	},
	"onUserCreatedIconClass": function() {
		return Session.get("loginOptionsHideOnUserCreated") ? "fa-caret-right" : "fa-caret-down";
	},
	"onUserLoggedIconClass": function() {
		return Session.get("loginOptionsHideOnUserLogged") ? "fa-caret-right" : "fa-caret-down";
	}
});

Template.HomePrivateEditGlobalConfigAccounts.events({
	"click .login-option": function(e, t) {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var elem = $(e.currentTarget);
		var property = elem.attr("name");

		kitchen.application[property] = elem.is(":checked");

		App.setModified();
	},

	"click .toggler .title": function(e, t) {
		var toggler = $(e.currentTarget).closest(".toggler");
		var sessionKey = toggler.attr("data-session");
		var currentlyHidden = toggler.hasClass("off");
		if(currentlyHidden) {
			toggler.find(".content").show("fast", function() {
				Session.set(sessionKey, false);
				var editorId = toggler.find("textarea").attr("id");
				if(editorId && CodeMirrors[editorId]) {
					CodeMirrors[editorId].refresh();
				}
			});
		} else {
			toggler.find(".content").hide("fast", function() {
				Session.set(sessionKey, true);
			});
		}
	}

});
