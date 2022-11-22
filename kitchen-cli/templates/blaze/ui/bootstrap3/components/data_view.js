
var EXPORT_FUNCTION = function (fileType) {
	var extraParams = {
		searchText: Session.get("SEARCH_STRING_SESSION_VAR") || "",
		searchFields: Session.get("SEARCH_FIELDS_SESSION_VAR") || [/*SEARCH_FIELDS*/],
		sortBy: Session.get("SORT_BY_SESSION_VAR") || "",
		sortAscending: Session.get("SORT_ASCENDING_SESSION_VAR") || true
	};

	var exportFields = [/*EXPORT_FIELDS*/];

	/*EXPORT_PARAMS*/

	Meteor.call("EXPORT_METHOD_NAME"/*EXPORT_ARGUMENTS*/, extraParams, exportFields, fileType, function (e, data) {
		if (e) {
			alert(e);
			return;
		}

		let filename = "export." + fileType;
		downloadLocalResource(data, filename, "application/octet-stream");
	});
};

Template.TEMPLATE_NAME.onCreated(function () {
	/*TEMPLATE_CREATED_CODE*/
});

Template.TEMPLATE_NAME.onDestroyed(function () {
	/*TEMPLATE_DESTROYED_CODE*/
});

Template.TEMPLATE_NAME.onRendered(function () {
	Session.set("VIEW_STYLE_SESSION_VAR", "INITIAL_VIEW_STYLE");
	/*TEMPLATE_RENDERED_CODE*/
});

Template.TEMPLATE_NAME.events({
	"submit #dataview-controls": function (e, t) {
		return false;
	},

	"click #dataview-search-button": function (e, t) {
		e.preventDefault();
		var form = $(e.currentTarget).closest("form");
		if (form) {
			var searchInput = form.find("#dataview-search-input");
			if (searchInput) {
				searchInput.focus();
				var searchString = searchInput.val();
				Session.set("SEARCH_STRING_SESSION_VAR", searchString);
			}

		}
		return false;
	},

	"keydown #dataview-search-input": function (e, t) {
		if (e.which === 13) {
			e.preventDefault();
			var form = $(e.currentTarget).closest("form");
			if (form) {
				var searchInput = form.find("#dataview-search-input");
				if (searchInput) {
					var searchString = searchInput.val();
					Session.set("SEARCH_STRING_SESSION_VAR", searchString);
				}

			}
			return false;
		}

		if (e.which === 27) {
			e.preventDefault();
			var form = $(e.currentTarget).closest("form");
			if (form) {
				var searchInput = form.find("#dataview-search-input");
				if (searchInput) {
					searchInput.val("");
					Session.set("SEARCH_STRING_SESSION_VAR", "");
				}

			}
			return false;
		}

		return true;
	},

	"click #dataview-insert-button": function (e, t) {
		e.preventDefault();
		/*INSERT_ROUTE*/
	},

	"click #dataview-export-default": function (e, t) {
		e.preventDefault();
		EXPORT_FUNCTION.call(this, "xlsx");
	},

	"click #dataview-export-xlsx": function (e, t) {
		e.preventDefault();
		EXPORT_FUNCTION.call(this, "xlsx");
	},

	"click #dataview-export-csv": function (e, t) {
		e.preventDefault();
		EXPORT_FUNCTION.call(this, "csv");
	},

	"click #dataview-export-tsv": function (e, t) {
		e.preventDefault();
		EXPORT_FUNCTION.call(this, "tsv");
	},

	"click #dataview-export-json": function (e, t) {
		e.preventDefault();
		EXPORT_FUNCTION.call(this, "json");
	},

	"click .prev-page-link": function (e, t) {
		e.preventDefault();
		var currentPage = Session.get("PAGE_NO_SESSION_VAR") || 0;
		if (currentPage > 0) {
			Session.set("PAGE_NO_SESSION_VAR", currentPage - 1);
		}
	},

	"click .next-page-link": function (e, t) {
		e.preventDefault();
		let currentPage = Session.get("PAGE_NO_SESSION_VAR") || 0;
		if (currentPage < this.PAGE_COUNT_VAR - 1) {
			Session.set("PAGE_NO_SESSION_VAR", currentPage + 1);
		}
	}

	/*EVENTS_CODE*/
});

Template.TEMPLATE_NAME.helpers({

	/*INSERT_BUTTON_CLASS_HELPER*/

	"isEmpty": function () {
		return !this.QUERY_VAR || this.QUERY_VAR.count() == 0;
	},
	"isNotEmpty": function () {
		return this.QUERY_VAR && this.QUERY_VAR.count() > 0;
	},
	"isNotFound": function () {
		return this.QUERY_VAR && this.QUERY_VAR.count() == 0 && Session.get("SEARCH_STRING_SESSION_VAR");
	},
	"gotPrevPage": function () {
		return !!Session.get("PAGE_NO_SESSION_VAR");
	},
	"gotNextPage": function () {
		return (Session.get("PAGE_NO_SESSION_VAR") || 0) < this.PAGE_COUNT_VAR - 1;
	},
	"searchString": function () {
		return Session.get("SEARCH_STRING_SESSION_VAR");
	},
	"viewAsTable": function () {
		return Session.get("VIEW_STYLE_SESSION_VAR") == "table";
	},
	"viewAsBlog": function () {
		return Session.get("VIEW_STYLE_SESSION_VAR") == "blog";
	},
	"viewAsList": function () {
		return Session.get("VIEW_STYLE_SESSION_VAR") == "list";
	},
	"viewAsGallery": function () {
		return Session.get("VIEW_STYLE_SESSION_VAR") == "gallery";
	}

	/*HELPERS_CODE*/
});
