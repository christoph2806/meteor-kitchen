this.ApiGetappJsonController = RouteController.extend({
	action: function() {
		
		var app = Applications.findOne({_id: this.params.applicationId});
		if(!app || !app.data) {
			this.response.writeHead(404, {'Content-Type': 'text/plain; charset=UTF-8'});
			this.response.end("Not found.");
		} else {
			this.response.writeHead(200, {
				"Content-Type": "application/octet-stream",
				"Content-Disposition": "attachment; filename=\"" + app.slug + ".json\""
			});

			var kitchenObj = ClassKitchen.create("kitchen");
			kitchenObj.load(app.data);

			this.response.end(JSON.stringify(kitchenObj.save(null, true, true), null, '\t'));	
		}
	}
});
