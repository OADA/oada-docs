## Welcome to the **Open Ag Data Alliance** (OADA).

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/OADA/oada-docs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## The important stuff: API Docs


|   Getting Started       |       Specs                 |
|:-----------------------:|:---------------------------:|
| [Intro to the OADA API: Irrigation](https://cdn.rawgit.com/OADA/oada-docs/master/intro/OADA_API_Intro_Irrigation.html) | [Rest API Spec](rest-specs/README.md)
| [Intro to the OADA API: Trellis](https://cdn.rawgit.com/OADA/oada-docs/master/intro/OADA_API_Intro_Trellis.html) | 
| [Intro to OADA Authentication and Authorization](getting_started/auth/README.md) | [Authorization and Authentication](rest-specs/Authentication_and_Authorization.md) |

## The Latest - Cache published!
Sam and Servio have been hard at work on the awesome oada-cache library(s).  It's on NPM under the `@oada` organization [https://www.npmjs.com/org/oada](https://www.npmjs.com/org/oada).  We'll be adding some docs soon explaining how they work, but the basic idea is that you can just import a top-level module for a type of information (fields, yield, notes, etc.) and you have an automatic local cache of data with live change feeds with built-in authorization and identity: whether you're in node or in the browser!  We published a pure javascript implementation [(oada-cache)](https://github.com/oada/oada-cache), as well as some great [cerebral.js](https://cerebraljs.com/) providers [(cerebral-provider)](https://github.com/OADA/cerebral-provider) and modules [(cerebral-module)](https://github.com/OADA/cerebral-module) on top of the pure javascript that really streamline React.js-based development.

## Overview
The purpose of the Open Ag Data Alliance is to develop a standard API framework for 
data exchange in agriculture.  If a farmer or agronomist has data stored in one place,
and would like an app or service to be able to access it, they need only know the
top-level domain where their data sits in order for the app or service to use it.

## Getting Started
--------------------------------------
The best way to get familiar with the OADA API is to use it.  Do that:

1. Install the OADA demo server:
   ```git clone git@github.com:OADA/oada-srvc-docker.git```

2. Start up the server (it runs on localhost at port 80).  *NOTE*: if you are developing, you might want to turn off TLS errors for the node services for your self-signed certificates by adding the `NODE_TLS_REJECT_UNAUTHORIZED=0` environment variable.
   ```
   cd oada-srvc-docker
   docker-compose up -d
   ```

3. Learn about your server and make sure it's up.  Open a browser and go to 
   (https://localhost/.well-known/oada-configuration).
   Look for `oada_base_uri` (where the data is), and 
   `authorization_endpoint` (where to ask for a token).  *NOTE*: the local SSL 
   certificate is self-signed.  You have to approve it in your browser.

4. Get an authorization token to your server:
   Go to http://client.oada-dev.com, enter `localhost` in the box beside 
   "Get Access Token" and enter `trellis:all` in the box beside it labeled "Scope".  Click "Get Access Token".  Submit the default 
   username/password on the next screen, then click "Allow".

5. Copy the access_token.  Looks something like `its8IrYYjlZba_uhdnVMjRNv6FWnZYA3SkCWdEdFa`

6. Get an API tool like [Insomnia](https://insomnia.rest/).  *NOTE:* Postman currently has an issue with Express that leads to PUT requests taking up to 65 seconds.  Insomnia has no such issue, hence why we recommend using it.  Postman works fine with GET's.

7. Discover what data is on your server for your token.  In Insomnia,
   do a `GET` to `https://localhost/bookmarks`.  Without an `Authorization:` header
   it will fail.  Add it with the token you copied: 
   ```
   Authorization: Bearer its8IrYYjlZbuhdnVMjRNv6FWnZYA3SkCWdEdFa
   ```  
   Now you should get back some JSON listing the data that's available.

8. Add some data to your server.  In Insomnia (Postman has issues with Express, so use Insomnia) with  the same `Authorization:` header, 
   do a `PUT` to `https://localhost/bookmarks/theknights` with the body:
   ```json
   {
     "whosay": "Ni!"
   }
   ```
   Add the `Content-Type: application/vnd.oada.bookmarks.1+json` header to the request, too.

9. And get it back: do a `GET` to `https://localhost/bookmarks` again
   and you should see your new data data: now the resource has a key named `theknights`.

Read up on the [Rest API Spec](rest-specs/README.md) with examples to learn how to
create resources, link them between documents, track changes, and more.
--------------------------------------------------

## Examples: Demonstration specs
[Demonstrations](demo-specs/README.md)

## Contributing
[Developer Guidelines](contributing/Developer-Guidelines.md)


## Questions
For contributors to the OADA project, the best method for contact is the
[oada-dev][oada-dev] mailing list on Google Groups.  For those just getting
started, the [oada-users][oada-users] mailing list on Google Groups is a good
place to ask questions.

We also now have a Gitter channel to chat (see the badge at the top of this readme).

[oada-dev]: https://groups.google.com/forum/#!forum/oada-dev
[oada-users]: https://groups.google.com/forum/#!forum/oada-users
[slides]: http://openag.io/OADA_Overview.pdf
[api-slides]: http://openag.io/OADA_API_Overview.pdf
