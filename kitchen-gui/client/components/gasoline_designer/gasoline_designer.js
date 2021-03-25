var pageSession = new ReactiveDict();

Template.GasolineDesigner.created = function() {
	pageSession.set("randomId", Random.id());
};

Template.GasolineDesigner.rendered = function() {
	var resizeContainers = function() {
		$(".gasoline-frame").each(function() {
			$(this).css({ width: ($(this).closest(".column").width() - 2) + "px" });

//			$(this).parent().css({ width: ($(this).closest(".column").width() - 2) + "px" });

			var height = $(this).closest(".editor-column").height() - $(this).position().top;

			if($(this).hasClass("height-half")) {
				height = height / 2;
			}

			$(this).css({ height: height + "px" });
		});
	};

	Meteor.defer(function() {
		resizeContainers();
	});

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeContainers();
	});
};

Template.GasolineDesigner.helpers({
	"randomId": function() {
		return pageSession.get("randomId");
	}
});
