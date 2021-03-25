/* 
	Plugin example 1
	----------------

	Demonstrates how to:
		- insert static HTML into page

*/

var kitchen = require("meteor-kitchen");

// read input
var component = kitchen.getInput();

// create some static html
component.html = "<p><strong>Hello! I am example plugin No.1:</strong> just a static HTML but I am pretty!</p>";

// write output
kitchen.setOutput(component);
