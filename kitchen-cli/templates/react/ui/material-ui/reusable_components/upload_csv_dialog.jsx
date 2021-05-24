import ReactDOM from "react-dom";
import React, { Component } from "react";
import * as objectUtils from "CLIENT_LIB_DIR/object_utils.js";

export const UploadCSVDialog = function(options = {}) {
	let wrapper = document.body.appendChild(document.createElement("div"));
	let props = options || {};
	props.wrapper = wrapper;
	let component = ReactDOM.render(React.createElement(UploadCSVBox, props), wrapper);
};


export class UploadCSVBox extends Component {

    constructor() {
        super();

        this.state = {
            gotRawData: false,
            gotData: false,
            rawData: null,
            data: [],
            mapping: {}
        }

        this.onConvert = this.onConvert.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onUpload = this.onUpload.bind(this);
        this.onMappingChange = this.onMappingChange.bind(this);
        this.renderErrorMessage = this.renderErrorMessage.bind(this);
        this.renderUploadButton = this.renderUploadButton.bind(this);
        this.renderImportFilter = this.renderImportFilter.bind(this);
        this.renderPreview = this.renderPreview.bind(this);
    }

	componentDidMount() {
		var self = this;
		$("#csv-import-dialog.modal").modal();
		$("#csv-import-dialog.modal").on("hidden.bs.modal", function (e) {
			self.props.wrapper.remove();
		});
	}

	onConvert(e) {
		$(".button-convert").button("loading");
		var data = [];
		var rawData = this.state.rawData || [];
		var mapping = this.state.mapping || {};
		var colDefs = this.props.columns || [];

		var colDefObj = {};
		colDefs.map(colDef => colDefObj[colDef.name] = colDef);

		var rowCount = rawData.length;
		for(var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			var row = rawData[rowIndex];
			var obj = {};
			for(var key in mapping) {
				var originalName = mapping[key];

				var value = row[originalName];

				if(originalName) {
					var colDef = colDefObj[key];
					if(colDef) {
						// check datatype
						switch(colDef.type) {
							case "integer": {
								value = value ? parseInt(value) : (colDef.required ? colDef.defaultValue : null); 
								if(isNaN(value)) {
									$(".button-convert").button("reset");
									this.setState({ errorMessage: "Error in row " + rowIndex + ", column \"" + colDef.name + "\". Expected \"" + colDef.type + "\" but found \"" + row[originalName] + "\"" });
									return;
								}
							} break;
							case "float": {
								value = value ? parseFloat(value) : (colDef.required ? colDef.defaultValue : null); 
								if(isNaN(value)) {
									$(".button-convert").button("reset");
									this.setState({ errorMessage: "Error in row " + rowIndex + ", column \"" + colDef.name + "\". Expected \"" + colDef.type + "\" but found \"" + row[originalName] + "\"" });
									return;
								}
							} break;

							case "string": {
								value = value || (colDef.required ? colDef.defaultValue : "");

								if(!value && colDef.required) {
									$(".button-convert").button("reset");
									this.setState({ errorMessage: "Error in row " + rowIndex + ", column \"" + colDef.name + "\". Required value missing." });
									return;									
								}

							}; break;
						}
					}
					obj[key] = value;
				}
			}
			data.push(obj);
		}

		this.setState({ errorMessage: "", gotRawData: false, gotData: true, rawData: null, data: data });

		$(".button-convert").button("reset");
	}

	onSubmit(e) {
		if(this.props.onSubmit) {

			this.props.onSubmit(this.state.data);
		}
	}

	onCancel(e) {
		if(this.props.onCancel) {
			this.props.onCancel();
		}
	}

