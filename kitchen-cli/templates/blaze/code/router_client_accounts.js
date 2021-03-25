Router.configure(/*ROUTER_CONFIG*/);

Router.publicRoutes = [
	/*PUBLIC_ROUTES*/
];

Router.privateRoutes = [
	/*PRIVATE_ROUTES*/
];

Router.freeRoutes = [
	/*FREE_ROUTES*/
];

Router.roleMap = [
	/*ROLE_MAP*/
];

Router.defaultFreeRoute = "FREE_HOME_ROUTE";
Router.defaultPublicRoute = "PUBLIC_HOME_ROUTE";
Router.defaultPrivateRoute = "PRIVATE_HOME_ROUTE";

Router.waitOn(function() { 
	Meteor.subscribe("current_user_data");
});

Router.onBeforeAction(function() {
	// add unique class to body element for each route
	if(Router.current()) {
		var currentRouteName = Router.current().route.getName();
		var prevRouteName = Session.get("currentRouteName");
		if(prevRouteName && prevRouteName != currentRouteName) {
			$("body").removeClass("page-" + toKebabCase(prevRouteName));
		}
		Session.set("currentRouteName", currentRouteName);
		$("body").addClass("page-" + toKebabCase(currentRouteName));
	}

	// loading indicator here
	if(!this.ready()) {
		this.render("loading");
		$("body").addClass("wait");
	} else {
		$("body").removeClass("wait");
		this.next();
	}

});

Router.onBeforeAction(Router.ensureNotLogged, {only: Router.publicRoutes});
Router.onBeforeAction(Router.ensureLogged, {only: Router.privateRoutes});
Router.onBeforeAction(Router.ensureGranted, {only: Router.freeRoutes}); // yes, route from free zone can be restricted to specific set of user roles

Router.map(function () {
	/*ROUTER_MAP*/
});
