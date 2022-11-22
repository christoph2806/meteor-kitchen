import React from "react";
import PropTypes from "prop-types";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import {pathFor, menuItemClass} from "/imports/modules/client/router_utils.js";
/*IMPORTS*/


function Layout(props) {
  return (
    <FreeLayoutContainer content={props.content} />
  );
}

export const LayoutContainer = withTracker(function(props) {
	var data = {};

	return { data: data };
})(Layout);

