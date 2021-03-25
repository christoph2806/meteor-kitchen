
Meteor.publish("public_applications", function(pageNo, searchText, filterList) {
	pageNo = pageNo || 0;
	searchText = searchText || "";
	filterList = filterList || [];

	var limit = 24;
	var skip = pageNo * limit;

	var filter = { public: true };
	var options = {
		sort: { },
		fields: { data: 0 },
		skip: skip,
		limit: limit
	};

	if(searchText) {
		var searchRegExp = new RegExp(searchText, 'i');
		filter["name"] = searchRegExp;
	}

	if(filterList) {
		if(filterList.indexOf("starred") >= 0) {
			if(this.userId) {
				userStarAppIds = _.pluck(Stars.find({ createdBy: this.userId, applicationId: { $ne: null } }).fetch(), "applicationId");
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

	var publicApplications = Applications.find(filter, options);

	var publicAppsFetched = publicApplications.fetch();

	var appIds = _.pluck(publicAppsFetched, "_id");
	var userIds = _.pluck(publicAppsFetched, "createdBy");

	var users = Users.find({ _id: { $in: userIds }}, { fields: { profile: 1, createdAt: 1 } });
	var stars = Stars.find({ applicationId: { $in: appIds }});

	return [
		publicApplications,
		users,
		stars
	];
});

Meteor.publish("public_application", function(applicationId) {
	var public_application = Applications.find({
		_id: applicationId,
		$or: [ { createdBy: this.userId }, { public: true } ]
	}, {

	});

	if(public_application.count()) {
		var app = public_application.fetch()[0];
		var user = Users.find({ _id: app.createdBy }, { fields: { profile: 1, createdAt: 1 } });
		var stars = Stars.find({ applicationId: app._id });

		return [
			public_application,
			user,
			stars
		];
	}

	return public_application;
});


Meteor.publish("my_applications", function() {
	return Applications.find({
		createdBy: this.userId
	}, {
		fields: { data: 0 }
	});
});


Meteor.publish("my_application", function(applicationId) {
	return Applications.find({
		_id: applicationId,
		createdBy: this.userId
	}, {

	});
});

Meteor.publish("application_forks", function(applicationId) {
	var forks = Applications.find({
		forkedAppId: applicationId,
		$or: [ { createdBy: this.userId }, { public: true } ]
	}, {
		fields: { data: 0 }
	});

	var appIds = _.pluck(forks.fetch(), "_id");
	var userIds = _.pluck(forks.fetch(), "createdBy");

	var users = Users.find({ _id: { $in: userIds }}, { fields: { profile: 1, createdAt: 1 } });
	var stars = Stars.find({ applicationId: { $in: appIds }});

	return [
		forks,
		users,
		stars
	];
});

Meteor.publish("users_public_applications", function(userId) {
	return Applications.find({
		public: true,
		createdBy: userId
	}, {
		fields: { data: 0 }
	});
});

Meteor.publish("stargazers_applications", function(applicationId) {
	var users = _.pluck(Stars.find({ applicationId: applicationId }, { fields: { createdBy: 1 } }).fetch(), "createdBy");
	return Applications.find({
		createdBy: { $in: users },
		$or: [ { createdBy: this.userId }, { public: true } ]
	}, {
	});
});


Meteor.publish("boilerplate_applications", function() {
	return Applications.find({
		boilerplate: true
	}, {});
});
