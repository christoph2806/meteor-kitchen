this.choiceBox = function(title, message, items, defaultValue, onApprove, onDeny, options) {
	var tmpl = Template["ChoiceBox"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();
	var data = {
		boxId: boxId,
		title: title,
		message: message,
		items: items,
		defaultValue: defaultValue,
		approveButtonTitle: options.approveButtonTitle || "OK",
		denyButtonTitle: options.denyButtonTitle || "Cancel",
		showApproveButton: !options.noApproveButton,
		showDenyButton: !options.noDenyButton,
		onApprove: function(el) {
			var checked = $(".choice-box input[type='radio']:checked");
			if(!checked.length) {
				return false;
			}

			var value = checked.val();

			if(onApprove) {
				onApprove(el, value);
			}
			return true; },
		onDeny: function(el) { if(onDeny) onDeny(el); return true; },
		onHidden: function() { $("#" + boxId).remove(); }
	};
	Blaze.renderWithData(tmpl, data, div);
};

Template.ChoiceBox.rendered = function() {
	var modalBox = $(this.find(".choice-box"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");
};

Template.ChoiceBox.helpers({
	"itemChecked": function(defaultValue) {
		return this.value == defaultValue ? "checked" : "";
	}
});
