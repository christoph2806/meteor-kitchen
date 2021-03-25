import React, { Component } from "react";
import marked from "marked";

export class Markdown extends Component {
	constructor () {
		super();
		this.rawMarkup = this.rawMarkup.bind(this);
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
	}

	rawMarkup() {
		var markdownText = this.props.text || "";
		var rawMarkup = marked(markdownText, { sanitize: this.props.sanitize || false });
		return { __html: rawMarkup };
	}

	render() {
		return (<div dangerouslySetInnerHTML={this.rawMarkup()} />);
	}
}
