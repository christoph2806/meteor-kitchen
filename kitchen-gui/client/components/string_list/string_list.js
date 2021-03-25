this.stringList = function(title, message, items, defaultValue, onApprove, onDeny, options) {
	var tmpl = Template["StringList"];
	var div = document.createElement("div");
	options = options || {};
	var boxId = Random.id();

	var fixedItems = items && items.length;

	var def = defaultValue;

	if(!fixedItems && defaultValue && defaultValue.length) {
		def = "";
		defaultValue.map(function(defaultItem, ndx) {
			if(defaultItem) {
				if(ndx) { def += "\n"; }
				def += (defaultItem + "");
			}
		});
		if(def) { def += "\n"; }
	}

	var data = {
		boxId: boxId,
		title: title,
		message: message,
		items: items,
		defaultValue: def,
		fixedItems: fixedItems,
		approveButtonTitle: options.approveButtonTitle || "OK",
		denyButtonTitle: options.denyButtonTitle || "Cancel",
		showApproveButton: !options.noApproveButton,
		showDenyButton: !options.noDenyButton,
		onApprove: function(el) {
			var values = [];

			if(fixedItems) {
				var checked = $(".string-list input[type='checkbox']:checked").each(function() {
					values.push($(this).val());
				});
			} else {
				var txt = ($(".string-list .items-editor").val() + "").trim();
				var tmp = txt.split(/\r?\n/);
				tmp.map(function(s) {
					var str = (s + "").trim();
					if(str) {
						values.push(str);
					}
				});
			}
			if(onApprove) {
				onApprove(el, values);
			}
			return true; },
		onDeny: function(el) { if(onDeny) onDeny(el); return true; },
		onHidden: function() { $("#" + boxId).remove(); }
	};
	Blaze.renderWithData(tmpl, data, div);
};

Template.StringList.rendered = function() {
	var modalBox = $(this.find(".string-list"));
	modalBox.modal().modal({
		closable: true,
		detachable: true,
		onApprove: this.data.onApprove,
		onDeny: this.data.onDeny,
		onHidden: this.data.onHidden
	}).modal("show");
};

Template.StringList.helpers({
	"itemChecked": function(defaultValue) {
		if(!defaultValue) {
			return "";
		}
		return defaultValue.indexOf(this + "") >= 0 ? "checked" : "";
	}
});
