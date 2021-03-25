export class TEMPLATE_NAME extends Component {
	constructor () {
		super();

		this.state = {
			SEARCH_STRING_SESSION_VAR: "",
			SORT_BY_SESSION_VAR: "",
			VIEW_STYLE_SESSION_VAR: "INITIAL_VIEW_STYLE"
		};

		this.isNotEmpty = this.isNotEmpty.bind(this);
		this.isNotFound = this.isNotFound.bind(this);
		this.onInsert = this.onInsert.bind(this);
		this.onSearchInputChange = this.onSearchInputChange.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.onSort = this.onSort.bind(this);
		this.exportData = this.exportData.bind(this);
		this.onExportCSV = this.onExportCSV.bind(this);
		this.onExportTSV = this.onExportTSV.bind(this);
		this.onExportJSON = this.onExportJSON.bind(this);
		this.renderTable = this.renderTable.bind(this);
		this.renderList = this.renderList.bind(this);
		this.renderBlog = this.renderBlog.bind(this);
		this.renderCards = this.renderCards.bind(this);
		this.renderData = this.renderData.bind(this);

		/*BINDINGS*/
	}

	componentWillMount() {
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
		return this.props.data.QUERY_VAR && this.props.data.QUERY_VAR.length == 0 && this.state.SEARCH_STRING_SESSION_VAR;
	}

	onInsert(e) {
		/*INSERT_ROUTE*/
	}

	onSearchInputChange(e) {
		this.setState({SEARCH_STRING_SESSION_VAR: e.target.value});
	}

	onSearch(e) {
		e.preventDefault();
		let form = $(e.currentTarget).parent();
		let searchInput = form.find("#dataview-search-input");
		searchInput.focus();
		let searchString = searchInput.val();
		this.setState({ SEARCH_STRING_SESSION_VAR: searchString });
	}

	onSort(e) {
		e.preventDefault();
		let sortBy = $(e.currentTarget).attr("data-sort");
		this.setState({ SORT_BY_SESSION_VAR: sortBy });
	}

	exportData(data, fileType) {
		let exportFields = [/*EXPORT_FIELDS*/];

		let str = objectUtils.exportArrayOfObjects(data, exportFields, fileType);

		let filename = "export." + fileType;

		httpUtils.downloadLocalResource(str, filename, "application/octet-stream");
	}

	onExportCSV(e) {
		this.exportData(this.props.data.QUERY_VAR, "csv");
	}

	onExportTSV(e) {
		this.exportData(this.props.data.QUERY_VAR, "tsv");
	}

	onExportJSON(e) {
		this.exportData(this.props.data.QUERY_VAR, "json");
	}

	renderTable() {
		var self = this;
		var parentData = {/*ITEMS_PARENT_DATA*/};

		return (
			<div id="dataview-data-table">
			</div>
		);
	}

	renderList() {
		var self = this;
		return (
			<div id="dataview-data-list">
			</div>
		);
	}

	renderBlog() {
		var self = this;
		return (
			<div id="dataview-data-blog">
			</div>
		);
	}

	renderCards() {
		var self = this;
		return (
			<div id="dataview-data-cards">
			</div>
		);
	}

	renderData() {
		let viewStyle = this.state.VIEW_STYLE_SESSION_VAR || "table";
		switch(viewStyle) {
			case "table": return this.renderTable(); break;
			case "blog": return this.renderBlog(); break;
			case "list" : return this.renderList(); break;
			case "cards": return this.renderCards(); break;
			default: return this.renderTable();
		}
	}

	/*EVENTS_CODE*/

	render() {
		return (
			<div id="COMPONENT_ID" class="COMPONENT_CLASS">
				<h2 id="component-title"><span id="component-title-icon" class="COMPONENT_TITLE_ICON_CLASS"></span>COMPONENT_TITLE</h2>

				<div class="row">
					<div class="col-md-12">
						<form id="dataview-controls" class="form-inline">
						</form>
					</div>
				</div>
				{this.isNotEmpty() ? this.renderData() : (this.isNotFound() ? <div class="alert alert-warning">TEXT_IF_NOT_FOUND</div> : <div class="alert alert-info">TEXT_IF_EMPTY</div>)}

			</div>

		);
	}
}
