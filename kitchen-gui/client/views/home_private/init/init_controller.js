this.HomePrivateInitController = RouteController.extend({
	template: "HomePrivateInit",
	

	yieldTemplates: {
	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		if(this.isReady()) { this.render(); } else { this.render("loading"); }
	},

	isReady: function() {
		var subs = [
			Meteor.subscribe("boilerplate_applications")
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
			params: this.params || {},
			boilerplates: Applications.find({ boilerplate: true })
		};
	},

	onAfterAction: function() {
		
	}
});
