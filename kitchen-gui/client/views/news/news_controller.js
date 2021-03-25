this.NewsController = RouteController.extend({
	template: "News",
	

	yieldTemplates: {
		/*YIELD_TEMPLATES*/
	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		if(this.isReady()) { this.render(); } else { this.render("loading"); }
		/*ACTION_FUNCTION*/
	},

	isReady: function() {
		

		var subs = [
			Meteor.subscribe("blog", "news"),
			Meteor.subscribe("blog", "events")
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
			news_blog: Blog.find({ groupName: "news" }, { sort: { createdAt: -1 } }),
			events_blog: Blog.find({ groupName: "events" }, { sort: { createdAt: -1 } })
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});