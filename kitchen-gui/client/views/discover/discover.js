Template.Discover.rendered = function() {
	this.autorun(function (tracker) {
		Meteor.call("filteredPublicAppCount", Session.get("discoverSearchText"), Session.get("discoverFilter"), function(err, res) {
			Session.set("discoverAppCount", res);
		});
	});
};

Template.Discover.helpers({
	"appGaleryData": function() {
		return {
			title: "Discover",
			textIfEmpty: "No projects",
			applications: this.applications,
			insertRoute: "home.insert",
			detailsButtonTitle: "View details",
			detailsRoute: "app_details",
			forkAppRoute: "home.insert",
			forksRoute: "app_details.forks",
			stargazersRoute: "app_details.stargazers",
			settingsRoute: "home.settings",
			pageNumVariable: "discoverPageNo",
			totalCountVariable: "discoverAppCount",
			searchTextVariable: "discoverSearchText",
			filterVariable: "discoverFilter",
			viewStyleVariable: "discoverViewStyle",
			defaultViewStyle: "list"
		}
	}
});
