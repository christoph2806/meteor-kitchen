this.App = {
	projectData: null,
	project: new ReactiveVar(null),
	projectModified: new ReactiveVar(false),
	buildOptions: new ReactiveVar({}),
	deployOptions: new ReactiveVar({}),
	undoBuffer: new ReactiveVar([]),
	undoPointer: new ReactiveVar(0),
	refreshingSessionVars: [],

	terminalEyeURL: "",
	buildServerURL: "",
	kitchenURL: "",
	terminalSocket: null,
	terminalOutput: new Mongo.Collection(null),
	terminalBusy: new ReactiveVar(false)
};

App.addRefreshingSessionVar = function(varName) {
	if(App.refreshingSessionVars.indexOf(varName) < 0) {
		App.refreshingSessionVars.push(varName);
	}
};

App.setRefreshingSessionVars = function(value) {
	App.refreshingSessionVars.map(function(varName) {
		Session.set(varName, value);
	});
};

App.addUndoPoint = function() {
	var undoPointer = App.undoPointer.get();
	var undoBuffer = App.undoBuffer.get();

	var appendix = (undoBuffer.length - 1) - undoPointer;
	if(appendix > 0) {
		undoBuffer.splice(-1, appendix);
	}

	undoBuffer.push({ 
		data: App.project.get().save(null, true, false, true)
	});

	if(undoBuffer.length > 100) {
		undoBuffer.shift();
	}

	App.undoPointer.set(undoBuffer.length - 1);
};

App.undo = function() {
	var undoPointer = App.undoPointer.get();
	var undoBuffer = App.undoBuffer.get();

	if(undoPointer <= 0) {
		return;
	}

	var kitchen = App.project.get();
	kitchen.load(undoBuffer[undoPointer - 1].data, true);
	App.project.set(kitchen);

	App.setRefreshingSessionVars(true);

	App.undoPointer.set(undoPointer - 1);
	App.projectModified.set(true);
};

App.redo = function() {
	var undoPointer = App.undoPointer.get();
	var undoBuffer = App.undoBuffer.get();

	if(undoPointer >= undoBuffer.length - 1) {
		return;
	}

	var kitchen = App.project.get();
	kitchen.load(undoBuffer[undoPointer + 1].data, true);
	App.project.set(kitchen);

	App.setRefreshingSessionVars(true);

	App.undoPointer.set(undoPointer + 1);
	App.projectModified.set(true);
};

App.terminalLog = function(message) {
	App.terminalOutput.insert({ createdAt: new Date(), message: message });
};

App.clearTerminalLog = function() {
	App.terminalOutput.remove({});
};

App.sendTerminalCommand = function(msg, successCallback) {
	App.terminalLog("");
	App.terminalBusy.set(true);

	App.terminalSocket.successCallback = successCallback;
	App.terminalSocket.send(msg);
};

App.terminalCommand = function sendMessageToKitchen(msg, successCallback) {
	if(!App.terminalSocket) {
		App.connectTerminal(function() {
			App.sendTerminalCommand(msg, successCallback);
		});
	} else {
		App.sendTerminalCommand(msg, successCallback);		
	}
};

App.connectTerminal = function(onOpenCallback) {
	App.terminalLog("Connecting...");
	App.terminalBusy.set(true);

	try {
		App.terminalSocket = new WebSocket(App.terminalEyeURL, "echo-protocol");
	} catch(e) {
		App.terminalLog(e.message);
		App.terminalBusy.set(false);
		return;
	}

	App.terminalSocket.onmessage = function(e) {
		var data = {};
		try {
			data = JSON.parse(e.data);
		} catch(err) {
			App.terminalLog("Error parsing response received from server.");
			App.terminalBusy.set(false);
			return;
		}

		if(data.msg) {
			App.terminalLog(data.msg);
		}

		if(data.status == "error") {
			App.terminalBusy.set(false);
		}

		if(data.status == "success") {
			if(App.terminalSocket.successCallback) {
				App.terminalSocket.successCallback();
			}
			App.terminalBusy.set(false);
		}
	};

	App.terminalSocket.onopen = function(e) {
		App.terminalBusy.set(false);
		App.terminalLog("Connected.");

		if(onOpenCallback) {
			onOpenCallback();
		}
	};

	App.terminalSocket.onerror = function(e) {
		App.terminalLog("WebSocket error. Type: \"" + e.type + "\".");
		App.terminalBusy.set(false);
	};

	App.terminalSocket.onclose = function(e) {
		App.terminalLog("WebSocket connection closed. Code: " + e.code + ", reason: \"" + e.reason + "\".");
		App.terminalBusy.set(false);
	};

};

App.saveApp = function(callback) {
	if(!App.projectData || !App.project.get()) {
		return;
	}
	var rawData = App.project.get().save(null, true, false);
	Meteor.call("saveApp", App.projectData._id, rawData, function(err, res) {
		if(callback) {
			callback(err, res);
		}
		App.projectModified.set(false);
	});
};

