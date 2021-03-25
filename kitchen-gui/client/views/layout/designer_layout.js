Template.DesignerLayout.rendered = function() {
	var resizeContainer = function() {
		var parent = this.$("#design-content");
		var menu = parent.find(".designer-navbar");
		var container = parent.find(".design-container");
		container.css({ height: parent.innerHeight() - menu.outerHeight(true) });
	};

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeContainer();
	});


	Meteor.defer(function() {
		resizeContainer();
	});
};

Template.DesignerLayout.events({
});

Template.DesignerLayout.helpers({
});


Template.DesignerLayoutSideNav.rendered = function() {
	Meteor.defer(function() {
		$('.ui.designer-sidenav').sidebar('attach events', '.toc.item');
	});
};

Template.DesignerLayoutMenu.rendered = function() {
	this.$('.ui.dropdown').dropdown();
};

Template.DesignerLayoutMenu.events({
	"click .file-save": function(e, t) {
		App.saveApp(function(err, res) {
			if(err) {
				alert(err.reason);
			}
		});
	},

	"click .file-undo": function(e, t) {
		App.undo();
	},

	"click .file-redo": function(e, t) {
		App.redo();
	}
});

Template.DesignerLayoutMenu.helpers({
	"saveItemClass": function() {
		return App.projectModified.get() ? "" : "disabled";
	},
	"undoItemClass": function() {
		var undoPointer = App.undoPointer.get();
		var undoBuffer = App.undoBuffer.get();
		return undoPointer > 0 ? "": "disabled";
	},
	"redoItemClass": function() {
		var undoPointer = App.undoPointer.get();
		var undoBuffer = App.undoBuffer.get();
		return undoPointer < (undoBuffer.length - 1) ? "": "disabled";
	}
});
