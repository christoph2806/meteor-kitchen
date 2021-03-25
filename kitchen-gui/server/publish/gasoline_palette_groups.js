Meteor.publish("gasoline_palette_groups", function() {
	return GasolinePaletteGroups.find({}, {});
});
