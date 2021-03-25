import { EditableContentCollection } from "BOTH_COLLECTIONS_DIR/editable_content.js";

EditableContentCollection.allow({
    insert: function (userId, doc) {
        return false;
    },

    update: function (userId, doc, fields, modifier) {
        return false;
    },

    remove: function (userId, doc) {
        return false;
    }
});
