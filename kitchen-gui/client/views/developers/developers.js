Template.Developers.rendered = function() {
	this.autorun(function (tracker) {
		Meteor.call("filteredUsersCount", Session.get("developersSearchText"), Session.get("developersFilter"), function(err, res) {
			Session.set("developersCount", res);
		});
	});
};

Template.Developers.helpers({
	"devGaleryData": function() {
		return {
			title: "Developers",
			textIfEmpty: "No developers",
			users: this.users,
			detailsButtonTitle: "View profile",
			detailsRoute: "dev_details",
			projectsRoute: "dev_details.projects",
			pageNumVariable: "developersPageNo",
			totalCountVariable: "developersCount",
			searchTextVariable: "developersSearchText",
			filterVariable: "developersFilter"
		}
	}
});
