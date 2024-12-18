interface KClass {
    name: string;
    functor: (parent?: any) => any;
    primitive?: boolean;
}

interface KBaseProperty {
    name: string;
    type: string;
    subType?: string;
    defaultValue: any;
    title?: string;
    description?: string;
    input?: string;
    choiceItems?: any[];
    required?: boolean;
}

interface KBaseObject {
    _id: string;
    _parent: KBaseObject | null;
    _properties: KBaseProperty[];
    _className: string;
    _classDescription: string;

    getSuperClassName(): string;
    isInheritedFrom(className: string): boolean;
    addProperty(property: KBaseProperty): void;
    updateProperty(property: KBaseProperty): void;
    removeProperty(name: string): void;
    getProperty(name: string): KBaseProperty | undefined;
    propertyHasValue(name: string): boolean;
    getRoot(): KBaseObject;
    getParents(parents?: KBaseObject[]): KBaseObject[];
    getParentOfType(type: string): KBaseObject | undefined;
    getParentWithProperty(propertyName: string): KBaseObject | undefined;
    getParentKeyName(): string;
    getDocs(): string;
    clear(): void;
    isEqual(obj: KBaseObject): boolean;
    save(obj?: any, simplify?: boolean, fullSimplify?: boolean, saveId?: boolean): any;
    load(obj: any, loadId?: boolean): void;
    cloneFrom(obj: KBaseObject): void;
    findObjectById(id: string, recursive?: boolean): KBaseObject | null;
    findObjectByName(name: string, recursive?: boolean): KBaseObject | null;
    findObjectByNameAndType(name: string, type: string, recursive?: boolean): KBaseObject | null;
    findObject(callback: (obj: KBaseObject) => boolean, recursive?: boolean): KBaseObject | null;
    getObjectOfType(type: string, recursive?: boolean): KBaseObject | null;
    getObjectsOfType(className: string, recursive?: boolean): KBaseObject[];
    getAllRoutes(): string[];
    findPageByRoute(routeName: string, recursive?: boolean): KBaseObject | null;
    removeObjectById(id: string, recursive?: boolean): boolean;
}
