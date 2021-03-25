this.DevelopersController = RouteController.extend({
	template: "Developers",


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
			Meteor.subscribe("all_users", Session.get("developersPageNo"), Session.get("developersSearchText"), Session.get("developersFilter"))
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

		var users = null;
		var searchText = Session.get("developersSearchText");
		var filterList = Session.get("developersFilter");

		var filter = {};
		if(filterList) {
			if(filterList.indexOf("availableForHire") >= 0) {
				filter["profile.availableForHire"] = true;
			}
		}

		if(searchText) {
			var searchRegExp = new RegExp(searchText, 'i');

			filter["$or"] = [
				{ "profile.name": searchRegExp },
				{ "profile.username": searchRegExp }
			];
		}

		users = Users.find(filter, {
			sort: { createdAt: -1 },
			limit: limit
		});

		return {
			params: this.params || {},
			users: users
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {

	}
});
