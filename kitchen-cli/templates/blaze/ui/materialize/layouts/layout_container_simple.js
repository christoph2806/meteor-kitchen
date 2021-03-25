Template.layout.onCreated(function() {
	/*TEMPLATE_CREATED_CODE*/
});

Template.layout.onDestroyed(function() {
	/*TEMPLATE_DESTROYED_CODE*/
});

Template.layout.onRendered(function() {
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
});

Template.layout.helpers({ 
	"freeData": function() {
		/*FREE_DATA_PARAMS*/
		/*FREE_DATA_FUNCTION*/
	}
});
