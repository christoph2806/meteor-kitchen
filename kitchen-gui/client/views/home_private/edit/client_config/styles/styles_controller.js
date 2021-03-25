this.HomePrivateEditClientConfigStylesController = RouteController.extend({
	template: "HomePrivateEditClientConfig",
	layoutTemplate: "DesignerLayout",

	yieldTemplates: {
		'HomePrivateEditClientConfigStyles': { to: 'HomePrivateEditClientConfigSubcontent'}
		
	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		Session.set("editingProjectId", this.params.applicationId);
		if(this.isReady()) { this.render(); } else { this.render("HomePrivateEditClientConfig"); this.render("loading", { to: "HomePrivateEditClientConfigSubcontent" });}
		/*ACTION_FUNCTION*/
	},

	onBeforeAction: function() {
		this.next();
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
