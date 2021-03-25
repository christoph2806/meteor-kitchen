- Improved <a href="http://semantic-ui.com/" target="_blank">semantic-ui</a> templates.
- Fixed bugs related to CollectionFS: storage adapters are now properly created for `filesystem`, `S3` and `Dropbox`
- Fixed this bug: (It was showing first time you start app using bootstrap3)
```
=> Errors prevented startup:
   While processing files with less (for target web.browser):
   client/styles/styles/styles.less:1: Unknown import:
   /client/styles/framework/bootstrap3/custom.bootstrap.less
```
