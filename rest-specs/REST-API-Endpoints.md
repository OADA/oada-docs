# OADA API Endpoint Overview

* [`/resources`](#user-content-resources)
* [`/bookmarks`](#user-content-bookmarks)
* [`/about`](#user-content-about)
* [`/users`](#user-content-users)
* [`/groups`](#user-content-groups)
* [`/authorizations`](#user-content-authorizations)

# `/resources`

## `/resources/{resourceId}`

OADA's `/resources` are the meat of the OADA API and therefore are also the most
complex. It's responsibilities include:

- Storing all data: binary files, JSON documents, etc.
- Storing user defined metadata about the resource.
- Transforming and representing data in multiple formats.
- Organizing data in a parent/child structure (think Google Drive).
- Shearing data with other users.

Most OADA endpoints are actually resources with a valid resource id. There are
just given their own endpoint to enable easier and automatic discovery of that
information. The same documents can be requested directly using the
`/resources/{resourceId}` endpoint as well.

### Accessing Stored Data
Stored data can be directly accessed with a GET request on the
`/resources/{resourceId}` endpoint.  If the data is in a JSON format
sub-documents can be directly accessed by appending the JSON keys of interest to
the end of  `/resources/{resourceId}`. The mapping follows [RFC 6901 JavaScript
Object Notation (JSON) Pointer][rfc6901]. If the data is a binary format then
the binary blob is returned directly. If the data is a binary format and the
OADA specific `_meta` document is also requested (see below) then the response
is of the `Multipart/mixed` media type where one part is the `_meta` JSON
document and the other is the binary blob. A `302 Found` may be returned if the
resource is available at an alternative location, such as a Content Delivery
Network (CDN).

### The Data's Meta Data
In order to accomplish tasks like storing user defined metadata, sharing
resource with other users, creating a file structure, and synchronizing
resources across clouds each resource has a well defined metadata sub-document
called `_meta`. `_meta` lives at the root of a resource, that is at
`/resources/{resourceId}/_meta` and is a reserved JSON key at the root of the
resource's data document.

The following endpoints, JSON sub-documents, reside under `_meta`:
- `/_formats`
- `/_parents`
- `/_children`
- `/_permissions`
- `/_syncs`
- `/_derivatives`

Note that any other custom endpoints can be added under _meta for any given 
document, however they must not conflict with the standard keys defined here.
For future-proof protection, avoid using keys that begin with "_".

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
