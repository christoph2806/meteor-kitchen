import React, { Component } from "react";
import PropTypes from "prop-types";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import {pathFor, menuItemClass} from "/imports/modules/client/router_utils";
import {Loading} from "/imports/ui/pages/loading/loading.jsx";
import {getFormData} from "/imports/modules/client/form_utils";
import {mergeObjects} from "/imports/modules/both/object_utils";
/*IMPORTS*/

export class TEMPLATE_NAME extends Component {
	constructor () {
		super();
		this.state = {
			errorMessage: "",
			resetPasswordSent: false
		};

		this.renderErrorMessage = this.renderErrorMessage.bind(this);
		this.renderInfo = this.renderInfo.bind(this);
		this.renderForm = this.renderForm.bind(this);
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

	renderInfo() {
		return(
			<div className="accounts-info-box">
				<h2>Forgot password</h2>
				<p>Password reset instructions are sent to your e-mail address.</p>
				<a href="{pathFor('login')}" className="btn btn-lg btn-primary" id="reset-password-sent">OK</a>
			</div>
		);
	}

	renderForm() {
		return(
			<form id="forgot_password_form" className="account-form" role="form" onSubmit={this.onSubmit}>
				<h2 className="account-form-heading">Forgot password</h2>

				{this.state.errorMessage ? this.renderErrorMessage() : null}

				<div className="form-group">
					<label htmlFor="email">
						Please enter your e-mail address:
					</label>
					<input id="reset-email" type="text" name="email" className="form-control" placeholder="Email address" autoFocus />
				</div>
				<button className="btn btn-lg btn-primary btn-block" type="submit" data-loading-text="Please wait...">Submit</button>
			</form>
		);
	}

	onSubmit(e) {
		e.preventDefault();
		this.setState({ errorMessage: "" });

		let self = this;

		let submitButton = $(e.target).find("button[type='submit']");

		getFormData(e.target, {
			onSuccess: function(values) {
				submitButton.button("loading");
				Accounts.forgotPassword({email: values.email}, function(err) {
					submitButton.button("reset");
					if (err) {
						self.setState({ errorMessage: err.message });
					} else {
						self.setState({
							errorMessage: "",
							resetPasswordSent: true
						});
					}
				});
			},
			onError: function(message) {
				self.setState({ errorMessage: message });
			},
			fields: {
				email: { type: "email", required: true }
			}
		});

		return false;
	}

	/*EVENTS_CODE*/

	render() {
		if(this.props.data.dataLoading) {
			return (<Loading />);
		} else {
			return (
				<div className="page-container" id="content">
					{this.state.resetPasswordSent ? this.renderInfo() : this.renderForm()}
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
