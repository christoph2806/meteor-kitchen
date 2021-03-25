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
			<input type="checkbox" defaultChecked="ITEM_VALUE" name="FIELD_NAME" />
			ITEM_TITLE
		</label>
	</div>

	<div id="form-input-select" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<select className="form-control FIELD_CONTROL_CLASS" name="FIELD_NAME" defaultValue="FIELD_VALUE">
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
			<select multiple="multiple" className="form-control FIELD_CONTROL_CLASS" name="FIELD_NAME">
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
			<select multiple="multiple" data-role="tagsinput" className="form-control FIELD_CONTROL_CLASS" name="FIELD_NAME">
				{/*
				{{#each getArray FIELD_VALUE}}
				<option id="form-input-tags-item" value="{{this}}">
					{{this}}
				</option>
				{{/each}}
				*/}
			</select>
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>

	<div id="form-input-submit" className="form-group">
		<div className="submit-div">
			<button id="form-submit-button" className="btn btn-success" type="submit">
				<span className="fa fa-check" />
				SUBMIT_BUTTON_TITLE
			</button>
			<a href="#" id="form-cancel-button" className="btn btn-default" onClick={this.onCancel}>
				CANCEL_BUTTON_TITLE
			</a>
			<a href="#" id="form-close-button" className="btn btn-primary" onClick={this.onClose}>
				CLOSE_BUTTON_TITLE
			</a>
		</div>
	</div>

	<div id="form-input-crud" className="form-group FIELD_GROUP_CLASS FIELD_ID">
		<label htmlFor="FIELD_NAME">FIELD_TITLE</label>
		<div className="input-div">
			<table className="table table-striped">
				<thead>
					<tr className="crud-table-controls">
						<td colSpan="CRUD_FIELD_COUNT">
							<button type="button" className="btn btn-success btn-sm" data-toggle="modal" data-target="#CRUD_INSERT_FORM_CONTAINER_ID"><span className="fa fa-plus" /> CRUD_INSERT_BUTTON_TITLE</button>
						</td>
					</tr>
					{/*
					{{#if FIELD_CRUD_ITEMS}}
					<tr class="crud-table-header">
					</tr>
					{{/if}}
					*/}
				</thead>
				<tbody>
					{/*
					{{#each FIELD_CRUD_ITEMS}}
					<tr class="crud-table-row">
					</tr>
					{{/each}}
					*/}
				</tbody>
			</table>
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
			<input type="file" id="FIELD_ID" className="file FIELD_CONTROL_CLASS" multiple="false" data-show-upload="false" data-show-caption="true" data-field="FIELD_NAME" />
			<input type="hidden" name="FIELD_NAME" defaultValue="FIELD_VALUE" />
			<span id="help-text" className="help-block" />
			<span id="error-text" className="help-block" />
		</div>
	</div>
</div>
