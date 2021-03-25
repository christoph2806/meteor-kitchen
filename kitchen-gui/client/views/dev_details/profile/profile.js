Template.DevDetailsProfile.helpers({
	devTypeStr: function() {
		if(!this.user.profile.devProfile || !this.user.profile.devProfile.devType) {
			return "-";
		}

		var str = "";
		this.user.profile.devProfile.devType.map(function(el) {
			var entry = DevProperties.devType.find(function(x) { return x.value == el; });
			if(str) {
				str += ", ";
			}
			str += entry ? entry.title : el;
		});
		return str;
	},

	uiFrameworksStr: function() {
		if(!this.user.profile.devProfile || !this.user.profile.devProfile.uiFrameworks) {
			return "-";
		}

		var str = "";
		this.user.profile.devProfile.uiFrameworks.map(function(el) {
			var entry = DevProperties.uiFrameworks.find(function(x) { return x.value == el; });
			if(str) {
				str += ", ";
			}
			str += entry ? entry.title : el;
		});
		return str;
	},

	progLangsStr: function() {
		if(!this.user.profile.devProfile || !this.user.profile.devProfile.progLangs) {
			return "-";
		}

		var str = "";
		this.user.profile.devProfile.progLangs.map(function(el) {
			var entry = DevProperties.progLangs.find(function(x) { return x.value == el; });
			if(str) {
				str += ", ";
			}
			str += entry ? entry.title : el;
		});
		return str;
	},

	osStr: function() {
		if(!this.user.profile.devProfile || !this.user.profile.devProfile.os) {
			return "-";
		}

		var str = "";
		this.user.profile.devProfile.os.map(function(el) {
			var entry = DevProperties.os.find(function(x) { return x.value == el; });
			if(str) {
				str += ", ";
			}
			str += entry ? entry.title : el;
		});
		return str;
	},

	selfRatingStr: function() {
		if(!this.user.profile.devProfile || !this.user.profile.devProfile.selfRating) {
			return "-";
		}

		var el = this.user.profile.devProfile.selfRating;
		var entry = DevProperties.selfRating.find(function(x) { return x.value == el; });
		return entry ? entry.title : el;
	},
	stackStr: function() {
		if(!this.user.profile.devProfile || !this.user.profile.devProfile.stack) {
			return "-";
		}

		var el = this.user.profile.devProfile.stack;
		var entry = DevProperties.stack.find(function(x) { return x.value == el; });
		return entry ? entry.title : el;
	}
});

Template.DevDetailsProfile.events({
});
