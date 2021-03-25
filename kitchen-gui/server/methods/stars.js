Meteor.methods({
	"toggleStarApplication": function(applicationId) {
		if(!this.userId || !applicationId) {
			throw new Meteor.Error("starApplication", "Invalid arguments");
		}

		var application = Applications.findOne({ _id: applicationId });
		if(!application) {
			throw new Meteor.Error("starApplication", "Application not found.");
		}

		var star = Stars.findOne({
			applicationId: application._id,
			createdBy: this.userId
		});

		if(star) {
			Stars.remove({ _id: star._id });
		} else {
			Stars.insert({
				applicationId: application._id,
				userId: application.createdBy
			});
		}
	},
	"toggleStarJob": function(jobId) {
		if(!this.userId || !jobId) {
			throw new Meteor.Error("starJob", "Invalid arguments");
		}

		var job = Jobs.findOne({ _id: jobId });
		if(!job) {
			throw new Meteor.Error("starJob", "Job not found.");
		}

		var star = Stars.findOne({
			jobId: job._id,
			createdBy: this.userId
		});

		if(star) {
			Stars.remove({ _id: star._id });
		} else {
			Stars.insert({
				jobId: job._id,
				userId: job.createdBy
			});
		}
	}
});
