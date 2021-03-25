this.DevDetailsProjectsController = RouteController.extend({
	template: "DevDetails",


	yieldTemplates: {
		'DevDetailsProjects': { to: 'DevDetailsSubcontent'}

	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		if(this.isReady()) { this.render(); } else { this.render("DevDetails"); this.render("loading", { to: "DevDetailsSubcontent" });}
		/*ACTION_FUNCTION*/
	},

	isReady: function() {


		var subs = [
			Meteor.subscribe("user", this.params.userId),
			Meteor.subscribe("users_public_applications", this.params.userId),
			Meteor.subscribe("users_app_stars", this.params.userId),
			Meteor.subscribe("contact", this.params.userId)
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
			user: Users.findOne({_id: this.params.userId}, {}),
			applications: Applications.find({
				createdBy: this.params.userId,
				public: true
			}, {
				sort: { createdAt: 1 }
			}),
			contact: Contacts.findOne({ 
				$or: [
					{ fromUserId: this.params.userId, toUserId: Meteor.userId() },
					{ toUserId: this.params.userId, fromUserId: Meteor.userId() }
				]
			})
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {

	}
});
