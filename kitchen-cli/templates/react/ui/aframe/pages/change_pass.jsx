import React, { Component } from "react";
import PropTypes from "prop-types";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import {Meteor} from "meteor/meteor";
import {pathFor, menuItemClass} from "/imports/modules/client/router_utils";
import {getFormData} from "/imports/modules/client/form_utils";
import {Loading} from "/imports/ui/pages/loading/loading.jsx";
/*IMPORTS*/

export class TEMPLATE_NAME extends Component {
	constructor () {
		super();
		this.state = {
			errorMessage: "",
			infoMessage: ""
		};

		this.renderErrorMessage = this.renderErrorMessage.bind(this);
		this.renderInfoMessage = this.renderInfoMessage.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
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

		Meteor.defer(function() {
			globalOnRendered();
		});
	}

	renderErrorMessage() {
		return (<div className="alert alert-warning">{this.state.errorMessage}</div>);
	}

	renderInfoMessage() {
		return (<div className="alert alert-success">{this.state.infoMessage}</div>);
	}

	onSubmit(e) {
		e.preventDefault();
		this.setState({ errorMessage: "", infoMessage: "" });

		let self = this;

		let submitButton = $(e.target).find("button[type='submit']");

		getFormData(e.target, {
			onSuccess: function(values) {
				if(values.new_password != values.confirm_pass) {
					self.setState({ errorMessage: "Your new password and confirm password doesn't match." });
					$(e.target).find("#new_password").focus();
					return false;
				}

				submitButton.button("loading");

				Accounts.changePassword(values.old_password, values.new_password, function(err) {
					submitButton.button("reset");
					if (err) {
						self.setState({ errorMessage: err.message });
						return false;
					} else {
						self.setState({ errorMessage: "", infoMessage: "Your new password is set." });
						$(e.target).find("#old-password").value = "";
						$(e.target).find("#new-password").value = "";
						$(e.target).find("#confirm-pass").value = "";
						$(e.target).find("#old-password").focus();
					}
				});
			},
			onError: function(message) {
				self.setState({ errorMessage: message });
			},
			fields: {
				old_password: { required: true },
				new_password: { required: true },
				confirm_pass: { required: true }
			}
		});

		return false;
	}

	/*EVENTS_CODE*/

	/*HELPERS_CODE*/

	render() {
		if(this.props.data.dataLoading) {
			return (<Loading />);
		} else {
			return (
				<div className="page-container" id="content">
					<div class="row">
						<div class="col-xs-12 col-sm-9 col-lg-6">
							<form id="change_pass_form" className="" role="form" onSubmit={this.onSubmit}>
								<h2>Change password</h2>

								{this.state.errorMessage ? this.renderErrorMessage() : null}
								{this.state.infoMessage ? this.renderInfoMessage() : null}

								<div class="form-group">
									<input id="old-password" type="password" name="old_password" className="form-control" placeholder="Your old password" required autoFocus />
								</div>

								<div class="form-group">
									<input id="new-password" type="password" name="new_password" className="form-control" placeholder="New password" required />
								</div>

								<div class="form-group">
									<input id="confirm-pass" type="password" name="confirm_pass" className="form-control" placeholder="Repeat new password" required />
								</div>

								<button className="btn btn-lg btn-primary btn-block" type="submit" data-loading-text="Please wait...">OK</button>
							</form>
						</div>
					</div>
					<div id="background-image" style={{backgroundImage: "url(BACKGROUND_IMAGE)"}}>
					</div>
				</div>
			);
		}
	}
}

export const TEMPLATE_NAMEContainer = withTracker(function(props) {
	/*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
