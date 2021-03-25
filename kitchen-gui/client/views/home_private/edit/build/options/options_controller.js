this.HomePrivateEditBuildOptionsController = RouteController.extend({
	template: "HomePrivateEditBuildOptions",
	layoutTemplate: "DesignerLayout",

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		Session.set("editingProjectId", this.params.applicationId);
		if(this.isReady()) { this.render(); } else { this.render("loading"); }
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
			params: this.params || {},
			terminal: App.terminalOutput.find({}, { sort: { createdAt: 1 }, limit: 500 })
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});
