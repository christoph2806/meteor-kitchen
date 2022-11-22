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
		$(".input-group.date").each(function() {
			var input = $(this).find("input[type='text']");
			var format = input.attr("data-format") || "MM/DD/YYYY";
			$(this).datetimepicker({
				format: format,
				focusOnShow: true
			});
		});
		$("select[data-role='tagsinput']").tagsinput();
		$(".bootstrap-tagsinput").addClass("form-control");
		$("input[type='file']").fileinput();
		$(".selectpicker").selectpicker();
	}

	renderErrorMessage() {
		return(<div className="alert alert-warning">{this.state.ERROR_MESSAGE_VAR}</div>);
	}

	renderInfoMessage() {
		return(<div className="alert alert-success">{this.state.INFO_MESSAGE_VAR}</div>);
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
		let self = this;
		return (
			<div id="COMPONENT_ID" className="COMPONENT_CLASS">
				<h2 id="component-title">
					<span id="form-back-button">
						<a href="#" className="btn btn-default" title="back" onClick={this.onBack}>
							<span className="fa fa-chevron-left"></span>
						</a>
						&nbsp;
					</span>
					<span id="component-title-icon" className="COMPONENT_TITLE_ICON_CLASS"></span>
					<span className="component-title-text">COMPONENT_TITLE</span>
				</h2>

				<form role="form" onSubmit={this.onSubmit}>
					{this.state.ERROR_MESSAGE_VAR ? this.renderErrorMessage() : null}
					{this.state.INFO_MESSAGE_VAR ? this.renderInfoMessage() : null}
				</form>
			</div>
		);
	}
}
