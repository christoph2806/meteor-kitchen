/*
//
// Reflect from babel-polyfill is required by babel-plugin-transform-builtin-extend
// for instantiating builtin classes (Array in this case)
//

if(typeof Reflect == "undefined") {
	require("babel-polyfill");
}
*/
var randomString = function (len) {
	len = len || 17;

	let text = "";
	// let first char to be letter
	let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	text += charset.charAt(Math.floor(Math.random() * charset.length));

	// other chars can be numbers
	charset += "0123456789";
	for (var i = 0; i < len; i++) {
		text += charset.charAt(Math.floor(Math.random() * charset.length));
	}

	return text;
};

var AddDirSeparator = function (dir) {
	if (!dir) {
		return "/";
	}

	if (dir[dir.length - 1] != "/") {
		return dir + "/";
	}

	return dir;
};

var isNonEmptyObject = function (obj) {
	return !!Object.keys(obj).length;
};

var extractStringsFromObject = function (obj) {
	var strings = [];

	if (typeof obj == "array") {
		obj.map(el => {
			if (typeof el == "string") {
				strings.push(el);
			} else {
				if (typeof el == "array" || typeof el == "object") {
					var tmp = extractStringsFromObject(el);
					tmp.map(str => {
						strings.push(str);
					});
				}
			}
		});
	} else {
		if (typeof obj == "object") {
			for (var key in obj) {
				if (typeof obj[key] == "string") {
					strings.push(obj[key]);
				} else {
					if (typeof obj[key] == "array" || typeof obj[key] == "object") {
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
		if (index < 0) {
			return;
		}
		this.classes.splice(index, 1);
	}

	create(name, parent) {
		let classInfo = this.classes.find(c => c.name == name);
		if (!classInfo) {
			return null;
		}
		return classInfo.functor(parent);
	}

	getDocs(includeThis = false) {
		let docs = "";
		if (includeThis) {
			docs += "# " + this.factoryName + "\n";
			docs += this.factoryDescription + "\n";
			docs += "\n";
		}

		let classNames = this.getClassNames(true);

		classNames.map(className => {
			let c = this.getClass(className);
			let tmp = c.functor(null);
			if (tmp.getDocs) {
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
			if (!forDocs || tmp.getDocs) {
				list.push(className);
			}
		});

		if (sort) {
			list.sort();
		}

		return list;
	}

	getClassNamesInheritedFrom(className, skipClassNames, skipParentClassNames) {
		var classNames = [];
		this.classes.map(cls => {
			let obj = this.create(cls.name);
			if (obj.isInheritedFrom && obj.isInheritedFrom(className) && skipClassNames.indexOf(cls.name) < 0) {
				var skip = false;
				if (skipParentClassNames.length) {
					skipParentClassNames.map(skipParentClass => {
						if (obj.isInheritedFrom(skipParentClass)) {
							skip = true;
						}
					});
				}

				if (!skip) {
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
		if (realSuper.constructor.getClassName) {
			return realSuper.constructor.getClassName();
		}
		return "";
	}

	isInheritedFrom(className) {
		if (this.constructor.getClassName() == className) {
			return true;
		}

		var realSuper = Object.getPrototypeOf(Object.getPrototypeOf(this));

		if (realSuper && realSuper.isInheritedFrom) {
			return realSuper.isInheritedFrom(className);
		}

		return false;
	}

	addProperty(name, type, subType, defaultValue, title, description, input, choiceItems, required) {
		if (!name) {
			return;
		}
		this[name] = defaultValue || ClassKitchen.create(type, this);

		if (this[name] instanceof KBaseArray) {
			this[name]._defaultItemType = subType;
		}

		if (this[name] instanceof KBaseObject || this[name] instanceof KBaseArray || type == "object" || type == "array") {
			if (!defaultValue) {
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
		if (!name) {
			return;
		}

		var propertyIndex = this._properties.findIndex(prop => prop.name == name);
		if (propertyIndex < 0) {
			return;
		}

		this[name] = defaultValue || ClassKitchen.create(type, this);

		if (this[name] instanceof KBaseArray) {
			this[name]._defaultItemType = subType;
		}

		if (this[name] instanceof KBaseObject || this[name] instanceof KBaseArray || type == "object" || type == "array") {
			if (!defaultValue) {
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
		if (propertyIndex < 0) {
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
		if (typeof value == "undefined") {
			return false;
		}

		var property = this.getProperty(name);
		if (!property || !property.type) {
			return false;
		}

		if (property.type == "array") {
			return value && value.length;
		}

		return !!value;
	}

	getRoot() {
		if (!this._parent || !this._parent.getRoot) {
			return this;
		}

		return this._parent.getRoot();
	}

	getParents(parents = []) {
		if (!this._parent || !this._parent.getParents) {
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
		if (!this._parent) {
			return "";
		}

		let propertyName = "";
		this._parent._properties.find(property => {
			if (this._parent[property.name] && this._parent[property.name]._id == this._id) {
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
		if (this._classDescription) {
			docs += this._classDescription + "\n";
			docs += "\n";
		}
		if (this.getSuperClassName()) {
			docs += "**Inherited from:** <a href=\"#_" + this.getSuperClassName() + "\">" + this.getSuperClassName() + "</a>\n";
		}
		docs += "\n";
		if (this._properties.length) {
			docs += "#### " + this._className + " properties\n";
			docs += "Property name | Type | Default value | Description\n";
			docs += "--------------|------|---------------|------------\n";
			this._properties.map(property => {
				docs += property.name + " | ";
				let type = property.type;
				if (type == "base_array" && property.subType) {
					type = "<a href=\"#_base_array\">array</a> of ";
					var kitchenClass = ClassKitchen.getClass(property.subType);
					if (kitchenClass && !kitchenClass.primitive) {
						type += "<a href=\"#_" + property.subType + "\">" + property.subType + "</a>";
					} else {
						type += property.subType;
					}
				} else {
					var kitchenClass = ClassKitchen.getClass(property.type);
					if (kitchenClass && !kitchenClass.primitive) {
						type = "<a href=\"#_" + property.type + "\">" + property.type + "</a>";
					}
				}
				docs += type + " | ";
				if (property.defaultValue && property.defaultValue.save) {
					docs += " | ";
				} else {
					if (property.type == "object" || property.type == "array") {
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
			if (prop && prop.clear) {
				prop.clear();
			} else {
				this[property.name] = property.defaultValue;
			}
		});
	}

	isEqual(obj) {
		if (!obj) {
			return false;
		}

		let nonEqIndex = this._properties.findIndex(property => {
			if (this[property.name] && this[property.name].isEqual) {
				if (!this[property.name].isEqual(obj[property.name])) {
					return true;
				}
			} else {
				if (JSON.stringify(this[property.name]) != JSON.stringify(obj[property.name])) {
					return true;
				}
			}
		});
		return nonEqIndex < 0;
	}

	save(obj, simplify, fullSimplify, saveId) {
		let o = obj || {};
		if (saveId && this._id) {
			o._id = this._id;
		}

		this._properties.map(property => {
			let tmp = this[property.name];
			if (tmp && tmp.save) {
				o[property.name] = tmp.save(null, simplify, fullSimplify, saveId);
			} else {
				o[property.name] = tmp;
			}

			if (simplify) {
				if (tmp && tmp.isEqual) {
					if (fullSimplify && tmp.isEqual(property.defaultValue)) {
						delete o[property.name];
					}
				} else {
					if ((property.type == "object" && !isNonEmptyObject(o[property.name]) && !isNonEmptyObject(property.defaultValue) && fullSimplify) || (property.name != "type" && o[property.name] == property.defaultValue)) {
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

		if (loadId && o._id) {
			this._id = o._id;
		}

		this._properties.map(property => {
			let tmp = this[property.name];
			if (tmp && tmp.load) {
				tmp.load(o[property.name], loadId);
			} else {
				// special processing for query.filter and query.options - REMOVE AFTER CONVERT DATA
				if (this._className == "query" && (property.name == "filter" || property.name == "options") && property.type == "string" && typeof o[property.name] != "string") {
					this[property.name] = JSON.stringify(o[property.name] || {});
				} else {
					// normal processing
					if (o.hasOwnProperty(property.name)) {
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
			if (prop && prop.findObjectById) {
				if (prop._id == id) {
					obj = prop;
					return true;
				}

				if (recoursive) {
					obj = prop.findObjectById(id, recoursive);
					if (obj) {
						return true;
					}
				}
			}
		});
		return obj;
	}

	findObjectByName(name, recoursive = true) {
		return this.findObject(function (obj) {
			return obj.getProperty && obj.getProperty("name") && obj.name == name;
		}, recoursive);
	}

	findObjectByNameAndType(name, type, recoursive = true) {
		return this.findObject(function (obj) {
			return obj.getProperty && obj.getProperty("name") && obj.name == name && obj._className == type;
		}, recoursive);
	}

	findObject(callback, recoursive = true) {
		if (!callback) {
			return null;
		}

		let obj = null;
		this._properties.find(property => {
			let prop = this[property.name];
			if (prop && prop.findObject) {
				if (callback(prop)) {
					obj = prop;
					return true;
				}

				if (recoursive) {
					obj = prop.findObject(callback, recoursive);
					if (obj) {
						return true;
					}
				}
			}
		});
		return obj;
	}

	getObjectOfType(type, recoursive = true) {
		return this.findObject(function (obj) {
			return obj._className == type;
		}, recoursive);
	}

	getObjectsOfType(className, recoursive = true) {
		var objects = [];
		if (this._className == className) {
			objects.push(this);
		}
		this.findObject(obj => {
			if (obj._className == className) {
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
		return this.findObject(function (obj) {
			return obj.getRoute && obj.getRoute() == routeName;
		}, recoursive);
	}

	removeObjectById(id, recoursive = true) {
		let removed = false;
		this._properties.find(property => {
			let prop = this[property.name];
			if (prop && prop.removeObjectById && recoursive) {
				if (prop.removeObjectById(id, recoursive)) {
					removed = true;
					return true;
				}

				if (prop._id == id) {
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
		if (realSuper.constructor.getClassName) {
			return realSuper.constructor.getClassName();
		}
		return "";
	}

	isInheritedFrom(className) {
		if (this.constructor.getClassName() == className) {
			return true;
		}

		var realSuper = Object.getPrototypeOf(Object.getPrototypeOf(this));

		if (realSuper && realSuper.isInheritedFrom) {
			return realSuper.isInheritedFrom(className);
		}

		return false;
	}

	getRoot() {
		if (!this._parent || !this._parent.getRoot) {
			return this;
		}

		return this._parent.getRoot();
	}

	getParents(parents = []) {
		if (!this._parent || !this._parent.getParents) {
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
		if (!this._parent) {
			return "";
		}

		let propertyName = "";
		this._parent._properties.find(property => {
			if (this._parent[property.name] && this._parent[property.name]._id == this._id) {
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
		if (this._classDescription) {
			docs += this._classDescription + "\n";
			docs += "\n";
		}
		if (this.getSuperClassName()) {
			docs += "**Inherited from:** <a href=\"#_" + this.getSuperClassName() + "\">" + this.getSuperClassName() + "</a>\n";
		}
		docs += "\n";
		return docs;
	}

	clear() {
		this.length = 0;
	}

	isEqual(arr) {
		if (!arr || this.length != arr.length) {
			return false;
		}

		let nonEqIndex = this.findIndex((item, index) => {
			if (item && item.isEqual) {
				if (!item.isEqual(arr[index])) {
					return true;
				}
			} else {
				if (JSON.stringify(item) != JSON.stringify(arr[index])) {
					return true;
				}
			}
		});

		return nonEqIndex < 0;
	}

	save(arr, simplify, fullSimplify, saveId) {
		let a = arr || [];

		if (saveId && this._id) {
			a._id = this._id;
		}

		this.map(item => {
			if (item && item.save) {
				let obj = item.save(null, simplify, fullSimplify, saveId);
				if (item._className != this._defaultItemType) {
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

		if (loadId && a._id) {
			this._id = a._id;
		}

		if (!a.map) {
			return;
		}

		a.map(item => {
			let obj = null;

			if (item) {
				if (item.object_type) {
					obj = ClassKitchen.create(item.object_type, self);
				} else {
					if (item.type) {
						if (self._defaultItemType == "component") {
							obj = ClassKitchen.create(item.type, self);
						} else {
							if (self._defaultItemType == "gas_node" || self._defaultItemType == "gas_element" || self._defaultItemType == "gas_template") {
								obj = ClassKitchen.create("gas_" + item.type.replace(/-/g, "_"), self);
							}
						}
					}
				}
			}

			if (!obj) {
				if (self._defaultItemType) {
					obj = ClassKitchen.create(self._defaultItemType, self);
				} else {

				}
			}

			if (obj && obj.load) {
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
		} while (this.findObject(object => {
			return object.name == newName;
		}, false));
		return newName;
	}

	findObjectById(id, recoursive) {
		recoursive = typeof recoursive !== "undefined" ? recoursive : true;

		let obj = null;
		this.find(item => {
			if (item && item.findObjectById) {
				if (item._id == id) {
					obj = item;
					return true;
				}

				if (recoursive) {
					obj = item.findObjectById(id, recoursive);
					if (obj) {
						return true;
					}
				}
			}
		});
		return obj;
	}

	findObject(callback, recoursive) {
		if (!callback) {
			return null;
		}

		recoursive = typeof recoursive !== "undefined" ? recoursive : true;

		let obj = null;
		this.find(item => {
			if (item && item.findObject) {
				if (callback(item)) {
					obj = item;
					return true;
				}

				if (recoursive) {
					obj = item.findObject(callback, recoursive);
					if (obj) {
						return true;
					}
				}
			}
		});
		return obj;
	}

	findObjectByName(name, recoursive) {
		return this.findObject(function (obj) {
			return obj.getProperty && obj.getProperty("name") && obj.name == name;
		}, recoursive);
	}

	findObjectByNameAndType(name, type, recoursive) {
		return this.findObject(function (obj) {
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
		if (index < 1) {
			return;
		}

		this.swapItems(index - 1, index);
	}

	moveItemDown(id) {
		let index = this.indexOfObjectById(id);
		if (index >= this.length - 1) {
			return;
		}

		this.swapItems(index, index + 1);
	}

	getObjectOfType(type, recoursive) {
		return this.findObject(function (obj) {
			return obj._className == type;
		}, recoursive);
	}

	getObjectsOfType(className, recoursive = true) {
		var objects = [];
		if (this._className == className) {
			objects.push(this);
		}
		this.findObject(obj => {
			if (obj._className == className) {
				objects.push(obj);
			}
		}, recoursive);
		return objects;
	}

	removeObjectById(id, recoursive) {
		recoursive = typeof recoursive !== "undefined" ? recoursive : true;

		let removed = false;
		let index = this.findIndex(item => {
			if (item && item.removeObjectById && recoursive) {
				if (item.removeObjectById(id, recoursive)) {
					removed = true;
					return true;
				}
			}
			return item._id == id;
		});

		if (removed) {
			return true;
		}

		if (index >= 0) {
			if (this[index] && this[index].updateRefs) {
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

// ----------------------------------------------------------------------------

class KKitchen extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("application", "application", "", null, "Application", "", "", [], true);
	}

}

KKitchen.getClassName = function () { return "kitchen"; };

ClassKitchen.addClass(KKitchen);

// ----------------------------------------------------------------------------

class KField extends KNamedObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.addProperty("title", "string", "", "", "Title", "Field title (used in form labels, table column headers etc.)", "text", [], false);
		var type_choice_items = ["string", "integer", "float", "date", "time", "bool", "array", "object", "email"];
		this.addProperty("type", "string", "", "string", "Type", "Field data type used in form validations. Examples: \"string\", \"integer\", \"float\", \"date\", \"time\", \"bool\", \"array\", \"email\", \"random_string\". Default: \"string\"", "select", type_choice_items, true);
		this.addProperty("default", "string", "", "", "Default value", "Default value. For date fields you can use special constant \"today\", for time fields you can use \"now\". Also, you can set helper here \"{{myHelper}}\".", "text", [], false);
		this.addProperty("min", "string", "", "", "Min. value", "Minimum value (only for numeric fields)", "text", [], false);
		this.addProperty("max", "string", "", "", "Max. value", "Maximum value (only for numeric fields)", "text", [], false);
		this.addProperty("required", "bool", "", false, "Required", "Is field input required? Default: false", "checkbox", [], false);
		this.addProperty("format", "string", "", "", "Format", "Currently used only with data types \"date\" and \"time\". Contains date or time format such as \"MM/DD/YYYY\" or \"hh:mm:ss\"", "text", [], false);
		this.addProperty("searchable", "bool", "", true, "Searchable", "Is field searchable? Default: true", "checkbox", [], false);
		this.addProperty("sortable", "bool", "", true, "Sortable", "Is field sortable? Default: true", "checkbox", [], false);
		this.addProperty("exportable", "bool", "", false, "Exportable", "If true field will be exported to CSV/JSON (used in dataview component). Default: false", "checkbox", [], false);
		var input_choice_items = ["text", "password", "datepicker", "read-only", "textarea", "radio", "checkbox", "select", "select-multiple", "tags", "crud", "file", "custom"];
		this.addProperty("input", "string", "", "text", "Input", "Form input control type: \"text\", \"password\", \"datepicker\", \"read-only\", \"textarea\", \"radio\", \"checkbox\", \"select\", \"crud\", \"file\", \"custom\"", "select", input_choice_items, false);
		this.addProperty("input_template", "string", "", "", "Input template", "Template for \"custom\" input field (relative to input file)", "text", [], false);
		this.addProperty("input_template_code", "string", "", "", "Input template code", "Source code (markup) for \"custom\" input field. If you need any initialization (e.g. jQuery) here, you can put that into form's template_rendered_code", "javascript", [], false);
		this.addProperty("input_group_class", "string", "", "", "Input group class", "This CSS class will be added to field input group container in forms.", "text", [], false);
		this.addProperty("input_control_class", "string", "", "", "Input control class", "This CSS class will be added to input control in forms.", "text", [], false);
		this.addProperty("input_items", "base_array", "input_item", null, "Input items", "Item list for input type \"radio\" and \"select\"", "", [], false);
		this.addProperty("lookup_query_name", "string", "query_name", "", "Lookup query name", "Query name used for form input type \"select\".", "select_query", [], false);
		this.addProperty("lookup_query_params", "base_array", "param", null, "Lookup query params", "Lookup query params", "", [], false);
		this.addProperty("lookup_key", "string", "", "", "Lookup value field", "Field name from lookup_query used as option value in input type \"select\". Mandatory field if lookup_query is defined", "text", [], false);
		this.addProperty("lookup_field", "string", "", "", "Lookup title field", "Field name from lookup_query used as option title in input type \"select\". Mandatory field if lookup query is defined", "text", [], false);
		this.addProperty("display_helper", "string", "", "", "Display helper", "Helper name used to display value from this field (used in DataView, Forms etc.)", "text", [], false);
		var array_item_type_choice_items = ["", "string", "integer", "float", "date", "time", "bool", "object", "email"];
		this.addProperty("array_item_type", "string", "", "", "Array item type", "If \"type\" is set to \"array\" then you can define array item type here. Format is the same as for \"type\" property.", "select", array_item_type_choice_items, false);
		this.addProperty("crud_fields", "base_array", "field", null, "CRUD input fields", "If \"array_item_type\" is set to \"object\" then you can define fields for input type \"crud\".", "", [], false);
		this.addProperty("crud_insert_title", "string", "", "", "CRUD insert title", "For fields with \"input\": \"crud\" - insert button and insert form title", "text", [], false);
		this.addProperty("file_collection", "string", "collection_name", "", "File collection", "For fields with \"input\": \"file\". Name of FS.Collection where file is stored. Generator will automatically join this collection with file_collection.", "select_collection", [], false);
		this.addProperty("file_container", "string", "", "", "File container field", "For fields with \"input\": \"file\". Field name where FS.File object from joined FS.Collection will be stored.", "text", [], false);
		this.addProperty("join_collection", "string", "collection_name", "", "Join collection", "Collection name to join with. If set then this field acts as foreign key. For generic join don't set this field (see \"join_collection_field\" instead).", "select_collection", [], false);
		this.addProperty("join_collection_field", "string", "", "", "Join collection field", "Used in generic joins only. Field name (from this collection) containing collection name to join with. If set then this field acts as foreign key.", "", [], false);
		this.addProperty("join_container", "string", "", "", "Join container field", "Field name where document from joined collection will be stored", "text", [], false);
		this.addProperty("join_fields", "base_array", "string", null, "Join fields", "Field list to fetch from joined collection. Ignored in generic joins.", "stringlist", [], false);
		this.addProperty("show_in_dataview", "bool", "", true, "Show in dataviews", "If set to \"false\", field will not be shown in dataview components. Default: true", "checkbox", [], false);
		this.addProperty("show_in_insert_form", "bool", "", true, "Show in insert forms", "If set to \"false\", field will not be included in forms with mode \"insert\". Default: true", "checkbox", [], false);
		this.addProperty("show_in_update_form", "bool", "", true, "Show in update forms", "If set to \"false\", field will not be included in forms with mode \"update\". Default: true", "checkbox", [], false);
		this.addProperty("show_in_read_only_form", "bool", "", true, "Show in read-only forms", "If set to \"false\", field will not be included in forms with mode \"read_only\". Default: true", "checkbox", [], false);
		var role_in_blog_choice_items = ["", "title", "subtitle", "text", "date"];
		this.addProperty("role_in_blog", "string", "", "", "Role in Blog", "Specify which role this field will have in dataview (\"view_style\": \"blog\"). Can be one of: \"title\", \"subtitle\", \"text\", \"date\".", "select", role_in_blog_choice_items, false);
	}

}

KField.getClassName = function () { return "field"; };

ClassKitchen.addClass(KField);

// ----------------------------------------------------------------------------

class KHiddenField extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("name", "string", "", "", "Name", "Field name", "text", [], true);
		this.addProperty("value", "string", "", "", "Value", "Field value", "text", [], true);
	}

}

KHiddenField.getClassName = function () { return "hidden_field"; };

ClassKitchen.addClass(KHiddenField);

// ----------------------------------------------------------------------------

class KInputItem extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("value", "string", "", "", "Value", "select, radio or checkbox item value written on submit", "text", [], true);
		this.addProperty("title", "string", "", "", "Title", "select, radio or checkbox item title shown to user", "text", [], true);
	}

}

KInputItem.getClassName = function () { return "input_item"; };

ClassKitchen.addClass(KInputItem);

// ----------------------------------------------------------------------------

class KCollection extends KNamedObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		var type_choice_items = ["collection", "file_collection", "bigchaindb"];
		this.addProperty("type", "string", "", "collection", "Type", "Collection type. Can be \"collection\", \"file_collection\" (FS.Collection) or \"bigchaindb\". Default: \"collection\".", "select", type_choice_items, true);
		var storage_adapters_choice_items = ["gridfs", "filesystem", "s3", "dropbox"];
		this.addProperty("storage_adapters", "base_array", "string", null, "Storage adapters", "For collection of type \"file_collection\": list of CollectionFS storage adapters: \"gridfs\", \"filesystem\", \"s3\" or \"dropbox\". If not specified, generator will assume \"gridfs\".", "stringlist", storage_adapters_choice_items, false);
		this.addProperty("storage_adapter_options", "string", "", "", "Storage adapter options", "For collection of type \"file_collection\": list of CollectionFS storage adapters and their options. Example: `{ \"s3\": { \"bucket\": \"mybucket\" }, \"gridfs\": { } }`.", "json", [], false);
		this.addProperty("fields", "base_array", "field", null, "Fields", "Field list. Not mandatory, used by components such as form, dataview etc.", "", [], false);
		this.addProperty("owner_field", "string", "", "", "Owner field", "Field name used to store user ID of document owner. Only for apps using user accounts. Value of this field will be automatically set server side by \"before.insert\" hook.", "text", [], false);
		this.addProperty("roles_allowed_to_read", "base_array", "string", null, "Roles allowed to Read", "List of user roles that can subscribe to this collection. You can use special roles \"nobody\" (nobody can read) and \"owner\" (only owner/creator can read).", "stringlist", [], false);
		this.addProperty("roles_allowed_to_insert", "base_array", "string", null, "Roles allowed to Insert", "List of user roles that can insert documents into this collection. You can use special role \"nobody\" (nobody can insert).", "stringlist", [], false);
		this.addProperty("roles_allowed_to_update", "base_array", "string", null, "Roles allowed to Update", "List of user roles that can update documents. You can use special roles \"nobody\" (nobody can update) and \"owner\" (only owner/creator can update).", "stringlist", [], false);
		this.addProperty("roles_allowed_to_delete", "base_array", "string", null, "Roles allowed to Delete", "List of user roles that can delete documents. You can use special roles \"nobody\" (nobody can remove) and \"owner\" (only owner/creator can remove).", "stringlist", [], false);
		this.addProperty("roles_allowed_to_download", "base_array", "string", null, "Roles allowed to Download", "For collection of type \"file_collection\": List of user roles that can download files. You can use special roles \"nobody\" (nobody can download) and \"owner\" (only owner/creator can download).", "stringlist", [], false);
		this.addProperty("update_rule", "string", "", "", "Update rule", "Update will be restricted if this expression evaluates false. You can use two variables here: \"userId\" and \"doc\". Note that this expression is added ( AND ) to user role check, so if user's role is not allowed to update, evaluating this expression to true will not allow update.", "javascript", [], false);
		this.addProperty("delete_rule", "string", "", "", "Delete rule", "Delete will be restricted if this expression evaluates false. You can use two variables here: \"userId\" and \"doc\". Note that this expression is added ( AND ) to user role check, so if user's role is not allowed to delete, evaluating this expression to true will not allow delete.", "javascript", [], false);
		this.addProperty("before_insert_code", "string", "", "", "Before insert code", "Code to be executed before new document is inserted into collection. Should be only body of a function with args: (userId, doc). See <a href=\"https://github.com/matb33/meteor-collection-hooks\" target=\"_blank\">meteor-collection-hooks</a> package for more details.", "javascript", [], false);
		this.addProperty("before_update_code", "string", "", "", "Before update code", "Code to be executed before document is updated. Should be only body of a function with args: (userId, doc, fieldNames, modifier, options)", "javascript", [], false);
		this.addProperty("before_remove_code", "string", "", "", "Before remove code", "Code to be executed before document is removed. Should be only body of a function with args: (userId, doc)", "javascript", [], false);
		this.addProperty("after_insert_code", "string", "", "", "After insert code", "Code to be executed after new document is inserted into collection. Should be only body of a function with args: (userId, doc). See <a href=\"https://github.com/matb33/meteor-collection-hooks\" target=\"_blank\">meteor-collection-hooks</a> package for more details.", "javascript", [], false);
		this.addProperty("after_update_code", "string", "", "", "After update code", "Code to be executed after document is updated. Should be only body of a function with args: (userId, doc, fieldNames, modifier, options)", "javascript", [], false);
		this.addProperty("after_remove_code", "string", "", "", "After remove code", "Code to be executed after document is removed. Should be only body of a function with args: (userId, doc)", "javascript", [], false);
		this.addProperty("before_insert_source_file", "string", "", "", "Before insert source file", "File that contains code to be executed before new document is inserted (relative to input JSON file). See \"before_insert_code\".", "text", [], false);
		this.addProperty("before_update_source_file", "string", "", "", "Before update source file", "File that contains code to be executed before document is updated (relative to input JSON file). See \"before_update_code\".", "text", [], false);
		this.addProperty("before_remove_source_file", "string", "", "", "Before remove source file", "File that contains code to be executed before document is removed (relative to input JSON file). See \"before_remove_code\".", "text", [], false);
		this.addProperty("after_insert_source_file", "string", "", "", "After insert source file", "File that contains code to be executed after new document is inserted (relative to input JSON file). See \"after_insert_code\".", "text", [], false);
		this.addProperty("after_update_source_file", "string", "", "", "After update source file", "File that contains code to be executed after document is updated (relative to input JSON file). See \"after_update_code\".", "text", [], false);
		this.addProperty("after_remove_source_file", "string", "", "", "After remove source file", "File that contains code to be executed after document is removed (relative to input JSON file). See \"after_remove_code\".", "text", [], false);
	}

	updateRefs(oldName, newName) {
		var kitchen = this.getRoot();
		if (!kitchen) {
			return;
		}

		kitchen.findObject(obj => {
			obj._properties.map(property => {
				if (property.subType == "collection_name" && obj[property.name] && obj[property.name] == oldName) {
					obj[property.name] = newName;
				}
			});
		});
	}

	getSQL() {
		var sql = "";
		var KEY_DATATYPE = "VARCHAR(30)";


		var tableName = toSnakeCase(this.name).toUpperCase();

		sql += "CREATE TABLE " + tableName + " (\n";

		var fieldsSQL = "";
		var keysSQL = "";

		if (fieldsSQL) {
			fieldsSQL += ",\n";
		}
		fieldsSQL += "\tID " + KEY_DATATYPE + " NOT NULL";

		if (keysSQL) {
			keysSQL += ",\n";
		}
		keysSQL += "\tPRIMARY KEY (ID)";

		if (this.fields) {
			this.fields.map(function (field) {
				var fieldName = toSnakeCase(field.name).toUpperCase();
				var fieldType = "";
				if (field.join_collection) {
					fieldType = KEY_DATATYPE;
				} else {
					switch (field.type) {
						case "string": fieldType = "VARCHAR(255)"; break;
						case "email": fieldType = "VARCHAR(255)"; break;
						case "integer": fieldType = "INTEGER"; break;
						case "float": fieldType = "DOUBLE"; break;
						case "date": fieldType = "DATE"; break;
						case "time": fieldType = "INTEGER"; break;
						case "bool": fieldType = "TINYINT"; break;
						case "array": fieldType = "JSON"; break;
						case "object": fieldType = "JSON"; break;

						default: fieldType = "VARCHAR(255)";
					}
				}

				if (fieldsSQL) {
					fieldsSQL += ",\n";
				}
				fieldsSQL += "\t" + fieldName + " " + fieldType || "string";
				if (field.required) {
					fieldsSQL += " NOT NULL";
				}
				if (field.join_collection) {
					if (keysSQL) {
						keysSQL += ",\n";
					}

					var foreignTableName = toSnakeCase(field.join_collection).toUpperCase();

					keysSQL += "\tFOREIGN KEY (" + fieldName + ") REFERENCES " + foreignTableName + "(ID)";
				}
			});
		}

		sql += fieldsSQL;
		if (fieldsSQL) {
			sql += ",\n";
		}
		sql += keysSQL;
		if (keysSQL) {
			sql += "\n";
		}
		sql += ");\n";
		return sql;
	}

	getGraphQL() {
		var gql = "";

		gql += "type " + this.name + " {\n";

		var gqlFields = "";
		if (this.fields) {
			var idField = this.fields.find(function (fld) {
				return !!fld.name && (fld.name.toLowerCase() == "_id" || fld.name.toLowerCase() == "id");
			});

			if (!idField) {
				gqlFields += "\tid: ID!";
			}

			this.fields.map(function (field) {
				if (gqlFields) {
					gqlFields += ",\n";
				}

				gqlFields += "\t" + field.name + ": ";

				var fieldType = "";
				switch (field.type) {
					case "string": fieldType = "String"; break;
					case "email": fieldType = "String"; break;
					case "integer": fieldType = "Int"; break;
					case "float": fieldType = "Float"; break;
					case "date": fieldType = "Int"; break; // no Date in graphQL?
					case "time": fieldType = "Int"; break;
					case "bool": fieldType = "Boolean"; break;
					case "array": fieldType = "[" + field.subType + "]"; break;
					case "object": fieldType = "Object"; break; // not graphQL type

					default: fieldType = "String";
				}

				if (field.required) {
					fieldType += "!";
				}

				gqlFields += fieldType;
			});
		}

		gql += gqlFields;

		gql += "\n}";

		return gql;
	}

}

KCollection.getClassName = function () { return "collection"; };

ClassKitchen.addClass(KCollection);

// ----------------------------------------------------------------------------

class KQuery extends KNamedObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.addProperty("collection", "string", "collection_name", "", "Collection name", "Name of existing collection", "select_collection", [], true);
		this.addProperty("find_one", "bool", "", false, "FindOne", "If set to true query will return single document: findOne(). Default: false", "checkbox", [], false);
		this.addProperty("filter", "string", "", "", "Filter", "Mongo query expression. Will be passed as first argument to find() or findOne(). Can contain route params in form \":paramName\". String \"Meteor.userId()\" is treated in special way: at the client it remains `Meteor.userId()` but at the server (in publication) it will be converted to `this.userId`.", "json", [], false);
		this.addProperty("options", "string", "", "", "Options", "Options parameter passed as second argument to find() or findOne().", "json", [], false);
		this.addProperty("related_queries", "base_array", "subscription", null, "Related queries", "Page which subscribes to this query will also subscribe to related queries (for example: this is useful if you are using transform function that uses data from other collection).", "", [], false);
		this.addProperty("variables", "base_array", "variable", null, "Variables", "Filter and Options object can contain variable (string value starting with \"%\" sign is treated as variable). You can specify value for each variable here (value can also be a function).", "", [], false);
	}

	updateRefs(oldName, newName) {
		var kitchen = this.getRoot();
		if (!kitchen) {
			return;
		}

		kitchen.findObject(obj => {
			obj._properties.map(property => {
				if (property.subType == "query_name" && obj[property.name] && obj[property.name] == oldName) {
					obj[property.name] = newName;
				}
			});
		});
	}

	extractParams() {
		var filterObject = {};
		try {
			filterObject = JSON.parse(this.filter || "{}");
		} catch (err) {

		}


		var optionsObject = {};
		try {
			optionsObject = JSON.parse(this.options || "{}");
		} catch (err) {

		}

		var filterStrings = extractStringsFromObject(filterObject);
		var optionsStrings = extractStringsFromObject(optionsObject);

		var params = [];

		filterStrings.map(str => {
			if (str != "" && (str[0] == ":" || str[0] == "#")) {
				str = str.slice(1);
				if (params.indexOf(str) < 0) {
					params.push(str);
				}
			}
		});

		optionsStrings.map(str => {
			if (str != "" && (str[0] == ":" || str[0] == "#")) {
				str = str.slice(1);
				if (params.indexOf(str) < 0) {
					params.push(str);
				}
			}
		});

		return params;
	}

}

KQuery.getClassName = function () { return "query"; };

ClassKitchen.addClass(KQuery);

// ----------------------------------------------------------------------------

class KSubscription extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("name", "string", "", "", "Publication name", "Publication name (Query name)", "text", [], false);
		this.addProperty("params", "base_array", "param", null, "Params", "Params", "", [], false);
	}

}

KSubscription.getClassName = function () { return "subscription"; };

ClassKitchen.addClass(KSubscription);

// ----------------------------------------------------------------------------

class KComponent extends KNamedObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.addProperty("type", "string", "", "component", "Type", "Component type name.", "text", [], true);
		this.addProperty("custom_template", "string", "", "", "Custom template", "Custom html and js template filename (without extension). Path is relative to input JSON file.", "text", [], false);
		this.addProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.addProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.addProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.addProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.addProperty("title", "string", "", "", "Title", "Component title", "text", [], false);
		this.addProperty("title_icon_class", "string", "", "", "Title icon class", "If present, \"span\" with this class name will be added to title (if title is set)", "text", [], false);
		this.addProperty("events_code", "string", "", "", "Events", "Content of Template.TEMPLATE_NAME.events({ ... });", "javascript", [], false);
		this.addProperty("helpers_code", "string", "", "", "Helpers", "Content of Template.TEMPLATE_NAME.helpers({ ... });", "javascript", [], false);
		this.addProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.addProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.addProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.addProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.addProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.addProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.addProperty("template_created_code", "string", "", "", "Template created code", "Code to be executed when template is created (before it is rendered)", "javascript", [], false);
		this.addProperty("template_rendered_code", "string", "", "", "Template rendered code", "Code to be executed when template is rendered", "javascript", [], false);
		this.addProperty("template_destroyed_code", "string", "", "", "Template destroyed code", "Code to be executed before template is destroyed", "javascript", [], false);
	}

	routeParamNames() {
		var routeParams = [];
		if (this.isInheritedFrom("page")) {
			if (this.route_params) {
				this.route_params.map(paramName => {
					routeParams.push(paramName);
				});
			}
		} else {
			var parentPage = this.getParentOfType("page");
			if (parentPage) {
				return parentPage.routeParamNames();
			}
		}
		return routeParams;
	}

}

KComponent.getClassName = function () { return "component"; };

ClassKitchen.addClass(KComponent);

// ----------------------------------------------------------------------------

class KParam extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("name", "string", "", "", "Name", "Parameter name", "text", [], true);
		this.addProperty("value", "string", "", "", "Value", "Parameter value", "text", [], true);
	}

}

KParam.getClassName = function () { return "param"; };

ClassKitchen.addClass(KParam);

// ----------------------------------------------------------------------------

class KVariable extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("name", "string", "", "", "Name", "Variable name", "text", [], true);
		this.addProperty("value", "string", "", "", "Value", "Variable value", "text", [], true);
		this.addProperty("query_name", "string", "query_name", "", "Query name", "External query name. Set field name to \"Value\" field of this variable and result will be array of values from that field (pluck)", "select_query", [], false);
	}

}

KVariable.getClassName = function () { return "variable"; };

ClassKitchen.addClass(KVariable);

// ----------------------------------------------------------------------------

class KAction extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("name", "string", "", "", "Name", "Action name", "text", [], true);
		this.addProperty("title", "string", "", "", "Title", "Action title", "text", [], false);
		this.addProperty("icon_class", "string", "", "", "Icon class", "Icon class", "text", [], false);
		this.addProperty("route", "string", "route_name", "", "Route name", "Redirect to route", "select_route", [], false);
		this.addProperty("route_params", "base_array", "param", null, "Route params", "Parameters to be passed to \"route\"", "", [], false);
		this.addProperty("action_code", "string", "", "", "Action Code", "Custom code to execute", "javascript", [], false);
		this.addProperty("rule", "string", "", "", "Rule", "JavaScript expression. Action will be hidden in UI if expression evaluates false", "javascript", [], false);
	}

}

KAction.getClassName = function () { return "action"; };

ClassKitchen.addClass(KAction);

// ----------------------------------------------------------------------------

class KServerSideRoute extends KNamedObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.addProperty("route_params", "base_array", "string", null, "Route params", "Route params to be passed via URL", "stringlist", [], false);
		this.addProperty("path", "string", "", "", "Path", "Route path. Not mandatory: if ommited path is constructed from route name and route_params.", "text", [], false);
		this.addProperty("source_file", "string", "", "", "Source file", "path to external file containing route action code (relative to input JSON file).", "text", [], false);
		this.addProperty("source_content", "string", "", "", "Source content", "path to external file containing route action code (relative to input JSON file).", "javascript", [], false);
	}

}

KServerSideRoute.getClassName = function () { return "server_side_route"; };

ClassKitchen.addClass(KServerSideRoute);

// ----------------------------------------------------------------------------

class KPage extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "page", "Type", "Component type name.", "static", [], false);
		var template_choice_items = ["", "page_empty", "page_subcontent_sidenav", "page_subcontent_sidenav_collapse", "page_subcontent_tabnav", "page_subcontent_tabnav_2col", "page_subcontent_navbar", "page_subcontent_navbar_top", "change_pass", "create_password", "forgot_password", "login", "logout", "register", "reset_password", "verify_email"];
		this.addProperty("template", "string", "", "", "Template", "Built-in html and js template file name (without extension) contained in kitchen templates directory.", "select", template_choice_items, false);
		this.updateProperty("custom_template", "string", "", "", "Custom template", "Custom html and js template filename (without extension). Path is relative to input JSON file.", "text", [], false);
		this.addProperty("html", "string", "", "", "HTML code", "Custom HTML code (for \"blaze\" applications only - ignored if \"react\" is used)", "html", [], false);
		this.addProperty("js", "string", "", "", "JS code", "Custom JS code (for \"blaze\" applications only - ignored if \"react\" is used)", "javascript", [], false);
		this.addProperty("jsx", "string", "", "", "JSX code", "Custom JSX code (for \"react\" applications only - ignored if \"blaze\" is used)", "javascript", [], false);
		this.addProperty("gasoline", "gasoline", "", null, "Generic Template", "Input for gasoline-turbo (generates both blaze and react from the same input)", "", [], false);
		this.addProperty("use_gasoline", "bool", "", false, "Use visual designer", "If set to true, generator will ignore HTML, JS and JSX members, and will use gasoline-turbo to build template(s)", "checkbox", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("title", "string", "", "", "Title", "Component title", "text", [], false);
		this.updateProperty("title_icon_class", "string", "", "", "Title icon class", "If present, \"span\" with this class name will be added to title (if title is set)", "text", [], false);
		this.updateProperty("events_code", "string", "", "", "Events", "Content of Template.TEMPLATE_NAME.events({ ... });", "javascript", [], false);
		this.updateProperty("helpers_code", "string", "", "", "Helpers", "Content of Template.TEMPLATE_NAME.helpers({ ... });", "javascript", [], false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("template_created_code", "string", "", "", "Template created code", "Code to be executed when template is created (before it is rendered)", "javascript", [], false);
		this.updateProperty("template_rendered_code", "string", "", "", "Template rendered code", "Code to be executed when template is rendered", "javascript", [], false);
		this.updateProperty("template_destroyed_code", "string", "", "", "Template destroyed code", "Code to be executed before template is destroyed", "javascript", [], false);
		this.addProperty("user_defined_template", "bool", "", false, "User defined template", "If set to true then built-in template will be ignored and \"html\", \"js\" and \"jsx\" properties will be used.", "checkbox", [], false);
		this.addProperty("meta_description", "string", "", "", "Meta Description", "Meta description", "text", [], false);
		this.addProperty("meta_title", "string", "", "", "Meta Title", "Head title tag and meta title", "text", [], false);
		this.addProperty("text", "string", "", "", "Text", "Text to be inserted into page", "textarea", [], false);
		this.addProperty("background_image", "string", "", "", "Background Image URL", "Background image URL", "text", [], false);
		this.addProperty("container_class", "string", "", "", "Container class", "Class to be added to page container. Example: \"container-fluid\". Default \"container\".", "text", [], false);
		this.addProperty("route_params", "base_array", "string", null, "Route params", "Route params to be passed via URL", "stringlist", [], false);
		this.addProperty("close_route", "string", "route_name", "", "Close button route", "If specified, page will have close button routing to this route", "select_route", [], false);
		this.addProperty("close_route_params", "base_array", "param", null, "Close button route params", "Params to be passed to close_route", "", [], false);
		this.addProperty("back_route", "string", "route_name", "", "Back button route", "Route name of page to navigate on back button click. Mandatory field for back button to appear", "select_route", [], false);
		this.addProperty("back_route_params", "base_array", "param", null, "Back button route params", "Route params to be passed to \"back_route\"", "", [], false);
		this.addProperty("roles", "base_array", "string", null, "Roles", "User roles allowed to access this page", "stringlist", [], false);
		this.addProperty("pages", "base_array", "page", null, "Subpages", "Subpages", "", [], false);
		this.addProperty("related_queries", "base_array", "subscription", null, "Related queries", "List of additional queries (publications) to subscribe", "", [], false);
		this.addProperty("force_yield_subpages", "bool", "", false, "Force yield subpages", "Deprecated. Please use \"render_subpages\" property instead.", "checkbox", [], false);
		var render_subpages_choice_items = ["auto", "never", "always"];
		this.addProperty("render_subpages", "string", "", "", "Render subpages", "Should page render subpages in \"subcontent\" area? \"auto\" = only if page has menu pointing to subpages. \"never\" - never, \"always\" - always", "select", render_subpages_choice_items, false);
		this.addProperty("zoneless", "bool", "", false, "Zoneless", "Deprecated - will be removed soon. For applications with user account system: make this page visible for both authenticated and non-authenticated users", "checkbox", [], false);
		this.addProperty("parent_layout", "bool", "", false, "Parent layout", "If set to true parent page will be used as layoutTemplate. Default: false", "checkbox", [], false);
		this.addProperty("layout_template", "string", "", "", "Layout template name", "Custom layout template name", "text", [], false);
		this.addProperty("controller_before_action", "string", "", "", "Controller onBeforeAction", "code to execute inside route controller \"onBeforeAction\" hook", "text", [], false);
		this.addProperty("controller_after_action", "string", "", "", "Controller onAfterAction", "code to execute inside route controller \"onBeforeAction\" hook", "text", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("dest_selector");
		this.removeProperty("dest_position");
		this.removeProperty("show_condition");
	}

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
			if (parent._className == "page") {
				route = parent.name + "." + route;
			}
		});
		return route;
	}

	getURL(newName) {
		var name = newName || this.name;
		var parentURL = "";
		var parentPage = this.parentPage();
		if (parentPage) {
			parentURL = parentPage.getURL() || "/";
			if (parentURL[parentURL.length - 1] != "/") {
				parentURL += "/";
			}
		}
		parentURL = parentURL || "/";

		var url = "";
		if (this.name == "home_free" || this.name == "home_public" || this.name == "home")
			url = "/";
		else {
			if (this.name == "home_private")
				url = "/home_private";
			else
				url = parentURL + this.name;
		}

		this.route_params.map(param => {
			if (url[url.length - 1] != "/") {
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
		if (!kitchen) {
			return;
		}
		kitchen.findObject(obj => {
			obj._properties.map(property => {
				if (property.subType == "route_name" && obj[property.name]) {
					// update pointers to this route
					if (obj[property.name] == oldRoute) {
						obj[property.name] = newRoute;
					}
					// update pointers to child routes
					if (obj[property.name].indexOf(oldRoute + ".") == 0) {
						obj[property.name] = obj[property.name].replace(new RegExp("^" + oldRoute + "."), newRoute + ".");
					}
				}
			});
		});
	}

}

KPage.getClassName = function () { return "page"; };

ClassKitchen.addClass(KPage);

// ----------------------------------------------------------------------------

class KZone extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("type", "string", "", "zone", "Type", "Component type name.", "static", [], false);
		this.addProperty("html", "string", "", "", "HTML code", "Custom HTML code (for \"blaze\" applications only - ignored if \"react\" is used)", "html", [], false);
		this.addProperty("js", "string", "", "", "JS code", "Custom JS code (for \"blaze\" applications only - ignored if \"react\" is used)", "javascript", [], false);
		this.addProperty("jsx", "string", "", "", "JSX code", "Custom JSX code (for \"react\" applications only - ignored if \"blaze\" is used)", "javascript", [], false);
		this.addProperty("gasoline", "gasoline", "", null, "Generic Template", "Input for gasoline-turbo (generates both blaze and react from the same input)", "", [], false);
		this.addProperty("use_gasoline", "bool", "", false, "Use visual designer", "If set to true, generator will ignore HTML, JS and JSX members, and will use gasoline-turbo to build template(s)", "checkbox", [], false);
		this.addProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.addProperty("events_code", "string", "", "", "Events", "Content of Template.TEMPLATE_NAME.events({ ... });", "javascript", [], false);
		this.addProperty("helpers_code", "string", "", "", "Helpers", "Content of Template.TEMPLATE_NAME.helpers({ ... });", "javascript", [], false);
		this.addProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.addProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.addProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.addProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.addProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.addProperty("template_created_code", "string", "", "", "Template created code", "Code to be executed when template is created (before it is rendered)", "javascript", [], false);
		this.addProperty("template_rendered_code", "string", "", "", "Template rendered code", "Code to be executed when template is rendered", "javascript", [], false);
		this.addProperty("template_destroyed_code", "string", "", "", "Template destroyed code", "Code to be executed before template is destroyed", "javascript", [], false);
		this.addProperty("user_defined_template", "bool", "", false, "User defined template", "If set to true then built-in template will be ignored and \"html\", \"js\" and \"jsx\" properties will be used.", "checkbox", [], false);
		this.addProperty("background_image", "string", "", "", "Background Image URL", "Background image URL", "text", [], false);
		this.addProperty("container_class", "string", "", "", "Container class", "Class to be added to page container. Example: \"container-fluid\". Default \"container\".", "text", [], false);
		this.addProperty("pages", "base_array", "page", null, "Subpages", "Subpages", "", [], false);
		this.addProperty("related_queries", "base_array", "subscription", null, "Related queries", "List of additional queries (publications) to subscribe", "", [], false);
		var render_subpages_choice_items = ["auto", "never", "always"];
		this.addProperty("render_subpages", "string", "", "", "Render subpages", "Should page render subpages in \"subcontent\" area? \"auto\" = only if page has menu pointing to subpages. \"never\" - never, \"always\" - always", "select", render_subpages_choice_items, false);
		this.addProperty("layout_template", "string", "", "", "Layout template name", "Custom layout template name", "text", [], false);
		var layout_choice_items = ["", "navbar", "sidenav", "landing", "admin", "sticky_footer", "empty"];
		this.addProperty("layout", "string", "", "", "Layout", "Built-in layout template name: \"navbar\", \"sidenav\", \"sticky_footer\" or \"empty\". Default: \"navbar\"", "select", layout_choice_items, false);
		this.addProperty("default_route", "string", "route_name", "", "Default route", "\"home\" route for this zone.", "select_route", [], false);
		this.addProperty("navbar_class", "string", "", "", "Navbar Class", "CSS class name to be added to navbar.", "text", [], false);
		this.addProperty("footer_class", "string", "", "", "Footer Class", "CSS class name to be added to footer.", "text", [], false);
	}

}

KZone.getClassName = function () { return "zone"; };

ClassKitchen.addClass(KZone);

// ----------------------------------------------------------------------------

class KFilePair extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("source", "string", "", "", "Source file", "Source file to copy. Can be path to local file relative to input JSON or URL (starts with \"http://\" or \"https://\").", "text", [], true);
		this.addProperty("source_content", "string", "", "", "Source content", "If source file is not specified, this content will be written into destination file.", "textarea", [], false);
		this.addProperty("dest", "string", "", "", "Destination file", "Destination file. You can use directory aliases: OUTPUT_DIR, CLIENT_DIR, CLIENT_LIB_DIR, CLIENT_COMPONENTS_DIR, CLIENT_STYLES_DIR, CLIENT_STYLES_DEFAULT_DIR, CLIENT_STYLES_THEME_DIR, CLIENT_VIEWS_DIR, CLIENT_VIEWS_NOT_FOUND_DIR, CLIENT_VIEWS_LOADING_DIR, LIB_DIR, SETTINGS_DIR, BOTH_DIR, BOTH_LIB_DIR, BOTH_COLLECTIONS_DIR, PUBLIC_DIR, PUBLIC_IMAGES_DIR, PUBLIC_FONTS_DIR, PRIVATE_DIR, SERVER_DIR, SERVER_LIB_DIR, SERVER_COLLECTIONS_DIR, SERVER_PUBLISH_DIR, SERVER_ROUTER_DIR, SERVER_METHODS_DIR", "text", [], true);
	}

}

KFilePair.getClassName = function () { return "file_pair"; };

ClassKitchen.addClass(KFilePair);

// ----------------------------------------------------------------------------

class KPackages extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("meteor", "base_array", "string", null, "Meteor", "List of meteor packages. Packages listed here will be added to your application.", "stringlist", [], false);
		this.addProperty("npm", "base_array", "string", null, "NPM", "List of npm packages.", "stringlist", [], false);
		this.addProperty("mrt", "base_array", "string", null, "Meteorite", "List of meteorite packages (deprecated)", "stringlist", [], false);
	}

}

KPackages.getClassName = function () { return "packages"; };

ClassKitchen.addClass(KPackages);

// ----------------------------------------------------------------------------

class KApplication extends KNamedObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("title", "string", "", "", "Title", "Application title", "text", [], false);
		this.addProperty("meta_description", "string", "", "", "Meta Description", "Default meta_description for pages without meta_description", "text", [], false);
		this.addProperty("meta_title", "string", "", "", "Meta Title", "Default meta_title for pages without meta_title", "text", [], false);
		var templating_choice_items = ["blaze", "react"];
		this.addProperty("templating", "string", "", "blaze", "Templating framework", "\"blaze\" or \"react\". Default: \"blaze\". Note: \"react\" is not fully implemented yet.", "select", templating_choice_items, false);
		var frontend_choice_items = ["bootstrap3", "semantic-ui", "materialize", "aframe"];
		this.addProperty("frontend", "string", "", "bootstrap3", "Frontend", "\"bootstrap3\", \"semantic-ui\", \"materialize\" or \"aframe\". Default: \"bootstrap3\". \"materialize\" and \"aframe\" are not fully implemented yet. \"aframe\" works only with \"react\".", "select", frontend_choice_items, false);
		var theme_choice_items = ["bootswatch-amelia", "bootswatch-cerulean", "bootswatch-cosmo", "bootswatch-cyborg", "bootswatch-cyborg-darkly", "bootswatch-darkly", "bootswatch-flatly", "bootswatch-journal", "bootswatch-lumen", "bootswatch-paper", "bootswatch-readable", "bootswatch-sandstone", "bootswatch-simplex", "bootswatch-slate", "bootswatch-solar", "bootswatch-spacelab", "bootswatch-superhero", "bootswatch-united", "bootswatch-yeti", "flat-ui"];
		this.addProperty("theme", "string", "", "", "Theme", "Visual theme name. With \"bootstrap\" frontend theme can be \"flat-ui\" or one of bootswatch themes: \"bootswatch-amelia\", \"bootswatch-cerulean\", \"bootswatch-cosmo\", \"bootswatch-cyborg\", \"bootswatch-darkly\", \"bootswatch-flatly\", \"bootswatch-journal\", \"bootswatch-lumen\", \"bootswatch-paper\", \"bootswatch-readable\", \"bootswatch-sandstone\", \"bootswatch-simplex\", \"bootswatch-slate\", \"bootswatch-solar\", \"bootswatch-spacelab\", \"bootswatch-superhero\", \"bootswatch-united\", \"bootswatch-yeti\"", "text", theme_choice_items, false);
		this.addProperty("animate", "bool", "", false, "Animate", "If set to true, animate.css will be included and all elements with \"animated\" css class will be animated when they reach viewport (on scroll and on resize)", "checkbox", [], false);
		this.addProperty("footer_text", "string", "", "", "Footer text", "Text to show in page footer", "text", [], false);
		this.addProperty("roles", "base_array", "string", null, "User roles", "List of user roles for applications with user account system. There are two predefined roles \"nobody\" and \"owner\" (see collection object for more info).", "stringlist", [], false);
		this.addProperty("default_role", "string", "", "", "Default role for new users", "Default role for new users", "text", [], false);
		this.addProperty("use_collection2", "bool", "", false, "Use Collection2", "Experimental feature. If set to true, schema will be generated and Collection2 package will be used for collections. Default: false", "checkbox", [], false);
		this.addProperty("collections", "base_array", "collection", null, "Collections", "Mongo database collections", "", [], false);
		this.addProperty("queries", "base_array", "query", null, "Queries", "List of database queries (publications).", "", [], false);
		this.addProperty("free_zone", "zone", "", null, "Free zone", "Free zone (for application without user account system)", "", [], false);
		this.addProperty("public_zone", "zone", "", null, "Public zone", "Public zone (for app with user account system). Pages inside this zone are accessible only for non-authenticeted users.", "", [], false);
		this.addProperty("private_zone", "zone", "", null, "Private zone", "Private zone (for app with user account system). Pages inside this zone are accessible only for authenticeted users.", "", [], false);
		this.addProperty("login_with_password", "bool", "", true, "Login with password", "Allow login with password (for app with user account system only). Default: true", "checkbox", [], false);
		this.addProperty("send_verification_email", "bool", "", false, "Send verification e-mail", "After user account registration, e-mail with verification link will be sent to user. Default: false", "checkbox", [], false);
		this.addProperty("login_with_google", "bool", "", false, "Login with Google", "Allow OAuth login with google account (for app with user account system only). Default: false", "checkbox", [], false);
		this.addProperty("login_with_github", "bool", "", false, "Login with GitHub", "Allow OAuth login with github account (for app with user account system only). Default: false", "checkbox", [], false);
		this.addProperty("login_with_linkedin", "bool", "", false, "Login with LinkedIn", "Allow OAuth login with linkedin account (for app with user account system only). Default: false", "checkbox", [], false);
		this.addProperty("login_with_facebook", "bool", "", false, "Login with Facebook", "Allow OAuth login with facebook account (for app with user account system only). Default: false", "checkbox", [], false);
		this.addProperty("login_with_twitter", "bool", "", false, "Login with Twitter", "Allow OAuth login with twitter account (for app with user account system only). Default: false", "checkbox", [], false);
		this.addProperty("login_with_meteor", "bool", "", false, "Login with Meteor", "Allow OAuth login with meteor developer account (for app with user account system only). Default: false", "checkbox", [], false);
		this.addProperty("login_with_auth0", "bool", "", false, "Login with Auth0", "Allow OAuth login with Auth0 (for app with user account system only). Default: false", "checkbox", [], false);
		this.addProperty("server_startup_code", "string", "", "", "Server startup code", "javascript code to execute at server startup", "javascript", [], false);
		this.addProperty("client_startup_code", "string", "", "", "Client startup code", "javascript code to execute at client startup", "javascript", [], false);
		this.addProperty("on_user_created_code", "string", "", "", "On user created code", "javascript code to execute when new user is created (Accounts.onCreateUser)", "javascript", [], false);
		this.addProperty("on_user_logged_code", "string", "", "", "On user logged code", "javascript code to execute when user is logged in (Accounts.onLogin)", "javascript", [], false);
		this.addProperty("global_on_rendered_code", "string", "", "", "Global onRendered code", "javascript code to execute when any page is rendered", "javascript", [], false);
		this.addProperty("server_startup_source_file", "string", "", "", "Server startup source file", "File that contains javascript code to execute at server startup (relative to input file)", "text", [], false);
		this.addProperty("client_startup_source_file", "string", "", "", "Client startup source file", "File that contains javascript code to execute at client startup (relative to input file)", "text", [], false);
		this.addProperty("on_user_created_source_file", "string", "", "", "On user created source file", "File that contains javascript code to execute when new user is created (relative to input file)", "text", [], false);
		this.addProperty("on_user_logged_source_file", "string", "", "", "On user logged source file", "File that contains javascript code to execute when user is logged in (relative to input file)", "text", [], false);
		this.addProperty("server_startup_imports", "base_array", "string", null, "Import modules to server startup", "list of modules to import into server startup file. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.addProperty("client_startup_imports", "base_array", "string", null, "Import modules to client startup", "list of modules to import into client startup file. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.addProperty("mobile_config", "string", "", "", "mobile-config.js", "If non-empty: will be written to mobile-config.js in app root", "javascript", [], false);
		this.addProperty("stylesheet", "string", "", "", "CSS/LESS stylesheet", "CSS/LESS stylesheet. If non-empty, will be written to CLIENT_STYLES_DIR/user_styles.less", "css", [], false);
		this.addProperty("server_side_routes", "base_array", "server_side_route", null, "Server side routes", "List of server side routes.", "", [], false);
		this.addProperty("copy_files", "base_array", "file_pair", null, "Copy files", "List of files to copy into destination directory. You can use directory aliases. See <a href=\"#file_pair\">file_pair</a> for more details.", "", [], false);
		this.addProperty("packages", "packages", "", null, "Packages", "List of additional meteor and meteorite packages that will be automatically added by generator", "", [], false);
		this.addProperty("router_config", "object", "", null, "Router configuration", "Optional parameter passed to Router.config()", "json", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

	getSQL() {
		if (!this.collections) {
			return "";
		}

		var sql = "";
		var sqlTables = "";
		this.collections.map(function (collection) {
			if (sqlTables) {
				sqlTables += "\n";
			}
			sqlTables += collection.getSQL();
		});

		sql += sqlTables;

		return sql;
	}

	getGraphQL() {
		if (!this.collections) {
			return "";
		}

		var gql = "";
		var gqlTypes = "";
		this.collections.map(function (collection) {
			if (gqlTypes) {
				gqlTypes += "\n";
			}

			gqlTypes += collection.getGraphQL();

			gqlTypes += "\n";
		});

		gql += gqlTypes;

		return gql;
	}

	usesAccounts() {
		var usesAccounts = false;
		if (this.public_zone && this.public_zone.pages.length) usesAccounts = true;
		if (this.private_zone && this.private_zone.pages.length) usesAccounts = true;
		return usesAccounts;
	}

	getOverview(tableClass) {
		var overview = "";

		var addRow = function (title, value) {
			overview += "<tr><td><b>" + title + "</b></td><td>" + value + "</td></tr>";
		}

		overview += "<table class=\"" + tableClass + "\">";

		var userAccounts = this.usesAccounts();
		addRow("User accounts", userAccounts ? "Yes" : "No");
		if (userAccounts) {
			var loginWith = "";
			if (this.login_with_password) { loginWith += loginWith ? ", " : ""; loginWith += "Password"; }
			if (this.login_with_google) { loginWith += loginWith ? ", " : ""; loginWith += "Google"; }
			if (this.login_with_github) { loginWith += loginWith ? ", " : ""; loginWith += "Github"; }
			if (this.login_with_linkedin) { loginWith += loginWith ? ", " : ""; loginWith += "LinkedIn"; }
			if (this.login_with_facebook) { loginWith += loginWith ? ", " : ""; loginWith += "Facebook"; }
			if (this.login_with_twitter) { loginWith += loginWith ? ", " : ""; loginWith += "Twitter"; }
			if (this.login_with_meteor) { loginWith += loginWith ? ", " : ""; loginWith += "Meteor"; }

			if (!loginWith) {
				loginWith = "Password";
			}

			addRow("Login with", loginWith);
		}

		var collections = "";
		if (this.collections) {
			this.collections.map(function (collection) {
				collections += collections ? ", " : "";
				collections += collection.name || "(noname)";
			});
		}
		addRow("Database collections", collections || "-");

		var freePages = "";
		if (this.free_zone && this.free_zone.pages) {
			this.free_zone.pages.map(function (page) {
				freePages += freePages ? ", " : "";
				freePages += page.name || "(noname)";
			});
		}
		addRow(userAccounts ? "Pages in free zone" : "Pages", freePages || "-");


		if (userAccounts) {
			var publicPages = "";
			if (this.public_zone && this.public_zone.pages) {
				this.public_zone.pages.map(function (page) {
					publicPages += publicPages ? ", " : "";
					publicPages += page.name || "(noname)";
				});
			}
			addRow("Pages in public zone", publicPages || "-");

			var privatePages = "";
			if (this.private_zone && this.private_zone.pages) {
				this.private_zone.pages.map(function (page) {
					privatePages += privatePages ? ", " : "";
					privatePages += page.name || "(noname)";
				});
			}
			addRow("Pages in private zone", privatePages || "-");
		}

		overview += "</table>";

		return overview;
	}

}

KApplication.getClassName = function () { return "application"; };

ClassKitchen.addClass(KApplication);

// ----------------------------------------------------------------------------

class KCustomComponent extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "custom_component", "Type", "Component type name.", "static", [], false);
		this.updateProperty("custom_template", "string", "", "", "Custom template", "Custom html and js template filename (without extension). Path is relative to input JSON file.", "text", [], false);
		this.addProperty("html", "string", "", "", "HTML code", "Custom HTML code (for \"blaze\" applications only - ignored if \"react\" is used)", "html", [], false);
		this.addProperty("js", "string", "", "", "JS code", "Custom JS code (for \"blaze\" applications only - ignored if \"react\" is used)", "javascript", [], false);
		this.addProperty("jsx", "string", "", "", "JSX code", "Custom JSX code (for \"react\" applications only - ignored if \"blaze\" is used)", "javascript", [], false);
		this.addProperty("gasoline", "gasoline", "", null, "Generic Template", "Input for gasoline-turbo (generates both blaze and react from the same input)", "", [], false);
		this.addProperty("use_gasoline", "bool", "", false, "Use visual designer", "If set to true, generator will ignore HTML, JS and JSX members, and will use gasoline-turbo to build template(s)", "checkbox", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("class");
		this.removeProperty("title");
		this.removeProperty("title_icon_class");
		this.removeProperty("events_code");
		this.removeProperty("helpers_code");
		this.removeProperty("template_created_code");
		this.removeProperty("template_rendered_code");
		this.removeProperty("template_destroyed_code");
	}

}

KCustomComponent.getClassName = function () { return "custom_component"; };

ClassKitchen.addClass(KCustomComponent);

// ----------------------------------------------------------------------------

class KMenuItem extends KNamedObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("title", "string", "", "", "Title", "Item title as appears in menu", "text", [], false);
		this.addProperty("route", "string", "route_name", "", "Route", "Route name of destination page", "select_route", [], false);
		this.addProperty("route_params", "base_array", "param", null, "Route params", "Parameters to be passed to \"route\"", "", [], false);
		this.addProperty("url", "string", "", "", "URL", "URL (for external links. You can use only one of \"route\" or \"url\" properties, not both)", "text", [], false);
		this.addProperty("target", "string", "", "", "Set HTML target attr value", "Anchor \"target\" attribute value e.g. \"_blank\"", "text", [], false);
		this.addProperty("class", "string", "", "", "Class", "CSS class name to be added to item `li` element", "text", [], false);
		this.addProperty("items_container_class", "string", "", "", "Items container class", "CSS class for div containing subitems.", "text", [], false);
		this.addProperty("icon_class", "string", "", "", "Icon class", "If present, generator will add `span` into menu item and assign this CSS class to it", "text", [], false);
		this.addProperty("items", "base_array", "menu_item", null, "Sub items", "Subitems", "", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

}

KMenuItem.getClassName = function () { return "menu_item"; };

ClassKitchen.addClass(KMenuItem);

// ----------------------------------------------------------------------------

class KMenu extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "menu", "Type", "Component type name.", "static", [], false);
		var template_choice_items = ["menu", "menu_buttons"];
		this.addProperty("template", "string", "", "", "Template", "Built-in html and js template file name (without extension) contained in kitchen templates directory.", "select", template_choice_items, false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("title", "string", "", "", "Title", "Component title", "text", [], false);
		this.updateProperty("title_icon_class", "string", "", "", "Title icon class", "If present, \"span\" with this class name will be added to title (if title is set)", "text", [], false);
		this.updateProperty("events_code", "string", "", "", "Events", "Content of Template.TEMPLATE_NAME.events({ ... });", "javascript", [], false);
		this.updateProperty("helpers_code", "string", "", "", "Helpers", "Content of Template.TEMPLATE_NAME.helpers({ ... });", "javascript", [], false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.updateProperty("template_created_code", "string", "", "", "Template created code", "Code to be executed when template is created (before it is rendered)", "javascript", [], false);
		this.updateProperty("template_rendered_code", "string", "", "", "Template rendered code", "Code to be executed when template is rendered", "javascript", [], false);
		this.updateProperty("template_destroyed_code", "string", "", "", "Template destroyed code", "Code to be executed before template is destroyed", "javascript", [], false);
		this.addProperty("items", "base_array", "menu_item", null, "Sub items", "Menu items.", "", [], false);
		this.addProperty("items_container_class", "string", "", "", "Items container class", "CSS class for div containing menu items.", "text", [], false);
		this.addProperty("scroll_spy_selector", "string", "", "", "ScrollSpy selector", "\"scrollspy\" selector for menus with anchor links, usually \"body\".", "text", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
	}

}

KMenu.getClassName = function () { return "menu"; };

ClassKitchen.addClass(KMenu);

// ----------------------------------------------------------------------------

class KJumbotron extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "jumbotron", "Type", "Component type name.", "static", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("title", "string", "", "", "Title", "Component title", "text", [], false);
		this.updateProperty("title_icon_class", "string", "", "", "Title icon class", "If present, \"span\" with this class name will be added to title (if title is set)", "text", [], false);
		this.updateProperty("events_code", "string", "", "", "Events", "Content of Template.TEMPLATE_NAME.events({ ... });", "javascript", [], false);
		this.updateProperty("helpers_code", "string", "", "", "Helpers", "Content of Template.TEMPLATE_NAME.helpers({ ... });", "javascript", [], false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.updateProperty("template_created_code", "string", "", "", "Template created code", "Code to be executed when template is created (before it is rendered)", "javascript", [], false);
		this.updateProperty("template_rendered_code", "string", "", "", "Template rendered code", "Code to be executed when template is rendered", "javascript", [], false);
		this.updateProperty("template_destroyed_code", "string", "", "", "Template destroyed code", "Code to be executed before template is destroyed", "javascript", [], false);
		this.addProperty("text", "string", "", "", "Text", "Text to be shown in jumbotron", "textarea", [], false);
		this.addProperty("image_url", "string", "", "", "Image URL", "Background image URL", "text", [], false);
		this.addProperty("button_title", "string", "", "", "Button title", "Jumbotron button title", "text", [], false);
		this.addProperty("button_route", "string", "route_name", "", "Button route", "Destination route name", "select_route", [], false);
		this.addProperty("button_route_params", "base_array", "param", null, "Button route params", "Parameters to be passed to destination route", "", [], false);
		this.addProperty("button_class", "string", "", "", "Button CSS class", "CSS class to be added to jumbotron button", "text", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
	}

}

KJumbotron.getClassName = function () { return "jumbotron"; };

ClassKitchen.addClass(KJumbotron);

// ----------------------------------------------------------------------------

class KForm extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";

		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "form", "Type", "Component type name.", "static", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("title", "string", "", "", "Title", "Component title", "text", [], false);
		this.updateProperty("title_icon_class", "string", "", "", "Title icon class", "If present, \"span\" with this class name will be added to title (if title is set)", "text", [], false);
		this.updateProperty("events_code", "string", "", "", "Events", "Content of Template.TEMPLATE_NAME.events({ ... });", "javascript", [], false);
		this.updateProperty("helpers_code", "string", "", "", "Helpers", "Content of Template.TEMPLATE_NAME.helpers({ ... });", "javascript", [], false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.updateProperty("template_created_code", "string", "", "", "Template created code", "Code to be executed when template is created (before it is rendered)", "javascript", [], false);
		this.updateProperty("template_rendered_code", "string", "", "", "Template rendered code", "Code to be executed when template is rendered", "javascript", [], false);
		this.updateProperty("template_destroyed_code", "string", "", "", "Template destroyed code", "Code to be executed before template is destroyed", "javascript", [], false);
		var mode_choice_items = ["insert", "update", "read_only"];
		this.addProperty("mode", "string", "", "", "Mode", "\"insert\", \"update\" or \"read_only\"", "select", mode_choice_items, true);
		var layout_choice_items = ["default", "horizontal", "inline"];
		this.addProperty("layout", "string", "", "default", "Form layout", "\"default\", \"horizontal\" or \"inline\"", "select", layout_choice_items, false);
		this.addProperty("autofocus", "bool", "", true, "Autofocus", "If set to true, first focusable input element will have \"autofocus\" attribute set", "checkbox", [], false);
		this.addProperty("submit_route", "string", "route_name", "", "Submit route", "Route name of page to navigate after successfull submit. Mandatory field for submit button to appear", "select_route", [], false);
		this.addProperty("cancel_route", "string", "route_name", "", "Cancel route", "Route name of page to navigate on form cancelation. Mandatory field for cancel button to appear", "select_route", [], false);
		this.addProperty("close_route", "string", "route_name", "", "Close route", "Route name of page to navigate when user clicks \"OK\" button in \"read_only\" form. Mandatory field for close button to appear", "select_route", [], false);
		this.addProperty("back_route", "string", "route_name", "", "Back route", "Route name of page to navigate on form back button. Mandatory field for back button to appear", "select_route", [], false);
		this.addProperty("submit_code", "string", "", "", "Submit code", "Custom code to execute on form submit", "javascript", [], false);
		this.addProperty("cancel_code", "string", "", "", "Cancel code", "Custom code to execute on form cancel", "javascript", [], false);
		this.addProperty("submit_button_title", "string", "", "", "Submit button title", "Text to show in submit button, default \"Save\"", "text", [], false);
		this.addProperty("cancel_button_title", "string", "", "", "Cancel button title", "Text to show in cancel button, default \"Cancel\"", "text", [], false);
		this.addProperty("close_button_title", "string", "", "", "Close button title", "Text to show in close button, default \"OK\"", "text", [], false);
		this.addProperty("submit_route_params", "base_array", "param", null, "Submit route params", "Route params to be passed to \"submit_route\"", "", [], false);
		this.addProperty("cancel_route_params", "base_array", "param", null, "Cancel route params", "Route params to be passed to \"cancel_route\"", "", [], false);
		this.addProperty("close_route_params", "base_array", "param", null, "Close route params", "Route params to be passed to \"close_route\"", "", [], false);
		this.addProperty("back_route_params", "base_array", "param", null, "Back route params", "Route params to be passed to \"back_route\"", "", [], false);
		this.addProperty("fields", "base_array", "field", null, "Fields", "Defainition of form fields. If empty, generator will use fields defined at collection level.", "", [], false);
		this.addProperty("hidden_fields", "base_array", "hidden_field", null, "Hidden fields", "Fields (not shown in a form) that will be automatically written on submit.", "", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
	}

}

KForm.getClassName = function () { return "form"; };

ClassKitchen.addClass(KForm);

// ----------------------------------------------------------------------------

class KDataView extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "data_view", "Type", "Component type name.", "static", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("title", "string", "", "", "Title", "Component title", "text", [], false);
		this.updateProperty("title_icon_class", "string", "", "", "Title icon class", "If present, \"span\" with this class name will be added to title (if title is set)", "text", [], false);
		this.updateProperty("events_code", "string", "", "", "Events", "Content of Template.TEMPLATE_NAME.events({ ... });", "javascript", [], false);
		this.updateProperty("helpers_code", "string", "", "", "Helpers", "Content of Template.TEMPLATE_NAME.helpers({ ... });", "javascript", [], false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.updateProperty("template_created_code", "string", "", "", "Template created code", "Code to be executed when template is created (before it is rendered)", "javascript", [], false);
		this.updateProperty("template_rendered_code", "string", "", "", "Template rendered code", "Code to be executed when template is rendered", "javascript", [], false);
		this.updateProperty("template_destroyed_code", "string", "", "", "Template destroyed code", "Code to be executed before template is destroyed", "javascript", [], false);
		this.addProperty("text_if_empty", "string", "", "No data here", "Text if empty", "Text to show if collection is empty.", "text", [], false);
		this.addProperty("text_if_not_found", "string", "", "", "Text if not found", "Text to show if search string is not found.", "text", [], false);
		this.addProperty("delete_confirmation_message", "string", "", "", "Delete confirmation message", "Text to show in delete confirmation box.", "text", [], false);
		this.addProperty("page_size", "string", "", "0", "Page size", "When page size is > 0 then data is \"paged\" - loaded and displayed page by page (page_size items per page). Default is 0 (no paging - entire dataset is displayed).", "text", [], false);
		this.addProperty("insert_route", "string", "route_name", "", "Insert route", "Route name of page containing insert form", "select_route", [], false);
		this.addProperty("details_route", "string", "route_name", "", "Details route", "Route name of page showing selected item details (usually page containing form of type \"read_only\").", "select_route", [], false);
		this.addProperty("edit_route", "string", "route_name", "", "Edit route", "Route name of page containing edit form. Makes edit_route_params field mandatory in most cases to be functional.", "select_route", [], false);
		this.addProperty("delete_route", "string", "route_name", "", "Delete route", "Route name to execute when user clicks \"delete\". Not mandatory - generator will automatically produce code for delete operation.", "select_route", [], false);
		this.addProperty("insert_route_params", "base_array", "param", null, "Insert route params", "Parameters to be passed to \"insert_route\"", "", [], false);
		this.addProperty("details_route_params", "base_array", "param", null, "Details route params", "Parameters to be passed to \"details_route\"", "", [], false);
		this.addProperty("edit_route_params", "base_array", "param", null, "Edit route params", "Parameters to be passed to \"edit_route\"", "", [], false);
		this.addProperty("delete_route_params", "base_array", "param", null, "Delete route params", "Parameters to be passed to \"delete_route\"", "", [], false);
		this.addProperty("item_actions", "base_array", "action", null, "Custom Item Actions", "Custom item actions (method call and/or redirect to route)", "", [], false);
		this.addProperty("insert_button_title", "string", "", "", "Insert button title", "Insert button title", "text", [], false);
		this.addProperty("details_button_title", "string", "", "", "Details button title", "Details button title", "text", [], false);
		this.addProperty("update_button_title", "string", "", "", "Update button title", "", "text", [], false);
		this.addProperty("delete_button_title", "string", "", "", "Delete button title", "Delete button title", "text", [], false);
		this.addProperty("on_item_clicked_code", "string", "", "", "OnItemClicked code", "Code to execute when item is clicked (before redirect if DetailsRoute is specified)", "javascript", [], false);
		var views_choice_items = ["table", "blog", "list", "cards"];
		this.addProperty("views", "base_array", "string", null, "View styles", "View styles: \"table\", \"list\", \"cards\" or \"blog\". Default: \"table\".", "stringlist", views_choice_items, false);
		this.addProperty("search_engine_style", "bool", "", false, "Search engine style", "If this member is \"true\" then large search box is shown initially. User must enter search string in order to see the data.", "checkbox", [], false);
		this.addProperty("fields", "base_array", "field", null, "Fields", "Definition of table columns. If empty, generator will use fields defined at collection level.", "", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
	}

}

KDataView.getClassName = function () { return "data_view"; };

ClassKitchen.addClass(KDataView);

// ----------------------------------------------------------------------------

class KTreeView extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "tree_view", "Type", "Component type name.", "static", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("title", "string", "", "", "Title", "Component title", "text", [], false);
		this.updateProperty("title_icon_class", "string", "", "", "Title icon class", "If present, \"span\" with this class name will be added to title (if title is set)", "text", [], false);
		this.updateProperty("events_code", "string", "", "", "Events", "Content of Template.TEMPLATE_NAME.events({ ... });", "javascript", [], false);
		this.updateProperty("helpers_code", "string", "", "", "Helpers", "Content of Template.TEMPLATE_NAME.helpers({ ... });", "javascript", [], false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.updateProperty("template_created_code", "string", "", "", "Template created code", "Code to be executed when template is created (before it is rendered)", "javascript", [], false);
		this.updateProperty("template_rendered_code", "string", "", "", "Template rendered code", "Code to be executed when template is rendered", "javascript", [], false);
		this.updateProperty("template_destroyed_code", "string", "", "", "Template destroyed code", "Code to be executed before template is destroyed", "javascript", [], false);
		this.addProperty("item_name_field", "string", "", "", "Item name field", "Collection field shown as folder and item title", "text", [], false);
		this.addProperty("item_type_field", "string", "", "", "Item type field", "Collection field that stores item type. Can be \"dir\" or \"item\".", "text", [], false);
		this.addProperty("collapsed_icon_class", "string", "", "", "Collapsed icon class", "CSS class for collapsed folder icon. Default: \"fa fa-caret-right\"", "text", [], false);
		this.addProperty("expanded_icon_class", "string", "", "", "Expanded icon class", "CSS class for expanded folder icon. Default: \"fa fa-caret-down\"", "text", [], false);
		this.addProperty("item_route", "string", "route_name", "", "Item route", "Navigate to this route when item is clicked", "select_route", [], false);
		this.addProperty("item_route_params", "base_array", "param", null, "Item route params", "Parameters to be passed to \"item_route\"", "", [], false);
		this.addProperty("folder_route", "string", "route_name", "", "Folder route", "Navigate to this route when folder is clicked", "select_route", [], false);
		this.addProperty("folder_route_params", "base_array", "param", null, "Folder route params", "Parameters to be passed to \"folder_route\"", "", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
	}

}

KTreeView.getClassName = function () { return "tree_view"; };

ClassKitchen.addClass(KTreeView);

// ----------------------------------------------------------------------------

class KMarkdown extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "markdown", "Type", "Component type name.", "static", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.addProperty("source", "string", "", "", "Source", "Markdown here", "markdown", [], false);
		this.addProperty("source_file", "string", "", "", "Markdown source file", "Path to file containing markdown (relative to input file)", "text", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
		this.removeProperty("class");
		this.removeProperty("title");
		this.removeProperty("title_icon_class");
		this.removeProperty("events_code");
		this.removeProperty("helpers_code");
		this.removeProperty("template_created_code");
		this.removeProperty("template_rendered_code");
		this.removeProperty("template_destroyed_code");
	}

}

KMarkdown.getClassName = function () { return "markdown"; };

ClassKitchen.addClass(KMarkdown);

// ----------------------------------------------------------------------------

class KDiv extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "div", "Type", "Component type name.", "static", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.addProperty("text", "string", "", "", "Text", "this text will be added into div", "textarea", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
		this.removeProperty("title");
		this.removeProperty("title_icon_class");
		this.removeProperty("events_code");
		this.removeProperty("helpers_code");
		this.removeProperty("template_created_code");
		this.removeProperty("template_rendered_code");
		this.removeProperty("template_destroyed_code");
	}

}

KDiv.getClassName = function () { return "div"; };

ClassKitchen.addClass(KDiv);

// ----------------------------------------------------------------------------

class KSection extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "section", "Type", "Component type name.", "static", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.addProperty("text", "string", "", "", "Text", "this text will be added into section", "textarea", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
		this.removeProperty("title");
		this.removeProperty("title_icon_class");
		this.removeProperty("events_code");
		this.removeProperty("helpers_code");
		this.removeProperty("template_created_code");
		this.removeProperty("template_rendered_code");
		this.removeProperty("template_destroyed_code");
	}

}

KSection.getClassName = function () { return "section"; };

ClassKitchen.addClass(KSection);

// ----------------------------------------------------------------------------

class KEditableContent extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "editable_content", "Type", "Component type name.", "static", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.addProperty("text_if_empty", "string", "", "", "Text if empty", "text to show if no content", "textarea", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
		this.removeProperty("title");
		this.removeProperty("title_icon_class");
		this.removeProperty("events_code");
		this.removeProperty("helpers_code");
		this.removeProperty("query_name");
		this.removeProperty("query_params");
		this.removeProperty("before_subscription_code");
		this.removeProperty("custom_data_code");
		this.removeProperty("components");
		this.removeProperty("template_created_code");
		this.removeProperty("template_rendered_code");
		this.removeProperty("template_destroyed_code");
	}

}

KEditableContent.getClassName = function () { return "editable_content"; };

ClassKitchen.addClass(KEditableContent);

// ----------------------------------------------------------------------------

class KCmsContent extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "cms_content", "Type", "Component type name.", "static", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.addProperty("text_if_empty", "string", "", "", "Text if empty", "", "textarea", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
		this.removeProperty("title");
		this.removeProperty("title_icon_class");
		this.removeProperty("events_code");
		this.removeProperty("helpers_code");
		this.removeProperty("query_name");
		this.removeProperty("query_params");
		this.removeProperty("before_subscription_code");
		this.removeProperty("custom_data_code");
		this.removeProperty("components");
		this.removeProperty("template_created_code");
		this.removeProperty("template_rendered_code");
		this.removeProperty("template_destroyed_code");
	}

}

KCmsContent.getClassName = function () { return "cms_content"; };

ClassKitchen.addClass(KCmsContent);

// ----------------------------------------------------------------------------

class KPlugin extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "", "Type", "Component type name.", "text", [], true);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		this.addProperty("properties", "object", "", null, "Properties", "Custom properties. This object will be provided to plugin processing code.", "json", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
		this.removeProperty("class");
		this.removeProperty("title");
		this.removeProperty("title_icon_class");
		this.removeProperty("events_code");
		this.removeProperty("helpers_code");
		this.removeProperty("template_created_code");
		this.removeProperty("template_rendered_code");
		this.removeProperty("template_destroyed_code");
	}

}

KPlugin.getClassName = function () { return "plugin"; };

ClassKitchen.addClass(KPlugin);

// ----------------------------------------------------------------------------

class KChart extends KComponent {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("type", "string", "", "chart", "Type", "Component type name.", "static", [], false);
		this.updateProperty("imports", "base_array", "string", null, "Import modules", "list of modules to import. Example: `import {X} from \"Y\";` (\"react\" applications only)", "stringlist", [], false);
		this.updateProperty("dest_selector", "string", "", "", "Dest. selector", "destination html element selector. Similar to jQuery selector, but only three simple formats are supported: \"tagname\", \"#element_id\" and \".class_name\".", "text", [], false);
		var dest_position_choice_items = ["", "top", "bottom", "before", "after"];
		this.updateProperty("dest_position", "string", "", "", "Dest. position", "destination position relative to destination element: \"top\", \"bottom\", \"before\" or \"after\". Default: \"bottom\"", "select", dest_position_choice_items, false);
		this.updateProperty("class", "string", "", "", "CSS class", "CSS class name to be added to component", "text", [], false);
		this.updateProperty("query_name", "string", "query_name", "", "Query name", "Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.", "select_query", [], false);
		this.updateProperty("query_params", "base_array", "param", null, "Query params", "Query (publication) params", "", [], false);
		this.updateProperty("before_subscription_code", "string", "", "", "Before Subscription Code", "Code to execute just before component is subscribed to data.", "javascript", [], false);
		this.updateProperty("custom_data_code", "string", "", "", "Custom Data Code", "Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.", "javascript", [], false);
		this.updateProperty("components", "base_array", "component", null, "Components", "Component list", "", [], false);
		this.updateProperty("show_condition", "string", "", "", "Show Condition", "Show component only if condition is satisfied", "javascript", [], false);
		var chart_type_choice_items = ["line", "spline", "step", "area", "area-spline", "area-step", "bar", "scatter", "pie", "donut", "gauge"];
		this.addProperty("chart_type", "string", "", "line", "Chart Type", "", "select", chart_type_choice_items, true);
		this.addProperty("value_field", "string", "", "", "Value field", "", "text", [], false);
		this.addProperty("category_field", "string", "", "", "Category field", "", "text", [], false);
		this.addProperty("time_series_field", "string", "", "", "Time series field", "", "text", [], false);
		this.addProperty("date_format", "string", "", "", "Date format", "", "text", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("custom_template");
		this.removeProperty("title");
		this.removeProperty("title_icon_class");
		this.removeProperty("events_code");
		this.removeProperty("helpers_code");
		this.removeProperty("template_created_code");
		this.removeProperty("template_rendered_code");
		this.removeProperty("template_destroyed_code");
	}

}

KChart.getClassName = function () { return "chart"; };

ClassKitchen.addClass(KChart);

// ----------------------------------------------------------------------------

class KGasoline extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("type", "string", "", "gasoline", "Gasoline Type", "", "static", [], true);
		this.addProperty("templates", "base_array", "gas_template", null, "Templates", "", "", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

}

KGasoline.getClassName = function () { return "gasoline"; };

ClassKitchen.addClass(KGasoline);

// ----------------------------------------------------------------------------

class KGasEvent extends KBaseObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("type", "string", "", "event", "Gasoline Type", "", "static", [], true);
		this.addProperty("event", "string", "", "", "Event name", "", "text", [], false);
		this.addProperty("handler", "string", "", "", "Handler name", "", "text", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

}

KGasEvent.getClassName = function () { return "gas_event"; };

ClassKitchen.addClass(KGasEvent);

// ----------------------------------------------------------------------------

class KGasNode extends KNamedObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
	}

}

KGasNode.getClassName = function () { return "gas_node"; };

ClassKitchen.addClass(KGasNode);

// ----------------------------------------------------------------------------

class KGasText extends KGasNode {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.addProperty("type", "string", "", "text", "Gasoline Type", "", "static", [], true);
		this.addProperty("text", "string", "", "", "Text", "", "textarea", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

}

KGasText.getClassName = function () { return "gas_text"; };

ClassKitchen.addClass(KGasText);

// ----------------------------------------------------------------------------

class KGasElement extends KGasNode {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.addProperty("children", "base_array", "gas_node", null, "Children", "", "", [], false);
	}

}

KGasElement.getClassName = function () { return "gas_element"; };

ClassKitchen.addClass(KGasElement);

// ----------------------------------------------------------------------------

class KGasHandler extends KNamedObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.addProperty("type", "string", "", "handler", "Gasoline Type", "", "static", [], true);
		this.addProperty("code", "string", "", "", "Code", "", "javascript", [], false);
	}

}

KGasHandler.getClassName = function () { return "gas_handler"; };

ClassKitchen.addClass(KGasHandler);

// ----------------------------------------------------------------------------

class KGasHelper extends KNamedObject {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.addProperty("type", "string", "", "helper", "Gasoline Type", "", "static", [], true);
		this.addProperty("code", "string", "", "", "Code", "", "javascript", [], false);
	}

}

KGasHelper.getClassName = function () { return "gas_helper"; };

ClassKitchen.addClass(KGasHelper);

// ----------------------------------------------------------------------------

class KGasTemplate extends KGasElement {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("name", "string", "object_name", "", "Name", "Object name", "text", [], true);
		this.updateProperty("children", "base_array", "gas_node", null, "Children", "", "", [], false);
		this.addProperty("type", "string", "", "template", "Gasoline Type", "", "static", [], true);
		this.addProperty("handlers", "base_array", "gas_handler", null, "Event handlers", "", "", [], false);
		this.addProperty("helpers", "base_array", "gas_helper", null, "Helpers", "", "", [], false);
	}

}

KGasTemplate.getClassName = function () { return "gas_template"; };

ClassKitchen.addClass(KGasTemplate);

// ----------------------------------------------------------------------------

class KGasHtml extends KGasElement {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("children", "base_array", "gas_node", null, "Children", "", "", [], false);
		this.addProperty("type", "string", "", "html", "Gasoline Type", "", "static", [], true);
		this.addProperty("element", "string", "", "div", "Element", "", "static", [], true);
		this.addProperty("selector", "string", "", "", "Selector", "", "text", [], false);
		this.addProperty("attributes", "base_array", "param", null, "Attributes", "", "", [], false);
		this.addProperty("events", "base_array", "gas_event", null, "Events", "", "", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

}

KGasHtml.getClassName = function () { return "gas_html"; };

ClassKitchen.addClass(KGasHtml);

// ----------------------------------------------------------------------------

class KGasLoop extends KGasElement {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("children", "base_array", "gas_node", null, "Children", "", "", [], false);
		this.addProperty("type", "string", "", "loop", "Gasoline Type", "", "static", [], true);
		this.addProperty("dataset", "string", "", "", "Dataset", "", "text", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

}

KGasLoop.getClassName = function () { return "gas_loop"; };

ClassKitchen.addClass(KGasLoop);

// ----------------------------------------------------------------------------

class KGasCondition extends KGasElement {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("children", "base_array", "gas_node", null, "Children", "", "", [], false);
		this.addProperty("type", "string", "", "condition", "Gasoline Type", "", "static", [], true);
		this.addProperty("condition", "string", "", "", "Condition", "", "text", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

}

KGasCondition.getClassName = function () { return "gas_condition"; };

ClassKitchen.addClass(KGasCondition);

// ----------------------------------------------------------------------------

class KGasConditionTrue extends KGasElement {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("children", "base_array", "gas_node", null, "Children", "", "", [], false);
		this.addProperty("type", "string", "", "condition-true", "Gasoline Type", "", "static", [], true);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

}

KGasConditionTrue.getClassName = function () { return "gas_condition_true"; };

ClassKitchen.addClass(KGasConditionTrue);

// ----------------------------------------------------------------------------

class KGasConditionFalse extends KGasElement {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("children", "base_array", "gas_node", null, "Children", "", "", [], false);
		this.addProperty("type", "string", "", "condition-false", "Gasoline Type", "", "static", [], true);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

}

KGasConditionFalse.getClassName = function () { return "gas_condition_false"; };

ClassKitchen.addClass(KGasConditionFalse);

// ----------------------------------------------------------------------------

class KGasInclusion extends KGasElement {

	constructor(parent) {
		super(parent);

		this._classDescription = "";
		this.updateProperty("children", "base_array", "gas_node", null, "Children", "", "", [], false);
		this.addProperty("type", "string", "", "inclusion", "Gasoline Type", "", "static", [], true);
		this.addProperty("template", "string", "", "", "Template name", "", "text", [], false);
		// Remove unwanted members inherited from parent class
		this.removeProperty("name");
	}

}

KGasInclusion.getClassName = function () { return "gas_inclusion"; };

ClassKitchen.addClass(KGasInclusion);

