this.DocsCliVideosController = RouteController.extend({
	template: "DocsCli",
	

	yieldTemplates: {
		'DocsCliVideos': { to: 'CliSubcontent'}
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
			Meteor.subscribe("blog", "cli_official_videos"),
			Meteor.subscribe("blog", "cli_contrib_videos")
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
			official_videos: Blog.find({ groupName: "cli_official_videos" }, { sort: { createdAt: -1 } }),
			contrib_videos: Blog.find({ groupName: "cli_contrib_videos" }, { sort: { createdAt: -1 } })
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});