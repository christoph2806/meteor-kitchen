import React, { Component } from "react";
import ReactDOM from "react-dom";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import { HTTP } from 'meteor/http';
import { CMSContentCollection, CMSFileCollection } from "BOTH_COLLECTIONS_DIR/cms_content.js";
import { ConfirmationDialog } from "CLIENT_COMPONENTS_DIR/confirmation_dialog/confirmation_dialog.jsx";
import { Markdown } from "CLIENT_COMPONENTS_DIR/markdown/markdown.jsx";
import { Chart } from "CLIENT_COMPONENTS_DIR/chart/chart.jsx";
import * as formUtils from "CLIENT_LIB_DIR/form_utils";
import * as stringUtils from "BOTH_LIB_DIR/string_utils";
import * as httpUtils from "CLIENT_LIB_DIR/http_utils";
import * as objectUtils from "BOTH_LIB_DIR/object_utils";
import "./cms_content.less";


const cmsInjectScripts = function(component) {
	var scripts = $(component.refs.root).find("script").each(function() {
        const script = document.createElement("script");
        script.innerHTML = $(this)[0].innerHTML;
        script.async = true;
        document.body.appendChild(script);
	});
};


export class CMSImageChoice extends Component {

	constructor() {
		super();
		this.renderItem = this.renderItem.bind(this);
	}

	renderItem(item, name, index) {
		return (
			<div key={index} className="cms-image-choice-item pull-left text-center">
				<label>
					<input type="radio" name={name} defaultValue={item.value} defaultChecked={item.default} />
					<img src={item.image || "http://placehold.it/320x200/fff/000?text=No%20preview"} />
				</label>

				<br />{item.title || item.value || ""}
			</div>
		);
	}

	render() {
		const self = this;
		return (
			<div className="form-group">
				<div className="cms-image-choice">
					<label style={{width: "100%"}} htmlFor="type">
						{this.props.label}
					</label>
					{
						this.props.items.map(function(item, index) {
							return self.renderItem(item, self.props.name, index);
						})
					}
				</div>
			</div>
		);
	}	
}


export class CMSComponent extends Component {

	constructor() {
		super();
		this.userCanInsert = this.userCanInsert.bind(this);
		this.onClickAddBlock = this.onClickAddBlock.bind(this);
		this.onClickExportContent = this.onClickExportContent.bind(this);
		this.onClickImportContent = this.onClickImportContent.bind(this);
		this.onUploadContent = this.onUploadContent.bind(this);
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {

	}

	userCanInsert() {	
		return CMSContentCollection.userCanInsert(Meteor.userId());
	}

	onClickAddBlock(e) {
		var sessionKeyMode = "cms_content" + this.props.name + "Mode";
		Session.set(sessionKeyMode, "insert");
	}

	onClickExportContent(e) {
		let data = {
			name: this.props.name,
			content: this.props.content
		};

		httpUtils.downloadLocalResource(JSON.stringify(data, null, "\t"), "cms_" + (this.props.name || "content") + ".json");
	}

	onClickImportContent(e) {
		$(e.currentTarget).closest(".btn-group").find("input[type='file']").trigger("click");
	}

	onUploadContent(e) {
		var self = this;
		var fileInput = $(e.currentTarget)[0];
		if(!fileInput.files || !fileInput.files.length) {
			return;
		}

		var file = fileInput.files[0];

		var fr = new FileReader();
		fr.onload = function(evt) {
			var data = null;
			try {
				data = JSON.parse(evt.target.result + "");
				if(!data || !data.content) {
					alert("Content not found. (invalid file format)");
				} else {
					Meteor.call("importCmsContent", self.props.name, data.content, function(e, r) {
						if(e) {
							alert(e);
						}
					});
				}
			} catch(err) {
				alert(err);
			}
		};
		fr.onerror = function(evt) {
			alert("Error reading file.");
		};
		fr.readAsText(file);
	}

	render() {
		return this.props.dataLoading ? (
				<div className="loading">
					<i className="fa fa-circle-o-notch fa-2x fa-spin">
					</i>
				</div>
			) : (
			<div className={this.props.containerClass}>
				{this.props.content.length ? (
						this.props.content.map(function(item, itemIndex) {
							return (
								<CMSItemContainer key={item._id} data={item} />
							);
						})
				) : (
					this.props.textIfEmpty ? (
						<div className="alert alert-info">
							{this.props.textIfEmpty}
						</div>
					) : (
						null
					)
				)}
				{this.userCanInsert() ? (
					<div className="row cms-content read-write">
						<div className="col-md-12">
							{
								this.props.insertMode ? (
									<CMSInsertFormContainer data={this.props} />
								) : 
									(	
										<div>
											<div className="btn-group dropup">
												<button type="button" className="add-block btn btn-danger btn-sm" onClick={this.onClickAddBlock}>
													<i className="fa fa-plus">
													</i>
													&nbsp;Add Content Block					
												</button>

												<button type="button" className="btn btn-danger btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
													<span className="caret"></span>
													<span className="sr-only">Toggle Dropdown</span>
												</button>
												<ul className="dropdown-menu">
													<li><a href="javascript:void(0)" onClick={this.onClickAddBlock}>Add Content Block</a></li>
													<li><a href="javascript:void(0)" onClick={this.onClickImportContent}>Import content...</a></li>
												</ul>
												<input type="file" id="upload-content" accept="application/json,.json" hidden multiple="false" onChange={this.onUploadContent} style={{ display: "none" }} />
											</div>&nbsp;
											{
												this.props.content.length ? (
													<button type="button" className="export-content btn btn-default btn-sm" onClick={this.onClickExportContent}>
														<i className="fa fa-download">
														</i>
														&nbsp;Export content
													</button>
												) : null
											}
										</div>
									)
							}
						</div>
					</div>
				) : (
					null
				)}
			</div>
		);
	}
}

export const CMSContent = withTracker(function(props) {
	var isReady = function() {
		var subs = [
			Meteor.subscribe("cms_content", props.name)
		];
		var ready = true;
		_.each(subs, function(sub) {
			if(!sub.ready())
				ready = false;
		});
		return ready;
	};

	var data = { dataLoading: true };

	if(isReady()) {
		var sessionKeyMode = "cms_content" + props.name + "Mode";
		var insertMode = Session.get(sessionKeyMode) === "insert";

		data = {
			content: [],
			insertMode: insertMode
		};

		data.content = CMSContentCollection.find({ name: props.name }, { sort: { order: 1, createdAt: 1 }}).fetch();
	}

	return data;

})(CMSComponent);


export class CMSInsertForm extends Component {

