Meteor.methods({
	"markAllUsersAsSubscribed": function() {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		Users.update({ "profile.nomail": { "$exists" : false } }, { $set: { "profile.subscribedToNewsletters": true }}, { multi: true });
		Users.update({ "profile.nomail": true }, { $set: { "profile.subscribedToNewsletters": false }}, { multi: true });
	},

	"markUsersWithoutEmail": function() {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		Users.find().forEach(function(doc, index) {
			console.log("user: " + index);
			if(!doc.emails || !doc.emails.length) {
				Users.update({ _id: doc._id }, { $set: { "profile.nomail": true }});
			}
		});
	},

	"convertData": function() {
		console.log("Converting data to new format...");

		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		Applications.find({}, {}).forEach(function(doc, index) {
			console.log("app: " + index);
			var set = {
				forkCount: 0,
				starCount: 0
			};

			if(!doc.createdBy) { set.createdBy = doc.ownerId }
			if(!doc.hasOwnProperty("public")) { set.public = true; }
			if(!doc.slug) { set.slug = appGetUniqueSlug(doc._id, doc.name); }


			var kitchenObj = ClassKitchen.create("kitchen");
			kitchenObj.load(doc.data);
			doc.data = kitchenObj.save(null, true, false);

			if(!doc.createdBy || !doc.hasOwnProperty("public") || !doc.slug) {
				Applications.update({ _id: doc._id }, {
					$set: set
				});
			}
		});

		Users.find().forEach(function(doc, index) {
			console.log("user: " + index);
			if(!doc.profile.username) {
				var username = "";
				if(!doc.profile.email) {
					if(doc.services && doc.services.github) {
						username = doc.services.github.username || "";
					}
				} else {
					username = doc.profile.email.split("@")[0];
				}

				var index = 0;
				var unique_username = username;
				do {
					if(index) {
						unique_username = username + index;
					}
					index++;
				} while(Users.findOne({ _id: { $ne: doc._id }, "profile.username": unique_username }, { fields: { _id: 1 }}));

				var publicProjectCount = Applications.find({
					createdBy: doc._id,
					public: true
				}, {
					fields: { _id: 1 }
				}).count();

				Users.update({
					_id: doc._id
				}, {
					$set: {
						"profile.username": unique_username,
						"profile.publicProjectCount": publicProjectCount
					}
				});
			}

		});

		console.log("OK");		
	}
})