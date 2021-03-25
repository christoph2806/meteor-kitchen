/*
//
// Reflect from babel-polyfill is required by babel-plugin-transform-builtin-extend
// for instantiating builtin classes (Array in this case)
//

if(typeof Reflect == "undefined") {
	require("babel-polyfill");
}
*/
var randomString = function(len) {
	len = len || 17;

	let text = "";
	// let first char to be letter
	let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	text += charset.charAt(Math.floor(Math.random() * charset.length));

	// other chars can be numbers
	charset += "0123456789";
	for(var i = 0; i < len; i++) {
		text += charset.charAt(Math.floor(Math.random() * charset.length));
	}

	return text;
};

var AddDirSeparator = function(dir) {
	if(!dir) {
		return "/";
	}

	if(dir[dir.length - 1] != "/") {
		return dir + "/";
	}

	return dir;
};

var isNonEmptyObject = function(obj) {
	return !!Object.keys(obj).length;
};

var extractStringsFromObject = function(obj) {
	var strings = [];

	if(typeof obj == "array") {
		obj.map(el => {
			if(typeof el == "string") {
				strings.push(el);
			} else {
				if(typeof el == "array" || typeof el == "object") {
					var tmp = extractStringsFromObject(el);
					tmp.map(str => {
						strings.push(str);
					});
				}
			}
		});
	} else {
		if(typeof obj == "object") {
			for(var key in obj) {
				if(typeof obj[key] == "string") {
					strings.push(obj[key]);
				} else {
					if(typeof obj[key] == "array" || typeof obj[key] == "object") {
						var tmp = extractStringsFromObject(obj[key]);
						tmp.map(str => {
							strings.push(str);
						});
					}
				}
			}
		}
	}

	return strings;
};

// ----------------------------------------------------------------------------

class KClassKitchen {
	constructor() {
		this.classes = [];

		this.factoryName = "Class factory";
		this.factoryDescription = "";

		// primitive data types
		this.classes.push({ name: "bool", functor: () => { return false; }, primitive: true });
		this.classes.push({ name: "integer", functor: () => { return 0; }, primitive: true });
		this.classes.push({ name: "string", functor: () => { return ""; }, primitive: true });
		this.classes.push({ name: "object", functor: () => { return {}; }, primitive: true });
		this.classes.push({ name: "array", functor: () => { return []; }, primitive: true });
	}

	getClass(name) {
		return this.classes.find(c => c.name == name);
	}

	addClass(type) {
		let functor = (parent) => { return new type(parent); };
		let className = type.getClassName();

		this.removeClass(className);

		this.classes.push({
			name: className,
			functor: functor
		});
	}

	removeClass(name) {
		let index = this.classes.findIndex(c => c.name == name);
		if(index < 0) {
			return;
		}
		this.classes.splice(index, 1);
	}

	create(name, parent) {
		let classInfo = this.classes.find(c => c.name == name);
		if(!classInfo) {
			return null;
		}
		return classInfo.functor(parent);
	}

	getDocs(includeThis = false) {
		let docs = "";
		if(includeThis) {
			docs += "# " + this.factoryName + "\n";
			docs += this.factoryDescription + "\n";
			docs += "\n";
		}

		let classNames = this.getClassNames(true);

		classNames.map(className => {
			let c = this.getClass(className);
			let tmp = c.functor(null);
			if(tmp.getDocs) {
				docs += tmp.getDocs();
				docs += "\n";
			}
		});
		return docs;
	}

	getClassNames(sort = true, forDocs = true) {
		let classNames = [];
		this.classes.map(c => {
			classNames.push(c.name);
		});

		let list = [];

		classNames.map(className => {
			let c = this.getClass(className);
			let tmp = c.functor(null);
			if(!forDocs || tmp.getDocs) {
				list.push(className);
			}
		});

		if(sort) {
			list.sort();
		}

		return list;
	}