	constructor() {
		super();
		this.onSubmitForm = this.onSubmitForm.bind(this);
		this.onClickCancelInsert = this.onClickCancelInsert.bind(this);

		this.blocks = [
			{ title: "Header 1", value: "header01", image: "/images/cms/thumbs/header01.png", default: true },
			{ title: "Header 2", value: "header02", image: "/images/cms/thumbs/header02.png" },
			{ title: "Markdown (1 col)", value: "markdown", image: "/images/cms/thumbs/markdown_1col.png" },
			{ title: "Markdown (2 col)", value: "markdown-2col", image: "/images/cms/thumbs/markdown_2col.png" },
			{ title: "Markdown (3 col)", value: "markdown-3col", image: "/images/cms/thumbs/markdown_3col.png" },
			{ title: "Chart 1", value: "chart01", image: "" },
			{ title: "Raw HTML", value: "html", image: "" },
			{ title: "Raw Text", value: "text", image: "" }
		];
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {

	}

	onSubmitForm(e) {
		e.preventDefault();

		var self = this;
		function submitAction(result, msg) {
			var sessionKeyMode = "cms_content" + self.props.data.name + "Mode";
			var sessionKeyEditing = "cms_content" + self.props.data.name + "Editing";
			var editingItems = Session.get(sessionKeyEditing) || [];
			editingItems.push(result);

			Session.set(sessionKeyEditing, editingItems);
			Session.set(sessionKeyMode, null);
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			var sessionKeyError = "cms_content" + self.props.data.name + "ErrorMessage";
			Session.set(sessionKeyError, message);
		}

		formUtils.validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				var type = values.type;
				delete values.type;
				Meteor.call("insertCmsBlock", self.props.data.name, type, values, function(e, r) { 
					if(e) {
						errorAction(e); 
					} else {
						submitAction(r);
					}
				});
			}
		);

		return false;
	}

	onClickCancelInsert(e) {
		var sessionKeyMode = "cms_content" + this.props.data.name + "Mode";
		Session.set(sessionKeyMode, null);
	}

	render() {
		return (
			<form onSubmit={this.onSubmitForm}>
				<h3>
					Add content block

					<div className="pull-right">
						<button type="button" className="btn cancel-insert btn-default" onClick={this.onClickCancelInsert}>
							Cancel
						</button>
						&nbsp;
						<button type="submit" className="btn btn-success">
							OK
						</button>
					</div>
				</h3>
				{this.props.data.errorMessage ? (
					<div className="alert alert-warning">
						{this.props.data.errorMessage}
					</div>
				) : (
					null
				)}


				<CMSImageChoice name="type" label="Block Type" items={this.blocks} />

				<div className="form-group">
					<button type="button" className="btn cancel-insert btn-default" onClick={this.onClickCancelInsert}>
						Cancel
					</button>
					&nbsp;
					<button type="submit" className="btn btn-success">
						OK
					</button>
				</div>
			</form>
		);
	}
}

