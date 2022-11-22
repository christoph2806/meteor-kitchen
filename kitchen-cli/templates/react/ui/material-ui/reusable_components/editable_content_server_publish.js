import { EditableContentCollection } from "BOTH_COLLECTIONS_DIR/editable_content.js";

Meteor.publish({
	"editable_content": function(name) {
		return EditableContentCollection.find({ name: name });
	}
});
