this.HomePrivateSettingsGeneralController = RouteController.extend({
	template: "HomePrivateSettings",
	

	yieldTemplates: {
		'HomePrivateSettingsGeneral': { to: 'HomePrivateSettingsSubcontent'}
		
	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		if(this.isReady()) { this.render(); } else { this.render("HomePrivateSettings"); this.render("loading", { to: "HomePrivateSettingsSubcontent" });}
		/*ACTION_FUNCTION*/
	},

	isReady: function() {
		

		var subs = [
			Meteor.subscribe("my_application", this.params.applicationId)
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
			application: Applications.findOne({
				_id: this.params.applicationId,
				createdBy: Meteor.userId()
			}, {
				
			})
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});