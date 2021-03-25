Router.configure(/*ROUTER_CONFIG*/);

Router.freeRoutes = [
	/*FREE_ROUTES*/
];

Router.defaultFreeRoute = "FREE_HOME_ROUTE";

Router.onBeforeAction(function() {
	// loading indicator here
	if(!this.ready()) {
		this.render('loading');
		$("body").addClass("wait");
	} else {
		$("body").removeClass("wait");
		this.next();
	}
});

Router.map(function () {
	/*ROUTER_MAP*/
});
