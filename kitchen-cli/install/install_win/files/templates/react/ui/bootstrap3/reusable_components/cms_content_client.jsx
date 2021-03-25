import React, { Component } from "react";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import { CMSContentCollection } from "BOTH_COLLECTIONS_DIR/cms_content.js";
import { ConfirmationDialog } from "CLIENT_COMPONENTS_DIR/confirmation_dialog/confirmation_dialog.jsx";
import { Markdown } from "CLIENT_COMPONENTS_DIR/markdown/markdown.jsx";
import * as formUtils from "CLIENT_LIB_DIR/form_utils";
import * as stringUtils from "BOTH_LIB_DIR/string_utils";
import "./cms_content.less";

export class CMSComponent extends Component {

	constructor() {
		super();
		this.userCanInsert = this.userCanInsert.bind(this);
		this.onClickAddBlock = this.onClickAddBlock.bind(this);
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

	render() {
		return this.props.dataLoading ? (
				<div className="loading">
					<i className="fa fa-circle-o-notch fa-2x fa-spin">
					</i>
				</div>
			) : (
			<div className={this.containerClass}>
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
					this.props.insertMode && this.userCanInsert() ? (
						<CMSInsertFormContainer data={this.props} />
					) : (
						<div className="row">
							<div className="col-md-12">
								<button type="button" className="add-block btn btn-danger btn-sm" onClick={this.onClickAddBlock}>
									<i className="fa fa-plus">
									</i>
									&nbsp;Add Content Block					
								</button>
							</div>
						</div>
					)
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

		data.content = CMSContentCollection.find({ name: props.name }).fetch();
	}

	return data;

})(CMSComponent);


export class CMSInsertForm extends Component {

	constructor() {
		super();
		this.onSubmitForm = this.onSubmitForm.bind(this);
		this.onClickCancelInsert = this.onClickCancelInsert.bind(this);
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
				</h3>
				{this.props.data.errorMessage ? (
					<div className="alert alert-warning">
						{this.props.data.errorMessage}
					</div>
				) : (
					null
				)}
				<div className="form-group">
					<label htmlFor="type">
						Block Type
					</label>
					<div className="radio">
						<label>
							<input type="radio" name="type" value="markdown" defaultChecked={true} />
							
												Markdown (1 column)
											
						</label>
					</div>
					<div className="radio">
						<label>
							<input type="radio" name="type" value="markdown-2col" />
							
												Markdown (2 column)
											
						</label>
					</div>
					<div className="radio">
						<label>
							<input type="radio" name="type" value="markdown-3col" />
							
												Markdown (3 column)
											
						</label>
					</div>
					<div className="radio">
						<label>
							<input type="radio" name="type" value="html" />
							
												Raw HTML
											
						</label>
					</div>
					<div className="radio">
						<label>
							<input type="radio" name="type" value="text" />
							
												Raw text
											
						</label>
					</div>
				</div>
				<button type="submit" className="btn btn-success">
					OK
				</button>
				<button type="button" className="btn cancel-insert btn-default" onClick={this.onClickCancelInsert}>
					Cancel
				</button>
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
			case "markdown": return (<CMSItemMarkdown data={this.props.data} editing={this.props.editing} />); break;
			case "markdown-2col": return (<CMSItemMarkdown2col data={this.props.data} editing={this.props.editing} />); break;
			case "markdown-3col": return (<CMSItemMarkdown3col data={this.props.data} editing={this.props.editing} />); break;
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
		this.title = this.title.bind(this);
		this.onSubmitForm = this.onSubmitForm.bind(this);
		this.onClickCancelUpdate = this.onClickCancelUpdate.bind(this);
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {

	}

	title() {
		switch(this.props.data.type) {
			case "markdown": return "Content (Markdown)"; break;
			case "markdown-2col": return "Content (Markdown)"; break;
			case "markdown-3col": return "Content (Markdown)"; break;
			case "html": return "Content (html)"; break;
			case "text": return "Content (text)"; break;
		}
		return "Content";
	}

	renderContentInput() {
		switch(this.props.data.type) {
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
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						<button type="submit" className="btn btn-success">
							Save
						</button>
						&nbsp;
						<button type="button" className="btn cancel-update btn-default" onClick={this.onClickCancelUpdate}>
							Cancel
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


export class CMSItemMarkdown extends Component {

	constructor() {
		super();
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {

	}

	render() {
		return this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				this.props.data.data.content ? (
					<Markdown text={this.props.data.data.content} />
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

	}

	render() {
		return this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				this.props.data.data.content ? (
					<div className="row">
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

	}

	render() {
		return this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				this.props.data.data.content ? (
					<div className="row">
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

export class CMSItemHTML extends Component {

	constructor() {
		super();
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {

	}

	render() {
		return (
			this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				this.props.data.data.content ? (
					<div dangerouslySetInnerHTML={{ __html: this.props.data.data.content}}></div>
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

	}

	render() {
		return (
			this.props.editing ? (
				<CMSUpdateFormSimple data={this.props.data} />
			) : (
				this.props.data.data.content ? (
					<p className="raw-text">
						{this.props.data.data.content}
					</p>
				) : (
					<span>&nbsp;</span>
				)
			)
		);
	}
}
