Package.describe({
  summary: "Code highlighting integrated with the markdown package",
  version: "1.2.0",
  name: "simple:highlight.js",
  git: "https://github.com/stubailo/meteor-highlight.js"
});

Npm.depends({
  "html-entities": "1.1.1"
});

Package.onUse(function (api) {
  api.addFiles("detect-ie8.js");
  api.addFiles("highlight.pack.js");
  api.addFiles("markdown-integration.js");
  api.addFiles("github.css");
  api.use([
    "perak:markdown"
  ], ["client", "server"], {weak: true});
  api.export("hljs");
});
