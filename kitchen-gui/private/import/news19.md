- Forms: for input type "select" now you can combine items from collection (lookup) with static items (input_items). Useful if you need first item to be static (usually empty) and rest of items from collection.
- Forms: added new input type: "crud". For fields with `"type": "array"` and `"array_item_type": "object"` you can define `"input": "crud"` and define `"crud_fields": [...]` - that will produce CRUD inside your form.
- Fixed few bugs and maybe made new ones :)
