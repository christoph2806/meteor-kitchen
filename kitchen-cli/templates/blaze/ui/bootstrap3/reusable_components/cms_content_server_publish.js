Meteor.publish({
	"cms_content": function(name) {
		return CMSContentCollection.find({ name: name });
	},

	"cms_file": function(fileId) {
		return CMSFileCollection.files.find({ _id: fileId });
	}

});
