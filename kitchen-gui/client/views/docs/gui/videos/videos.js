Template.DocsGuiVideos.rendered = function() {
	$("code").addClass("hljs-code");
	$("pre code").addClass("hljs");
	$("table").addClass("ui table");
};

Template.DocsGuiVideos.helpers({
	"officialVideosOptions": function() {
		return {
			title: "Official videos",
			posts: this.official_videos,
			collection: Blog,
			groupName: "gui_official_videos"
		}
	},
	"contribVideosOptions": function() {
		return {
			title: "Contributed videos",
			posts: this.contrib_videos,
			collection: Blog,
			groupName: "gui_contrib_videos"
		}
	}
});
