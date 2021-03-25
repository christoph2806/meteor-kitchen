this.addRoleForm = function(onApprove, onDeny, options) {
	if(!App.project) {
		return;
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return;
	}

	var tmpl = Template["AddRoleForm"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();

	var reservedNames = ["admin", "blocked", "owner", "nobody"];

	var data = {
		boxId: boxId,
		kitchen: kitchen,
		onApprove: function(el) {
			validateForm(
				$("#" + boxId).find(".form"),
				function(fieldName, fieldValue) {
					if(fieldName == "roleName" && fieldValue) {
						if(kitchen.application.roles.indexOf(toSnakeCase(fieldValue)) >= 0) {
							return "Role \"" + fieldValue + "\" already exists.";
						}

						if(reservedNames.indexOf(toSnakeCase(fieldValue)) >= 0) {
							return "Role name \"" + fieldValue + "\" is reserved.";
						}
					}
				},
				function() {

				},
				function(values) {
					kitchen.application.roles.push(toSnakeCase(values.roleName));
					App.setModified();

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

Template.AddRoleForm.rendered = function() {
	var modalBox = $(this.find(".add-role-form"));
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

Template.AddRoleForm.helpers({
});
