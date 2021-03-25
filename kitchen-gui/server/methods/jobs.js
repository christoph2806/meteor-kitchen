Meteor.methods({
	"jobsInsert": function(data) {
		if(!Jobs.userCanInsert(this.userId, {})) {
			throw new Meteor.Error(403, "Access denied");
		}
		Jobs.insert(data);
	},
	"jobsUpdate": function(jobId, data) {
		if(!Jobs.userCanUpdate(this.userId, Jobs.findOne({ _id: jobId }))) {
			throw new Meteor.Error(403, "Access denied");
		}
		Jobs.update({ _id: jobId }, { $set: data });
	},
	"jobsRemove": function(jobId) {
		if(!Jobs.userCanRemove(this.userId, Jobs.findOne({ _id: jobId }))) {
			throw new Meteor.Error(403, "Access denied");
		}
		Jobs.remove({ _id: jobId });
	},
	"filteredJobsCount": function(searchText, filterList) {
		var filter = { };

		if(searchText) {
			var searchRegExp = new RegExp(searchText, 'i');
			filter["name"] = searchRegExp;
		}

		if(filterList) {
			if(filterList.indexOf("starred") >= 0) {
				if(this.userId) {
					userStarJobIds = _.pluck(Stars.find({ createdBy: this.userId, jobId: { $ne: null } }).fetch(), "jobId");
					filter["_id"] = { $in: userStarJobIds };
				} else {
					filter["starCount"] = { $gt: 0 };
				}
			}
			if(filterList.indexOf("featured") >= 0) {
				filter["featured"] = true;
			}
		}

		return Jobs.find(filter, { fields: { _id: 1 } }).count();
	}
});
