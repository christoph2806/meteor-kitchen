var pageSession = new ReactiveDict();


var setHumanJsonEditorText = function(txt) {
	var initAppData = Session.get("initAppData");
	var obj = human2machine(initAppData.humanEditorText);
	if(obj.application) {
		obj.application.templating = initAppData.templating;
	}
	Session.set("humanJsonEditorText", JSON.stringify(obj, null, "  "));
};

Template.HomePrivateInitForm.rendered = function() {
	var newAppData = Session.get("newAppData");
	if(!newAppData) {
		Router.go("home.insert");
	}

	var initAppData = Session.get("initAppData");
	if(!initAppData) {
		var humanEditorDefaultText = "I want site with three pages: home, customers and about.\n\nIn home page I want jumbotron with title: \"This application is written in human language!\", text: \"Human to describe app, machine to write code!\", button url: \"customers\".\n\nPlease create one collection: customers.\n\nIn customers collection I want three fields: name, address and e-mail.\n\nIn customers page I want CRUD for customers collection.\n\nIn about page I want text: \"This application is written in human language using Meteor Kitchen, code generator for Meteor\".";
		var jsonEditorDefaultText = JSON.stringify(ClassKitchen.create("kitchen").save(null, true, false), null, '  ');
		initAppData = {
			method: "boilerplate-accounts",
			templating: "",
			jsonEditorText: jsonEditorDefaultText,
			humanEditorText: humanEditorDefaultText
		};
		Session.set("initAppData", initAppData);
	}

	var obj = human2machine(initAppData.humanEditorText || "");
	Session.set("humanJsonEditorText", JSON.stringify(obj, null, "  "));		
	Session.set("jsonEditorText", initAppData.jsonEditorText || "");

	pageSession.set("humanEditorText", initAppData.humanEditorText);
	pageSession.set("homePrivateInitFormInfoMessage", "");
	pageSession.set("homePrivateInitFormErrorMessage", "");

	this.autorun(function (tracker) {
		var initData = Session.get("initAppData");
		initData.jsonEditorText = Session.get("jsonEditorText");
		Session.set("initAppData", initData);
	});

	$('.ui.radio.checkbox').checkbox();
	$('select.dropdown').dropdown();

	$("input[autofocus]").focus();
};

Template.HomePrivateInitForm.events({
	"change input[name='method']": function(e, t) {
		var method = $(e.currentTarget).val();

		var initAppData = Session.get("initAppData") || {};
		initAppData.method = method;
		Session.set("initAppData", initAppData);
	},
	"change input[name='templating']": function(e, t) {
		var templating = $(e.currentTarget).val();

		var initAppData = Session.get("initAppData") || {};
		initAppData.templating = templating;
		Session.set("initAppData", initAppData);

		setHumanJsonEditorText();
	},
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("homePrivateInitFormInfoMessage", "");
		pageSession.set("homePrivateInitFormErrorMessage", "");

		var self = this;

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("homePrivateInitFormErrorMessage", message);
		}

		var newAppData = Session.get("newAppData");
		var initAppData = Session.get("initAppData");

		if(!initAppData || !initAppData.method) {
			errorAction("Unexpected error.");
		}

		try {
			switch(initAppData.method) {
				case "empty": {
					let kitchen = ClassKitchen.create("kitchen");
					kitchen.application.title = newAppData.name;
					kitchen.application.free_zone = {};
					kitchen.application.public_zone = {};
					kitchen.application.private_zone = {};

					newAppData.data = kitchen.save(null, true, false);
				}; break;

				case "boilerplate-accounts": {
					let kitchen = ClassKitchen.create("kitchen");
					let exampleAccounts = Applications.findOne({ boilerplate: true, slug: "boilerplate-accounts" });
					kitchen.load(exampleAccounts.data);
					kitchen.application.title = newAppData.name;
					kitchen.application.free_zone.pages[0].components[0].title = newAppData.name;
					kitchen.application.free_zone.pages[0].components[0].text = newAppData.description;

					newAppData.data = kitchen.save(null, true, false);
				}; break;

				case "human2machine": newAppData.data = human2machine(initAppData.humanEditorText || ""); break;

				case "json": newAppData.data = JSON.parse(initAppData.jsonEditorText); break;
			}
		} catch(e) {
			errorAction(e);
			return false;
		}

		// ---
		// adjust
		// ---
		if(initAppData.templating && newAppData.data && newAppData.data.application) {
			newAppData.data.application.templating = initAppData.templating;
		}

		let kitchen = ClassKitchen.create("kitchen");
		kitchen.load(newAppData.data);
		newAppData.data = kitchen.save(null, true, false);

		Applications.insert(newAppData, function(e, r) {
			if(e) {
				errorAction(e);							
			} else {
				delete Session.keys["newAppData"];
				delete Session.keys["initAppData"];
				Router.go("home.edit", { applicationId: r });
			}
		});

		return false;
	}
});

Template.HomePrivateInitForm.helpers({
	"newAppData": function() {
		return Session.get("newAppData") || {};
	},
	"initAppData": function() {
		return Session.get("initAppData") || {};
	},
	"initMethodTemplate": function() {
		var initAppData = Session.get("initAppData") || {};
		switch(initAppData.method) {
			case "empty": return "HomePrivateInitFormEmpty"; break;
			case "boilerplate-accounts": return "HomePrivateInitFormBoilerplateAccounts"; break;
			case "human2machine": return "HomePrivateInitFormHuman2Machine"; break;
			case "json": return "HomePrivateInitFormJson"; break;
		}
		return "";
	},
	"infoMessage": function() {
		return pageSession.get("homePrivateInitFormInfoMessage") || "";
	},
	"errorMessage": function() {
		return pageSession.get("homePrivateInitFormErrorMessage") || "";
	}
});



Template.HomePrivateInitFormHuman2Machine.events({
	"input textarea[name='human-text-editor']": function(e, t) {
		var txt = $(e.currentTarget).val();
		var initAppData = Session.get("initAppData");
		initAppData.humanEditorText = txt;
		Session.set("initAppData", initAppData);
		setHumanJsonEditorText();
	}
});

Template.HomePrivateInitFormHuman2Machine.helpers({
	"humanEditorText": function() {
		return pageSession.get("humanEditorText");
	},
	"humanJsonEditorOptions": function() {
		return {
			smartIndent: false, lineNumbers: true,
			readOnly: true,
			mode: "application/ld+json"
		}
	}
});



Template.HomePrivateInitFormJson.events({
});

Template.HomePrivateInitFormJson.helpers({
	"jsonEditorOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "application/ld+json",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	}
});