Template.AppDetailsStargazers.helpers({
	"devGaleryData": function() {
		return {
			title: "",
			textIfEmpty: "No stars",
			users: this.stargazers,
			detailsButtonTitle: "View profile",
			detailsRoute: "dev_details",
			projectsRoute: "dev_details.projects"
		}
	}
});
