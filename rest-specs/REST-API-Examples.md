# OADA REST API Examples

## Characters
To better convey what each example is accomplishing we describe them with several fictitious characters. You have probably seen them scattered throughout OADA publications, but just in below is a quick reminder of them.

* **Frank**
    * Is a farmer.
    * Stores his data in agcloud.com.
    * Uses a federated identity from agidentity.com.
    * Has an OADA compliant telematics device.
    * Has OADA compliant apps on his Android tablet.
* **Andy**
    * Is a agronomist.
    * Wants to access Frank's data at agcloud.com.

# Examples

* [Federated Login](#federated-login)
* [Resource Upload](#resource-upload)
* [Resource Update](#resource-update)
* [Resource Sharing](#resource-sharing)
* [Field Discovery](#field-discovery)
* [Manual Resource Syncing](#manual-resource-syncing)
* [Automatic Resource Syncing](#automatic-resource-syncing)
* [View Changes](#view-changes)
* [View Changes for a Resource and Its Children](#view-changes-for-a-resource-and-its-children)
* [Copy Resource](#copy-resource)
* [Make Existing Resource a Derivative of Another](#make-existing-resource-a-derivative-of-another)

# Federated Login

![Federated login](federated_login.png "Federated login")

Frank logs into his agcloud.com OADA account with an OADA compliant Android app
using his agidentity.com federated identity.

To begin the process Frank's app discovers the authorization endpoints and
agcloud.com's OADA base URI by querying the well-known oada-configurations URI.

**Request**
```http
GET /.well-known/oada-configuration HTTP/1.1
Host: agcloud.com
Accept: application/json
```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8

{
    "authorizationEndpoint": "http://api.agcloud.com/authorize",
    "tokenEndpoint": "http://api.agcloud.com/token",
    "OADABaseUri": "https://api.agcloud.com"
}
```

The second step is to start the OAuth 2.0 procedure by making an implicit flow
request to the specified `authorizationEndpoint`. Implicit flow is used because
it makes most sense for an Android app. However, other OAuth 2.0 flows could be
used.

**Request**
```http
GET /authorize?response_type=token&client_id=s6BhdRkqt3&state=xyz&redirect_uri=https%3A%2F%2Flocalhost HTTP/1.1
Host: api.agcloud.com
Accept: text/html,application/xhtml+xml,application/xml
```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8

<html>
...
</html>
```

Agcloud.com's response is an HTML web page that challenges Frank to login with
local user credentials or with an OADA federated account.

Frank elects to login with the OADA federated identity `frank@agidentity.com`.
If agidentity.com's OpenId Connect endpoint is unknown to agcloud.com then it
queries `agidentity.com/.well-known/openid-configuration` to discover the
correct URL.

Once the correct URL is known, agcloud.com generates a redirect response to the
OpenID Connect endpoint. This begins the  OpenID Connect flow.

**Response**
```http
HTTP/1.1 302 Found
Location: https://agidentity.com/authorize?response_type=id_token%20token&client_id=s6BhdRkqt3&redirect_uri=https%3A%2F%2Fapi.agcloud.com%2Fcb&scope=openid%20profile&state=af0ifjsldkj&nonce=n-0S6_WzA2Mj HTTP/1.1
```

Therefore, Frank's user-agent makes the redirect request to agidentity.com

**Request**
```http
GET /authorize?response_type=code&client_id=s6bhdrkqt3&redirect_uri=https%3a%2f%2fapi.agcloud.com%2fcb&scope=openid%20profile HTTP/1.1
Host: agidentity.com
Accept: text/html,application/xhtml+xml,application/xml
```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8

<html>
...
</html>
```

agidentity.com's response is also an HTML web page that challenges Frank
to login with his local user credentials (the federated identity).

When Frank successfully logs in and confirms that agcloud.com may access his
profile information, e.g., real name, email, etc.  agidentity.com issues a
redirect response back to agcloud.com.

**Response**
```http
HTTP/1.1 302 Found
Location: https://api.agcloud.com/cb?code=SplxlOBeZQQYbYS6WxSbIA&state=af0ifjsldkj
```

Therefore, Frank's user-agent makes the associated request and so ends the
OpenId Connect flow and resumes the original OAuth 2.0 from the users
perspective.

**Request**
```http
GET /cb?code=SplxlOBeZQQYbYS6WxSbIA&state=af0ifjsldkj HTTP/1.1
Host: api.agcloud.com
Accept: text/html,application/xhtml+xml,application/xml
```

Now agcloud.com communicates with agidentity.com using standard OpenID Connect
protocol to receive an `id_token` that asserts Frank's identity and a document
that contains his profile information.

If the `id_token` is valid then agcloud.com considers the authorization
challenge successfully completed for the identity `frank@agidentity.com` and
generates an OAuth 2.0 token.

As a result Agcloud.com responds with redirect that includes the token generated
token.

**Response**
```http
HTTP/1.1 302 Found
Location: https://localhost#access_token=SlAV32hkKG&token_type=bearer&expires_in=3600&state=af0ifjsldkj
```

Finally, the Android app parses the `access_token` from the Location RUI
fragment and stores it for later use.

# Resource Upload

![Resource upload](resource_upload.png "Resource upload")

Frank's telematics device records yield measurements through the entire day into
a GeoJSON file.  While Frank finishes his work for the day he touches the "sync
to OADA cloud" button.  As a result, Frank's telematics device uploads the
GeoJSON file as a new resource to Frank's agcloud.com.

**Assumptions**

- The telematics device already has authorization and a valid token.

To both create a new resource and upload the associated data simultaneously a
POST request with `Content-Type` equal to  `multipart/form-data` is made. The
JSON resource document is sent with the form-data name `resource` and the data
with form-data name `data`.

**Request**
```http
POST /resources HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: multipart/form-data; boundary=AaB03x
Content-Length: 496

--AaB03x
Content-Disposition: form-data; name="resource"
Content-Type: application/json

{
    "name": "Frank's Yeild"
}

--AaB03x
Content-Disposition: form-data; name="data"
Content-Type: application/vnd.oada.yield+json

{
    "totalYield": {
        "value": 5.6,
        "unit": "bushel"
    },
    "type": "FeatureCollection",
    "bbox": [40.42426718029455, 40.42429718029455, -86.841822197086, -86.841852197086],
    "features": [{
            ....
    }
}
```

**Response**
```http
HTTP/1.1 201 Created
Location: /resources/ixm24ws
Content-Type: application/json
Etag: "9083423jkadfu9382x"

{
    "href": "https://api.agcloud.com/resources/ixm24ws",
    "etag": "alsjfadksja9388x7d",
    "guid": "https://api.agcloud.com/resources/ixm24ws",
    "changeId": "jc4dcx6",
    "name": "Frank's Yield",
    "mimeType": "application/vnd.oada.yield+json",
    "created": "1985-04-12T23:20:50.52Z",
    "createdBy": {
        "href": "https://api.agcloud.com/users/kdufe3f"
    },
    "modified": "1985-04-12T23:20:50.52Z",
    "modifiedBy": {
        "href": "https://api.agcloud.com/users/kdufe3f"
    },
    "data": {
        "href": "https://api.agcloud.com/resources/ixm24ws/data"
    },
    "meta": {
        "href": "https://api.agcloud.com/resources/ixm24ws/meta"
    },
    "formats": {
        "href": "https://api.agcloud.com/resources/ixm24ws/formats"
    },
    "parents": {
        "href": "https://api.agcloud.com/resources/ixm24ws/parents"
    },
    "children": {
        "href": "https://api.agcloud.com/resources/ixm24ws/children"
    },
    "derivatives": {
        "href": "https://api.agcloud.com/resources/ixm24ws/derivatives"
    },
    "permissions": {
        "href": "https://api.agcloud.com/resources/ixm24ws/permissions"
    }
}
```

# Resource Update

![Resource update](resource_update.png "Resource update")

Whenever Frank's tractor is on, his telematics device records the
number of hours it has been running. Periodically, the telematics device updates
a tractor status resource in Frank's agcloud.com with the new total runtime.

**Assumptions**

- The tractor status resource is already known.
- The telematics device already has authorization and a valid token.

For this example assume the following resource already exists:

**Request**
```http
GET /resources/kdj83mx/data HTTP/1.1
Host: api.agcloud.com
Accept: application/json
```

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: application/json
Content-Length: 133
Etag: "686897696a7c876b7e"

{
    "hours": 1523,
    "fuel_level": "80%",
    "service_intervals": {
        "50_hour": -4,
        "100_hour": 46
    }
}
```

Then if the telematics device needs to update the `hours` field to `1524`, then
it should also update the `service_intervals` to `-5` and `46` for `50_hour` and
`100_hour` respectively.

This can be accomplished several ways.

*With PUT:*

**Request**
```http
PUT /resources/kdj83mx/data HTTP/1.1
Host: api.agcloud.com
Content-Type: application/json
Content-Length: 133
If-Match: "686897696a7c876b7e"

{
    "hours": 1524,
    "fuel_level": "80%",
    "service_intervals": {
        "50_hour": -5,
        "100_hour": 45
    }
}
```

Notice the `If-Match` header provides some concurrency protection.

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: application/json
Content-Length: 133
Etag: "893rjdklia9w383984"

{
    "hours": 1524,
    "fuel_level": "80%",
    "service_intervals": {
        "50_hour": -5,
        "100_hour": 45
    }
}

```

*With two separate puts to update each section of the document:*

**Request**
```http
PUT /resources/kdj83mx/data/hours HTTP/1.1
Host: api.agcloud.com
Content-Type: plain/text
Content-Length: 4
If-Match: "686897696a7c876b7e"

1524
```

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: application/json
Content-Length: 133
Etag: "asf9cka3a08345rjj4"

1524
```

**Request**
```http
PUT /resources/kdj83mx/data/service_intervals HTTP/1.1
Host: api.agcloud.com
Content-Type: application/json
Content-Length: 78
If-Match: "asf9cka3a08345rjj4"

{
    "50_hour": -5,
    "100_hour": 45
}
```

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: application/json
Content-Length: 133
Etag: "893rjdklia9w383984"

{
    "50_hour": -5,
    "100_hour": 45
}
```

*With PATCH:*

**Request**
```http
PATCH /resources/kdj83mx/data HTTP/1.1
Host: api.agcloud.com
Content-Type: application/json
Content-Length: 133
If-Match: "686897696a7c876b7e"

{
    "hours": 1524,
    "service_intervals": {
        "50_hour": -5,
        "100_hour": 45
    }
}
```

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: application/json
Content-Length: 133
Etag: "893rjdklia9w383984"

{
    "hours": 1524,
    "fuel_level": "80%",
    "service_intervals": {
        "50_hour": -5,
        "100_hour": 45
    }
}

```

# Resource Sharing

![Resource sharing](resource_sharing.png "Resource sharing")

Frank instructs his OADA complaint Android app to share a resource with Andy.
Now Andy can access it directly with his own account.

**Assumptions**

- Frank's Android app already has authorization and a valid token for Frank's
  user agcloud.com.
- Andy's OADA application already has authorization and a valid token for Andy's
  user at agcloud.com.

To share `/resources/ixm24ws`, the GeoJSON yield resource we made earlier, with Andy as an owner, `userId = jdx83jx` we need to add a new entry to the resource permission document.

**Request**
```http
POST /resources/ixm24ws/permissions HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json
Content-Length: 496

{
    "user": {
        "href": "https://api.agcloud.com/users/jdx83jx"
    },
    "type": "user",
    "level": "owner"
}

```

**Response**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /resources/ixm24ws/permissions/9mxjs7c
Etag: "9083423jkadfu9382x"

{
    "href": "https://api.agcloud.com/resources/ixm24ws/permissions",
    "etag": "9238fasjakdfaf39f7",
    "user": {
        "href": "https://api.agcloud.com/users/jdx83jx"
    },
    "type": "user",
    "level": "owner"
}

```

Now Andy can access the resource with his identity.

**Request**
```http
GET /resources/ixm24ws HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer kaJH38da3x
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: application/json
Etag: "aodskjfoa3j9af7883"

{
    "href": "https://api.agcloud.com/resources/ixm24ws",
    "etag": "alsjfadksja9388x7d",
    "guid": "https://api.agcloud.com/resources/ixm24ws",
    "changeId": "jc4dcx6",
    "name": "Frank's Yield",
    "mimeType": "application/vnd.oada.yield+json",
    "created": "1985-04-12T23:20:50.52Z",
    "createdBy": {
        "href": "https://api.agcloud.com/users/kdufe3f"
    },
    "modified": "1985-04-12T23:20:50.52Z",
    "modifiedBy": {
        "href": "https://api.agcloud.com/users/kdufe3f"
    },
    "data": {
        "href": "https://api.agcloud.com/resources/ixm24ws/data"
    },
    "meta": {
        "href": "https://api.agcloud.com/resources/ixm24ws/meta"
    },
    "formats": {
        "href": "https://api.agcloud.com/resources/ixm24ws/formats"
    },
    "parents": {
        "href": "https://api.agcloud.com/resources/ixm24ws/parents"
    },
    "children": {
        "href": "https://api.agcloud.com/resources/ixm24ws/children"
    },
    "derivatives": {
        "href": "https://api.agcloud.com/resources/ixm24ws/derivatives"
    },
    "permissions": {
        "href": "https://api.agcloud.com/resources/ixm24ws/permissions"
    }
}
```

# Field Discovery

![Field discovery](field_discovery.png "Field discovery")

Frank drives his tractor to a field and starts planting. Instead of asking Frank
what field he is in, the monitor automatically discovers the current
set of fields using the fields configuration on Frank's agcloud.com storage.
However, the resource is in the Shape format but the monitor only understands
GeoJSON. Therefore, the monitor requests a Shape to GeoJSON transformation when
downloading the resource.

**Assumptions**

- Frank's monitor device already has authorization and a valid token.

The fields resource is located via the field configurations.

**Request**
```http
GET /configurations/fields HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: application/json
Etag: "aodskjfoa3j9af7883"

{
    "href": "https://api.agcloud.com/configurations/fields",
    "etag": "jkx6yc3c7cja89434inc8ascfjdkasfjc8i7a37x",
    "items": {},
    "resource": {
        "href": "https://api.agcloud.com/resources/fd8as8c"
    }
}
```

Now that the resource is known the formats document needs to be consulted to
determine if the fields can be returned in an acceptable format, in this case `application/vns.oada.fields+json`.

**Request**
```http
GET /resources/fd8as8c/formats HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: application/json
Etag: "qewriuquicjdkcj832"

{
    "href": "https://api.agcloud.com/resources/fd8as8c/formats",
    "etag": "mnewahfau3&83djcx2",
    "transforms": {
        "application/vnd.oada.field+json": {
            “original”: true,
            "lossy": false,
            "name": "OADA GeoJSON Field Open Format",
            "openFormat": true
        },
        "application/shape": {
            "lossy": false,
            "name": "Esri Shapefile",
            "openFromat": false
        }
    }
}
```

This resource can be transformed into the desired format, so the resource is
downloaded.

**Request**
```http
GET /resources/fd8as8c/data HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Accept: application/vnd.oada.field+json

```

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: application/json
Etag: "qewriuquicjdkcj832"

{
    "type": "GeometeryCollection",
    ...
    "features": [{
            ....
    }
    ...
}
```

# Manual Resource Syncing

![Resource syncing](resource_syncing.png "Resource syncing")

Frank uses his OADA compliant Android app to discover his planting prescription
resource via the prescription configurations. He proceeds to edit the resource
and sync it back to his agcloud.com storage. This same prescription resource was
discovered and downloaded by Frank's monitor.  However, the monitor
periodically checks the adcloud.com storage for changes in the resource and
automatically re-downloads it.

**Assumptions**

- Frank's monitor device already has authorization and a valid token.

It is assumed that both the app and the monitor have successfully discovered and
downloaded the prescription planting resource with the help of
`/configurations/prescriptions/planting` using the techniques previously
described.

The discovered resource is `/resources/ajd82mx` and the original resource Etag
is `k23odjuasidfjasdkf`.

To poll for an update a request with the `If-None-Match` is made periodically.

**Request**
```http
GET /resources/fd8as8c/data HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Accept: application/vnd.oada.prescription.planting+json
If-None-Match: "k23odjuasidfjasdkf"

```

Typically the response will be one of following two

*No changes*

**Response**
```http
HTTP/1.1 304 Not Modified
Content-Type: applcation/json
Etag: "k23odjuasidfjasdkf"

```

*Available changes*

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: applcation/json
Etag: "ajja97823jfaksdhfx"

{
    ...
}
```

# Automatic Resource Syncing

![Resource auto syncing](resource_auto_syncing.png "Resource auto syncing")

Frank wants to store the same resource at two different OADA implementations. Frank also wants these two OADA implementations to keep the copies of the resource synchronized with each other automatically.

**Assumptions**

* Frank uses both openag.io and agcloud.com OADA cloud services.
* The resource being synchronized is known as
  "http://api.agcloud.com/resources/ajd82mx" and
  "http://api.openag.io/resources/xl2nfd0"
* openag.io is capable of receiving push notifications at
  https://api.openag.io/notifications.
* agcloud.com is capable of receiving push notifications at
  https://api.agcloud.com/notifications.

To synchronize the resources, either a push or poll sync must be established between both clouds in both directions.

*"poll" synchronization between both clouds*

**Request - api.agcloud.com**
```http
POST /resources/ajd82mx/syncs HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
    "type": "poll",
    "url": "http://api.openag.io/resources/xl2nfd0",
    "headers": {},
    "interval": 3600,
    "authorization": {
        "href": "https://api.agcloud.com/authorizations/8ackam3"
    }
}
```
**Response**
```http
HTTP/1.1 200 Ok
Location: resources/ajd82mx/syncs/xjf3ft6
Content-Type: application/json
Etag: "zjalkwjc3ldsua43ir"

{
    "href": "https://api.agcloud.com/resources/ajd82mx/syncs/xjf3ft6",
    "etag": "zjalkwjc3ldsua43ir",
    "type": "poll",
    "url": "http://api.openag.io/resources/xl2nfd0",
    "headers": {},
    "lastChangeId": "uc47fcs",
    "interval": 3600,
    "authorization": {
        "href": "https://api.agcloud.com/authorizations/8ackam3"
    }
}
```

**Request - api.openag.io**
```http
POST /resources/xl2nfd0/syncs HTTP/1.1
Host: api.openag.io
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
    "type": "poll",
    "url": "http://api.agcloud.com/resources/ajd82mx",
    "headers": {},
    "interval": 3600,
    "authorization": {
        "href": "https://api.openag.io/authorizations/3dcif83"
    }
}
```

**Response**
```http
HTTP/1.1 200 Ok
Location: /resources/xl2nfd0/syncs/8dkvf4r
Content-Type: application/json
Etag: "kdjvjklasfje498u39"

{
    "href": "https://api.openag.io/resources/xl2nfd0/syncs/8dkvf4r",
    "etag": "kdjvjklasfje498u39",
    "type": "poll",
    "url": "http://api.agcloud.com/resources/ajd82mx",
    "headers": {},
    "lastChangeId": "fur4cxs5",
    "interval": 3600,
    "authorization": {
        "href": "https://api.openag.io/authorizations/3dcif83"
    }
}
```

*"push" synchronization between both clouds*

**Request - api.agcloud.com**
```http
POST /resources/ajd82mx/syncs HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
    "type": "push",
    "url": "http://api.openag.io/notifications",
    "headers": {},
    "events": ["change"],
    "authorization": {
        "href": "https://api.agcloud.com/authorizations/8ackam3"
    }
}
```

**Response**
```http
HTTP/1.1 200 Ok
Location: resources/ajd82mx/syncs/xjf3ft6
Content-Type: application/json
Etag: "zjalkwjc3ldsua43ir"

{
    "href": "https://api.agcloud.com/resources/ajd82mx/syncs/xjf3ft6",
    "etag": "zjalkwjc3ldsua43ir",
    "type": "push",
    "url": "http://api.openag.io/notifications",
    "headers": {},
    "events": ["change"],
    "authorization": {
        "href": "https://api.agcloud.com/authorizations/8ackam3"
    }
}
```

**Request - api.openag.io**
```http
POST /resources/xl2nfd0/syncs HTTP/1.1
Host: api.openag.io
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
    "type": "push",
    "url": "http://api.agcloud.com/notifications",
    "headers": {},
    "events": ["changed"],
    "authorization": {
        "href": "https://api.openag.io/authorizations/3dcif83"
    }
}
```

**Response**
```http
HTTP/1.1 200 Ok
Location: /resources/xl2nfd0/syncs/8dkvf4r
Content-Type: application/json
Etag: "kdjvjklasfje498u39"

{
    "href": "https://api.openag.io/resources/xl2nfd0/syncs/8dkvf4r",
    "etag": "kdjvjklasfje498u39",
    "type": "push",
    "url": "http://api.agcloud.com/notifications",
    "headers": {},
    "events": ["changed"],
    "authorization": {
        "href": "https://api.openag.io/authorizations/3dcif83"
    }
}
```

*One push and one poll*

It is also possible to establish the synchronization as type poll in one direction and type push in the other. The documents for each sync type are the same as the above examples.

# View Changes

Frank's file syncing application wants to discover all of the resources that have changed since the last time it checked. The last time Frank's app checked it had processed all changes up to and including the change id  `xje4dfg`.

**Request**
```http
GET /changes?lastChangeId=xje4dfg&_expand=1 HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "href": "https://api.agcloud.com/changes?lastChangeId=xje4dfg",
    "etag": "jxw39cxuca9wu3asd9",
    "items": [{
        "href": "https://api.agcloud.com/changes/vda33d4",
        "etag": "xkjaf8wcadskjcaw3e",
        "changeId": "vda33d4",
        "deleted": "false",
        "resource": {
            "href": "https://api.agcloud.com/resources/dxkf337"
        }
    },
    {
        "href": "https://api.agcloud.com/changes/jft567d",
        "etag": "jcnjasdhfweuhfc737",
        "changeId": "jft567d",
        "deleted": "true",
        "resource": {
            "href": "https://api.agcloud.com/resources/dxkf337"
        }
    }]
}
```

# View Changes for a Resource and Its Children

Frank's application wants to discover all changes that occurred to either the given resource or any resource in its tree of children. The last time Frank's app checked it had processed all changes up to and including the change id  `cmf4df6`.

**Request**
```http
GET /resources/ixm24ws/changes?lastChangeId=cmf4df6 HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "href": "https://api.agcloud.com/changes?lastChangeId=xje4dfg",
    "etag": "jxw39cxuca9wu3asd9",
    "items": [{
        "href": "https://api.agcloud.com/changes/jc4dcx6"
    },
    {
        "href": "https://api.agcloud.com/changs/xj3jdc5"
    }]
}
```

# Copy Resource

Frank wants to make copy of by a GeoJSON OADA yield resource but in shape format.

This is accomplished by creating a new derivatives entry (POST) in the originating resource.

**Request**
```http
POST /resources/ixm24ws/derivatives?_expand=1 HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json
Content-Length: 129

{
    "contentType": "application/shape",
    "parents": [{
        "href": "https://api.agcloud.com/resource/jd983dc"
    }]
}
```

**Response**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /resources/ixm24ws/derivatives/jed82ar

{
    "contentType": "application/shape",
    "resource": {
        "href": "https://api.agcloud.com/resources/x82d7cs",
        "etag": "axlskdjc9au37cicua",
        "guid": "https://api.agcloud.com/resources/x82d7cs",
        "changeId": "jc4dcx6",
        "name": "Frank's Yield",
        "mimeType": "application/shape",
        "created": "1985-04-13T03:20:50.52Z",
        "createdBy": {
            "href": "https://api.agcloud.com/users/kdufe3f"
        },
        "modified": "1985-04-13T03:20:50.52Z",
        "modifiedBy": {
            "href": "https://api.agcloud.com/users/kdufe3f"
        },
        "data": {
            "href": "https://api.agcloud.com/resources/x82d7cs/data"
        },
        "meta": {
            "href": "https://api.agcloud.com/resources/x82d7cs/meta"
        },
        "formats": {
            "href": "https://api.agcloud.com/resources/x82d7cs/formats"
        },
        "parents": {
            "href": "https://api.agcloud.com/resources/x82d7cs/parents"
        },
        "children": {
            "href": "https://api.agcloud.com/resources/x82d7cs/children"
        },
        "derivatives": {
            "href": "https://api.agcloud.com/resources/x82d7cs/derivatives"
        },
        "permissions": {
            "href": "https://api.agcloud.com/resources/x82d7cs/permissions"
        }
    }
}
```

# Make Existing Resource a Derivative of Another

Frank modified a shape based yield map already existing in his OADA cloud using a non-OADA compliant application. After uploading the result as a new resource he wants to make it a derivative of the original.

This is accomplished by adding a derivatives entry (PUT) to the originating resource.

**Request**
```http
POST /resources/ixm24ws/derivatives HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json
Content-Length: 143

{
    "resource": {
        "href": "https://api.agcloud.com/resource/fx3dfa3"
    }
}
```

**Response**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /resources/ixm24ws/derivatives/xjd83jf
Etag: "ckjlwj387fcakdfjk3"

{
    "contentType": "application/shape",
    "resource": {
        "href": "https://api.agcloud.com/resource/fx3dfa3"
    }
}
```