export const CMSInsertFormContainer = withTracker(function(props) {
	var sessionKeyError = "cms_content" + props.data.name + "ErrorMessage";
	var errorMessage = Session.get(sessionKeyError);
	return {
		errorMessage: errorMessage
	};
})(CMSInsertForm);


export class CMSItem extends Component {

	constructor() {
		super();
		this.userCanUpdate = this.userCanUpdate.bind(this);
		this.classString = this.classString.bind(this);
		this.renderItem = this.renderItem.bind(this);
		this.onClickEditButton = this.onClickEditButton.bind(this);
		this.onClickRemoveButton = this.onClickRemoveButton.bind(this);
		this.onClickMoveUpButton = this.onClickMoveUpButton.bind(this);
		this.onClickMoveDownButton = this.onClickMoveDownButton.bind(this);
		this.customStyle = this.customStyle.bind(this);
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {

	}

	userCanUpdate() {
		return !this.props.editing && CMSContentCollection.userCanUpdate(Meteor.userId());
	}

	classString() {
		let userCanUpdate = CMSContentCollection.userCanUpdate(Meteor.userId());
		let classString = "cms-content" + (userCanUpdate ? " read-write" : " read-only");
		var content = this.props.data ? this.props.data.content : "";
		if(!content) {
			classString = classString + " empty-content";
		}

		if(this.props.data && this.props.data.data && this.props.data.data.class && !this.props.editing) {
			classString += " " + this.props.data.data.class;
		}

		return classString;
	}

	renderItem() {
		switch(this.props.data.type) {
			case "header01": return (<CMSItemHeader01 data={this.props.data} editing={this.props.editing} />); break;
			case "header02": return (<CMSItemHeader02 data={this.props.data} editing={this.props.editing} />); break;
			case "markdown": return (<CMSItemMarkdown data={this.props.data} editing={this.props.editing} />); break;
			case "markdown-2col": return (<CMSItemMarkdown2col data={this.props.data} editing={this.props.editing} />); break;
			case "markdown-3col": return (<CMSItemMarkdown3col data={this.props.data} editing={this.props.editing} />); break;
			case "chart01": return (<CMSItemChart01 data={this.props.data} editing={this.props.editing} />); break;
			case "html": return (<CMSItemHTML data={this.props.data} editing={this.props.editing} />); break;
			case "text": return (<CMSItemText data={this.props.data} editing={this.props.editing} />); break;
			default: return (<CMSItemHTML data={this.props.data} editing={this.props.editing} />);
		}
	}

	onClickEditButton(e) {
		if(!this.userCanUpdate()) {
			return false;
		}
		var sessionKeyEditing = "cms_content" + this.props.data.name + "Editing";
		var editingItems = Session.get(sessionKeyEditing) || [];
		editingItems.push(this.props.data._id);
		Session.set(sessionKeyEditing, editingItems);
	}

	onClickMoveUpButton(e) {
		if(!this.userCanUpdate()) {
			return false;
		}

		Meteor.call("moveCmsBlockUp", this.props.data._id);
	}

	onClickMoveDownButton(e) {
		if(!this.userCanUpdate()) {
			return false;
		}

		Meteor.call("moveCmsBlockDown", this.props.data._id);
	}

	onClickRemoveButton(e) {
		ConfirmationDialog({
			message: "Are you sure you want to delete item?",
			title: "Delete",
			onYes: function(id) {
				Meteor.call("removeCmsBlock", id, function(e, r) { 
					if(e) {
						alert(e);
					} else {
					}
				});
			},
			onNo: function(id) {
			},
			onCancel: function(id) {
			},
			buttonYesTitle: "Yes",
			buttonNoTitle: "No",
			payload: this.props.data._id
		});
	}

	customStyle() {
		if(!this.props.data || !this.props.data.data || !this.props.data.data.style) {
			return {};
		}

		var obj = {};
		try {
			obj = stringUtils.cssStyleToObject(this.props.data.data.style);
		} catch(e) {

		}

		return obj;
	}

	render() {
		return (
			<div className={this.classString()} style={this.props.editing ? {} : this.customStyle()} onDoubleClick={this.onClickEditButton}>
				{this.userCanUpdate() ? (
					<div className="cms-content-controls">
						<button type="button" className="cms-content-control edit-button btn btn-danger btn-sm" onClick={this.onClickEditButton}>
							Edit			
						</button>
						&nbsp;						
						<button type="button" className="cms-content-control move-up-button btn btn-default btn-sm" onClick={this.onClickMoveUpButton} title="Move Up">
							<i className="fa fa-arrow-up"></i>
						</button>
						&nbsp;
						<button type="button" className="cms-content-control move-down-button btn btn-default btn-sm" onClick={this.onClickMoveDownButton} title="Move Down">
							<i className="fa fa-arrow-down"></i>
						</button>
						&nbsp;
						<button type="button" className="cms-content-control remove-button btn btn-default btn-sm" onClick={this.onClickRemoveButton}>
							Delete
						</button>
					</div>
				) : (
					null
				)}
				{this.renderItem()}
			</div>
		);
	}
}

export const CMSItemContainer = withTracker(function(props) {
	var sessionKeyEditing = "cms_content" + props.data.name + "Editing";
	var editingItems = Session.get(sessionKeyEditing) || [];
	var editing = editingItems.indexOf(props.data._id) >= 0;
	return {
		editing: editing
	};
})(CMSItem);



export class CMSUpdateFormSimpleComponent extends Component {