	getClassNamesInheritedFrom(className, skipClassNames, skipParentClassNames) {
		var classNames = [];
		this.classes.map(cls => {
			let obj = this.create(cls.name);
			if(obj.isInheritedFrom && obj.isInheritedFrom(className) && skipClassNames.indexOf(cls.name) < 0) {
				var skip = false;
				if(skipParentClassNames.length) {
					skipParentClassNames.map(skipParentClass => {
						if(obj.isInheritedFrom(skipParentClass)) {
							skip = true;
						}
					});
				}

				if(!skip) {
					classNames.push(cls.name);
				}
			}
		});
		return classNames;
	}
}

this.ClassKitchen = new KClassKitchen();

// ----------------------------------------------------------------------------

class KBaseObject {
	static getClassName() { return "base_object"; }

	constructor(parent) {
		this._id = randomString();
		this._parent = parent || null;
		this._properties = [];
		this._className = this.constructor.getClassName();
		this._classDescription = "Base object";
	}

	getSuperClassName() {
		var realSuper = Object.getPrototypeOf(Object.getPrototypeOf(this));
		if(realSuper.constructor.getClassName) {
			return realSuper.constructor.getClassName();
		}
		return "";
	}

	isInheritedFrom(className) {
		if(this.constructor.getClassName() == className) {
			return true;
		}

		var realSuper = Object.getPrototypeOf(Object.getPrototypeOf(this));

		if(realSuper && realSuper.isInheritedFrom) {
			return realSuper.isInheritedFrom(className);
		}

		return false;
	}

	addProperty(name, type, subType, defaultValue, title, description, input, choiceItems, required) {
		if(!name) {
			return;
		}
		this[name] = defaultValue || ClassKitchen.create(type, this);

		if(this[name] instanceof KBaseArray) {
			this[name]._defaultItemType = subType;
		}

		if(this[name] instanceof KBaseObject || this[name] instanceof KBaseArray || type == "object" || type == "array") {
			if(!defaultValue) {
				defaultValue = ClassKitchen.create(type, this);
			}
		}

		title = title || name || "";
		description = description || "";
		input = input || "";
		choiceItems = choiceItems || [];
		required = !!required;

		this._properties.push({
			name: name,
			type: type,
			subType: subType,
			defaultValue: defaultValue,
			title: title,
			description: description,
			input: input,
			choiceItems: choiceItems,
			required: required
		});
	}

	updateProperty(name, type, subType, defaultValue, title, description, input, choiceItems, required) {
		if(!name) {
			return;
		}

		var propertyIndex = this._properties.findIndex(prop => prop.name == name);
		if(propertyIndex < 0) {
			return;
		}

		this[name] = defaultValue || ClassKitchen.create(type, this);

		if(this[name] instanceof KBaseArray) {
			this[name]._defaultItemType = subType;
		}

		if(this[name] instanceof KBaseObject || this[name] instanceof KBaseArray || type == "object" || type == "array") {
			if(!defaultValue) {
				defaultValue = ClassKitchen.create(type, this);
			}
		}

		title = title || name || "";
		description = description || "";
		input = input || "";
		choiceItems = choiceItems || [];
		required = !!required;

		let property = {
			name: name,
			type: type,
			subType: subType,
			defaultValue: defaultValue,
			title: title,
			description: description,
			input: input,
			choiceItems: choiceItems,
			required: required
		}
		this._properties[propertyIndex] = property;
	}

	removeProperty(name) {
		var propertyIndex = this._properties.findIndex(prop => prop.name == name);
		if(propertyIndex < 0) {
			return;
		}

		this._properties.splice(propertyIndex, 1);
		delete this[name];
	}

	getProperty(name) {
		return this._properties.find(p => p.name == name);
	}

	propertyHasValue(name) {
		var value = this[name + ""];
		if(typeof value == "undefined") {
			return false;
		}

		var property = this.getProperty(name);
		if(!property || !property.type) {
			return false;
		}

		if(property.type == "array") {
			return value && value.length;
		}

		return !!value;
	}

