#### New features
- **OAuth**: added more OAuth providers, now we got login with **google**, **github**, **linkedin**, **facebook**, **twitter** and **meteor**. See [getting started](/getting_started#oauth) for more info.
- Small but usefull: boolean fields with `"input": "checkbox"` are now shown in dataview (table) as checkbox and user can check/uncheck it directly here. See updated [example-dataview](http://example-dataview.meteorfarm.com).
#### Bugfixes
- Built-in form component validation: if your field is for example of type "email" but *not required* and user leaves form field blank it was regEx validated - that was a bug and is fixed now. Non-required fields are not validated if blank.
