		EXTRA_PARAMS = {
			searchText: Session.get("SEARCH_STRING_SESSION_VAR") || "",
			searchFields: Session.get("SEARCH_FIELDS_SESSION_VAR") || [/*SEARCH_FIELDS*/],
			sortBy: Session.get("SORT_BY_SESSION_VAR") || "",
			sortAscending: Session.get("SORT_ASCENDING_SESSION_VAR"),
			pageNo: Session.get("PAGE_NO_SESSION_VAR") || 0,
			pageSize: Session.get("PAGE_SIZE_SESSION_VAR") || DEFAULT_PAGE_SIZE
		};
