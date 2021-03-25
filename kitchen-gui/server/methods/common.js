Meteor.methods({

	"getPublicAssetAsString": function(assetPath) {
		return Assets.getText("public/" + assetPath);
	},

	"getPublicAssetAsBinary": function(assetPath) {
		return Assets.getBinary("public/" + assetPath);
	},

	"getLayoutGasTemplate": function(layoutName, frontendName) {
		if(!frontendName) {
			return null;
		}

		var str = Assets.getText("public/templates/" + frontendName + "/layouts/" + (layoutName || "navbar") + ".json");
		return JSON.parse(str);
	},

	"getPageGasTemplate": function(templateName, frontendName) {
		if(!frontendName) {
			return null;
		}

		var str = Assets.getText("public/templates/" + frontendName + "/pages/" + (templateName || "page_empty") + ".json");
		return JSON.parse(str);
	}

});
