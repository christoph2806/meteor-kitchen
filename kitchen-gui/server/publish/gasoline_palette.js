Meteor.publish("gasoline_palette", function() {
	return GasolinePalette.find({ 
		$or: [ 
			{ userDefined: { $ne: true } },
			{ 
				$and: [ 
					{ userDefined: true }, 
					{ createdBy: this.userId }
				]
			} 
		] 
	});
});

Meteor.publish("gasoline_shared", function() {
	return GasolinePalette.find(
			{ 
				userDefined: true, 
				shared: true, 
				createdBy: { 
					$ne: this.userId 
				}, 
				originalCreatedBy: { 
					$ne: this.userId 
				} 
			}
	);
});
