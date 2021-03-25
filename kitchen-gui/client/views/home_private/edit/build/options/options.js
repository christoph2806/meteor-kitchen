var pageSession = new ReactiveDict();

Template.HomePrivateEditBuildOptions.created = function() {

};

Template.HomePrivateEditBuildOptions.rendered = function() {
	function resizeCodemirror() {
		this.$(".CodeMirror").css({ width: ($(".config-container").width()) + "px", height: "100%" });
		this.$(".CodeMirror-scroll").css({ width: $(".config-container").width() + "px" });
	}

	Meteor.defer(function() {
		resizeCodemirror();

		pageSession.set("buildOptions", App.buildOptions.get());

		var kitchen = App.project.get();
		Session.set("mobileConfigInputText", kitchen.application.mobile_config || "");
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeCodemirror();
	});
};

Template.HomePrivateEditBuildOptions.events({
	"change input[name='templating']": function(e, t) {
		var elem = $(e.currentTarget);
		if(elem.is(":checked")) {
			var buildOptions = pageSession.get("buildOptions");
			if(!buildOptions) {
				return;
			}
			buildOptions.templating = elem.val() == "-" ? "" : elem.val();
			pageSession.set("buildOptions", buildOptions);
		}
	},

	"click .goto-console": function(e, t) {
		e.preventDefault();

		Router.go("home.edit.build.console", { applicationId: this.params.applicationId });

		return false;
	},

	"click .save-options": function(e, t) {
		e.preventDefault();

		var self = this;

		validateForm(
			$(t.find(".form")),
			function(fieldName, fieldValue) {
			},
			function() {

			},
			function(values) {
				$(t.currentTarget).addClass("disabled loading");

				var mobileConfig = Session.get("mobileConfigInputText");
				var buildOptions = App.buildOptions.get();

				var kitchen = App.project.get();
				if(kitchen.application.mobile_config != mobileConfig) {
					kitchen.application.mobile_config = mobileConfig;

					if(!App.projectModified.get()) {
						App.saveApp(function(e, r) {
							if(e) {
								$(t.currentTarget).removeClass("disabled loading");
								alert(e.message);
								return;
							}
						});
					}
				}

				values.templating = values.templating == "-" ? "" : values.templating;

				var templating = values.templating || kitchen.application.templating;

				if(templating != "blaze") {
					values.coffee = false;
					values.jade = false;
				}
				delete values["code-mirror-textarea"];

				for(var attrname in values) {
					buildOptions[attrname] = values[attrname];
				}

				Meteor.call("saveBuildOptions", App.projectData._id, buildOptions, function(e, r) {
					if(e) {
						$(t.currentTarget).removeClass("disabled loading");
						alert(e.message);
						return;
					}

					$(t.currentTarget).removeClass("disabled loading");
					Router.go("home.edit.build.console", { applicationId: self.params.applicationId });
				});
			}
		);

		return false;
	}
});

Template.HomePrivateEditBuildOptions.helpers({
	"defaultTemplating": function() {
		if(!App) {
			return "";
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return "";
		}
		return kitchen.application.templating || "blaze";
	},

	"templatingChecked": function(templating) {
		return templating == App.buildOptions.get().templating ? "checked" : "";
	},

	"coffeeChecked": function() {
		return App.buildOptions.get().coffee ? "checked" : "";
	},

	"jadeChecked": function() {
		return App.buildOptions.get().jade ? "checked" : "";
	},

	"coffeeDisabled": function() {
		var buildOptions = pageSession.get("buildOptions");
		if(!buildOptions) {
			return "disabled";
		}

		if(!App) {
			return "disabled";
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return "disabled";
		}

		var templating = buildOptions.templating || kitchen.application.templating || "blaze";
		return templating == "blaze" ? "" : "disabled";
	},

	"jadeDisabled": function() {
		var buildOptions = pageSession.get("buildOptions");
		if(!buildOptions) {
			return "disabled";
		}

		if(!App) {
			return "disabled";
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return "disabled";
		}

		var templating = buildOptions.templating || kitchen.application.templating || "blaze";
		return templating == "blaze" ? "" : "disabled";
	},

	"mobileConfigInputOptions": function() {
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
