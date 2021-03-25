Template.StringArray.rendered = function() {
};

Template.StringArray.helpers({
});

Template.StringArray.events({
	"click .add-item": function(e, t) {
		e.preventDefault();

		if(!this.options.items) {
			return;
		}

		var itemName = this.options.defaultItemName || "";
		if(itemName) {
			var count = 0;
			while(this.options.items.indexOf(itemName + (count ? count : "")) >= 0) {
				count++;
			}
			itemName += (count ? count : "");
		}

		if(this.options.items.indexOf(itemName) < 0) {
			this.options.items.push(itemName);
			App.setModified();
		}

		Meteor.setTimeout(function() {
			$(t.find("input[data-value='" + itemName + "']")).focus().select();
		}, 50);

		return false;
	}
});



Template.StringArrayItem.rendered = function() {
	var self = this;
	Meteor.defer(function() {
		self.$("input[type='text']").on("focus", function(e, t) {
			$(this).select();
		});
	});
};

Template.StringArrayItem.events({
	"click .remove-item": function(e, t) {
		e.preventDefault();

		var parentData = Template.parentData(1);
		if(!parentData || !parentData.options) {
			return;
		}

		var oldValue = $(t.find("input[name='item-input']")).attr("data-value");
		var itemIndex = parentData.options.items.indexOf(oldValue);
		if(itemIndex < 0) {
			return;
		}

		if(!oldValue) {
			parentData.options.items.splice(itemIndex, 1);
			App.setModified();
		} else {
			var self = this;
			confirmationBox(
				"Delete",
				"Are you sure you want to remove \"" + oldValue + "\"?",
				function(el) {
					parentData.options.items.splice(itemIndex, 1);
					App.setModified();
				},
				function(el) {

				}, {
					approveButtonTitle: "Yes",
					denyButtonTitle: "No"
				}
			);
		}
	},

	"blur input[name='item-input']": function(e, t) {
		var parentData = Template.parentData(1);
		if(!parentData || !parentData.options) {
			return;
		}
		var oldValue = $(e.currentTarget).attr("data-value");
		if(e.currentTarget.value != oldValue || !e.currentTarget.value) {
			var itemIndex = parentData.options.items.indexOf(oldValue);
			if(itemIndex < 0) {
				return;
			}
			if(!e.currentTarget.value) {
				parentData.options.items.splice(itemIndex, 1);
				App.setModified();
			} else {
				parentData.options.items.splice(itemIndex, 1, e.currentTarget.value);
				App.setModified();
			}
		}
	}
});
