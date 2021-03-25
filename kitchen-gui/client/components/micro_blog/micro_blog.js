var pageSession = new ReactiveDict();

Template.MicroBlog.rendered = function() {
	pageSession.set("mode_" + this.data.groupName, "read");
	pageSession.set("editing_" + this.data.groupName, []);
};

Template.MicroBlog.helpers({
	"userCanInsert": function() {
		return this.collection && this.collection.userCanInsert && this.collection.userCanInsert(Meteor.userId(), {});
	},

	"readMode": function() {
		return pageSession.get("mode_" + this.groupName) == "read";
	},
	"insertMode": function() {
		return pageSession.get("mode_" + this.groupName) == "insert";
	},
	"editingPost": function() {
		var editingList = pageSession.get("editing_" + this.groupName) || [];
		return editingList.indexOf(this._id) >= 0;
	}
});

Template.MicroBlog.events({
	"click .insert-button": function(e, t) {
		e.preventDefault();
		Session.set("microBlogInput_" + this.groupName, "");
		pageSession.set("mode_" + this.groupName, "insert");
		return false;
	}
});

Template.MicroBlogPost.rendered = function() {
	Meteor.defer(function() {
		this.$(".ui.embed").embed();		
	});
};

Template.MicroBlogPost.helpers({
	"userCanUpdate": function() {
		var parentData = Template.parentData();
		return parentData.collection && parentData.collection.userCanUpdate && parentData.collection.userCanUpdate(Meteor.userId(), {});
	},
	"userCanRemove": function() {
		var parentData = Template.parentData();
		return parentData.collection && parentData.collection.userCanRemove && parentData.collection.userCanRemove(Meteor.userId(), {});
	}
});

Template.MicroBlogPost.events({
	"click .edit-button": function(e, t) {
		e.preventDefault();

		Session.set("microBlogInput_" + this._id, this.text);

		var editingList = pageSession.get("editing_" + this.groupName) || [];
		editingList.push(this._id);
		pageSession.set("editing_" + this.groupName, editingList);

		return false;
	},
	"click .delete-button": function(e, t) {
		e.preventDefault();

		var self = this;
		confirmationBox("Delete post", "Are you sure you want to delete blog post?", function() {
			Meteor.call("blogPostRemove", self._id, function(err, res) {
				if(err) {
					alert(err);
					return;
				}
			});
		}, function() {

		}, {

		});


		return false;
	}
});


Template.MicroBlogInsert.rendered = function() {
	Meteor.defer(function() {
		this.$("input[name='title']").focus();
	});
};

Template.MicroBlogInsert.helpers({
	"markdownInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "gfm",
			gutters: ["CodeMirror-lint-markers"]
		}
	},
	"reactiveVarName": function() {
		return "microBlogInput_" + this.groupName;
	}
});

Template.MicroBlogInsert.events({
	"click .cancel-button": function(e, t) {
		e.preventDefault();
		Session.set("microBlogInput_" + this.groupName, "");
		pageSession.set("mode_" + this.groupName, "read");
		return false;		
	},
	"click .submit-button": function(e, t) {
		var self = this;
		validateForm(
			$(t.find(".form")),
			function(fieldName, fieldValue) {
				switch(fieldName) {
					case "title": {
						if(fieldValue == "") {
							return "Title is required.";
						}
					}; break;
					case "code-mirror-textarea": {
						if(fieldValue == "") {
							return "Text cannot be empty.";
						}
					}; break;
				}
			},
			function() {
			},
			function(values) {
				var title = values.title;
				var text = Session.get("microBlogInput_" + self.groupName);

				Meteor.call("blogPostInsert", title, text, self.groupName, function(err, res) {
					if(err) {
						alert(err);
						return;
					}
					Session.set("microBlogInput_" + self.groupName, "");
					pageSession.set("mode_" + self.groupName, "read");
				});
			}
		);
	}
});


Template.MicroBlogUpdate.rendered = function() {
	this.find("input[name='title']").focus();
};

Template.MicroBlogUpdate.helpers({
	"markdownInputOptions": function() {
		return {
			tabSize: 4,
			indentUnit: 4,
			indentWithTabs: true,

			lineNumbers: true,
			readOnly: false,
			mode: "gfm",
			gutters: ["CodeMirror-lint-markers"]
		}
	},
	"reactiveVarName": function() {
		return "microBlogInput_" + this._id;
	}
});


Template.MicroBlogUpdate.events({
	"click .cancel-button": function(e, t) {
		var editingList = pageSession.get("editing_" + this.groupName) || [];
		var index = editingList.indexOf(this._id);
		if(index >= 0) {
			editingList.splice(index, 1);
		}
		pageSession.set("editing_" + this.groupName, editingList);
		Session.set("microBlogInput_" + this._id, "");
	},

	"click .submit-button": function(e, t) {
		var self = this;
		validateForm(
			$(t.find(".form")),
			function(fieldName, fieldValue) {
				switch(fieldName) {
					case "title": {
						if(fieldValue == "") {
							return "Title is required.";
						}
					}; break;
					case "code-mirror-textarea": {
						if(fieldValue == "") {
							return "Text cannot be empty.";
						}
					}; break;
				}
			},
			function() {
			},
			function(values) {
				var postId = self._id;
				var title = values.title;
				var text = Session.get("microBlogInput_" + self._id);

				Meteor.call("blogPostUpdate", postId, title, text, function(err, res) {
					if(err) {
						alert(err);
						return;
					}
					var editingList = pageSession.get("editing_" + self.groupName) || [];
					var index = editingList.indexOf(self._id);
					if(index >= 0) {
						editingList.splice(index, 1);
					}
					pageSession.set("editing_" + self.groupName, editingList);
					Session.set("microBlogInput_" + self._id, "");
				});
			}
		);
	}
});

