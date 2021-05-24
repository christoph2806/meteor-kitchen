export class TEMPLATE_NAME_BLOG_ITEMS extends Component {
	constructor() {
		super();

		this.onToggle = this.onToggle.bind(this);
		this.onEdit = this.onEdit.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onSelect = this.onSelect.bind(this);

		/*BINDINGS*/
	}

	onToggle(e) {
		e.stopPropagation();
		let self = this;
		let itemId = this.props.data._id;
		let toggleField = $(e.currentTarget).attr("data-field");

		let data = {};
		data[toggleField] = !this.props.data[toggleField];

		Meteor.call("UPDATE_METHOD_NAME", itemId, data, function(err, res) {
			if(err) {
				alert(err);
			}
		});
	}

	onEdit(e) {
		e.stopPropagation();
		let self = this;
		let itemId = this.props.data._id;
		/*EDIT_ROUTE*/
	}

	onDelete(e) {
		e.stopPropagation();
		let self = this;
		let itemId = this.props.data._id;
		ConfirmationDialog({
			message: "DELETE_CONFIRMATION_MESSAGE",
			title: "Delete",
			onYes: function(id) {
				Meteor.call("REMOVE_METHOD_NAME", id, function(err, res) {
					if(err) {
						alert(err);
					}
				});
			},
			onNo: null,
			onCancel: null,
			buttonYesTitle: "Yes",
			buttonNoTitle: "No",
			buttonCancelTitle: null,
			showCancelButton: false,
			payload: itemId
		});
	}

	onSelect(e) {
		e.stopPropagation();
		let self = this;
		let item = this.props.data;
		let itemId = item ? item._id : null;

		/*ON_ITEM_CLICKED_CODE*/
		/*DETAILS_ROUTE*/
	}

	/*EDIT_BUTTON_CLASS_HELPER*/

	/*DELETE_BUTTON_CLASS_HELPER*/

	/*EVENTS_CODE*/

	/*HELPERS_CODE*/

	render() {
		return(
			<div className="col-xs-12 blog-item">
				<div className="blog-title-container">
					<h1 className="blog-title pull-left"></h1>
					<h1 className="blog-controls pull-right">
						<form className="button-toolbar form-inline">
							<button type="button" className="btn btn-default blog-details" onClick={this.onSelect} title="DETAILS_BUTTON_TITLE">DETAILS_BUTTON_TITLE</button>&nbsp;
							<button type="button" className={`btn btn-primary blog-edit EDIT_BUTTON_CLASS`} onClick={this.onEdit} title="EDIT_BUTTON_TITLE"><span className="fa fa-pencil"></span>&nbsp;EDIT_BUTTON_TITLE</button>&nbsp;
							<button type="button" className={`btn btn-default blog-delete DELETE_BUTTON_CLASS`} onClick={this.onDelete} title="DELETE_BUTTON_TITLE"><span className="fa fa-trash-o"></span>&nbsp;DELETE_BUTTON_TITLE</button>&nbsp;
						</form>
					</h1>
				</div>
				<p className="blog-date text-muted"></p>
				<p className="blog-subtitle lead"></p>
				<Markdown className="blog-text"></Markdown>
			</div>
		);
	}
}
