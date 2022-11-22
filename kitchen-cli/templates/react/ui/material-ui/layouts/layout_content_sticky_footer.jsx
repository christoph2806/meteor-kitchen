export class TEMPLATE_NAME extends Component {

	constructor() {
		super();
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

	/*HELPERS_CODE*/

	render() {
		return (
			<div class="layout-root">
				<div id="content" className="sticky-wrapper">
					{this.props.content}
				</div>
				<div id="footer" className="sticky-footer">
					<div className="footer-container">
						<p className="text-muted footer-text">
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
