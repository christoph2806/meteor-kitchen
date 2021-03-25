Meteor.publish("blog", function(groupName) {
	return Blog.find({ groupName: groupName }, {});
});
