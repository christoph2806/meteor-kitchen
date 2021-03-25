### New features
- <span class="label label-danger">New!</span> Input file now can be application description written in everyday **human language**. See example <a href="https://github.com/perak/kitchen-examples/tree/master/example-human" target="_blank">here</a>.
- In application with user account system, now you can set `"send_verification_email": true` and add verify e-mail page into public zone: `{ "name": "verify_email", "template": "verify_email", "route_params": ["verifyEmailToken"] }`. See updated <a href="https://github.com/perak/kitchen-examples/tree/master/example-admin" target="_blank">"admin" example</a>.
### Bugfixes
- If you use collection2, boolean field now have correct type in generated SimpleSchema
