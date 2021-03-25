Meteor.publish("all_users", function(pageNo, searchText, filterList) {
	pageNo = pageNo || 0;

	var limit = 24;
	var skip = pageNo * limit;

	var all_users = null;

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

	all_users = Users.find(filter, {
		fields: { profile: 1, createdAt: 1 },
		sort: { createdAt: -1 },
		limit: limit,
		skip: skip
	});

	return all_users;
});

Meteor.publish("user", function(userId) {
	return Users.find({
		_id: userId
	}, {
		fields: { profile: 1, createdAt: 1 }
	});
});

Meteor.publish("application_stargazers", function(applicationId) {
	var users = _.pluck(Stars.find({ applicationId: applicationId }, { fields: { createdBy: 1 } }).fetch(), "createdBy");
	return Users.find({
		_id: { $in: users }
	}, {
		fields: { profile: 1, createdAt: 1 }
	});
});
