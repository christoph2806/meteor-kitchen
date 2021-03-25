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
