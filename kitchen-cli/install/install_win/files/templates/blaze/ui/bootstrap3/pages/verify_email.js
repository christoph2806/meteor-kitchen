Template.TEMPLATE_NAME.onCreated(function() {
	/*TEMPLATE_CREATED_CODE*/
});

Template.TEMPLATE_NAME.onDestroyed(function() {
	/*TEMPLATE_DESTROYED_CODE*/
});

Template.TEMPLATE_NAME.onRendered(function() {
	pageSession.set("errorMessage", "");

	var verifyEmailToken = Router.current().params.verifyEmailToken;
	if (verifyEmailToken) {
		Accounts.verifyEmail(verifyEmailToken, function (err) {
			if (err) {
				pageSession.set("errorMessage", err.message);
			}
		});
	} else {
		pageSession.set("errorMessage", err.message);
	}

	/*TEMPLATE_RENDERED_CODE*/

	Meteor.defer(function() {
		globalOnRendered();
	});
});

Template.TEMPLATE_NAME.events({
	"click .go-home": function(e, t) {
		Router.go("/");
	}
	/*EVENTS_CODE*/
});

Template.TEMPLATE_NAME.helpers({
	"errorMessage": function() {
		return pageSession.get("errorMessage");
	}
	/*HELPERS_CODE*/
});
