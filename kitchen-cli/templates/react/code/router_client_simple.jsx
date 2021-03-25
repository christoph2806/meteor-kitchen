import React, { Component } from "react";
import PropTypes from "prop-types";
import {mount, withOptions} from "react-mounter";
import {LayoutContainer} from "/imports/ui/layouts/layout.jsx";
import {NotFound} from "/imports/ui/pages/not_found/not_found.jsx";
import {toKebabCase} from "/imports/modules/both/case_utils.js"
/*IMPORTS*/

const reactMount = withOptions({
	rootProps: {
		className: "react-root"
	}
}, mount);

const freeRouteNames = [
	/*FREE_ROUTES*/
];

export const routeGranted = function(routeName) {
	return true;
};

const freeRoutes = FlowRouter.group( { name: "free" } );

FlowRouter.triggers.enter(function(context) {
	if(context.route && context.route.name) {
		$("body").addClass("page-" + toKebabCase(context.route.name));
	}
	Session.set("CurrentPageTitle", context.route && context.route.options ? context.route.options.title || "" : "");
});

FlowRouter.triggers.exit(function(context) {
	if(context.route && context.route.name) {
		$("body").removeClass("page-" + toKebabCase(context.route.name));
	}
});


FlowRouter.notFound = {
	action () {
		reactMount(LayoutContainer, {
			content: (<NotFound />)
		});
	}
};
