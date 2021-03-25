this.codeEditBox = function(title, defaultValue, onApprove, onDeny, options) {
	var tmpl = Template["CodeEditBox"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();
	var data = {
		boxId: boxId,
		title: title,
		language: options.language,
		defaultValue: defaultValue,
		approveButtonTitle: options.approveButtonTitle || "OK",
		denyButtonTitle: options.denyButtonTitle || "Cancel",
		showApproveButton: !options.noApproveButton,
		showDenyButton: !options.noDenyButton,
		onApprove: function(el) {

			var text = Session.get("codeEditBoxInputText") || "";

			if(onApprove) {
				onApprove(el, text);
			}

			var modalBox = $("#" + boxId);
			modalBox.modal("hide");

			return false;
		},
		onDeny: function(el) { if(onDeny) onDeny(el); return true; },
		onHidden: function() { $("#" + boxId).remove(); },
		onVisible: function() {
			CodeMirrors["code-edit-box-input"].refresh();
		}
	};
	Blaze.renderWithData(tmpl, data, div);
};

Template.CodeEditBox.rendered = function() {
	Session.set("codeEditBoxInputText", this.data.defaultValue || "");

	var modalBox = $(this.find(".code-edit-box"));
	modalBox.modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden,
		onVisible: this.data.onVisible
	}).modal("show");
};

Template.CodeEditBox.helpers({
	"codeEditBoxInputOptions": function() {
		switch(this.language) {
			case "html": {
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
			}; break;

			case "js": {
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
			}; break;
		}

		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false
		}
	}
});
