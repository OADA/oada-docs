# OADA API Endpoint Overview

* [`/resources`](#user-content-resources)
* [`/bookmarks`](#user-content-bookmarks)
* [`/about`](#user-content-about)
* [`/users`](#user-content-users)
* [`/groups`](#user-content-groups)
* [`/authorizations`](#user-content-authorizations)

# `/resources`

## `/resources/{resourceId}`

OADA's `/resources` are the meat and potatoes of the OADA API (in fact
`/bookmarks`, `/meta`,  etc are just special cases of `/resources`) and, as a
result, are the most complex. That said, the OADA team has tried to keep the
required functionally as simple as possible. The responsibilities of
`/resources` include:

*Version 1.0.0:*
- Storing all data: binary files, JSON documents, etc.
- Storing user defined metadata about the resource.
- Maintaining links between data.
- Maintaining resource version information.

*Version 1.0.0+:*
- Transforming and representing data in multiple formats.
- Sharing data with other users.

Many of the OADA endpoints are actually just resources with valid resource
ids. That is, they can be directly accessed with a `/resources/{resourceId}` URI.
They are only given special names within the API to make it easier and allow
automatic discovery of the available data.

### Reserved Keys

All OADA resources have three reserved and required JSON keys, `_id`, `_rev`,
and `_meta`. These keys are present even if the resource is binary, and may
either be accessed directly , i.e., `/resources/{resourceId}/_id`,
`/resources/{resourceId}/_rev`, `/resources/{resourceId}/_meta`, or via a
`Multipart/mixed` response. Therefore, the minimal OADA resource is:

```json
{
  "_id": "8flaRxfRAjf7203",
  "_rev": "34-NXKcjasd72",
  "_meta": {
    "_metaid": "8flaRxfRAjf7203",
    "_rev": "2-LduowjcS2j"
  }
}
```

#### `_id`

All resources must be assigned an id that is unique within a specifc cloud (referred
to as `{resourceId}`) and it must be the same id used to access the resource
under the `/resources` endpoint.  A cloud can choose to let a user create a
resource with an id of his or her choosing (via a PUT to
`/resource/{resourceId}`), however, it is not required by OADA. 

#### `_rev`

Each resource must be assigned a revision number (`_rev`) that is used by other
remote clouds and applications to track changes on that resources. That is, a cloud
or application may GET the `_rev` value on a resource, or parent resource, and
compare it to the last known value to detect changes.

The format of a `_rev` is an incrementing number, a dash, and a random string,
e.g., “34-kdfj02kjlskdf”.  Whenever `_rev` is updated, the front number must
increment, and a new random string must be generated. The random string may be the document's hash or just any sufficiently random string.

Rules for updating `_rev`:

  1. The front number is incremented by one and the string updated whenever a
  change, or set of changes, to a resource becomes available via the API.
  1. The links in parent resources to the modified resource must be updated to
  the new `_rev` value.
    - As a result, the parent resource's `_rev` must also be updated because the
      change in link's `_rev` represents a change the parent resource.
  1. Continue the above steps until their are no more parent changes.

As one can see, links and `_rev` form a graph of resources, all of which are
capable of detecting changes below them. An implementation should be careful to
avoid an infinite loop of `_rev` updating.

It is also worth noting that even though the above steps must happen in the
defined sequence, each "loop" can happen eventually. That is, there may be a
delay between a resource changing and the links in parent documents updating.
However, there may not be a delay between a resource changing and its *own*
`_rev` updating.

### `_meta`

All resources have a meta-data document that helps accomplish tasks like storing
user defined meta-data, resource sharing, and resource synchronization between
clouds and applications. The definitive URI for meta documents is
`/meta/{resourceId}`.

The following endpoints, or JSON sub-documents, reside under `_meta`:

*Version: 1.0.0*
- `/_mediaType`
- `/_stats`

*Version: 1.0.0+*
- `/_formats`
- `/_permissions`
- `/_syncs`
- `/_derivatives`

Note that an application may add any custom keys to the `_meta` document,
however they must not conflict with the standard keys defined here or in the
future. To avoid future conflicts, applications should avoid using custom keys
that begin with "_".

### Links and Versioned Links

You can "link" resources together within OADA using an object containing an
`_id` and an optional `_rev` key(s). There are two fundamental types of links:

#### Non-Versioned 

A non-versioned link **will not** change when the resource it links to does. For
more information on how links are updated, see the below section on versioned
links and the section `_rev`.

An example of a non-versioned link is:

```json
{
  "some_nonversioned_link": { 
    "_id": "456"
  }
}
```

Which should be interpreted as the `some_nonversioned_link` key actually being a
reference to resource 456. Any client that sees this in a document then knows to
follow the link by doing a follow-up GET on `/resources/456`.

#### Versioned

A versioned link **will** change when the resource it links to does, and
therefore, the linking resource also changes.

An example of a versioned link is:

```json
{
  "some_versioned_link": {
    "_id": "456",
    "_rev": "34-kjdf02jkld"
  }
}
```

Which should be interpreted as the `some_versioned_link` key actually being a
reference to the resource 456 with its last known `_rev` of that resource being
"34-kjdf02jkld". A client wanting to only download the content of links when
they change can use the current value of `_rev` to determine if it should or
should not follow the link by doing a follow-up GET request on `/resources/456`.
Note that the parent resource's `_rev` must also update when a link's `_rev`
updates and so a client may monitor just the parent `_rev` value to detect
changes to children.

The `_rev` within a link is automatically set to the last known `_rev` for the
resource given by the `_id` key regardless of the value sent by the client. It
is expected that clients will typically set `_rev` to '0-0' when creating a link,
however, this is not required.

***A special note on meta document links***

It is possible to define links to meta documents. To distinguish between links
to meta documents versus links to resources, the `_metaid` is used in place of the `_id`
key. The `_rev` key can still be used, and functions the same.

# NEED TO EDIT STILL

### Accessing Resources
Resources can be directly downloaded with an HTTP GET request on it's
`/resources/{resourceId}` endpoint. If the data is in a JSON format, then
sub-documents can be directly accessed by appending the JSON keys of interest to
the end of  `/resources/{resourceId}`. The mapping follows [RFC 6901 JavaScript
Object Notation (JSON) Pointer][rfc6901] (*Developers should be sure to take
note of JSON Pointer's tilde escaping*). If the resource is of binary format
then the blob is returned directly. If the OADA specific `_meta` document is
also requested (see below) then the response is will be `Multipart/mixed` where
one part is the `_meta` JSON document and the other is the binary blob. A `302
Found` may be returned if the resource is available at an alternative location,
such as a Content Delivery Network (CDN).
### GET any level of a document and follow links in URLs
The OADA API defines that a URL to any level of a resource should succeed.  For
example, if I get resource 123 and it looks like this:
GET /resources/123
{
    _id: “123”,
      _rev: “9-jk2f30j2323”,
        _meta: { _metaid: “123”, _rev: “3-fdkj20fj2f” },
          a: {
                b: “pink flamingo”
                  }
}

then if I make a request for GET /resources/123/a, I should get in response:
GET /resources/123/a
{
    b: “pink flamingo”
}

and similarly if I make a request for GET  /resources/123/a/b, I should get:
GET /resources/123/a
“pink flamingo”

What will likely happen at minimum is a client will GET /resources/123/_rev to
see if the _rev changed.

In addition, any links that appear in document should be implicitly follow-able
in URLs.  Consider this example:

GET /resources/234
{
    _id: “234”,
      _rev: “9-jk2f30j2323”,
        _meta: { _metaid: “234”, _rev: “3-fdkj20fj2f” },
          a: { _id: “345” }
}

then I will achieve the same result by GET /resources/345 as I would by GET
/resources/234/a because /resources/234/a is a link to resource 345:
GET /resources/234/a
{
    _id: “345”,
      _rev: “7-2903j23fo”,
        _meta: { _metaid: “345”, _rev: “6-kdjf023jkef” },
          c: “The Knights Who Say Ni”
}

And putting those two together, if I want to get “The Knights Who Say Ni”, then
I can do:
GET /resources/234/a/c
“The Knights Who Say Ni”

This is because /resources/234/a becomes /resources/345 due to the link, and
/resources/345/c is the string “The Knights Who Say Ni”.

The rules for turning a URL path into a part of a JSON document are the same as
those defined by JSON Pointer (https://tools.ietf.org/html/rfc6901) for which
there are many libraries.  Basically it just lets you escape ‘/’ in a path with
“~1”, and since ‘~’ is the special escape character, then you have to escape a
‘~’ in a URL with “~0”.  If you are working in javascript, I’ve found the
json-pointer library’s parse() and compile() functions handy:
(https://www.npmjs.com/package/json-pointer) 



Query parameters
There is currently only one existing query parameter defined in the OADA API
currently, and it is named “view”.  Supporting it will not be part of v1.0.0
conformant, and may change some in the future as we flush it out more.  It is
intended to allow a client to turn on and off parts of a document in a response,
and to allow it to request links to be expanded in-place in a response.  If
you’re interested, we’ve defined it here:
https://github.com/OADA/oada-docs/blob/master/rest-specs/View-Proposal.md.  It’s
more complex than the rest of the API, and therefore are awaiting a partner who
has need of it before we flush out its details more for part of OADA 2.0.

Your API has a “portfolioId” parameter to do some filtering.  While I don’t
think it will be considered OADA non-compliant to add extra optional query
parameters, I’d like to find a way to structure your data model so this isn’t
required, or work with you to achieve the same goal with the view parameter
which is intended for this purpose.  I’ve suggested some ideas in the second
section of this document.

media types (or content-types)
All documents served from an OADA-compliant API must have an associated media
type to tell the client which kind of thing it’s getting back from the cloud.
The media type can be anything you want, but should represent enough information
to know how to interpret what’s coming back.  For example, the media type
“application/json” tells the developer they should be able to pass it to
JSON.parse, but it doesn’t tell it what keys to expect.  However, the media type
“application/vnd.observant.sensor.1+json” would tell the client that the
response is JSON, and you should expect to see the keys/schema defined by
version 1 of the application/vnd.observant.sensor model.  We have been defining
open OADA media types as needed thus far, and would be open to doing the same
with you if you’d prefer to have an open standard type over an
observant-specific type.

The media type must be stored in /meta/{resourceid}/_mediaType, and must be
returned in the content-type header in any response.


### Example `/resource/{resourceId}` document

The following is a example of JSON data with `view` set to also return the
`_meta` document. That is both the native data and the OADA specific `_meta`
metadata document is returned all together as one JSON ouptut.

*Decoded GET URI: /resource/ixm24ws?view={"_meta": true}*

```http
GET /resource/ixm24ws?view=%7B%22_meta%22%3A%20true%7D HTTP/1.1
Host: agcloud.com
Content-Type: application/vnd.dummy.yield.format+json
Authorization: Bearer ajCX83jfax.arfvFA323df

{
  "_id": "ixm24ws",
  "_rev": "1-dkjf02jkd",
  "name": "Frank's Yield",
  "totalYield": {
    "value": 5.6,
    "unit": "bushel"
  },
  "type": "FeatureCollection",
  "bbox": [40.42426718029455, 40.42429718029455, -86.841822197086, -86.841852197086],
  "features": [{
    "....": "...."
  }],
  "_meta": {
    "_mediaType": "application/vnd.dummy.yield.format+json",
    "_stats": {
      // Note: this endpoint is not considered stable and may change
      "created": "1985-04-12T23:20:50.52Z",
      "createdBy": { "_id": "kdufe3f", "_rev": "5-jkdjfo2" },
      "modified": "1985-04-12T23:20:50.52Z",
      "modifiedBy": { "_id": "kdufe3f", "_rev": "2-kdjf02d" },
    },
    "_formats": {
      // Note: this endpoint is not considered stable and may change
      "original":  {
        "name": "application/vnd.dummy.yield.format+json",
        "src": { "_href": "https://github.com/oada/oada-docs/formats" },
      },
      "transforms": {
        "application/json": {
          "lossy": false,
          "name": "JavaScript Object Notation",
          "openFormat": false
        },
        "application/netcdf": {
          "lossy": false,
          "name": "Network Common Data Form",
          "openFormat": true
        },
        "application/shape": {
          "lossy": false,
          "name": "Esri Shapefile",
          "openFromat": false
        }
      }
    },
    "_parents": {
      // Note: this endpoint is not considered stable and may change
      "me30fzp": { "_id": "me30fzp", _rev: "1-kdf20d" },
      "1jfk322": { "_id": "me30fzp", _rev: "3-02kflw" }
    },
    "_children": {
      // Note: this endpoint is not considered stable and may change
      "kl3j93s": { "_id": "kl3j93s", _rev: "6-kdkjdf" },
      "op302xa": { "_id": "op302xa", _rev: "2-kjdf02" }
    },
    "_permissions": {
      // Note: this endpoint is not considered stable and may change
      "user": { "_id": "kdufe3f", _rev: "4-jkdf02f" },
      "type": "user",
      "level": "owner"
    },
    "_syncs": {
      // Note: this endpoint is not considered stable and may change
      "kdj02f": {
        "type": "poll",
        "url": "https://api.agcloud.com/resources/jdkx82d",
        "headers": {
          "X-Custom": "Custom Value"
        },
        "latest_etag": "d3fc9278c677bdb7af3781a1ebc2ec090c14f5f3",
        "interval": 3600,
        "authorization": {
          "_id": "8ackam3"
        }
      },
      "02djlkf": {
        "type": "push",
        "url": "https://api.agcloud.com/resources/jdkx82d",
        "headers": {
          "X-Custom": "Custom Value"
        },
        "events": ["change"],
        "authorization": { "_id": "8ackam3", _rev: "5-kjdf02" }
      }
    },
    "_derivatives": {
      // Note: this endpoint is not considered stable and may change
      "kl3j93s": { "_id": "kl3j93s", "_rev": "3-kjdf02jkd" },
      "op302xa": { "_id": "op302xa", "_rev": "4-290fjikdf" }
    }
  }
}
```
# NEED TO EDIT STILL

# `/bookmarks`

## `/bookmarks/{key 1}/.../{key N}`
`/bookmarks` provides a standard way to link to interesting resources in a way
that others can automatically discover them.  They are just plain resources and
so they may be shared, synchronized, and managed the same way.

### Keys
The number of levels of keys is arbitrary. To improve interoperability between
clouds, applications, and devices, OADA will define a standard set of standard
bookmark keys. For example,

- /bookmarks/fields
- /bookmarks/planting/as-applied
- /bookmarks/planting/prescriptions
- /bookmarks/harvest/as-harvested
- etc.

### Example `/bookmarks` document

```http
GET /bookmarks HTTP/1.1
Host: agcloud.com
Content-Type: application/json
Authorization: Bearer ajCX83jfax.arfvFA323df

{
  "fields": {
    "_id": "XcHd76xz", "_rev": "2-kjdofd"
  },
  "seeds": {
    "_id": "Mf98adfs", "_rev": "2-kjdofd"
  },
  "prescriptions": {
    "planting": {
      "_id": "ETYGcaf4", "_rev": "2-kjdofd"
    },
    "fertilizing": {
      "_id": "jaefy7Sx", "_rev": "2-kjdofd"
    }
  }
}
```

# `/users`

## `/users/{userId}`

`/users` provides details of another user's identity, such as, real name, email
address, avatar, etc assuming that user is *known* to the end user. Another user
becomes *known* when it is:

- Local to the cloud and has a public profile.
- Has previously shared files with the end user.

Knowledge of personal identity makes sharing a lot easier and less error prone.
For example, a user can see a picture and real name of another *before* sharing
data.

Users are just plain resources and so they may be shared, synchronized, and
managed in the same way.

### Federated Identity
Currently a cloud is not expected to return information for an arbitrary
federated identity unless that identity has previously logged into the cloud and
the owner of the identity agreed to share the personal information. Later
versions of OADA may consider user discovery across the federation.

### `me` userId
The 'me' userId is a special id that refers the currently logged in user. This
can be used by an application to "bootstrap" itself. That is, the application
can automatically discover the necessary information to show the user a
reasonable first screen. For example, locating the root resource or the user's
bookmarks resource.

### Example `/users/{userId}` document

```http
GET /users/kdufe3f HTTP/1.1
Host: agcloud.com
Content-Type: application/json
Authorization: Bearer ajCX83jfax.arfvFA323df

{
  "_id": "kdufe3f",
  "_rev": "2-kdjf02",
  "account": "frank@agidentity.com",
  "name": "Frank Fellow",
  "picture": {
    "href": "http://www.gravatar.com/avatar/c7e1ee573f"
  },
  "email": "frank@agcloud.com",
  "rootResource": {
    "_id": "jx9j3x8", "_rev": "2-kdjf2d"
  },
  "currentUser": {
    "_id": "kdufe3f", "_rev": "2-kdjf2d"
  }
}
```

# `/groups`
## `/groups/{groupId}`
`/groups` list, creates, and manages groups of users. They can be used to
allocate resource permissions more flexibly. For example, at any time a user can
be added or removed from a group and all previously shared files are
automatically become accessible or inaccessible, respectively.

Groups are just plain resources and so they may be shared, synchronized, and
managed in the same way.

### Example `/groups/{groupId}` document

```http
GET /groups/jf72jsd HTTP/1.1
Host: agcloud.com
Content-Type: application/json
Authorization: Bearer ajCX83jfax.arfvFA323df

{
  "_id": "jf72jsd",
  "_rev": "3-dkjfowwf",
  "name": "Employees",
  "members": [{
    "_id": "kdufe3f", "_rev": "3-kdjf02fdd",
  },
  {
    "_id": "3jkxi82", "_rev": "3-kdjf02fdd",
  }]
}
```

# `/authorizations`
## `/authorizations/{authorizationId}`

`/authorizations` list, creates, and manages the current user's authorizations
for a third party. Currently it is meant to manage OAuth 2.0 tokens, but could
  hypothetically manage any type of authorization.

### Example `/authorizations/{authorizationId}` document

```http
GET /groups/jf72jsd HTTP/1.1
Host: agcloud.com
Content-Type: application/json
Authorization: Bearer ajCX83jfax.arfvFA323df

{
  "_id": "jf72jsd",
  "_rev": "4-jkf2olkdf",
  "user": {
    "_id": "fjf23cd", "_rev": "8-kjdf02j"
  },
  "scope": "resources groups",
  "created": "1985-04-12T23:20:50.52Z",
  "modified": "1985-04-12T23:20:50.52Z",
  "expires": "1985-05-12T23:20:50.52Z"
}
```

[rfc6901]: http://www.ietf.org/rfc/rfc6901.txt
