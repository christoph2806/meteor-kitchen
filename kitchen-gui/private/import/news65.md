- Now you can set `on_item_clicked_code` in DataView. Code will be executed when table item (row) is clicked. If you have `details_route` set then this code will be executed before redirect to details route.
Example:
```
"on_item_clicked_code": "alert(this._id);"
```
