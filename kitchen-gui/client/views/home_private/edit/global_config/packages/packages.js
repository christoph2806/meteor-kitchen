Template.HomePrivateEditGlobalConfigPackages.helpers({
	"meteorPackagesOptions": function() {
		if(!App.project) {
			return {};
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return {};
		}
		return {
			title: "Meteor (atmosphere) packages",
			addButtonTitle: "Add package",
			emptyTitle: "No packages.",
			defaultItemName: "",
			items: kitchen.application.packages.meteor
		};
	},
	"npmPackagesOptions": function() {
		if(!App.project) {
			return {};
		}
		var kitchen = App.project.get();
		if(!kitchen) {
			return {};
		}
		return {
			title: "Node (NPM) packages",
			addButtonTitle: "Add package",
			emptyTitle: "No packages.",
			defaultItemName: "",
			items: kitchen.application.packages.npm
		};
	}
});
