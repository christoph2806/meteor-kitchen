Template.DocsCliVideos.rendered = function() {
	$("code").addClass("hljs-code");
	$("pre code").addClass("hljs");
	$("table").addClass("ui table");
};

Template.DocsCliVideos.helpers({
	"officialVideosOptions": function() {
		return {
			title: "Official videos",
			posts: this.official_videos,
			collection: Blog,
			groupName: "cli_official_videos"
		}
	},
	"contribVideosOptions": function() {
		return {
			title: "Contributed videos",
			posts: this.contrib_videos,
			collection: Blog,
			groupName: "cli_contrib_videos"
		}
	}
});
