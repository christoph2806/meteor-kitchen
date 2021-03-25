Form input now can be "custom" and you can provide custom template.
Example field definition:
```
{
	"name": "someField",
	"title": "Some Field",
	"input": "custom",
	"input_template": "some_field.html"
}
```
Custom template:
```
<div class="form-group FIELD_GROUP_CLASS FIELD_ID">
	<label for="FIELD_NAME">FIELD_TITLE</label>
	<div class="input-div">
		<input type="text" name="FIELD_NAME" value="FIELD_VALUE" class="form-control">
		<span id="help-text" class="help-block"></span>
		<span id="error-text" class="help-block"></span>
	</div>
</div>
```
