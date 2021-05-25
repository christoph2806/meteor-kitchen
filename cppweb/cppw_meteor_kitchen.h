#ifndef CPPW_METEOR_KITCHEN_H
#define CPPW_METEOR_KITCHEN_H

#define GENERATOR_VERSION_MAJOR 0
#define GENERATOR_VERSION_MINOR 9
#define GENERATOR_VERSION_PATCH 108
#define GENERATOR_METADATA_VERSION 119

#include "cppw_array.cpp"
#include "cppw_jsonparser.h"
#include "cppw_htmlparser.h"

enum CWZoneType { ztUnknown = -1, ztFree, ztPublic, ztPrivate };

class CWObject;
class CWSubscription;
class CWSubscriptions;
class CWField;
class CWCollection;
class CWQuery;
class CWFilePair;
class CWPackages;
class CWComponent;
class CWPlugin;
class CWRoute;
class CWRouter;
class CWPage;
class CWZone;
class CWApplication;

class CWMenuItem;
class CWMenu;
class CWJumbotron;
class CWForm;
class CWDataView;
class CWTreeView;
class CWMarkdown;
class CWDiv;
class CWSection;
class CWEditableContent;
class CWCMSContent;
class CWChart;

class CWGasoline;
class CWGasEvent;
class CWGasElement;
class CWGasHandler;
class CWGasHelper;
class CWGasTemplate;
class CWGasHTML;
class CWGasText;
class CWGasLoop;
class CWGasCondition;
class CWGasConditionTrue;
class CWGasConditionFalse;
class CWGasInclusion;


void GetMetadata(CWJSONObject* pMeta, bool bSimplify, bool bNamesOnly, CWJSONObject* pMetaHelp);

class CWObject
{
	public:
		CWObject* Parent;
		// --- properties
		string Name; // Object name
		// ---

		CWObject(CWObject* pParent);
		virtual ~CWObject();

		virtual void GetMetadata(CWJSONObject* pMeta);

		CWApplication* App();
		string ObjectPath();

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);

		void CopyFrom(CWObject* pObject);
};

class CWParam
{
	public:
		// --- properties
		string Name; // Parameter name
		string Value; // Parameter value
		// ---
		CWJSONType Type; // Parameter data type (got from json value data type)

		CWParam();
		virtual ~CWParam();

		virtual void GetMetadata(CWJSONObject* pMeta);
};

class CWParams: public CWArray<CWParam*>
{
	public:
		// --- properties
		// ---

		CWParams();
		virtual ~CWParams();

		void LoadFromJSONArray(CWJSONArray* pList);
		void SaveToJSONArray(CWJSONArray* pList);
		string AsString();
		CWParam* GetParam(string sName);
};

class CWVariable
{
	public:
		// --- properties
		string Name; // Variable name
		string Value; // Variable value
		string QueryName; // External query name. Set field name to "Value" field of this variable and result will be array of values from that field (pluck)
		// ---

		CWVariable();
		virtual ~CWVariable();

		virtual void GetMetadata(CWJSONObject* pMeta);
};

class CWVariables: public CWArray<CWVariable*>
{
	public:
		// --- properties
		// ---

		CWVariables();
		virtual ~CWVariables();

		void LoadFromJSONArray(CWJSONArray* pList);
		void SaveToJSONArray(CWJSONArray* pList);
		CWVariable* GetVariable(string sName);
};


class CWAction
{
	public:
		// --- properties
		string Name; // Action name
		string Title; // Action title
		string IconClass; // Icon class
		string Route; // Redirect to route
		CWParams *RouteParams; // Parameters to be passed to "route"
		string ActionCode; // Custom code to execute
		string Rule; // JavaScript expression. Action will be hidden in UI if expression evaluates false
		// ---

		CWAction();
		virtual ~CWAction();

		virtual void GetMetadata(CWJSONObject* pMeta);
};

class CWActions: public CWArray<CWAction*>
{
	public:
		// --- properties
		// ---
		CWActions();
		virtual ~CWActions();

		void LoadFromJSONArray(CWJSONArray* pList);
		void SaveToJSONArray(CWJSONArray* pList);
		CWAction* GetAction(string sName);
};


class CWInputItem
{
	public:
		// --- properties
		string Value; // select, radio or checkbox item value written on submit
		string Title; // select, radio or checkbox item title shown to user
		// ---

		CWInputItem();
		virtual ~CWInputItem();

		virtual void GetMetadata(CWJSONObject* pMeta);
};

class CWHiddenField
{
	public:
		// --- properties
		string Name; // Field name
		string Value; // Field value
		// ---

		CWHiddenField();
		virtual ~CWHiddenField();

		virtual void GetMetadata(CWJSONObject* pMeta);
};

class CWField: public CWObject
{
	public:
		// --- properties
		string Title; // Field title (used in form labels, table column headers etc.)
		string Type; // Field data type used in form validations. Examples: "string", "integer", "float", "date", "time", "bool", "array", "email", "random_string". Default: "string"
		string Default; // Default value. For date fields you can use special constant "today", for time fields you can use "now". Also, you can set helper here "{{myHelper}}".
		string Min; // Minimum value (only for numeric fields)
		string Max; // Maximum value (only for numeric fields)
		bool Required; // Is field input required? Default: false
		string Format; // Currently used only with data types "date" and "time". Contains date or time format such as "MM/DD/YYYY" or "hh:mm:ss"
		bool Searchable; // Is field searchable? Default: true
		bool Sortable; // Is field sortable? Default: true
		bool Exportable; // If true field will be exported to CSV/JSON (used in dataview component). Default: false
		string Input; // Form input control type: "text", "password", "datepicker", "read-only", "textarea", "radio", "checkbox", "select", "crud", "file", "custom"
		string InputTemplate; // Template for "custom" input field (relative to input file)
		string InputTemplateCode; // Source code (markup) for "custom" input field. If you need any initialization (e.g. jQuery) here, you can put that into form's template_rendered_code
		string InputGroupClass; // This CSS class will be added to field input group container in forms.
		string InputControlClass; // This CSS class will be added to input control in forms.
		CWArray<CWInputItem*>* InputItems; // Item list for input type "radio" and "select"
		string LookupQueryName; // Query name used for form input type "select".
		CWParams* LookupQueryParams; // Lookup query params
		string LookupKey; // Field name from lookup_query used as option value in input type "select". Mandatory field if lookup_query is defined
		string LookupField; // Field name from lookup_query used as option title in input type "select". Mandatory field if lookup query is defined
		string DisplayHelper; // Helper name used to display value from this field (used in DataView, Forms etc.)
		bool EditInline; // Field is editable inline in DataViews (currently works only with checkbox)

