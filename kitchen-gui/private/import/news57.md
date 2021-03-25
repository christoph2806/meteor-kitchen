### New features
**Input file structure is changed** 
**Why it is changed?**
We are preparing for the new GUI and some redundancies and mistakes by design should be fixed before we dive too far into it.
**Compatibility with previous versions**
GUI
All your applications that resides in GUI are automatically converted to the new structure.
CLI
Don't worry - CLI is backward compatible and your apps with old structure will be built correctly but you'll experience warning messages. Please consider converting your input file structure into new format.
**How to convert?**
- **option 1** - automatically using GUI: login into GUI, create new application (any, minimal), goto "Edit source" page, clear JSON editor and paste your input file here. Click "Save", navigate to any page and come back to JSON editor - your file will be converted. You'l be sure that everything went fine if generator builds application without warnings.
- **option 2** - manually. You can follow instructions you get from warnings printed while generating application, and here is what is changed:
**What is changed?**
**Menus** - no more `menus` array in "zone" and "page" objects. Menu is just a component as any other, so put your menus into `components` array.
Old:
```json
{
	"application": {
		"free_zone": {
			"pages": [
			],
			"menus": [
				{ ...your menu was here... }
			]
		}
	}
}
```
New:
```json
{
	"application": {
		"free_zone": {
			"pages": [
			],
			"components": [
				{ ...your menu is now here... }
			]
		}
	}
}
```
*(don't forget to set your menu object's `"type": "menu"`)*
**Queries** - defining query in each page and/or component leads to redundant code - the same query can appear in many pages and components and you was forced to repeat it's definition. Also, it was hard to maintain redundant queries.
Now, all queries are defined in `application.queries` array:
```
{
	"application": {
		"collections": [
			{ "name": "customers" }
		],
		"queries": [
			{
				"name": "all_customers",
				"collection": "customers",
				"filter": {},
				"options": {}
			}
		]
	}
}
```
Once defined, query can be referenced from any page and component just by name:
```
{
	"name": "my_cool_page",
	"query_name": "all_customers",
	"query_params": []
}
```
*(please check "Getting started" page about queries for more details)*
### Bugfixes
- There was a bug in a GUI - if application created with GUI contains any collection, you couldn't built app from GUI (error was: collection "collection_name" is of unknown type "string"). Application still can be built from CLI. Problem was that GUI sets wrong `"type": "string"` to collection object (instead `"type": "collection"`).
- A lot of small bugs are fixed (and maybe a lot of fresh new bugs are produced :)
