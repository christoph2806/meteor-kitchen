import React, { Component } from "react";
import PropTypes from "prop-types";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import {pathFor, menuItemClass} from "/imports/modules/client/router_utils.js";
import {Loading} from "/imports/ui/pages/loading/loading.jsx";
import "aframe";
/*IMPORTS*/

Meteor.startup(function() {
	let self = this;
	let sceneCheck = Meteor.setInterval(function() {
		let scene = document.querySelector('a-scene');
		if(scene && scene.hasLoaded) {
			Meteor.clearInterval(sceneCheck);
			Session.set("sceneReady", true);
		}
	}, 10);
});

export class Layout extends Component {
	constructor () {
		super();
	}

	componentDidMount() {
		$("#react-root").css({ height: "100%" });
	}

	render() {
		return (
			<a-scene>
				{this.props.data.sceneReady ? <FreeLayoutContainer content={this.props.content} /> : <Loading /> }

				<a-entity position="0 0 5">
					<a-camera>
						<a-cursor material="color: yellow">
							<a-animation attribute="scale" begin="click" dur="150" fill="backwards" to="0 0 0"/>
						</a-cursor>
					</a-camera>
				</a-entity>
			</a-scene>
		);
	}
}

export const LayoutContainer = withTracker(function(props) {
	var data = {};

	data.sceneReady = !!Session.get("sceneReady");

	return { data: data };
})(Layout);