		string ArrayItemType; // If "type" is set to "array" then you can define array item type here. Format is the same as for "type" property.
		CWArray<CWField*> *CrudFields; // If "array_item_type" is set to "object" then you can define fields for input type "crud".
		string CrudInsertTitle; // For fields with "input": "crud" - insert button and insert form title

		string FileCollection; // For fields with "input": "file". Name of FS.Collection where file is stored. Generator will automatically join this collection with file_collection.
		string FileContainer; // For fields with "input": "file". Field name where FS.File object from joined FS.Collection will be stored.

		string JoinCollection; // Collection name to join with. If set then this field acts as foreign key. For generic join don't set this field (see "join_collection_field" instead).
		string JoinCollectionField; // Used in generic joins only. Field name (from this collection) containing collection name to join with. If set then this field acts as foreign key.
		string JoinContainer; // Field name where document from joined collection will be stored
		CWStringList* JoinFields; // Field list to fetch from joined collection. Ignored in generic joins.

		bool ShowInDataview; // If set to "false", field will not be shown in dataview components. Default: true
		bool ShowInInsertForm; // If set to "false", field will not be included in forms with mode "insert". Default: true
		bool ShowInUpdateForm; // If set to "false", field will not be included in forms with mode "update". Default: true
		bool ShowInReadOnlyForm; // If set to "false", field will not be included in forms with mode "read_only". Default: true

		string RoleInBlog; // Specify which role this field will have in dataview ("view_style": "blog"). Can be one of: "title", "subtitle", "text", "date".
		// ---

		CWSubscription* LookupSubscription; // used internally by generator

		CWField(CWObject* pParent);
		virtual ~CWField();

		virtual CWSubscription* GetLookupSubscription();
		virtual CWQuery* GetLookupQuery();
		virtual string GetLookupQueryName();

		virtual void GetMetadata(CWJSONObject* pMeta);
		virtual void GetSimpleSchema(CWJSONObject* pSchema);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
};

class CWCollection: public CWObject
{
	public:
		// --- properties
		string Type; // Collection type. Can be "collection", "file_collection" (FS.Collection) or "bigchaindb". Default: "collection".
		CWArray<CWField*> *Fields; // Field list. Not mandatory, used by components such as form, dataview etc.

		string OwnerField; // Field name used to store user ID of document owner. Only for apps using user accounts. Value of this field will be automatically set server side by "before.insert" hook.

		CWStringList* RolesAllowedToRead; // List of user roles that can subscribe to this collection. You can use special roles "nobody" (nobody can read) and "owner" (only owner/creator can read).
		CWStringList* RolesAllowedToInsert; // List of user roles that can insert documents into this collection. You can use special role "nobody" (nobody can insert).
		CWStringList* RolesAllowedToUpdate; // List of user roles that can update documents. You can use special roles "nobody" (nobody can update) and "owner" (only owner/creator can update).
		CWStringList* RolesAllowedToDelete; // List of user roles that can delete documents. You can use special roles "nobody" (nobody can remove) and "owner" (only owner/creator can remove).
		CWStringList* RolesAllowedToDownload; // For collection of type "file_collection": List of user roles that can download files. You can use special roles "nobody" (nobody can download) and "owner" (only owner/creator can download).

		string UpdateRule; // Update will be restricted if this expression evaluates false. You can use two variables here: "userId" and "doc". Note that this expression is added ( AND ) to user role check, so if user's role is not allowed to update, evaluating this expression to true will not allow update.
		string DeleteRule; // Delete will be restricted if this expression evaluates false. You can use two variables here: "userId" and "doc". Note that this expression is added ( AND ) to user role check, so if user's role is not allowed to delete, evaluating this expression to true will not allow delete.

		CWStringList* StorageAdapters; // For collection of type "file_collection": list of CollectionFS storage adapters: "gridfs", "filesystem", "s3" or "dropbox". If not specified, generator will assume "gridfs".
		CWJSONObject* StorageAdapterOptions; // For collection of type "file_collection": list of CollectionFS storage adapters and their options. Example: `{ "s3": { "bucket": "mybucket" }, "gridfs": { } }`.

		string BeforeInsertCode; // Code to be executed before new document is inserted into collection. Should be only body of a function with args: (userId, doc). See <a href="https://github.com/matb33/meteor-collection-hooks" target="_blank">meteor-collection-hooks</a> package for more details.
		string BeforeUpdateCode; // Code to be executed before document is updated. Should be only body of a function with args: (userId, doc, fieldNames, modifier, options)
		string BeforeRemoveCode; // Code to be executed before document is removed. Should be only body of a function with args: (userId, doc)
		string AfterInsertCode; // Code to be executed after new document is inserted into collection. Should be only body of a function with args: (userId, doc). See <a href="https://github.com/matb33/meteor-collection-hooks" target="_blank">meteor-collection-hooks</a> package for more details.
		string AfterUpdateCode; // Code to be executed after document is updated. Should be only body of a function with args: (userId, doc, fieldNames, modifier, options)
		string AfterRemoveCode; // Code to be executed after document is removed. Should be only body of a function with args: (userId, doc)

		string BeforeInsertSourceFile; // File that contains code to be executed before new document is inserted (relative to input JSON file). See "before_insert_code".
		string BeforeUpdateSourceFile; // File that contains code to be executed before document is updated (relative to input JSON file). See "before_update_code".
		string BeforeRemoveSourceFile; // File that contains code to be executed before document is removed (relative to input JSON file). See "before_remove_code".
		string AfterInsertSourceFile; // File that contains code to be executed after new document is inserted (relative to input JSON file). See "after_insert_code".
		string AfterUpdateSourceFile; // File that contains code to be executed after document is updated (relative to input JSON file). See "after_update_code".
		string AfterRemoveSourceFile; // File that contains code to be executed after document is removed (relative to input JSON file). See "after_remove_code".
		// ---

		string OriginalName;

		CWCollection(CWObject* pParent);
		virtual ~CWCollection();

		virtual void GetMetadata(CWJSONObject* pMeta);
		virtual void GetSimpleSchema(CWJSONObject* pSchema);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		string GetOriginalName();

		string Variable();
		string InsertMethodName();
		string UpdateMethodName();
		string RemoveMethodName();