App.setModified = function() {
	App.project.set(App.project.get());
	App.projectModified.set(true);
	App.addUndoPoint();
};

App.refreshWindowSize = function() {
	var win = $(window);
	Session.set("windowSize", {
		_id: Random.id(),
		width: win.width(),
		height: win.height()
	});
};

Meteor.startup(function() {
	App.terminalEyeURL = Meteor.settings.public.terminalEyeURL;
	App.buildServerURL = Meteor.settings.public.buildServerURL;
	App.kitchenURL = Meteor.absoluteUrl().replace(/\/+$/, "");

	$(window).resize(function() {
		App.refreshWindowSize();
	});

	App.refreshWindowSize();
});

Accounts.onLogin(function() {
	Meteor.call("logCurrentUserIP", function(e, r) {
		if(e) {
			console.log(e);
			return;
		}
	});
});

Tracker.autorun(function () {
	var editingProjectId = Session.get("editingProjectId");
	if(editingProjectId) {
		var projectData = Applications.findOne({_id: editingProjectId }, {});
		if(projectData && projectData.data) {
			// only if projectId is changed
			if(!App.projectData || App.projectData._id != projectData._id) {
				// --- create kitchen object ---
				App.projectData = projectData;
				var kitchen = ClassKitchen.create("kitchen");
				kitchen.load(App.projectData.data);
				App.project.set(kitchen);
				App.projectModified.set(false);


				// --- init undo buffer ---
				App.undoBuffer.set([]);
				App.addUndoPoint();

				// --- page editor ---
				var pageEditorSelectedObject = "";
				var pageEditorExpandedNodes = [];
				if(kitchen.application) {
					if(kitchen.application.free_zone) {
						pageEditorExpandedNodes.push(kitchen.application.free_zone._id);
					}
					if(kitchen.application.public_zone) {
						pageEditorExpandedNodes.push(kitchen.application.public_zone._id);
					}
					if(kitchen.application.private_zone) {
						pageEditorExpandedNodes.push(kitchen.application.private_zone._id);
					}
					if(pageEditorExpandedNodes.length) {
						pageEditorSelectedObject = pageEditorExpandedNodes[0];
					}
				}
				Session.set("pageEditorSelectedObject", pageEditorSelectedObject);
				Session.set("pageEditorFocusedObject", pageEditorSelectedObject);
				Session.set("pageEditorExpandedNodes", pageEditorExpandedNodes);
				// ---

				// --- database editor ---
				var databaseEditorSelectedObject = "";
				var databaseEditorExpandedNodes = [];
				if(kitchen.application) {
					if(kitchen.application.collections) {
						databaseEditorExpandedNodes.push(kitchen.application.collections._id);
					}
					if(kitchen.application.queries) {
						databaseEditorExpandedNodes.push(kitchen.application.queries._id);
					}
					if(databaseEditorExpandedNodes.length) {
						databaseEditorSelectedObject = databaseEditorExpandedNodes[0];
					}
				}
				Session.set("databaseEditorSelectedObject", databaseEditorSelectedObject);
				Session.set("databaseEditorFocusedObject", databaseEditorSelectedObject);
				Session.set("databaseEditorExpandedNodes", databaseEditorExpandedNodes);
				// ---

				if(!App.terminalBusy.get()) {
					App.clearTerminalLog();
				}
/*
var newKitchen = ClassKitchen.create("kitchen");
newKitchen.load(kitchen.save(null, true, true));
console.log(kitchen.isEqual(newKitchen));
*/

			}

			if(!App.projectData.buildOptions) {
				var buildOptions = {
					outputDir: "output_dir",
					templating: "",
					coffee: false,
					jade: false
				};

				var kitchen = App.project.get();
				if(kitchen) {
					buildOptions.outputDir = App.projectData.slug;
					buildOptions.templating = "";
					buildOptions.coffee = false;
					buildOptions.jade = false;
				}

				App.projectData.buildOptions = buildOptions;
			}
			App.buildOptions.set(App.projectData.buildOptions);

			if(!App.projectData.deployOptions) {
				var deployOptions = {
					productionURL: ""
				};

				App.projectData.deployOptions = deployOptions;
			}
			App.deployOptions.set(App.projectData.deployOptions);
		}
	}
});

// global variables
Meteor.call("userCount", function(err, res) {
	Session.set("userCount", res);
});

Meteor.call("publicAppCount", function(err, res) {
	Session.set("publicAppCount", res);
});

Meteor.call("totalAppCount", function(err, res) {
	Session.set("totalAppCount", res);
});

getUserEmail = function() {
	var email = "";
	var user = Meteor.user();
	if(user && user.profile && user.profile.email) {
		email = user.profile.email;
	} else {
		if(user.emails && user.emails.length) {
			emailObj = _.find(user.emails, function(obj) {
				obj.verified == true;
			});
			if(!emailObj) {
				emailObj = user.emails[0];
			}
			email = emailObj.address;
		} else {
			if(user.services && user.services.google && user.services.google.email) {
				email = user.services.google.email;
			}
		}
	}
	return email;
};


