var pageSession = new ReactiveDict();

this.addFileForm = function(title, defaultSource, defaultDest, rootDirs, onApprove, onDeny, options) {
	if(!App.project) {
		return;
	}
	var kitchen = App.project.get();
	if(!kitchen) {
		return;
	}

	var tmpl = Template["AddFileForm"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();
	var defaultDestDir = defaultDest.split("/").length ? defaultDest.split("/")[0] : "";
	var defaultDestFile = defaultDest.substring(defaultDestDir.length);
	if(defaultDestFile && defaultDestFile.charAt(0) == "/") {
		defaultDestFile = defaultDestFile.substring(1);
	}

	pageSession.set("fileSource", defaultSource == "" ? "internal" : "external");

	var data = {
		boxId: boxId,
		kitchen: kitchen,
		title: title,
		defaultSource: defaultSource,
		defaultDestDir: defaultDestDir,
		defaultDestFile: defaultDestFile,
		rootDirs: rootDirs,
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

Template.AddFileForm.rendered = function() {
	var modalBox = $(this.find(".add-file-form"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");

	Meteor.defer(function() {
		this.$(".ui.dropdown").dropdown();

		this.$("input[name='fileSource']").on("change", function(e, t) {
			pageSession.set("fileSource", $(this).val());
		});

		this.$("input[type='text']").on("focus", function(e, t) {
			$(this).select();
		});
	});
};

Template.AddFileForm.helpers({
	isExternalFile: function() {
		return pageSession.get("fileSource") == "external";		
	}
});
