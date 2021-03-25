var itemsPerPage = 24;

Template.JobGalery.created = function() {
};

Template.JobGalery.rendered = function() {
	this.$(".search-input").focus();

	var self = this;
	this.autorun(function (tracker) {
		var totalCountVariable = self.data.totalCountVariable;
		var pageNumVariable = self.data.pageNumVariable;
		var limit = itemsPerPage;
		if(totalCountVariable && pageNumVariable) {
			var totalCount = Session.get(totalCountVariable);
			var pageNum = Session.get(pageNumVariable);

			if((pageNum * limit) + limit > totalCount) {
				Session.set(pageNumVariable, 0);
			} 
		}
	});
};

Template.JobGalery.events({
	"click .search-button": function(e, t) {
		e.preventDefault();
		var searchTextVariable = t.data.searchTextVariable;
		if(!searchTextVariable) {
			return false;
		}

		var searchInput = t.find(".search-input");
		if(!searchInput) {
			return false;
		}

		Session.set(searchTextVariable, searchInput.value);

		return false;
	},

	"keydown .search-input": function(e, t) {
		if(e.keyCode == 13) {
			e.preventDefault();
			var searchTextVariable = t.data.searchTextVariable;
			if(!searchTextVariable) {
				return false;
			}

			Session.set(searchTextVariable, e.currentTarget.value);
			e.stopPropagation();
			return false;
		}

		if(e.keyCode == 27) {
			e.preventDefault();
			var searchTextVariable = t.data.searchTextVariable;
			if(!searchTextVariable) {
				return false;
			}

			Session.set(searchTextVariable, "");
			e.stopPropagation();
			return false;
		}
		return true;
	},

	"click .filter-off": function(e, t) {
		e.preventDefault();
		var searchTextVariable = t.data.searchTextVariable;
		if(searchTextVariable) {
			Session.set(searchTextVariable, "");
		}

		var filterVariable = t.data.filterVariable;
		if(filterVariable) {
			Session.set(filterVariable, []);
		}

		return false;
	},

	"click .insert-link": function(e, t) {
		e.preventDefault();
		Router.go(t.data.insertRoute);
		return false;
	},

	"click .login-first-button": function() {
		confirmationBox("Login", "You must be logged into Meteor Kitchen in order to proceed.", function() {
			Router.go("login", {});
		}, function() {

		}, {
			approveButtonTitle: "Login",
			denyButtonTitle: "Cancel"
		});
	},

	"click .page-next": function(e, t) {
		e.preventDefault();

		var pageNumVariable = t.data.pageNumVariable;
		if(!pageNumVariable) {
			return false;
		}

		var currentPage = Session.get(pageNumVariable) || 0;

		Session.set(pageNumVariable, currentPage + 1);
		return false;
	},

	"click .page-prev": function(e, t) {
		e.preventDefault();

		var pageNumVariable = t.data.pageNumVariable;
		if(!pageNumVariable) {
			return false;
		}

		var currentPage = Session.get(pageNumVariable) || 0;

		if(currentPage <= 0) {
			return false;
		}
		Session.set(pageNumVariable, currentPage - 1);

		return false;
	},

	"click .filter-all-button": function(e, t) {
		var filterVariable = t.data.filterVariable;
		if(!filterVariable) {
			return;
		}

		Session.set(filterVariable, []);
	},

	"click .filter-starred-button": function(e, t) {
		var filterVariable = t.data.filterVariable;
		if(!filterVariable) {
			return;
		}

		var filter = Session.get(filterVariable) || [];
		var oldIndex = filter.indexOf("starred");
		if(oldIndex >= 0) {
			filter.splice(oldIndex, 1);
		} else {
			filter.push("starred");
		}
		Session.set(filterVariable, filter);
	},
	"click .filter-featured-button": function(e, t) {
		var filterVariable = t.data.filterVariable;
		if(!filterVariable) {
			return;
		}

		var filter = Session.get(filterVariable) || [];
		var oldIndex = filter.indexOf("featured");
		if(oldIndex >= 0) {
			filter.splice(oldIndex, 1);
		} else {
			filter.push("featured");
		}
		Session.set(filterVariable, filter);
	}
});

