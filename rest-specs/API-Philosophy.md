# OADA API Philosophy

The OADA API follows a few basic philosophies that allow it to remain general and easily mapped to existing APIs:

1. Everything is a resource and has a unique canonical endpoint (`/resources/<resourceId>`)
2. Every resource (regardless of its data type) has a JSON meta resource (`/meta/<resourceId>`) that follows the same rules as plain old resources [*Note*: in fact, we recommend that implementations just URL rewrite `/meta` to `/resources`].
3. Bookmarks are resources that follows the same rules as plain old resources [*Note*: in fact, we recommend that implementations just URL rewrite `/bookmarks` to `/resources`]. The properties should be nouns rather than verbs and are used to discover resources of interest (`/bookmarks/<anything>/.../<anything>`). [*Note:* A side goal of OADA is to foster a widely accepted `/bookmarks` structure.]

## Resources

There are no limitations on what a resource may or may not be. They can be binary blobs, XML, CSV, etc. OADA has a slight preference that newly defined things are in a JSON based format, however, it does not require it. The affinity to JSON is less because of its ability as a file format but more because of a major benefit within the OADA API. That is, a JSON document's sub-document is directly accessible by appending the path of keys to the sub-document onto the end of that resource's URL ([RFC 6901 JSON Pointer][json-pointer] defines how this mapping works, and it is likely that future versions of OADA will support a similar mapping for other formats, such as XML). For example:

Assuming the JSON resource at `/resources/jikdf` is:

```json
{
  "_id": "ksd02j",
  "_rev": "1-5dfj02",
  "_meta": {
    "_metaId": "ksd02j",
    "_rev": "1-adfad",
  },

   "a": {
      "b": {
         "c": 123
      },
   "d": "efg"
}
```

Then a request for the sub-document under the `b` key can be made by joining `a` and `b` with slashes and adding it to the end of the URL path. For example: 

```http
Request
GET /resources/jikdf/a/b HTTP/1.1
Host: valleyix.com
Authorization: Bearer 123456789

Response
HTTP/1.1 200 Ok
Content-Type: application/json

{
   "c": 123
}
```

For more detailed documentation see the [OADA resource documentation][resource-docs].

## Linking Resources (and Meta Resources) Together

A JSON resource can use the `_id` property to link to another resource. It's value should be set equal to the path after `/resources` of the URI for the resource being linked to (`/resources/<path...>`). The `_rev` property can be included in the link (OADA APIs will set it equal to the linked to resource's `_rev`) to make it "versioned", which means the parent resource's `_rev` will change when the linked to resource changes. Versioned links allow for efficient tracking of changes to data.

```json
{
    "otherResource": {
      "_id": "abc123"
    },
    "otherResourceSubDocument": {
      "_id": "abc123/a/b"
    },
    "otherResourceVersioned": {
      "_id": "abc123",
      "_rev": "3-KXjfasdfe"
    },
    "otherResourceVersionedSubDocument": {
      "_id": "abc123/a/b",
      "_rev": "1-dkjfKDJSfsd"
    }
}
```

The property `otherResource` and `otherResourceVersioned` both link to `/resources/abc123` and `otherResourceSubDocument` and `otherResourceVersionedSubDocument` both link to the `abc123`'s `/a/b` sub-document, `/resources/abc123/a/b`.

A link to a meta document can be made using the same functionality by replacing `_id` with `_metaId`. 

## Bookmarks

`/bookmarks` is intended to be a simple resource that merely links to other resources of interest, that is, it should not store data itself. It's keys are typically nouns that have contextual meaning to the user/application interacting with it, e.g., `/bookmarks/irrigation/machines/irrigators`. OADA defines some standard bookmarks but users and developers are free to make their own. However, users and developers should be careful to pick names that have a low probability of conflicting with another user's or developer's choice. Bookmarks will be added to the standard list after it has been shown that multiple OADA users and/or developers use it in the same way. For more complete documentation see the OADA [bookmarks documentation][bookmarks-documentation].

## View

***View is not part of OADA v1.0. It will be included in a later version.***

The only query parameter allowed within the OADA API is the `view` parameter. It filters unwanted portions of resources, enables OADA specific metadata, and expands linked resources in-place (thereby reducing the number of requested needed). More details of on the view parameter can be found in the [view documentation][view-docs].

When the view parameter is needed it tends to be very useful but also complex. It is always possible to completely use the OADA API without ever leveraging the view parameter. However, one typically needs a larger number of HTTP requests (often not an issue) and it may be slower and require more bandwidth when only a small portion of a large document is needed.

[json-pointer]: https://tools.ietf.org/rfc/rfc6901.txt
[resource-docs]: https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-API-Endpoints.md#resources
[view-docs]: https://github.com/OADA/oada-docs/blob/master/rest-specs/View-Proposal.md
[bookmarks-documentation]: https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-API-Endpoints.md#bookmarks
