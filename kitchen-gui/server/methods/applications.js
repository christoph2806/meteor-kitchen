this.appSlugIsUnique = function(applicationId, slug) {
	var application = Applications.findOne({
		_id: { $ne: applicationId },
		slug: slug
	}, {
		fields: { _id: 1 }
	});

	if(application) {
		return false;
	}

	return true;
};

this.appGetUniqueSlug = function(applicationId, name) {
	var slug = convertToSlug(name);

	var index = 0;
	var uniqueSlug = slug;
	do {
		if(index) {
			uniqueSlug = slug + index;
		}
		index++;
	} while(!appSlugIsUnique(applicationId, uniqueSlug));

	return uniqueSlug;
}

this.ApplicationWebhook = function(applicationId, userId, webhookName) {
	var self = this;
	var application = Applications.findOne({
		_id: applicationId,
		createdBy: userId
	});

	if(!application) {
		return;
	}

	if(application.webhooks && application.webhooks[webhookName] && application.webhooks[webhookName].url) {

		Webhook(application.webhooks[webhookName].url, function(e, r) {
			var statusCode = null;
			if(e) {
				statusCode = e.code;
			} else {
				if(r && r.statusCode) {
					statusCode = r.statusCode;
				}
			}

			var set = {};
			set["webhooks." + webhookName + ".statusCode"] = statusCode;
			set["webhooks." + webhookName + ".time"] = new Date();

			Applications.update({ _id: applicationId }, { $set: set }, function(e, r) {});
		});
	}
};

Meteor.methods({
	"totalAppCount": function() {
		var count = Applications.find({}, { fields: { _id: 1 } }).count();
		return count;
	},

	"publicAppCount": function() {
		var count = Applications.find({ public: true }, { fields: { _id: 1 } }).count();
		return count;
	},

	"filteredPublicAppCount": function(searchText, filterList) {
		var filter = { public: true };

		if(searchText) {
			var searchRegExp = new RegExp(searchText, 'i');
			filter["name"] = searchRegExp;
		}

		if(filterList) {
			if(filterList.indexOf("starred") >= 0) {
				if(this.userId) {
					userStarAppIds = _.pluck(Stars.find({ createdBy: this.userId, applicationId: { $ne: null } }).fetch(), "applicationId");
					filter["_id"] = { $in: userStarAppIds };
				} else {
					filter["starCount"] = { $gt: 0 };
				}
			}
			if(filterList.indexOf("featured") >= 0) {
				filter["featured"] = true;
			}
		}

		return Applications.find(filter, { fields: { _id: 1 } }).count();
	},

	"toggleAppPublic": function(applicationId) {
		if(!applicationId) {
			throw new Meteor.Error("toggleAppPublic", "Invalid arguments.");
		}

		var application = Applications.findOne({
			_id: applicationId,
			createdBy: this.userId
		});

		if(!application) {
			throw new Meteor.Error("toggleAppPublic", "Application not found.");			
		}

		Applications.update({
			_id: application._id
		}, {
			$set: {
				public: !application.public
			}
		});
	},

	"appSlugIsUnique": function(applicationId, slug) {
		return appSlugIsUnique(applicationId, slug);
	},

	"testApplicationWebhook": function(applicationId, webhookName) {
		this.unblock();
		ApplicationWebhook(applicationId, this.userId, webhookName);
	},

	"saveApp": function(applicationId, data) {
		var self = this;
		var application = Applications.findOne({
			_id: applicationId,
			createdBy: this.userId
		});

		if(!application) {
			throw new Meteor.Error("saveApp", "Application not found.");
		}

		var kitchen = ClassKitchen.create("kitchen");
		kitchen.load(data);

		var rawData = kitchen.save(null, true, false);
		Applications.update({ _id: applicationId }, { $set: { data: rawData } }, function(e, r) {
			if(e) {
				throw e;
			}
			self.unblock();
			ApplicationWebhook(applicationId, self.userId, "onSave");
		});
	},

	"saveBuildOptions": function(applicationId, buildOptions) {
		var application = Applications.find({
			_id: applicationId,
			createdBy: this.userId
		});

		if(!application) {
			throw new Meteor.Error("saveBuildOptions", "Application not found.");
		}

		Applications.update({ _id: applicationId }, { $set: { buildOptions: buildOptions } });
	},

	"saveDeployOptions": function(applicationId, deployOptions) {
		var application = Applications.find({
			_id: applicationId,
			createdBy: this.userId
		});

		if(!application) {
			throw new Meteor.Error("saveDeployOptions", "Application not found.");
		}

		Applications.update({ _id: applicationId }, { $set: { deployOptions: deployOptions } });
	}

});
