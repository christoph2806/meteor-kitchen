Template.TEMPLATE_NAME.onCreated(function() {
	/*SUBSCRIPTION_PARAMS*/
	var subs = [/*SUBSCRIPTIONS*/];
});

Template.TEMPLATE_NAME.events({
	"click [data-toggle=offcanvas]": function(e, t) {
		t.$(".row-offcanvas").toggleClass("active");
	}
	/*EVENTS_CODE*/
});

Template.TEMPLATE_NAME.helpers({
	/*HELPERS_CODE*/
});
