var pageSession = new ReactiveDict();

Template.AdminUserStats.rendered = function() {
	Meteor.call("userLoginsDaily", function(err, res) {
		if(err) {
			console.log(err);
			return;
		}

		pageSession.set("userLoginsDaily", res);
	});

	Meteor.call("userLoginsWeekly", function(err, res) {
		if(err) {
			console.log(err);
			return;
		}

		pageSession.set("userLoginsWeekly", res);
	});


	Meteor.call("userGrowthDaily", function(err, res) {
		if(err) {
			console.log(err);
			return;
		}

		pageSession.set("userGrowthDaily", res);
	});

	Meteor.call("userGrowthWeekly", function(err, res) {
		if(err) {
			console.log(err);
			return;
		}

		pageSession.set("userGrowthWeekly", res);
	});

	Meteor.call("usersPerCountry", function(err, res) {
		if(err) {
			console.log(err);
			return;
		}
		pageSession.set("usersPerCountry", res);
	});
};

Template.AdminUserStats.events({
});

Template.AdminUserStats.helpers({
	"userLoginsDailyChart": function() {
		var cols = [];
		var col1 = ["x"];
		var col2 = ["Login count"];


		var data = pageSession.get("userLoginsDaily") || [];

		_.each(data, function(r) {
			col1.push(r._id.year + "-" + r._id.month + "-" + r._id.day);
			col2.push(parseInt(r.count));
		});
		cols.push(col1);
		cols.push(col2);

		return {
			data: {
				x: "x",
				columns: cols
			},
			axis: {
				x: {
					type: "timeseries",
					tick: {
						count: 24,
						format: "%Y-%m-%d"
					}
				}
			}
		};
	},

	"userLoginsWeeklyChart": function() {
		var cols = [];
		var col1 = ["x"];
		var col2 = ["Login count"];


		var data = pageSession.get("userLoginsWeekly") || [];

		_.each(data, function(r) {
			col1.push(r._id.year + " " + r._id.week);
			col2.push(parseInt(r.count));
		});
		cols.push(col1);
		cols.push(col2);

		return {
			data: {
				x: "x",
				columns: cols
			},
			axis: {
				x: {
					type: "category",
					tick: {
						count: 24
					}
				}
			}
		};
	},




	"userGrowthDailyChart": function() {
		var cols = [];
		var col1 = ["x"];
		var col2 = ["New users"];


		var data = pageSession.get("userGrowthDaily") || [];

		_.each(data, function(r) {
			col1.push(r._id.year + "-" + r._id.month + "-" + r._id.day);
			col2.push(parseInt(r.count));
		});
		cols.push(col1);
		cols.push(col2);

		return {
			data: {
				x: "x",
				columns: cols
			},
			axis: {
				x: {
					type: "timeseries",
					tick: {
						count: 24,
						format: "%Y-%m-%d"
					}
				}
			}
		};
	},

	"userGrowthWeeklyChart": function() {
		var cols = [];
		var col1 = ["x"];
		var col2 = ["New users"];


		var data = pageSession.get("userGrowthWeekly") || [];

		_.each(data, function(r) {
			col1.push(r._id.year + " " + r._id.week);
			col2.push(parseInt(r.count));
		});
		cols.push(col1);
		cols.push(col2);

		return {
			data: {
				x: "x",
				columns: cols
			},
			axis: {
				x: {
					type: "category",
					tick: {
						count: 24
					}
				}
			}
		};
	},

	"usersPerCountry": function() {
		return pageSession.get("usersPerCountry");
	}
});
