Template.AppDetailsAbout.helpers({
	overview: function() {
		var kitchen = ClassKitchen.create("kitchen");
		kitchen.load(this.application.data);
		return kitchen.application.getOverview("ui very basic compact collapsing invisible table");
	}
});

Template.AppDetailsAbout.events({
	"click .owner-profile-link": function(e, t) {
		e.preventDefault();
		Router.go("dev_details", { userId: this._id });
		return false;
	}
});
