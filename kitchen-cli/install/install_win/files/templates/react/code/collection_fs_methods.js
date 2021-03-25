/*IMPORTS*/

Meteor.methods({
	"INSERT_METHOD_NAME": function(data) {
		return COLLECTION_VARIABLE.insert(data);
	},
	"UPDATE_METHOD_NAME": function(id, data) {
		COLLECTION_VARIABLE.update({ _id: id }, { $set: data });
	},
	"REMOVE_METHOD_NAME": function(id) {
		COLLECTION_VARIABLE.remove({ _id: id });
	}
});