		virtual bool Create(string* pErrorMessage);
};

class CWQuery: public CWObject
{
	public:
		// --- properties
		string Collection; // Name of existing collection
		bool FindOne; // If set to true query will return single document: findOne(). Default: false
		CWJSONObject* Filter; // Mongo query expression. Will be passed as first argument to find() or findOne(). Can contain route params in form ":paramName". String "Meteor.userId()" is treated in special way: at the client it remains `Meteor.userId()` but at the server (in publication) it will be converted to `this.userId`. 
		CWJSONObject* Options; // Options parameter passed as second argument to find() or findOne().
		CWSubscriptions* RelatedQueries; // Page which subscribes to this query will also subscribe to related queries (for example: this is useful if you are using transform function that uses data from other collection).
		CWVariables* Variables; // Filter and Options object can contain variable (string value starting with "%" sign is treated as variable). You can specify value for each variable here (value can also be a function).
		// ---
		bool UsedByDataview;

		CWStringList* SpecialParams;

		CWQuery(CWObject* pParent);
		virtual ~CWQuery();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);

		void ExtractParams(CWStringList* pList);
		void ExtractVars(CWStringList* pList);

		bool Matches(CWQuery* pQuery);
		
		bool ClientFindFunction(CWParams* pSubscriptionParams, string* pResult, CWStringList* pParamVars, CWStringList* pCollectionIncludes, string* pErrorMessage);
		bool ServerFindFunction(string* pResult, string* pPublication, string* pExportMethod, CWStringList* pCollectionIncludes, bool bUseExtraOptions, string* pErrorMessage);
};


class CWSubscription
{
	public:
		// --- properties
		string Name; // Publication name (Query name)
		CWParams* Params; // Params
		// ---

		CWSubscription();
		virtual ~CWSubscription();

		virtual void GetMetadata(CWJSONObject* pMeta);
		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);

		void GetSubscriptionArguments(CWApplication* pApp, bool bInsideTracker, string* pArguments, CWStringList* pParamVars);
};


class CWSubscriptions: public CWArray<CWSubscription*>
{
	public:
		CWSubscriptions();
		virtual ~CWSubscriptions();

		bool LoadFromJSON(CWJSONArray* pList, string *pErrorMessage);
		bool SaveToJSON(CWJSONArray* pList, string *pErrorMessage);
		CWSubscription* GetSubscription(string sName);

		void AddUnique(CWSubscription* pSubscription);
		void MergeUnique(CWSubscriptions* pSubscriptions);
};

class CWComponent: public CWObject
{
	public:
		// --- properties
		string Type; // Component type name.
		string Template; // Built-in html and js template file name (without extension) contained in kitchen templates directory.
		string CustomTemplate; // Custom html and js template filename (without extension). Path is relative to input JSON file.
		string HTML; // Custom HTML code (for "blaze" applications only - ignored if "react" is used)
		string JS; // Custom JS code (for "blaze" applications only - ignored if "react" is used)
		string JSX; // Custom JSX code (for "react" applications only - ignored if "blaze" is used)
		CWGasoline* Gasoline; // Input for gasoline-turbo (generates both blaze and react from the same input)
		bool UseGasoline; // If set to true, generator will ignore HTML, JS and JSX members, and will use gasoline-turbo to build template(s)
		CWStringList* Imports; // list of modules to import. Example: `import {X} from "Y";` ("react" applications only)
		string DestSelector; // destination html element selector. Similar to jQuery selector, but only three simple formats are supported: "tagname", "#element_id" and ".class_name".
		string DestPosition; // destination position relative to destination element: "top", "bottom", "before" or "after". Default: "bottom"
		string Class; // CSS class name to be added to component
		string Title; // Component title
		string TitleIconClass; // If present, "span" with this class name will be added to title (if title is set)
		string ShowCondition; // Show component only if condition is satisfied
		string TemplateCreatedCode; // Code to be executed when template is created (before it is rendered)
		string TemplateRenderedCode; // Code to be executed when template is rendered
		string TemplateDestroyedCode; // Code to be executed before template is destroyed
		string EventsCode; // Content of Template.TEMPLATE_NAME.events({ ... });
		string HelpersCode; // Content of Template.TEMPLATE_NAME.helpers({ ... });

		string QueryName; // Query (publication) name from application.queries used as main data context. Page's router will subscribe to this publication automatically.
		CWParams* QueryParams; // Query (publication) params
		string BeforeSubscriptionCode; // Code to execute just before component is subscribed to data.
		string CustomDataCode; // Code to execute after data is read from database just before it is returned to program flow. (executes before iron-router `data` function returns or in React apps before `withTracker` returns). You can modify `data` variable here.

		CWArray<CWComponent*> *Components; // Component list
		// ---
		
		CWStringList* ReplaceStrings;

		CWSubscription* Subscription; // used internally by generator
		CWStringList* InternalImports; // used internally by generator

		bool CustomHTML;
		bool CustomJS;
		bool CustomJSX;
		CWJSONObject* OriginalGasoline;

		string AddHelpers;
		string AddEvents;
		CWStringList* AddBindings;

		CWComponent(CWObject* pParent);
		virtual ~CWComponent();

		virtual void GetMetadata(CWJSONObject* pMeta);

		bool HasMenuWithRoute(string sRouteName);
		CWZone* ParentZone();
		CWPage* ParentPage(bool bZoneIsPage);
		CWZoneType GetZoneType();

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool ReadSettings(CWPackages* pPackages, CWArray<CWFilePair*>* pCopyFiles, string* pErrorMessage);

		virtual string TemplateName(); // template name=...
		virtual string TemplateFile(); // full path to template file without extension
		virtual string SettingsFile(); // full path to settings file with .json extension

		virtual CWQuery* GetMainQuery();
		virtual CWCollection* GetCollection();
		virtual string GetCollectionName();
		virtual string GetCollectionVar();
		virtual string GetCollectionInsertMethodName();
		virtual string GetCollectionUpdateMethodName();
		virtual string GetCollectionRemoveMethodName();
		virtual string GetQueryName();
		virtual string GetComponentID();
		virtual void GetUsedCollections(CWStringList* pCollections);

		virtual CWSubscription* GetMainSubscription();
		virtual bool GetSubscriptions(CWSubscriptions *pSubscriptions, string* pErrorMessage);

		virtual void GetBeforeSubscriptionCode(string* pCode);
		virtual void GetCustomDataCode(string* pCode);

