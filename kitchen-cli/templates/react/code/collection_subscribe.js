
/*BEFORE_SUBSCRIPTION_CODE*/

	let isReady = function() {
		/*SUBSCRIPTION_PARAMS*/

		let subs = [/*SUBSCRIPTIONS*/];
		let ready = true;
		_.each(subs, function(sub) {
			if(!sub.ready())
				ready = false;
		});
		return ready;
	};

	let data = { dataLoading: true };

	if(isReady()) {
		/*DATA_PARAMS*/

		/*DATA_OBJECT_SET*/

		/*CUSTOM_DATA_CODE*/
	}
	return { data: data };
