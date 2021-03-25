import React, { Component } from "react";
import PropTypes from "prop-types";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import {pathFor, menuItemClass} from "/imports/modules/client/router_utils";
import {Loading} from "/imports/ui/pages/loading/loading.jsx";
import {mergeObjects} from "/imports/modules/both/object_utils";
/*IMPORTS*/

export class TEMPLATE_NAME extends Component {
	constructor () {
		super();
		/*BINDINGS*/
	}

	componentWillMount() {
		/*TEMPLATE_CREATED_CODE*/
	}

	componentWillUnmount() {
		/*TEMPLATE_DESTROYED_CODE*/
	}

	componentDidMount() {
		/*TEMPLATE_RENDERED_CODE*/

		Meteor.defer(function() {
			globalOnRendered();
		});
	}

	/*EVENTS_CODE*/

	render() {
		return (
			<div>
				<div id="wrap">
					<div className="navbar navbar-inverse" role="navigation">
						<div className="navbar-container container-fluid">
							<div className="navbar-header">
								<button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
									<span className="sr-only">
										Toggle navigation..
									</span>
									<span className="icon-bar">
									</span>
									<span className="icon-bar">
									</span>
									<span className="icon-bar">
									</span>
								</button>
								<a className="navbar-brand" id="page-back-button" title="back" href="#">
									<span className="fa fa-chevron-left">
									</span>
								</a>
								<a className="navbar-brand" id="page-title" href="#">
									PAGE_TITLE
								</a>
							</div>
							<div id="menu" className="collapse navbar-collapse">
							</div>
						</div>
					</div>
					<div id="content" className="page-container">
						<div id="title_row">
						</div>
						<p id="page_text">
						</p>
						<div id="subcontent">
						</div>
					</div>
				</div>
				<div id="footer">
					<div className="footer-container container-fluid">
						<p className="text-muted">
							FOOTER_TEXT
						</p>
					</div>
				</div>
				<div id="background-image" style="background-image: url(BACKGROUND_IMAGE);">
				</div>

			</div>
		);
	}
}

export const TEMPLATE_NAMEContainer = withTracker(function(props) {
	/*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
