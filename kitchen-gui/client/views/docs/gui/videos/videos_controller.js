this.DocsGuiVideosController = RouteController.extend({
	template: "DocsGui",
	

	yieldTemplates: {
		'DocsGuiVideos': { to: 'GuiSubcontent'}
	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		if(this.isReady()) { this.render(); } else { this.render("DocsGui"); this.render("loading", { to: "GuiSubcontent" });}
		/*ACTION_FUNCTION*/
	},

	isReady: function() {
		

		var subs = [
			Meteor.subscribe("blog", "gui_official_videos"),
			Meteor.subscribe("blog", "gui_contrib_videos")
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
			official_videos: Blog.find({ groupName: "gui_official_videos" }, { sort: { createdAt: -1 } }),
			contrib_videos: Blog.find({ groupName: "gui_contrib_videos" }, { sort: { createdAt: -1 } })
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});
