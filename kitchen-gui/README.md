# Meteor Kitchen GUI

## Start the app

### To start in development mode locally:

With [https://meteor.com](https://meteor.com) installed, run:

```
meteor npm install
meteor
```

Open the browser and go to [https://localhost:3000](https://localhost:3000)


### To start in development mode in docker:

With [https://docker.com](https://docker.com) installed, run:

```
./docker_dev_build.sh
./docker_dev_run.sh
```

It will take some time (1 minute?) before app is available at [https://localhost:3000](https://localhost:3000)


## First run

### Create user

On first run, database is empty (it is not included in git) and there is no users.

Create first user by using register form via regular web interface. If mail sending feature is not set, then you can see confirmation e-mail in the terminal. If you are running in docker then use `docker logs kitchen-gui-dev` to see the terminal output.

In terminal, confirmation mail looks like this:

```
I20210326-11:29:04.548(0)? ====== BEGIN MAIL #0 ======
I20210326-11:29:04.548(0)? (Mail not sent; to enable sending, set the MAIL_URL environment variable.)
I20210326-11:29:04.554(0)? Content-Type: text/plain
I20210326-11:29:04.555(0)? From: Meteor Kitchen <noreply@meteorkitchen.com>
I20210326-11:29:04.555(0)? To: korponaic@gmail.com
I20210326-11:29:04.556(0)? Subject: How to verify email address on Meteor Kitchen
I20210326-11:29:04.556(0)? Message-ID: <f6f166e5-dc6c-0c71-f310-84b9c262aef3@meteorkitchen.com>
I20210326-11:29:04.557(0)? Content-Transfer-Encoding: quoted-printable
I20210326-11:29:04.557(0)? Date: Fri, 26 Mar 2021 11:29:04 +0000
I20210326-11:29:04.558(0)? MIME-Version: 1.0
I20210326-11:29:04.558(0)? 
I20210326-11:29:04.559(0)? Hello Proba,
I20210326-11:29:04.559(0)? 
I20210326-11:29:04.559(0)? To verify your account email, simply click the link below.
I20210326-11:29:04.560(0)? 
I20210326-11:29:04.560(0)? http://localhost:3000/verify_email/xuFP0Vh1j_99wmg3bdlHItayNJC-5vT66CVLrZj7=
I20210326-11:29:04.560(0)? Qfg
I20210326-11:29:04.561(0)? 
I20210326-11:29:04.561(0)? Thanks.
I20210326-11:29:04.561(0)? ====== END MAIL #0 ======
```

**Note** that confirmation link is split into two lines (see three letters `Qfg` below link which is part of the link), and symbol `=` is line terminator and should be ommited. So in this example, correct verification link is: `http://localhost:3000/verify_email/xuFP0Vh1j_99wmg3bdlHItayNJC-5vT66CVLrZj7Qfg` (without `=` char and with three letters `Qfg` from next line).

Copy verification link into browser's address bar and go.

First user is `admin` by default. Other users will be normal `user` by default, which admin can change via regular web interface in the app.


### Restart after first user is created

After admin user is created, stop/start the application (or restart docker container).


### Boilerplate app

After restart, admin user will have one project called `boilerplate-accounts`. Don't delete it and don't edit it. That application is actually a template - it is automatically cloned by users when they choose "New application with user account system". If you edit this application, changes will be reflected in all new applications that users create in the future. So be careful with this.


If you delete or damage this application - it is not the end of the world: make sure it is deleted, and then restart the server. When server starts, it will be automatically imported from `/private/boilerplates/boilerplate-accounts.json`.


### To be continued...

