this.AppDetailsForksController = RouteController.extend({
	template: "AppDetails",
	

	yieldTemplates: {
		'AppDetailsForks': { to: 'AppDetailsSubcontent'}
		
	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		if(this.isReady()) { this.render(); } else { this.render("AppDetails"); this.render("loading", { to: "AppDetailsSubcontent" });}
		/*ACTION_FUNCTION*/
	},

	isReady: function() {
		

		var subs = [
			Meteor.subscribe("public_application", this.params.applicationId),
			Meteor.subscribe("application_forks", this.params.applicationId)
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
			application: Applications.findOne({ _id:this.params.applicationId }, {}),
			forks: Applications.find({
				forkedAppId: this.params.applicationId 
			}, {
				sort: { createdAt: 1 }
			})
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});
