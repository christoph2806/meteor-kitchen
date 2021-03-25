export class TEMPLATE_NAME extends Component {
	constructor () {
		super();
	}

	render() {
		if(this.props.data.dataLoading) {
			return (<Loading />);
		} else {
			return (
				<a-entity id="content">
					<a-sky id="background-image" src="BACKGROUND_IMAGE" rotation="0 0 0"></a-sky>
					<a-entity id="menu">
					</a-entity>
					{this.props.content}
				</a-entity>
			);
		}
	}
}

export const TEMPLATE_NAMEContainer = withTracker(function(props) {
	/*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
