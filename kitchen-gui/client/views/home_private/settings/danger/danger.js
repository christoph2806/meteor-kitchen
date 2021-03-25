Template.HomePrivateSettingsDanger.rendered = function() {
};

Template.HomePrivateSettingsDanger.events({
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
				Applications.remove({ _id: me.application._id }, function(err, res) {
					$(e.currentTarget).removeClass('disabled loading');
					if(err) {
						alert(err);
						return true;
					}
					Router.go("home");
					return true;
				});
			}
		}).modal('show');

		return false;
	},

	"click .toggle-public-button": function(e, t) {
		e.preventDefault();
		var me = this;
		var modalBox = $('.ui.small.modal.toggle-public');
		modalBox.modal({
			closable: true,
			detachable: false,
			onDeny: function() {
				return true;
			},
			onApprove: function() {
				$(e.currentTarget).addClass('disabled loading');
				Meteor.call("toggleAppPublic", me.application._id, function(err, res) {
					$(e.currentTarget).removeClass('disabled loading');
					if(err) {
						alert(err);
						return true;
					}
				});
			}
		}).modal('show');

		return false;
	}
});

Template.HomePrivateSettingsDanger.helpers({

});
