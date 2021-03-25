Meteor.publish("users_app_stars", function(userId) {
	return Stars.find({ userId: userId, applicationId: { $ne: null } }, {});
});

Meteor.publish("application_stars", function(applicationId) {
	return Stars.find({ applicationId: applicationId }, {});
});

Meteor.publish("my_app_stars", function() {
	return Stars.find({ userId: this.userId, applicationId: { $ne: null } }, {});
});