	onUpload(e) {
		let self = this;

		this.setState({ errorMessage: "", gotRawData: false, gotData: false, rawData: null, data: null });

		var file = e.target.files[0];
		var reader = new FileReader();

		reader.readAsText(file);

		reader.onload = function(event) {
			if(self.props.columns && self.props.columns.length) {
				var rawData = objectUtils.importCSV(event.target.result);

				var colNames = [];
				if(rawData && rawData.length) {
					colNames = Object.keys(rawData[0]);
				}
				var mapping = {};
				self.props.columns.map(function(colDef) {
					mapping[colDef.name] = colNames.indexOf(colDef.name) >= 0 ? colDef.name : "";
				});

				self.setState({ gotRawData: true, gotData: false, rawData: rawData, data: [], mapping: mapping });				
			} else {
				var data = importCSV(event.target.result);
				self.setState({ gotRawData: false, gotData: true, rawData: null, data: data, mapping: {} });
			}
		};

		reader.onerror = function() {
			self.setState({ errorMessage: "Unable to read " + file.fileName });
		};
	}

	onMappingChange(e) {
		var input = $(e.currentTarget);
		var expected = input.attr("data-expected");
		var colName = input.val();
		var mapping = this.state.mapping || {};
		mapping[expected] = colName;
		this.setState({ mapping: mapping });
	}

	renderErrorMessage() {
		return (
			<div className="alert alert-warning">
				{this.state.errorMessage}
			</div>
		);
	}

	renderUploadButton() {
		return (
			<form>
				<span id="fileselector">
					<label className="btn btn-default" htmlFor="upload-file-selector">
						<input id="upload-file-selector" type="file" accept=".csv, .tsv" onChange={this.onUpload} />
						<i className="fa fa-upload margin-correction"></i>&nbsp;Upload File
					</label>
				</span>
			</form>
		);
	}

	renderImportFilter() {
		var self = this;
		var colDefs = this.props.columns || [];
		var rawData = this.state.rawData || [];
		var mapping = this.state.mapping || {};

		var colNames = rawData && rawData.length ? Object.keys(rawData[0]) : [];

		return (
			<div>
				<p>
					{rawData.length} row(s) and {colNames.length} column(s) detected.
				</p>

				{colDefs.length ? (
					<div>
						<h3>Column name mapping</h3>
						<table className="table">
							<thead>
								<tr>
									<th>
										Expected
									</th>
									<th>
										Detected
									</th>
								</tr>
							</thead>

							<tbody>
								{
									colDefs.map(function(colDef, defIndex) {
										return (
											<tr key={defIndex}>
												<td>
													{colDef.name}
												</td>
												<td>
													<select className="form-control" value={mapping[colDef.name]} data-expected={colDef.name} onChange={self.onMappingChange}>
														<option value="">(don't import)</option>
														{colNames.map(function(colName, colIndex) {
															return (<option key={colIndex} value={colName}>{colName}</option>);
														})}
													</select>
												</td>
											</tr>
										);
									})
								}
							</tbody>
						</table>
						{this.state.errorMessage ? this.renderErrorMessage() : null}
					</div>
				) : (
					<div></div>
				)}
			</div>
		);
	}

	renderPreview() {
		var self = this;
		var data = this.state.data || [];
		var colNames = data && data.length ? Object.keys(data[0]) : [];

		return(
			<div>
				<p>
					Successfully Parsed {data.length} rows and {colNames.length} columns.
				</p>
			</div>
		);
	}

	render() {
		return (
			<div id="csv-upload-dialog" className="modal" tabIndex="-1" role="dialog">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.onCancel}><span aria-hidden="true">&times;</span></button>
							<h4 className="modal-title">{this.props.title || "Upload CSV"}</h4>
						</div>
						<div className="modal-body">
							{this.state.errorMessage ? this.renderErrorMessage() : null}
							{this.props.message ? (<p>{this.props.message}</p>) : null}

							{this.state.gotRawData || this.state.gotData ? (
								this.state.gotData ? (
									this.renderPreview()
								) : (
									this.renderImportFilter()
								)
							) : (
								this.renderUploadButton()
							)}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.onCancel}>Cancel</button>
							{this.state.gotRawData ? <button type="button" className="btn btn-primary button-convert" onClick={this.onConvert}>OK</button> : null}
							{this.state.gotData ? <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.onSubmit}>OK</button> : null}
						</div>
					</div>
				</div>
			</div>
		);
	}
}