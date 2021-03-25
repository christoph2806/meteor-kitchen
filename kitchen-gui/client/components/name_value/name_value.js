var pageSession = new ReactiveDict();

this.nameValueBox = function(title, defaultValue, nameField, valueField, onApprove, onDeny, options) {
	var tmpl = Template["NameValueBox"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();

	var tmp = [];
	defaultValue.map(function(x) {
		var it = { _id: Random.id() };
		it[nameField] = x[nameField];
		it[valueField] = x[valueField];
		tmp.push(it);
	});
	pageSession.set("nameValueBoxItems", tmp);

	var data = {
		boxId: boxId,
		title: title,
		defaultValue: defaultValue,
		nameField: nameField,
		valueField: valueField,
		approveButtonTitle: options.approveButtonTitle || "OK",
		denyButtonTitle: options.denyButtonTitle || "Cancel",
		showApproveButton: !options.noApproveButton,
		showDenyButton: !options.noDenyButton,
		onApprove: function(el) {
			var values = pageSession.get("nameValueBoxItems") || [];

			if(onApprove) {
				onApprove(el, values);
			}

			var modalBox = $("#" + boxId);
			modalBox.modal("hide");
			return false;
		},
		onDeny: function(el) { if(onDeny) onDeny(el); return true; },
		onHidden: function() { $("#" + boxId).remove(); }
	};
	Blaze.renderWithData(tmpl, data, div);
};

Template.NameValueBox.rendered = function() {
	var self = this;

	var modalBox = $(this.find(".name-value-box"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");

	Meteor.defer(function() {
		this.$(".add-item").click(function() {
			var items = pageSession.get("nameValueBoxItems") || [];
			var item = { _id: Random.id() };
			item[self.data.nameField] = "";
			item[self.data.valueField] = "";
			items.push(item);
			pageSession.set("nameValueBoxItems", items);

			Meteor.defer(function() {
				$("tr[data-id='" + item._id + "']").find(".name-input").focus();
			});
		});
	});
};

Template.NameValueBox.helpers({
	"items": function() {
		return pageSession.get("nameValueBoxItems") || [];
	},
	"nameTitle": function() {
		return toTitleCase(this.nameField);
	},
	"valueTitle": function() {
		return toTitleCase(this.valueField);
	}
});


Template.NameValueBoxItem.rendered = function() {
	var self = this;
	Meteor.defer(function() {
		this.$("input[type='text']").on("focus", function(e, t) {
			$(this).select();
		});
	});
};

Template.NameValueBoxItem.events({
	"input .name-input": function(e, t) {
		var id = this._id;
		if(!id) {
			return;
		}

		var nameField = Template.parentData().nameField;

		var items = pageSession.get("nameValueBoxItems") || [];

		var item = items.find(function(x) {
			return x._id == id;
		});
		if(!item) {
			return;
		}

		item[nameField] = $(e.currentTarget).val();

		pageSession.set("nameValueBoxItems", items);
	},

	"input .value-input": function(e, t) {
		var id = this._id;
		if(!id) {
			return;
		}

		var valueField = Template.parentData().valueField;

		var items = pageSession.get("nameValueBoxItems") || [];

		var item = items.find(function(x) {
			return x._id == id;
		});
		if(!item) {
			return;
		}

		item[valueField] = $(e.currentTarget).val();

		pageSession.set("nameValueBoxItems", items);
	},

	"click .duplicate-item": function(e, t) {
		var id = this._id;
		if(!id) {
			return;
		}

		var items = pageSession.get("nameValueBoxItems") || [];

		var itemIndex = items.findIndex(function(x) {
			return x._id == id;
		});

		if(itemIndex < 0) {
			return;
		}

		var nameField = Template.parentData().nameField;
		var valueField = Template.parentData().valueField;

		var item = { _id: Random.id() };
		item[nameField] = items[itemIndex][nameField];
		item[valueField] = items[itemIndex][valueField];
		items.push(item);

		pageSession.set("nameValueBoxItems", items);

		Meteor.defer(function() {
			$("tr[data-id='" + item._id + "']").find(".name-input").focus();
		});
	},

	"click .remove-item": function(e, t) {
		var id = this._id;
		if(!id) {
			return;
		}

		var items = pageSession.get("nameValueBoxItems") || [];

		var itemIndex = items.findIndex(function(x) {
			return x._id == id;
		});

		if(itemIndex < 0) {
			return;
		}

		items.splice(itemIndex, 1);

		pageSession.set("nameValueBoxItems", items);
	},

	"click .move-up-item": function(e, t) {
		var id = this._id;
		if(!id) {
			return;
		}

		var items = pageSession.get("nameValueBoxItems") || [];

		var itemIndex = items.findIndex(function(x) {
			return x._id == id;
		});

		if(itemIndex <= 0) {
			return;
		}

		var prevItem = items[itemIndex - 1];
		items[itemIndex - 1] = items[itemIndex];
		items[itemIndex] = prevItem;

		pageSession.set("nameValueBoxItems", items);
	},

	"click .move-down-item": function(e, t) {
		var id = this._id;
		if(!id) {
			return;
		}

		var items = pageSession.get("nameValueBoxItems") || [];

		var itemIndex = items.findIndex(function(x) {
			return x._id == id;
		});

		if(itemIndex < 0 || itemIndex + 1 >= items.length) {
			return;
		}

		var nextItem = items[itemIndex + 1];
		items[itemIndex + 1] = items[itemIndex];
		items[itemIndex] = nextItem;

		pageSession.set("nameValueBoxItems", items);
	}
});

Template.NameValueBoxItem.helpers({
	"nameField": function() {
		return Template.parentData().nameField;
	},
	"valueField": function() {
		return Template.parentData().valueField;
	},
	"itemName": function() {
		return this[Template.parentData().nameField];
	},
	"itemValue": function() {
		return this[Template.parentData().valueField];
	},
	"moveUpClass": function() {
		var id = this._id;
		if(!id) {
			return;
		}

		var items = pageSession.get("nameValueBoxItems") || [];

		var itemIndex = items.findIndex(function(x) {
			return x._id == id;
		});

		return itemIndex <= 0 ? "disabled" : "";
	},
	"moveDownClass": function() {
		var id = this._id;
		if(!id) {
			return;
		}

		var items = pageSession.get("nameValueBoxItems") || [];

		var itemIndex = items.findIndex(function(x) {
			return x._id == id;
		});

		return itemIndex < 0 || itemIndex + 1 >= items.length ? "disabled" : "";
	}
});
