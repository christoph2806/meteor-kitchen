Meteor.methods({
	"createUserAccount": function(options) {
		if(!Users.isAdmin(Meteor.userId())) {
			throw new Meteor.Error(403, "Access denied.");
		}

		var userOptions = {};
		if(options.username) userOptions.username = options.username;
		if(options.email) userOptions.email = options.email;
		if(options.password) userOptions.password = options.password;
		if(options.profile) userOptions.profile = options.profile;
		if(options.profile && options.profile.username) userOptions.username = options.profile.username;
		if(options.profile && options.profile.email) userOptions.email = options.profile.email;

		Accounts.createUser(userOptions);
	},
	"updateUserAccount": function(userId, options) {
		// only admin or users own profile
		if(!(Users.isAdmin(Meteor.userId()) || userId == Meteor.userId())) {
			throw new Meteor.Error(403, "Access denied.");
		}

		// non-admin user can change only profile
		if(!Users.isAdmin(Meteor.userId())) {
			var keys = Object.keys(options);
			if(keys.length !== 1 || !options.profile) {
				throw new Meteor.Error(403, "Access denied.");
			}
		}

		var userOptions = {};
		if(options.username) userOptions.username = options.username;
		if(options.email) userOptions.email = options.email;
		if(options.password) userOptions.password = options.password;
		if(options.profile) userOptions.profile = options.profile;

		if(options.profile && options.profile.username) userOptions.username = options.profile.username;
		if(options.profile && options.profile.email) userOptions.email = options.profile.email;
		if(options.roles) userOptions.roles = options.roles;

		var username = "";
		if(userOptions.username) {
			username = userOptions.username;
			delete userOptions.username;
		}

		if(userOptions.email) {
			var email = userOptions.email;
			delete userOptions.email;
			userOptions.emails = [{ address: email }];
		}

		var password = "";
		if(userOptions.password) {
			password = userOptions.password;
			delete userOptions.password;
		}

		if(userOptions) {
			Users.update(userId, { $set: userOptions });
		}

		if(username) {
			Accounts.setUsername(userId, username);
		}

		if(password) {
			Accounts.setPassword(userId, password);
		}
	},

	"removeUserAccount": function(userId) {
		if(!this.userId) {
			return;
		}
		// only admin or users own profile
		if(!Users.isAdmin(this.userId) && userId !== this.userId) {
			throw new Meteor.Error(403, "Access denied.");
		} else {
			Users.remove({ _id: userId });
		}
	},

	"userCount": function() {
		return Users.find({}, { fields: { _id: true }}).count();
	},

	"filteredUsersCount": function(searchText, filterList) {
		var filter = {};
		if(filterList) {
			if(filterList.indexOf("availableForHire") >= 0) {
				filter["profile.availableForHire"] = true;
			}
		}

		if(searchText) {
			var searchRegExp = new RegExp(searchText, 'i');

			filter["$or"] = [
				{ "profile.name": searchRegExp },
				{ "profile.username": searchRegExp }
			];
		}

		return Users.find(filter, { fields: { _id: true }}).count();
	},

	"sendVerificationEmail": function(usernameOrEmail) {
		if(!usernameOrEmail) {
			throw new Meteor.Error("sendVerificationEmail", "Unknown username or e-mail");
		}

		var user = Accounts.findUserByEmail(usernameOrEmail);
		if(!user) {
			user = Accounts.findUserByUsername(usernameOrEmail);
			if(!user) {
				throw new Meteor.Error("sendVerificationEmail", "User not found.");
			}
		}
		Accounts.sendVerificationEmail(user._id);
	},


	"userLoginsDaily": function() {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		var aggreg = Promise.await(Logins.aggregate([{ 
			$group: { 
				_id: {	
					year: {
						$year: "$date"
					},
					month: {
						$month: "$date"
					},
					day: {
						$dayOfMonth: "$date"
					}
				},
				count: {
					$sum: 1 
				}
			}
		}]).toArray());

		aggreg = aggreg.sort(function(a, b) {
			if((a._id.year - b._id.year) != 0) {
				return a._id.year - b._id.year;
			}

			if((a._id.month - b._id.month) != 0) {
				return a._id.month - b._id.month;
			}

			return a._id.day - b._id.day;
		});

		return aggreg;
	},

	"userLoginsWeekly": function() {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		var aggreg = Promise.await(Logins.aggregate([{ $group: { _id: { year:{ $year: "$date" }, week:{ $week: "$date" } }, count: { $sum: 1 }}}]).toArray());
		aggreg = aggreg.sort(function(a, b) {
			if((a._id.year - b._id.year) != 0) {
				return a._id.year - b._id.year;
			}

			return a._id.week - b._id.week;
		});
		return aggreg;
	},

	"userGrowthDaily": function() {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		var aggreg = Promise.await(Users.aggregate([{ $group: { _id : {year:{$year:"$createdAt"},month:{$month:"$createdAt"},day:{$dayOfMonth:"$createdAt"}},count:{$sum: 1 }}}]).toArray());
		aggreg = aggreg.sort(function(a, b) {
			if((a._id.year - b._id.year) != 0) {
				return a._id.year - b._id.year;
			}

			if((a._id.month - b._id.month) != 0) {
				return a._id.month - b._id.month;
			}

			return a._id.day - b._id.day;
		});
		return aggreg;
	},

	"userGrowthWeekly": function() {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		var aggreg = Promise.await(Users.aggregate([{ $group: { _id: { year:{ $year: "$createdAt" }, week:{ $week: "$createdAt" } }, count: { $sum: 1 }}}]).toArray());
		aggreg = aggreg.sort(function(a, b) {
			if((a._id.year - b._id.year) != 0) {
				return a._id.year - b._id.year;
			}

			return a._id.week - b._id.week;
		});
		return aggreg;
	},

	"usersPerCountry": function() {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		var list = Promise.await(Users.aggregate([
			{ "$group" : { _id: { code: "$profile.country" }, count: { $sum: 1 } } } 
		]).toArray());

		var normalized = [];
		list.map(function(item) {
			var name = "(not set)";
			if(item._id.code) {
				var country = CountryCodes.find(function(c) { return c.code == item._id.code; });
				if(country) {
					name = country.name;
				} else {
					name = "(unknown)";
				}
			}

			normalized.push({
				code: item._id.code,
				name: name,
				count: item.count
			});
		});


		normalized = normalized.sort(function(a, b) {
			if(a.name < b.name) {
				return -1;
			}

			if(a.name > b.name) {
				return 1;
			}

			return 0;
		});


		return normalized;
	},

	"logCurrentUserIP": function() {
		var userId = this.userId;
		var ip = null;
		if(this.connection) {
			ip = this.connection.clientAddress || null;
			if(!ip && this.connection.httpHeaders) {
				ip = this.connection.httpHeaders["x-forwarded-for"] || null;
			}
		}

		if(ip) {
			var info = { ip: ip };
			HTTP.call("GET", "https://ipinfo.io/" + ip, function(e, r) {
				if(!e && r && r.statusCode == 200 && r.data && !r.data.bogon) {
					info = r.data;
				}

				var set = { "secret.ip": info };

				Users.update({ _id: userId }, { $set: set });
			});
		}

		return ip;
	}
});
