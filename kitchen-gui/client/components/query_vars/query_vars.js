var pageSession = new ReactiveDict();

this.queryVarsBox = function(title, defaultValue, nameField, valueField, queryNameField, onApprove, onDeny, options) {
	var tmpl = Template["QueryVarsBox"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();

	var tmp = [];
	defaultValue.map(function(x) {
		var it = { _id: Random.id() };
		it[nameField] = x[nameField];
		it[valueField] = x[valueField];
		it[queryNameField] = x[queryNameField];
		tmp.push(it);
	});
	pageSession.set("queryVarsBoxItems", tmp);

	var data = {
		boxId: boxId,
		title: title,
		defaultValue: defaultValue,
		nameField: nameField,
		valueField: valueField,
		queryNameField: queryNameField,
		approveButtonTitle: options.approveButtonTitle || "OK",
		denyButtonTitle: options.denyButtonTitle || "Cancel",
		showApproveButton: !options.noApproveButton,
		showDenyButton: !options.noDenyButton,
		onApprove: function(el) {
			var values = pageSession.get("queryVarsBoxItems") || [];
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

Template.QueryVarsBox.rendered = function() {
	var self = this;

	var modalBox = $(this.find(".query-vars-box"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");

	Meteor.defer(function() {
		this.$(".add-item").click(function() {
			var items = pageSession.get("queryVarsBoxItems") || [];
			var item = { _id: Random.id() };
			item[self.data.nameField] = "";
			item[self.data.valueField] = "";
			item[self.data.queryNameField] = "";
			items.push(item);
			pageSession.set("queryVarsBoxItems", items);
		});
	});
};

Template.QueryVarsBox.helpers({
	"items": function() {
		return pageSession.get("queryVarsBoxItems") || [];
	},
	"nameTitle": function() {
		return toTitleCase(this.nameField);
	},
	"valueTitle": function() {
		return toTitleCase(this.valueField);
	},
	"queryNameTitle": function() {
		return toTitleCase(this.queryNameField);
	}
});


Template.QueryVarsBoxItem.rendered = function() {
	Meteor.defer(function() {
		this.$(".ui.dropdown").dropdown();

		this.$(".remove-item").click(function() {
			var id = $(this).closest("tr").attr("data-id");
			if(!id) {
				return;
			}

			var items = pageSession.get("queryVarsBoxItems") || [];

			var itemIndex = items.findIndex(function(x) {
				return x._id == id;
			});

			if(itemIndex < 0) {
				return;
			}

			items.splice(itemIndex, 1);

			pageSession.set("queryVarsBoxItems", items);
		});

		this.$(".name-input").on("input", function() {
			var id = $(this).closest("tr").attr("data-id");
			if(!id) {
				return;
			}

			var nameField = $(this).closest("tr").attr("data-name-field");

			var items = pageSession.get("queryVarsBoxItems") || [];

			var item = items.find(function(x) {
				return x._id == id;
			});
			if(!item) {
				return;
			}

			item[nameField] = $(this).val();

			pageSession.set("queryVarsBoxItems", items);
		});

		this.$(".value-input").on("input", function() {
			var id = $(this).closest("tr").attr("data-id");
			if(!id) {
				return;
			}

			var valueField = $(this).closest("tr").attr("data-value-field");

			var items = pageSession.get("queryVarsBoxItems") || [];

			var item = items.find(function(x) {
				return x._id == id;
			});
			if(!item) {
				return;
			}

			item[valueField] = $(this).val();

			pageSession.set("queryVarsBoxItems", items);
		});


		$("select[name='queryName']").on("change", function(e) {
			var id = $(this).closest("tr").attr("data-id");
			if(!id) {
				return;
			}

			var queryNameField = $(this).closest("tr").attr("data-query-name-field");

			var items = pageSession.get("queryVarsBoxItems") || [];

			var item = items.find(function(x) {
				return x._id == id;
			});

			if(!item) {
				return;
			}

			var value = $(this).val();
			if(value == " ") {
				value = "";
			} 

			item[queryNameField] = value;

			pageSession.set("queryVarsBoxItems", items);
		});


		this.$("input[type='text']").on("focus", function(e, t) {
			$(this).select();
		});
	});
};

Template.QueryVarsBoxItem.helpers({
	"nameField": function() {
		return Template.parentData().nameField;
	},
	"valueField": function() {
		return Template.parentData().valueField;
	},
	"queryNameField": function() {
		return Template.parentData().queryNameField;
	},
	"itemName": function() {
		return this[Template.parentData().nameField];
	},
	"itemValue": function() {
		return this[Template.parentData().valueField];
	},
	"itemQueryName": function() {
		return this[Template.parentData().queryNameField];
	},
	"queryIsSelected": function(queryName) {
		if(queryName == " ") {
			queryName = "";
		}
		return Template.parentData().query_name === queryName ? "selected" : "";
	},
	"queryList": function() {
		var kitchen = App.project.get();
		if(!kitchen) {
			return;
		}

		var choiceItems = [" "];
		var queries = kitchen.getObjectsOfType("query");
		queries.map(query => {
			choiceItems.push(query.name);
		});

		choiceItems.sort();
		return choiceItems;
	}
});
