Template.TEMPLATE_NAME.onCreated(function() {
	/*SUBSCRIPTION_PARAMS*/
	var subs = [/*SUBSCRIPTIONS*/];
});

Template.TEMPLATE_NAME.onRendered(function() {
	$("body").addClass("admin-layout");

	$("#dismiss, .overlay, #sidebar ul li a").on("click", function () {
		if($(this).hasClass("dropdown-toggle")) {
			return;
		}

		$("#sidebar").removeClass("active");
		$(".overlay").fadeOut();
	});

	$("#sidebar-collapse").on("click", function () {
		$("#sidebar").addClass("active");
		$(".overlay").fadeIn();
		$(".collapse.in").toggleClass("in");
		$("a[aria-expanded=true]").attr("aria-expanded", "false");
	});
});

Template.TEMPLATE_NAME.onDestroyed(function() {
	$("body").removeClass("admin-layout");
});

Template.TEMPLATE_NAME.events({
	/*EVENTS_CODE*/
});

Template.TEMPLATE_NAME.helpers({
	/*HELPERS_CODE*/
});
