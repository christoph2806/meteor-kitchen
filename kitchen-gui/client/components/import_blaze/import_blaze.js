var b2g = require("blaze2gasoline");

this.importBlazeBox = function(title, defaultHTML, defaultJS, onApprove, onDeny, options) {
	var tmpl = Template["ImportBlazeBox"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();
	var data = {
		boxId: boxId,
		title: title,
		language: options.language,
		defaultHTML: defaultHTML,
		defaultJS: defaultJS,
		approveButtonTitle: options.approveButtonTitle || "OK",
		denyButtonTitle: options.denyButtonTitle || "Cancel",
		showApproveButton: !options.noApproveButton,
		showDenyButton: !options.noDenyButton,
		onApprove: function(el) {

			var html = Session.get("importBlazeBoxInputHTML") || "";
			var js = Session.get("importBlazeBoxInputJS") || "";
			var gas = b2g.blaze2gasoline(html, js);

			if(onApprove) {
				onApprove(el, gas);
			}

			var modalBox = $("#" + boxId);
			modalBox.modal("hide");

			return false;
		},
		onDeny: function(el) { if(onDeny) onDeny(el); return true; },
		onHidden: function() { $("#" + boxId).remove(); },
		onVisible: function() {
			CodeMirrors["import-blaze-box-html"].refresh();
			CodeMirrors["import-blaze-box-js"].refresh();
		}
	};
	Blaze.renderWithData(tmpl, data, div);
};

Template.ImportBlazeBox.rendered = function() {
	Session.set("importBlazeBoxInputHTML", this.data.defaultHTML || "");
	Session.set("importBlazeBoxInputJS", this.data.defaultJS || "");

	var modalBox = $(this.find(".import-blaze-box"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden,
		onVisible: this.data.onVisible
	}).modal("show");
};

Template.ImportBlazeBox.helpers({
	"importBlazeBoxInputHTMLOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "htmlembedded",
			lint: true,
			gutters: ["CodeMirror-lint-markers"]
		}
	},

	"importBlazeBoxInputJSOptions": function() {
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
	}

});
