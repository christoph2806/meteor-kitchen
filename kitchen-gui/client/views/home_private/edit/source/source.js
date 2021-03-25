resizeCodemirror = function(template) {
	$(".CodeMirror").css({ width: ($(".config-container").width()) + "px", height: ($(".config-container").height() - $(".title-div").outerHeight()) + "px" });
	$(".CodeMirror-scroll").css({ width: $(".config-container").width() + "px" });
};

Template.HomePrivateEditSource.rendered = function() {

	Meteor.defer(function() {
		resizeCodemirror();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});

	var setup = false;
	App.addRefreshingSessionVar("sourceChanged");
	this.autorun(function() {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		if(Session.get("sourceChanged")) {
			setup = false;
			Session.set("sourceChanged", false);
		}

		var rawInput = Session.get("sourceInputText") || "";
		if(setup) {
			var newKitchen = ClassKitchen.create("kitchen");
			newKitchen.load(kitchen.save(null, true, true));

			if(rawInput) {
				try {
					var newJson = JSON.parse(rawInput);

					newKitchen.load(newJson);
				} catch(err) {
				}
			}

			if(!kitchen.isEqual(newKitchen)) {
				kitchen.load(newKitchen.save(null, true, true));
				App.setModified();
			} else {
			}			
		} else {
			setup = true;
			Session.set("sourceInputText", JSON.stringify(kitchen.save(null, true, true), null, '\t'));
		}
	});
};

Template.HomePrivateEditSource.helpers({
	"sourceInputOptions": function() {
		var options = {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}

		return options;
	},

	"showWarning": function() {
		return !Session.get("editJsonHideWarning");
	}
});

Template.HomePrivateEditSource.events({
	"click .download-button": function(e, t) {
		var json = {};
		try {
			json = JSON.parse(Session.get("sourceInputText"));
		} catch(err) {
			alert("Error parsing JSON", err);
			return;
		}

		var str = JSON.stringify(json, null, '\t');
		downloadLocalResource(str, App.projectData.slug + ".json");
	},

	"click .hide-warning": function(e, t) {
		Session.set("editJsonHideWarning", true);
		Meteor.defer(function() {
			resizeCodemirror();
		});
	}
});