	constructor() {
		super();

		this.state = {
			lastUploadedFileURL: ""
		};

		this.title = this.title.bind(this);
		this.onSubmitForm = this.onSubmitForm.bind(this);
		this.onClickCancelUpdate = this.onClickCancelUpdate.bind(this);
		this.onClickUploadButton = this.onClickUploadButton.bind(this);
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {

	}

	title() {
		switch(this.props.data.type) {
			case "header01": return "Header 1"; break;
			case "header02": return "Header 2"; break;
			case "markdown": return "Content (Markdown)"; break;
			case "markdown-2col": return "Content (Markdown)"; break;
			case "markdown-3col": return "Content (Markdown)"; break;
			case "chart01": return "Chart 1"; break;
			case "html": return "Content (html)"; break;
			case "text": return "Content (text)"; break;
		}
		return "Content";
	}

	renderContentInput() {
		switch(this.props.data.type) {
			case "header01": return (
				<div>
					<div className="form-group">
						<label>Title</label>
						<input type="text" className="form-control" name="title" autoFocus={true} defaultValue={this.props.data.data.title} />
					</div>

					<div className="form-group">
						<label>Subtitle</label>
						<input type="text" className="form-control" name="subtitle" defaultValue={this.props.data.data.subtitle} />
					</div>

					<div className="form-group">
						<label>
							Text (markdown)
						</label>
						<textarea className="form-control" rows="5" name="content" defaultValue={this.props.data.data.content}>
						</textarea>
					</div>

					<div className="row">
						<div className="col-xs-12 col-sm-6">
							<div className="form-group">
								<label>Button Title</label>
								<input type="text" className="form-control" name="buttonTitle" defaultValue={this.props.data.data.buttonTitle} />
							</div>
						</div>
						<div className="col-xs-12 col-sm-6">
							<div className="form-group">
								<label>Button Link (relative URL)</label>
								<input type="text" className="form-control" name="buttonURL" defaultValue={this.props.data.data.buttonURL} />
							</div>
						</div>
					</div>

					<CMSInputFile name="bgImageURL" label="Background Image URL" defaultValue={this.props.data.data.bgImageURL} />
				</div>
			); break;

			case "header02": return (
				<div>
					<div className="form-group">
						<label>Title</label>
						<input type="text" className="form-control" name="title" autoFocus={true} defaultValue={this.props.data.data.title} />
					</div>

					<div className="form-group">
						<label>Subtitle</label>
						<input type="text" className="form-control" name="subtitle" defaultValue={this.props.data.data.subtitle} />
					</div>

					<div className="form-group">
						<label>
							Text (markdown)
						</label>
						<textarea className="form-control" rows="5" name="content" defaultValue={this.props.data.data.content}>
						</textarea>
					</div>

					<div className="row">
						<div className="col-xs-12 col-sm-6">
							<div className="form-group">
								<label>Button Title</label>
								<input type="text" className="form-control" name="buttonTitle" defaultValue={this.props.data.data.buttonTitle} />
							</div>
						</div>
						<div className="col-xs-12 col-sm-6">
							<div className="form-group">
								<label>Button Link (relative URL)</label>
								<input type="text" className="form-control" name="buttonURL" defaultValue={this.props.data.data.buttonURL} />
							</div>
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="textPosition">
							Content Position
						</label>

						<div className="radio">
							<label>
								<input type="radio" name="textPosition" value="left" defaultChecked={this.props.data.data.textPosition == "left" || typeof this.props.data.data.textPosition == "undefined"} />
								Text Left / Image Right
							</label>
						</div>

						<div className="radio">
							<label>
								<input type="radio" name="textPosition" value="right" defaultChecked={this.props.data.data.textPosition == "right"} />
								Text Right / Image Left
							</label>
						</div>
					</div>

					<CMSInputFile name="imageURL" label="Image URL" defaultValue={this.props.data.data.imageURL} />

					<CMSInputFile name="bgImageURL" label="Background Image URL" defaultValue={this.props.data.data.bgImageURL} />

				</div>
			); break;

			case "markdown-2col": return (
				<div className="row">
					<div className="col-md-6">
						<label>
							Column 1 (markdown)
						</label>
						<textarea className="form-control" rows="15" name="content" autoFocus={true} defaultValue={this.props.data.data.content}>
						</textarea>
					</div>
					<div className="col-md-6">
						<label>
							Column 2 (markdown)
						</label>
						<textarea className="form-control" rows="15" name="content2" autoFocus={true} defaultValue={this.props.data.data.content2}>
						</textarea>
					</div>
				</div>
			); break;

			case "markdown-3col": return (
				<div className="row">
					<div className="col-md-4">
						<label>
							Column 1 (markdown)
						</label>
						<textarea className="form-control" rows="15" name="content" autoFocus={true} defaultValue={this.props.data.data.content}>
						</textarea>
					</div>
					<div className="col-md-4">
						<label>
							Column 2 (markdown)
						</label>
						<textarea className="form-control" rows="15" name="content2" autoFocus={true} defaultValue={this.props.data.data.content2}>
						</textarea>
					</div>
					<div className="col-md-4">
						<label>
							Column 3 (markdown)
						</label>
						<textarea className="form-control" rows="15" name="content3" autoFocus={true} defaultValue={this.props.data.data.content3}>
						</textarea>
					</div>
				</div>
			); break;

			case "chart01": return (
				<div>
					<CMSInputFile name="csvFileURL" label="CSV File URL" defaultValue={this.props.data.data.csvFileURL} />
				</div>
			); break;

			default: return (

				<div className="form-group">
					<label>
						{this.title()}
					</label>
					<textarea className="form-control" rows="15" name="content" autoFocus={true} defaultValue={this.props.data.data.content}>
					</textarea>
				</div>
			);
		}
	}

	onClickUploadButton(e) {
		const self = this;
		CMSUploadDialog({
			message: "Upload file",
			title: "Upload",
			onSubmit: function(url, id) {
				self.setState({ lastUploadedFileURL: url });
			},
			onCancel: function(id) {
			},
			url: this.state.lastUploadedFileURL,
			buttonSubmitTitle: "OK",
			buttonCancelTitle: "Cancel",
			payload: ""
		});
	}

	onSubmitForm(e) {
		e.preventDefault();

		var self = this;

		function submitAction(result, msg) {
			var sessionKeyEditing = "cms_content" + self.props.data.name + "Editing";
			var editingItems = Session.get(sessionKeyEditing) || [];
			var index = editingItems.indexOf(self.props.data._id);
			if(index >= 0) {
				editingItems.splice(index, 1);
			}
			Session.set(sessionKeyEditing, editingItems);
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			var sessionKeyError = "cmsItem_" + self.props.data._id + "_ErrorMessage";
			Session.set(sessionKeyError, message);
		}

		formUtils.validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				Meteor.call("updateCmsBlock", self.props.data._id, values, function(e, r) { 
					if(e) {
						errorAction(e); 
					} else {
						submitAction(r);
					}
				});
			}
		);