		virtual CWArray<CWField*> *GetFields();
		
		virtual int ComponentIndex(CWComponent* pComponent);
		virtual bool HasComponentWithDestination(string sSelector, bool bRecourse);
		virtual void GetComponentsUsingQuery(CWQuery* pQuery, CWArray<CWComponent*> *pComponents);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool Create(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);

		virtual bool GenerateBlaze(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage);
		virtual bool GenerateReact(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage);
		virtual bool Generate(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage);
};


class CWPlugin: public CWComponent
{
	public:
		// --- properties
		CWJSONObject* Properties; // Custom properties. This object will be provided to plugin processing code.
		// ---

		CWJSONObject* PluginData;
		string PluginTemplate;

		CWPlugin(CWObject* pParent);
		virtual ~CWPlugin();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		string PluginDir();
		string TemplateFile();
		string SettingsFile();

		virtual bool Generate(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage);
};

class CWRoute
{
	public:
		CWZoneType Type;
		bool Zoneless;
		string Route;
		string URL;
		string Title;
		string ControllerName;
		CWStringList* Roles;

		CWRoute();
		virtual ~CWRoute();

		virtual void Clear();
};

class CWServerSideRoute: public CWObject
{
	public:
		// --- properties
		CWStringList* RouteParams; // Route params to be passed via URL
		string Path; // Route path. Not mandatory: if ommited path is constructed from route name and route_params.
		string SourceFile; // path to external file containing route action code (relative to input JSON file).
		string SourceContent; // path to external file containing route action code (relative to input JSON file).
		// ---
		CWServerSideRoute(CWObject* pParent);
		virtual ~CWServerSideRoute();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
};

class CWRouter: public CWObject
{
	public:
		CWArray<CWRoute*> *Map;
		CWStringList* Roles;
		CWJSONObject* Config;

		CWRouter(CWObject* pParent);
		virtual ~CWRouter();
		void Clear();

		string DefaultFreeRoute();
		string DefaultPublicRoute();
		string DefaultPrivateRoute();

		void PublicRoutes(CWStringList* pRoutes);
		void PrivateRoutes(CWStringList* pRoutes);
		void ZonelessRoutes(CWStringList* pRoutes);
		CWRoute* GetRoute(string sRouteName);
		CWRoute* GetPublicRoute(string sRouteName);
		CWRoute* GetPrivateRoute(string sRouteName);
		CWRoute* GetFreeRoute(string sRouteName);

		void GetRoleMap(string* pRoleMap, string* pPublicList, string* pPrivateList, string* pFreeList);
		void GetHomeRoutes(string *pPublicHome, string* pPrivateHome, string* pFreeHome, string* pRootRoute);

		virtual bool CreateIron(string* pClientJS, string* pServerJS, string* pErrorMessage);
		virtual bool CreateFlow(string* pClientJS, string* pServerJS, string* pErrorMessage);
		virtual bool Create(string* pClientJS, string* pServerJS, string* pErrorMessage);

		bool Prepare(string* pErrorMessage);
		bool Generate(string* pErrorMessage);
};

class CWPage: public CWComponent
{
	public:
		// --- properties
		bool UserDefinedTemplate; // If set to true then built-in template will be ignored and "html", "js" and "jsx" properties will be used.
		string MetaDescription; // Meta description
		string MetaTitle; // Head title tag and meta title
		string Text; // Text to be inserted into page
		string BackgroundImage; // Background image URL
		string ContainerClass; // Class to be added to page container. Example: "container-fluid". Default "container".
		CWStringList* RouteParams; // Route params to be passed via URL
		string CloseRoute; // If specified, page will have close button routing to this route
		string BackRoute; // Route name of page to navigate on back button click. Mandatory field for back button to appear
		CWParams* CloseRouteParams; // Params to be passed to close_route
		CWParams *BackRouteParams; // Route params to be passed to "back_route"

		CWStringList* Roles; // User roles allowed to access this page
		CWArray<CWPage*> *Pages; // Subpages
		CWSubscriptions *RelatedQueries; // List of additional queries (publications) to subscribe

		string RenderSubpages; // Should page render subpages in "subcontent" area? "auto" = only if page has menu pointing to subpages. "never" - never, "always" - always

		bool ForceYieldSubpages; // Deprecated. Please use "render_subpages" property instead.
		bool Zoneless; // Deprecated - will be removed soon. For applications with user account system: make this page visible for both authenticated and non-authenticated users
		bool ParentLayout; // If set to true parent page will be used as layoutTemplate. Default: false
		string LayoutTemplate; // Custom layout template name

		string ControllerBeforeAction; // code to execute inside route controller "onBeforeAction" hook
		string ControllerAfterAction; // code to execute inside route controller "onBeforeAction" hook
		// ---

		CWStringList* IncludeFiles;

		CWPage(CWObject* pParent);
		virtual ~CWPage();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		bool HasMenuWithSubpageRoute();
		CWPage* RedirectToSubpage();

		virtual string URL(); // relative URL
		virtual string Route(); // route name
		virtual string TemplateName(); // template name=...

		string ControllerName(); // controller name

		string GetTitle();
		string GetMetaTitle();
		string GetDescription();
		string GetFooterText();

		void GetRoles(CWStringList* pRoles); // roles that this page is restricted to
		bool GetAllRoles(CWStringList* pRoles, string* pErrorMessage); // roles from this page and from subpages
		void GetAllRoutes(CWRouter* pRouter);
		void GetYields(string* pTopTemplate, CWStringList* pYields, CWStringList* pTemplates, CWStringList* pRegions, bool* pZoneIsNotRoot);

		virtual string TemplateFile(); // full path to template file without extension
		virtual string DestDir(); // relative destination directory
		virtual string DestFilename(); // destination filename without path and extension

		virtual bool ReadSettings(CWPackages* pPackages, CWArray<CWFilePair*>* pCopyFiles, string* pErrorMessage);

		virtual bool GetParentSubscriptions(CWSubscriptions *pSubscriptions, string* pErrorMessage);
		virtual bool GetSubscriptions(CWSubscriptions *pSubscriptions, string* pErrorMessage);

		virtual bool CreateSubscriptions(string* pJS, CWStringList* pCollectionIncludes, string* pErrorMessage);

		virtual bool CreateControllerBlaze(string* pJS, string* pErrorMessage);
		virtual bool CreateControllerReact(string* pJS, string* pErrorMessage);
		virtual bool CreateController(string* pJS, string* pErrorMessage);

