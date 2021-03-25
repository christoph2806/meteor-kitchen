Meteor.methods({
	"blogPostInsert": function(title, text, groupName) {
		if(!Blog.userCanInsert(this.userId, {})) {
			throw new Meteor.Error(403, "Access denied");
		}

		Blog.insert({ title: title, text: text, groupName: groupName });
	},

	"blogPostUpdate": function(postId, title, text) {
		if(!Blog.userCanUpdate(this.userId, {})) {
			throw new Meteor.Error(403, "Access denied");
		}

		Blog.update({ _id: postId }, { $set: { title: title, text: text } });
	},

	"blogPostRemove": function(postId) {
		if(!Blog.userCanRemove(this.userId, {})) {
			throw new Meteor.Error(403, "Access denied");
		}

		Blog.remove({ _id: postId });
	}
});
