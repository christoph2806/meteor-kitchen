import { CMSContentCollection } from "BOTH_COLLECTIONS_DIR/cms_content.js";

CMSContentCollection.allow({
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
