<div className="row blog-container">
	{this.props.data.QUERY_VAR.map(function(item) {
		return(
			<TEMPLATE_NAME_BLOG_ITEMS key={item._id} data={item} routeParams={self.props.routeParams} onDelete={self.onDelete} />
		);
	})}
</div>
