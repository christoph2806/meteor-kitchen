if(isIE8)
  return;

if (Package.markdown) {
  var decode;

  if (Meteor.isClient) {
    decode = function (codeWithEntities) {
      return $('<div/>').html(codeWithEntities).text();
    };
  } else {
    var entities = Npm.require("html-entities").XmlEntities;
    entities = new entities();
    decode = entities.decode;
  }

  var decodeEntitiesAndHighlight = function (codeWithEntities, lang) {
    if (lang) {
      try {
        return hljs.highlight(lang, decode(codeWithEntities));
      } catch (error) {
        return decode(codeWithEntities);
      }
    } else {
      return hljs.highlightAuto(decode(codeWithEntities));
    }
  };

  var oldConstructor = Package.markdown.Showdown.converter;

  Package.markdown.Showdown.converter = function (options) {
    var converter = new oldConstructor(options);
    var oldMakeHtml = converter.makeHtml;

    converter.makeHtml = function (text) {
      text = oldMakeHtml(text);

      text = text.replace(/<pre>\s*<code( class="(.+?)")?>([\s\S]*?)<\/code>\s*<\/pre>/g, function (fullBlock, attr, className, codeOnly) {
        // Don't re-highlight already highlighted code
        if (className && className.match(/hljs/)) {
          return fullBlock;
        }

        var result = decodeEntitiesAndHighlight(codeOnly, className);
        return "<pre><code class='hljs " + result.language + "'>" + result.value + "</code></pre>";
      });

      return text;
    };

    return converter;
  };
} else if (Package["perak:markdown"]) {
  var marked = Package['perak:markdown'].Markdown;
  marked.setOptions({
    highlight: function(code, lang) {
      if (lang) {
        try {
          return hljs.highlight(lang, code).value;
        } catch (error) {
          return code;
        }
      } else {
        return hljs.highlightAuto(code).value;
      }
    }
  });
}
