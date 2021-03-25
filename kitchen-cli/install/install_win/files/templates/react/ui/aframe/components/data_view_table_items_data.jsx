<td id="dataview-table-items-cell" onClick={this.onSelect}>
	FIELD_VALUE
</td>

<td id="dataview-table-items-checkbox-cell">
	<input type="checkbox" class="inline-checkbox EDIT_BUTTON_CLASS" data-field="FIELD_NAME" checked={!!this.props.data.FIELD_NAME} onChange={this.onToggle} />
</td>

<td id="dataview-table-items-delete-cell" class="td-icon">
	<span id="delete-button" class="fa fa-trash-o DELETE_BUTTON_CLASS" title="Delete" onClick={this.onDelete}></span>
</td>

<td id="dataview-table-items-edit-cell" class="td-icon">
	<span id="edit-button" class="fa fa-pencil EDIT_BUTTON_CLASS" title="Edit" onClick={this.onEdit}></span>
</td>
