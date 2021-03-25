Template.DocsCliApiReference.rendered = function() {
	$("code").addClass("hljs-code");
	$("pre code").addClass("hljs");
	$("table").addClass("ui table");
	$("h2").addClass("ui dividing header");

	resizeContainer = function() {
		var container = $(".docs-container");
		if(!container.length) {
			return;
		}
		container.css({ height: ($(window).height() - container.offset().top) + "px" });

		$(".scrollable-area").each(function() {
			$(this).css({ width: $(this).closest(".column").width() + "px", height: ($(window).height() - $(this).offset().top) + "px" });
			$(this).parent().css({ width: $(this).closest(".column").width() + "px" });
		});
	};

	this.autorun(function (tracker) {
		Session.get("windowSize");
		resizeContainer();
	});


	Meteor.defer(function(){ 
		resizeContainer();
	});
};

Template.DocsCliApiReference.helpers({
	"apiClassList": function() {
		var classNames = ClassKitchen.getClassNames(true);
		return classNames;
	},

	"apiReferenceMarkdown": function() {
		return ClassKitchen.getDocs();
	}
});

Template.DocsCliApiReference.events({
	"click a": function(e, t) {
		var gotoId = $(e.currentTarget).attr("href");
		if(!gotoId || gotoId[0] != "#" || !$(gotoId).length) {
			return;
		}
		$(".scrollable-content").animate({
			scrollTop: $(".scrollable-content").scrollTop() + $(gotoId).position().top
		}, 500);
	}
});
