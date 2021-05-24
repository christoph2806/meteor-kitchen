import React, { Component } from "react";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import { EditableContentCollection } from "BOTH_COLLECTIONS_DIR/editable_content.js";
import { InputDialog } from "CLIENT_COMPONENTS_DIR/input_dialog/input_dialog.jsx";
import { Markdown } from "CLIENT_COMPONENTS_DIR/markdown/markdown.jsx";
import "./editable_content.less";

class EditableContentComponent extends Component {
	constructor() {
		super();
		this.onShowEditor = this.onShowEditor.bind(this);
	}

	componentDidMount() {
		
	}

	onShowEditor(e) {
		let self = this;
		let userCanUpdate = EditableContentCollection.userCanUpdate(Meteor.userId());
		if(!userCanUpdate) {
			return;
		}

		InputDialog({
			message: "Text (markdown)",
			title: "Edit Content",
			onSubmit: function(text, payload) {
				Meteor.call("update_editable_content", self.props.name, text, function(e, t) {
					if(e) {
						alert(e);
						return;
					}
				});
			},
			onCancel: function(payload) {
			},
			buttonSubmitTitle: "OK",
			buttonCancelTitle: "Cancel",
			multiline: true,
			text: this.props.data.content || "",
			payload: null
		});
	}

	renderEditButton() {
		return (
			<div className="editable-content-controls">
				<button type="button" className="editable-content-control btn btn-danger btn-sm" onClick={this.onShowEditor}>Edit...</button>
			</div>
		);
	}

	render() {
		let userCanUpdate = EditableContentCollection.userCanUpdate(Meteor.userId());
		let classString = "editable-content" + (userCanUpdate ? " read-write" : " read-only");
		let content = this.props.data.dataLoading ? "<div class=\"loading\"><i class=\"fa fa-circle-o-notch fa-2x fa-spin\"/></div>" : this.props.data.content || "";
		if(!content && userCanUpdate) {
			content = "&nbsp;<br />&nbsp;";
			classString += userCanUpdate ? " empty-content" : "";
		}
		return(
			<div className={classString} onDoubleClick={this.onShowEditor}>
				<Markdown text={content} sanitize={this.props.sanitize} containerClass={this.props.containerClass || ""} />
				{userCanUpdate ? this.renderEditButton() : null}
			</div>
		);
	}
};


export const EditableContent = withTracker(function(props) {
	var isReady = function() {
		var subs = [
			Meteor.subscribe("editable_content", props.name)
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
		data = {
			content: ""
		};

		let item = EditableContentCollection.findOne({ name: props.name });

		if(item && item.content) {
			data.content = item.content;
		}
	}

	return {
		data: data,
	};

})(EditableContentComponent);
