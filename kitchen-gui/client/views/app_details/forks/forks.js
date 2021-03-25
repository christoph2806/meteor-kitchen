Template.AppDetailsForks.helpers({
	"appGaleryData": function() {
		return {
			title: "",
			textIfEmpty: "No forks",
			applications: this.forks,
			detailsButtonTitle: "View details",
			detailsRoute: "app_details",
			forkAppRoute: "home.insert",
			forksRoute: "app_details.forks",
			stargazersRoute: "app_details.stargazers",
			settingsRoute: "home.settings",
			viewStyleVariable: "appDetailsForksViewStyle",
			defaultViewStyle: "list"
		}
	}
});

Template.AppDetailsForks.events({
});
