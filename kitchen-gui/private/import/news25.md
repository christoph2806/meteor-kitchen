Now you can set query params. See <a href="{{urlFor 'api_reference'}}">API docs</a> `query` object `params` property.
Example query with params:
```
{
	"name": "example",
	"collection": "invoices",
	"filter": { "date": ":theDate" },
	"params": [
		{ "name": "theDate", "value": "Session.get('something');" }
	]
}
```
In this example `theDate` is query param.
Resulting controller code:
```
var theDate = Session.get('something');
...
Meteor.subscribe("example", theDate);
```
Params that are not listed in `params` array are treated as route params and resulting controller code will be:
```
Meteor.subscribe("example", this.params.theDate);
```
