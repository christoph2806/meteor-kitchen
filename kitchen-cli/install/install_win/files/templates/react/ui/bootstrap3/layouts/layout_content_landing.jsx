export class TEMPLATE_NAME extends Component {

	constructor() {
		super();
	}

	componentWillMount() {

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
	}

	componentWillUnmount() {
		$("body").removeClass("landing-layout");
	}

	render() {
		return (
			<div class="layout-root">
				<div id="content" className="wrapper">
					<div className="overlay">
					</div>
					<header>
						<nav id="navbar" className="navbar navbar-default navbar-fixed-top main-nav">
							<div className="navbar-container">
								<div className="navbar-header">
									<button type="button" className="navbar-btn navbar-toggle collapsed" id="sidebar-collapse" data-toggle="collapse" data-target=".navbar-collapse-1">
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
										APP_TITLE
									</a>
								</div>
								<div id="menu" className="navbar-collapse collapse">
								</div>
							</div>
						</nav>
						<nav id="sidebar" className="sidebar">
							<div id="dismiss" className="dismiss">
								<i className="glyphicon glyphicon-remove">
								</i>
							</div>
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
				<footer className="footer">
					<div className="container">
						<p className="text-muted">
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