		virtual bool CreatePageBlaze(CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreatePageReact(CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreatePage(CWNode* pHTML, string* pJS, string* pErrorMessage);

		virtual bool GeneratePageBlaze(string* pErrorMessage);
		virtual bool GeneratePageReact(string* pErrorMessage);
		virtual bool GeneratePage(string* pErrorMessage);
};

class CWZone: public CWPage
{
	public:
		CWZoneType ZoneType;

		// --- properties
		string Layout; // Built-in layout template name: "navbar", "sidenav", "sticky_footer" or "empty". Default: "navbar"
		string DefaultRoute; // "home" route for this zone.
		string NavbarClass; // CSS class name to be added to navbar.
		string FooterClass; // CSS class name to be added to footer.
		string FooterText; // Text to show in footer.
		// ---

		CWZone(CWObject* pParent);
		virtual ~CWZone();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual string URL(); // relative URL
		virtual string Route(); // route name
		virtual string TemplateName(); // template name=...

		virtual string TemplateFile(); // full path to template file without extension
		virtual string DestDir(); // relative destination directory
		virtual string DestFilename(); // destination filename without path and extension

		virtual bool GenerateZoneBlaze(string* pErrorMessage);
		virtual bool GenerateZoneReact(string* pErrorMessage);
		virtual bool GenerateZone(string* pErrorMessage);
};

class CWFilePair
{
	public:
		// --- properties
		string Source; // Source file to copy. Can be path to local file relative to input JSON or URL (starts with "http://" or "https://").
		string SourceContent; // If source file is not specified, this content will be written into destination file.
		string Dest; // Destination file. You can use directory aliases: OUTPUT_DIR, CLIENT_DIR, CLIENT_LIB_DIR, CLIENT_COMPONENTS_DIR, CLIENT_STYLES_DIR, CLIENT_STYLES_DEFAULT_DIR, CLIENT_STYLES_THEME_DIR, CLIENT_VIEWS_DIR, CLIENT_VIEWS_NOT_FOUND_DIR, CLIENT_VIEWS_LOADING_DIR, LIB_DIR, SETTINGS_DIR, BOTH_DIR, BOTH_LIB_DIR, BOTH_COLLECTIONS_DIR, PUBLIC_DIR, PUBLIC_IMAGES_DIR, PUBLIC_FONTS_DIR, PRIVATE_DIR, SERVER_DIR, SERVER_LIB_DIR, SERVER_COLLECTIONS_DIR, SERVER_PUBLISH_DIR, SERVER_ROUTER_DIR, SERVER_METHODS_DIR
		// ---
		bool NoEcho;

		CWFilePair() { Source = ""; Dest = ""; SourceContent = "", NoEcho = true; }
		virtual ~CWFilePair() {}

		virtual void GetMetadata(CWJSONObject* pMeta);
};

class CWPackages
{
	public:
		// --- properties
		CWStringList* Meteor; // List of meteor packages. Packages listed here will be added to your application.
		CWStringList* Npm; // List of npm packages.
		CWStringList* Mrt; // List of meteorite packages (deprecated)
		// ---

		CWPackages();
		virtual ~CWPackages();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
};

class CWApplication: public CWObject
{
	public:
		// --- properties
		string Title; // Application title
		string MetaTitle; // Default meta_title for pages without meta_title
		string MetaDescription; // Default meta_description for pages without meta_description
		string Templating; // "blaze" or "react". Default: "blaze". Note: "react" is not fully implemented yet.
		string Frontend; // "bootstrap3", "semantic-ui", "materialize" or "aframe". Default: "bootstrap3". "materialize" and "aframe" are not fully implemented yet. "aframe" works only with "react".
		string Theme; // Visual theme name. With "bootstrap" frontend theme can be "flat-ui" or one of bootswatch themes: "bootswatch-amelia", "bootswatch-cerulean", "bootswatch-cosmo", "bootswatch-cyborg", "bootswatch-darkly", "bootswatch-flatly", "bootswatch-journal", "bootswatch-lumen", "bootswatch-paper", "bootswatch-readable", "bootswatch-sandstone", "bootswatch-simplex", "bootswatch-slate", "bootswatch-solar", "bootswatch-spacelab", "bootswatch-superhero", "bootswatch-united", "bootswatch-yeti"
		bool Animate; // If set to true, animate.css will be included and all elements with "animated" css class will be animated when they reach viewport (on scroll and on resize)
		string FooterText; // Text to show in page footer
		CWStringList* Roles; // List of user roles for applications with user account system. There are two predefined roles "nobody" and "owner" (see collection object for more info).
		string DefaultRole; // Default role for new users
		bool UseCollection2; // Experimental feature. If set to true, schema will be generated and Collection2 package will be used for collections. Default: false
		CWArray<CWCollection*> *Collections; // Mongo database collections
		CWArray<CWQuery*> *Queries; // List of database queries (publications).
		CWZone *FreeZone; // Free zone (for application without user account system)
		CWZone *PublicZone; // Public zone (for app with user account system). Pages inside this zone are accessible only for non-authenticeted users.
		CWZone *PrivateZone; // Private zone (for app with user account system). Pages inside this zone are accessible only for authenticeted users.

		bool LoginWithPassword; // Allow login with password (for app with user account system only). Default: true
		bool SendVerificationEmail; // After user account registration, e-mail with verification link will be sent to user. Default: false
		bool LoginWithGoogle; // Allow OAuth login with google account (for app with user account system only). Default: false
		bool LoginWithGithub; // Allow OAuth login with github account (for app with user account system only). Default: false
		bool LoginWithLinkedin; // Allow OAuth login with linkedin account (for app with user account system only). Default: false
		bool LoginWithFacebook; // Allow OAuth login with facebook account (for app with user account system only). Default: false
		bool LoginWithTwitter; // Allow OAuth login with twitter account (for app with user account system only). Default: false
		bool LoginWithMeteor; // Allow OAuth login with meteor developer account (for app with user account system only). Default: false
		bool LoginWithAuth0; // Allow OAuth login with Auth0 (for app with user account system only). Default: false

		string ServerStartupCode; // javascript code to execute at server startup
		string ClientStartupCode; // javascript code to execute at client startup
		string OnUserCreatedCode; // javascript code to execute when new user is created (Accounts.onCreateUser)
		string OnUserLoggedCode; // javascript code to execute when user is logged in (Accounts.onLogin)
		string GlobalOnRenderedCode; // javascript code to execute when any page is rendered

		string ServerStartupSourceFile; // File that contains javascript code to execute at server startup (relative to input file)
		string ClientStartupSourceFile; // File that contains javascript code to execute at client startup (relative to input file)
		string OnUserCreatedSourceFile; // File that contains javascript code to execute when new user is created (relative to input file)
		string OnUserLoggedSourceFile; // File that contains javascript code to execute when user is logged in (relative to input file)

		CWStringList* ServerStartupImports; // list of modules to import into server startup file. Example: `import {X} from "Y";` ("react" applications only)
		CWStringList* ClientStartupImports; // list of modules to import into client startup file. Example: `import {X} from "Y";` ("react" applications only)

		string MobileConfig; // If non-empty: will be written to mobile-config.js in app root

		string Stylesheet; // CSS/LESS stylesheet. If non-empty, will be written to CLIENT_STYLES_DIR/user_styles.less

		CWArray<CWServerSideRoute*> *ServerSideRoutes; // List of server side routes.
		CWArray<CWFilePair*> *CopyFiles; // List of files to copy into destination directory. You can use directory aliases. See <a href="#file_pair">file_pair</a> for more details.


		CWPackages* Packages; // List of additional meteor and meteorite packages that will be automatically added by generator
		CWJSONObject* RouterConfig; // Optional parameter passed to Router.config()
		// ---

		// --- prepare
		bool UseAccounts;
		string TemplateDir;
		string TemplateUiDir;
		string TemplateUiComponentsDir;
		string TemplateUiPagesDir;
		string TemplateUiLayoutsDir;
		string TemplateCodeDir;
		string PluginsDir;

		// settings
		CWStringList* AutoImportDirsClient;
		CWStringList* AutoImportDirsServer;

		CWPackages* PackagesToAdd;
		CWArray<CWFilePair*> *FilesToCopy;
		
		CWJSONObject* AddToMeteorSettings;

		CWRouter* Router;

		bool FreshApp;

		// --- generate
		string InputDir;
		string OutputDir;
		string StartupDir;
		string ClientDir;
		string ClientStartupDir;
		string ClientUIDir;
		string ClientLibDir;
		string ClientGlobalsDir;
		string ClientComponentsDir;
		string ClientStylesDir;
		string ClientStylesFrameworkDir;
		string ClientStylesDefaultDir;
		string ClientStylesThemeDir;
		string ClientViewsDir;
		string ClientViewsNotFoundDir;
		string ClientViewsLoadingDir;
		string ClientViewsLayoutDir;
		string ClientRouterDir;
//		string ClientActionsDir;
//		string ClientContainersDir;
//		string ClientConfigsDir;

		string ImportsDir;
		string LibDir;
		string SettingsDir;
		string PackagesDir;

		string BothDir;
		string BothLibDir;
		string BothCollectionsDir;
		string BothJoinsDir;
		string BothRouterDir;
		string BothRouterControllersDir;

		string PublicDir;
		string PublicImagesDir;
		string PublicFontsDir;

		string PrivateDir;

		string ServerDir;
		string ServerStartupDir;
		string ServerLibDir;
		string ServerCollectionsDir;
		string ServerCollectionsRulesDir;
		string ServerPublishDir;
		string ServerRouterDir;
		string ServerMethodsDir;

		bool Coffee;
		bool Jade;

		CWStringList* TargetPlatforms;
		
		string ForceMeteorVersion;

		string ForceTemplating;
		bool UnsafePerm;
		bool InputFileIsInTempDir;
		string CWD;
		// ---

		CWJSONObject* OldOutput;

		CWStringList* OutputFiles;
		CWStringList* OutputDirectories;

		CWStringList* Warnings;
		
		CWStringList* TempFiles;
		

		CWApplication(CWObject* pParent);
		virtual ~CWApplication();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		void Log(string sText);
		void Warning(string sText);
		
		bool SaveString(string sFileName, const string& sString, int iTimeoutMS, string* pErrorMessage);
		bool SaveString(string sFileName, string* pString, int iTimeoutMS, string* pErrorMessage);
		bool SaveHTML(string sPath, CWNode* pNode, string* pErrorMessage);
		bool SaveJSX(string sPath, CWNode* pNode, string* pErrorMessage);
		bool SaveJade(string sPath, CWNode* pNode, string* pErrorMessage);
		bool HTMLtoJade(string sHTMLPath, string sJadePath, string* pErrorMessage);
		bool FCopy(string sSource, string sDest, bool bFailIfExists, int iTimeoutMS, string* pErrorMessage);
		bool MkDir(string sDirName, bool bFailIfExists, string* pErrorMessage);

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		bool LoadFromFile(string sInputFile, string* pErrorMessage);

		CWCollection* GetCollection(string sName);
		void ExtractImports(string sFileContent, CWStringList* pImports);
		void GetCollectionImportsForFile(string sFileContent, CWStringList* pImports, bool bUsersOnly);

		// --- prepare
		bool ReadSettings(string* pErrorMessage);
		bool Prepare(string* pErrorMessage);
		string FrontendName();
		string TemplatingName();

		bool GetAllQueries(CWArray<CWQuery*> *pQueries, string* pErrorMessage);
		CWQuery* GetQuery(string sName);

		// --- generate
		string RelativeToOutputDir(string sFileName, bool bForceSlash);
		string ReplaceDirAlias(string sPath, string sAlias, string sDir, bool bRelativeToOutputDir, bool bForceSlash);
		string ReplaceDirAlias(string sPath, bool bRelativeToOutputDir = false, bool bForceSlash = false);
		void ReplaceDirAlias(CWStringList* pPathList, bool bRelativeToOutputDir = false, bool bForceSlash = false);
		
		bool ImportsForFileOrDir(string sPath, string sCommaDelimitedExtensions, CWStringList* pImports, bool bCSS, string* pErrorMessage);

		bool MeteorCreate(string sOutputDir, string* pErrorMessage);
		bool MeteorAdd(string* pErrorMessage);
		bool MeteorRemove(CWStringList* pRemovePackages, string* pErrorMessage);
		bool MeteorNpmInstall(string* pErrorMessage);
		bool MeteorAddPlatforms(string* pErrorMessage);
		bool CreateDirectoryStructureBlaze(string* pErrorMessage);
		bool CreateDirectoryStructureReact(string* pErrorMessage);
		bool CreateDirectoryStructure(string* pErrorMessage);

		bool Generate(string sInputFile, string sInputDir, string sOutputDir, bool bCoffee, bool bJade, CWStringList* pTargetPlatforms, string sForceMeteorVersion, string sForceTemplating, bool bUnsafePerm, bool bInputFileIsInTempDir, string sCWD, string* pErrorMessage);
};


// ***************************************************
// COMPONENTS
// ***************************************************

class CWMenuItem: public CWObject
{
	public:
		// --- properties
		string Title; // Item title as appears in menu
		string Route; // Route name of destination page
		CWParams *RouteParams; // Parameters to be passed to "route"
		string URL; // URL (for external links. You can use only one of "route" or "url" properties, not both)
		string Class; // CSS class name to be added to item `li` element
		string ItemsContainerClass; // CSS class for div containing subitems.
		string IconClass; // If present, generator will add `span` into menu item and assign this CSS class to it
		string Target; // Anchor "target" attribute value e.g. "_blank"
		CWArray<CWMenuItem*> *Items; // Subitems
		string ActionCode; // Code to execute when user clicks menu item. If "route" is specified then this code will execute before route redirect.
		// ---

		CWMenuItem(CWObject* pParent);
		virtual ~CWMenuItem();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pTemplate, CWNode* pDestHTML, int iItemIndex, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pTemplate, CWNode* pDestHTML, int iItemIndex, string* pErrorMessage);

		bool HasItemWithRoute(string sRouteName);
};

class CWMenu: public CWComponent
{
	public:
		// --- properties
		CWArray<CWMenuItem*> *Items; // Menu items.
		string ItemsContainerClass; // CSS class for div containing menu items.
		string ScrollSpySelector; // "scrollspy" selector for menus with anchor links, usually "body".
		// ---

