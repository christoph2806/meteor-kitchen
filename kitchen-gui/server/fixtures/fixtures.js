Meteor.startup(function() {
	let admin = Users.findOne({ roles: "admin" });
	if(!admin) {
		console.log("WARNING! There is no user with role \"admin\". Please restart the application after you create first user (who will be admin by default).");
	}

	let dataJson = Assets.getText("boilerplates/boilerplate-accounts.json");
	if(dataJson) {
		let data = JSON.parse(dataJson);
		let app = Applications.findOne({ name: "boilerplate-accounts", boilerplate: true });
		if(!app) {
			if(admin) {
				let boilerplates = [
					"boilerplate-accounts"
				];
				boilerplates.map(function(boilerplate) {
					let dataJson = Assets.getText("boilerplates/" + boilerplate + ".json");
					if(dataJson) {
						let data = JSON.parse(dataJson);
						let appId = Applications.insert({ name: boilerplate, boilerplate: true, public: false, data: data });
						Applications.update({ _id: appId }, { $set: { createdBy: admin._id, modifiedBy: admin._id }});
					}
				});
			}
		} else {
			Applications.update({ _id: app._id }, { $set: { data: data }});
		}
	}

	// import events
	if(Blog.find({ groupName: "events" }).count() == 0) {
		var list = JSON.parse(Assets.getText("import/events.json"));
		var events = list.events;
		events.map(function(evt) {
			var file = Assets.getText("import/" + evt.file);
			var id = Blog.insert({
				groupName: "events",
				title: evt.title,
				text: file
			});

			Blog.update({ _id: id }, { $set: { createdAt: Date.parse(evt.date) }});
		});
	}

	// import news
	if(Blog.find({ groupName: "news" }).count() == 0) {
		var list = JSON.parse(Assets.getText("import/news.json"));
		var news = list.news;
		news.map(function(evt) {
			var file = Assets.getText("import/" + evt.file);
			var id = Blog.insert({
				groupName: "news",
				title: evt.title,
				text: file
			});

			Blog.update({ _id: id }, { $set: { createdAt: Date.parse(evt.date) }});
		});
	}

	// Build gasoline palette

	if(GasolinePaletteGroups.find({ title: "Control structures" }).count() == 0) {
		var group = {
			title: "Control structures"
		};

		var palette = [
			{
				title: "Condition",
				data: {
					type: "condition",
					condition: "",
					"children": [
						{
							"type": "condition-true",

							"children": [
							]
						},

						{
							"type": "condition-false",

							"children": [
							]
						}
					]
				}
			},

			{
				title: "Loop",
				data: {
					type: "loop",
					dataset: "QUERY_NAME",
					children: [
					]
				}
			},

			{
				title: "Inclusion",
				data: {
					type: "inclusion",
					template: "NAME",
					children: [
					]
				}
			}


		];

		var groupId = GasolinePaletteGroups.insert(group);

		palette.map(function(item) {
			item.groupId = groupId;
			GasolinePalette.insert(item);
		});

	}


	if(GasolinePaletteGroups.find({ title: "Basic HTML" }).count() == 0) {
		var group = {
			title: "Basic HTML",
		};

		var palette = [
			{
				title: "text",

				data: {
					type: "text",
					text: "Static Text"
				}
			},

			{
				title: "h1",

				data: {
					type: "html",
					element: "h1",
					selector: "",

					attributes: [
					],

					children: [
						{
							type: "text",
							text: "Heading 1"
						}
					]
				}
			},

			{
				title: "ul",

				data: {
					type: "html",
					element: "ul",
					selector: "",

					attributes: [
					],

					children: [
						{
							type: "html",
							element: "li",
							selector: "",

							attributes: [
							],

							children: [
								{
									type: "text",
									text: "List item"
								}
							]
						}
					]
				}
			},

			{
				title: "li",

				data: {
					type: "html",
					element: "li",
					selector: "",

					attributes: [
					],
					children: [
						{
							type: "text",
							text: "List item"
						}
					]
				}
			},

			{
				title: "h2",

				data: {
					type: "html",
					element: "h2",
					selector: "",

					attributes: [
					],

					children: [
						{
							type: "text",
							text: "Heading 2"
						}
					]
				}
			},

			{
				title: "h3",

				data: {
					type: "html",
					element: "h3",
					selector: "",

					attributes: [
					],

					children: [
						{
							type: "text",
							text: "Heading 3"
						}
					]
				}
			},

			{
				title: "h4",

				data: {
					type: "html",
					element: "h4",
					selector: "",

					attributes: [
					],

					children: [
						{
							type: "text",
							text: "Heading 4"
						}
					]
				}
			},

			{
				title: "h5",

				data: {
					type: "html",
					element: "h5",
					selector: "",

					attributes: [
					],

					children: [
						{
							type: "text",
							text: "Heading 5"
						}
					]
				}
			},

			{
				title: "h6",

				data: {
					type: "html",
					element: "h6",
					selector: "",

					attributes: [
					],

					children: [
						{
							type: "text",
							text: "Heading 6"
						}
					]
				}
			},

			{
				title: "p",

				data: {
					type: "html",
					element: "p",
					selector: "",

					attributes: [
					],

					children: [
						{
							type: "text",
							text: "Text"
						}
					]
				}
			},

			{
				title: "div",

				data: {
					type: "html",
					element: "div",
					selector: "",

					attributes: [
					]
				}
			},

			{
				title: "span",

				data: {
					type: "html",
					element: "span",
					selector: "",

					attributes: [
					]
				}
			},

			{
				title: "table",

				data: {
					type: "html",
					element: "table",
					selector: "",

					attributes: [
					],

					children: [
						{
							type: "html",
							element: "thead",
							selector: "",

							attributes: [
							],

							children: [
								{
									type: "html",
									element: "tr",
									selector: "",

									attributes: [
									],


									children: [
										{
											type: "html",
											element: "th",
											selector: "",

											attributes: [
											],

											children: [
												{
													type: "text",
													text: "Column"
												}
											]

										}
									]

								}
							]
						},

						{
							type: "html",
							element: "tbody",
							selector: "",

							attributes: [
							],
							children: [
								{
									type: "html",
									element: "tr",
									selector: "",

									attributes: [
									],

									children: [
										{
											type: "html",
											element: "td",
											selector: "",

											attributes: [
											],

											children: [
												{
													type: "text",
													text: "Cell"
												}
											]
										}
									]

								}
							]
						}
					]
				}
			},

			{
				title: "thead",

				data: {
					type: "html",
					element: "thead",
					selector: "",

					attributes: [
					]
				}
			},

			{
				title: "tbody",

				data: {
					type: "html",
					element: "tbody",
					selector: "",

					attributes: [
					]
				}
			},

			{
				title: "tr",

				data: {
					type: "html",
					element: "tr",
					selector: "",

					attributes: [
					]
				}
			},

			{
				title: "td",

				data: {
					type: "html",
					element: "td",
					selector: "",

					attributes: [
					]
				}
			},

			{
				title: "th",

				data: {
					type: "html",
					element: "th",
					selector: "",

					attributes: [
					]
				}
			},

			{
				title: "button",

				data: {
					type: "html",
					element: "button",
					selector: "",

					attributes: [
						{ name: "type", value: "button" }
					],

					children: [
						{
							type: "text",
							text: "Button"
						}
					]
				}
			},

			{
				title: "form",

				data: {
					type: "html",
					element: "form",
					selector: "",

					attributes: [
					]
				}
			},

			{
				title: "input",

				data: {
					type: "html",
					element: "input",
					selector: "",

					attributes: [
						{ name: "type", value: "text" }
					]
				}
			}

		];

		var groupId = GasolinePaletteGroups.insert(group);

		palette.map(function(item) {
			item.groupId = groupId;
			GasolinePalette.insert(item);
		});

	}

	if(GasolinePaletteGroups.find({ title: "Bootstrap 3" }).count() == 0) {
		var group = {
			title: "Bootstrap 3",
		};

		var palette = [
			{
				title: "Grid 1-Column",

				data: {
					type: "html",
					element: "div",
					selector: "",

					attributes: [
						{ name: "class", value: "row" }
					],

					children: [

						{
							type: "html",
							element: "div",
							selector: "",

							attributes: [
								{ name: "class", value: "col-md-12" }
							],

							children: [
							]
						}

					]
				}
			},

			{
				title: "Grid 2-Column",

				data: {
					type: "html",
					element: "div",
					selector: "",

					attributes: [
						{ name: "class", value: "row" }
					],

					children: [

						{
							type: "html",
							element: "div",
							selector: "",

							attributes: [
								{ name: "class", value: "col-md-6" }
							],

							children: [
							]
						},

						{
							type: "html",
							element: "div",
							selector: "",

							attributes: [
								{ name: "class", value: "col-md-6" }
							],

							children: [
							]
						}

					]
				}
			},


			{
				title: "Grid 3-Column",

				data: {
					type: "html",
					element: "div",
					selector: "",

					attributes: [
						{ name: "class", value: "row" }
					],

					children: [

						{
							type: "html",
							element: "div",
							selector: "",

							attributes: [
								{ name: "class", value: "col-md-4" }
							],

							children: [
							]
						},

						{
							type: "html",
							element: "div",
							selector: "",

							attributes: [
								{ name: "class", value: "col-md-4" }
							],

							children: [
							]
						},

						{
							type: "html",
							element: "div",
							selector: "",

							attributes: [
								{ name: "class", value: "col-md-4" }
							],

							children: [
							]
						}
					]
				}
			},

			{
				title: "Grid 4-Column",

				data: {
					type: "html",
					element: "div",
					selector: "",

					attributes: [
						{ name: "class", value: "row" }
					],

					children: [

						{
							type: "html",
							element: "div",
							selector: "",

							attributes: [
								{ name: "class", value: "col-md-3" }
							],

							children: [
							]
						},

						{
							type: "html",
							element: "div",
							selector: "",

							attributes: [
								{ name: "class", value: "col-md-3" }
							],

							children: [
							]
						},

						{
							type: "html",
							element: "div",
							selector: "",

							attributes: [
								{ name: "class", value: "col-md-3" }
							],

							children: [
							]
						},

						{
							type: "html",
							element: "div",
							selector: "",

							attributes: [
								{ name: "class", value: "col-md-3" }
							],

							children: [
							]
						}
					]
				}
			},

			{
				title: "Form",
				data: {
					type: "html",
					element: "form",
					selector: "",
					children: [
						{
							type: "html",
							element: "div",
							selector: "",
							attributes: [
								{ name: "class", value: "form-group" }
							],

							children: [
								{
									type: "html",
									element: "label",
									selector: "",

									attributes: [
									],

									children: [
										{
											type: "text",
											text: "Label"
										}
									]
								},

								{
									type: "html",
									element: "input",
									selector: "",

									attributes: [
										{ name: "type", value: "text" },
										{ name: "class", value: "form-control" },
										{ name: "name", value: "" },
										{ name: "value", value: "" }
									]
								}
							]
						},
						{
							type: "html",
							element: "button",
							selector: "",

							attributes: [
								{ name: "type", value: "submit" },
								{ name: "class", value: "btn btn-success" }
							],

							children: [
								{
									type: "text",
									text: "Submit"
								}
							]
						}
					]
				}
			},

			{
				title: "Button",

				data: {
					type: "html",
					element: "button",
					selector: "",

					attributes: [
						{ name: "class", value: "btn btn-default" }
					],

					children: [
						{
							type: "text",
							text: "Button"
						}
					]
				}
			}

		];

		var groupId = GasolinePaletteGroups.insert(group);

		palette.map(function(item) {
			item.groupId = groupId;
			GasolinePalette.insert(item);
		});
	}

	if(GasolinePaletteGroups.find({ title: "My blocks" }).count() == 0) {
		var group = {
			title: "My blocks",
			custom: true
		};
		var groupId = GasolinePaletteGroups.insert(group);
	}

	if(GasolinePaletteGroups.find({ title: "Shared by others" }).count() == 0) {
		var group = {
			title: "Shared by others",
			community: true
		};
		var groupId = GasolinePaletteGroups.insert(group);
	}

});
