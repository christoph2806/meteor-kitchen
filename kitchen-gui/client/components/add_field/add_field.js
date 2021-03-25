this.addFieldForm = function(defaultName, onApprove, onDeny, options) {
	if(!App.project) {
		return;
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return;
	}

	var tmpl = Template["AddFieldForm"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();

	var data = {
		boxId: boxId,
		kitchen: kitchen,
		defaultName: defaultName,
		onApprove: function(el) {
			validateForm(
				$("#" + boxId).find(".form"),
				function(fieldName, fieldValue) {

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

Template.AddFieldForm.rendered = function() {
	var modalBox = $(this.find(".add-field-form"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");


	Meteor.defer(function() {
		this.$(".ui.dropdown").dropdown();

		this.$("input[type='text']").on("focus", function(e, t) {
			$(this).select();
		});

	});
};

Template.AddFieldForm.helpers({
});