Template.JobGalery.helpers({
	"userCanInsertJob": function() {
		return this.insertRoute && !!Meteor.userId();
	},
	"gotJobs": function() {
		return this.jobs && this.jobs.count();
	},
	"emptyText": function() {
		return this.textIfEmpty || "Empty";
	},

	"isPaged": function() {
		return !!this.pageNumVariable && !!this.totalCountVariable;
	},
	"isFiltered": function() {
		return (this.searchTextVariable && Session.get(this.searchTextVariable)) || (this.filterVariable && Session.get(this.filterVariable) && Session.get(this.filterVariable).length);
	},
	"gotPrevPage": function() {
		var pageNumVariable = this.pageNumVariable;
		if(!pageNumVariable) {
			return false;
		}

		var currentPage = Session.get(pageNumVariable) || 0;
		return currentPage > 0;
	},
	"gotNextPage": function() {
		var pageNumVariable = this.pageNumVariable;
		if(!pageNumVariable) {
			return false;
		}

		var currentPage = Session.get(pageNumVariable) || 0;

		var totalCountVariable = this.totalCountVariable;
		if(!totalCountVariable) {
			return false;
		}

		var totalCount = Session.get(totalCountVariable) || 0;

		var nextItemIndex = (currentPage * itemsPerPage) + itemsPerPage;

		return totalCount > nextItemIndex;
	},
	"totalCount": function() {
		var totalCountVariable = this.totalCountVariable;
		if(!totalCountVariable) {
			return 0;
		}

		var totalCount = Session.get(totalCountVariable) || 0;
		return totalCount;
	},
	"totalCountDisplayClass": function() {
		var totalCountVariable = this.totalCountVariable;
		if(!totalCountVariable) {
			return "";
		}

		var totalCount = Session.get(totalCountVariable) || 0;
		return !!totalCount || totalCount == 0 ? "" : "ui active mini inline loader";
	},
	"searchText": function() {
		var searchTextVariable = this.searchTextVariable;
		if(!searchTextVariable) {
			return false;
		}

		searchText = Session.get(searchTextVariable);

		return searchText;
	},
	"filterAllButtonClass": function() {
		var filterVariable = this.filterVariable;
		if(!filterVariable) {
			return "active";
		}

		var filter = Session.get(filterVariable);
		return !filter || !filter.length ? "active" : "";
	},
	"filterStarredButtonClass": function() {
		var filterVariable = this.filterVariable;
		if(!filterVariable) {
			return "";
		}

		var filter = Session.get(filterVariable);
		return !filter || filter.indexOf("starred") < 0 ? "" : "active";
	},
	"filterFeaturedButtonClass": function() {
		var filterVariable = this.filterVariable;
		if(!filterVariable) {
			return "";
		}

		var filter = Session.get(filterVariable);
		return !filter || filter.indexOf("featured") < 0 ? "" : "active";
	}
});



Template.JobGaleryListItem.helpers({
	"userOwnsJob": function() {
		return !!Meteor.userId() && this && this.createdBy == Meteor.userId();
	},
	"starIconClass": function() {
		if(!Meteor.userId()) {
			return "";
		}

		var starredByMe = Stars.findOne({
			jobId: this._id,
			createdBy: Meteor.userId()
		});
		return starredByMe ? "active" : "";
	},

	isExpanded: function() {
		var parentData = Template.parentData();

		if(!parentData.expandedItemsVariable) {
			return false;
		}

		var expandedItems = Session.get(parentData.expandedItemsVariable) || [];
		return expandedItems.indexOf(this._id) >= 0;
	},
	"userCanStarJob": function() {
		return !!Meteor.userId();
	},
	"starredByMe": function() {
		if(!this) {
			return false;
		}

		var userId = Meteor.userId();
		if(!userId) {
			return false;
		}

		var starredByMe = Stars.findOne({
			jobId: this._id,
			createdBy: userId
		});

		return !!starredByMe;
	},
	"canContactUser": function() {
		return Meteor.user() && this.createdBy != Meteor.userId();
	}

});


