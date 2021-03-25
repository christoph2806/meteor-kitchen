/*
	InputDialog(options);

	Function renders modal confirmation dialog. Dialog is inserted into DOM and removed on close.

	"options" object example:

		{
			message: "Please enter your name",
			title: "Your name",
			onSubmit: function(text, payload) {
				alert("Submit: " + text + ", Payload: " + payload);
			},
			onCancel: function(payload) {
				alert("cancel: " + payload);
			},
			buttonSubmitTitle: "OK",
			buttonCancelTitle: "Cancel",
			multiline: true,
			text: "Just me",
			payload: null
		}

	Properties:
		message: message shown in the box (no default)
		title: modal box title (no default)
		onSubmit: function to execute if user click "OK" button (if not provided, box will simply close)
		onCancel: function to execute if user click "Cancel" button (if not provided box will simply close)
		buttonSubmitTitle: text to show on "OK" button (default: "OK")
		buttonCancelTitle: text to show on "Cancel" button (default: "Cancel")
		multiline: if set to true then multi-line textarea will be rendered, otherwise single-line input is shown (default: false)
		text: initial text to show in dialog 
		payload: onSubmit and onCancel handler will be called with this argument. For example it can be some _id useful in your program (or whatever)
*/

this.InputDialog = function(options) {
	var tmpl = Template["InputBox"];
	var wrapper = document.body.appendChild(document.createElement("div"));
	options = options || {};
	var boxId = Random.id();
	var data = {
		boxId: boxId,
		title: options.title || "",
		message: options.message || "",
		multiline: options.multiline,
		defaultValue: options.text || "",
		approveButtonTitle: options.buttonSubmitTitle || "OK",
		denyButtonTitle: options.buttonCancelTitle || "Cancel",
		onApprove: function(el) {
			var text = $("#" + boxId).find(".input-control").val();

			if(options.onSubmit) {
				options.onSubmit(text, options.payload);
			}

			return true;
		},

		onDeny: function(el) { 
			if(options.onCancel) {
				options.onCancel(options.payload); 
			}
			return true; 
		},

		onHidden: function() { 
			$("#" + boxId).remove(); 
		}
	};

	Blaze.renderWithData(tmpl, data, wrapper);
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
		modalBox.find("input[type='text']").on("focus", function() {
			$(this).select();
		});
		modalBox.find("input[autofocus], textarea[autofocus]").focus();
	});
};
