#### OAuth
Now you can generate code with OAuth login (currently only "google" and "github", other providers will be added soon). Just set `login_with_google` and/or `login_with_github` to `true` in application object. You'l need to add `clientId` and `secret` in settings passed to meteor. See "getting started" for more details.
#### Collection2
If you set `use_collection2` to `true` in your application object then simple-schema will be generated and Collection2 will be used for all collections. Note: inside collection object, you need to define all fields that will be inserted/modified - collection2 will automatically remove unlisted fields passed to `Collection.insert` and `Collection.update`.
#### GUI - sitemap diagram
Is now automatically drawn - plan is to enable drag&drop to add/remove/move pages - one step closer to "draw & generate app" ;)
