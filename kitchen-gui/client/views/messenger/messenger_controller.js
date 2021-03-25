this.MessengerController = RouteController.extend({
	template: "Messenger",
	
	layoutTemplate: "FixedLayout",

	yieldTemplates: {
		/*YIELD_TEMPLATES*/
	},

	onBeforeAction: function() {
		this.next();
	},

	action: function() {
		if(this.isReady()) { this.render(); } else { this.render("loading"); }
		/*ACTION_FUNCTION*/
	},

	isReady: function() {
		

		var subs = [
			Meteor.subscribe("contacts"),
			Meteor.subscribe("messages", this.params.contactId)
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
			contacts: Contacts.find({ 
				$or: [
					{ fromUserId: Meteor.userId() },
					{ toUserId: Meteor.userId() }
				],

				blocked: false
			}),

			messages: Messenger.find({ contactId: this.params.contactId }, { sort: { createdAt: 1 } }),
			contact: Contacts.findOne({ _id: this.params.contactId })
		};
		/*DATA_FUNCTION*/
	},

	onAfterAction: function() {
		
	}
});