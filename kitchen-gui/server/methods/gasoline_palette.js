Meteor.methods({
	"addToGasolinePalette": function(object, title, shared, groupId) {
		var group = GasolinePaletteGroups.findOne({ _id: groupId });
		if(!group) {
			throw new Meteor.Error(400, "Group doesn't exists.");
		}
		if(!group.custom && !Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		GasolinePalette.insert({
			title: title,
			data: object,
			userDefined: !!group.custom,
			shared: !!shared,
			groupId: groupId
		});
	},

	"importSharedToGasolinePalette": function(itemId, groupId) {
		console.log(itemId, groupId);
	},

	"removeFromGasolinePalette": function(objectId) {
		var object = GasolinePalette.findOne({ _id: objectId });
		if(!object) {
			throw new Meteor.Error(400, "Item doesn't exists.");			
		}

		if(object.createdBy != this.userId && !Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}

		GasolinePalette.remove({ _id: objectId });
	},


	"updateGasolinePaletteItem": function(objectId, title, shared, data) {
		var object = GasolinePalette.findOne({ _id: objectId });
		if(!object) {
			throw new Meteor.Error(400, "Item doesn't exists.");			
		}

		if(object.createdBy != this.userId && !Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}


		var set = {
			title: title,
			shared: shared
		};

		GasolinePalette.update({ 
			_id: objectId 
		}, {
			$set: set
		});
	},

	"updateGasolinePaletteItemData": function(objectId, data) {
		var object = GasolinePalette.findOne({ _id: objectId });
		if(!object) {
			throw new Meteor.Error(400, "Item doesn't exists.");			
		}

		if(object.createdBy != this.userId && !Users.isAdmin(this.userId)) {
			throw new Meteor.Error(403, "Access denied.");
		}


		var set = {
			data: data
		};

		GasolinePalette.update({ 
			_id: objectId 
		}, {
			$set: set
		});
	}

});
