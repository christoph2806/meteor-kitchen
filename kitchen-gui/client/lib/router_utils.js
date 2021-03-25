this.getRouteURL = function(routeName, params) {
	var route = Router.routes[routeName];
	if(!route) {
		return "";
	}

	return route.url(params);
};
