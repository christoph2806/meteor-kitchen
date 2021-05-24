import { CMSContentCollection } from "BOTH_COLLECTIONS_DIR/cms_content.js";
import {Users} from "meteor-user-roles";

Meteor.methods({
	"insertCmsBlock": function(name, type, data) {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(401, "Access denied.");
		}

		var order = 0;
		var lastBlock = CMSContentCollection.findOne({ name: name }, { sort: { order: -1 } });
		if(lastBlock && typeof lastBlock.order != "undefined") {
			order = lastBlock.order + 1;
		} 

		return CMSContentCollection.insert({ name: name, type: type, order: order, data: data });
	},

	"importCmsContent": function(name, content) {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(401, "Access denied.");
		}

		if(!content || typeof content.length == "undefined") {
			throw new Meteor.Error(400, "Bad request. Invalid data format.");
		}

		content.map(function(item) {
			var order = 0;
			var lastBlock = CMSContentCollection.findOne({ name: name }, { sort: { order: -1 } });
			if(lastBlock && typeof lastBlock.order != "undefined") {
				order = lastBlock.order + 1;
			}

			CMSContentCollection.insert({ name: name, type: item.type, order: order, data: item.data });
		});

	},

	"updateCmsBlock": function(id, data) {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(401, "Access denied.");
		}
		CMSContentCollection.update({ _id: id }, { $set: { data: data } });
	},

	"removeCmsBlock": function(id) {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(401, "Access denied.");
		}

		CMSContentCollection.remove({ _id: id });
	},

	"moveCmsBlockUp": function(id) {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(401, "Access denied.");
		}

		var block = CMSContentCollection.findOne({ _id: id });
		if(!block) {
			return;
		}

		if(typeof block.order === "undefined") {
			block.order = 0;
		}

		var prevBlock = CMSContentCollection.findOne({ name: block.name, order: { $lt: block.order } }, { sort: { order: -1 } });
		if(prevBlock) {
			CMSContentCollection.update({ _id: block._id }, { $set: { order: prevBlock.order }});
			CMSContentCollection.update({ _id: prevBlock._id }, { $set: { order: block.order }});
		}
	},

	"moveCmsBlockDown": function(id) {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(401, "Access denied.");
		}
		
		var block = CMSContentCollection.findOne({ _id: id });
		if(!block) {
			return;
		}

		if(typeof block.order === "undefined") {
			block.order = 0;
		}

		var nextBlock = CMSContentCollection.findOne({ name: block.name, order: { $gt: block.order } }, { sort: { order: 1 } });
		if(nextBlock) {
			CMSContentCollection.update({ _id: block._id }, { $set: { order: nextBlock.order }});
			CMSContentCollection.update({ _id: nextBlock._id }, { $set: { order: block.order }});
		}
	}
});
