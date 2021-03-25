this.textareaBox = function(title, message, defaultValue, onApprove, onDeny, options) {
	var tmpl = Template["TextareaBox"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();

	var data = {
		boxId: boxId,
		title: title,
		message: message,
		defaultValue: defaultValue,
		approveButtonTitle: options.approveButtonTitle || "OK",
		denyButtonTitle: options.denyButtonTitle || "Cancel",
		showApproveButton: !options.noApproveButton,
		showDenyButton: !options.noDenyButton,
		onApprove: function(el) {
			var text = ($(".textarea-box .textarea-editor").val() + "");

			if(onApprove) {
				onApprove(el, text);
			}
			return true; },
		onDeny: function(el) { if(onDeny) onDeny(el); return true; },
		onHidden: function() { $("#" + boxId).remove(); }
	};
	Blaze.renderWithData(tmpl, data, div);
};

Template.TextareaBox.rendered = function() {
	var modalBox = $(this.find(".textarea-box"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");
};

Template.TextareaBox.helpers({
});
