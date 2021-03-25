### New features
- Now using <a href="https://atmospherejs.com/nemo64/bootstrap" target="_blank">nemo64:bootstrap</a> package (instead including raw bootstrap-less directory).
- Started adding support for <a href="http://semantic-ui.com/" target="_blank">semantic-ui</a>. You'l be able to choose frontend framework by setting application object's property `frontend` to `bootstrap3` or `semantic-ui`. Not yet fully implemented - expect it in next few days.
### Bugfixes
- After automatic redirect to page's first subpage, back button now works (using `replaceState`).
- There was problem with escape-ing json strings - fixed.
- In some circumstances generator didn't report missing component template file - fixed.