		CWMenu(CWObject* pParent);
		virtual ~CWMenu();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);

		bool HasItemWithRoute(string sRouteName);
};

class CWJumbotron: public CWComponent
{
	public:
		// --- properties
		string Text; // Text to be shown in jumbotron
		string ImageURL; // Background image URL
		string ButtonTitle; // Jumbotron button title
		string ButtonRoute; // Destination route name
		CWParams* ButtonRouteParams; // Parameters to be passed to destination route
		string ButtonClass; // CSS class to be added to jumbotron button
		// ---

		CWJumbotron(CWObject* pParent);
		virtual ~CWJumbotron();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
};

class CWForm: public CWComponent
{
	public:
		// --- properties
		string Mode; // "insert", "update" or "read_only"
		string Layout; // "default", "horizontal" or "inline"
		bool Autofocus; // If set to true, first focusable input element will have "autofocus" attribute set
		string SubmitRoute; // Route name of page to navigate after successfull submit. Mandatory field for submit button to appear
		string CancelRoute; // Route name of page to navigate on form cancelation. Mandatory field for cancel button to appear
		string CloseRoute; // Route name of page to navigate when user clicks "OK" button in "read_only" form. Mandatory field for close button to appear
		string BackRoute; // Route name of page to navigate on form back button. Mandatory field for back button to appear
		CWParams *SubmitRouteParams; // Route params to be passed to "submit_route"
		CWParams *CancelRouteParams; // Route params to be passed to "cancel_route"
		CWParams *CloseRouteParams; // Route params to be passed to "close_route"
		CWParams *BackRouteParams; // Route params to be passed to "back_route"

