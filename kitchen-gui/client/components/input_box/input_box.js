this.inputBox = function(title, message, defaultValue, onApprove, onDeny, options) {
	var tmpl = Template["InputBox"];
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
			validateForm(
				$("#" + boxId).find(".form"),
				function(fieldName, fieldValue) {
					if(fieldName == "inputValue" && !fieldValue && options.required) {
						return "Cannot be blank";
					}
				},
				function() {

				},
				function(values) {
					if(onApprove) {
						onApprove(el, values.inputValue);
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

Template.InputBox.rendered = function() {
	var modalBox = $(this.find(".input-box"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");

	Meteor.defer(function() {
		modalBox.find("input[type='text']").on("focus", function(e, t) {
			$(this).select();
		});
	});
};
