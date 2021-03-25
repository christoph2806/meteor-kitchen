import React, { Component } from "react";
import PropTypes from "prop-types";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import {pathFor, menuItemClass} from "/imports/modules/client/router_utils";
import {Loading} from "/imports/ui/pages/loading/loading.jsx";
import {mergeObjects} from "/imports/modules/both/object_utils";
/*IMPORTS*/

export class TEMPLATE_NAME extends Component {

	constructor() {
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
				<div className="page-container">
					<div className="row">
						<div className="col-md-12" id="content">
							<div className="row" id="title_row">
								<div className="col-md-12">
									<h2 id="page_title" className="pull-left">
										<div id="page-back-button" className="pull-left">
											<a href="#" className="btn btn-default page-back-button" title="back">
												<span className="fa fa-chevron-left"></span>
											</a>
											&nbsp;
										</div>

										<span id="page-title-icon" className="PAGE_TITLE_ICON_CLASS">
										</span>
										
										PAGE_TITLE
																
									</h2>
									<div id="page_menu" className="pull-right">
										<a href="#" id="page-close-button" className="btn btn-default pull-right" title="Close">
											<span className="fa fa-times">
											</span>
										</a>
									</div>
								</div>
							</div>
							<p id="page_text">
								
													PAGE_TEXT
												
							</p>
						</div>
					</div>
					<div className="t-row">
						<div id="menu" className="t-cell">
						</div>
						<div id="subcontent" className="t-cell" style={{width: "100%"}}>
						</div>
					</div>
				</div>
				<div id="background-image" style={{backgroundImage: "url(BACKGROUND_IMAGE)"}}>
				</div>

			</div>
		);
	}
}

export const TEMPLATE_NAMEContainer = withTracker(function(props) {
	/*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
