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
