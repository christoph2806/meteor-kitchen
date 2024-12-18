import { toSnakeCase } from "../lib/case_utils.ts"

const randomString = (len: number = 17): string => {
    let text = "";
    // let first char to be letter
    let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    text += charset.charAt(Math.floor(Math.random() * charset.length));

    // other chars can be numbers
    charset += "0123456789";
    for (let i = 0; i < len; i++) {
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return text;
};

const AddDirSeparator = (dir: string | undefined): string => {
    if (!dir) {
        return "/";
    }

    if (dir[dir.length - 1] !== "/") {
        return dir + "/";
    }

    return dir;
};

const isNonEmptyObject = (obj: object): boolean => {
    return !!Object.keys(obj).length;
};

const extractStringsFromObject = (obj: any): string[] => {
    const strings: string[] = [];

    if (Array.isArray(obj)) {
        obj.forEach((el) => {
            if (typeof el === "string") {
                strings.push(el);
            } else if (Array.isArray(el) || typeof el === "object") {
                const tmp = extractStringsFromObject(el);
                tmp.forEach((str) => strings.push(str));
            }
        });
    } else if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
            if (typeof obj[key] === "string") {
                strings.push(obj[key]);
            } else if (Array.isArray(obj[key]) || typeof obj[key] === "object") {
                const tmp = extractStringsFromObject(obj[key]);
                tmp.forEach((str) => strings.push(str));
            }
        }
    }

    return strings;
};


class KClassKitchen {
    private classes: KClass[] = [];
    public factoryName: string = "Class factory";
    public factoryDescription: string = "";

    constructor() {
        // Primitive data types
        this.classes.push({ name: "bool", functor: () => false, primitive: true });
        this.classes.push({ name: "integer", functor: () => 0, primitive: true });
        this.classes.push({ name: "string", functor: () => "", primitive: true });
        this.classes.push({ name: "object", functor: () => ({}), primitive: true });
        this.classes.push({ name: "array", functor: () => [], primitive: true });
    }

    getClass(name: string): KClass | undefined {
        return this.classes.find((c) => c.name === name);
    }

    addClass(type: { new(parent?: any): any; getClassName(): string }): void {
        const functor = (parent?: any) => new type(parent);
        const className = type.getClassName();

        this.removeClass(className);

        this.classes.push({
            name: className,
            functor,
        });
    }

    removeClass(name: string): void {
        const index = this.classes.findIndex((c) => c.name === name);
        if (index >= 0) {
            this.classes.splice(index, 1);
        }
    }

    create(name: string, parent?: any): any | null {
        const classInfo = this.classes.find((c) => c.name === name);
        if (!classInfo) {
            return null;
        }
        return classInfo.functor(parent);
    }

    getDocs(includeThis: boolean = false): string {
        let docs = "";
        if (includeThis) {
            docs += `# ${this.factoryName}\n`;
            docs += `${this.factoryDescription}\n\n`;
        }

        const classNames = this.getClassNames(true);

        classNames.forEach((className) => {
            const c = this.getClass(className);
            if (c) {
                const tmp = c.functor(null);
                if (tmp.getDocs) {
                    docs += tmp.getDocs();
                    docs += "\n";
                }
            }
        });

        return docs;
    }

    getClassNames(sort: boolean = true, forDocs: boolean = true): string[] {
        const classNames: string[] = this.classes.map((c) => c.name);

        const list: string[] = classNames.filter((className) => {
            const c = this.getClass(className);
            if (c) {
                const tmp = c.functor(null);
                return !forDocs || !!tmp.getDocs;
            }
            return false;
        });

        if (sort) {
            list.sort();
        }

        return list;
    }

