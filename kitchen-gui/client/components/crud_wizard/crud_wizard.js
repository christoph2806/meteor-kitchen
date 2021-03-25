this.crudWizard = function(parentObject, defaultFilter, onApprove, onDeny, options) {
	if(!App.project) {
		return;
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return;
	}

	var tmpl = Template["CrudWizard"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();
	var createPage = parentObject._className == "zone" ? 1 : 0;
	var askToCreatePage = parentObject._className == "page";

	var data = {
		boxId: boxId,
		kitchen: kitchen,
		createPage: createPage,
		askToCreatePage: askToCreatePage,
		defaultFilter: defaultFilter,
		onApprove: function(el) {
			validateForm(
				$("#" + boxId).find(".form"),
				function(fieldName, fieldValue) {
					if(fieldName == "collectionId" && !fieldValue) {
						return "Please select a collection";
					}

					if(fieldName == "queryFilter") {
						try {
							JSON.parse(Session.get("crudQueryFilterInputText") || "{}");
						} catch(e) {
							return "Error parsing JSON";
						}
					}
				},
				function() {

				},
				function(values) {
					values.createPage = !!parseInt(values.createPage);
					values.queryFilter = JSON.stringify(JSON.parse(values.queryFilter || "{}"), null, 2);

					if(onApprove) {
						onApprove(el, values);
					}

					var modalBox = $("#" + boxId);
					modalBox.modal("hide");
				}
			);
			return false;
		},
		onDeny: function(el) { if(onDeny) onDeny(el); return true; },
		onHidden: function() { $("#" + boxId).remove(); }
	};
	Blaze.renderWithData(tmpl, data, div);
};

Template.CrudWizard.rendered = function() {
	var modalBox = $(this.find(".crud-wizard"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");

	Session.set("crudQueryFilterInputText", this.data.defaultFilter);
	Session.set("crudWizardShowQueryFilter", false);

	Meteor.defer(function() {
		this.$(".ui.dropdown").dropdown();

		this.$(".toggler label").click(function(e) {
			var toggler = $(e.currentTarget).closest(".toggler");
			var sessionKey = toggler.attr("data-session");
			var currentlyHidden = toggler.hasClass("off");
			if(currentlyHidden) {
				toggler.find(".content").show("fast", function() {
					Session.set(sessionKey, true);
					var editorId = toggler.find("textarea").attr("id");
					if(editorId && CodeMirrors[editorId]) {
						CodeMirrors[editorId].refresh();
					}
				});
			} else {
				toggler.find(".content").hide("fast", function() {
					Session.set(sessionKey, false);
				});
			}
		});

		this.$("input[type='text']").on("focus", function(e, t) {
			$(this).select();
		});

	});
};

Template.CrudWizard.helpers({
	"collections": function() {
		return this.kitchen.application.collections;
	},

	"crudQueryFilterInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "javascript",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},

	"crudQueryFilterClass": function() {
		return Session.get("crudWizardShowQueryFilter") ? "" : "off";
	},
	"crudQueryFilterIconClass": function() {
		return Session.get("crudWizardShowQueryFilter") ? "fa-caret-down" : "fa-caret-right";
	}
});
