Template.TEMPLATE_NAME.onCreated(function() {
	/*TEMPLATE_CREATED_CODE*/
});

Template.TEMPLATE_NAME.onDestroyed(function() {
	/*TEMPLATE_DESTROYED_CODE*/
});

Template.TEMPLATE_NAME.onRendered(function() {
	/*TEMPLATE_RENDERED_CODE*/
});

Template.TEMPLATE_NAME.events({
	"click td": function(e, t) {
		e.preventDefault();
		var item = this;
		var itemId = item ? item._id : null;

		/*ON_ITEM_CLICKED_CODE*/
		/*DETAILS_ROUTE*/
		return false;
	},

	"click .inline-checkbox": function(e, t) {
		e.preventDefault();

		if(!this || !this._id) return false;

		var fieldName = $(e.currentTarget).attr("data-field");
		if(!fieldName) return false;

		var values = {};
		values[fieldName] = !this[fieldName];

		Meteor.call("UPDATE_METHOD_NAME", this._id, values, function(err, res) {
			if(err) {
				alert(err.message);
			}
		});

		return false;
	},

	"click #delete-button": function(e, t) {
		e.preventDefault();

		var me = this,
			el = $('.modal');

		el.openModal({
			dismissible: true, // Modal can be dismissed by clicking outside of the modal
			opacity: .5, // Opacity of modal background
			in_duration: 300, // Transition in duration
			out_duration: 200, // Transition out duration
			ready: function() {
				el.find('.modal-confirm').on('click', function() {
					COLLECTION_VAR.remove({ _id: me._id });
				});
			}, // Callback for Modal open
			complete: function() {  } // Callback for Modal close
		});

		return false;
	},

	"click #edit-button": function(e, t) {
		e.preventDefault();
		/*EDIT_ROUTE*/
		return false;
	}
});

Template.TEMPLATE_NAME.helpers({
	"checked": function(value) { return value ? "checked" : "" }
	/*EDIT_BUTTON_CLASS_HELPER*/

	/*DELETE_BUTTON_CLASS_HELPER*/
});
