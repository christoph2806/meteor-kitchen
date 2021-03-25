var showdown = require("showdown");

Newsletters.allow({
	insert: function (userId, doc) {
		return Newsletters.userCanInsert(userId, doc);
	},

	update: function (userId, doc, fields, modifier) {
		return Newsletters.userCanUpdate(userId, doc);
	},

	remove: function (userId, doc) {
		return Newsletters.userCanRemove(userId, doc);
	}
});

Newsletters.before.insert(function(userId, doc) {
	doc.createdAt = new Date();
	doc.createdBy = userId;
	doc.modifiedAt = doc.createdAt;
	doc.modifiedBy = doc.createdBy;

	if(!doc.status) {
		doc.status = "new";
	}

	// convert body from markdown to html
	var converter = new showdown.Converter();
	doc.html = converter.makeHtml(doc.body);
});

Newsletters.before.update(function(userId, doc, fieldNames, modifier, options) {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
	modifier.$set.modifiedBy = userId;

	if(modifier.$set.body) {
		// convert body from markdown to html
		var converter = new showdown.Converter();
		modifier.$set.html = converter.makeHtml(modifier.$set.body);
	}
});

Newsletters.before.remove(function(userId, doc) {
	
});

Newsletters.after.insert(function(userId, doc) {
});

Newsletters.after.update(function(userId, doc, fieldNames, modifier, options) {	

});

Newsletters.after.remove(function(userId, doc) {

});