App.logout = function() {
	Meteor.logout(function(err) {
	});
};

this.menuItemClass = function(routeName) {
	if(!routeGranted(routeName)) {
		return "hidden";
	}

	if(!Router.current() || !Router.current().route) {
		return "";
	}

	if(!Router.routes[routeName]) {
		return "";
	}

	var currentPath = Router.routes[Router.current().route.getName()].handler.path;
	var routePath = Router.routes[routeName].handler.path;

	if(routePath === "/") {
		return (currentPath == routePath || Router.current().route.getName().indexOf(routeName + ".") == 0) ? "active" : "";
	}

	return currentPath.indexOf(routePath) === 0 ? "active" : "";
};

this.countryName = function(countryCode) {
	var country = CountryCodes.find(function(c) { return c.code == countryCode; }) || {};
	return country.name || "";
};


this.Helpers = {};

Helpers.menuItemClass = function(routeName) {
	return menuItemClass(routeName);
};

Helpers.userFullName = function() {
	var name = "";
	if(Meteor.user() && Meteor.user().profile)
		name = Meteor.user().profile.name;
	return name;
};

Helpers.userEmail = function() {
	return getUserEmail();
};

Helpers.username = function() {
	var username = "";
	if(Meteor.user() && Meteor.user().profile)
		username = Meteor.user().profile.username || "";
	return username;
};

Helpers.currentUserId = function() {
	return Meteor.userId();
}

Helpers.userAvatarURL = function(userId, size) {
	var url = "";
	var user = null;

	if(!userId) {
		return "";
	}
	user = Users.findOne({ _id: userId });

	size = size || 80;

	if(user && user.profile) {
		if(user.profile.avatarURL) {
			url = user.profile.avatarURL;
		} else {
			if(user.profile.email) {
				url = Gravatar.imageUrl(user.profile.email, {
					d: "identicon",
					s: size,
					secure: true
				});
			}
		}
	}
	return url;
}

Helpers.randomString = function(strLen) {
	return Random.id(strLen);
};

Helpers.secondsToTime = function(seconds, timeFormat) {
	return secondsToTime(seconds, timeFormat);
};

Helpers.integerDayOfWeekToString = function(day) {
	if(_.isArray(day)) {
		var s = "";
		_.each(day, function(d, i) {
			if(i > 0) {
				s = s + ", ";
			}
			s = s + ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d];
		});
		return s;
	}
	return ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][day];
};

Helpers.formatDate = function(date, dateFormat) {
	if(!date) {
		return "";
	}

	var f = dateFormat || "MM/DD/YYYY";

	if(_.isString(date)) {
		if(date.toUpperCase() == "NOW") {
			date = new Date();
		}
		if(date.toUpperCase() == "TODAY") {
			var d = new Date();
			date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
		}
	}

	return moment(date).format(f);
};

Helpers.booleanToYesNo = function(b) {
	return b ? "Yes" : "No";
};

Helpers.integerToYesNo = function(i) {
	return i ? "Yes" : "No";
};

Helpers.integerToTrueFalse = function(i) {
	return i ? "True" : "False";
};

Helpers.countryName = function(countryCode) {
	return countryName(countryCode) || countryCode;
};


// Tries to convert argument to array
//   array is returned unchanged
//   string "a,b,c" or "a, b, c" will be returned as ["a", "b", "c"]
//   for other types, array with one element (argument) is returned
//   TODO: implement other types to array conversion
Helpers.getArray = function(a) {
	a = a || [];
	if(_.isArray(a)) return a;
	if(_.isString(a)) {
		var array = a.split(",") || [];
		_.each(array, function(item, i) { array[i] = item.trim(); });
		return array;
	}

	/* object... what to return? keys or values?
	if(_.isObject(a)) {
	}
	*/

	var array = [];
	array.push(a);
	return array;
};

Helpers.cursorEmpty = function(cursor) {
	return cursor && cursor.count();
};

Helpers.userCount = function() {
	return Session.get("userCount") || 0;
};

Helpers.gotUserCount = function() {
	var userCount = Session.get("userCount");
	return !!userCount || userCount == 0;
};

Helpers.publicAppCount = function() {
	return Session.get("publicAppCount") || 0;
};

Helpers.gotPublicAppCount = function() {
	var publicAppCount = Session.get("publicAppCount");
	return !!publicAppCount || publicAppCount == 0;
};

Helpers.totalAppCount = function() {
	return Session.get("totalAppCount") || 0;
};

Helpers.gotTotalAppCount = function() {
	var totalAppCount = Session.get("totalAppCount");
	return !!totalAppCount || totalAppCount == 0;
};

_.each(Helpers, function (helper, key) {
	Handlebars.registerHelper(key, helper);
});
