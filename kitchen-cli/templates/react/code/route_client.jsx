ROUTE_GROUP.route("ROUTE_URL", {
    name: "ROUTE_NAME",

    title: "ROUTE_TITLE",

	triggersEnter: [
		function(context, redirect, stop) {
			/*BEFORE_FUNCTION*/
		}
	],
    action: function(routeParams, routeQuery) {
    	/*ACTION_FUNCTION*/
    },
	triggersExit: [
		function(context, redirect) {
			/*AFTER_FUNCTION*/
		}
	]
});