		string SubmitCode; // Custom code to execute on form submit
		string CancelCode; // Custom code to execute on form cancel

		string SubmitButtonTitle; // Text to show in submit button, default "Save"
		string CancelButtonTitle; // Text to show in cancel button, default "Cancel"
		string CloseButtonTitle; // Text to show in close button, default "OK"

		CWArray<CWField*> *Fields; // Defainition of form fields. If empty, generator will use fields defined at collection level.
		CWArray<CWHiddenField*> *HiddenFields; // Fields (not shown in a form) that will be automatically written on submit.
		// ---

		CWArray<CWField*> *ExternalFields;

		CWForm(CWObject* pParent);
		virtual ~CWForm();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual CWArray<CWField*> *GetFields();
		virtual bool GetSubscriptions(CWSubscriptions* pSubscriptions, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
};

class CWDataView: public CWComponent
{
	public:
		// --- properties
		string TextIfEmpty; // Text to show if collection is empty.
		string TextIfNotFound; // Text to show if search string is not found.
		string DeleteConfirmationMessage; // Text to show in delete confirmation box.
		CWArray<CWField*> *Fields; // Definition of table columns. If empty, generator will use fields defined at collection level.
		int PageSize; // When page size is > 0 then data is "paged" - loaded and displayed page by page (page_size items per page). Default is 0 (no paging - entire dataset is displayed).

		string InsertRoute; // Route name of page containing insert form
		string DetailsRoute; // Route name of page showing selected item details (usually page containing form of type "read_only").
		string EditRoute; // Route name of page containing edit form. Makes edit_route_params field mandatory in most cases to be functional.
		string DeleteRoute; // Route name to execute when user clicks "delete". Not mandatory - generator will automatically produce code for delete operation.

		CWParams *InsertRouteParams; // Parameters to be passed to "insert_route"
		CWParams *DetailsRouteParams; // Parameters to be passed to "details_route"
		CWParams *EditRouteParams; // Parameters to be passed to "edit_route"
		CWParams *DeleteRouteParams; // Parameters to be passed to "delete_route"

		CWActions *Actions; // Custom actions (method call and/or redirect to route)
		CWActions *ItemActions; // Custom item actions (method call and/or redirect to route)

		string InsertButtonTitle; // Insert button title
		string DetailsButtonTitle; // Details button title
		string EditButtonTitle; // Edit button title
		string DeleteButtonTitle; // Delete button title

		CWStringList* Views; // View styles: "table", "list", "cards" or "blog". Default: "table".
		bool SearchEngineStyle; // If this member is "true" then large search box is shown initially. User must enter search string in order to see the data.

		string OnItemClickedCode; // Code to execute when item is clicked (before redirect if DetailsRoute is specified)
		// ---

		CWStringList* AddItemBindings;

		CWDataView(CWObject* pParent);
		virtual ~CWDataView();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual CWArray<CWField*> *GetFields();

		virtual bool CreateTableBlaze(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage);
		virtual bool CreateBlogBlaze(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage);
		virtual bool CreateListBlaze(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage);
		virtual bool CreateCardsBlaze(CWNode* pRootHTML, CWNode* pHTML, string* pParentJS, string* pErrorMessage);

