Template.TEMPLATE_NAME.onCreated(function() {
	/*TEMPLATE_CREATED_CODE*/
});

Template.TEMPLATE_NAME.onDestroyed(function() {
	/*TEMPLATE_DESTROYED_CODE*/
});

Template.TEMPLATE_NAME.onRendered(function() {
	/*TEMPLATE_RENDERED_CODE*/
});

Template.TEMPLATE_NAME.events({
	"click .th-sortable": function(e, t) {
		e.preventDefault();
		var oldSortBy = Session.get("SORT_BY_SESSION_VAR");
		var newSortBy = $(e.target).attr("data-sort");

		Session.set("SORT_BY_SESSION_VAR", newSortBy);
		if(oldSortBy == newSortBy) {
			var sortAscending = Session.get("SORT_ASCENDING_SESSION_VAR");
			if(typeof sortAscending == "undefined") {
				sortAscending = true;
			}
			Session.set("SORT_ASCENDING_SESSION_VAR", !sortAscending);
		} else {
			Session.set("SORT_ASCENDING_SESSION_VAR", true);
		}
	}
});

Template.TEMPLATE_NAME.helpers({
});
