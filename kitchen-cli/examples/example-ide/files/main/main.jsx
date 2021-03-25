export class TEMPLATE_NAME extends Component {

	constructor() {
		super();
	}

	componentWillMount() {

	}

	componentWillUnmount() {

	}

	componentDidMount() {

	}

	isFile() {
		return this.props.file && this.props.file.type === "item";			
	}

	editorOptions() {
		var options = {
			styleActiveLine: true,
			lineNumbers: true,
			keyMap: "sublime",
			theme: "blackboard",
			lint: false
		};

		if(this.file && this.file.filename) {
			var ext = this.file.filename.split('.').pop();
			switch(ext) {
				case "json": { options.mode = "application/ld+json"; options.lint = true; } break;
				case "js": { options.mode = "javascript"; options.lint = true; } break;
				case "html": { options.mode = "htmlmixed"; options.lint = false; } break;
				case "md": { options.mode = "markdown"; options.lint = false; } break;
			}
		}

		if(options.lint) options.gutters = ["CodeMirror-lint-markers"];

		return options;
	}

	editorText() {
		return Session.get("editorText");
	}

	onClickFileSave(e) {
		var content = Session.get("editorText");
		Meteor.call("COLLECTION_UPDATE_METHOD", this.props.routeParams.fileId, { content: content }, function(e, t) {
			if(e) {
				alert("Unable to save!\n\n" + e.message);
			}
		});
	}

	render() {
		return (
			<div>
				<h3>
					{this.file ? this.file.filename : null}
					{this.isFile() ? (
						<button type="submit" className="btn btn-success pull-right file-save" onClick={this.onClickFileSave}>
							<span className="fa fa-save">
							</span>
							Save
						</button>
					) : (
						null
					)}
				</h3>
				{this.isFile() ? (
					<div>
						<div style={{paddingBottom: '5px', width: '100%'}}>
						</div>
						<CodeMirror id="code-editor" options={this.editorOptions()} reactiveVar="editorText" />
					</div>
				) : (
					null
				)}
			</div>
		);
	}
}
