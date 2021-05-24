import React, { Component } from "react";
import PropTypes from "prop-types";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import {Meteor} from "meteor/meteor";
import {pathFor, menuItemClass} from "/imports/modules/client/router_utils";
import {getFormData} from "/imports/modules/client/form_utils";
import {Loading} from "/imports/ui/pages/loading/loading.jsx";
import {mergeObjects} from "/imports/modules/both/object_utils";
/*IMPORTS*/

export class TEMPLATE_NAME extends Component {
	constructor () {
		super();
		this.state = {
			errorMessage: ""
		};
		this.renderErrorMessage = this.renderErrorMessage.bind(this);
		this.onLoginWithGoogle = this.onLoginWithGoogle.bind(this);
		this.onLoginWithGithub = this.onLoginWithGithub.bind(this);
		this.onLoginWithLinkedin = this.onLoginWithLinkedin.bind(this);
		this.onLoginWithFacebook = this.onLoginWithFacebook.bind(this);
		this.onLoginWithTwitter = this.onLoginWithTwitter.bind(this);
		this.onLoginWithMeteor = this.onLoginWithMeteor.bind(this);
		this.onLoginWithPassword = this.onLoginWithPassword.bind(this);
		this.onLoginWithAuth0 = this.onLoginWithAuth0.bind(this);
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

	onLoginWithGoogle(e) {
		e.preventDefault();
		this.setState({ errorMessage: "" });

		let self = this;

		var button = $(e.currentTarget);
		button.button("loading");

		Meteor.loginWithGoogle(
			{
				requestPermissions: ["email"]
			},
			function(err) {
				button.button("reset");
				if(err) {
					self.setState({ errorMessage: err.message });
					return false;
				}
			}
		);

		return false;
	}

	onLoginWithGithub(e) {
		e.preventDefault();
		this.setState({ errorMessage: "" });

		let self = this;

		var button = $(e.currentTarget);
		button.button("loading");

		Meteor.loginWithGithub(
			{
				requestPermissions: ["public_repo", "user:email"]
			},
			function(err) {
				button.button("reset");
				if(err) {
					self.setState({ errorMessage: err.message });
					return false;
				}
			}
		);

		return false;
	}

	onLoginWithLinkedin(e) {
		e.preventDefault();
		this.setState({ errorMessage: "" });

		let self = this;

		var button = $(e.currentTarget);
		button.button("loading");

		Meteor.loginWithLinkedIn({
				requestPermissions: ["r_basicprofile", "r_emailaddress"]
		},
		function(err) {
			button.button("reset");
			if(err) {
				self.setState({ errorMessage: err.message });
				return false;
			}
		});
		return false;
	}

	onLoginWithFacebook(e) {
		e.preventDefault();
		this.setState({ errorMessage: "" });

		let self = this;

		var button = $(e.currentTarget);
		button.button("loading");

		Meteor.loginWithFacebook({
			requestPermissions: ["email"]
		},
		function(err) {
			button.button("reset");
			if(err) {
				self.setState({ errorMessage: err.message });
				return false;
			}
		});
		return false;
	}

	onLoginWithTwitter(e) {
		e.preventDefault();
		this.setState({ errorMessage: "" });

		let self = this;

		var button = $(e.currentTarget);
		button.button("loading");

		Meteor.loginWithTwitter({
			requestPermissions: ["email"]
		},
		function(err) {
			button.button("reset");
			if(err) {
				self.setState({ errorMessage: err.message });
				return false;
			}
		});

		return false;
	}

	onLoginWithMeteor(e) {
		e.preventDefault();
		this.setState({ errorMessage: "" });

		let self = this;

		var button = $(e.currentTarget);
		button.button("loading");

		Meteor.loginWithMeteorDeveloperAccount({
			requestPermissions: ["email"]
		},
		function(err) {
			button.button("reset");
			if(err) {
				self.setState({ errorMessage: err.message });
				return false;
			}
		});

		return false;
	}

	onLoginWithAuth0(e) {
		e.preventDefault();
		this.setState({ errorMessage: "" });

		let self = this;

		var button = $(e.currentTarget);
		button.button("loading");

		Meteor.loginWithAuth0({
			requestPermissions: ["openid", "profile", "email"]
		},
		function(err) {
			button.button("reset");
			if(err) {
				self.setState({ errorMessage: err.message });
				return false;
			}
		});

		return false;
	}

	onLoginWithPassword(e) {
		e.preventDefault();
		this.setState({ errorMessage: "" });

		let self = this;

		let submitButton = $(e.target).find("button[type='submit']");

		getFormData(e.target, {
			onSuccess: function(values) {
				submitButton.button("loading");
				Meteor.loginWithPassword(values.email, values.password, function(err) {
					submitButton.button("reset");
					if(err) {
						self.setState({ errorMessage: err.message });
						return false;
					}
				});
			},
			onError: function(message) {
				self.setState({ errorMessage: message });
			},
			fields: {
				email: { type: "email", required: true },
				password: { required: true }
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
					<form id="login_form" className="account-form" role="form" onSubmit={this.onLoginWithPassword}>
						<h2>Please sign in</h2>

						{this.state.errorMessage ? this.renderErrorMessage() : null}

						<div id="login-with-google" className="form-group">
							<button type="button" className="btn btn-default btn-block" data-loading-text="Please wait..." onClick={this.onLoginWithGoogle}><span className="fa fa-google-plus-square"></span>&nbsp;Sign in with Google</button>
						</div>
						<div id="login-with-github" className="form-group">
							<button type="button" className="btn btn-default btn-block" data-loading-text="Please wait..." onClick={this.onLoginWithGithub}><span className="fa fa-github"></span>&nbsp;Sign in with GitHub</button>
						</div>
						<div id="login-with-facebook" className="form-group">
							<button type="button" className="btn btn-default btn-block" data-loading-text="Please wait..." onClick={this.onLoginWithFacebook}><span className="fa fa-facebook-official"></span>&nbsp;Sign in with Facebook</button>
						</div>
						<div id="login-with-twitter" className="form-group">
							<button type="button" className="btn btn-default btn-block" data-loading-text="Please wait..." onClick={this.onLoginWithTwitter}><span className="fa fa-twitter"></span>&nbsp;Sign in with Twitter</button>
						</div>
						<div id="login-with-linkedin" className="form-group">
							<button type="button" className="btn btn-default btn-block" data-loading-text="Please wait..." onClick={this.onLoginWithLinkedin}><span className="fa fa-linkedin-square"></span>&nbsp;Sign in with LinkedIn</button>
						</div>
						<div id="login-with-meteor" className="form-group">
							<button type="button" className="btn btn-default btn-block" data-loading-text="Please wait..." onClick={this.onLoginWithMeteor}><span className="fa fa-meteor"></span>&nbsp;Sign in with Meteor</button>
						</div>
						<div id="login-with-auth0" className="form-group">
							<button type="button" className="btn btn-default btn-block" data-loading-text="Please wait..." onClick={this.onLoginWithAuth0}><span className="fa fa-star"></span>&nbsp;Sign in with Auth0</button>
						</div>

						<div id="login-with-password">
							<div className="form-group">
								<input type="text" id="login-email" name="email" className="form-control" placeholder="Email address" autoFocus />
							</div>

							<div className="form-group">
								<input type="password" id="login-password" name="password" className="form-control" placeholder="Password" />
							</div>

							<div className="form-group">
								<button className="btn btn-lg btn-primary btn-block" type="submit" data-loading-text="Please wait...">Sign in</button>
							</div>
							<p className="account-form-text-after" id="register-link">Not a member?&nbsp;<a href={pathFor('register')}>Sign up here</a></p>
							<p className="account-form-text-after" id="forgot-password-link">Forgot password?&nbsp;<a href={pathFor('forgot_password')}>Click here</a></p>
						</div>
					</form>
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
