WebApp.connectHandlers.use('/', (req, res, next) => {
	if(!req.url) {
		next();
		return;
	}

	var url = req.url;
	if(url.indexOf("?") >= 0) {
		url = url.split("?")[0];
	}

	for(var routeName in Router.routes) {
		var route = Router.routes[routeName];
		if(route.handler && route.handler.compiledUrl && route.handler.compiledUrl.regexp) {
			if(route.handler.compiledUrl.regexp.test(req.url) || route.handler.compiledUrl.regexp.test(url)) {
				next();
				return;
			}
		}
	}

	var page = Assets.getText("service/404.html");
	var contentType = "text/html";

	var absoluteURL = Meteor.absoluteUrl() || "";

	page = replaceSubstrings(page, "__REQUESTED_URL__", req.url);
	page = replaceSubstrings(page, "__HOME_URL__", absoluteURL);


	res.writeHead(404, {
		"Content-Type": contentType,
		"Cache-Control": "no-cache, no-store, max-age=0, must-revalidate"
	});

	res.end(page);
});
