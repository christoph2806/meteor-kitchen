this.importSharedGasBox = function(title, onApprove, onDeny, options) {
	var tmpl = Template["ImportSharedGasBox"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();
	var data = {
		boxId: boxId,
		title: title,
		approveButtonTitle: options.approveButtonTitle || "OK",
		denyButtonTitle: options.denyButtonTitle || "Cancel",
		showApproveButton: !options.noApproveButton,
		showDenyButton: !options.noDenyButton,
		onApprove: function(el) {

			var itemId = null; /// !!!

			if(onApprove) {
				onApprove(el, itemId);
			}

			var modalBox = $("#" + boxId);
			modalBox.modal("hide");

			return false;
		},
		onDeny: function(el) { if(onDeny) onDeny(el); return true; },
		onHidden: function() { $("#" + boxId).remove(); },
		onImport: options.onImport
	};
	Blaze.renderWithData(tmpl, data, div);
};

Template.ImportSharedGasBox.rendered = function() {
	var modalBox = $(this.find(".import-shared-gas-box"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");
};

Template.ImportSharedGasBox.helpers({
});


// ----

Template.ImportSharedGasList.onCreated(function() {
	this.subscribe("gasoline_shared");
});

Template.ImportSharedGasList.helpers({
	"items": function() {
		return GasolinePalette.find(
				{ 
					userDefined: true, 
					shared: true, 
					createdBy: { 
						$ne: Meteor.userId() 
					}, 
					originalCreatedBy: { 
						$ne: Meteor.userId() 
					} 
				}
		);
	}
});

Template.ImportSharedGasItem.events({
	"click .import-item": function(e, t) {
		var parentData = Template.parentData(1);
		if(parentData && parentData.onImport) {
			var button = t.$(".import-item");
			button.addClass("disabled loading");
			parentData.onImport(this._id, function() {
				button.removeClass("disabled loading");
			});
		}
	}
});
