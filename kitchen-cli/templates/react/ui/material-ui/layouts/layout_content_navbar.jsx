export class TEMPLATE_NAME extends Component {
	constructor () {
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
		if(this.props.data.dataLoading) {
			return (<Loading />);
		} else {
			return (
				<div class="layout-root">
					<div id="content" className="sticky-wrapper">
						<div id="navbar" className="navbar" role="navigation">
							<div className="navbar-container">
								<div className="navbar-header">
									<button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
										<span className="sr-only">Toggle navigation</span>
										<span className="icon-bar"></span>
										<span className="icon-bar"></span>
										<span className="icon-bar"></span>
									</button>
									<a className="navbar-brand" href="/">APP_TITLE</a>
								</div>

								<div id="menu" className="collapse navbar-collapse">
								</div>

							</div>
						</div>
						<div className="navbar-spacer"></div>

						{this.props.content}
					</div>

					<div id="footer" className="sticky-footer">
						<div className="footer-container">
							<p className="text-muted footer-text">FOOTER_TEXT</p>
						</div>
					</div>
					<div id="background-image" style={{backgroundImage: "url(BACKGROUND_IMAGE)"}}>
					</div>
				</div>
			);
		}
	}
}

export const TEMPLATE_NAMEContainer = withTracker(function(props) {
	/*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
