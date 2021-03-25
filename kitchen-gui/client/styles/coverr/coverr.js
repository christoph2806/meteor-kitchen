global.initCoverr = function() {

	function adjustVideoSize(video) {
		if(video[0].readyState == 4) {
			var coverr = video.closest(".coverr");

			var windowWidth = coverr.innerWidth();
			var windowHeight = coverr.innerHeight();
			var videoWidth = video[0].videoWidth;
			var videoHeight = video[0].videoHeight;

			var videoAspectRatio = video[0].videoHeight / video[0].videoWidth;
			var windowAspectRatio = windowHeight / windowWidth;

			if (videoAspectRatio > windowAspectRatio) {
				videoWidth = windowWidth;
				videoHeight = videoWidth * videoAspectRatio;
				video.css({ "top": -(videoHeight - windowHeight) / 2 + "px", "left": 0 });
			} else {
				videoHeight = windowHeight;
				videoWidth = videoHeight / videoAspectRatio;
				video.css({"top" : 0, "left" : -(videoWidth - windowWidth) / 2 + "px" });
			}

			video.width(videoWidth).height(videoHeight);
		}
	}

	$(".coverr video").each(function() {
		var video = $(this);
		video.on("playing", function() {
			adjustVideoSize(video);
		});
	});

    $(window).on("resize", function() {
		$(".coverr video").each(function() {
			adjustVideoSize($(this));
		});
    });
};
