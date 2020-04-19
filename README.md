## Welcome to the **Open Ag Data Alliance** (OADA).

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

A microservice architecture is such a core part of the OADA model that the service itself is a suite of docker containers.  Before diving in,
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

### Create Users

There is a script in the admin container for adding users.  If a user is an admin user,
they can also add users via the `/users` part of the OADA API.

To add an admin user:
```bash
# oada run --rm admin useradd -a
Username: <username>
Password: <password>
Domain: <domain for this user>
```
Once the initial admin user is made, they can hand out tokens with permission to create users via the API:
```http
POST /users
{ username: 'username', password: 'password' }
```
NOTE: the password is hashed and salted properly for login before inserting in the database.

### Services and Modules

You can override or augment core components of your OADA installation by enabling additional
services inside [oada-srvc-docker](https://github.com/oada/oada-srvc-docker).  For example, if you want to
use your own authentication mechanism to login, you can override `auth` with your own container.  
If you want to enable backups, install the [oada-backups](https://github.com/oada/oada-backups) service
and enable it.  Let's install backups to see how it works:

```bash
cd path/to/oada-srvc-docker
cd services-available
git clone git@github.com:OADA/oada-backups.git
cd ../services-enabled
ln -s ../serivces-available/oada-backups .
```

[oada-backups](https://github.com/oada/oada-backups) has a docker-compose file inside that defines its service
and augments the core services.  Once symlinked to services-enabled, the `oada` command will pickup that
compose file and add it to all the others.  Now an `oada up -d` will start the oada-backups services as well.
In this case, it keeps a rolling set of backups of the internal `arangodb` database in a docker volume.

As a side note, you can also define a suite of cooperating services in a single folder that share a single
docker-compose file.  


### An Overview of OADA Repos

#### The core:
* [oada-docs](https://github.com/oada/oada-docs) The core API spec and associated documentation.

* [oada-srvc-docker](https://github.com/oada/oada-srvc-docker) The installable reference implementation of the OADA API.

* [oada-formats](https://github.com/oada/oada-formats) Sets of schemas and examples for various OADA content types.

#### Installable services or modules:
* [oada-backups](https://github.com/oada/oada-backups) An OADA installable service that creates a rolling backup of the internal 
ArangoDB database every night.

* [oada-ensure](https://github.com/oada/oada-ensre) An OADA installable services intended to one day allow configurable
integrity checks against a tree: i.e. when a write happens, it will `ensure` that other things happen too like making
like linking back to a parent anytime a child is made.

#### Authorization and Signatures

* [oada-certs](https://github.com/oada/oada-certs) A command line tool and javascript library for signing things and validating
those signatures.  It contains most of the core signature logic used by [trellisfw-signatures](https://github.com/trellisfw/trellisfw-signatures).
You can use it in the `admin` container to setup a new domain on your `oada-srvc-docker` installation (to sign the developer certificate),
or you can use it to generate signing key pairs and convert them to JWK's.

* [oada-trusted-lists](https://github.com/oada/oada-trusted-lists) The list of trusted signing keys for OADA developer certificates.

* [oada-id-client-js](https://github.com/oada/oada-id-client-js) A javascript library that simplifies performing authorization with
an OADA server.  It handles initiating OAuth2 requests and returning the resulting authorization tokens.

#### Javascript libraries

* [oada-cache](https://github.com/oada/oada-cache) A Vanilla Javascript library for Node and the Browser that handles much of the interaction
with an OADA cloud: connecting, keeping an open websocket for changes, setting watches, caching data locally with automatic updates from
the change feeds, resuming watches where you left off, and concurrency-protected "tree"-based PUTs that ensure a given path exists properly prior to
executing a PUT.

* [oada-jobs](https://github.com/oada/oada-jobs) A javascript library that simplifies creating a microservice which listens to a 
job queue for things to appear that it should do.

* [cerebral-provider](https//github.com/oada/cerebral-provider) A `Provider` wrapper for OADA, used when making web apps that use
the [Cerebral-js](https://cerebraljs.com) framework.

* [cerebral-module](https://github.com/oada/cerebral-module) A state management module for the [Cerebral-js](https://cerebraljs.com) app
development framework.  Including this module in your project will replicate a given subtree from an OADA installation in your React.js
state tree, keeping it in sync automatically via the change feed.

* [type](https://github.com/oada/types) A wrapper for [oada-formats](https://github.com/oada/oada-formats) that creates typescript types
from `oada-formats` schemas.

* [oada-cache-overmind](https://github.com/oada/oada-cache-overmind) A state management module for the [Overmind-js](https://overmindjs.org) 
app development framework.  Much like [cerebral-module](https://github.com/oada/cerebral-module), this will keep a subtree from an
OADA service in your React.js state tree and keep it up to date in real-time via the change feed.


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

