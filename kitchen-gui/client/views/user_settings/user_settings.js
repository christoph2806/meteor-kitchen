Template.UserSettings.rendered = function() {
	
};

Template.UserSettings.events({
	
});

Template.UserSettings.helpers({
	
});

Template.UserSettingsSideMenu.rendered = function() {
	
	this.$('.ui.dropdown').dropdown();
};

Template.UserSettingsSideMenu.events({
	"click .toggle-text": function(e, t) {
		e.preventDefault();
		$(e.target).closest("ul").toggleClass("menu-hide-text");
	}
	
});

Template.UserSettingsSideMenu.helpers({
	
});