	getRoot() {
		if(!this._parent || !this._parent.getRoot) {
			return this;
		}

		return this._parent.getRoot();
	}

	getParents(parents = []) {
		if(!this._parent || !this._parent.getParents) {
			return parents;
		}

		parents.push(this._parent);

		return this._parent.getParents(parents);
	}

	getParentOfType(type) {
		let parents = this.getParents();
		return parents.find(parent => {
			return parent._className == type;
		});
	}

	getParentWithProperty(propertyName) {
		let parents = this.getParents();
		return parents.find(parent => {
			return parent.getProperty && parent.getProperty(propertyName);
		});
	}

	getParentKeyName() {
		if(!this._parent) {
			return "";
		}

		let propertyName = "";
		this._parent._properties.find(property => {
			if(this._parent[property.name] && this._parent[property.name]._id == this._id) {
				propertyName = property.name;
				return true;
			}
		});

		return propertyName;
	}

	getDocs() {
		let docs = "";

		docs += "<h2 id=\"_" + this._className + "\">" + this._className + "</h2>\n";
		docs += "\n";
		if(this._classDescription) {
			docs += this._classDescription + "\n";
			docs += "\n";
		}
		if(this.getSuperClassName()) {
			docs += "**Inherited from:** <a href=\"#_" + this.getSuperClassName() + "\">" + this.getSuperClassName() + "</a>\n";
		}
		docs += "\n";
		if(this._properties.length) {
			docs += "#### " + this._className + " properties\n";
			docs += "Property name | Type | Default value | Description\n";
			docs +=	"--------------|------|---------------|------------\n";
			this._properties.map(property => {
				docs += property.name + " | ";
				let type = property.type;
				if(type == "base_array" && property.subType) {
					type = "<a href=\"#_base_array\">array</a> of ";
					var kitchenClass = ClassKitchen.getClass(property.subType);
					if(kitchenClass && !kitchenClass.primitive) {
						type += "<a href=\"#_" + property.subType + "\">" + property.subType + "</a>";
					} else {
						type += property.subType;
					}
				} else {
					var kitchenClass = ClassKitchen.getClass(property.type);
					if(kitchenClass && !kitchenClass.primitive) {
						type = "<a href=\"#_" + property.type + "\">" + property.type + "</a>";
					}
				}
				docs += type + " | ";
				if(property.defaultValue && property.defaultValue.save) {
					docs += " | ";
				} else {
					if(property.type == "object" || property.type == "array") {
						docs += "`" + JSON.stringify(property.defaultValue) + "` | ";
					} else {
						docs += (property.defaultValue || property.type == "bool") ? "`" + property.defaultValue + "` | " : " | ";
					}
				}
				docs += property.description;
				docs += "\n";
			});
			docs += "\n";

			docs += "#### " + this._className + " object skeleton\n";
			docs += "```json\n";
			docs += JSON.stringify(this.save(null, false), null, 2) + "\n";
			docs += "```\n";
			docs += "\n";
		}
		return docs;
	}

	clear() {
		this._properties.map(property => {
			let prop = this[property.name];
			if(prop && prop.clear) {
				prop.clear();
			} else {
				this[property.name] = property.defaultValue;
			}
		});
	}

	isEqual(obj) {
		if(!obj) {
			return false;
		}

		let nonEqIndex = this._properties.findIndex(property => {
			if(this[property.name] && this[property.name].isEqual) {
				if(!this[property.name].isEqual(obj[property.name])) {
					return true;
				}
			} else {
				if(JSON.stringify(this[property.name]) != JSON.stringify(obj[property.name])) {
					return true;
				}
			}
		});
		return nonEqIndex < 0;
	}

