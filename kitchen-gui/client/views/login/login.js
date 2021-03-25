var pageSession = new ReactiveDict();

Template.Login.rendered = function() {
	pageSession.set("errorMessage", "");
	pageSession.set("emailNotVerified", false);
	pageSession.set("verificationEmailSent", false);
	pageSession.set("usernameOrEmail", "");
	
	Meteor.defer(function() {
		$("input[autofocus]").focus();
	});
};

Template.Login.created = function() {
	pageSession.set("errorMessage", "");
};

Template.Login.events({
	"submit #login_form": function(e, t) {
		e.preventDefault();
		pageSession.set("errorMessage", "");

		var submit_button = $(t.find(":submit"));

		var loginEmail = t.find('#login-email').value.trim().toLowerCase();
		var loginPassword = t.find('#login-password').value;

		// check email
		if(!loginEmail)
		{
			pageSession.set("errorMessage", "Please enter your username or e-mail address.");
			t.find('#login-email').focus();
			return false;
		}

		pageSession.set("usernameOrEmail", loginEmail);

		// check password
		if(!loginPassword)
		{
			pageSession.set("errorMessage", "Please enter your password.");
			t.find('#login-email').focus();
			return false;
		}

		submit_button.addClass('disabled loading');
		Meteor.loginWithPassword(loginEmail, loginPassword, function(err) {
			submit_button.removeClass('disabled loading');
			if (err) {
				if(err.error === 499) {
					pageSession.set("errorMessage", "");
					pageSession.set("emailNotVerified", true);
					pageSession.set("verificationEmailSent", false);
				} else {
					pageSession.set("errorMessage", err.message);
					pageSession.set("emailNotVerified", false);
					pageSession.set("verificationEmailSent", false);
				}
				return false;
			}
		});
		return false;
	},

	"click .go-home": function(e, t) {
		Router.go("/");
	},

	"click .resend-verification-email": function(e, t) {
		e.preventDefault();
		var usernameOrEmail = pageSession.get("usernameOrEmail");
		if(!usernameOrEmail) {
			return false;
		}
		Meteor.call("sendVerificationEmail", usernameOrEmail, function(err, res) {
			if(err) {
				pageSession.set("errorMessage", err.message);
				pageSession.set("emailNotVerified", false);
				pageSession.set("verificationEmailSent", false);
			} else {
				pageSession.set("errorMessage", "");
				pageSession.set("emailNotVerified", true);
				pageSession.set("verificationEmailSent", true);
			}
		});
		return false;
	},

	"click #login-with-google": function(e, t) {
		e.preventDefault();
		pageSession.set("errorMessage", "");

		var button = $(e.currentTarget);
		button.addClass('disabled loading');

		Meteor.loginWithGoogle(
			{
				requestPermissions: ["email"]
			},
			function(err) {
				button.removeClass('disabled loading');;
				if (err)
				{
					pageSession.set("errorMessage", err.message);
					return false;
				}
			}
		);

		return false;
	},

	"click #login-with-github": function(e, t) {
		e.preventDefault();
		pageSession.set("errorMessage", "");

		var button = $(e.currentTarget);
		button.addClass('disabled loading');

		Meteor.loginWithGithub(
			{
				requestPermissions: ["public_repo", "user:email"]
			},
			function(err) {
				button.removeClass('disabled loading');
				if (err)
				{
					pageSession.set("errorMessage", err.message);
					return false;
				}
			}
		);

		return false;
	},

	"click #login-with-linkedin": function(e, t) {
		e.preventDefault();
		pageSession.set("errorMessage", "");

		var button = $(e.currentTarget);
		button.addClass('disabled loading');

		Meteor.loginWithLinkedin(
			{
				requestPermissions: ["r_emailaddress"]
			},
			function(err) {
				button.removeClass('disabled loading');
				if (err)
				{
					pageSession.set("errorMessage", err.message);
					return false;
				}
			}
		);

		return false;
	},

	"click #login-with-facebook": function(e, t) {
		e.preventDefault();
		pageSession.set("errorMessage", "");

		var button = $(e.currentTarget);
		button.addClass('disabled loading');

		Meteor.loginWithFacebook(
			{
				requestPermissions: ["email"]
			},
			function(err) {
				button.removeClass('disabled loading');
				if (err)
				{
					pageSession.set("errorMessage", err.message);
					return false;
				}
			}
		);

		return false;
	},

	"click #login-with-twitter": function(e, t) {
		e.preventDefault();
		pageSession.set("errorMessage", "");

		var button = $(e.currentTarget);
		button.addClass('disabled loading');

		Meteor.loginWithTwitter(
			{
				requestPermissions: ["email"]
			},
			function(err) {
				button.removeClass('disabled loading');
				if (err)
				{
					pageSession.set("errorMessage", err.message);
					return false;
				}
			}
		);

		return false;
	},

	"click #login-with-meteor": function(e, t) {
		e.preventDefault();
		pageSession.set("errorMessage", "");

		var button = $(e.currentTarget);
		button.addClass('disabled loading');

		Meteor.loginWithMeteorDeveloperAccount(
			{
				requestPermissions: ["email"]
			},
			function(err) {
				button.removeClass('disabled loading');
				if (err)
				{
					pageSession.set("errorMessage", err.message);
					return false;
				}
			}
		);

		return false;
	}
	
});

Template.Login.helpers({
	errorMessage: function() {
		return pageSession.get("errorMessage");
	},
	emailNotVerified: function() {
		return pageSession.get("emailNotVerified");
	},
	verificationEmailSent: function() {
		return pageSession.get("verificationEmailSent");
	}
	
});
