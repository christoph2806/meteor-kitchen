this.gasItemProperties = function(title, defaultTitle, defaultShared, onApprove, onDeny, options) {
	var tmpl = Template["GasItemProperties"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();
	var data = {
		boxId: boxId,
		title: title,
		defaultTitle: defaultTitle,
		defaultShared: defaultShared,
		approveButtonTitle: options.approveButtonTitle || "OK",
		denyButtonTitle: options.denyButtonTitle || "Cancel",
		showApproveButton: !options.noApproveButton,
		showDenyButton: !options.noDenyButton,
		onApprove: function(el) {
			validateForm(
				$("#" + boxId).find(".form"),
				function(fieldName, fieldValue) {
					if(fieldName == "title" && !fieldValue) {
						return "Name cannot be blank";
					}
				},
				function() {

				},
				function(values) {
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

Template.GasItemProperties.rendered = function() {
	var modalBox = $(this.find(".gas-item-properties"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");

	Meteor.defer(function() {
		this.$("input[type='text']").on("focus", function(e, t) {
			$(this).select();
		});
	});

};

Template.GasItemProperties.helpers({
});
