Template.HomePrivateEditClientConfigStartup.rendered = function() {
	function resizeCodemirror() {
		this.$(".CodeMirror, .CodeMirror-scroll").css({ width: "auto" });

		var container = $(".config-container");
		this.$(".CodeMirror").css({ width: (container.innerWidth()) + "px", height: (container.height() - $(".CodeMirror").position().top / 2) + "px" });
		this.$(".CodeMirror-scroll").css({ width: container.innerWidth() + "px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});

	var setup = false;
	App.addRefreshingSessionVar("clientStartupChanged");
	this.autorun(function() {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		if(Session.get("clientStartupChanged")) {
			setup = false;
			Session.set("clientStartupChanged", false);
		}

		var startupCode = Session.get("clientStartupInputText") || "";

		if(setup) {
			if(kitchen.application.client_startup_code != startupCode) {
				kitchen.application.client_startup_code = startupCode;
				App.setModified();
			}
		} else {
			Session.set("clientStartupInputText", kitchen.application.client_startup_code || "");
			setup = true;
		}
	});
};

Template.HomePrivateEditClientConfigStartup.helpers({
	"clientStartupInputOptions": function() {
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
	}
});
