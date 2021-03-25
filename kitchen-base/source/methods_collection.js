{
	updateRefs(oldName, newName) {
		var kitchen = this.getRoot();
		if(!kitchen) {
			return;
		}

		kitchen.findObject(obj => {
			obj._properties.map(property => {
				if(property.subType == "collection_name" && obj[property.name] && obj[property.name] == oldName) {
					obj[property.name] = newName;
				}
			});
		});
	}

	getSQL() {
		var sql = "";
		var KEY_DATATYPE = "VARCHAR(30)";


		var tableName = toSnakeCase(this.name).toUpperCase();

		sql += "CREATE TABLE " + tableName + " (\n";

		var fieldsSQL = "";
		var keysSQL = "";

		if(fieldsSQL) {
			fieldsSQL += ",\n";
		}
		fieldsSQL += "\tID " + KEY_DATATYPE + " NOT NULL";

		if(keysSQL) {
			keysSQL += ",\n";
		}
		keysSQL += "\tPRIMARY KEY (ID)";

		if(this.fields) {
			this.fields.map(function(field) {
				var fieldName = toSnakeCase(field.name).toUpperCase();
				var fieldType = "";
				if(field.join_collection) {
					fieldType = KEY_DATATYPE;
				} else {
					switch(field.type) {
						case "string": fieldType = "VARCHAR(255)"; break;
						case "email": fieldType = "VARCHAR(255)"; break;
						case "integer": fieldType = "INTEGER"; break;
						case "float": fieldType = "DOUBLE"; break;
						case "date": fieldType = "DATE"; break;
						case "time": fieldType = "INTEGER"; break;
						case "bool": fieldType = "TINYINT"; break;
						case "array": fieldType = "JSON"; break;
						case "object": fieldType = "JSON"; break;

						default: fieldType = "VARCHAR(255)";
					}
				}

				if(fieldsSQL) {
					fieldsSQL += ",\n";
				}
				fieldsSQL += "\t" + fieldName + " " + fieldType || "string";
				if(field.required) {
					fieldsSQL += " NOT NULL";
				}
				if(field.join_collection) {
					if(keysSQL) {
						keysSQL += ",\n";
					}

					var foreignTableName = toSnakeCase(field.join_collection).toUpperCase();

					keysSQL += "\tFOREIGN KEY (" + fieldName + ") REFERENCES " + foreignTableName + "(ID)";
				}
			});
		}

		sql += fieldsSQL;
		if(fieldsSQL) {
			sql += ",\n";
		}
		sql += keysSQL;
		if(keysSQL) {
			sql += "\n";
		}
		sql += ");\n";
		return sql;
	}

	getGraphQL() {
		var gql = "";

		gql += "type " + this.name + " {\n";

		var gqlFields = "";
		if(this.fields) {
			var idField = this.fields.find(function(fld) { 
				return !!fld.name && (fld.name.toLowerCase() == "_id" || fld.name.toLowerCase() == "id"); 
			});

			if(!idField) {
				gqlFields += "\tid: ID!";
			}

			this.fields.map(function(field) {
				if(gqlFields) {
					gqlFields += ",\n";
				}

				gqlFields += "\t" + field.name + ": ";

				var fieldType = "";
				switch(field.type) {
					case "string": fieldType = "String"; break;
					case "email": fieldType = "String"; break;
					case "integer": fieldType = "Int"; break;
					case "float": fieldType = "Float"; break;
					case "date": fieldType = "Int"; break; // no Date in graphQL?
					case "time": fieldType = "Int"; break;
					case "bool": fieldType = "Boolean"; break;
					case "array": fieldType = "[" + field.subType + "]"; break;
					case "object": fieldType = "Object"; break; // not graphQL type

					default: fieldType = "String";
				}

				if(field.required) {
					fieldType += "!";
				}

				gqlFields += fieldType;
			});
		}

		gql += gqlFields;

		gql += "\n}";

		return gql;
	}
}
