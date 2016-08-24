## Welcome to the **Open Ag Data Alliance** (OADA).

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/OADA/oada-docs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## The important stuff: API Docs
[Rest API Spec](rest-specs/README.md)

[tl;dr Intro to the OADA API slides](https://cdn.rawgit.com/OADA/oada-docs/master/intro/OADA_API_Intro_Irrigation.html)

## Overview
The purpose of the Open Ag Data Alliance is to develop a standard API framework for 
data exchange in agriculture.  If a farmer or agronomist has data stored in one place,
and would like an app or service to be able to access it, they need only know the
top-level domain where their data sits in order for the app or service to use it.

## Getting Started
--------------------------------------
The best way to get familiar with the OADA API is to use it.  Do do that:

1. Install the OADA demo server:
   `git clone git@github.com:OADA/oada-api-server.git`

2. Get node.js if you don't have it, install libraries:
   `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.6/install.sh | bash`
   `nvm install node && nvm use node && npm install`

3. Start up the server (it runs localhost:3000):
   `npm run start`

4. Learn about your server.  Open a browser and go to 
   (https://localhost:3000/.well-known/oada-configuration).
   Look for `oada_base_uri` (where the data is), and 
   `authorization_endpoint` (where to ask for a token)

5. Get an authorization token to your server:
   Go to http://client.oada-dev.com, enter `localhost:3000` in the box beside 
   "Get Access Token".  Click "Get Access Token".  Submit the default 
   username/password on the next screen, then click "Allow".

6. Copy the access_token.  Looks something like `its8IrYYjlZba_uhdnVMjRNv6FWnZYA3SkCWdEdFa`

7. Get an API tool like (Postman|https://www.getpostman.com/)

8. Discover what data is on your server for your token.  In Postman,
   do a `GET` to `https://localhost:3000/bookmarks`.  Without an `Authorization:` header
   it will fail.  Add it with the token you copied: 
   `Authorization: its8IrYYjlZbuhdnVMjRNv6FWnZYA3SkCWdEdFa`.  Now you should get back
   some JSON listing the data that's available.

9. Add some data to your server.  In Postman with  the same `Authorization:` header, 
   do a `PUT` to `https://localhost:3000/bookmarks/theknights` with the body:
   ```json
   {
     "whosay": "Ni!"
   }
   ```
   Add the "Content-Type: application/json" header to the request, too.

10. And get it back: do a `GET` to `https://localhost:3000/bookmarks` again
    and you should see your data.

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
