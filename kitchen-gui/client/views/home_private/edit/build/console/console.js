Template.HomePrivateEditBuildConsole.created = function() {

};

Template.HomePrivateEditBuildConsole.rendered = function() {
	function scrollTerminal() {
		var terminal = document.getElementById("terminal-window");
		terminal.scrollTop = terminal.scrollHeight;
	}

	var self = this;
	this.autorun(function() {
		var count = self.data.terminal.count();
		if(count) {
			scrollTerminal();
		}
	});
};

Template.HomePrivateEditBuildConsole.events({
	"click .build-remotely": function(e, t) {
		e.preventDefault();
		if(!App.projectData) {
			return;
		}

		var kitchen = App.project.get();

		var userId = Meteor.userId();
		var appId = App.projectData._id;
		var kitchenURL = App.kitchenURL;

		var options = App.buildOptions.get();
		var cmd = "build";

		var templating = options.templating || kitchen.application.templating || "blaze";
		switch(templating) {
			case "blaze": cmd = "build_blaze"; break;
			case "react": cmd = "build_react"; break;
		}

		var command = JSON.stringify({
			command: cmd,
			args: {
				user_id: userId,
				app_id: appId,
				kitchen_url: kitchenURL
			}
		});
		App.terminalCommand(command);

		return false;
	},

	"click .download-source": function(e, t) {
		e.preventDefault();

		if(!App.projectData) {
			return;
		}

		var kitchen = App.project.get();

		var userId = Meteor.userId();
		var appId = App.projectData._id;
		var kitchenURL = App.kitchenURL;
		var buildServerURL = App.buildServerURL;
		var options = App.buildOptions.get();
		var templating = options.templating || kitchen.application.templating || "blaze";

		var cmd = "download_js_html";
		if(templating == "react") {
			cmd = "download_react";
		} else {
			if(options.coffee || options.jade) {
				if(options.coffee && options.jade) {
					cmd = "download_coffee_jade";
				} else {
					if(options.coffee) {
						cmd = "download_coffee_html";
					} else {
						cmd = "download_js_jade";
					}
				}
			}
		}

		var command = JSON.stringify({
			command: cmd,
			args: {
				user_id: userId,
				app_id: appId,
				kitchen_url: kitchenURL,
				build_server_url: buildServerURL
			}
		});

		App.terminalCommand(command, function() {
			downloadFile(App.buildServerURL + "/download/" + appId + ".zip");
		});
	},

	"click .download-android": function(e, t) {
		e.preventDefault();

		if(!App.projectData) {
			return;
		}

		var kitchen = App.project.get();

		var userId = Meteor.userId();
		var appId = App.projectData._id;
		var kitchenURL = App.kitchenURL;
		var buildServerURL = App.buildServerURL;
		var options = App.buildOptions.get();
		var appName = App.projectData.slug;

		var deployOptions = App.deployOptions.get();
		var serverURL = deployOptions.productionURL || "";

		inputBox("Server URL", "URL where this application is deployed", serverURL, function(el, value) {
			serverURL = value;

			if(serverURL != deployOptions.productionURL) {
				deployOptions.productionURL = serverURL;
				Meteor.call("saveDeployOptions", appId, deployOptions, function(e) {
					if(e) {
						alert(e);
					}
				});
			}

			var cmd = "download_android";
			var templating = options.templating || kitchen.application.templating || "blaze";
			switch(templating) {
				case "blaze": cmd = "download_android_blaze"; break;
				case "react": cmd = "download_android_react"; break;
			}

			var command = JSON.stringify({
				command: cmd,
				args: {
					user_id: userId,
					app_id: appId,
					app_name: appName,
					kitchen_url: kitchenURL,
					build_server_url: buildServerURL,
					server_url: serverURL
				}
			});

			App.terminalCommand(command, function() {
				downloadFile(App.buildServerURL + "/download/" + appName + ".apk");
			});
		},
		function() {

		},
		{
			required: true
		});
	},

	"click .build-locally": function(e, t) {
		e.preventDefault();
		Session.set("showBuildLocallyInfo", !Session.get("showBuildLocallyInfo"));
		return false;		
	},

	"click .build-locally-info .close": function(e, t) {
		e.preventDefault();
		Session.set("showBuildLocallyInfo", false);
		return false;
	},

	"click .build-options": function(e, t) {
		e.preventDefault();

		Router.go("home.edit.build.options", { applicationId: this.params.applicationId });

		return false;		
	}
});

Template.HomePrivateEditBuildConsole.helpers({
	"projectNotSaved": function() {
		return App.projectModified.get();
	},

	"showBuildLocallyInfo": function() {
		return Session.get("showBuildLocallyInfo");
	},

	"terminalBusy": function() {
		return App.terminalBusy.get();
	},

	"terminalButtonsDisabledClass": function() {
		return App.terminalBusy.get() ? "disabled" : "";
	},

	"kitchenArgs": function() {
		var options = App.buildOptions.get();

		var kitchen = App.project.get();

		var args = "";
		if(args) { args += " "; }
		args += options.outputDir;

		var templating = options.templating || kitchen.application.templating || "blaze";

		if(options.templating) {
			if(args) { args += " "; }
			args += "--" + options.templating;
		}

		if(options.coffee && templating == "blaze") {
			if(args) { args += " "; }
			args += "--coffee";
		}

		if(options.jade && templating == "blaze") {
			if(args) { args += " "; }
			args += "--jade";
		}

		return args;
	}
});
