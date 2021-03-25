this.ApiWaitappJsonController = RouteController.extend({
	action: function() {
		var self = this;
		
		var application = Applications.findOne({ _id: this.params.applicationId }, { fields: { modifiedAt: true } });
		if(!application || !application.modifiedAt) {
			this.response.writeHead(404, {'Content-Type': 'text/plain; charset=UTF-8'});
			this.response.end("Not found.");
			return;
		}

		var originalTime = application.modifiedAt;

		var intervalPaused = false;

		var interval = Meteor.setInterval(function() {

			if(intervalPaused) {
				return;
			}

			intervalPaused = true;

			var app = Applications.findOne({ _id: self.params.applicationId }, { fields: { modifiedAt: true } });

			if(app.modifiedAt > originalTime) {
				Meteor.clearInterval(interval);

				app = Applications.findOne({_id: self.params.applicationId});
				if(!app || !app.data) {
					self.response.writeHead(404, {'Content-Type': 'text/plain; charset=UTF-8'});
					self.response.end("Not found.");
				} else {
					var kitchenObj = ClassKitchen.create("kitchen");
					kitchenObj.load(app.data);

					self.response.writeHead(200, {
						"Content-Type": "application/octet-stream",
						"Content-Disposition": "attachment; filename=\"" + app.slug + ".json\""
					});
					self.response.end(JSON.stringify(kitchenObj.save(null, true, true), null, '\t'));	
				}
			} else {
				intervalPaused = false;
			}

		}, 333);
	}
});