	save(obj, simplify, fullSimplify, saveId) {
		let o = obj || {};
		if(saveId && this._id) {
			o._id = this._id;
		}

		this._properties.map(property => {
			let tmp = this[property.name];
			if(tmp && tmp.save) {
				o[property.name] = tmp.save(null, simplify, fullSimplify, saveId);
			} else {
				o[property.name] = tmp;
			}

			if(simplify) {
				if(tmp && tmp.isEqual) {
					if(fullSimplify && tmp.isEqual(property.defaultValue)) {
						delete o[property.name];
					}
				} else {
					if((property.type == "object" && !isNonEmptyObject(o[property.name]) && !isNonEmptyObject(property.defaultValue) && fullSimplify) || (property.name != "type" && o[property.name] == property.defaultValue)) {
						delete o[property.name];
					}
				}
			}
		});
		return o;
	}

	load(obj, loadId) {
		this.clear();
		let o = obj || {};

		if(loadId && o._id) {
			this._id = o._id;
		}

		this._properties.map(property => {
			let tmp = this[property.name];
			if(tmp && tmp.load) {
				tmp.load(o[property.name], loadId);
			} else {
				// special processing for query.filter and query.options - REMOVE AFTER CONVERT DATA
				if(this._className == "query" && (property.name == "filter" || property.name == "options") && property.type == "string" && typeof o[property.name] != "string") {
					this[property.name] = JSON.stringify(o[property.name] || {});
				} else {
					// normal processing
					if(o.hasOwnProperty(property.name)) {
						this[property.name] = o[property.name];
					} else {
						this[property.name] = property.defaultValue;
					}					
				}
			}
		});
	}

	cloneFrom(obj) {
		this.load(obj.save(null, false, false, false));
	}

	findObjectById(id, recoursive = true) {

		let obj = null;
		this._properties.find(property => {
			let prop = this[property.name];
			if(prop && prop.findObjectById) {
				if(prop._id == id) {
					obj = prop;
					return true;
				}

				if(recoursive) {
					obj = prop.findObjectById(id, recoursive);
					if(obj) {
						return true;
					}
				}
			}
		});
		return obj;
	}

	findObjectByName(name, recoursive = true) {
		return this.findObject(function(obj) {
			return obj.getProperty && obj.getProperty("name") && obj.name == name;
		}, recoursive);
	}

	findObjectByNameAndType(name, type, recoursive = true) {
		return this.findObject(function(obj) {
			return obj.getProperty && obj.getProperty("name") && obj.name == name && obj._className == type;
		}, recoursive);
	}

	findObject(callback, recoursive = true) {
		if(!callback) {
			return null;
		}

		let obj = null;
		this._properties.find(property => {
			let prop = this[property.name];
			if(prop && prop.findObject) {
				if(callback(prop)) {
					obj = prop;
					return true;
				}

				if(recoursive) {
					obj = prop.findObject(callback, recoursive);
					if(obj) {
						return true;
					}
				}
			}
		});
		return obj;
	}

	getObjectOfType(type, recoursive = true) {
		return this.findObject(function(obj) {
			return obj._className == type;
		}, recoursive);
	}

	getObjectsOfType(className, recoursive = true) {
		var objects = [];
		if(this._className == className) {
			objects.push(this);
		}
		this.findObject(obj => {
			if(obj._className == className) {
				objects.push(obj);
			}
		}, recoursive);
		return objects;
	}

	getAllRoutes() {
		var routes = [];
		var pages = this.getObjectsOfType("page");
		pages.map(page => {
			var route = page.getRoute();
			routes.push(route);
		});
		return routes;
	}

	findPageByRoute(routeName, recoursive = true) {
		return this.findObject(function(obj) {
			return obj.getRoute && obj.getRoute() == routeName;
		}, recoursive);
	}

	removeObjectById(id, recoursive = true) {
		let removed = false;
		this._properties.find(property => {
			let prop = this[property.name];
			if(prop && prop.removeObjectById && recoursive) {
				if(prop.removeObjectById(id, recoursive)) {
					removed = true;
					return true;
				}

				if(prop._id == id) {
					// this function doesn't remove object member, so... do nothing here
					return true;
				}
			}
		});
		return removed;
	}
}

