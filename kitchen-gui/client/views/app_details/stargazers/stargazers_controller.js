this.AppDetailsStargazersController = RouteController.extend({
	template: "AppDetails",
	

	yieldTemplates: {
		'AppDetailsStargazers': { to: 'AppDetailsSubcontent'}
		
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
			Meteor.subscribe("application_stargazers", this.params.applicationId),
			Meteor.subscribe("stargazers_applications", this.params.applicationId)
		];
		var ready = true;
		_.each(subs, function(sub) {
			if(!sub.ready())
				ready = false;
		});
		return ready;
	},

	data: function() {
		var users = _.pluck(Stars.find({ applicationId: this.params.applicationId }, { fields: { createdBy: 1 } }).fetch(), "createdBy");
		return {
			params: this.params || {},
			application: Applications.findOne({_id:this.params.applicationId}, {}),
			stargazers: Users.find({ _id: { $in: users } })
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});
