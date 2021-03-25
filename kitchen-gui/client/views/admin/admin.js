Template.Admin.rendered = function() {
	
};

Template.Admin.events({
	
});

Template.Admin.helpers({
	
});

Template.AdminSideMenu.rendered = function() {
	
	this.$('.ui.dropdown').dropdown();
};

Template.AdminSideMenu.events({
	"click .toggle-text": function(e, t) {
		e.preventDefault();
		$(e.target).closest("ul").toggleClass("menu-hide-text");
	}	
});

Template.AdminSideMenu.helpers({
	
});