		return false;
	}

	onClickCancelUpdate(e) {
		var sessionKeyEditing = "cms_content" + this.props.data.name + "Editing";
		var editingItems = Session.get(sessionKeyEditing) || [];
		var index = editingItems.indexOf(this.props.data._id);
		if(index >= 0) {
			editingItems.splice(index, 1);
		}
		Session.set(sessionKeyEditing, editingItems);			
	}

	render() {
		return (
			<form onSubmit={this.onSubmitForm} onSubmit={this.onSubmitForm}>
				{this.props.errorMessage ? (
					<div className="alert alert-warning">						
						{this.props.errorMessage}
					</div>
				) : (
					null
				)}
				<div className="row">
					<div className="col-md-8">
						<h3>Content</h3>
						{this.renderContentInput()}
					</div>
					<div className="col-md-4">
						<h3>Style</h3>
						<div className="form-group">
							<label>
								Container class
							</label>
							<input type="text" className="form-control" name="class" defaultValue={this.props.data.data.class} />
						</div>

						<div className="form-group">
							<label>
								Container inline style (css)
							</label>
							<textarea className="form-control" rows="7" name="style" defaultValue={this.props.data.data.style}>
							</textarea>
						</div>

						<div className="form-group">
							<label style={{ width: "100%" }}>
								Upload file
							</label>
							<button type="button" className="btn upload-button btn-default" onClick={this.onClickUploadButton}>
								Upload
								&nbsp;<span className="fa fa-cloud-upload"></span>
							</button>
						</div>
					</div>
				</div>

				<div className="row">
					<div className="col-md-12">
						<button type="button" className="btn cancel-update btn-default" onClick={this.onClickCancelUpdate}>
							Cancel
						</button>
						&nbsp;
						<button type="submit" className="btn btn-success">
							Save
						</button>
					</div>
				</div>
			</form>
		);
	}
}

export const CMSUpdateFormSimple = withTracker(function(props) {
	var sessionKeyError = "cmsItem_" + props.data._id + "_ErrorMessage";
	var errorMessage = Session.get(sessionKeyError);
	return {
		errorMessage: errorMessage
	};
})(CMSUpdateFormSimpleComponent);


