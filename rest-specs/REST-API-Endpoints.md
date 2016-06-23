# Contents

- [`/resources`](#resources)
  - [`/resources/{resourceId}`](#resourcesresourceid)
    - [Reserved and Required Keys](#reserved-and-required-keys)
      - [`_id`](#_id)
      - [`_rev`](#_rev)
    - [`_meta`](#_meta)
    - [Links and Versioned Links](#links-and-versioned-links)
      - [Non-Versioned](#non-versioned)
      - [Versioned](#versioned)
    - [Accessing Resources](#accessing-resources)
      - [Binary blob](#binary-blob)
      - [JSON Document](#json-document)
        - [Accessing sub-documents](#accessing-sub-documents)
        - [Sub-documents follow links](#sub-documents-follow-links)
    - [Media Types (or Content-Types)](#media-types-or-content-types)
    - [Query Parameters](#query-parameters)
    - [The Usage of Arrays](#the-usage-of-arrays)
    - [Partitioning of Data Using Versioned Links](#partitioning-of-data-using-versioned-links)
    - [Example `/resource/{resourceId}` document](#example-resourceresourceid-document)
- [`/meta`](#meta)
  - [`/meta/{resourceId}`](#metaresourceid)
    - [Meta Documents Are Basically Resources](#meta-documents-are-basically-resources)
  - [Reserved and Required Keys](#reserved-and-required-keys-1)
    - [`_mediaType`](#_mediatype)
    - [`_stats`](#_stats)
      - [`created`](#created)
      - [`createdBy`](#createdby)
      - [`modified`](#modified)
      - [`modifiedBy`](#modifiedby)
    - [Storing data in meta](#storing-data-in-meta)
    - [Example `/meta/{resourceId}` Document](#example-metaresourceid-document)
- [`/bookmarks`](#bookmarks)
  - [`/bookmarks/{key 1}/.../{key N}`](#bookmarkskey-1key-n)
    - [`/bookmarks` Are Resources](#bookmarks-are-resources)
    - [`application/vnd.oada.bookmarks.1+json` Media Type](#applicationvndoadabookmarks1json-media-type)
    - [Example `/bookmarks` document](#example-bookmarks-document)

*Draft: Version 1.0.0+*
- [`/users` (Draft)](#users-draft)
  - [`/users/{userId}`](#usersuserid)
    - [`/users` Are Resources](#users-are-resources)
    - [Federated Identity](#federated-identity)
    - [`me` {userId}](#me-userid)
    - [Example `/users/{userId}` document](#example-usersuserid-document)
- [`/groups` (Draft)](#groups-draft)
  - [`/groups/{groupId}`](#groupsgroupid)
    - [`/groups` Are Resources](#groups-are-resources)
    - [Example `/groups/{groupId}` document](#example-groupsgroupid-document)
- [`/authorizations` (Draft)](#authorizations-draft)
  - [`/authorizations/{authorizationId}`](#authorizationsauthorizationid)
    - [`/authorizations` Are Resources](#authorizations-are-resources)
    - [Example `/authorizations/{authorizationId}` document](#example-authorizationsauthorizationid-document)

# `/resources`

## `/resources/{resourceId}`

OADA's `/resources` are the meat and potatoes of the OADA API (in fact
`/bookmarks`, `/meta`,  etc are just special cases of `/resources`) and, as a
result, are the most complex. That said, the OADA team has tried to keep the
required functionally as simple as possible. The responsibilities of
`/resources` include:

- Storing all data: binary files, JSON documents, etc.
- Storing user defined metadata about the resource.
- Maintaining links between data.
- Maintaining resource version information.

*Draft: Version 1.0.0+:*
- Transforming and representing data in multiple formats.
- Sharing data with other users.

Many of the OADA endpoints are actually just resources with valid resource ids.
That is, they can be directly accessed with a `/resources/{resourceId}` URI.
They are only given special names within the API to make it easier and allow
automatic discovery of the available data.

### Reserved and Required Keys

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
remote clouds and applications to track changes on that resources. A cloud
or application may GET the `_rev` value on a resource and
compare it to the last known value to detect changes.

The format of a `_rev` is an incrementing number, a dash, and a random string,
e.g., “34-kdfj02kjlskdf”.  Whenever `_rev` is updated, the front number must
increment, and a new random string must be generated. The random string may be
the document's hash or just any sufficiently random string.

Rules for updating `_rev`:

  1. The front number is incremented by one and the string updated whenever a
  change or set of changes to a resource becomes available via the API.
  1. The links in parent resources to the modified resource must be updated to
  the new `_rev` value.
- As a result, the parent resource's `_rev` must also be updated because the
change in link's `_rev` represents a change the parent resource.
  1. Continue the above steps until their are no more parent changes.

As one can see, links and `_rev` form a graph of resources, all of which are
capable of detecting changes below them. An implementation should be careful to
avoid an infinite loop of `_rev` updating.  If a resource has a versioned
link to itself, the _rev is not defined and may be set to `0-0`.

It is also worth noting that even though the above steps must happen in the
defined sequence, updates to `_rev` can happen eventually.  This means there may be a
delay between a resource changing it's `_rev` changing, and similarly for 
the links in parent documents.

### `_meta`

A link to the resource's meta-document. See the [section on
`/meta`](#user-ccontent-meta) for more information.


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

A versioned link **will** eventually change when the resource it links to does, and
therefore, the resource containing the link also changes.

An example of a versioned link is:

```json
{
  "some_versioned_link": {
    "_id": "456",
    "_rev": "34-kjdf02jkld"
  }
}
```

which should be interpreted as the `some_versioned_link` key actually being a
reference to the resource 456, and the last known `_rev` of resource 456 is  
"34-kjdf02jkld". A client wanting to only download the content of links when
they change can use the current value of `_rev` to determine if it should 
follow the link by doing a follow-up GET request on `/resources/456`.
Note that the parent resource's `_rev` must also update when a link's `_rev`
updates and so a client may monitor just the parent's `_rev` to detect
changes to children.

The `_rev` within a link is automatically set to the last known `_rev` for the
resource given by the `_id` key regardless of the value sent by the client. It
is expected that clients will typically set `_rev` to '0-0' when creating a link,
to indicate to the cloud that they would like it to be a versioned link, however 
this particular value is not required.

***A special note on meta document links***

It is possible to define links to meta documents. To distinguish between links
to meta documents versus links to resources, the `_metaid` is used in place of the `_id`
key. The `_rev` key can still be used, and functions the same.

### Accessing Resources
A resource can be directly downloaded with an HTTP GET request on its
`/resources/{resourceId}` endpoint. There are two main format options:

#### Binary (non-JSON) blob

Binary blobs are stored directly at the `/resources/{resourceId}` URI. Only the
reserved and required JSON resource keys, e.g., `_id`, `_rev`, `_meta`, exist
beyond that. They can be access directly by adding their name as a suffix to the
resource URI or by using the `view` parameter to expand them,
resulting in a `Multipart/mixed` response.

#### JSON Document

JSON documents can be accessed in full at the `/resources/{resourceId}` URI. The
reserved and required JSON resource keys, e.g., `_id`, `_rev`, `_meta`, are
automatically merged at the top level of the document in their native format.

A `302 Found` may be returned if the resource is available at an alternative
location, such as a Content Delivery Network (CDN).

##### Accessing sub-documents

Any sub-document of a resource can directly accessed by appending a path of JSON
keys to the end of its `/resources/{resourceId}` URI.  The mapping follows [RFC
6901 JavaScript Object Notation (JSON) Pointer][rfc6901] (*Developers should be
sure to take note of JSON Pointer's tilde escaping*).

For example, if the document stored at `/resources/123` is:

```json
{
  "_id": "123",
  "_rev": "9-jk2f30j2323",
  "_meta": {
    "_metaid": "123",
    "_rev": "3-fdkj20fj2f"
  },
  "a": {
    "b": "pink flamingo"
  }
}
```

Then a GET request to `/resources/123/a` returns:

```json
{
  "b": "pink flamingo"
}
```

And a GET request to `/resources/123/a/b` returns:

```json
"pink flamingo"
```

This can be particularly useful to a client checking if a resource changed. One
can make an very efficient request to `/resources/{resourceId}/_rev` to get the
current revision number of the resource.

##### Sub-documents follow links

If a link is present in a given sub-path the cloud will attempt to automatically
follow the link and continue applying the path on the new resource.

For example, if the document stored at `/resources/234` is:

```json
{
  "_id": "234",
  "_rev": "9-jk2f30j2323",
  "_meta": {
    "_metaid": "234", 
    "_rev": "3-fdkj20fj2f"
  },
  "a": { 
    "_id": "345" 
  }
}
```

and the document stored at `/resources/345` is:

```json
{
  "_id": "345",
  "_rev": "2-ia73mkjfxy2",
  "_meta": {
    "_metaid": "345", 
    "_rev": "8-xk73dhafd7"
  },
  "c": "The Knights Who Say Ni"
}
```

Then a GET request to `/resources/234/a` evaluates to exactly the 345 resource:
```json
{
  "_id": "345",
  "_rev": "2-ia73mkjfxy2",
  "_meta": {
    "_metaid": "345", 
    "_rev": "8-xk73dhafd7"
  },
  "c": "The Knights Who Say Ni"
}
```

And a GET request to `/resoruces/234/a/c` is the same as `/resources/345/c`: 

```json
"The Knights Who Say Ni"
```

This feature is particularly useful to a client when dealing with `/bookmarks`,
where it can directly access the data it is interested in rather than first
looking up the resource id from the bookmark.

### Media Types (or Content-Types)

OADA makes use of HTTP Content-Types to help inform the client what kind of
data it is receiving. There are no restrictions on the media types names, other
than what is imposed by HTTP itself. However, it is recommended that it contains
sufficient information for a client to successfully interpret the data.

For example, the media type `application/json` tells a client that it should be
able to parse it as valid JSON, but it does not tell it what keys to expect.
ALternately, the media type `application/vnd.example.sensor.1+json` tells the client
that the response is not only JSON but that it should also expect to see the
keys defined by version 1 of the application/vnd.example.sensor model. 

OADA maintains open media types for data that lack existing options.  While the
project prefers to use existing and popular open formats, it is open to defining
new formats as needed moving forward.

### Query Parameters

The only *officially* supported query parameter is `view`, however it is **not**
required for OADA v1.0.0 conformance. More details can be found in the 
[View Proposal][view].

Clouds may support other query parameters but they should not expect that any
particular OADA-conformant clients can make use of them since they are non-standard.

### The Usage of Arrays

Arrays are tricky creatures in highly scalable systems because they have
an inherent order. If a particular OADA platform grows to a scale where an
eventually-consistent underlying data store is necessary, arrays will cause
problems because simultaneous requests have undefined order. Therefore, OADA
recommends that clouds and clients use object's with random key strings over
arrays whenever possible in new formats. Therefore, ordering is no longer an
issue, and the client can arbitrarily append new data and choose to order the
resource however they want after retrieving it.

Within OADA, it is very easy to create these un-ordered sets of data in any object.
A POST to any level of a JSON document will create a random string at that
level and store the POSTed value there.  This is the recommended way to
incrementally add data in a scalable way.

### Partitioning of Data Using Versioned Links

OADA’s versioned links make it possible to partition your data into sets of
manageably-sized chunks as their own resources, and use the versioned links to
allow a client to synchronize only the chunks that have changed since the last
time they checked. 

A partitioning hash can be used as the key to chunk the data in a way that
achieves some sort of lookup index. For example, geospatial data could use
geohashes and time-series data could use a UNIX timestamp quantized to a certain
number of seconds. See the OADA [as-harvested][as-harvested] format for a
geohash example.

### Example `/resource/{resourceId}` document

The following is a example of a possible JSON prescription planting resource:

```json
{
  "_id": "ixm24ws",
  "_rev": "1-dkjf02jkd",
  "_meta": {
    "_metaid": "ixm24ws",
    "_rev": "3-xjakck73d"
  },
  "name": "Smith30 Prescription #2",
  "namespace": {
    "oada.planting.prescription": {
      "src": "https://github.com/oada/oada-docs/blob/master/formats/planting.prescription.js",
      "population": {
        "units": "ksds/ac"
      }
    },
  },
  "zones": {
    "default": {
      "population": { "value": "32.0" },
      "crop": { "name": "CORN" }
    },
    "jdkfji2": {
      "population": { "value": "32.0" },
    }
  },
  "geojson": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { 
          "type": "Polygon",
          "coordinates": [ [ ] ]
        },
        "properties": {
          "zone": "jdkfji2"
        }
      },
    ]
  }
}
```

# `/meta`

## `/meta/{resourceId}`

`/meta` is the base URI for all meta-data documents. Each resource has exactly
one meta-data document and it is used to help accomplish tasks such as:

  - Storing user defined meta-data about a resource
  - Resource sharing
  - Resource synchronization between clouds and applications
  
`/meta` documents share the id of their associated resource and have an
authoritative URI of `/meta/{resourceId}`. However, the `/meta` document can
also be accessed via the top-level `_meta` key of a resource since all resources
contain a versioned link to their meta documents..

### Meta Documents Are Basically Resources

`/meta` documents are basically resources. They behave identically to resources, with the 
single exception that `/meta` documents do not have `/meta` documents themselves
and therefore also do not have the requirement of a top level `_meta` key.  For this reason,
they do not have an _id property, but rather _metaid which is functionally equivalent.

## Reserved and Required Keys

The following endpoints, or JSON sub-documents, must be present in a `/meta`
document.

*Version: 1.0.0*
- `/_mediaType`
- `/_stats`

*Version: 1.0.0+*
- `/_formats`
- `/_permissions`
- `/_syncs`
- `/_derivatives`

Note that an application may add custom keys to a `/meta` document, however they
must not conflict with the standard keys defined here or in the future. To avoid
conflicts with the OADA spec, applications should avoid using custom keys that
start with the underscore character.

### `_mediaType`

The media type stored in `_mediaType` must be the same value that is returned in 
the HTTP Content-Type header.

### `_stats`

The `_stats` is a JSON document that contains the standard "file" statistics
from a UNIX type file system. The required keys are:

#### `created`

The timestamp at which the resource was created.

#### `createdBy`

A link to the user who created the resource (*Note: Users are currently
defined only in v1.0.0+*)

#### `modified`

The timestamp at which the resource was last modified.

#### `modifiedBy`

A link to the user which last modified the resource (*Note: Users are 
currently defined only in v1.0.0+*)

### Storing data in /meta

OADA expects clouds and clients to store data in the `/meta` document only when
that information can not be stored within the resource itself. For example, you might
choose to store information in /meta if the resource type is not JSON-based and therefore
not be easily extended, or the format's schema is violated if an extra key is present.

### Example `/meta/{resourceId}` Document

The following is an example `/meta` document ("the_meaning_of_everything" is a custom
key stored in the meta document):

```json
{
  "_id": "3lkxfu38c",
  "_rev": "1-kdsjfx8e",
  "_mediaType": "application/vnd.example.sensor.1+json",
  "_stats": {
    "created": "1985-04-12T23:20:50.52Z",
    "createdBy": {
      "_id": "kdufe3f",
      "_rev": "5-jkdjfo2"
    },
    "modified": "1985-04-12T23:20:50.52Z",
    "modifiedBy": {
      "_id": "kdufe3f",
      "_rev": "2-kdjf02d"
    },
  },
  "the_meaning_of_everything": "42"
}
```

# `/bookmarks`

## `/bookmarks/{key 1}/.../{key N}`

`/bookmarks` provide a standard way to link to and discover interesting
resources. OADA has defined a JSON bookmark media type,
`application/vnd.oada.bookmarks.1+json`, and we strongly encourage everyone to
use it. In doing so, clients will be able to easily discover various available
resources and support significantly more useful and productive
applications.

The content of the document should be sets of key/value pairs that terminate in
a versioned link to a resource. 

### `/bookmarks` Are Resources

`/bookmarks` are plain resources and therefore can be shared, synchronized, and
managed in the same way. Additionally they must function identically to and meet
the same requirements as resources. In fact, we recommend that clouds just use
their resource implementation for bookmarks and view the `/bookmarks` URI as
merely a convenient way for a client to access the specific user's bookmark
resource.

### `application/vnd.oada.bookmarks.1+json` Media Type

OADA has standardized a recommend bookmarks media type,
`application/vnd.oada.bookmarks.1+json`, that should help interoperability
between clouds and clients. The media type is a [duck-typed][duck-typed] format
in the sense that as long as standard-defined keys are not used to mean
something other than their definition, then keys can be used to mean anything.

We encourage clients and clouds to share their usage of bookmarks keys with the
OADA community so that the standard list can be appropriately extended.

Examples of some currently standardized keys are:

- /bookmarks/irrigation
- /bookmarks/planting
- /bookmarks/harvest
- /bookmarks/machines
- /bookmarks/machines/harvesters
- etc.

### Example `/bookmarks` document

```json
{
  "_id": "fJXCdjDS",
  "_rev": "20-asFae3",
  "_meta": {
    "_metaid": "FKx34dvs",
    "_rev": "1-sd23cx"
  },
  "irrigation": {
    "_id": "XcHd76xz",
    "_rev": "10-jfi3fu"
  },
  "planting": {
    "_id": "Mf98adfs",
    "_rev": "1-3ioxjz"
  },
  "harvest": {
    "_id": "XJKfkald",
    "_rev": "5-iemxma"
  },
  "machines": {
    "_id": "ETYGcaf4", 
    "_rev": "2-kjdofd"
  }
}
```

*Draft: Version 1.0.0+*

# `/users` (Draft)

## `/users/{userId}`

`/users` provide details of a user's identity, such as, real name, email
address, avatar, etc assuming that user is *known* to the currently-logged-in user. 
Another user becomes *known* when it is:

- Local to the cloud and has a public profile.
- Has previously shared files with the end user.

Knowledge of personal identity makes sharing a lot easier and less error prone.
For example, a user can see a picture and the real name of another *before* sharing
data.

### `/users` Are Resources

`/users` are plain resources and therefore can be shared, synchronized, and
managed in the same way.

### Federated Identity
Currently a cloud is not expected to return information for an arbitrary
federated identity unless that identity has previously logged in to the cloud and
the owner of the identity agreed to share their personal information. Later
versions of OADA may consider user discovery across the federation.

### `me` {userId}
The 'me' {userId} is a special id that refers the currently logged in user. This
can be used by an application to "bootstrap" itself. The application
can automatically discover the necessary information to show the user a
reasonable first screen. For example, locating the root resource or the user's
bookmarks resource.

### Example `/users/{userId}` document

```json
{
  "_id": "kdufe3f",
  "_rev": "2-kdjf02",
  "_meta": {
    "_metaid": "kdufe3f",
    "_rev": "1-kxjcklhd",
  },
  "account": "frank@agidentity.com",
  "name": "Frank Fellow",
  "picture": {
    "href": "http://www.gravatar.com/avatar/c7e1ee573f"
  },
  "email": "frank@agcloud.com",
  "rootResource": {
    "_id": "jx9j3x8",
    "_rev": "2-kdjf2d"
  },
  "bookmarks": {
    "_id": "kdufe3f",
    "_rev": "2-kdjf2d"
  }
}
```

# `/groups` (Draft)

## `/groups/{groupId}`

`/groups` lists, creates, and manages groups of users. They can be used to
allocate resource permissions more flexibly. For example, at any time a user can
be added or removed from a group and all previously shared files
automatically become accessible or inaccessible, respectively.

### `/groups` Are Resources

`/groups` are plain resources and so they may be shared, synchronized, and
managed in the same way.

### Example `/groups/{groupId}` document

```json
{
  "_id": "jf72jsd",
  "_rev": "3-dkjfowwf",
  "_meta": {
    "_metaid": "jf72jsd",
    "_rev": "3-jxkljalskdj",
  },
  "name": "Employees",
  "members": {
    "jaio3j": {
      "_id": "kdufe3f", 
      "_rev": "3-kdjf02fdd",
    },
    "ejijmc": {
      "_id": "3jkxi82",
      "_rev": "3-kdjf02fdd",
    }
  }
}
```

# `/authorizations` (Draft)

## `/authorizations/{authorizationId}`

`/authorizations` list, create, and manage the current user's authorizations
to third parties. Currently they are meant to manage OAuth 2.0 tokens, but could
hypothetically manage any type of authorization.

### `/authorizations` Are Resources

`/authorizations` are plain resources and so they may be shared, synchronized,
and managed in the same way.

### Example `/authorizations/{authorizationId}` document

```json
{
  "_id": "jf72jsd",
  "_rev": "4-jkf2olkdf",
  "_meta": {
    "_metaid": "jf72jsd",
    "_rev": "2-xkljfaasdfj",
  },
  "tokens": {
    "kaljf": {
      "user": {
        "_id": "fjf23cd",
        "_rev": "8-kjdf02j"
      },
      "scope": "resources groups",
      "created": "1985-04-12T23:20:50.52Z",
      "modified": "1985-04-12T23:20:50.52Z",
      "expires": "1985-05-12T23:20:50.52Z"
    }
  }
}
```

[rfc6901]: http://www.ietf.org/rfc/rfc6901.txt
[view]: https://github.com/OADA/oada-docs/blob/master/rest-specs/View-Proposal.md
[duck-typed]: https://en.wikipedia.org/wiki/Duck_typing
[as-harvested]: https://github.com/OADA/oada-docs/blob/1.0.0-rc/formats/harvest/harvest.as-harvested.map.yield-moisture.js
