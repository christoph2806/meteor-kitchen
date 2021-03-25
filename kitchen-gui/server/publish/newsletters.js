Meteor.publish({
	"newsletters": function() {
		if(!Users.isAdmin(this.userId)) {
			return this.ready();
		}

		return Newsletters.find({}, {});
	},
	"newsletter": function(newsletterId) {
		if(!Users.isAdmin(this.userId)) {
			return this.ready();
		}

		return Newsletters.find({
			_id: newsletterId
		}, {
		});
	}
});