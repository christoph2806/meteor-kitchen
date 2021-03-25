this.JobsController = RouteController.extend({
	template: "Jobs",
	

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
			Meteor.subscribe("jobs", Session.get("jobsPageNo"), Session.get("jobsSearchText"), Session.get("jobsFilter"))
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

		var searchText = Session.get("jobsSearchText");
		var filterList = Session.get("jobsFilter");

		var filter = {};
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
					userStarJobIds = _.pluck(Stars.find({ createdBy: Meteor.userId(), jobId: { $ne: null } }).fetch(), "jobId");
					filter["_id"] = { $in: userStarJobIds };
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

		var jobs = Jobs.find(filter, options);

		return {
			params: this.params || {},
			jobs: jobs
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});
