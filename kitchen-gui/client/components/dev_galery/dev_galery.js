var cardsPerPage = 24;

Template.DevGalery.created = function() {
};

Template.DevGalery.rendered = function() {
	this.$(".special.cards .image").dimmer({
		on: "hover"
	});

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
};

Template.DevGalery.events({
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

	"click .filter-all-button": function(e, t) {
		var filterVariable = t.data.filterVariable;
		if(!filterVariable) {
			return;
		}

		Session.set(filterVariable, []);
	},

	"click .filter-for-hire-button": function(e, t) {
		var filterVariable = t.data.filterVariable;
		if(!filterVariable) {
			return;
		}

		var filter = Session.get(filterVariable) || [];
		var oldIndex = filter.indexOf("availableForHire");
		if(oldIndex >= 0) {
			filter.splice(oldIndex, 1);
		} else {
			filter.push("availableForHire");
		}
		Session.set(filterVariable, filter);
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
	}
});

Template.DevGalery.helpers({
	"gotUsers": function() {
		return this.users && this.users.count();
	},
	"emptyText": function() {
		return this.textIfEmpty || "Empty";
	},
	"isPaged": function() {
		return !!this.pageNumVariable && !!this.totalCountVariable;
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
	"isFiltered": function() {
		return (this.searchTextVariable && Session.get(this.searchTextVariable)) || (this.filterVariable && Session.get(this.filterVariable) && Session.get(this.filterVariable).length);
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
	"filterForHireButtonClass": function() {
		var filterVariable = this.filterVariable;
		if(!filterVariable) {
			return "";
		}

		var filter = Session.get(filterVariable);
		return !filter || filter.indexOf("availableForHire") < 0 ? "" : "active";
	},
});


Template.DevGaleryCard.events({
	"click .details-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().detailsRoute, { userId: this._id });
		return false;
	},
	"click .projects-link": function(e, t) {
		e.preventDefault();
		Router.go(Template.parentData().projectsRoute, { userId: this._id });
		return false;
	}

});

Template.DevGaleryCard.helpers({
});
