import ReactDOM from "react-dom";
import React, { Component } from "react";
import PropTypes from "prop-types";
import C3Chart from "react-c3js";
import * as dateUtils from "BOTH_LIB_DIR/date_utils";
import * as caseUtils from "BOTH_LIB_DIR/case_utils";
import * as objectUtils from "BOTH_LIB_DIR/object_utils";
import "./chart.less";

export class Chart extends Component {
	constructor () {
		super();
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	componentDidMount() {
	}

	render() {
		var data = this.props.data ? this.props.data : [];
		var options = this.props.options ? this.props.options : {};

		var valueField = this.props.valueField;
		var valueFields = this.props.valueFields;
		var categoryField = this.props.categoryField;
		var timeSeriesField = this.props.timeSeriesField;
		var chartType = this.props.chartType;
		var dateFormat = this.props.dateFormat;

		if(data && data.map && data.length) {
			// value fields are not specified: all numeric columns will be shown
			if(!valueField && !valueFields) {
				valueFields = [];
				for(var f in data[0]) {
					if(typeof data[0][f] == "number") {
						valueFields.push(f);
					}
				}
			}

			if(valueField) {
				data.map(function(d) { d[valueField] = parseFloat(d[valueField]); });
			}

			if(valueFields && valueFields.map) {
				valueFields.map(function(v) {
					data.map(function(d) { d[v] = parseFloat(d[v]); });
				});
			}
		}

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

		res = objectUtils.mergeObjects(res, options);

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
				if(valueField) {
					res.data.keys.value.push(valueField);
					res.data.names[valueField] = caseUtils.toTitleCase(valueField);
				}
				if(valueFields && valueFields.map) {
					valueFields.map(function(v) {
						res.data.keys.value.push(v);
						res.data.names[v] = caseUtils.toTitleCase(v);
					});
				}
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

		return (
			<C3Chart id={this.props.id} data={res.data} axis={res.axis} legend={res.legend} size={res.size} />
		);
	}
}
