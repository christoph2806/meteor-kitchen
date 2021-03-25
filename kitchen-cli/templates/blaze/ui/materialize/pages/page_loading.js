Template.loading.onCreated(function() {
	/*TEMPLATE_CREATED_CODE*/
});

Template.loading.onDestroyed(function() {
	/*TEMPLATE_DESTROYED_CODE*/
});

Template.loading.onRendered(function() {
	/*TEMPLATE_RENDERED_CODE*/

	Meteor.defer(function() {
		globalOnRendered();
	});
});

Template.loading.events({

});

Template.loading.helpers({

});
