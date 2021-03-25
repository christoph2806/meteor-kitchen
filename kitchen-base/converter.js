var fs = require('fs');

var metaString = "";
try {
  metaString = fs.readFileSync('./source/metadata.json');
} catch(err) {
  console.log("Error opening file.", err);
  return;
}

var resultString = "";
try {
  resultString = fs.readFileSync('./source/kitchen-base.js');
} catch(err) {
  console.log("Error opening file.", err);
  return;
}

var meta = JSON.parse(metaString);

var _ = require('underscore');

function capitalizeFirstLetter(str) {
	var s = str.toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function camelCase(str) {
	var s = str.toLowerCase();
	var a = s.split('_');
	var res = "";
	_.each(a, function(word) {
		res += capitalizeFirstLetter(word);
	})
	return res;
}

function getInheritedProperties(className, add) {
	add = add || false;
	var cl = _.find(meta.classList, function(c) { return c.objectType == className; });
	if(!cl) return [];

	var res = [];

	if(add) {
		_.each(cl.members, function(m) {
			res.push(m.name);
		});
	}

	_.each(cl.derivedFrom, function(der) {
		res = _.union(res, getInheritedProperties(der, true));
	});
	return res;
}

function appendResult(str) {
	if(str) resultString += str;
	resultString += "\n";
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function removeEverythingBeforeFirstSubstring(string, substring, removeSubstringToo) {
	var pos = string.indexOf(substring);
	if(pos < 0) {
		return string;
	}

	if(removeSubstringToo) {
		pos += substring.length;
	}

	return string.substring(pos + 1);
}

function removeEverythingAfterLastSubstring(string, substring, removeSubstringToo) {
	var pos = string.lastIndexOf(substring);
	if(pos < 0) {
		return string;
	}

	if(removeSubstringToo) {
		pos -= substring.length;
	}

	return string.substring(0, pos);
}


appendResult("");

_.each(meta.classList, function(classInfo) {
	var skip = false;
	var cls = "";
	if(classInfo.objectType == "object") skip = true;
	if(!skip) {
		if(classInfo.objectType == "root") classInfo.objectType = "kitchen";

		var sup = "KBaseObject";
		if(classInfo.derivedFrom.length) {
			sup = classInfo.derivedFrom[classInfo.derivedFrom.length - 1];
			if(sup == "array") sup = "base_array";
			if(sup == "object") sup = "named_object";

			var deriveFromBase = [
				"zone",
				"gasoline",
				"gas_event"
			];
			if(deriveFromBase.indexOf(classInfo.objectType) >= 0) {
				sup = "base_object";
			}

			sup = "K" + camelCase(sup);
		}
		cls = "K" + camelCase(classInfo.objectType);

		appendResult("// ----------------------------------------------------------------------------");
		appendResult("");
		appendResult("class " + cls + " extends " + sup + " {");
		appendResult("");
		appendResult("\tconstructor(parent) {");
		appendResult("\t\tsuper(parent);");
		appendResult("");
		appendResult("\t\tthis._classDescription = \"\";");

		if(classInfo.objectType == "zone") {
			inh = [];
		} else {
			inh = getInheritedProperties(classInfo.objectType);
		}
		_.each(classInfo.members, function(member) {
			var defaultValue = member.default || "";

			if(member.type == "array") {
				member.type = "base_array";
			}

			if(member.type == "boolean") {
				defaultValue = defaultValue == "true" ? "true" : "false";
			} else {
				if(member.type == "integer") {
					defaultValue = parseInt(defaultValue);
				} else {
					if(member.type == "string") {
						defaultValue = '"' + defaultValue + '"';
					} else {
						defaultValue = defaultValue || "null";
					}
				}
			}
			var description = member.description ? replaceAll(member.description, '"', '\\"') : "";

			var choice_items = "[]";
			if(member.choice_items && member.choice_items.length) {
				choice_items = member.name + "_choice_items";
				appendResult("\t\tvar " + choice_items + " = " + JSON.stringify(member.choice_items) + ";");
			}

			var required = (!!member.required ? "true" : "false");
			if(inh.indexOf(member.name) < 0) {
				appendResult("\t\tthis.addProperty(\"" + member.name + "\", \"" + member.type + "\", \"" + member.subType + "\", " + defaultValue + ", \"" + member.title + "\", \"" + description + "\", \"" + member.input + "\", " + choice_items + ", " + required + ");");
			} else {
				appendResult("\t\tthis.updateProperty(\"" + member.name + "\", \"" + member.type + "\", \"" + member.subType + "\", " + defaultValue + ", \"" + member.title + "\", \"" + description + "\", \"" + member.input + "\", " + choice_items + ", " + required + ");");
			}
		});

		var somePropertiesRemoved = false;
		_.each(inh, function(member) {
			if(!_.find(classInfo.members, function(mm) { return mm.name == member; })) {
				if(!somePropertiesRemoved) {
					appendResult("\t\t// Remove unwanted members inherited from parent class");
				}
				appendResult("\t\tthis.removeProperty(\"" + member + "\");");
				somePropertiesRemoved = true;
			}
		});

		appendResult("\t}");

		// add methods (if any)
		var methods = "";
		try {
			var methodsFilename = "./source/methods_" + classInfo.objectType + ".js";
			methods = fs.readFileSync(methodsFilename).toString();
		} catch(err) {
			methods = "";
		}

		if(methods) {
			appendResult("");
			methods = removeEverythingBeforeFirstSubstring(methods, "{", true);
			methods = removeEverythingAfterLastSubstring(methods, "}", true);
			appendResult(methods);
		}


		appendResult("");
		appendResult("}");
		appendResult("");

		appendResult(cls + ".getClassName = function() { return \"" + classInfo.objectType + "\"; };");
		appendResult("");

		appendResult("ClassKitchen.addClass(" + cls + ");");
		appendResult("");
	}
});


try {
  fs.writeFileSync('../kitchen-gui/lib/kitchen-base.js', resultString);
} catch(err) {
  console.log("Error writing file.", err);
  return;
}
