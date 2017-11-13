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

`authorization`: The HTTP `Authorization` header.

`contentType`: The HTTP `Content-Type` header.

## Example GET request:

####Request:
```json
{
    "requestId": "abc123",
    "method": "GET",
    "path": "/bookmarks"
}
```
####Response:
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

###watch
The `WATCH` method can be used to watch a resource for changes. All changes to
that resource will be sent back to the client with the provided `requestId` from
the request.
