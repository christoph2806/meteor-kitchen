import { CMSContentCollection } from "BOTH_COLLECTIONS_DIR/cms_content.js";
import {Users} from "meteor-user-roles";

Meteor.methods({
	"insertCmsBlock": function(name, type, data) {
		if(!Users.isAdmin(this.userId)) {
			throw new Meteor.Error(401, "Access denied.");
		}

		return CMSContentCollection.insert({ name: name, type: type, data: data });
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
	}
});
