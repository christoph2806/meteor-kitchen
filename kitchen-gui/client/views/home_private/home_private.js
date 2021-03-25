Template.HomePrivate.helpers({
	"appGaleryData": function() {
		return {
			title: "My Projects",
			textIfEmpty: "You don't have any projects yet.",
			applications: this.applications,
			insertRoute: "home.insert",
			detailsRoute: "home.edit",
			detailsButtonTitle: "Open designer",
			forkAppRoute: "home.insert",
			forksRoute: "app_details.forks",
			stargazersRoute: "app_details.stargazers",
			settingsRoute: "home.settings",
			titleRoute: "app_details",
			viewStyleVariable: "homePrivateViewStyle",
			defaultViewStyle: "list"
		}
	}
});

var pageSession = new ReactiveDict();


Template.HomePrivateApplications.rendered = function() {
};

Template.HomePrivateApplications.events({

	"click #dataview-insert-button": function(e, t) {
		e.preventDefault();
		Router.go("home.insert", {});
	}

});

Template.HomePrivateApplications.helpers({
	"insertButtonClass": function() {
		return Applications.userCanInsert(Meteor.userId(), {}) ? "" : "hidden";
	},

	"isEmpty": function() {
		return !this.applications || this.applications.count() == 0;
	},
	"isNotEmpty": function() {
		return this.applications && this.applications.count() > 0;
	},
	"isNotFound": function() {
		return this.applications && pageSession.get("HomePrivateApplicationsSearchString") && HomePrivateApplicationsItems(this.applications).length == 0;
	}
});
