var cardsPerPage = 24;

var getViewStyle = function(viewStyleVariable, defaultViewStyle) {
	var fallbackViewStyle = "cards";
	var viewStyle = defaultViewStyle || fallbackViewStyle;
	if(viewStyleVariable) {
		viewStyle = Session.get(viewStyleVariable) || defaultViewStyle || fallbackViewStyle;
	}
	return viewStyle;
};

Template.AppGalery.created = function() {
};

Template.AppGalery.rendered = function() {
/*
	this.$(".special.cards .image").dimmer({
		on: "hover"
	});
*/
	this.$(".search-input").focus();

	var self = this;
	this.autorun(function (tracker) {
		var totalCountVariable = self.data.totalCountVariable;
		var pageNumVariable = self.data.pageNumVariable;
		var limit = cardsPerPage;
		if(totalCountVariable && pageNumVariable) {
			var totalCount = Session.get(totalCountVariable);
			var pageNum = Session.get(pageNumVariable);

			if((pageNum * limit) > totalCount) {
				Session.set(pageNumVariable, 0);
			} 
		}
	});

	this.autorun(function(tracker) {
		var viewStyleVariable = self.data.viewStyleVariable;
		if(!viewStyleVariable) {
			return;
		}
		var viewStyle = Session.get(viewStyleVariable);
		if(viewStyle == "cards") {
			Meteor.defer(function() {
				self.$(".special.cards .image").dimmer({
					on: "hover"
				});
			});
		}
	});
};

Template.AppGalery.events({
	"click .view-style-cards": function(e, t) {
		e.preventDefault();

		var viewStyleVariable = t.data.viewStyleVariable;
		if(!viewStyleVariable) {
			return false;
		}

		Session.set(viewStyleVariable, "cards");
		return false;
	},

	"click .view-style-list": function(e, t) {
		e.preventDefault();

		var viewStyleVariable = t.data.viewStyleVariable;
		if(!viewStyleVariable) {
			return false;
		}

		Session.set(viewStyleVariable, "list");
		return false;
	},

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

Template.AppGalery.helpers({
	"viewStyleCardsButtonClass": function() {
		return getViewStyle(this.viewStyleVariable, this.defaultViewStyle) == "cards" ? "active" : "";
	},

	"viewStyleListButtonClass": function() {
		return getViewStyle(this.viewStyleVariable, this.defaultViewStyle) == "list" ? "active" : "";
	},

	"userCanInsertApplication": function() {
		return this.insertRoute && !!Meteor.userId();
	},
	"gotApplications": function() {
		return this.applications && this.applications.count();
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

		var nextItemIndex = (currentPage * cardsPerPage) + cardsPerPage;

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
	},
	"viewStyleIsCards": function() {
		return getViewStyle(this.viewStyleVariable, this.defaultViewStyle) == "cards";
	},
	"viewStyleIsList": function() {
		return getViewStyle(this.viewStyleVariable, this.defaultViewStyle) == "list";
	}
});


Template.AppGaleryCard.events({
	"click .owner-profile-link": function(e, t) {
		e.preventDefault();
		Router.go("dev_details", { userId: this._id });
		return false;
	},
	"click .star-icon": function(e, t) {
		e.preventDefault();
		if(Meteor.userId()) {
			Meteor.call("toggleStarApplication", this._id, function(err, res) {
				if(err) {
					alert(err.message);
					return false;
				}
			});
		} else {
			Router.go(Template.parentData().stargazersRoute, { applicationId: this._id });
		}
		return false;
	},

	"click .details-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().detailsRoute, { applicationId: this._id });
		return false;
	},
	"click .settings-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().settingsRoute, { applicationId: this._id });
		return false;
	},
	"click .title-link": function(e, t) {
		e.preventDefault();
		if(Template.parentData().titleRoute) {
			Router.go(Template.parentData().titleRoute, { applicationId: this._id });
		} else {
			Router.go(Template.parentData().detailsRoute, { applicationId: this._id });
		}
		return false;
	},
	"click .star-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().stargazersRoute, { applicationId: this._id });
		return false;
	},
	"click .fork-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().forksRoute, { applicationId: this._id });
		return false;
	}
});


Template.AppGaleryCard.helpers({
	"userOwnsApplication": function() {
		return !!Meteor.userId() && this && this.createdBy == Meteor.userId();
	},
	"isPublicApplication": function() {
		return this && this.public;
	},
	"userCanForkApplication": function() {
		return !!Meteor.userId();
	},
	"starIconClass": function() {
		if(!Meteor.userId()) {
			return "";
		}

		var starredByMe = Stars.findOne({
			applicationId: this._id,
			createdBy: Meteor.userId()
		});
		return starredByMe ? "active" : "";
	},
	"userData": function() {
		return Users.findOne({ _id: this.createdBy });
	}
});


Template.AppGaleryListItem.helpers({
	"userOwnsApplication": function() {
		return !!Meteor.userId() && this && this.createdBy == Meteor.userId();
	},
	"isPublicApplication": function() {
		return this && this.public;
	},
	"userCanForkApplication": function() {
		return !!Meteor.userId();
	},
	"starIconClass": function() {
		if(!Meteor.userId()) {
			return "";
		}

		var starredByMe = Stars.findOne({
			applicationId: this._id,
			createdBy: Meteor.userId()
		});
		return starredByMe ? "active" : "";
	},
	"userData": function() {
		return Users.findOne({ _id: this.createdBy });
	},
	"descriptionShort": function() {
		var description = this && this.description ? this.description : "";
		if(description.length <= 250) {
			return description;
		}
		return "<span>" + description.substring(0, 200) + "</span>...";
	}
});


Template.AppGaleryListItem.events({
	"click .owner-profile-link": function(e, t) {
		e.preventDefault();
		Router.go("dev_details", { userId: this._id });
		return false;
	},
	"click .star-icon": function(e, t) {
		e.preventDefault();
		if(Meteor.userId()) {
			Meteor.call("toggleStarApplication", this._id, function(err, res) {
				if(err) {
					alert(err.message);
					return false;
				}
			});
		} else {
			Router.go(Template.parentData().stargazersRoute, { applicationId: this._id });
		}
		return false;
	},

	"click .details-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().detailsRoute, { applicationId: this._id });
		return false;
	},
	"click .settings-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().settingsRoute, { applicationId: this._id });
		return false;
	},
	"click .title-link": function(e, t) {
		e.preventDefault();
		if(Template.parentData().titleRoute) {
			Router.go(Template.parentData().titleRoute, { applicationId: this._id });
		} else {
			Router.go(Template.parentData().detailsRoute, { applicationId: this._id });
		}
		return false;
	},
	"click .star-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().stargazersRoute, { applicationId: this._id });
		return false;
	},
	"click .fork-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().forksRoute, { applicationId: this._id });
		return false;
	}
});

