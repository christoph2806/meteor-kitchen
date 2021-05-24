export class TEMPLATE_NAME extends Component {

	constructor() {
		super();
	}

	componentWillMount() {
		/*TEMPLATE_CREATED_CODE*/
	}

	componentWillUnmount() {
		$("body").removeClass("admin-layout");
		/*TEMPLATE_DESTROYED_CODE*/
	}

	componentDidMount() {
		$("body").addClass("admin-layout");

		$("#dismiss, .overlay, #sidebar ul li a").on("click", function () {
			if($(this).hasClass("dropdown-toggle")) {
				return;
			}
			$("#sidebar").removeClass("active");
			$(".overlay").fadeOut();
		});

		$("#sidebar-collapse").on("click", function () {
			$("#sidebar").addClass("active");
			$(".overlay").fadeIn();
			$(".collapse.in").toggleClass("in");
			$("a[aria-expanded=true]").attr("aria-expanded", "false");
		});

		/*TEMPLATE_RENDERED_CODE*/

		Meteor.defer(function() {
			globalOnRendered();
		});
	}

	/*EVENTS_CODE*/

	/*HELPERS_CODE*/

	render() {
		return (
			<div className="layout-root admin-layout-root">
				<div className="overlay">
				</div>
				<header>
					<nav id="navbar" className="navbar main-nav">
						<div className="navbar-container">
							<div className="navbar-header">
								<button type="button" className="navbar-btn navbar-toggle collapsed" id="sidebar-collapse" data-toggle="collapse">
									<span className="sr-only">
										Toggle navigation
									</span>
									<span className="icon-bar">
									</span>
									<span className="icon-bar">
									</span>
									<span className="icon-bar">
									</span>
								</button>
								<a className="navbar-brand" href="/">
									<span className="navbar-brand-text">APP_TITLE</span>
									<span className="navbar-page-title">{Session.get("CurrentPageTitle") || "APP_TITLE"}</span>
								</a>
							</div>
							<div id="menu" className="navbar-collapse collapse">
							</div>
						</div>
					</nav>
				</header>

				<div className="admin-layout-row">
					<nav id="sidebar" className="admin-layout-sidebar sidebar">
					</nav>

					<div className="admin-layout-col">
						{this.props.content}
						<div id="background-image" style={{backgroundImage: "url(BACKGROUND_IMAGE)"}}>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export const TEMPLATE_NAMEContainer = withTracker(function(props) {
	/*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
