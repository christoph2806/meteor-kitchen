var CronLogger = function(opts) {
	console.log('Level', opts.level);
	console.log('Message', opts.message);
	console.log('Tag', opts.tag);
}

SyncedCron.config({
//	logger: CronLogger,
	log: true
});

SyncedCron.add({
	name: "UnreadMessagesNotificationEmail",
	schedule: function(parser) {
		// parser is a later.parse object
		return parser.text("every 4 hours");
	},
	job: function() {
		sendUnreadMessagesEmails();
	}
});

SyncedCron.start();
