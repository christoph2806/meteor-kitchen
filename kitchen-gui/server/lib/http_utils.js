this.Webhook = function(url, cb) {
	var res = HTTP.post(url, {
		npmRequestOptions: {
			method: "HEAD"
		}
	}, function(e, r) {
		if(cb) {
			cb(e, r);
		}
	});
};
