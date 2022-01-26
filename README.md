## Welcome to the **Open Ag Data Alliance** (OADA).

## The important stuff: API Docs


|   Getting Started       |       Specs                 |
|:-----------------------:|:---------------------------:|
| [Intro to the OADA API: Trellis](https://openag.io/oada-docs/intro/OADA_API_Intro_Trellis.html) | 
| [Deploy+Ops](https://openag.io/oada-docs/ops/Ops.html) | 
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

A microservice architecture is such a core part of the OADA model that the service itself is a suite of docker containers.  Before diving in,
you may find it helpful to familiarize yourself with docker and docker-compose.


## Getting Started
--------------------------------------
The best way to get familiar with the OADA API is to use it.  Latest instructions for installing and running the reference OADA implementation can be found at https://github.com/oada/server.  This will get you setup with a locally running instance of OADA and a token you can use to make API requests.

1. Learn about your server and make sure it's up.  Open a browser and go to 
   [https://localhost/.well-known/oada-configuration](https://localhost/.well-known/oada-configuration).
   Look for `oada_base_uri` (where the data is), and 
   `authorization_endpoint` (where to ask for a token). 
   *IMPORTANT NOTE*: if you did not use `mkcert` to setup your SSL certificate, then your browser will not trust it.
   You will have to manually approve it in your browser to see the configuration page.

2. Get an API tool like [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/)

5. Discover what data is on your server for your token.  In Insomnia,
   do a `GET` to `https://localhost/bookmarks`.  Without an `Authorization:` header
   it will fail.  Add it the token you created when you setup your instance:
   ```
   Authorization: Bearer the_token
   ```  
   Now you should get back some JSON listing the data that's available, which in this case is likely just an
   empty JSON object if you just setup your server.

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

8. *Explore*: Create a resource.  You can assign your own resource ID with a PUT, or you
   can ask the server to create an ID for you and execute the PUT for you with that random id.
   ```http
   PUT /resources/123
   {
     "hello": "world"
   }
   ```
   That will create resource `resources/123` if it doesn't exist, and put that body as the initial contents
   for `_rev` 1.
   
   ```http
   POST /resources
   { }
   ```
   That will create a random ID and create it with an empty body.  The ID that it created
   will be returned in the `Content-Location` header on the response.

9. *Link*: Link your new resource.  In order to find your resource again, you need to link it into your user's 
   `/bookmarks` tree.  A link is just an object containing an `_id`.  To link your new `resources/123` resource 
   under the path `/bookmarks/the_most_important_resource`:
   ```http
   PUT /bookmarks/the_most_important_resource
   {
     "_id": "resources/123"
   }
   ```
   or, you can merge it into bookmarks rather than PUT-ing to the key directly:
   ```http
   PUT /bookmarks
   {
     "the_most_important_resource": { 
       "_id": "resources/123"
     }
   }
   ```
   Now, whenever you get the `the_most_important_resource` key from `/bookmarks`, OADA will recognize it as a link
   to `resources/123` and return that resource to you directly
   ```http
   GET /bookmarks/the_most_important_resource
   ```
   returns the contents of `resources/123`.

### Next steps

Read up on the [Rest API Spec](rest-specs/README.md) with examples to learn how to
create resources, link them between documents, track changes, add services or
custom modules, and more.

To see an example of how to solve a particular problem using the OADA API, please refer to the
documentation from the Pork Hackathon: [PorkHack21](https://github.com/porkhack/porkhack21-part1shipping).


### An Overview of OADA Repos

#### The core:
* [oada/oada-docs](https://github.com/oada/oada-docs) The core API spec and associated documentation.

* [oada/server](https://github.com/oada/server) The Docker-based reference implementation of the OADA API.

* [oada/formats](https://github.com/oada/formats) Sets of schemas and examples for various OADA content types.

#### Authorization and Signatures

* [oada/oada-certs](https://github.com/oada/oada-certs) A command line tool and javascript library for signing things and validating
those signatures.  It contains most of the core signature logic used by [trellisfw-signatures](https://github.com/trellisfw/trellisfw-signatures).
You can use it in the `admin` container to setup a new domain on your `oada` installation (to sign the developer certificate),
or you can use it to generate signing key pairs and convert them to JWK's.

* [oada/oada-id-client-js](https://github.com/oada/oada-id-client-js) A javascript library that simplifies performing authorization with
an OADA server.  It handles initiating OAuth2 requests and returning the resulting authorization tokens.

#### Javascript libraries

* [oada/client](https://github.com/oada/client) A Typescript/JS library for Node and the Browser that handles much of the interaction
with an OADA cloud: connecting, keeping an open websocket for changes, setting watches, and concurrency-protected "tree"-based PUTs that ensure a given path exists properly when executing a PUT.

* [oada/jobs](https://github.com/oada/jobs) A Typescript/javascript library that simplifies creating a microservice which listens to a 
job queue for things that it should do.

* [oada/types](https://github.com/oada/types) A wrapper for [oada/formats](https://github.com/oada/formats) that creates and publishes typescript types
from `formats` json schemas.


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

