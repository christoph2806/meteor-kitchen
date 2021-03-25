Applications.allow({
	insert: function (userId, doc) {
		return Applications.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return Applications.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return Applications.userCanRemove(userId, doc);
	}
});

Applications.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;
	doc.forkCount = 0;
	doc.starCount = 0;

	if(!doc.slug) {
		doc.slug = appGetUniqueSlug(null, doc.name);
	}

	if(doc.slug != convertToSlug(doc.slug)) {
		throw new Meteor.Error(400, "Slug can contain only letters, numbers and dashes (no spaces, no symbols).");
		return false;		
	}

	if(!appSlugIsUnique(null, doc.slug)) {
		throw new Meteor.Error(400, "Slug \"" + doc.slug + "\" already exists.");
		return false;
	}
});

Applications.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;

	if(modifier.$set.slug) {

		if(modifier.$set.slug != convertToSlug(modifier.$set.slug)) {
			throw new Meteor.Error(400, "Slug can contain only letters, numbers and dashes (no spaces).");
			return false;		
		}

		if(!appSlugIsUnique(doc._id, modifier.$set.slug)) {
			throw new Meteor.Error(400, "Slug \"" + modifier.$set.slug + "\" already exists.");
			return false;
		}
	}

});

Applications.before.remove(function(userId, doc) {

});

Applications.after.insert(function(userId, doc) {
	if(doc.forkedAppId) {
		var forkCount = Applications.find({
			forkedAppId: doc.forkedAppId
		}).count();

		Applications.update({
			_id: doc.forkedAppId
		}, {
			$set: { forkCount: forkCount }
		});
	}

	if(doc.createdBy) {
		var publicProjectCount = Applications.find({
			createdBy: doc.createdBy,
			public: true
		}).count();

		Users.update({
			_id: doc.createdBy
		}, {
			$set: { "profile.publicProjectCount": publicProjectCount }
		});
	}
});

Applications.after.update(function(userId, doc, fieldNames, modifier, options) {

});

Applications.after.remove(function(userId, doc) {
	if(doc.forkedAppId) {
		var forkCount = Applications.find({
			forkedAppId: doc.forkedAppId
		}).count();

		Applications.update({
			_id: doc.forkedAppId
		}, {
			$set: { forkCount: forkCount }
		});
	}

	if(doc.createdBy) {
		var publicProjectCount = Applications.find({
			createdBy: doc.createdBy,
			public: true
		}).count();

		Users.update({
			_id: doc.createdBy
		}, {
			$set: { "profile.publicProjectCount": publicProjectCount }
		});
	}

	Stars.remove({ applicationId: doc._id });
});
