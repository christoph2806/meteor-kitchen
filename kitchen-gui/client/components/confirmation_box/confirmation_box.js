this.confirmationBox = function(title, message, onApprove, onDeny, options) {
	var tmpl = Template["ConfirmationBox"];
	var div = document.createElement("div");
	options = options || {};
	var data = {
		title: title,
		message: message,
		approveButtonTitle: options.approveButtonTitle || "Yes",
		denyButtonTitle: options.denyButtonTitle || "No",
		onApprove: function(el) { if(onApprove) onApprove(el); return true; },
		onDeny: function(el) { if(onDeny) onDeny(el); return true; },
		onHidden: function() { $(".confirmation-box").remove(); }
	};
	Blaze.renderWithData(tmpl, data, div);
};

Template.ConfirmationBox.rendered = function() {
	var modalBox = $(this.find(".confirmation-box"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");
};
