import { CMSContentCollection } from "BOTH_COLLECTIONS_DIR/cms_content.js";

Meteor.publish({
	"cms_content": function(name) {
		return CMSContentCollection.find({ name: name });
	}
});
