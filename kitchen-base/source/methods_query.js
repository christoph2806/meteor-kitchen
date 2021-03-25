{
	updateRefs(oldName, newName) {
		var kitchen = this.getRoot();
		if(!kitchen) {
			return;
		}

		kitchen.findObject(obj => {
			obj._properties.map(property => {
				if(property.subType == "query_name" && obj[property.name] && obj[property.name] == oldName) {
					obj[property.name] = newName;
				}
			});
		});
	}

	extractParams() {
		var filterObject = {};
		try {
			filterObject = JSON.parse(this.filter || "{}");
		} catch(err) {

		}


		var optionsObject = {};
		try {
			optionsObject = JSON.parse(this.options || "{}");
		} catch(err) {

		}

		var filterStrings = extractStringsFromObject(filterObject);
		var optionsStrings = extractStringsFromObject(optionsObject);

		var params = [];

		filterStrings.map(str => {
			if(str != "" && (str[0] == ":" || str[0] == "#")) {
				str = str.slice(1);
				if(params.indexOf(str) < 0) {
					params.push(str);
				}
			}
		});

		optionsStrings.map(str => {
			if(str != "" && (str[0] == ":" || str[0] == "#")) {
				str = str.slice(1);
				if(params.indexOf(str) < 0) {
					params.push(str);
				}
			}
		});

		return params;
	}
}