		virtual bool CreateTableReact(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage);
		virtual bool CreateBlogReact(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage);
		virtual bool CreateListReact(CWNode* pRootHTML, CWNode* pParentHTML, string* pParentJS, string* pErrorMessage);
		virtual bool CreateCardsReact(CWNode* pRootHTML, CWNode* pHTML, string* pParentJS, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);

		void ExtractDataMembers(string sCode, string sObjectVar, CWStringList* pList);
};


class CWTreeView: public CWComponent
{
	public:
		// --- properties
		string ItemNameField; // Collection field shown as folder and item title
		string ItemTypeField; // Collection field that stores item type. Can be "dir" or "item".

		string CollapsedIconClass; // CSS class for collapsed folder icon. Default: "fa fa-caret-right"
		string ExpandedIconClass; // CSS class for expanded folder icon. Default: "fa fa-caret-down"

		string ItemRoute; // Navigate to this route when item is clicked
		CWParams *ItemRouteParams; // Parameters to be passed to "item_route"

		string FolderRoute; // Navigate to this route when folder is clicked
		CWParams *FolderRouteParams; // Parameters to be passed to "folder_route"
		// ---

		CWTreeView(CWObject* pParent);
		virtual ~CWTreeView();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
};

class CWMarkdown: public CWComponent
{
	public:
		// --- properties
		string Source; // Markdown here
		string SourceFile; // Path to file containing markdown (relative to input file)
		// ---

		CWMarkdown(CWObject* pParent);
		virtual ~CWMarkdown();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
};

class CWDiv: public CWComponent
{
	public:
		// --- properties
		string Text; // this text will be added into div
		// ---

		CWDiv(CWObject* pParent);
		virtual ~CWDiv();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
};

class CWSection: public CWComponent
{
	public:
		// --- properties
		string Text; // this text will be added into section
		// ---

		CWSection(CWObject* pParent);
		virtual ~CWSection();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
};

class CWEditableContent: public CWComponent
{
	public:
		// --- properties
		string TextIfEmpty; // text to show if no content
		// ---

		CWEditableContent(CWObject* pParent);
		virtual ~CWEditableContent();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
};

class CWCMSContent: public CWComponent
{
	public:
		// --- properties
		string TextIfEmpty; // text to show if no content
		// ---

		CWCMSContent(CWObject* pParent);
		virtual ~CWCMSContent();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
};

class CWChart: public CWComponent
{
	public:
		// --- properties
		string ChartType;
		string ValueField;
		string CategoryField;
		string TimeSeriesField;
		string DateFormat;
		// ---

		CWChart(CWObject* pParent);
		virtual ~CWChart();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();

		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);

		virtual bool CreateBlaze(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
		virtual bool CreateReact(CWNode* pRootHTML, CWNode* pRawTemplate, CWNode* pHTML, string* pJS, string* pErrorMessage);
};


class CWCustomComponent: public CWComponent
{
	public:
		// --- properties
		// ---

		CWCustomComponent(CWObject* pParent);
		virtual ~CWCustomComponent();

		virtual void GetMetadata(CWJSONObject* pMeta);
};




class CWGasoline: public CWObject
{
	public:
		// --- properties
		CWArray<CWGasTemplate*> *Templates;
		// ---

		CWGasoline(CWObject* pParent);
		virtual ~CWGasoline();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};

class CWGasEvent: public CWObject
{
	public:
		// --- properties
		string Event;
		string Handler;
		// ---

		CWGasEvent(CWObject* pParent);
		virtual ~CWGasEvent();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};

class CWGasNode: public CWObject
{
	public:
		// --- properties
		// ---

		CWGasNode(CWObject* pParent);
		virtual ~CWGasNode();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};

class CWGasText: public CWGasNode
{
	public:
		// --- properties
		string Text;
		// ---

		CWGasText(CWObject* pParent);
		virtual ~CWGasText();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};

class CWGasElement: public CWGasNode
{
	public:
		// --- properties
		CWArray<CWGasNode*> *Children;
		// ---

		CWGasElement(CWObject* pParent);
		virtual ~CWGasElement();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};


class CWGasHandler: public CWObject
{
	public:
		// --- properties
		string Code;
		// ---

		CWGasHandler(CWObject* pParent);
		virtual ~CWGasHandler();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};


class CWGasHelper: public CWObject
{
	public:
		// --- properties
		string Code;
		// ---

		CWGasHelper(CWObject* pParent);
		virtual ~CWGasHelper();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};

class CWGasTemplate: public CWGasElement
{
	public:
		// --- properties
		CWArray<CWGasHandler*> *Handlers;
		CWArray<CWGasHelper*> *Helpers;
		// ---

		CWGasTemplate(CWObject* pParent);
		virtual ~CWGasTemplate();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};

class CWGasHTML: public CWGasElement
{
	public:
		// --- properties
		string Element;
		string Selector;
		CWArray<CWParam*> *Attributes;
		CWArray<CWGasEvent*> *Events;
		// ---

		CWGasHTML(CWObject* pParent);
		virtual ~CWGasHTML();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};

class CWGasLoop: public CWGasElement
{
	public:
		// --- properties
		string Dataset;
		// ---

		CWGasLoop(CWObject* pParent);
		virtual ~CWGasLoop();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};

class CWGasCondition: public CWGasElement
{
	public:
		// --- properties
		string Condition;
		// ---

		CWGasCondition(CWObject* pParent);
		virtual ~CWGasCondition();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};


class CWGasConditionTrue: public CWGasElement
{
	public:
		// --- properties
		// ---

		CWGasConditionTrue(CWObject* pParent);
		virtual ~CWGasConditionTrue();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};

class CWGasConditionFalse: public CWGasElement
{
	public:
		// --- properties
		// ---

		CWGasConditionFalse(CWObject* pParent);
		virtual ~CWGasConditionFalse();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};

class CWGasInclusion: public CWGasElement
{
	public:
		// --- properties
		string Template;
		// ---

		CWGasInclusion(CWObject* pParent);
		virtual ~CWGasInclusion();

		virtual void GetMetadata(CWJSONObject* pMeta);

		virtual void Clear();
		virtual bool LoadFromJSON(CWJSONObject* pJSON, string sDefaultName, string* pErrorMessage);
		virtual bool SaveToJSON(CWJSONObject* pJSON, string* pErrorMessage);
};


#endif // CPPW_METEOR_KITCHEN_H
