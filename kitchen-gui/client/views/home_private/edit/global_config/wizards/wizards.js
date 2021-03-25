Template.HomePrivateEditGlobalConfigWizards.rendered = function() {

};

Template.HomePrivateEditGlobalConfigWizards.helpers({
	"appData": function() {
		if(!App.project) {
			return {};
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return {};
		}

		return kitchen.application;
	}
});

Template.HomePrivateEditGlobalConfigWizards.events({

});
