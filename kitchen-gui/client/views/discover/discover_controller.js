this.DiscoverController = RouteController.extend({
	template: "Discover",


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
			Meteor.subscribe("public_applications", Session.get("discoverPageNo"), Session.get("discoverSearchText"), Session.get("discoverFilter"))
		];
		var ready = true;
		_.each(subs, function(sub) {
			if(!sub.ready())
				ready = false;
		});
		return ready;
	},

	data: function() {
		var limit = 24;

		var searchText = Session.get("discoverSearchText");
		var filterList = Session.get("discoverFilter");

		var filter = { public: true };
		var options = {
			sort: { },
			limit: limit
		};


		if(searchText) {
			var searchRegExp = new RegExp(searchText, 'i');
			filter["name"] = searchRegExp;
		}

		if(filterList) {
			if(filterList.indexOf("starred") >= 0) {
				if(Meteor.userId()) {
					userStarAppIds = _.pluck(Stars.find({ createdBy: Meteor.userId(), applicationId: { $ne: null } }).fetch(), "applicationId");
					filter["_id"] = { $in: userStarAppIds };
					options.sort["starCount"] = -1;
				} else {
					filter["starCount"] = { $gt: 0 };
					options.sort["starCount"] = -1;
				}
			}

			if(filterList.indexOf("featured") >= 0) {
				filter["featured"] = true;
			}
		}

		options.sort["createdAt"] = -1;

		var applications = Applications.find(filter, options);

		return {
			params: this.params || {},
			applications: applications
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {

	}
});
