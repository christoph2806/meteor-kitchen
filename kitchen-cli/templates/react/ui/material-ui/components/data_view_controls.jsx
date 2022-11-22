<div>
	<div id="dataview-controls-insert" className={`form-group INSERT_BUTTON_CLASS`}>
		<button type="button" id="dataview-insert-button" className="btn btn-success" onClick={this.onInsert}><span className="fa fa-plus"></span>&nbsp;INSERT_BUTTON_TITLE</button>
		&nbsp;
	</div>

	<div id="dataview-controls-search" className="form-group">
		{
			this.noData() ? null : (
				<div>
					<div id="dataview-controls-search-group" className="input-group">
						<input type="text" className="form-control" id="dataview-search-input" placeholder="Search" name="search" defaultValue={Session.get("SEARCH_STRING_SESSION_VAR")} onKeyDown={this.onSearchKeyDown} autoFocus={true} />
						<span className="input-group-btn"><button type="submit" id="dataview-search-button" className="btn btn-primary" onClick={this.onSearch}><span className="fa fa-search"></span></button></span>
					</div>
					&nbsp;
				</div>
			)
		}
	</div>

	<form id="search-engine-form">
		<div className="form-group form-group-lg">
			<div className="input-group">
				<input type="text" className="form-control" id="dataview-search-input" placeholder="Search" name="search" defaultValue={Session.get("SEARCH_STRING_SESSION_VAR")} onKeyDown={this.onSearchKeyDown} autoFocus={true} />
				<span className="input-group-btn">
					<button type="submit" id="dataview-search-button" className="btn-lg btn btn-primary" onClick={this.onSearch}>
						<span className="fa fa-search">
						</span>
					</button>
				</span>
			</div>
		</div>
	</form>

	<div id="dataview-controls-export" className="form-group">
		{
			this.isNotEmpty() ? (
					<div className="btn-group">
						<button type="button" className="btn btn-default" id="dataview-export-default" onClick={this.onExportCSV}>Download</button>
						<button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
							<span className="caret"></span>
						</button>
						<ul className="dropdown-menu" role="menu">
							<li onClick={this.onExportCSV}><a href="#">Download as CSV</a></li>
							<li onClick={this.onExportTSV}><a href="#">Download as TSV</a></li>
							<li onClick={this.onExportJSON}><a href="#">Download as JSON</a></li>
						</ul>
					</div>
			) : null
		}
	</div>
</div>
