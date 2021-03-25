<table id="dataview-table" class="table table-striped">
	<thead id="dataview-table-header">
		<tr id="dataview-table-header-row">
		</tr>
	</thead>

	<tbody id="dataview-table-items">
		{this.props.data.QUERY_VAR.map(function(item) {
			return(
				<TEMPLATE_NAME_TABLE_ITEMS key={item._id} data={item} routeParams={self.props.routeParams} onDelete={self.onDelete} />
			);
		})}
	</tbody>
</table>

<th id="dataview-table-header-cell">
	FIELD_TITLE
</th>
