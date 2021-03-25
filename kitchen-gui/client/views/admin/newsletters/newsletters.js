var pageSession = new ReactiveDict();


var AdminNewslettersViewItems = function(cursor) {
	if(!cursor) {
		return [];
	}

	var searchString = pageSession.get("AdminNewslettersViewSearchString");
	var sortBy = pageSession.get("AdminNewslettersViewSortBy");
	var sortAscending = pageSession.get("AdminNewslettersViewSortAscending");
	if(typeof(sortAscending) == "undefined") sortAscending = true;

	var raw = cursor.fetch();

	// filter
	var filtered = [];
	if(!searchString || searchString == "") {
		filtered = raw;
	} else {
		searchString = searchString.replace(".", "\\.");
		var regEx = new RegExp(searchString, "i");
		var searchFields = ["email", "subject", "status"];
		filtered = _.filter(raw, function(item) {
			var match = false;
			_.each(searchFields, function(field) {
				var value = (getPropertyValue(field, item) || "") + "";

				match = match || (value && value.match(regEx));
				if(match) {
					return false;
				}
			})
			return match;
		});
	}

	// sort
	if(sortBy) {
		filtered = _.sortBy(filtered, sortBy);

		// descending?
		if(!sortAscending) {
			filtered = filtered.reverse();
		}
	}

	return filtered;
};

var AdminNewslettersViewExport = function(cursor, fileType) {
	var data = AdminNewslettersViewItems(cursor);
	var exportFields = ["group", "subject", "body", "createdAt", "status"];

	var str = exportArrayOfObjects(data, exportFields, fileType);

	var filename = "export." + fileType;

	downloadLocalResource(str, filename, "application/octet-stream");
}


Template.AdminNewslettersView.rendered = function() {
	$('.ui.dropdown').dropdown();
	pageSession.set("AdminNewslettersViewStyle", "table");
	
};

Template.AdminNewslettersView.events({
	"submit #dataview-controls": function(e, t) {
		return false;
	},

	"click #dataview-search-button": function(e, t) {
		e.preventDefault();
		var form = $(e.currentTarget).parent();
		if(form) {
			var searchInput = form.find("#dataview-search-input");
			if(searchInput) {
				searchInput.focus();
				var searchString = searchInput.val();
				pageSession.set("AdminNewslettersViewSearchString", searchString);
			}

		}
		return false;
	},

	"keydown #dataview-search-input": function(e, t) {
		if(e.which === 13)
		{
			e.preventDefault();
			var form = $(e.currentTarget).parent();
			if(form) {
				var searchInput = form.find("#dataview-search-input");
				if(searchInput) {
					var searchString = searchInput.val();
					pageSession.set("AdminNewslettersViewSearchString", searchString);
				}

			}
			return false;
		}

		if(e.which === 27)
		{
			e.preventDefault();
			var form = $(e.currentTarget).parent();
			if(form) {
				var searchInput = form.find("#dataview-search-input");
				if(searchInput) {
					searchInput.val("");
					pageSession.set("AdminNewslettersViewSearchString", "");
				}

			}
			return false;
		}

		return true;
	},

	"click #dataview-insert-button": function(e, t) {
		e.preventDefault();
		Router.go("admin.newsletters.insert");
	},

	"click #dataview-export-default": function(e, t) {
		e.preventDefault();
		AdminNewslettersViewExport(this.newsletters, "csv");
	},

	"click #dataview-export-csv": function(e, t) {
		e.preventDefault();
		AdminNewslettersViewExport(this.newsletters, "csv");
	},

	"click #dataview-export-tsv": function(e, t) {
		e.preventDefault();
		AdminNewslettersViewExport(this.newsletters, "tsv");
	},

	"click #dataview-export-json": function(e, t) {
		e.preventDefault();
		AdminNewslettersViewExport(this.newsletters, "json");
	}

	
});

Template.AdminNewslettersView.helpers({

	

	"isEmpty": function() {
		return !this.newsletters || this.newsletters.count() == 0;
	},
	"isNotEmpty": function() {
		return this.newsletters && this.newsletters.count() > 0;
	},
	"isNotFound": function() {
		return this.newsletters && pageSession.get("AdminNewslettersViewSearchString") && AdminNewslettersViewItems(this.newsletters).length == 0;
	},
	"searchString": function() {
		return pageSession.get("AdminNewslettersViewSearchString");
	},
	"viewAsTable": function() {
		return pageSession.get("AdminNewslettersViewStyle") == "table";
	},
	"viewAsList": function() {
		return pageSession.get("AdminNewslettersViewStyle") == "list";
	},
	"viewAsGallery": function() {
		return pageSession.get("AdminNewslettersViewStyle") == "gallery";
	}

	
});


Template.AdminNewslettersViewTable.rendered = function() {
	
};

Template.AdminNewslettersViewTable.events({
	"click .th-sortable": function(e, t) {
		e.preventDefault();
		var oldSortBy = pageSession.get("AdminNewslettersViewSortBy");
		var newSortBy = $(e.target).attr("data-sort");

		pageSession.set("AdminNewslettersViewSortBy", newSortBy);
		if(oldSortBy == newSortBy) {
			var sortAscending = pageSession.get("AdminNewslettersViewSortAscending") || false;
			pageSession.set("AdminNewslettersViewSortAscending", !sortAscending);
		} else {
			pageSession.set("AdminNewslettersViewSortAscending", true);
		}
	},
	
});

Template.AdminNewslettersViewTable.helpers({
	"tableItems": function() {
		return AdminNewslettersViewItems(this.newsletters);
	}
});


Template.AdminNewslettersViewTableItems.rendered = function() {
	
};

Template.AdminNewslettersViewTableItems.events({
	"click td": function(e, t) {
		e.preventDefault();
		Router.go("admin.newsletters.details", {newsletterId: this._id});
		return false;
	},

	"click #delete-button": function(e, t) {
		e.preventDefault();
		var me = this;
		$('.ui.small.modal.delete').modal({
			closable: true,
			detachable: false,
			onDeny: function() {
				return true;
			},
			onApprove: function() {
				Newsletters.remove({ _id: me._id });
			}
		}).modal('show');

		return false;
	},

	"click #edit-button": function(e, t) {
		e.preventDefault();
		Router.go("admin.newsletters.edit", { newsletterId: this._id });
		return false;
	},

	"click #send-button": function(e, t) {
		e.stopPropagation();

		var me = this;
		$('.ui.small.modal.send').modal({
			closable: true,
			detachable: false,
			onDeny: function() {
				return true;
			},
			onApprove: function() {
				Meteor.call("sendNewsletter", me._id);
			}
		}).modal('show');

		return false;
	}
});

Template.AdminNewslettersViewTableItems.helpers({
	"deleteButtonClass": function() {
		return Users.isAdmin(Meteor.userId()) ? "" : "hidden";
	},
	"editButtonClass": function() {
		return Users.isAdmin(Meteor.userId()) ? "" : "hidden";
	},
	"sendButtonClass": function() {
		return (Users.isAdmin(Meteor.userId()) && this.status != "sent" && this.status != "sending") ? "" : "hidden";
	}
});


Template.AdminNewslettersGetMailingList.events({
	"click #download-mailing-list": function(e) {
		e.preventDefault();

		Meteor.call("getMailingList", function(e, r) {
			if(e) {
				alert(e);
			} else {
				downloadLocalResource(r, "mailinglist.csv");
			}
		});	
	}
});