export class CMSItemHeader01 extends Component {

	constructor() {
		super();
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {
		cmsInjectScripts(this);
	}

	componentDidUpdate(prevProps) {
		if(!this.props.editing && prevProps.editing) {
			cmsInjectScripts(this);
		}
	}

	render() {
		return this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				<div ref="root" className={"jumbotron text-center cms-header cms-header01" + (this.props.data.data.bgImageURL ? " white-text" : "")} style={this.props.data.data.bgImageURL ? {backgroundImage: "url('" + this.props.data.data.bgImageURL + "')"} : {}}>
					{
						this.props.data.data.title ? (
							<h1>{this.props.data.data.title}</h1>
						) : null
					} 
					{
						this.props.data.data.subtitle ? (
							<h2>{this.props.data.data.subtitle}</h2>
						) : null 
					}

					{this.props.data.data.content ? <Markdown text={this.props.data.data.content} /> : <p><br /></p>}
					{
						this.props.data.data.buttonTitle || this.props.data.data.buttonURL ? (
							<p><a className="btn btn-primary btn-lg" href={this.props.data.data.buttonURL || "#"} role="button">{this.props.data.data.buttonTitle || "Continue"}</a></p>
						) : null 
					}
				</div>
			);
	}
}

export class CMSItemHeader02 extends Component {

	constructor() {
		super();

		this.renderContent = this.renderContent.bind(this);
		this.renderPicture = this.renderPicture.bind(this);
		this.renderTextLeft = this.renderTextLeft.bind(this);
		this.renderTextRight = this.renderTextRight.bind(this);
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {
		cmsInjectScripts(this);
	}

	componentDidUpdate(prevProps) {
		if(!this.props.editing && prevProps.editing) {
			cmsInjectScripts(this);
		}
	}

	renderContent() {
		return (
			<div key="1" className="col-sm-6 text-center-xs">
				{
					this.props.data.data.title ? (
						<h1>{this.props.data.data.title}</h1>
					) : null
				} 
				{
					this.props.data.data.subtitle ? (
						<h2>{this.props.data.data.subtitle}</h2>
					) : null 
				}

				{this.props.data.data.content ? <Markdown text={this.props.data.data.content} /> : <p><br /></p>}
				{
					this.props.data.data.buttonTitle || this.props.data.data.buttonURL ? (
						<p><a className="btn btn-primary btn-lg" href={this.props.data.data.buttonURL || "#"} role="button">{this.props.data.data.buttonTitle || "Continue"}</a></p>
					) : null 
				}
			</div>
		);
	}

	renderPicture() {
		return (
			<div key="2" className="col-sm-6 text-center">
				{
					this.props.data.data.imageURL ? (
						<img className="col-image" src={this.props.data.data.imageURL} />
					) : null 
				}
			</div>
		);
	}

	renderTextLeft() {
		const res = [];
		res.push(this.renderContent());
		res.push(this.renderPicture());
		return res;
	}

	renderTextRight() {
		const res = [];
		res.push(this.renderPicture());
		res.push(this.renderContent());
		return res;
	}

	render() {
		return this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				<div ref="root" className={"jumbotron cms-header cms-header02" + (this.props.data.data.bgImageURL ? " white-text" : "")} style={this.props.data.data.bgImageURL ? {backgroundImage: "url('" + this.props.data.data.bgImageURL + "')"} : {}}>

					<div className="row">
						{
							this.props.data.data.textPosition == "left" ? this.renderTextLeft() : this.renderTextRight()
						}
					</div>
				</div>
			);
	}
}


export class CMSItemMarkdown extends Component {

	constructor() {
		super();
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {
		cmsInjectScripts(this);
	}

	componentDidUpdate(prevProps) {
		if(!this.props.editing && prevProps.editing) {
			cmsInjectScripts(this);
		}
	}

	render() {
		return this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				this.props.data.data.content ? (
					<Markdown  ref="root" text={this.props.data.data.content} />
				) : (
					<span>&nbsp;</span>
				)
			);
	}
}

export class CMSItemMarkdown2col extends Component {

	constructor() {
		super();
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {
		cmsInjectScripts(this);
	}

	componentDidUpdate(prevProps) {
		if(!this.props.editing && prevProps.editing) {
			cmsInjectScripts(this);
		}
	}

	render() {
		return this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				this.props.data.data.content ? (
					<div ref="root" className="row">
						<div className="col-md-6">
							<Markdown text={this.props.data.data.content} />
						</div>
						<div className="col-md-6">
							<Markdown text={this.props.data.data.content2} />
						</div>
					</div>
				) : (
					<span>&nbsp;</span>
				)
			);
	}
}

export class CMSItemMarkdown3col extends Component {

