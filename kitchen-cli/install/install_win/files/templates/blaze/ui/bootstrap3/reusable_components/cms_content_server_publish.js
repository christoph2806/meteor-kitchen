Meteor.publish({
	"cms_content": function(name) {
		return CMSContentCollection.find({ name: name });
	}
});
