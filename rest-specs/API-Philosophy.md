# OADA API Philosophy

The OADA API follows a few basic philosophies that allow it to remain general and easily mapped to existing APIs:

1. Everything is a resource and has a unique canonical endpoint (`/resources/<resourceId>`)
2. Every resource (regardless of its data type) has a JSON meta resource (`/meta/<resourceId>`) that follows the same rules as plain old resources [*Note*: in fact, we recommend that implementations just URL rewrite `/meta` to `/resources`].
3. Bookmarks are resources that follow the same rules as plain old resources [*Note*: in fact, we recommend that implementations just URL rewrite `/bookmarks` to `/resources`]. The properties should be nouns rather than verbs and are used to discover resources of interest (`/bookmarks/pets/fido`).

## Resources

There are no limitations on what a resource may or may not be. They can be binary blobs, XML, CSV, etc. OADA has a slight preference for JSON-based formats, however, they are not required. The affinity to JSON is due less to its suitability as a file format than it is for its ease of mapping to URLs. That is, a JSON document's sub-document is directly accessible by appending the path of keys to the sub-document onto the end of that resource's URL ([RFC 6901 JSON Pointer][json-pointer] defines how this mapping works, and it is likely that future versions of OADA will support a similar mapping for other formats, such as XML). For example:

Assuming the JSON resource at `/resources/jikdf` is:

```json
{
  "_id": "jikdf",
  "_rev": "1-5dfj02",
  "_meta": {
    "_metaId": "jikdf",
    "_rev": "1-adfad",
  },

   "a": {
      "b": {
         "c": 123
      },
   "d": "efg"
}
```

Then a request for the sub-document under the `b` key can be made by adding `/a/b` to the end of the URL path. For example: 

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

A JSON resource can use the `_id` property to link to another resource. Its value should be set equal to part of the URL after `/resources` (i.e. `/resources/123` has an `_id` of `123`, and `/resources/123/a` has an `_id` of `123/a`). 

If you want the `_rev` property of a resource to update when another resource is changed, the `_rev` property can be included in the link.   OADA-conformant APIs will set it equal to the linked to resource's `_rev`.  This style of link containing `_rev` is called a _versioned link_, which means the parent resource's `_rev` will eventually change when the linked resource changes. Versioned links allow for efficient tracking of changes to data as a graph built naturally from the underlying data structure..

```json
{
    "otherResource": {
      "_id": "abc123"
    },
    "otherResourceVersioned": {
      "_id": "abc123",
      "_rev": "1-dkjfKDJSfsd"
    },

    "otherResourceSubDocument": {
      "_id": "abc123/a/b"
    },
    "otherResourceVersionedSubDocument": {
      "_id": "abc123/a/b",
      "_rev": "1-dkjfKDJSfsd"
    }
}
```

In the example above, the property `otherResource` and `otherResourceVersioned` both link to `/resources/abc123` and `otherResourceSubDocument` and `otherResourceVersionedSubDocument` both link to the `abc123`'s `/a/b` sub-document, `/resources/abc123/a/b`.  When resource `abc123` changes, the _rev in both versioned links here will eventually change to match the new `_rev` of resource `abc123`.

A link to a meta document can be made using the same functionality by replacing `_id` with `_metaid`. 

## Bookmarks

`/bookmarks` is intended to be a simple resource that merely links to other resources of interest: it should not store data itself. It's keys are typically nouns that have contextual meaning to the user/application interacting with it, e.g., `/bookmarks/irrigation/machines`. OADA defines some standard bookmarks but users and developers are free to make their own. However, users and developers should be careful to pick names that have a low probability of conflicting with another user's or developer's choice.  

The media type of /bookmarks defines the particular ontology that is represented by the underlying bookmarks document.  OADA has defined an ontology with media type `application/vnd.oada.bookmarks.1+json`.  This ontology will be duck-typed (i.e. no keys are required to be present, but if a particular key is present then its definition is defined by the media type standard).  Bookmarks will be added to the standard list based on merit proven by showing that multiple OADA users and/or developers use it in the same way. For more complete documentation see the OADA [bookmarks documentation][bookmarks-documentation].

## View

***View is not part of OADA v1.0. It will be included in a later version.***

Currently, the only query parameter defined within the OADA API is the `view` parameter. It filters unwanted portions of resources, enables OADA specific metadata, and expands linked resources in-place (thereby reducing the number of requested needed). More details of on the view parameter can be found in the [view documentation][view-docs].

Since the view parameter only removes portions of existing responses, or expands links in-place, It is always possible to completely use the OADA API without ever leveraging the view parameter. However, one typically needs a larger number of HTTP requests (often not an issue) and it may be slower and require more bandwidth when only a small portion of a large document is needed.

[json-pointer]: https://tools.ietf.org/rfc/rfc6901.txt
[resource-docs]: https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-API-Endpoints.md#resources
[view-docs]: https://github.com/OADA/oada-docs/blob/master/rest-specs/View-Proposal.md
[bookmarks-documentation]: https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-API-Endpoints.md#bookmarks
