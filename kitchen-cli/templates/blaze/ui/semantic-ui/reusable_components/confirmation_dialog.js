/*
	ConfirmationDialog(options);

	Function renders modal confirmation dialog. Dialog is inserted into DOM and removed on close.

	"options" object example:

		{
			message: "Are you sure you want to delete?",
			title: "Delete",
			onYes: function(payload) {
				alert("yes: " + payload);
			},
			onNo: function(payload) {
				alert("no: " + payload);
			},
			onCancel: function(id) {
				alert("cancel: " + payload);
			},
			buttonYesTitle: "Yes",
			buttonNoTitle: "No",
			buttonCancelTitle: "Cancel",
			showCancelButton: true,
			payload: null
		}

	Properties:
		message: message shown in the box (no default)
		title: modal box title (no default)
		onYes: function to execute if user click "Yes" button (if not provided, box will simply close)
		onNo: function to execute if user click "No" button (if not provided, box will simply close)
		onCancel: function to execute if user click "Cancel" button (if not provided "onNo" handler will be called. If no handler provided box will simply close)
		buttonYesTitle: text to show on "Yes" button (default: "Yes")
		buttonNoTitle: text to show on "No" button (default: "No")
		buttonCancelTitle: text to show on "Cancel" button (default: "Cancel")
		showCancelButton: show cancel button? (default: false)
		payload: onYes, onNo and onCancel handler will be called with this argument. For example it can be _id of item to delete (or whatever)
*/

this.ConfirmationDialog = function(options) {
	var tmpl = Template["ConfirmationBox"];
	var wrapper = document.body.appendChild(document.createElement("div"));
	var boxId = Random.id();

	options = options || {};

	options.message = options.message || "";
	options.title = options.title || "";
	options.buttonYesTitle = options.buttonYesTitle || "Yes";
	options.buttonNoTitle = options.buttonNoTitle || "No";
	options.buttonCancelTitle = options.buttonCancelTitle || "Cancel";
	options.showCancelButton = options.showCancelButton || false;

	var data = {
		boxId: boxId,
		title: options.title || "",
		message: options.message || "",
		buttonYesTitle: options.buttonYesTitle || "Yes",
		buttonNoTitle: options.buttonNoTitle || "No",
		buttonCancelTitle: options.buttonCancelTitle || "Cancel",
		onApprove: function(el) { 
			if(options.onYes) {
				options.onYes(options.payload); 
			}
			return true; 
		},
		onDeny: function(el) { 
			if(options.onNo) { 
				options.onNo(options.payload); 
			}
			if(options.onCancel) { 
				options.onCancel(options.payload);
			}
			return true;
		},
		onHidden: function() { 
			wrapper.remove();
			$("#" + boxId).remove();
		}
	};
	Blaze.renderWithData(tmpl, data, wrapper);
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
