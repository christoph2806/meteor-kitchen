/*
   Returns property value, where property name is given as path.

   Example:

       getPropertyValue("x.y.z", { x: { y: { z: 123 } } }); // returns 123
*/

export const getPropertyValue = function(propertyName, obj) {
	if(typeof obj == "undefined") {
		return obj;
	}
	var props = propertyName.split(".");
	var res = obj;
	for(var i = 0; i < props.length; i++) {
		res = res[props[i]];
		if(typeof res == "undefined") {
			return res;
		}
	}
	return res;
};


/* 
   converts properties in format { "x.y": "z" } to { x: { y: "z" } }
*/

export const deepen = function(o) {
	var oo = {}, t, parts, part;
	for (var k in o) {
		t = oo;
		parts = k.split('.');
		var key = parts.pop();
		while (parts.length) {
			part = parts.shift();
			t = t[part] = t[part] || {};
		}
		t[key] = o[k];
	}
	return oo;
};


/*
	flatten: convert { x: { y: "z" }} into { "x.y": "z" }
*/

export const flatten = function(o) {
		for(var key in o) {
		var obj = o[key];
		if(_.isObject(obj) && !_.isArray(obj)) {
			for(var k in obj) {
				o[key + "." + k] = obj[k];
			}
			delete o[key];
		}
	}
	return o;
};


/*
	Function converts array of objects to csv, tsv or json string

	exportFields: list of object keys to export (array of strings)
	fileType: can be "json", "csv", "tsv" (string)
*/

export const exportArrayOfObjects = function(data, exportFields, fileType) {
	data = data || [];
	fileType = fileType || "csv";
	exportFields = exportFields || [];

	var str = "";
	// export to JSON
	if(fileType == "json") {

		var tmp = [];
		_.each(data, function(doc) {
			var obj = {};
			_.each(exportFields, function(field) {
				obj[field] = doc[field];
			});
			tmp.push(obj);
		});

		str = JSON.stringify(tmp);
	}

	// export to CSV or TSV
	if(fileType == "csv" || fileType == "tsv") {
		var columnSeparator = "";
		if(fileType == "csv") {
			columnSeparator = ",";
		}
		if(fileType == "tsv") {
			// "\t" object literal does not transpile correctly to coffeesctipt
			columnSeparator = String.fromCharCode(9);
		}

		_.each(exportFields, function(field, i) {
			if(i > 0) {
				str = str + columnSeparator;
			}
			str = str + "\"" + field + "\"";
		});
		//\r does not transpile correctly to coffeescript
		str = str + String.fromCharCode(13) + "\n";

		_.each(data, function(doc) {
			_.each(exportFields, function(field, i) {
				if(i > 0) {
					str = str + columnSeparator;
				}

				var value = getPropertyValue(field, doc);
				if(typeof value == "undefined") {
					value = "";
				} else {
					value = value + "";
				}
				value = value.replace(/"/g, '""');
				str = str + "\"" + value + "\"";
			});
			//\r does not transpile correctly to coffeescript
			str = str + String.fromCharCode(13) + "\n";
		});
	}

	return str;
};

export const importCSV = function(str, separatorStr = null) {
	var result = [];

	if(!str) {
		return result;
	}

	var array = str.split("\n");
	if(!array.length) {
		return result;
	}

	var separator = separatorStr;
	if(!separator) {
		// auto detect separator
		var firstRow = array[0];
		if(firstRow.indexOf("\t") >= 0) {
			separator = "\t";
		} else {
			if(firstRow.indexOf(",") >= 0) {
				separator = ",";
			}
		}
	}

	if(!separator) {
		separator = ",";
	}

	// get column names
	var colNames = array[0].split(separator);
	colNames.map(function(colName, colIndex) {
		colNames[colIndex] = (colName + "").trim().replace(/(^")|("$)/g, '');
	});

	var numLines = array.length;
	for(var i = 1; i < numLines; i++) {
		var row = array[i];

		if(row) {
			var values = row.split(separator);
			var obj = {};
			values.map(function(value, col) {
				var val = (value + "").trim().replace(/(^")|("$)/g, '');
				var num = parseFloat(val);
				if(!isNaN(num) && isFinite(num)) {
					obj[colNames[col]] = num;
				} else {
					obj[colNames[col]] = val;
				}
			});
			result.push(obj);
		}
	}

	return result;
};

export const mergeObjects = function(target, source) {

	/* Merges two (or more) objects,
	giving the last one precedence */

	if(typeof target !== "object") {
		target = {};
	}

	for(var property in source) {

		if(source.hasOwnProperty(property)) {

			var sourceProperty = source[ property ];

			if(typeof sourceProperty === 'object') {
				target[property] = mergeObjects(target[property], sourceProperty);
				continue;
			}

			target[property] = sourceProperty;
		}
	}

	for(var a = 2, l = arguments.length; a < l; a++) {
		mergeObjects(target, arguments[a]);
	}

	return target;
};

export const getArray = function(a) {
	a = a || [];
	if(_.isArray(a)) return a;
	if(_.isString(a)) {
		var array = a.split(",") || [];
		_.each(array, function(item, i) { array[i] = item.trim(); });
		return array;
	}
	if(_.isObject(a)) {
		// what to return? keys or values?
	}

	var array = [];
	array.push(a);
	return array;
};

