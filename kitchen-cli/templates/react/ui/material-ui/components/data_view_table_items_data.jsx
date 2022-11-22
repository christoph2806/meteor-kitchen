<td id="dataview-table-items-cell" onClick={this.onSelect}>
	FIELD_VALUE
</td>

<td id="dataview-table-items-checkbox-cell">
	<input type="checkbox" className={`inline-checkbox EDIT_BUTTON_CLASS`} data-field="FIELD_NAME" checked={!!this.props.data.FIELD_NAME} onChange={this.onToggle} />
</td>

<td id="dataview-table-items-delete-cell" className="td-icon">
	<span id="delete-button" className={`fa fa-trash-o DELETE_BUTTON_CLASS`} title="DELETE_BUTTON_TITLE" onClick={this.onDelete}></span>
</td>

<td id="dataview-table-items-edit-cell" className="td-icon">
	<span id="edit-button" className={`fa fa-pencil EDIT_BUTTON_CLASS`} title="EDIT_BUTTON_TITLE" onClick={this.onEdit}></span>
</td>

<td id="dataview-table-items-action-cell-icon" className="td-icon">
	ACTION_ENABLED_HELPER_START<span id="action-button" data-action="ACTION_NAME" className="ACTION_ICON_CLASS" title="ACTION_TITLE" onClick={this.onItemAction}></span>ACTION_ENABLED_HELPER_END
</td>

<td id="dataview-table-items-action-cell-button" className="td-button">
	ACTION_ENABLED_HELPER_START<button type="button" id="action-button" data-action="ACTION_NAME" className="btn btn-primary btn-xs" onClick={this.onItemAction}>ACTION_TITLE</button>ACTION_ENABLED_HELPER_END
</td>
