Template.UserSettingsDanger.rendered = function() {
};

Template.UserSettingsDanger.events({
	"click .delete-button": function(e, t) {
		e.preventDefault();
		var me = this;
		var modalBox = $('.ui.small.modal.delete');
		modalBox.modal({
			closable: true,
			detachable: false,
			onDeny: function() {
				return true;
			},
			onApprove: function() {
				$(e.currentTarget).addClass('disabled loading');
				Meteor.call("removeUserAccount", Meteor.userId(), function(err, res) {
					$(e.currentTarget).removeClass('disabled loading');
					if(err) {
						alert(err);
						return true;
					}
					Router.go("home_public");
					return true;
				});
			}
		}).modal('show');

		return false;
	}
});

Template.UserSettingsDanger.helpers({

});
