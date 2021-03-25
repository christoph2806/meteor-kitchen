var prerenderio = require("prerender-node");

Meteor.startup(function() {
	if(Meteor.settings.PrerenderIO) {

		for(var key in Meteor.settings.PrerenderIO) {
			prerenderio.set(key, Meteor.settings.PrerenderIO[key]);
		}

		prerenderio.set("afterRender", function afterRender(error) {
			if(error) {
				console.log("prerenderio error", error);
				return;
			}
		});

		WebApp.rawConnectHandlers.use(prerenderio);

	} else {
		console.log("Prerender service not configured.");
	}
});
