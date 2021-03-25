Meteor.publish("my_files", function(projectId) {
	var filter = { createdBy: this.userId };
	if(projectId) {
		filter["projectId"] = projectId;
	}

	return Files.find(filter, {});
});
