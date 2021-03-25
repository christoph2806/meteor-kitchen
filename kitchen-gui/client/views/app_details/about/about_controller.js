this.AppDetailsAboutController = RouteController.extend({
	template: "AppDetails",
	

	yieldTemplates: {
		'AppDetailsAbout': { to: 'AppDetailsSubcontent'}
		
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
			Meteor.subscribe("public_application", this.params.applicationId)
		];
		var ready = true;
		_.each(subs, function(sub) {
			if(!sub.ready())
				ready = false;
		});
		return ready;
	},

	data: function() {
		var application = Applications.findOne({ _id: this.params.applicationId }, {});
		var createdBy = null;
		if(application) {
			createdBy = application.createdBy;
		}

		var user = Users.findOne({ _id: createdBy }, { fields: { profile: 1, createdAt: 1 } });

		return {
			params: this.params || {},
			application: application,
			user: user
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});