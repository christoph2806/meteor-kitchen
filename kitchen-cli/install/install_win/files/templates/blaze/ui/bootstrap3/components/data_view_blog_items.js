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
	"click .blog-details": function(e, t) {
		e.preventDefault();
		/*ON_ITEM_CLICKED_CODE*/
		/*DETAILS_ROUTE*/
		return false;
	},

	"click .blog-delete": function(e, t) {
		e.preventDefault();
		var me = this;
		bootbox.dialog({
			message: "DELETE_CONFIRMATION_MESSAGE",
			title: "Delete",
			animate: false,
			buttons: {
				success: {
					label: "Yes",
					className: "btn-success",
					callback: function() {
						Meteor.call("REMOVE_METHOD_NAME", me._id, function(err, res) {
							if(err) {
								alert(err.message);
							}
						});
					}
				},
				danger: {
					label: "No",
					className: "btn-default"
				}
			}
		});
		return false;
	},
	"click .blog-edit": function(e, t) {
		e.preventDefault();
		/*EDIT_ROUTE*/
		return false;
	}
});
