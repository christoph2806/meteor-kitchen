import { CMSContentCollection, CMSFileCollection } from "BOTH_COLLECTIONS_DIR/cms_content.js";

Meteor.publish({
	"cms_content": function(name) {
		return CMSContentCollection.find({ name: name }, { sort: { order: 1, createdAt: 1 }});
	},

	"cms_file": function(fileId) {
		return CMSFileCollection.files.find({ _id: fileId });
	}
});
