Template.HomePublic.rendered = function() {
	var self = this;

	initCoverr();
};

Template.HomePublic.helpers({
	"userCountDisplayClass": function() {
		var userCount = Session.get("userCount");
		return !!userCount || userCount == 0 ? "header-user-count" : "ui active mini inline inverted loader";
	},
	"publicAppCountDisplayClass": function() {
		var publicAppCount = Session.get("publicAppCount");
		return !!publicAppCount || publicAppCount == 0 ? "header-app-count" : "ui active mini inline inverted loader";
	},
	"totalAppCountDisplayClass": function() {
		var totalAppCount = Session.get("totalAppCount");
		return !!totalAppCount || totalAppCount == 0 ? "header-app-count" : "ui active mini inline inverted loader";
	},

	"coverr": function(name, format) {
		switch(format) {
			case "mp4": return "/coverr/" + name + "/MP4/" + name + ".mp4"; break;
			case "webm": return "/coverr/" + name + "/WEBM/" + name + ".webm"; break;
			case "jpg": return "/coverr/" + name + "/Snapshots/" + name + ".jpg"; break;
		}
		return "";
	}
});

Template.HomePublic.events({
	"click a": function(e, t) {
		var gotoId = $(e.currentTarget).attr("href");
		if(!gotoId || gotoId[0] != "#" || !$(gotoId).length) {
			return;
		}
		e.preventDefault();
		$("body").animate({
			scrollTop: $(gotoId).offset().top
		}, 500);
	}
});