	constructor() {
		super();
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {
		cmsInjectScripts(this);
	}

	componentDidUpdate(prevProps) {
		if(!this.props.editing && prevProps.editing) {
			cmsInjectScripts(this);
		}
	}

	render() {
		return this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				this.props.data.data.content ? (
					<div ref="root" className="row">
						<div className="col-md-4">
							<Markdown text={this.props.data.data.content} />
						</div>
						<div className="col-md-4">
							<Markdown text={this.props.data.data.content2} />
						</div>
						<div className="col-md-4">
							<Markdown text={this.props.data.data.content3} />
						</div>
					</div>
				) : (
					<span>&nbsp;</span>
				)
			);
	}
}


export class CMSItemChart01 extends Component {
	constructor() {
		super();
	}

	componentWillMount() {
	}

	componentWillUnmount() {

	}

	componentDidMount() {
		cmsInjectScripts(this);
	}

	componentDidUpdate(prevProps) {
		if(!this.props.editing && prevProps.editing) {
			cmsInjectScripts(this);
		}
	}

	render() {
		return this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				<CMSItemChart01Chart {...this.props} />
			);
	}
}

export class CMSItemChart01ChartComponent extends Component {

	constructor() {
		super();
	}

	componentWillMount() {
		var self = this;
		Session.set(this.props.data._id + "Content", null);
		if(this.props.data && this.props.data.data && this.props.data.data.csvFileURL) {
			HTTP.get(this.props.data.data.csvFileURL, function(e, r) {
				if(e) {
					console.log(e);
				}
				Session.set(self.props.data._id + "Content", r.content);
			});
		}
	}

	componentWillUnmount() {

	}

	componentDidMount() {
	}

	componentDidUpdate(prevProps) {
	}

	render() {
		return (<Chart data={this.props.content} chartType="line" />);
	}
}

export const CMSItemChart01Chart = withTracker(function(props) {
	var content = "";
	var isReady = function() {
		var subs = [
		];
		var ready = true;
		_.each(subs, function(sub) {
			if(!sub.ready())
				ready = false;
		});

		content = Session.get(props.data._id + "Content");

		ready = ready && !!content;

		return ready;
	};

	var data = { dataLoading: true };

	if(isReady()) {
		var imported = [];
		try {
			imported = objectUtils.importCSV(content);
		} catch(err) {
			imported = [];
		}

		data = {
			content: imported
		}
	}

	return data;

})(CMSItemChart01ChartComponent);

export class CMSItemHTML extends Component {

	constructor() {
		super();
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {
		cmsInjectScripts(this);
	}

	componentDidUpdate(prevProps) {
		if(!this.props.editing && prevProps.editing) {
			cmsInjectScripts(this);
		}
	}

	render() {
		return (
			this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				this.props.data.data.content ? (
					<div ref="root" dangerouslySetInnerHTML={{ __html: this.props.data.data.content}}></div>
				) : (
					
					<span>&nbsp;</span>
							
				)
			)
		);
	}
}

export class CMSItemText extends Component {

	constructor() {
		super();
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {
		cmsInjectScripts(this);
	}

	componentDidUpdate(prevProps) {
		if(!this.props.editing && prevProps.editing) {
			cmsInjectScripts(this);
		}
	}

	render() {
		return (
			this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				this.props.data.data.content ? (
					<p ref="root" className="raw-text">
						{this.props.data.data.content}
					</p>
				) : (
					<span>&nbsp;</span>
				)
			)
		);
	}
}


/*
	<CMSInputURL name="backgroundImage" label="Background Image URL" />
*/

export class CMSInputFile extends Component {

	constructor() {
		super();

		this.state = {
			showCopy: false
		};

		this.onFileUpload = this.onFileUpload.bind(this);
		this.onCopyURL = this.onCopyURL.bind(this);
	}

	onFileUpload(e) {
		e.preventDefault();
		var self = this;
		var fileInput = $(e.currentTarget);
		var hiddenInput = fileInput.closest(".form-group").find("input[name='" + this.props.name + "']");
		var button = fileInput.closest(".form-group").find(".cms-upload-btn");


		function buttonLoading() {
			var buttonIcon = button.find("span.fa");
			button.addClass("disabled");
			buttonIcon.removeClass("fa-cloud-upload");
			buttonIcon.addClass("fa-circle-o-notch fa-spin");

		}

		function buttonReset() {
			var buttonIcon = button.find("span.fa");
			button.removeClass("disabled");
			buttonIcon.removeClass("fa-circle-o-notch fa-spin");
			buttonIcon.addClass("fa-cloud-upload");
		}

		buttonLoading();

		FS.Utility.eachFile(e, function(file) {
			CMSFileCollection.insert(file, function (err, fileObj) {
				fileInput.val("");
				if(err) {
					buttonReset();
					alert(err);
				} else {
					var subscription = Meteor.subscribe("cms_file", fileObj._id);

					var interval = Meteor.setInterval(function() {
						if(fileObj.url()) {
							Meteor.clearInterval(interval);
							hiddenInput.val(fileObj.url());
							self.setState({ showCopy: true });
							subscription.stop();
							buttonReset();
						}
					}, 50);
				}
			});
		});
		return false;
	} 

