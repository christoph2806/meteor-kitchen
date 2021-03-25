export class TEMPLATE_NAME extends Component {
	constructor() {
		super();
		this.onItemClick = this.onItemClick.bind(this);
		/*BINDINGS*/
	}

	onItemClick(e) {
		let item = $(e.currentTarget);
		let url = item.attr("data-url");
		FlowRouter.go(url);
	}

	/*EVENTS_CODE*/

	/*HELPERS_CODE*/

	render() {
		return (
			<a-entity id="menu-items" position="0 0 0">
			</a-entity>
		);
	}
}
