export class TEMPLATE_NAME extends Component {
	constructor () {
		super();
		this.state = {
			ERROR_MESSAGE_VAR: "",
			INFO_MESSAGE_VAR: ""
		};

		this.renderErrorMessage = this.renderErrorMessage.bind(this);
		this.renderInfoMessage = this.renderInfoMessage.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.onCancel = this.onCancel.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onBack = this.onBack.bind(this);
		/*BINDINGS*/
	}

	componentWillMount() {
		/*TEMPLATE_CREATED_CODE*/
	}

	componentWillUnmount() {
		/*TEMPLATE_DESTROYED_CODE*/
	}

	componentDidMount() {
		/*TEMPLATE_RENDERED_CODE*/
	}

	renderErrorMessage() {
		return(<div class="alert alert-warning">{this.state.ERROR_MESSAGE_VAR}</div>);
	}

	renderInfoMessage() {
		return(<div class="alert alert-success">{this.state.INFO_MESSAGE_VAR}</div>);
	}

	onSubmit(e) {
		e.preventDefault();
		this.setState({ INFO_MESSAGE_VAR: "" });
		this.setState({ ERROR_MESSAGE_VAR: "" });

		var self = this;
		var $form = $(e.target);

		function submitAction(result, msg) {
			var FORM_MODE_VAR = "FORM_MODE";
			if(!$("#COMPONENT_ID").find("#form-cancel-button").length) {
				switch(FORM_MODE_VAR) {
					case "insert": {
						$form[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						self.setState({ INFO_MESSAGE_VAR: message });
					}; break;
				}
			}

			/*SUBMIT_REDIRECT*/
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			self.setState({ ERROR_MESSAGE_VAR: message });
		}

		formUtils.validateForm(
			$form,
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				/*HIDDEN_FIELDS*/

				/*SUBMIT_CODE*/
			}
		);

		return false;
	}

	onCancel(e) {
		e.preventDefault();
		self = this;
		/*CANCEL_CODE*/

		/*CANCEL_REDIRECT*/
	}

	onClose(e) {
		e.preventDefault();
		self = this;

		/*CLOSE_REDIRECT*/
	}

	onBack(e) {
		e.preventDefault();
		self = this;

		/*BACK_REDIRECT*/
	}

	/*EVENTS_CODE*/

	/*HELPERS_CODE*/

	render() {
		return (
			<div id="COMPONENT_ID" class="COMPONENT_CLASS">
				<h2 id="component-title">
					<a href="#" id="form-back-button" class="btn btn-default" title="back" onClick={this.onBack}>
						<span class="fa fa-chevron-left"></span>
					</a>
					<span id="component-title-icon" class="COMPONENT_TITLE_ICON_CLASS"></span>
					COMPONENT_TITLE
				</h2>

				<form role="form" onSubmit={this.onSubmit}>
					{this.state.ERROR_MESSAGE_VAR ? this.renderErrorMessage() : null}
					{this.state.INFO_MESSAGE_VAR ? this.renderInfoMessage() : null}
				</form>
			</div>
		);
	}
}
