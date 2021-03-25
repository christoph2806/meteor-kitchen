{
	getSQL() {
		if(!this.collections) {
			return "";
		}

		var sql = "";
		var sqlTables = "";
		this.collections.map(function(collection) {
			if(sqlTables) {
				sqlTables += "\n";
			}
			sqlTables += collection.getSQL();
		});

		sql += sqlTables;

		return sql;
	}

	getGraphQL() {
		if(!this.collections) {
			return "";
		}

		var gql = "";
		var gqlTypes = "";
		this.collections.map(function(collection) {
			if(gqlTypes) {
				gqlTypes += "\n";
			}

			gqlTypes += collection.getGraphQL();

			gqlTypes += "\n";
		});

		gql += gqlTypes;

		return gql;
	}

	usesAccounts() {
		var usesAccounts = false;
		if(this.public_zone && this.public_zone.pages.length) usesAccounts = true;
		if(this.private_zone && this.private_zone.pages.length) usesAccounts = true;
		return usesAccounts;
	}

	getOverview(tableClass) {
		var overview = "";

		var addRow = function(title, value) {
			overview += "<tr><td><b>" + title + "</b></td><td>" + value + "</td></tr>";
		}

		overview += "<table class=\"" + tableClass + "\">";

		var userAccounts = this.usesAccounts();
		addRow("User accounts", userAccounts ? "Yes" : "No");
		if(userAccounts) {
			var loginWith = "";
			if(this.login_with_password) { loginWith += loginWith ? ", " : ""; loginWith += "Password"; }
			if(this.login_with_google)   { loginWith += loginWith ? ", " : ""; loginWith += "Google"; }
			if(this.login_with_github)   { loginWith += loginWith ? ", " : ""; loginWith += "Github"; }
			if(this.login_with_linkedin) { loginWith += loginWith ? ", " : ""; loginWith += "LinkedIn"; }
			if(this.login_with_facebook) { loginWith += loginWith ? ", " : ""; loginWith += "Facebook"; }
			if(this.login_with_twitter)  { loginWith += loginWith ? ", " : ""; loginWith += "Twitter"; }
			if(this.login_with_meteor)   { loginWith += loginWith ? ", " : ""; loginWith += "Meteor"; }

			if(!loginWith) {
				loginWith = "Password";
			}

			addRow("Login with", loginWith);
		}

		var collections = "";
		if(this.collections) {
			this.collections.map(function(collection) {
				collections += collections ? ", " : "";
				collections += collection.name || "(noname)";
			});
		}
		addRow("Database collections", collections || "-");

		var freePages = "";
		if(this.free_zone && this.free_zone.pages) {
			this.free_zone.pages.map(function(page) {
				freePages += freePages ? ", " : "";
				freePages += page.name || "(noname)";
			});
		}
		addRow(userAccounts ? "Pages in free zone" : "Pages", freePages || "-");


		if(userAccounts) {
			var publicPages = "";
			if(this.public_zone && this.public_zone.pages) {
				this.public_zone.pages.map(function(page) {
					publicPages += publicPages ? ", " : "";
					publicPages += page.name || "(noname)";
				});
			}
			addRow("Pages in public zone", publicPages || "-");

			var privatePages = "";
			if(this.private_zone && this.private_zone.pages) {
				this.private_zone.pages.map(function(page) {
					privatePages += privatePages ? ", " : "";
					privatePages += page.name || "(noname)";
				});
			}
			addRow("Pages in private zone", privatePages || "-");
		}

		overview += "</table>";

		return overview;
	}
}
