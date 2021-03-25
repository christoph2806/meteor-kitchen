Meteor.methods({
	"INSERT_METHOD_NAME": function(data) {
		if(!COLLECTION_VARIABLE.userCanInsert(this.userId, data)) {
			throw new Meteor.Error(403, "Forbidden.");
		}

		return COLLECTION_VARIABLE.insert(data);
	},

	"UPDATE_METHOD_NAME": function(id, data) {
		var doc = COLLECTION_VARIABLE.findOne({ _id: id });
		if(!COLLECTION_VARIABLE.userCanUpdate(this.userId, doc)) {
			throw new Meteor.Error(403, "Forbidden.");
		}

		COLLECTION_VARIABLE.update({ _id: id }, { $set: data });
	},

	"REMOVE_METHOD_NAME": function(id) {
		var doc = COLLECTION_VARIABLE.findOne({ _id: id });
		if(!COLLECTION_VARIABLE.userCanRemove(this.userId, doc)) {
			throw new Meteor.Error(403, "Forbidden.");
		}

		COLLECTION_VARIABLE.remove({ _id: id });
	}
});
