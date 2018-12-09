# Websockets

Standard HTTP methods can be preformed over a websocket connection. The supported
methods are `HEAD`, `GET`, `PUT`, `POST`, `DELETE`. An additional method `WATCH`
can be used to watch for changes on a resource.

Every websocket request is a `JSON` encoded object containing keys `requestId`,
`method`, `path`, and optionally `data`, `authorization`, and `contentType`.

### Required Parameters:

`requestId`: A string send with every request, returned by the server in every
  corresponding response. It is used to identify what request the server is
  responding to.

`method`: Specifies which HTTP method the server should preform.

`path`: The path of the resource to preform the method on.

### Optional Parameters:

`data`: Data for `POST`/`PUT` methods.

`headers`: An object containing any headers that would have been sent with 
a regular HTTP request.

## Example GET request:

#### Request:
```json
{
    "requestId": "abc123",
    "method": "GET",
    "path": "/bookmarks",
    "headers": {
      "authorization": "Bearer aaa"
    }
}
```
#### Response:
```json
{
    "requestId": "abc123",
    "status": 200,
    "data": {
        "_id": "resources/default:resources_bookmarks_123",
        "_rev": "1-abc",
        "_type": "application/vnd.oada.bookmarks.1+json",
        "_meta": {
            "_id": "resources/default:resources_bookmarks_123/_meta",
            "_rev": "1-abc"
        }
    },
    "foo": {
        "bar": "baz"
    }
}
```

### `WATCH` Method:
The `WATCH` method can be used to watch a resource for changes. All changes documents to
that resource will be sent back to the client with the provided `requestId` from
the request.  

If you include the `x-oada-rev` header in the watch request set to a particular
rev (for example, the last rev you've seen), the change documents since that
rev will begin to stream in out in order as if those changes had just been
made.  In this way, you can have a cache that is offline for some time,
and when it starts back up it is very easy for it to catch up.

Also note that in a graph of versioned links, a parent will receive a change
document that includes the actual change to the children all the way down to
the originating changes, eliminating the need to manually go get changes
on children when the parent changes.

## Errors:
An error response will be returned as a JSON object with `requestId`, `status`,
and `data` keys. The `data` key will contain a standard error as described in
[OADA Standard Error Response](Standard-Error.md).
