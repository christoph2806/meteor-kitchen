{
	routeParamNames() {
		var routeParams = [];
		if(this.isInheritedFrom("page")) {
			if(this.route_params) {
				this.route_params.map(paramName => {
					routeParams.push(paramName);
				});
			}
		} else {
			var parentPage = this.getParentOfType("page");
			if(parentPage) {
				return parentPage.routeParamNames();
			}
		}
		return routeParams;
	}
}
