import { EditableContentCollection } from "BOTH_COLLECTIONS_DIR/editable_content.js";

EditableContentCollection.allow({
    insert: function (userId, doc) {
        return EditableContentCollection.userCanInsert(userId, doc);
    },

    update: function (userId, doc, fields, modifier) {
        return EditableContentCollection.userCanUpdate(userId, doc);
    },

    remove: function (userId, doc) {
        return EditableContentCollection.userCanRemove(userId, doc);
    }
});
