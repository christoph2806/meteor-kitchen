this.HomePrivateEditClientConfigController = RouteController.extend({
	template: "HomePrivateEditClientConfig",
	layoutTemplate: "DesignerLayout",

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		Session.set("editingProjectId", this.params.applicationId);
		this.redirect('home.edit.client_config.styles', this.params || {}, { replaceState: true });
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
