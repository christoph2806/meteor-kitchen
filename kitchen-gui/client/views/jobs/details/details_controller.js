this.JobsDetailsController = RouteController.extend({
	template: "JobsDetails",
	

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
			Meteor.subscribe("job_details", this.params.jobId)
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
			current_user_data: Users.findOne({_id:Meteor.userId()}, {}),
			job: Jobs.findOne({ _id: this.params.jobId })
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});
