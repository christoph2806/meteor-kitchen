Template.layout.rendered = function() {
	// scroll to anchor
	$('body').on('click', 'a', function(e) { 
		var href = $(this).attr("href");
		if(!href) {
			return;
		}
		if(href.length > 1 && href.charAt(0) == "#") {
			var hash = href.substring(1);
			if(hash) {
				e.preventDefault();

				var offset = $('*[id="' + hash + '"]').offset();

				if (offset) {
					$('html,body').animate({ scrollTop: offset.top - 60 }, 400);
				}
			}
		} else {
			if(href.indexOf("http://") != 0 && href.indexOf("https://") != 0 && href.indexOf("#") != 0) {
				$('html,body').scrollTop(0);
			}
		}
	}); 
	/*TEMPLATE_RENDERED_CODE*/
};

Template.PublicLayoutMainSideNav.rendered = function() {
	Meteor.defer(function() {
		this.$('.ui.main-sidenav').sidebar('attach events', '.toc.item');
	});
};

Template.PublicLayoutMainNavbar.rendered = function() {
	this.$('.ui.dropdown').dropdown();
};

Template.PublicLayoutMainNavbar.events({
	"click .toggle-text": function(e, t) {
		e.preventDefault();
		$(e.target).closest("ul").toggleClass("menu-hide-text");
	}
	
});

Template.PublicLayoutMainNavbar.helpers({
	
});

Template.PublicLayoutRightMenu.rendered = function() {
	this.$('.ui.dropdown').dropdown();
};

Template.PublicLayoutRightMenu.events({
	"click .toggle-text": function(e, t) {
		e.preventDefault();
		$(e.target).closest("ul").toggleClass("menu-hide-text");
	}
	
});

Template.PublicLayoutRightMenu.helpers({
	
});


Template.PublicLayoutFooterMenu.rendered = function() {
	
	this.$('.ui.dropdown').dropdown();
};

Template.PublicLayoutFooterMenu.events({
	"click .toggle-text": function(e, t) {
		e.preventDefault();
		$(e.target).closest("ul").toggleClass("menu-hide-text");
	}
	
});

Template.PublicLayoutFooterMenu.helpers({
	
});


Template.PrivateLayout.rendered = function() {
};

Template.PrivateLayoutMainSideNav.rendered = function() {
	Meteor.defer(function() {
		this.$('.ui.main-sidenav').sidebar('attach events', '.toc.item');
	});
};

Template.PrivateLayoutMainNavbar.rendered = function() {
	this.$('.ui.dropdown').dropdown();
};

Template.PrivateLayoutMainNavbar.events({
	"click .toggle-text": function(e, t) {
		e.preventDefault();
		$(e.target).closest("ul").toggleClass("menu-hide-text");
	}
	
});

Template.PrivateLayoutMainNavbar.helpers({
	
});

Template.PrivateLayoutRightMenu.rendered = function() {
	this.$('.ui.dropdown').dropdown();

	this.subscribe("unreadContacts");
};

Template.PrivateLayoutRightMenu.events({
	"click .avatar-label": function(e, t) {
		e.preventDefault();
		$(e.target).closest(".dropdown").click();
	},

	"click .toggle-text": function(e, t) {
		e.preventDefault();
		$(e.target).closest("ul").toggleClass("menu-hide-text");
	}
	
});

Template.PrivateLayoutRightMenu.helpers({
	"unreadContactCount": function() {
		return Contacts.find({
			$or: [
				{ toUserId: Meteor.userId(), unreadMessagesTo: { $gt: 0 } },
				{ fromUserId: Meteor.userId(), unreadMessagesFrom: { $gt: 0 } }
			]
		}, {
			fields: { _id: true }
		}).count();
	}	
});

Template.PrivateLayoutFooterMenu.rendered = function() {
	
	this.$('.ui.dropdown').dropdown();
};

Template.PrivateLayoutFooterMenu.events({
	"click .toggle-text": function(e, t) {
		e.preventDefault();
		$(e.target).closest("ul").toggleClass("menu-hide-text");
	}
	
});

Template.PrivateLayoutFooterMenu.helpers({
	
});