	onCopyURL(e) {
		e.preventDefault();

		var copyLink = $(e.currentTarget);

		var inputBox = copyLink.closest("form").find("input[name='" + this.props.name + "']");
		inputBox.select();
		document.execCommand("Copy");

		copyLink.text("Copied");
		Meteor.setTimeout(function() {
			copyLink.text("Copy URL");
		}, 1000);

		return false;
	}

	componentWillMount() {
		this.setState({ showCopy: !!this.props.defaultValue });
	}

	componentWillUnmount() {

	}

	componentDidMount() {

	}

	render() {
		return (
			<div className="form-group">
				<label>
					{this.props.label}
				</label>

				<div className="input-group">
					<input type="text" name={this.props.name} defaultValue={this.props.defaultValue} className="form-control" readOnly={!!this.props.readOnly} />
					<span className="input-group-btn">
						<label className="btn btn-primary cms-upload-btn" title="Upload">
							<span className="fa fa-cloud-upload"></span><input type="file" hidden multiple="false" onChange={this.onFileUpload} />
						</label>
					</span>
				</div>
				<br />{this.props.readOnly && this.state.showCopy ? <a href="#" onClick={this.onCopyURL}>Copy URL</a> : null}
			</div>
		);
	}
}


/*
	CMSUploadDialog(options);

	Function renders modal input dialog. Dialog is inserted into DOM and removed on close.

	"options" object example:

		{
			message: "Please upload something nice",
			title: "Upload",
			onSubmit: function(url, id) {
				alert("Submit: " + url);
			},
			onCancel: function(id) {
				alert("cancel: " + id);
			},
			url: "",
			buttonSubmitTitle: "OK",
			buttonCancelTitle: "Cancel",
			payload: itemId
		}

	Properties:
		message: message shown in the box (no default)
		title: modal box title (no default)
		onSubmit: function to execute if user click "OK" button (if not provided, box will simply close)
		onCancel: function to execute if user click "Cancel" button (if not provided box will simply close)
		url: default URL
		buttonSubmitTitle: text to show on "OK" button (default: "OK")
		buttonCancelTitle: text to show on "Cancel" button (default: "Cancel")
		payload: onSubmit and onCancel handler will be called with this argument. For example it can be some _id useful in your program (or whatever)
*/

export const CMSUploadDialog = function(options = {}) {
	let wrapper = document.body.appendChild(document.createElement("div"));
	let props = options || {};
	props.wrapper = wrapper;
	let component = ReactDOM.render(React.createElement(CMSUploadBox, props), wrapper);
};

export class CMSUploadBox extends Component {
	constructor () {
		super();
		this.state = {
		};

		this.onClickSubmitButton = this.onClickSubmitButton.bind(this);
		this.onClickCloseButton = this.onClickCloseButton.bind(this);
		this.onClickCancelButton = this.onClickCancelButton.bind(this);
	}

	componentDidMount() {
		var self = this;
		$("#cms-upload-dialog.modal").modal();
		$("#cms-upload-dialog.modal").on("hidden.bs.modal", function (e) {
			self.props.wrapper.remove();
		});
	}

	componentWillUnmount() {

	}

	onClickCloseButton(e) {
		if(this.props.onCancel) {
			this.props.onCancel(this.props.payload);
		}
	}

	onClickCancelButton(e) {
		if(this.props.onCancel) {
			this.props.onCancel(this.props.payload);
		}
	}

	onClickSubmitButton(e) {
		var url = $(".modal").find("input[name='cmsFileURL']").val();
		if(this.props.onSubmit) {
			this.props.onSubmit(url, this.props.payload);
		}
		$(".modal").modal("hide");
	}

	render() {
		return (
			<div id="cms-upload-dialog" className="modal" tabIndex="-1" role="dialog">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close close-button" data-dismiss="modal" onClick={this.onClickCloseButton}>
								<span aria-hidden="true">
									&times;
								</span>
							</button>
							<h4 className="modal-title">
								{this.props.title}
							</h4>
						</div>
						<div className="modal-body">
							<form>
								<CMSInputFile name="cmsFileURL" label="File URL" defaultValue={this.props.url} readOnly={true} />
							</form>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default cancel-button" data-dismiss="modal" onClick={this.onClickCancelButton}>
								{this.props.buttonCancelTitle}
							</button>
							<button type="button" className="btn btn-primary submit-button" onClick={this.onClickSubmitButton}>
								{this.props.buttonSubmitTitle}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
