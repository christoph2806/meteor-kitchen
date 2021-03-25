Template.News.rendered = function() {
	$("code").addClass("hljs-code");
	$("pre code").addClass("hljs");
	$("table").addClass("ui table");
};

Template.News.helpers({
	"newsBlogOptions": function() {
		return {
			title: "News",
			posts: this.news_blog,
			collection: Blog,
			groupName: "news"
		}
	},
	"eventsBlogOptions": function() {
		return {
			title: "Events",
			posts: this.events_blog,
			collection: Blog,
			groupName: "events"
		}
	}
});
