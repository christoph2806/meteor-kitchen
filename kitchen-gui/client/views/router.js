Router.configure({
	templateNameConverter: "upperCamelCase",
	routeControllerNameConverter: "upperCamelCase",
	layoutTemplate: "layout",
	notFoundTemplate: "notFound",
	loadingTemplate: "loading"
});

var publicRoutes = [
	"home_public",
	"login",
	"register",
	"verify_email",
	"forgot_password",
	"reset_password"
];

var privateRoutes = [
	"home",
	"home.insert",
	"home.init",
	"home.settings",
	"home.settings.general",
	"home.settings.webhooks",
	"home.settings.danger",
	"home.edit",
	"home.edit.pages",
	"home.edit.database",
	"home.edit.files",
	"home.edit.server_config",
	"home.edit.server_config.startup",
	"home.edit.server_config.routes",
	"home.edit.server_config.methods",
	"home.edit.client_config",
	"home.edit.client_config.styles",
	"home.edit.client_config.startup",
	"home.edit.client_config.frontend",
	"home.edit.global_config",
	"home.edit.global_config.packages",
	"home.edit.global_config.accounts",
	"home.edit.global_config.wizards",
	"home.edit.source",
	"home.edit.build",
	"home.edit.build.console",
	"home.edit.build.options",
	"home.edit.deploy",
	"jobs.insert",
	"jobs.edit",
	"admin",
	"admin.user_stats",
	"admin.users",
	"admin.users.details",
	"admin.users.edit",
	"admin.newsletters",
	"admin.newsletters.insert",
	"admin.newsletters.details",
	"admin.newsletters.edit",
	"admin.maintenance",
	"messenger",
	"user_settings",
	"user_settings.profile",
	"user_settings.change_pass",
	"user_settings.notifications",
	"user_settings.danger",
	"logout"
];

var freeRoutes = [
	"discover",
	"app_details",
	"app_details.about",
	"app_details.stargazers",
	"app_details.forks",
	"developers",
	"hireme",
	"dev_details",
	"dev_details.profile",
	"dev_details.projects",
	"jobs",
	"jobs.details",
	"news",
	"docs",
	"docs.gui",
	"docs.gui.about",
	"docs.gui.videos",
	"docs.cli",
	"docs.cli.about",
	"docs.cli.getting_started",
	"docs.cli.api_reference",
	"docs.cli.videos",
	"docs.cli.examples",
	"contribute",
	"donate",
	"about",
	"terms",
	"privacy"
];

var roleMap = [
	{ route: "jobs.insert",	roles: ["user", "admin"] },
	{ route: "jobs.edit",	roles: ["user", "admin"] },
	{ route: "admin",	roles: ["admin"] },
	{ route: "admin.user_stats",	roles: ["admin"] },
	{ route: "admin.users",	roles: ["admin"] },
	{ route: "admin.users.details",	roles: ["admin"] },
	{ route: "admin.users.edit",	roles: ["admin"] },
	{ route: "admin.newsletters.insert",	roles: ["admin"] },
	{ route: "admin.newsletters.details",	roles: ["admin"] },
	{ route: "admin.newsletters.edit",	roles: ["admin"] },
	{ route: "admin.maintenance",	roles: ["admin"] }
];

this.firstGrantedRoute = function(preferredRoute) {
	if(preferredRoute && routeGranted(preferredRoute)) return preferredRoute;

	var grantedRoute = "";

	_.every(privateRoutes, function(route) {
		if(routeGranted(route)) {
			grantedRoute = route;
			return false;
		}
		return true;
	});
	if(grantedRoute) return grantedRoute;

	_.every(publicRoutes, function(route) {
		if(routeGranted(route)) {
			grantedRoute = route;
			return false;
		}
		return true;
	});
	if(grantedRoute) return grantedRoute;

	_.every(freeRoutes, function(route) {
		if(routeGranted(route)) {
			grantedRoute = route;
			return false;
		}
		return true;
	});
	if(grantedRoute) return grantedRoute;

	if(!grantedRoute) {
		// what to do?
		console.log("All routes are restricted for current user.");
	}

	return "";
}

// this function returns true if user is in role allowed to access given route
this.routeGranted = function(routeName) {
	if(!routeName) {
		// route without name - enable access (?)
		return true;
	}

	if(!roleMap || roleMap.length === 0) {
		// this app don't have role map - enable access
		return true;
	}

	var roleMapItem = _.find(roleMap, function(roleItem) { return roleItem.route == routeName; });
	if(!roleMapItem) {
		// page is not restricted
		return true;
	}

	if(!Meteor.user() || !Meteor.user().roles) {
		// user is not logged in
		return false;
	}

	// this page is restricted to some role(s), check if user is in one of allowedRoles
	var allowedRoles = roleMapItem.roles;
	var granted = _.intersection(allowedRoles, Meteor.user().roles);
	if(!granted || granted.length === 0) {
		return false;
	}

	return true;
};

Router.ensureLogged = function() {
	if(Meteor.userId() && (!Meteor.user() || !Meteor.user().roles)) {
		return;
	}

	if(!Meteor.userId()) {
		// user is not logged in - redirect to public home
		var redirectRoute = firstGrantedRoute("home_public");
		this.redirect(redirectRoute);
	} else {
		// user is logged in - check role
		if(!routeGranted(this.route.getName())) {
			// user is not in allowedRoles - redirect to first granted route
			var redirectRoute = firstGrantedRoute("home");
			this.redirect(redirectRoute);
		} else {
			this.next();
		}
	}
};

Router.ensureNotLogged = function() {
	if(Meteor.userId() && (!Meteor.user() || !Meteor.user().roles)) {
		return;
	}

	if(Meteor.userId()) {
		var redirectRoute = firstGrantedRoute("home");
		this.redirect(redirectRoute);
	}
	else {
		this.next();
	}
};

// called for pages in free zone - some of pages can be restricted
Router.ensureGranted = function() {
	if(Meteor.userId() && (!Meteor.user() || !Meteor.user().roles)) {
		return;
	}

	if(!routeGranted(this.route.getName())) {
		// user is not in allowedRoles - redirect to first granted route
		var redirectRoute = firstGrantedRoute("");
		this.redirect(redirectRoute);
	} else {
		this.next();
	}
};

Router.waitOn(function() {
	if(Meteor.userId) {
		Meteor.subscribe("current_user_data");

		var editingProjectId = Session.get("editingProjectId");
		if(editingProjectId) {
			Meteor.subscribe("my_application", editingProjectId);
		}
	} 
});

Router.onBeforeAction(function() {
	// loading indicator here
	if(!this.ready()) {
		$("body").addClass("wait");
	} else {
		$("body").removeClass("wait");
		this.next();
	}
});

Router.onBeforeAction(Router.ensureNotLogged, {only: publicRoutes});
Router.onBeforeAction(Router.ensureLogged, {only: privateRoutes});
Router.onBeforeAction(Router.ensureGranted, {only: freeRoutes}); // yes, route from free zone can be restricted to specific set of user roles

Router.onAfterAction(function() {
	GAnalytics.pageview();
});
