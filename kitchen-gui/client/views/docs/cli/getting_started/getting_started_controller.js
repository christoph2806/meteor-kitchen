this.DocsCliGettingStartedController = RouteController.extend({
	template: "DocsCli",
	
	layoutTemplate: "FixedLayout",

	yieldTemplates: {
		'DocsCliGettingStarted': { to: 'CliSubcontent'}
	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		if(this.isReady()) { this.render(); } else { this.render("DocsCli"); this.render("loading", { to: "CliSubcontent" });}
		/*ACTION_FUNCTION*/
	},

	isReady: function() {
		

		var subs = [
		];
		var ready = true;
		_.each(subs, function(sub) {
			if(!sub.ready())
				ready = false;
		});
		return ready;
	},

	data: function() {
		

		return {
			params: this.params || {}
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});
