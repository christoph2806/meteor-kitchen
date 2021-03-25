this.MailgunUnsubscribeController = RouteController.extend({
	action: function() {

		var address = (this.request && this.request.body) ? this.request.body.recipient || "" : "";

		if(!address) {
			this.response.writeHead(400, {'Content-Type': 'text/plain; charset=UTF-8'});
			this.response.end("Bad request.");
			return;			
		}

		var user = Users.findOne({ "emails.address": address });
		if(!user) {
			this.response.writeHead(404, {'Content-Type': 'text/plain; charset=UTF-8'});
			this.response.end("User not found.");
			return;
		}

		unsubscribeUserToNewsletters(user._id);

		this.response.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'});
		this.response.end(address);
	}
});