Template.JobGaleryListItem.events({
	"click .star-button": function(e, t) {
		e.preventDefault();
		if(Meteor.userId()) {
			Meteor.call("toggleStarJob", this._id, function(err, res) {
				if(err) {
					alert(err.message);
					return false;
				}
			});
		}
		return false;
	},

	"click .expand-link": function(e, t) {
		e.preventDefault();

		var parentData = Template.parentData();

		if(parentData.expandedItemsVariable) {
			var expandedItems = Session.get(parentData.expandedItemsVariable) || [];

			var index = expandedItems.indexOf(this._id);
			if(index < 0) {
				expandedItems.push(this._id);
			} else {
				expandedItems.splice(index, 1);
			}
			Session.set(parentData.expandedItemsVariable, expandedItems);
		}

		return false;
	},

	"click .details-link": function(e, t) {
		e.preventDefault();

		var parentData = Template.parentData();

		if(parentData.detailsRoute) {
			Router.go(parentData.detailsRoute, { jobId: this._id });
		} else {
			if(parentData.expandedItemsVariable) {
				var expandedItems = Session.get(parentData.expandedItemsVariable) || [];

				var index = expandedItems.indexOf(this._id);
				if(index < 0) {
					expandedItems.push(this._id);
				} else {
					expandedItems.splice(index, 1);
				}
				Session.set(parentData.expandedItemsVariable, expandedItems);
			}
		}
		return false;
	},

	"click .delete-link": function(e, t) {
		e.preventDefault();

		var self = this;

		confirmationBox(
			"Delete job",
			"Are you sure you want to delete this job post?",
			function() {
				Meteor.call("jobsRemove", self._id, function(e, r) {
					if(e) {
						alert(e);
					}
				});
			},
			function() {
			},
			{

			}
		);

		return false;
	},

	"click .login-first-button-2": function() {
		confirmationBox("Login", "You must be logged into Meteor Kitchen in order to proceed.", function() {
			Router.go("login", {});
		}, function() {

		}, {
			approveButtonTitle: "Login",
			denyButtonTitle: "Cancel"
		});
	},

	"click .contact-me-button": function() {
		Meteor.call("createContact", this.createdBy, function(e, r) {
			if(e) {
				alert(e.message);
				return;
			}
			Router.go("messenger", { contactId: r });
		});
	},

	"click .settings-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().settingsRoute, { jobId: this._id });
		return false;
	},
	"click .title-link": function(e, t) {
		e.preventDefault();
		if(Template.parentData().titleRoute) {
			Router.go(Template.parentData().titleRoute, { jobId: this._id });
		} else {
			Router.go(Template.parentData().detailsRoute, { jobId: this._id });
		}
		return false;
	}
});


Template.JobDetailsContent.helpers({
	"userData": function() {
		return Users.findOne({ _id: this.createdBy });
	},

	devTypeStr: function() {
		if(!this.devType) {
			return "-";
		}

		var str = "";
		this.devType.map(function(el) {
			var entry = DevProperties.devType.find(function(x) { return x.value == el; });
			if(str) {
				str += ", ";
			}
			str += entry ? entry.title : el;
		});
		return str || "-";
	},

	uiFrameworksStr: function() {
		if(!this.uiFrameworks) {
			return "-";
		}

		var str = "";
		this.uiFrameworks.map(function(el) {
			var entry = DevProperties.uiFrameworks.find(function(x) { return x.value == el; });
			if(str) {
				str += ", ";
			}
			str += entry ? entry.title : el;
		});
		return str || "-";
	},

	stackStr: function() {
		if(!this.stack) {
			return "-";
		}

		var el = this.stack;
		var entry = DevProperties.stack.find(function(x) { return x.value == el; });
		return entry ? entry.title : el;
	}
});

Template.JobDetailsContent.events({
	"click .owner-profile-link": function(e, t) {
		e.preventDefault();
		Router.go("dev_details", { userId: this._id });
		return false;
	}
});
