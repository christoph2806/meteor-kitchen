### React (soon!)
- Started adding support for <a href=\"https://facebook.github.io/react/\" target=\"_blank\">React</a>. You can expect something useful in next version 0.9.58 (in a week or two).
### New features
Now you can instruct meteor-kitchen which meteor version to use with command line switch `--meteor-release`.
Example:
```
meteor-kitchen <input_file> <output_dir> --meteor-release 1.3-modules-beta.8
```
Now you can specify list of npm modules to install:
Example:
```
{
	"application": {
	    ...
		"packages": {
			"meteor": ["random", "check"],
			"npm": ["react", "react-dom"]
		}
		...
	}
}
``` 
### Bugfixes
- Improved `semantic-ui` templates.
- Fixed small bugs in HTML parser.
