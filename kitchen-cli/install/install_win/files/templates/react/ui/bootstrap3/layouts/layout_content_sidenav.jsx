export class TEMPLATE_NAME extends Component {
	constructor () {
		super();

		this.onToggleSidebar = this.onToggleSidebar.bind(this);
	}

	onToggleSidebar(e) {
		e.preventDefault();
		$(".row-offcanvas").toggleClass("active");
	}

	render() {
		if(this.props.data.dataLoading) {
			return (<Loading />);
		} else {
			return (
				<div class="layout-root">
					<div className="row-offcanvas row-offcanvas-left">
						<div id="menu" className="sidebar sidebar-offcanvas">
							<h2>
							</h2>
						</div>
						<div id="main">
							<div id="content" className="col-md-12">
								<p className="visible-xs">
									<button type="button" className="btn btn-primary btn-xs" data-toggle="offcanvas" onClick={this.onToggleSidebar}>
										<i className="glyphicon glyphicon-chevron-left">
										</i>
									</button>
								</p>
								{this.props.content}
							</div>
						</div>
					</div>
					<div id="background-image" style="background-image: url(BACKGROUND_IMAGE);">
					</div>
				</div>
			);
		}
	}
}

export const TEMPLATE_NAMEContainer = withTracker(function(props) {
	/*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
