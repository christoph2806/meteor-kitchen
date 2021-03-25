Template.HomePrivateEditClientConfigStyles.rendered = function() {
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
	App.addRefreshingSessionVar("clientStylesChanged");
	this.autorun(function() {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		if(Session.get("clientStylesChanged")) {
			setup = false;
			Session.set("clientStylesChanged", false);
		}

		var stylesCode = Session.get("clientStylesInputText") || "";

		if(setup) {
			if(kitchen.application.stylesheet != stylesCode) {
				kitchen.application.stylesheet = stylesCode;
				App.setModified();
			}
		} else {
			Session.set("clientStylesInputText", kitchen.application.stylesheet || "");
			setup = true;
		}
	});
};

Template.HomePrivateEditClientConfigStyles.helpers({
	"clientStylesInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "css",
			lint: false,
			gutters: ["CodeMirror-lint-markers"]
		}
	}
});
