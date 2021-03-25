Template.Jobs.rendered = function() {
	this.autorun(function (tracker) {
		Meteor.call("filteredJobsCount", Session.get("jobsSearchText"), Session.get("jobsFilter"), function(err, res) {
			Session.set("jobsCount", res);
		});
	});
};

Template.Jobs.helpers({
	"jobGaleryData": function() {
		return {
			title: "Jobs",
			textIfEmpty: "No jobs",
			jobs: this.jobs,
			insertRoute: "jobs.insert",
			detailsRoute: "jobs.details",
			expandedItemsVariable: "jobsExpandedItems",
			expandButtonTitle: "Show details",
			collapseButtonTitle: "Hide details",
			settingsRoute: "jobs.edit",
			pageNumVariable: "jobsPageNo",
			totalCountVariable: "jobsCount",
			searchTextVariable: "jobsSearchText",
			filterVariable: "jobsFilter"
		}
	}
});
