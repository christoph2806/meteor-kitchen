Stars.allow({
	insert: function (userId, doc) {
		return Stars.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return Stars.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return Stars.userCanRemove(userId, doc);
	}
});

Stars.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;
});

Stars.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;

	
});

Stars.before.remove(function(userId, doc) {
	
});

Stars.after.insert(function(userId, doc) {
	if(doc.applicationId) {
		var starCount = Stars.find({
			applicationId: doc.applicationId
		}).count();

		Applications.update({
			_id: doc.applicationId
		}, {
			$set: { starCount: starCount }
		});
	}

	if(doc.jobId) {
		var starCount = Stars.find({
			jobId: doc.jobId
		}).count();

		Jobs.update({
			_id: doc.jobId
		}, {
			$set: { starCount: starCount }
		});
	}
});

Stars.after.update(function(userId, doc, fieldNames, modifier, options) {
	
});

Stars.after.remove(function(userId, doc) {
	if(doc.applicationId) {
		var starCount = Stars.find({
			applicationId: doc.applicationId
		}).count();

		Applications.update({
			_id: doc.applicationId
		}, {
			$set: { starCount: starCount }
		});
	}

	if(doc.jobId) {
		var starCount = Stars.find({
			jobId: doc.jobId
		}).count();

		Jobs.update({
			_id: doc.jobId
		}, {
			$set: { starCount: starCount }
		});
	}
});
