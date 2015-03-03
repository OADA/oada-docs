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
- `/meta`
- `/formats`
- `/parents`
- `/children`
- `/permissions`
- `/syncs`
- `/derivatives`

### Example `/resource/{resourceId}` document

The following is a example of JSON data with `view` set to also return the
`_meta` document. That is both the native data and the OADA specific `_meta`
metadata document is returned all together as one JSON ouptut.

*Decoded GET URI: /resource/ixm24ws?view={"_meta": true}*

```http
GET /resource/ixm24ws?view=%7B%22_meta%22%3A%20true%7D HTTP/1.1
Host: agcloud.com
Content-Type: application/json
Authorization: Bearer ajCX83jfax.arfvFA323df

{
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
    "_id": "ixm24ws/_meta",
    "_etag": "lajscfa938f23fuj8x",
    "changeId": 1,
    "name": "Frank's Yield",
    "mimeType": "application/vnd.oada.yield+json",
    "created": "1985-04-12T23:20:50.52Z",
    "createdBy": {
      "_id": "kdufe3f",
      "account": "frank@agidentity.com",
      "name": "Frank Fellow",
      "picture": {
     	 "href": "http://www.gravatar.com/avatar/c7e1ee573f"
      },
      "email": "frank@agcloud.com"
    },
    "modified": "1985-04-12T23:20:50.52Z",
    "modifiedBy": {
      "_id": "kdufe3f",
      "account": "frank@agidentity.com",
      "name": "Frank Fellow",
      "picture": {
     	 "href": "http://www.gravatar.com/avatar/c7e1ee573f"
      },
 	  "email": "frank@agcloud.com"
    },
    "meta": {
      "_id": "/resources/ixm24ws/_meta/meta",
   	  "totalYield": {
   	    "value": 5.6,
   	    "unit": "bushel"
      }
    },
    "formats": {
      "_id": "ixm24ws/_meta/formats",
      "transforms": {
        "application/vnd.oada.yield+json": {
          "original": true,
          "lossy": false,
          "name": "OADA GeoJSON Yield Open Format",
          "openFormat": true
        },
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
    "parents": {
      "_id": "ixm24ws/_meta/parents",
      "items": [{
        "_id": "me30fzp"
      },
      {
        "_id": "me30fzp"
      }]
    },
    "children": {
      "_id": "ixm24ws/_meta/children",
      "items": [{
        "_id": "kl3j93s"
      },
      {
        "_id": "op302xa"
      }]
    },
    "permissions": {
      "_id": "ixm24ws/_meta/permissions",
      "items": [{
        "_id": "ixm24ws/_meta/permissions/kdufe3f",
        "user": {
          "_id": "kdufe3f",
          "account": "frank@agidentity.com",
          "name": "Frank Fellow",
          "picture": {
       	    "href": "http://www.gravatar.com/avatar/c7e1ee573f"
          },
          "email": "frank@agcloud.com"
        },
        "type": "user",
        "level": "owner"
      }]
    },
    "syncs": {
      "_id": "ixm24ws/_meta/syncs",
      "items": [{
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
      {
        "type": "push",
        "url": "https://api.agcloud.com/resources/jdkx82d",
        "headers": {
          "X-Custom": "Custom Value"
        },
        "events": ["change"],
        "authorization": {
          "_id": "8ackam3"
        }
      }]
    },
    "derivatives": {
      "_id": "ixm24ws/_meta/derivatives",
      "items": [{
        "_id": "kl3j93s"
      },
      {
        "_id": "op302xa"
      }]
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
- /bookmarks/seeds
- /bookmarks/prescriptions/planting
- /bookmakrs/prescriptions/fertilizing
- etc.

### Example `/bookmarks` document

```http
GET /bookmarks HTTP/1.1
Host: agcloud.com
Content-Type: application/json
Authorization: Bearer ajCX83jfax.arfvFA323df

{
  "fields": {
    "_id": "XcHd76xz"
  },
  "seeds": {
    "_id": "Mf98adfs"
  },
  "prescriptions": {
    "planting": {
      "_id": "ETYGcaf4"
    },
    "fertilizing": {
      "_id": "jaefy7Sx"
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
  "account": "frank@agidentity.com",
  "name": "Frank Fellow",
  "picture": {
    "href": "http://www.gravatar.com/avatar/c7e1ee573f"
  },
  "email": "frank@agcloud.com",
  "rootResource": {
    "_id": "jx9j3x8"
  },
  "currentUser": {
    "_id": "kdufe3f"
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
  "name": "Employees",
  "members": [{
    "_id": "kdufe3f"
  },
  {
    "_id": "3jkxi82"
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
  "user": {
    "_id": "fjf23cd"
  },
  "scope": "resources groups",
  "created": "1985-04-12T23:20:50.52Z",
  "modified": "1985-04-12T23:20:50.52Z",
  "expires": "1985-05-12T23:20:50.52Z"
}
```

[rfc6901]: http://www.ietf.org/rfc/rfc6901.txt
