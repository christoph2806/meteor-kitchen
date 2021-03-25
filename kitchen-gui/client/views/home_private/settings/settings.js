Template.HomePrivateSettings.rendered = function() {
	
};

Template.HomePrivateSettings.events({
	
});

Template.HomePrivateSettings.helpers({
	
});

Template.HomePrivateSettingsMenu.rendered = function() {
	
	this.$('.ui.dropdown').dropdown();
};

Template.HomePrivateSettingsMenu.events({
	"click .toggle-text": function(e, t) {
		e.preventDefault();
		$(e.target).closest("ul").toggleClass("menu-hide-text");
	}
	
});

Template.HomePrivateSettingsMenu.helpers({
	
});
