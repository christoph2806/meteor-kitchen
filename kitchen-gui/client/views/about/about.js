Template.About.helpers({
	"userCountDisplayClass": function() {
		var userCount = Session.get("userCount");
		return !!userCount || userCount == 0 ? "header-user-count" : "ui active mini inline inverted loader";
	}
});