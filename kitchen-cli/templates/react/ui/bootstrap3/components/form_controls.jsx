<div>
	<input id="form-input-hidden" type="hidden" name="FIELD_NAME" defaultValue="FIELD_VALUE" />

	<div id="form-input-text" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<input type="text" name="FIELD_NAME" defaultValue="FIELD_VALUE" className="form-control FIELD_CONTROL_CLASS" />
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>

	<div id="form-input-password" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<input type="password" name="FIELD_NAME" defaultValue="FIELD_VALUE" className="form-control FIELD_CONTROL_CLASS" />
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>

	<div id="form-input-datepicker" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<div className="input-group date">
				<input type="text" name="FIELD_NAME" defaultValue="FIELD_VALUE" className="form-control FIELD_CONTROL_CLASS" /><span className="input-group-addon"><i className="fa fa-calendar" /></span>
			</div>
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>

	<div id="form-input-read-only" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<p className="form-control-static FIELD_CONTROL_CLASS control-FIELD_ID">FIELD_VALUE</p>
		</div>
	</div>

	<div id="form-input-link" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<p className="form-control-static FIELD_CONTROL_CLASS"><a href="FIELD_VALUE">FIELD_VALUE</a></p>
		</div>
	</div>

	<div id="form-input-textarea" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<textarea className="form-control FIELD_CONTROL_CLASS" name="FIELD_NAME" defaultValue="FIELD_VALUE" />
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>

	<div id="form-input-radio" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<div id="form-input-radio-items" className="FIELD_CONTROL_CLASS">
			</div>
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>

	<div id="form-input-radio-item" className="radio">
		<label>
			<input type="radio" defaultValue="ITEM_VALUE" name="FIELD_NAME" />
			ITEM_TITLE
		</label>
	</div>

	<div id="form-input-checkbox" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<div id="form-input-checkbox-items" className="FIELD_CONTROL_CLASS">
			</div>
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>

	<div id="form-input-checkbox-item" className="checkbox">
		<label>
			<input type="checkbox" defaultValue="ITEM_VALUE" name="FIELD_NAME" />
			ITEM_TITLE
		</label>
	</div>

	<div id="form-input-select" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<select className="form-control selectpicker FIELD_CONTROL_CLASS" name="FIELD_NAME" defaultValue="FIELD_VALUE" data-live-search={true}>
			</select>
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>

	<option id="form-input-select-item" key=ITEM_KEY value=ITEM_VALUE>
		ITEM_TITLE
	</option>

	<div id="form-input-select-multiple" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<select multiple={true} className="form-control FIELD_CONTROL_CLASS" name="FIELD_NAME">
			</select>
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>

	<option id="form-input-select-multiple-item" key=ITEM_KEY value=ITEM_VALUE>
		ITEM_TITLE
	</option>

	<div id="form-input-tags" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<select multiple={true} data-role="tagsinput" className="form-control FIELD_CONTROL_CLASS" name="FIELD_NAME">
				{objectUtils.getArray(FIELD_VALUE_RAW).map(function(tag, ndx) {
					return(
						<option key={ndx} value={tag} id="form-input-tags-item">
							{tag}
						</option>
					);
				})}
			</select>
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>

	<div id="form-input-submit" className="form-group">
		<div className="submit-div btn-toolbar">
			<a href="#" id="form-cancel-button" className="btn btn-default" onClick={this.onCancel}>
				CANCEL_BUTTON_TITLE
			</a>
			<a href="#" id="form-close-button" className="btn btn-primary" onClick={this.onClose}>
				CLOSE_BUTTON_TITLE
			</a>
			<button id="form-submit-button" className="btn btn-success" type="submit">
				SUBMIT_BUTTON_TITLE
			</button>
		</div>
	</div>

	<div id="form-input-crud" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<div className="row">
				<div id="dataview-controls" className="col-xs-12">
					<button type="button" className="btn btn-success btn-sm" data-toggle="modal" data-target="#CRUD_INSERT_FORM_CONTAINER_ID"><span className="fa fa-plus" /> CRUD_INSERT_BUTTON_TITLE</button>
				</div>
			</div>
			{Session.get("FIELD_CRUD_ITEMS") && Session.get("FIELD_CRUD_ITEMS").length ? (
				<table className="table table-striped">
					<thead>
						<tr className="crud-table-header">
						</tr>
					</thead>
					<tbody>
						{
							Session.get("FIELD_CRUD_ITEMS").map(function(item) {
								return(
									<tr key={item._id} className="crud-table-row">
									</tr>
								);
							})
						}
					</tbody>
				</table>
			) : (
				<div className="alert alert-info">Empty</div>
			)}
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>

		<div className="modal crud-insert-form-container" id="CRUD_INSERT_FORM_CONTAINER_ID" tabIndex={-1} role="dialog" aria-hidden="true">
			<div className="modal-dialog">
				<div className="modal-content">
					<div className="modal-body">
					</div>
				</div>
			</div>
		</div>
	</div>

	<div id="form-input-file" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<input type="file" id="FIELD_ID" className="file FIELD_CONTROL_CLASS" multiple={false} data-show-upload="false" data-show-caption="true" data-field="FIELD_NAME" onChange={this.onFileUpload} />
			<input type="hidden" name="FIELD_NAME" defaultValue="FIELD_VALUE" />
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>
</div>
