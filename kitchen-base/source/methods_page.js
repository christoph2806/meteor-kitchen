{
	parentPageOrZone() {
		let parents = this.getParents();
		return parents.find(parent => {
			return parent._className == "page" || parent._className == "zone";
		});
	}

	parentPage() {
		let parents = this.getParents();
		return parents.find(parent => {
			return parent._className == "page";
		});
	}

	parentZone() {
		let parents = this.getParents();
		return parents.find(parent => {
			return parent._className == "zone";
		});
	}

	getRoute(newName) {
		var parents = this.getParents();
		var route = newName || this.name;
		parents.map(parent => {
			if(parent._className == "page") {
				route = parent.name + "." + route;
			}
		});
		return route;
	}

	getURL(newName) {
		var name = newName || this.name;
		var parentURL = "";
		var parentPage = this.parentPage();
		if(parentPage) {
			parentURL = parentPage.getURL() || "/";
			if(parentURL[parentURL.length - 1] != "/") {
				parentURL += "/";
			}
		}
		parentURL = parentURL || "/";

		var url = "";
		if(this.name == "home_free" || this.name == "home_public" || this.name == "home")
			url = "/";
		else
		{
			if(this.name == "home_private")
				url = "/home_private";
			else
				url = parentURL + this.name;
		}

		this.route_params.map(param => {
			if(url[url.length - 1] != "/") {
				url += "/";
			}
			url += ":";
			url += param;
		});

		return url;
	}

	updateRefs(oldName, newName) {
		var oldRoute = this.getRoute(oldName);
		var newRoute = newName ? this.getRoute(newName) : "";

		var kitchen = this.getRoot();
		if(!kitchen) {
			return;
		}
		kitchen.findObject(obj => {
			obj._properties.map(property => {
				if(property.subType == "route_name" && obj[property.name]) {
					// update pointers to this route
					if(obj[property.name] == oldRoute) {
						obj[property.name] = newRoute;
					}
					// update pointers to child routes
					if(obj[property.name].indexOf(oldRoute + ".") == 0) {
						obj[property.name] = obj[property.name].replace(new RegExp("^" + oldRoute + "."), newRoute + ".");
					}
				}
			});
		});
	}
}
