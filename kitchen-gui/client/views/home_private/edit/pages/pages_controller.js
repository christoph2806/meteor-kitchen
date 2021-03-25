this.HomePrivateEditPagesController = RouteController.extend({
	template: "HomePrivateEditPages",
	layoutTemplate: "DesignerLayout",

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		Session.set("editingProjectId", this.params.applicationId);
		if(this.isReady()) { this.render(); } else { this.render("loading"); }
		/*ACTION_FUNCTION*/
	},

	isReady: function() {
		

		var subs = [
			Meteor.subscribe("gasoline_palette_groups"),
			Meteor.subscribe("gasoline_palette")
		];
		var ready = true;
		_.each(subs, function(sub) {
			if(!sub.ready())
				ready = false;
		});
		return ready;
	},

	data: function() {

		return {
			params: this.params || {},
			gasolinePaletteGroups: GasolinePaletteGroups.find({}),
			gasolinePalette: GasolinePalette.find({ 
				$or: [ 
					{ userDefined: { $ne: true } },
					{ 
						$and: [ 
							{ userDefined: true }, 
							{ createdBy: Meteor.userId() } 
						]
					} 
				] 
			}, 
			{ 
				sort: { title: 1 } 
			})
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});