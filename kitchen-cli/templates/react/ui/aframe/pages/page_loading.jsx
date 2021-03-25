import React, { Component } from "react";
import PropTypes from "prop-types";

export const Loading = () => (
	<a-entity 
		rotation="0 0 0"
		position="0 0 -2"
		scale="2 2 2"
		geometry="primitive: circle; radius: 0.2;" 
		material="shader: flat;
					side: double;
					src: url(/images/loading.png);
					color: white;
					transparent: true;
					opacity: 1;">
		<a-animation attribute="rotation" from="0 0 0" to="0 0 -360" dur="1000" easing="linear" repeat="inifite"></a-animation>
	</a-entity>
);
