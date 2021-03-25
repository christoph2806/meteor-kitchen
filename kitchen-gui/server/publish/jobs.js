Meteor.publish("jobs", function(pageNo, searchText, filterList) {
	pageNo = pageNo || 0;
	searchText = searchText || "";
	filterList = filterList || [];

	var limit = 24;
	var skip = pageNo * limit;

	var filter = { };
	var options = {
		sort: { },
		skip: skip,
		limit: limit
	}

	if(searchText) {
		var searchRegExp = new RegExp(searchText, 'i');
		filter["name"] = searchRegExp;
	}

	if(filterList) {
		if(filterList.indexOf("starred") >= 0) {
			if(this.userId) {
				userStarJobIds = _.pluck(Stars.find({ createdBy: this.userId, jobId: { $ne: null } }).fetch(), "jobId");
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

	var publicJobsFetched = jobs.fetch();

	var jobIds = _.pluck(publicJobsFetched, "_id");
	var userIds = _.pluck(publicJobsFetched, "createdBy");

	var users = Users.find({ _id: { $in: userIds }}, { fields: { profile: 1 } });
	var stars = Stars.find({ jobId: { $in: jobIds }});

	return [
		jobs,
		users,
		stars
	];
});

Meteor.publish("job", function(jobId) {
	return Jobs.find({ _id: jobId });
});

Meteor.publish("job_details", function(jobId) {
	var job = Jobs.find({ _id: jobId }, {});

	var jobArray = job.fetch();
	if(!jobArray || !jobArray.length) {
		return this.ready();
	}

	var jobObj = jobArray[0];

	var user = Users.find({ _id: jobObj.createdBy }, { fields: { profile: 1 } });
	var stars = Stars.find({ jobId: jobObj._id });

	return [
		job,
		user,
		stars
	];

});
