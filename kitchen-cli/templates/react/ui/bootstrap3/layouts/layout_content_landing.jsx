export class TEMPLATE_NAME extends Component {

	constructor() {
		super();
	}

	componentWillMount() {
		/*TEMPLATE_CREATED_CODE*/
	}

	componentWillUnmount() {
		$("body").removeClass("landing-layout");
		/*TEMPLATE_DESTROYED_CODE*/
	}

	componentDidMount() {
		$("body").addClass("landing-layout");

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
			<div className="layout-root">
				<div id="content" className="wrapper">
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
						<nav id="sidebar" className="sidebar">
							<div className="sidebar-header">
								<h3>
									APP_TITLE
								</h3>
							</div>
						</nav>
					</header>
					<div className="navbar-spacer">
					</div>
					{this.props.content}
				</div>
				<footer id="footer" className="footer">
					<div className="container footer-container">
						<p className="text-muted footer-text">
							FOOTER_TEXT
						</p>
					</div>
				</footer>
				<div id="background-image" style={{backgroundImage: "url(BACKGROUND_IMAGE)"}}>
				</div>
			</div>
		);
	}
}

export const TEMPLATE_NAMEContainer = withTracker(function(props) {
	/*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
