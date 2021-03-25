var pageSession = new ReactiveDict();

var frontendsForTemplating = function(templating) {
	var frontends = [];
	switch(templating) {
		case "":
		case "blaze": {
			frontends = [
				{ value: "", title: "Default (Bootstrap 3)" },
				{ value: "bootstrap3", title: "Bootstrap 3" },
				{ value: "semantic-ui", title: "Semantic UI" },
				{ value: "materialize", title: "Materialize" }
			];
		}; break;

		case "react": {
			frontends = [
				{ value: "", title: "Default (Bootstrap 3)" },
				{ value: "bootstrap3", title: "Bootstrap 3" },
				{ value: "aframe", title: "A-Frame" }
			];
		}; break;
	}
	return frontends;
};

var themesForFrontend = function(frontend) {
	if(!App.project) {
		return [];
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return [];
	}

	var themes = [" "];
	switch(frontend) {
		case "":
		case "bootstrap3": {
			var prop = kitchen.application.getProperty("theme");
			prop.choiceItems.map(t => {
				themes.push(t);
			});
		}; break;
		case "semantic-ui": {
		}; break;
		case "materialize": {
		}; break;
	}
	return themes;
};

Template.HomePrivateEditClientConfigFrontend.rendered = function() {
	Meteor.defer(function() {
		$(".ui.dropdown").dropdown();
		$(".ui.checkbox").checkbox();

		$("select[name='theme']").on("change", function(e) {
			if(!App.project) {
				return;
			}
			var kitchen = App.project.get();
			if(!kitchen) {
				return;
			}

			var val = $(this).val();
			if(val == " ") val = "";

			if(kitchen.application.theme != val) {
				kitchen.application.theme = val;
				App.setModified();
			}
		});

		$("input[name='animate']").on("change", function(e) {
			if(!App.project) {
				return;
			}
			var kitchen = App.project.get();
			if(!kitchen) {
				return;
			}
			if(kitchen.application.animate != $(this).is(":checked")) {
				kitchen.application.animate = $(this).is(":checked");
				App.setModified();
			}
		});

	});
};

Template.HomePrivateEditClientConfigFrontend.events({
	"change input[name='templating']": function(e, t) {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var elem = $(e.currentTarget);
		if(elem.is(":checked") && kitchen.application.templating != elem.val()) {
			kitchen.application.templating = elem.val();

			// check if currently selected frontend exists
			var frontends = frontendsForTemplating(kitchen.application.templating);
			if(!frontends.length || frontends.findIndex(x => x.value == kitchen.application.frontend) < 0) {
				kitchen.application.frontend = "";
				$("input[name='frontend'][value='']").attr("checked", true);
			}

			App.setModified();
		}
	},

	"change input[name='frontend']": function(e, t) {
		if(!App.project) {
			return;
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var elem = $(e.currentTarget);
		if(elem.is(":checked") && kitchen.application.frontend != elem.val()) {
			kitchen.application.frontend = elem.val();

			// check if currently selected theme exists
			var themes = themesForFrontend(kitchen.application.frontend);
			if(!themes.length || themes.indexOf(kitchen.application.theme) < 0) {
				kitchen.application.theme = "";
				$("select[name='theme']").dropdown("set selected", " ");
			}

			App.setModified();
		}
	}
});

Template.HomePrivateEditClientConfigFrontend.helpers({
	"frontendsForTemplating": function() {
		if(!App.project) {
			return [];
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return [];
		}
		return frontendsForTemplating(kitchen.application.templating);
	},

	"templatingChecked": function(templating) {
		if(!App.project) {
			return "";
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		return templating == kitchen.application.templating ? "checked" : "";
	},

	"frontendChecked": function(frontend) {
		if(!App.project) {
			return "";
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}
		return frontend == kitchen.application.frontend ? "checked" : "";
	},

	"themeSelected": function(theme) {
		if(!App.project) {
			return "";
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		var val = theme;
		if(val == " ") val = "";

		return val == kitchen.application.theme ? "selected" : "";
	},

	"themeList": function() {
		if(!App.project) {
			return [""];
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return [""];
		}

		var frontend = kitchen.application.frontend;

		var themes = themesForFrontend(frontend);

		return themes;
	},

	"animateChecked": function() {
		if(!App.project) {
			return "";
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}

		return kitchen.application.animate ? "checked" : "";
	},

});
