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
	}

	/*EVENTS_CODE*/

	/*HELPERS_CODE*/

	render() {
		return (
			<div className="jumbotron COMPONENT_CLASS">
				<div id="content" className="container">
					<h1 id="component-title"><span id="component-title-icon" className="COMPONENT_TITLE_ICON_CLASS"></span>COMPONENT_TITLE</h1>
					<p id="jumbotron-text">JUMBOTRON_TEXT</p>
					<p id="jumbotron-button"><a href="BUTTON_LINK" className="BUTTON_CLASS" role="button">BUTTON_TITLE</a></p>
				</div>
			</div>
		);
	}
}
