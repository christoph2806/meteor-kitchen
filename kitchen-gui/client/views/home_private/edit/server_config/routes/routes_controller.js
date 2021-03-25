this.HomePrivateEditServerConfigRoutesController = RouteController.extend({
	template: "HomePrivateEditServerConfig",
	layoutTemplate: "DesignerLayout",

	yieldTemplates: {
		'HomePrivateEditServerConfigRoutes': { to: 'HomePrivateEditServerConfigSubcontent'}
		
	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		Session.set("editingProjectId", this.params.applicationId);
		if(this.isReady()) { this.render(); } else { this.render("HomePrivateEditServerConfig"); this.render("loading", { to: "HomePrivateEditServerConfigSubcontent" });}
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