this.uploader = function(title, message, onApprove, onDeny, options) {
	var tmpl = Template["Uploader"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();
	var data = {
		boxId: boxId,
		title: title,
		message: message,
		approveButtonTitle: options.approveButtonTitle || "OK",
		denyButtonTitle: options.denyButtonTitle || "Cancel",
		showApproveButton: !options.noApproveButton,
		showDenyButton: !options.noDenyButton,
		onApprove: function(el) {
			validateForm(
				$("#" + boxId).find(".form"),
				function(fieldName, fieldValue) {
				},
				function() {

				},
				function(values) {
					var fileInfo = {};

					if(onApprove) {
						onApprove(el, fileInfo);
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

Template.Uploader.rendered = function() {
	var modalBox = $(this.find(".input-box"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");
};

Template.Uploader.helpers({
});
