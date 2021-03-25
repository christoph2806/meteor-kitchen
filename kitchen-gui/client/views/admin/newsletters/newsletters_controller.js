this.AdminNewslettersController = RouteController.extend({
	template: "Admin",

	yieldTemplates: {
		'AdminNewsletters': { to: 'AdminSubcontent'},
	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		if(this.isReady()) { this.render(); } else { this.render("Admin"); this.render("loading", { to: "AdminSubcontent" });}
	},

	isReady: function() {
		

		var subs = [
			Meteor.subscribe("newsletters")
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
			newsletters: Newsletters.find({
			}, {
				sort: { createdAt: -1 }
			})
		};
	},

	onAfterAction: function() {
		
	}
});
