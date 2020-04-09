## Welcome to the **Open Ag Data Alliance** (OADA).

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/OADA/oada-docs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## The important stuff: API Docs


|   Getting Started       |       Specs                 |
|:-----------------------:|:---------------------------:|
| [Intro to the OADA API: Trellis](https://cdn.rawgit.com/OADA/oada-docs/master/intro/OADA_API_Intro_Trellis.html) | 
| [Deploy+Ops](https://cdn.rawgit.com/OADA/oada-docs/master/ops/Ops.html) | 
| [Intro to OADA Authentication and Authorization](getting_started/auth/README.md) | [Authorization and Authentication](rest-specs/Authentication_and_Authorization.md) |

## Overview

The purpose of the Open Ag Data Alliance is to develop a standard API framework for 
automated data exchange.  If a person has data stored in one place,
and would like an app or service to be able to access it, they need only know the
top-level domain where their data sits in order for the app or service to use it, providing permission when
setting up the connection.

## For Developers
From a developer's perspective, OADA is an API specification and an open source implementation of that API spec.
That installable implementation can be found under this Github organization at [oada-srvc-docker](https://github.com/oada/oada-srvc-docker).
This is sort of like learning SQL as a query language, and then installing MySQL to use it.  Learning the OADA API is the language,
and running the open source implementation lets you use it.

A microservice architectur is such a core part of the OADA model that the service itself is a suite of docker containers.  Before diving in,
you may find it helpful to familiarize yourself with docker and docker-compose.


## Getting Started
--------------------------------------
The best way to get familiar with the OADA API is to use it.  Do this:

1. Install the OADA server code:
   ```git clone git@github.com:OADA/oada-srvc-docker.git```

2. Install the OADA helper script and get bash completion for services:
   ```bash
   cd oada-srvc-docker
   oada --install-self
   ```

2. Bring up the server (it runs on localhost at port 80 and 443).  Include a set of dummy users and tokens
   to simplify getting started (don't worry, these are easily removed later by simply omiting the `--dev` flag):
   ```
   oada --dev up -d
   ```
   Note that the "up -d" part is passed to docker compose, just like `docker-compose up -d`.

3. Learn about your server and make sure it's up.  Open a browser and go to 
   [https://localhost/.well-known/oada-configuration](https://localhost/.well-known/oada-configuration).
   Look for `oada_base_uri` (where the data is), and 
   `authorization_endpoint` (where to ask for a token). 
   *IMPORTANT NOTE*: the local SSL certificate is self-signed.  You have to manually approve it in your browser.

4. Get an API tool like [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/)

5. Discover what data is on your server for a token.  In Insomnia,
   do a `GET` to `https://localhost/bookmarks`.  Without an `Authorization:` header
   it will fail.  Add it using one of the dummy tokens (`def`) created with the `--dev` flag earlier:
   ```
   Authorization: Bearer def
   ```  
   Now you should get back some JSON listing the data that's available.

6. Add some data to your server.  In Insomnia, with  the same `Authorization:` header, 
   do a `PUT` to `https://localhost/bookmarks/theknights` with the body:
   ```json
   {
     "whosay": "Ni!"
   }
   ```
   Add the `Content-Type: application/vnd.oada.bookmarks.1+json` header to the request, too.

7. And get it back: do a `GET` to `https://localhost/bookmarks` again
   and you should see your new data data: now the resource has a key named `theknights`.


### Next steps

Read up on the [Rest API Spec](rest-specs/README.md) with examples to learn how to
create resources, link them between documents, track changes, add services or
custom modules, and more.

Concepts To fill in:
Overview of the important repos here
oada-formats
users, tokens, permissions
Trellis signatures
Trusted Lists
Creating an app...


## Frequently Asked Questions

1: How is OADA related to [Trellis](https://github.com/trellisfw)?
```
Trellis is simply a different "brand" name for OADA, targeted toward the food supply chain industry.
Trellis uses OADA as its API, and adds some formats
```

--------------------------------------------------

## Contributing
[Developer Guidelines](contributing/Developer-Guidelines.md)


## Questions
For contributors to the OADA project, the best method for contact is the
[oada-dev](https://join.slack.com/t/oada-dev/shared_invite/enQtOTA3NzU0ODUzNTU2LTcwMmE4NWE2MWFiMTcxYjA1YTBjYjgyMzA4NDgzODlmMjkzNzM4YzVhYjI5ZDE4YjFlYjYzNTdhYWE4MTc1MDQ)
public Slack team.

