Template.TEMPLATE_NAME.onCreated(function() {
	/*SUBSCRIPTION_PARAMS*/
	var subs = [/*SUBSCRIPTIONS*/];
});

Template.TEMPLATE_NAME.events({
	"click [data-toggle=offcanvas]": function(e, t) {
		t.$(".row-offcanvas").toggleClass("active");
	}
});
