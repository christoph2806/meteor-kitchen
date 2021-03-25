/* 
	Plugin example 2
	----------------

	Demonstrates how to:

		- insert meteor template with events into page
		- use meteor package which is automatically added into your application (see plugin.json)

*/

var kitchen = require("meteor-kitchen");

// read input
var component = kitchen.getInput();

// create some html
component.html = '';
component.html += '<template name="TEMPLATE_NAME">';
component.html += '    <p>';
component.html += '        <strong>Hello! I am example plugin No.2:</strong> template with events ';
component.html += '        <button class="btn btn-danger">Click me! <span class="badge">{{clickCounter}}</span></button>';
component.html += '    </p>';
component.html += '</template>';

// create some js
component.js = function() {

	Template.TEMPLATE_NAME.events({
		"click button": function(e, t) {
			e.preventDefault();
			var clickCounter = pageSession.get("clickCounter") || 0;
			clickCounter++;
			pageSession.set("clickCounter", clickCounter);
		}
	});

	Template.TEMPLATE_NAME.helpers({
		"clickCounter": function() { return pageSession.get("clickCounter") || 0; }
	});

}


// write output
kitchen.setOutput(component);
