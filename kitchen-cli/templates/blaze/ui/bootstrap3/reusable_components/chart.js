Template.Chart.onCreated(function() {
});

Template.Chart.onDestroyed(function() {
});

Template.Chart.onRendered(function() {
});

Template.Chart.events({
});

Template.Chart.helpers({
	"chartData": function() {
		var data = this.data && this.data.fetch ? this.data.fetch() : this.data || [];
		var valueField = this.valueField;
		var categoryField = this.categoryField;
		var timeSeriesField = this.timeSeriesField;
		var dateFormat = this.dateFormat;
		var chartType = this.chartType;

		data.map(function(d) { d[valueField] = parseFloat(d[valueField]); });

		var res = {
			data: {
				json: [],
				keys: {
					value: []
				},
				names: {

				},
				type: ""
			},

			axis: {
				x: {

				},

				y: {
					tick: {
						format: function(d) {
							return d.toFixed ? parseFloat(d.toFixed(5)) : d;
						}
					}
				}
			}
		};

		res.data.type = chartType;

		switch(chartType) {
			case "pie":
			case "donut": {
				var categories = [];
				var reformated = {};
				data.map(function(d, index) {
					if(categoryField) {
						categories.push(d[categoryField]);
						reformated[d[categoryField]] = d[valueField];
					} else {
						if(timeSeriesField) {
							categories.push(d[timeSeriesField]);
							reformated[d[timeSeriesField]] = d[valueField];
						}
						categories.push(index + "");
						reformated[index + ""] = d[valueField];
					}
				});
				res.data.json = [reformated];
				res.data.keys.value = categories;
			}; break;

			default: {
				res.data.json = data;
				res.data.keys.value.push(valueField);
				if(categoryField) {
					res.data.keys.x = categoryField;
					res.axis.x.type = "category";
				} else {
					if(timeSeriesField) {
						res.data.keys.x = timeSeriesField;
						res.axis.x.type = "timeseries";
						res.axis.x.tick = {
							format: function(d) {
								return dateUtils.formatDate(d, dateFormat);
							},
							count: 12
						}
					}
				}
			}
		}

		return res;
	}
});
