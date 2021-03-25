this.pageWizard = function(onApprove, onDeny, options) {
	var tmpl = Template["PageWizard"];
	var div = document.createElement("div");
	options = options || {};

	var items = [
		{ value: "",                label: "Blank page" },
		{ value: "login",           label: "Login"},
		{ value: "register",        label: "Register" },
		{ value: "logout",          label: "Logout"},
		{ value: "change_pass",     label: "Change password" },
		{ value: "forgot_password", label: "Forgot password" },
		{ value: "reset_password",  label: "Reset password" },
		{ value: "verify_email",    label: "Verify E-mail"}
	];

	var boxId = Random.id();
	var data = {
		boxId: boxId,
		items: items,
		defaultName: options.defaultName || "",
		onApprove: function(el) {
			var checkedTemplate = $(".page-wizard input[name='template-name']:checked");
			if(!checkedTemplate.length) {
				return false;
			}

			var nameInput = $(".page-wizard input[name='page-name']");

			var values = {};
			values.template = checkedTemplate.val();
			values.name = nameInput.val();

			if(onApprove) {
				onApprove(el, values);
			}
			return true; },
		onDeny: function(el) { if(onDeny) onDeny(el); return true; },
		onHidden: function() { $("#" + boxId).remove(); }
	};
	Blaze.renderWithData(tmpl, data, div);
};

Template.PageWizard.rendered = function() {
	var modalBox = $(this.find(".page-wizard"));
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

Template.PageWizard.helpers({
	"itemChecked": function(defaultValue) {
		return this.value == "" ? "checked" : "";
	}
});