ClassKitchen.addClass(KBaseObject);

// ----------------------------------------------------------------------------

class KBaseArray extends Array {
	static getClassName() { return "base_array"; }

	constructor(parent) {
		super();

		this._id = randomString();
		this._parent = parent || null;
		this._properties = [];
		this._className = this.constructor.getClassName();

		this._defaultItemType = "";

		this._classDescription = "Base array";
	}

	getSuperClassName() {
		var realSuper = Object.getPrototypeOf(Object.getPrototypeOf(this));
		if(realSuper.constructor.getClassName) {
			return realSuper.constructor.getClassName();
		}
		return "";
	}

	isInheritedFrom(className) {
		if(this.constructor.getClassName() == className) {
			return true;
		}

		var realSuper = Object.getPrototypeOf(Object.getPrototypeOf(this));

		if(realSuper && realSuper.isInheritedFrom) {
			return realSuper.isInheritedFrom(className);
		}

		return false;
	}

	getRoot() {
		if(!this._parent || !this._parent.getRoot) {
			return this;
		}

		return this._parent.getRoot();
	}

	getParents(parents = []) {
		if(!this._parent || !this._parent.getParents) {
			return parents;
		}

		parents.push(this._parent);

		return this._parent.getParents(parents);
	}

	getParentOfType(type) {
		let parents = this.getParents();
		return parents.find(parent => {
			parent._className == type;
		});
	}

	getParentKeyName() {
		if(!this._parent) {
			return "";
		}

		let propertyName = "";
		this._parent._properties.find(property => {
			if(this._parent[property.name] && this._parent[property.name]._id == this._id) {
				propertyName = property.name;
				return true;
			}
		});

		return propertyName;
	}

	getDocs() {
		let docs = "";

		docs += "<h2 id=\"_" + this._className + "\">" + this._className + "</h2>\n";
		docs += "\n";
		if(this._classDescription) {
			docs += this._classDescription + "\n";
			docs += "\n";
		}
		if(this.getSuperClassName()) {
			docs += "**Inherited from:** <a href=\"#_" + this.getSuperClassName() + "\">" + this.getSuperClassName() + "</a>\n";
		}
		docs += "\n";
		return docs;
	}

	clear() {
		this.length = 0;
	}

	isEqual(arr) {
		if(!arr || this.length != arr.length) {
			return false;
		}

		let nonEqIndex = this.findIndex((item, index) => {
			if(item && item.isEqual) {
				if(!item.isEqual(arr[index])) {
					return true;
				}
			} else {
				if(JSON.stringify(item) != JSON.stringify(arr[index])) {
					return true;					
				}
			}
		});

		return nonEqIndex < 0;
	}

	save(arr, simplify, fullSimplify, saveId) {
		let a = arr || [];

		if(saveId && this._id) {
			a._id = this._id;
		}

		this.map(item => {
			if(item && item.save) {
				let obj = item.save(null, simplify, fullSimplify, saveId);
				if(item._className != this._defaultItemType) {
					obj.object_type = item._className;
				}
				a.push(obj);
			} else {
				a.push(item);
			}
		});
		return a;
	}

	load(arr, loadId) {
		var self = this;
		this.clear();
		let a = arr || [];

		if(loadId && a._id) {
			this._id = a._id;
		}

		if(!a.map) {
			return;
		}

		a.map(item => {
			let obj = null;

			if(item) {
				if(item.object_type) {
					obj = ClassKitchen.create(item.object_type, self);
				} else {
					if(item.type) {
						if(self._defaultItemType == "component") {
							obj = ClassKitchen.create(item.type, self);
						} else {
							if(self._defaultItemType == "gas_node" || self._defaultItemType == "gas_element" || self._defaultItemType == "gas_template") {
								obj = ClassKitchen.create("gas_" + item.type.replace(/-/g, "_"), self);
							}
						}
					}
				}
			}

			if(!obj) {
				if(self._defaultItemType) {
					obj = ClassKitchen.create(self._defaultItemType, self);
				} else {

				}
			}

			if(obj && obj.load) {
				obj.load(item, loadId);
				self.push(obj);
			} else {
				self.push(item);
			}
		});
	}

