Template.DevDetailsProjects.helpers({
	"appGaleryData": function() {
		return {
			title: "",
			textIfEmpty: "No public projects",
			applications: this.applications,
			detailsButtonTitle: "View details",
			detailsRoute: "app_details",
			forkAppRoute: "home.insert",
			forksRoute: "app_details.forks",
			stargazersRoute: "app_details.stargazers",
			settingsRoute: "home.settings",
			viewStyleVariable: "devDetailsProjectsViewStyle",
			defaultViewStyle: "list"
		}
	}
});

Template.DevDetailsProjects.events({
});
