export class TEMPLATE_NAME extends Component {
	constructor () {
		super();

		this.state = {
		};

		this.isNotEmpty = this.isNotEmpty.bind(this);
		this.isNotFound = this.isNotFound.bind(this);
		this.onInsert = this.onInsert.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.onSort = this.onSort.bind(this);
		this.exportData = this.exportData.bind(this);
		this.onExportCSV = this.onExportCSV.bind(this);
		this.onExportTSV = this.onExportTSV.bind(this);
		this.onExportJSON = this.onExportJSON.bind(this);

		this.onPrevPage = this.onPrevPage.bind(this);
		this.onNextPage = this.onNextPage.bind(this);

		this.renderTable = this.renderTable.bind(this);
		this.renderList = this.renderList.bind(this);
		this.renderBlog = this.renderBlog.bind(this);
		this.renderCards = this.renderCards.bind(this);
		this.renderPager = this.renderPager.bind(this);
		this.renderData = this.renderData.bind(this);

		/*BINDINGS*/
	}

	componentWillMount() {
		Session.set("SEARCH_FIELDS_SESSION_VAR", [/*SEARCH_FIELDS*/]);

		/*TEMPLATE_CREATED_CODE*/
	}

	componentWillUnmount() {
		/*TEMPLATE_DESTROYED_CODE*/
	}

	componentDidMount() {
		/*TEMPLATE_RENDERED_CODE*/
	}

	isNotEmpty() {
		return this.props.data.QUERY_VAR && this.props.data.QUERY_VAR.length > 0;
	}

	isNotFound() {
		return this.props.data.QUERY_VAR && this.props.data.QUERY_VAR.length == 0 && Session.get("SEARCH_STRING_SESSION_VAR");
	}

	noData() {
		return (!this.props.data.QUERY_VAR || this.props.data.QUERY_VAR.length == 0) && !Session.get("SEARCH_STRING_SESSION_VAR");
	}

	onInsert(e) {
		/*INSERT_ROUTE*/
	}

	onSearch(e) {
		e.preventDefault();
		let form = $(e.currentTarget).closest("form");
		let searchInput = form.find("#dataview-search-input");
		searchInput.focus();
		let searchString = searchInput.val();
		Session.set("SEARCH_STRING_SESSION_VAR", searchString);
	}

	onSearchKeyDown(e) {
		if(e.which === 27)
		{
			e.preventDefault();
			let form = $(e.currentTarget).closest("form");
			let searchInput = form.find("#dataview-search-input");
			searchInput.val("");
			Session.set("SEARCH_STRING_SESSION_VAR", "");
			return false;
		}
		return true;
	}

	onSort(e) {
		e.preventDefault();

		let oldSortBy = Session.get("SORT_BY_SESSION_VAR") || "";
		let newSortBy = $(e.currentTarget).attr("data-sort");
		Session.set("SORT_BY_SESSION_VAR", newSortBy);
		if(oldSortBy == newSortBy) {
			let sortAscending = Session.get("SORT_ASCENDING_SESSION_VAR");
			if(typeof sortAscending == "undefined") {
				sortAscending = true;
			}
			Session.set("SORT_ASCENDING_SESSION_VAR", !sortAscending);
		} else {
			Session.set("SORT_ASCENDING_SESSION_VAR", true);
		}
	}

	exportData(fileType) {
		let extraParams = {
			searchText: Session.get("SEARCH_STRING_SESSION_VAR") || "",
			searchFields: Session.get("SEARCH_FIELDS_SESSION_VAR") || [/*SEARCH_FIELDS*/],
			sortBy: Session.get("SORT_BY_SESSION_VAR") || ""
		};

		/*EXPORT_PARAMS*/

		let exportFields = [/*EXPORT_FIELDS*/];

		Meteor.call("EXPORT_METHOD_NAME"/*EXPORT_ARGUMENTS*/, extraParams, exportFields, fileType, function(e, data) {
			if(e) {
				alert(e);
				return;
			}

			let filename = "export." + fileType;
			httpUtils.downloadLocalResource(data, filename, "application/octet-stream");
		});
	}

	onExportCSV(e) {
		this.exportData("csv");
	}

	onExportTSV(e) {
		this.exportData("tsv");
	}

	onExportJSON(e) {
		this.exportData("json");
	}

	onPrevPage(e) {
		e.preventDefault();
		let currentPage = Session.get("PAGE_NO_SESSION_VAR") || 0;
		if(currentPage > 0) {
			Session.set("PAGE_NO_SESSION_VAR", currentPage - 1);
		}
	}

	onNextPage(e) {
		e.preventDefault();
		let currentPage = Session.get("PAGE_NO_SESSION_VAR") || 0;
		if(currentPage < this.props.data.PAGE_COUNT_VAR - 1) {
			Session.set("PAGE_NO_SESSION_VAR", currentPage + 1);
		}
	}

	renderTable() {
		var self = this;
		var parentData = {/*ITEMS_PARENT_DATA*/};

		return (
			<div key="table" id="dataview-data-table" className="dataview-table-container table-responsive">
			</div>
		);
	}

	renderList() {
		var self = this;
		return (
			<div key="list" id="dataview-data-list">
			</div>
		);
	}

	renderBlog() {
		var self = this;
		return (
			<div key="blog" id="dataview-data-blog">
			</div>
		);
	}

	renderCards() {
		var self = this;
		return (
			<div key="cards" id="dataview-data-cards">
			</div>
		);
	}

	renderPager() {
		let currentPage = Session.get("PAGE_NO_SESSION_VAR") || 0;
		return (
			<nav key="pager" aria-label="...">
				<ul className="pager">
					{currentPage > 0 ? <li><a href="#" onClick={this.onPrevPage}>Previous page</a>&nbsp;</li> : null}
					{currentPage < this.props.data.PAGE_COUNT_VAR - 1 ? <li>&nbsp;<a href="#" onClick={this.onNextPage}>Next page</a></li> : null}
				</ul>
			</nav>
		);
	}

	renderData() {
		let viewStyle = Session.get("VIEW_STYLE_SESSION_VAR") || "INITIAL_VIEW_STYLE";
		switch(viewStyle) {
			case "table": return this.renderTable(); break;
			case "blog": return this.renderBlog(); break;
			case "list" : return this.renderList(); break;
			case "cards": return this.renderCards(); break;
			default: return this.renderTable();
		}
	}



	/*INSERT_BUTTON_CLASS_HELPER*/

	/*EVENTS_CODE*/

	/*HELPERS_CODE*/

	render() {
		return (
			<div id="COMPONENT_ID" className="COMPONENT_CLASS">
				<h2 id="component-title">
					<span id="component-title-icon" className="COMPONENT_TITLE_ICON_CLASS"></span>
					<span className="component-title-text">COMPONENT_TITLE</span>
				</h2>

				<div id="controls-row" className="row">
					<div className="col-md-12">
						<form id="dataview-controls" className="form-inline">
						</form>
					</div>
				</div>
				{this.isNotEmpty() ? [this.renderData(), this.renderPager()] : (this.isNotFound() ? <div className="alert alert-warning">TEXT_IF_NOT_FOUND</div> : <div className="alert alert-info">TEXT_IF_EMPTY</div>)}

			</div>

		);
	}
}
