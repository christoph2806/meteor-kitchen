Template.TEMPLATE_NAME.onCreated(function() {
	/*TEMPLATE_CREATED_CODE*/
});

Template.TEMPLATE_NAME.onDestroyed(function() {
	/*TEMPLATE_DESTROYED_CODE*/
});

Template.TEMPLATE_NAME.onRendered(function() {
	$(".menu-item-collapse .dropdown-toggle").each(function() {
		if($(this).find("li.active")) {
			$(this).removeClass("collapsed");
		}
		$(this).parent().find(".collapse").each(function() {
			if($(this).find("li.active").length) {
				$(this).addClass("in");
			}
		});
	});
	/*TEMPLATE_RENDERED_CODE*/
});

Template.TEMPLATE_NAME.events({
	"click .toggle-text": function(e, t) {
		e.preventDefault();
		$(e.target).closest("ul").toggleClass("menu-hide-text");
	}
	/*EVENTS_CODE*/
});

Template.TEMPLATE_NAME.helpers({
	/*HELPERS_CODE*/
});