    getClassNamesInheritedFrom(
        className: string,
        skipClassNames: string[],
        skipParentClassNames: string[]
    ): string[] {
        const classNames: string[] = [];

        this.classes.forEach((cls) => {
            const obj = this.create(cls.name);
            if (
                obj &&
                obj.isInheritedFrom &&
                obj.isInheritedFrom(className) &&
                !skipClassNames.includes(cls.name)
            ) {
                let skip = false;
                if (skipParentClassNames.length) {
                    skipParentClassNames.forEach((skipParentClass) => {
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

// Create an instance of KClassKitchen
const ClassKitchen = new KClassKitchen();
export default ClassKitchen;

// ----------------------------------------------------------------------------

export class KBaseProperty {
    name: string;
    type: string;
    subType?: string;
    defaultValue?: string | null;
    title?: string;
    description?: string;
    input?: string;
    choiceItems?: any[];
    required?: boolean;

    constructor(
        name: string,
        type: string,
        subType?: string,
        defaultValue?: string | null,
        title?: string,
        description?: string,
        input?: string,
        choiceItems?: any[],
        required?: boolean) {
        this.name = name;
        this.type = type;
        this.subType = subType || "";
        this.defaultValue = defaultValue || null;
        this.title = title || "";
        this.description = description || "";
        this.input = input || "";
        this.choiceItems = choiceItems || [];
        this.required = required || false;
    }
}

// ----------------------------------------------------------------------------

class KBaseObject {
    static getClassName(): string {
        return "base_object";
    }

    private _id: string;
    private _parent: any;
    private _properties: any[] = [];
    private _className: string;
    private _classDescription: string;

    constructor(parent: any) {
        this._id = randomString();
        this._parent = parent || null;
        this._className = (this.constructor as typeof KBaseObject).getClassName();
        this._classDescription = "Base object";
    }

    public get properties(): any[] {
        return this._properties;
    }
    public set properties(value: any[]) {
        this._properties = value;
    }
    public get classDescription(): string {
        return this._classDescription;
    }
    public set classDescription(value: string) {
        this._classDescription = value;
    }

    getSuperClassName(): string {
        const realSuper = Object.getPrototypeOf(Object.getPrototypeOf(this));
        if (realSuper.constructor.getClassName) {
            return realSuper.constructor.getClassName();
        }
        return "";
    }

    isInheritedFrom(className: string): boolean {
        if ((this.constructor as typeof KBaseObject).getClassName() === className) {
            return true;
        }

        const realSuper = Object.getPrototypeOf(Object.getPrototypeOf(this));
        if (realSuper && realSuper.isInheritedFrom) {
            return realSuper.isInheritedFrom(className);
        }

        return false;
    }

    addProperty({ name, type, subType, defaultValue, title, description, input, choiceItems, required }: KBaseProperty): void {

        if (!name) return;

        this[name] = defaultValue || ClassKitchen.create(type, this);

        if (this[name] instanceof KBaseArray) {
            this[name].defaultItemType = subType;
        }

        if (
            this[name] instanceof KBaseObject ||
            this[name] instanceof KBaseArray ||
            type === "object" ||
            type === "array"
        ) {
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
            name,
            type,
            subType,
            defaultValue,
            title,
            description,
            input,
            choiceItems,
            required,
        });
    }

    updateProperty({ name, type, subType, defaultValue, title, description, input, choiceItems, required }: KBaseProperty): void {
        if (!name) return;

        const propertyIndex = this._properties.findIndex((prop) => prop.name === name);
        if (propertyIndex < 0) return;

        this[name] = defaultValue || ClassKitchen.create(type, this);

        if (this[name] instanceof KBaseArray) {
            this[name].defaultItemType = subType;
        }

        if (
            this[name] instanceof KBaseObject ||
            this[name] instanceof KBaseArray ||
            type === "object" ||
            type === "array"
        ) {
            if (!defaultValue) {
                defaultValue = ClassKitchen.create(type, this);
            }
        }

        title = title || name || "";
        description = description || "";
        input = input || "";
        choiceItems = choiceItems || [];
        required = !!required;

        this._properties[propertyIndex] = {
            name,
            type,
            subType,
            defaultValue,
            title,
            description,
            input,
            choiceItems,
            required,
        };
    }

    removeProperty(name: string): void {
        const propertyIndex = this._properties.findIndex((prop) => prop.name === name);
        if (propertyIndex < 0) return;

        this._properties.splice(propertyIndex, 1);
        delete this[name];
    }

    getProperty(name: string): any {
        return this._properties.find((p) => p.name === name);
    }

    propertyHasValue(name: string): boolean {
        const value = this[name];
        if (typeof value === "undefined") {
            return false;
        }

        const property = this.getProperty(name);
        if (!property || !property.type) {
            return false;
        }

        if (property.type === "array") {
            return value && value.length > 0;
        }

        return !!value;
    }

    getRoot(): KBaseObject {
        if (!this._parent || !this._parent.getRoot) {
            return this;
        }

        return this._parent.getRoot();
    }

    getParents(parents: KBaseObject[] = []): KBaseObject[] {
        if (!this._parent || !this._parent.getParents) {
            return parents;
        }

        parents.push(this._parent);

        return this._parent.getParents(parents);
    }

    getParentOfType(type: string): KBaseObject | undefined {
        const parents = this.getParents();
        return parents.find((parent) => parent._className === type);
    }

    getParentWithProperty(propertyName: string): KBaseObject | undefined {
        const parents = this.getParents();
        return parents.find((parent) => parent.getProperty && parent.getProperty(propertyName));
    }

    getParentKeyName(): string {
        if (!this._parent) return "";

        let propertyName = "";
        this._parent._properties.find((property) => {
            if (this._parent[property.name] && this._parent[property.name]._id === this._id) {
                propertyName = property.name;
                return true;
            }
        });

        return propertyName;
    }

    getDocs(): string {
        let docs = "";

        docs += `<h2 id="_${this._className}">${this._className}</h2>\n\n`;

        if (this._classDescription) {
            docs += `${this._classDescription}\n\n`;
        }

        if (this.getSuperClassName()) {
            docs += `**Inherited from:** <a href="#_${this.getSuperClassName()}">${this.getSuperClassName()}</a>\n\n`;
        }

        if (this._properties.length) {
            docs += `#### ${this._className} properties\n`;
            docs += "Property name | Type | Default value | Description\n";
            docs += "--------------|------|---------------|------------\n";

            this._properties.forEach((property) => {
                docs += `${property.name} | `;

                let type = property.type;
                if (type === "base_array" && property.subType) {
                    type = `<a href="#_base_array">array</a> of `;
                    const kitchenClass = ClassKitchen.getClass(property.subType);
                    if (kitchenClass && !kitchenClass.primitive) {
                        type += `<a href="#_${property.subType}">${property.subType}</a>`;
                    } else {
                        type += property.subType;
                    }
                } else {
                    const kitchenClass = ClassKitchen.getClass(property.type);
                    if (kitchenClass && !kitchenClass.primitive) {
                        type = `<a href="#_${property.type}">${property.type}</a>`;
                    }
                }

                docs += `${type} | `;

                if (property.defaultValue && property.defaultValue.save) {
                    docs += " | ";
                } else {
                    if (property.type === "object" || property.type === "array") {
                        docs += `\`${JSON.stringify(property.defaultValue)}\` | `;
                    } else {
                        docs += (property.defaultValue || property.type === "bool")
                            ? `\`${property.defaultValue}\` | `
                            : " | ";
                    }
                }

                docs += `${property.description}\n`;
            });

            docs += "\n";
            docs += `#### ${this._className} object skeleton\n`;
            docs += "```json\n";
            docs += JSON.stringify(this.save(null, false, false, false), null, 2) + "\n";
            docs += "```\n\n";
        }

        return docs;
    }

    clear(): void {
        this._properties.forEach((property) => {
            const prop = this[property.name];
            if (prop && prop.clear) {
                prop.clear();
            } else {
                this[property.name] = property.defaultValue;
            }
        });
    }

    isEqual(obj: KBaseObject): boolean {
        if (!obj) {
            return false;
        }

        const nonEqIndex = this._properties.findIndex((property) => {
            if (this[property.name] && this[property.name].isEqual) {
                return !this[property.name].isEqual(obj[property.name]);
            } else {
                return JSON.stringify(this[property.name]) !== JSON.stringify(obj[property.name]);
            }
        });

        return nonEqIndex < 0;
    }

    save(
        obj: Record<string, any> | null,
        simplify: boolean,
        fullSimplify: boolean,
        saveId: boolean
    ): Record<string, any> {
        const o = obj || {};
        if (saveId && this._id) {
            o._id = this._id;
        }

        this._properties.forEach((property) => {
            const tmp = this[property.name];
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
                } else if (
                    (property.type === "object" && !isNonEmptyObject(o[property.name]) && !isNonEmptyObject(property.defaultValue) && fullSimplify) ||
                    (property.name !== "type" && o[property.name] === property.defaultValue)
                ) {
                    delete o[property.name];
                }
            }
        });

        return o;
    }

    load(obj: Record<string, any>, loadId: boolean): void {
        this.clear();
        const o = obj || {};

        if (loadId && o._id) {
            this._id = o._id;
        }

        this._properties.forEach((property) => {
            const tmp = this[property.name];
            if (tmp && tmp.load) {
                tmp.load(o[property.name], loadId);
            } else if (
                this._className === "query" &&
                (property.name === "filter" || property.name === "options") &&
                property.type === "string" &&
                typeof o[property.name] !== "string"
            ) {
                this[property.name] = JSON.stringify(o[property.name] || {});
            } else if (o.hasOwnProperty(property.name)) {
                this[property.name] = o[property.name];
            } else {
                this[property.name] = property.defaultValue;
            }
        });
    }

    cloneFrom(obj: KBaseObject): void {
        this.load(obj.save(null, false, false, false), false);
    }

    findObjectById(id: string, recursive: boolean = true): KBaseObject | null {
        let obj: KBaseObject | null = null;

        this._properties.some((property) => {
            const prop = this[property.name];
            if (prop && prop.findObjectById) {
                if (prop._id === id) {
                    obj = prop;
                    return true;
                }

                if (recursive) {
                    obj = prop.findObjectById(id, recursive);
                    if (obj) {
                        return true;
                    }
                }
            }
            return false;
        });

        return obj;
    }

    findObjectByName(name: string, recursive: boolean = true): KBaseObject | null {
        return this.findObject(
            (obj) =>
                obj.getProperty &&
                obj.getProperty("name")
                && obj["name"] === name,
            recursive);
    }

    findObjectByNameAndType(name: string, type: string, recursive: boolean = true): KBaseObject | null {
        return this.findObject(
            (obj) =>
                obj.getProperty &&
                obj.getProperty("name") &&
                obj["name"] === name &&
                obj._className === type,
            recursive
        );
    }

    findObject(callback: (obj: KBaseObject) => (boolean | void), recursive: boolean = true): KBaseObject | null {
        if (!callback) {
            return null;
        }

        let obj: KBaseObject | null = null;

        this._properties.some((property) => {
            const prop = this[property.name];
            if (prop && prop.findObject) {
                if (callback(prop)) {
                    obj = prop;
                    return true;
                }

                if (recursive) {
                    obj = prop.findObject(callback, recursive);
                    if (obj) {
                        return true;
                    }
                }
            }
            return false;
        });

        return obj;
    }

    getObjectOfType(type: string, recursive: boolean = true): KBaseObject | null {
        return this.findObject((obj) => obj._className === type, recursive);
    }

    getObjectsOfType(className: string, recursive: boolean = true): KBaseObject[] {
        const objects: KBaseObject[] = [];
        if (this._className === className) {
            objects.push(this);
        }

        this.findObject((obj) => {
            if (obj._className === className) {
                objects.push(obj);
            }
            return false;
        }, recursive);

        return objects;
    }

    getAllRoutes(): any[] {
        const routes: any[] = [];
        const pages = this.getObjectsOfType("page");
        pages.forEach((page) => {
            const route = page["getRoute"]();
            routes.push(route);
        });
        return routes;
    }

    findPageByRoute(routeName: string, recursive: boolean = true): KBaseObject | null {
        return this.findObject((obj) => obj["getRoute"] && obj["getRoute"]() === routeName, recursive);
    }

    removeObjectById(id: string, recursive: boolean = true): boolean {
        let removed = false;

        this._properties.some((property) => {
            const prop = this[property.name];
            if (prop && prop.removeObjectById && recursive) {
                if (prop.removeObjectById(id, recursive)) {
                    removed = true;
                    return true;
                }

                if (prop._id === id) {
                    return true;
                }
            }
            return false;
        });

        return removed;
    }
}

// Register the class

ClassKitchen.addClass(KBaseObject);

// ----------------------------------------------------------------------------

class KBaseArray extends Array<any> {
    static getClassName(): string {
        return "base_array";
    }

    private _id: string;
    private _parent: any;
    private _properties: any[] = [];
    private _className: string;
    private _defaultItemType: string | undefined = "";
    private _classDescription: string = "Base array";

    constructor(parent: any) {
        super();
        this._id = randomString();
        this._parent = parent || null;
        this._className = (this.constructor as typeof KBaseArray).getClassName();
    }

    public get defaultItemType(): string | undefined {
        return this._defaultItemType;
    }
    public set defaultItemType(value: string | undefined) {
        this._defaultItemType = value;
    }

    getSuperClassName(): string {
        const realSuper = Object.getPrototypeOf(Object.getPrototypeOf(this));
        if (realSuper.constructor.getClassName) {
            return realSuper.constructor.getClassName();
        }
        return "";
    }

    isInheritedFrom(className: string): boolean {
        if ((this.constructor as typeof KBaseArray).getClassName() === className) {
            return true;
        }

        const realSuper = Object.getPrototypeOf(Object.getPrototypeOf(this));
        if (realSuper && realSuper.isInheritedFrom) {
            return realSuper.isInheritedFrom(className);
        }

        return false;
    }

    getRoot(): KBaseArray | any {
        if (!this._parent || !this._parent.getRoot) {
            return this;
        }
        return this._parent.getRoot();
    }

    getParents(parents: any[] = []): any[] {
        if (!this._parent || !this._parent.getParents) {
            return parents;
        }

        parents.push(this._parent);
        return this._parent.getParents(parents);
    }

    getParentOfType(type: string): any | undefined {
        const parents = this.getParents();
        return parents.find((parent) => parent._className === type);
    }

    getParentKeyName(): string {
        if (!this._parent) return "";

        let propertyName = "";
        this._parent._properties.find((property: any) => {
            if (this._parent[property.name] && this._parent[property.name]._id === this._id) {
                propertyName = property.name;
                return true;
            }
        });

        return propertyName;
    }

    getDocs(): string {
        let docs = `<h2 id="_${this._className}">${this._className}</h2>\n\n`;
        if (this._classDescription) {
            docs += `${this._classDescription}\n\n`;
        }
        if (this.getSuperClassName()) {
            docs += `**Inherited from:** <a href="#_${this.getSuperClassName()}">${this.getSuperClassName()}</a>\n\n`;
        }
        return docs;
    }

    clear(): void {
        this.length = 0;
    }

    isEqual(arr: any[]): boolean {
        if (!arr || this.length !== arr.length) return false;

        const nonEqIndex = this.findIndex((item, index) => {
            if (item?.isEqual) {
                return !item.isEqual(arr[index]);
            }
            return JSON.stringify(item) !== JSON.stringify(arr[index]);
        });

        return nonEqIndex < 0;
    }

    save(arr: any[] = [], simplify: boolean, fullSimplify: boolean, saveId: boolean): any[] {
        if (saveId && this._id) {
            (arr as any)._id = this._id;
        }

        this.forEach((item) => {
            if (item?.save) {
                const obj = item.save(null, simplify, fullSimplify, saveId);
                if (item._className !== this._defaultItemType) {
                    obj.object_type = item._className;
                }
                arr.push(obj);
            } else {
                arr.push(item);
            }
        });
        return arr;
    }

    load(arr: any[], loadId: boolean): void {
        this.clear();
        const a = arr || [];

        if (loadId && a["_id"]) {
            this._id = a["_id"];
        }

        if (!Array.isArray(a)) return;

        a.forEach((item) => {
            let obj: any = null;

            if (item) {
                if (item.object_type) {
                    obj = ClassKitchen.create(item.object_type, this);
                } else if (item.type) {
                    if (this._defaultItemType === "component") {
                        obj = ClassKitchen.create(item.type, this);
                    } else if (
                        ["gas_node", "gas_element", "gas_template"].includes(this.defaultItemType || "")
                    ) {
                        obj = ClassKitchen.create(`gas_${item.type.replace(/-/g, "_")}`, this);
                    }
                }
            }

            if (!obj && this._defaultItemType) {
                obj = ClassKitchen.create(this._defaultItemType, this);
            }

            if (obj?.load) {
                obj.load(item, loadId);
                this.push(obj);
            } else {
                this.push(item);
            }
        });
    }

    getUniqueItemName(newObject: any): string {
        let newName = "";
        const newNameTemplate = newObject.name || `new_${newObject._className}`;
        let index = 0;

        do {
            newName = `${newNameTemplate}${index ? index : ""}`;
            index++;
        } while (
            this.findObject((object: any) => object.name === newName, false)
        );

        return newName;
    }

    findObject(callback: (obj: any) => (boolean | void), recursive: boolean = true): any | null {
        if (!callback) return null;

        let obj: any = null;
        this.find((item) => {
            if (item?.findObject) {
                if (callback(item)) {
                    obj = item;
                    return true;
                }

                if (recursive) {
                    obj = item.findObject(callback, recursive);
                    if (obj) {
                        return true;
                    }
                }
            }
        });

        return obj;
    }

    findObjectById(id: string, recursive: boolean = true): any | null {
        let obj: any = null;
        this.find((item) => {
            if (item?.findObjectById) {
                if (item._id === id) {
                    obj = item;
                    return true;
                }

                if (recursive) {
                    obj = item.findObjectById(id, recursive);
                    if (obj) {
                        return true;
                    }
                }
            }
        });

        return obj;
    }

    indexOfObjectById(id: string): number {
        return this.findIndex((item) => item?._id === id);
    }

    swapItems(index1: number, index2: number): void {
        this.splice(index2, 1, this.splice(index1, 1, this[index2])[0]);
    }

    moveItemUp(id: string): void {
        const index = this.indexOfObjectById(id);
        if (index > 0) {
            this.swapItems(index - 1, index);
        }
    }

    moveItemDown(id: string): void {
        const index = this.indexOfObjectById(id);
        if (index < this.length - 1) {
            this.swapItems(index, index + 1);
        }
    }

    getObjectOfType(type: string, recursive: boolean = true): any | null {
        return this.findObject((obj) => obj._className === type, recursive);
    }

    getObjectsOfType(className: string, recursive: boolean = true): any[] {
        const objects: any[] = [];
        if (this._className === className) {
            objects.push(this);
        }

        this.findObject((obj) => {
            if (obj._className === className) {
                objects.push(obj);
            }
        }, recursive);

        return objects;
    }

    removeObjectById(id: string, recursive: boolean = true): boolean {
        let removed = false;
        const index = this.findIndex((item) => {
            if (item?.removeObjectById && recursive) {
                if (item.removeObjectById(id, recursive)) {
                    removed = true;
                    return true;
                }
            }
            return item._id === id;
        });

        if (removed) {
            return true;
        }

        if (index >= 0) {
            if (this[index]?.updateRefs) {
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
    static getClassName(): string {
        return "named_object";
    }

    constructor(parent: KBaseObject | null) {
        super(parent);
        this.classDescription = "";

        this.addProperty({
            name: "name",
            type: "string"
        });
    }
}

// ----------------------------------------------------------------------------

class KKitchen extends KBaseObject {

    static getClassName(): string {
        return "kitchen";
    }

    constructor(parent: KBaseObject | null) {
        super(parent);

        this.classDescription = "";
        this.addProperty({
            name: "application",
            type: "application",
            title: "Application",
            required: true
        });
    }
}

// ----------------------------------------------------------------------------

class KField extends KNamedObject {
    constructor(parent: KBaseObject | null) {
        super(parent);

        this.classDescription = "";

        // Adding properties with the new pattern
        this.updateProperty(
            {
                name: "name",
                type: "string",
                subType: "object_name",
                defaultValue: null,
                title: "Name",
                description: "Object name",
                input: "text",
                required: true,
            }
        );

        this.addProperty({
            name: "title",
            type: "string",
            title: "Title",
            description: "Field title (used in form labels, table column headers etc.)",
            input: "text",
        });

        const typeChoiceItems = ["string", "integer", "float", "date", "time", "bool", "array", "object", "email"];
        this.addProperty({
            name: "type",
            type: "string",
            defaultValue: "string",
            title: "Type",
            description:
                'Field data type used in form validations. Examples: "string", "integer", "float", "date", "time", "bool", "array", "email", "random_string". Default: "string"',
            input: "select",
            choiceItems: typeChoiceItems,
            required: true,
        });

        this.addProperty({
            name: "default",
            type: "string",
            title: "Default value",
            description:
                'Default value. For date fields you can use special constant "today", for time fields you can use "now". Also, you can set helper here "{{myHelper}}".',
            input: "text",
        });

        this.addProperty({
            name: "min",
            type: "string",
            title: "Min. value",
            description: "Minimum value (only for numeric fields)",
            input: "text",
        });

        this.addProperty({
            name: "max",
            type: "string",
            title: "Max. value",
            description: "Maximum value (only for numeric fields)",
            input: "text",
        });

        this.addProperty({
            name: "required",
            type: "bool",
            defaultValue: "false",
            title: "Required",
            description: "Is field input required? Default: false",
            input: "checkbox",
        });

        this.addProperty({
            name: "format",
            type: "string",
            title: "Format",
            description:
                'Currently used only with data types "date" and "time". Contains date or time format such as "MM/DD/YYYY" or "hh:mm:ss"',
            input: "text",
        });

        this.addProperty({
            name: "searchable",
            type: "bool",
            defaultValue: "true",
            title: "Searchable",
            description: "Is field searchable? Default: true",
            input: "checkbox",
        });

        this.addProperty({
            name: "sortable",
            type: "bool",
            defaultValue: "true",
            title: "Sortable",
            description: "Is field sortable? Default: true",
            input: "checkbox",
        });

        this.addProperty({
            name: "exportable",
            type: "bool",
            defaultValue: "false",
            title: "Exportable",
            description:
                'If true field will be exported to CSV/JSON (used in dataview component). Default: false',
            input: "checkbox",
        });

        // Add more properties using the same pattern as needed...
    }

    static getClassName(): string {
        return "field";
    }
}

// ----------------------------------------------------------------------------

class KHiddenField extends KBaseObject {
    constructor(parent: KBaseObject | null) {
        super(parent);

        this.classDescription = "";

        this.addProperty({
            name: "name",
            type: "string",
            title: "Name",
            description: "Field name",
            input: "text",
            required: true,
        });

        this.addProperty({
            name: "value",
            type: "string",
            title: "Value",
            description: "Field value",
            input: "text",
            required: true,
        });
    }
}

// ----------------------------------------------------------------------------

class KInputItem extends KBaseObject {
    constructor(parent: KBaseObject | null) {
        super(parent);

        this.classDescription = "";

        this.addProperty({
            name: "value",
            type: "string",
            title: "Value",
            description: "select, radio or checkbox item value written on submit",
            input: "text",
            required: true,
        });

        this.addProperty({
            name: "title",
            type: "string",
            title: "Title",
            description: "select, radio or checkbox item title shown to user",
            input: "text",
            required: true,
        });
    }
}

// ----------------------------------------------------------------------------

class KCollection extends KNamedObject {
    constructor(parent: KBaseObject | null) {
        super(parent);

        this.classDescription = "";

        this.updateProperty({
            name: "name",
            type: "string",
            subType: "object_name",
            defaultValue: "",
            title: "Name",
            description: "Object name",
            input: "text",
            required: true,
        });

        const typeChoiceItems = ["collection", "file_collection", "bigchaindb"];
        this.addProperty({
            name: "type",
            type: "string",
            defaultValue: "collection",
            title: "Type",
            description:
                'Collection type. Can be "collection", "file_collection" (FS.Collection) or "bigchaindb". Default: "collection".',
            input: "select",
            choiceItems: typeChoiceItems,
            required: true,
        });

        const storageAdaptersChoiceItems = ["gridfs", "filesystem", "s3", "dropbox"];
        this.addProperty({
            name: "storage_adapters",
            type: "base_array",
            subType: "string",
            title: "Storage adapters",
            description:
                'For collection of type "file_collection": list of CollectionFS storage adapters: "gridfs", "filesystem", "s3" or "dropbox". If not specified, generator will assume "gridfs".',
            input: "stringlist",
            choiceItems: storageAdaptersChoiceItems,
            required: false,
        });

        this.addProperty({
            name: "storage_adapter_options",
            type: "string",
            title: "Storage adapter options",
            description:
                'For collection of type "file_collection": list of CollectionFS storage adapters and their options. Example: `{ "s3": { "bucket": "mybucket" }, "gridfs": { } }`.',
            input: "json",
            required: false,
        });

        this.addProperty({
            name: "fields",
            type: "base_array",
            subType: "field",
            title: "Fields",
            description:
                "Field list. Not mandatory, used by components such as form, dataview etc.",
            required: false,
        });

        this.addProperty({
            name: "owner_field",
            type: "string",
            title: "Owner field",
            description:
                'Field name used to store user ID of document owner. Only for apps using user accounts. Value of this field will be automatically set server side by "before.insert" hook.',
            input: "text",
            required: false,
        });

        this.addProperty({
            name: "roles_allowed_to_read",
            type: "base_array",
            subType: "string",
            title: "Roles allowed to Read",
            description:
                'List of user roles that can subscribe to this collection. You can use special roles "nobody" (nobody can read) and "owner" (only owner/creator can read).',
            input: "stringlist",
            required: false,
        });

        // Additional properties omitted for brevity, but follow the same pattern
    }

    updateRefs(oldName: string, newName: string): void {
        const kitchen: KKitchen = this.getRoot();
        if (!kitchen) {
            return;
        }

        kitchen.findObject((obj) => {
            obj.properties.forEach((property) => {
                if (
                    property.subType === "collection_name" &&
                    obj[property.name] &&
                    obj[property.name] === oldName
                ) {
                    obj[property.name] = newName;
                }
            });
        });
    }

    getSQL(): string {
        let sql = "";
        const KEY_DATATYPE = "VARCHAR(30)";

        const tableName = toSnakeCase(this["name"]).toUpperCase();
        sql += `CREATE TABLE ${tableName} (\n`;

        let fieldsSQL = "";
        let keysSQL = "";

        fieldsSQL += `\tID ${KEY_DATATYPE} NOT NULL`;

        keysSQL += `\tPRIMARY KEY (ID)`;

        if (this["fields"]) {
            this["fields"].forEach((field) => {
                const fieldName = toSnakeCase(field.name).toUpperCase();
                let fieldType = "";

                if (field.join_collection) {
                    fieldType = KEY_DATATYPE;
                } else {
                    switch (field.type) {
                        case "string":
                        case "email":
                            fieldType = "VARCHAR(255)";
                            break;
                        case "integer":
                            fieldType = "INTEGER";
                            break;
                        case "float":
                            fieldType = "DOUBLE";
                            break;
                        case "date":
                            fieldType = "DATE";
                            break;
                        case "time":
                            fieldType = "INTEGER";
                            break;
                        case "bool":
                            fieldType = "TINYINT";
                            break;
                        case "array":
                        case "object":
                            fieldType = "JSON";
                            break;
                        default:
                            fieldType = "VARCHAR(255)";
                    }
                }

                fieldsSQL += `,\n\t${fieldName} ${fieldType}`;
                if (field.required) {
                    fieldsSQL += " NOT NULL";
                }

                if (field.join_collection) {
                    const foreignTableName = toSnakeCase(field.join_collection).toUpperCase();
                    keysSQL += `,\n\tFOREIGN KEY (${fieldName}) REFERENCES ${foreignTableName}(ID)`;
                }
            });
        }

        sql += fieldsSQL;
        sql += `,\n${keysSQL}\n);`;
        return sql;
    }

    getGraphQL(): string {
        let gql = `type ${this["name"]} {\n`;

        let gqlFields = "";

        if (this["fields"]) {
            const idField = this["fields"].find(
                (fld) => fld.name.toLowerCase() === "_id" || fld.name.toLowerCase() === "id"
            );

            if (!idField) {
                gqlFields += "\tid: ID!";
            }

            this["fields"].forEach((field) => {
                gqlFields += `\n\t${field.name}: `;

                let fieldType = "";
                switch (field.type) {
                    case "string":
                    case "email":
                        fieldType = "String";
                        break;
                    case "integer":
                        fieldType = "Int";
                        break;
                    case "float":
                        fieldType = "Float";
                        break;
                    case "date":
                    case "time":
                        fieldType = "Int";
                        break;
                    case "bool":
                        fieldType = "Boolean";
                        break;
                    case "array":
                        fieldType = `[${field.subType}]`;
                        break;
                    case "object":
                        fieldType = "Object";
                        break;
                    default:
                        fieldType = "String";
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

KCollection.getClassName = () => "collection";
ClassKitchen.addClass(KCollection);
