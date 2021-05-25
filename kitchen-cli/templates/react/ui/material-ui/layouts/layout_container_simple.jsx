import React from "react";
import PropTypes from "prop-types";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import {pathFor, menuItemClass} from "/imports/modules/client/router_utils.js";

import { ThemeProvider } from "@material-ui/core";
import { Container } from "@material-ui/core";
import { Paper } from "@material-ui/core";
import { Divider } from "@material-ui/core";
import { Box } from "@material-ui/core";
import { IconButton } from "@material-ui/core";
import { Menu } from "@material-ui/core";
import { MenuItem } from "@material-ui/core";
import { ListSubheader } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import styled from "styled-components";

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