	getUniqueItemName(newObject) {
		var newName = "";
		var newNameTemplate = newObject.name || ("new_" + newObject._className);
		var index = 0;
		do {
			newName = newNameTemplate + (index ? index : "");
			index++;
		} while(this.findObject(object => {
			return object.name == newName;
		}, false));
		return newName;
	}

	findObjectById(id, recoursive) {
		recoursive = typeof recoursive !== "undefined" ? recoursive : true;

		let obj = null;
		this.find(item => {
			if(item && item.findObjectById) {
				if(item._id == id) {
					obj = item;
					return true;
				}

				if(recoursive) {
					obj = item.findObjectById(id, recoursive);
					if(obj) {
						return true;
					}
				}
			}
		});
		return obj;
	}

	findObject(callback, recoursive) {
		if(!callback) {
			return null;
		}

		recoursive = typeof recoursive !== "undefined" ? recoursive : true;

		let obj = null;
		this.find(item => {
			if(item && item.findObject) {
				if(callback(item)) {
					obj = item;
					return true;
				}

				if(recoursive) {
					obj = item.findObject(callback, recoursive);
					if(obj) {
						return true;
					}
				}
			}
		});
		return obj;
	}

	findObjectByName(name, recoursive) {
		return this.findObject(function(obj) {
			return obj.getProperty && obj.getProperty("name") && obj.name == name;
		}, recoursive);
	}

	findObjectByNameAndType(name, type, recoursive) {
		return this.findObject(function(obj) {
			return obj.getProperty && obj.getProperty("name") && obj.name == name && obj._className == type;
		}, recoursive);
	}

	indexOfObjectById(id) {
		return this.findIndex(item => {
			return item && item._id && (item._id == id);
		});
	}

	swapItems(index1, index2) {
		this.splice(index2, 1, this.splice(index1, 1, this[index2])[0]);
	}

	moveItemUp(id) {
		let index = this.indexOfObjectById(id);
		if(index < 1) {
			return;
		}

		this.swapItems(index - 1, index);
	}

	moveItemDown(id) {
		let index = this.indexOfObjectById(id);
		if(index >= this.length - 1) {
			return;
		}

		this.swapItems(index, index + 1);
	}

	getObjectOfType(type, recoursive) {
		return this.findObject(function(obj) {
			return obj._className == type;
		}, recoursive);
	}

	getObjectsOfType(className, recoursive = true) {
		var objects = [];
		if(this._className == className) {
			objects.push(this);
		}
		this.findObject(obj => {
			if(obj._className == className) {
				objects.push(obj);
			}
		}, recoursive);
		return objects;
	}

	removeObjectById(id, recoursive) {
		recoursive = typeof recoursive !== "undefined" ? recoursive : true;

		let removed = false;
		let index = this.findIndex(item => {
			if(item && item.removeObjectById && recoursive) {
				if(item.removeObjectById(id, recoursive)) {
					removed = true;
					return true;
				}
			}
			return item._id == id;
		});

		if(removed) {
			return true;
		}

		if(index >= 0) {
			if(this[index] && this[index].updateRefs) {
				this[index].updateRefs(this[index].name, "");
			}
			this.splice(index, 1);
			return true;
		}
		return false;
	}
}

ClassKitchen.addClass(KBaseArray);

// ----------------------------------------------------------------------------

class KNamedObject extends KBaseObject {
	static getClassName() { return "named_object"; }

	constructor(parent) {
		super(parent);
		this._classDescription = "";

		this.addProperty("name", "string", "", "", "", "", "", [], true);
	}
}

ClassKitchen.addClass(KNamedObject);
