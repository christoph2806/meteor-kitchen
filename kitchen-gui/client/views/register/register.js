var pageSession = new ReactiveDict();

Template.Register.rendered = function() {
	pageSession.set("errorMessage", "");
	pageSession.set("verificationEmailSent", false);

	
	Meteor.defer(function() {
		$("input[autofocus]").focus();
	});

};

Template.Register.created = function() {
	pageSession.set("errorMessage", "");
};

Template.Register.events({
	'submit #register-form' : function(e, t) {
		e.preventDefault();

		var submit_button = $(t.find(":submit"));

		var registerName = t.find('#register-name').value.trim();
		var registerEmail = t.find('#register-email').value.trim().toLowerCase();
		var registerUsername = t.find('#register-username').value.trim().toLowerCase();
		var registerPassword = t.find('#register-password').value;

		// check name
		if(!registerName)
		{
			pageSession.set("errorMessage", "Please enter your name.");
			t.find('#register-name').focus();
			return false;
		}

		// check email
		if(!isValidEmail(registerEmail))
		{
			pageSession.set("errorMessage", "Please enter valid e-mail address.");
			t.find('#register-email').focus();
			return false;
		}

		// check username
		if(!registerUsername)
		{
			pageSession.set("errorMessage", "Please choose your username.");
			t.find('#register-username').focus();
			return false;
		}

		// check password
		var minPasswordLen = 6;
		if(!isValidPassword(registerPassword, minPasswordLen))
		{
			pageSession.set("errorMessage", "Your password must be at least " + minPasswordLen + " characters long.");
			t.find('#register-password').focus();
			return false;
		}

		submit_button.addClass('disabled loading');
		Accounts.createUser({ 
			email    : registerEmail,
			username : registerUsername,
			password : registerPassword,
			profile: { name: registerName }
		}, function(err) {
			submit_button.removeClass('disabled loading');;
			if(err) {
				if(err.error === 499) {
					pageSession.set("verificationEmailSent", true);
				} else {
					pageSession.set("errorMessage", err.message);
				}
			}
			else
			{
				pageSession.set("errorMessage", "");
				pageSession.set("verificationEmailSent", true);
			}
		});
		return false;
	},

	"click .go-home": function(e, t) {
		Router.go("/");
	}
	
});

Template.Register.helpers({
	errorMessage: function() {
		return pageSession.get("errorMessage");
	},
	verificationEmailSent: function() {
		return pageSession.get("verificationEmailSent");
	}
	
});
