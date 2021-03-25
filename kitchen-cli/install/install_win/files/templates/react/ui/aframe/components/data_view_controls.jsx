<div>
	<div id="dataview-controls-insert" class="form-group INSERT_BUTTON_CLASS">
		<button type="button" id="dataview-insert-button" class="btn btn-success" onClick={this.onInsert}><span class="fa fa-plus"></span> INSERT_BUTTON_TITLE</button>
	</div>

	<div id="dataview-controls-search">
		{
			<div id="dataview-controls-search-group" class="form-group">
				<label class="sr-only" htmlFor="search">Search</label>
				<input type="text" class="form-control" id="dataview-search-input" placeholder="Search" name="search" value={this.state.SEARCH_STRING_SESSION_VAR} onChange={this.onSearchInputChange} autoFocus=true />
				<button type="submit" id="dataview-search-button" class="btn btn-primary" onClick={this.onSearch}><span class="fa fa-search"></span></button>
			</div>
		}
	</div>

	<div id="dataview-controls-export" class="form-group">
		{
			this.isNotEmpty() ? 
					<div class="btn-group">
						<button type="button" class="btn btn-default" id="dataview-export-default" onClick={this.onExportCSV}>Download</button>
						<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
							<span class="caret"></span>
						</button>
						<ul class="dropdown-menu" role="menu">
							<li onClick={this.onExportCSV}><a href="#">Download as CSV</a></li>
							<li onClick={this.onExportTSV}><a href="#">Download as TSV</a></li>
							<li onClick={this.onExportJSON}><a href="#">Download as JSON</a></li>
						</ul>
					</div>
			:
			null
		}
	</div>
</div>
