# OADA REST API Examples

## Characters
To better convey what each example is accomplishing we describe them with
several fictitious characters. You have probably seen them scattered throughout
OADA publications, but just in below is a quick reminder of them.

* **Frank**
    * Is a farmer.
    * Stores his data in agcloud.com.
    * Uses a federated identity from farmeridentity.com.
    * Has an OADA compliant telematics device.
    * Has OADA compliant apps on his Android tablet.
* **Andy**
    * Is a agronomist.
    * Wants to access Frank's data at agcloud.com in order to advise Frank.
    * Uses a federated identity from agronomistidentity.com

# Examples

* [JSON Resource Upload](#json-resource-upload)
* [Binary Resource Upload](#binary-resource-upload)
* [Resource Update](#resource-update)
* [Field Discovery](#field-discovery)
* [Manual Resource Syncing](#manual-resource-syncing)

*Draft: Version 1.0.0+*
* [Automatic Resource Syncing (Draft)](#automatic-resource-syncing-draft)
* [Resource Sharing (Draft)](#resource-sharing-draft)
* [View Changes (Draft)](#view-changes-draft)
* [View Changes for a Resource and Its Children (Draft)](#view-changes-for-a-resource-and-its-children-draft)
* [More View Examples (Draft)](#more-view-examples-draft)
* [Copy Resource (Draft)](#copy-resource-draft)
* [Make Existing Resource a Derivative of Another (Draft)](#make-existing-resource-a-derivative-of-another-draft)

# JSON Resource Upload

![Resource upload](resource_upload.png "Resource upload")

Frank's telematics device records yield measurements throughout an entire day as
a GeoJSON file. Just before Frank finishes his work for the day he touches the
"sync to OADA cloud" button.  As a result, Frank's telematics device uploads the
entire GeoJSON file as a new resource to Frank's agcloud.com.

**Assumptions**

* The telematics device already has authorization and a valid token
  (SlAV32hkKG).

**Request**
```http
POST /resources HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/vnd.oada.yield+json

{
  "totalYield": {
    "value": 5.6,
    "unit": "bushel"
  },
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [125.6, 10.1]
  },
  "properties": {
    "name": "Dinagat Islands"
  }
}
```

**Response**
```http
HTTP/1.1 201 Created
Location: /resources/ixm24ws
Content-Type: application/vnd.oada.yield+json
Etag: "9083423jkadfu9382x"

```

# Binary Resource Upload

![Resource upload](resource_upload.png "Resource upload")

Frank's telematics device records yield measurements throughout the entire day
as a shape file. Just before Frank finishes his work for the day he touches the
"sync to OADA cloud" button.  As a result, Frank's telematics device uploads the
entire shape file as a new resource to Frank's agcloud.com.

**Assumptions**

- The telematics device already has authorization and a valid token
  (SlAV32hkKG).

To set the new resource's metadata and upload the associated data
simultaneously a POST request with the header `Content-Type:
multipart/form-data` is made. The JSON metadata document is sent with the
form-data named `metadata` and the data with form-data named `data`.

**Request**
```http
POST /resources HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: multipart/form-data; boundary=AaB03x

--AaB03x
Content-Disposition: form-data; name="metadata"
Content-Type: application/vnd.oada.metadata+json

{
  "_meta": {
    "name": "Frank's Yield"
  }
}

--AaB03x
Content-Disposition: form-data; name="data"
Content-Type: application/shape

...binary data...
```

**Response**
```http
HTTP/1.1 201 Created
Location: /resources/Kcdi32S
Content-Type: application/shape
Etag: "xjksd8f3fp89d8dx8z"

```

# Resource Update

![Resource update](resource_update.png "Resource update")

Whenever Frank's tractor is on, his telematics device records the number of
hours it has been running. Periodically, the telematics device updates a tractor
status resource in Frank's agcloud.com with the new total runtime.

**Assumptions**

- The tractor status resource already exists (Resource ID: kdj83mx).
- The telematics device already has authorization and a valid token
  (SlAV32hkKG).

**Request**
```http
GET /resources/kdj83mx HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.oada.machines.status.v1+json
Etag: "686897696a7c876b7e"

{
  "_id": "kdj83mx",
  "_rev": "2-jxkjadhd",
  "_meta": {
    "_metaid": "kdj83mx",
    "_rev": "1-xkaj8fd"
  },
  "hours": 1523,
  "fuel_level": "80%",
  "service_intervals": {
    "50_hour": -4,
    "100_hour": 46
  }
}
```

The telematics device wants to update the `hours` field to `1524`. It will also
update the `service_intervals` to `-5` and `46` for `50_hour` and `100_hour`
respectively.

This can be accomplished several ways.

## With PUT

**Request**
```http
PUT /resources/kdj83mx HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
  "hours": 1524,
  "fuel_level": "80%",
  "service_intervals": {
    "50_hour": -5,
    "100_hour": 45
  }
}
```

**Response**
```http
HTTP/1.1 200 OK
Etag: "893rjdklia9w383984"

```

Notice however, that if the resource changed between the client completing the
read and issuing the write then some data may be lost. As a result, it is often
better to change the resource as far down the object as possible. For example,
we could achieve the same updates with less chance of data loss by issuing two
PUT requests.

## With two separate puts to update each section of the document independently

**Request**
```http
PUT /resources/kdj83mx/hours HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

1524
```

**Response**
```http
HTTP/1.1 200 OK
Etag: "asf9cka3a08345rjj4"

```

**Request**
```http
PUT /resources/kdj83mx/service_intervals HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
  "50_hour": -5,
  "100_hour": 45
}
```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Etag: "893rjdklia9w383984"

```

In either case, assuming no lost data, the end result is:

**Request**
```http
GET /resources/kdj83mx HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.oada.machines.status.v1+json
Etag: "686897696a7c876b7e"

{
  "_id": "kdj83mx",
  "_rev": "4-kxjakdu3",
  "_meta": {
    "_metaid": "kdj83mx",
    "_rev": "1-xkaj8fd"
  },
  "hours": 1524,
  "fuel_level": "80%",
  "service_intervals": {
    "50_hour": -5,
    "100_hour": 44
  }
}
```


# Field Discovery

![Field discovery](field_discovery.png "Field discovery")

Frank drives his tractor to a field and starts planting. Instead of asking Frank
what field he is in, the monitor automatically discovers the current set of
fields using the fields bookmark on Frank's agcloud.com storage.

**Assumptions**

- Frank's monitor device already has authorization and a valid token
  (SlAV32hkKG).

The fields resource is located via the `fields` bookmark.  For the sake of an 
expressive example, we will assume that the monitor would first like to discover
if Frank's cloud contains his field boundaries at all, and if they are in a format
that the monitor can consume.

The first step is to request /bookmarks to see if there is a fields key in it:

**Request**
```http
GET /bookmarks HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.oada.bookmarks.1+json
Etag: "aodskjfoa3j9af7883"

{
  "_id": "fd8as8c",
  "_rev": "34-kjxfdu73",
  "_meta": {
    "_metaid": "fd8as8c",
    "_rev": "54-kdf20is",
  },
  "fields": { "_id": "9ekj2", "_rev": "3-kdjf02i" }
}
```

Whew, there's a fields resource there.  Now let's go check it's mediaType.  
This could be done many ways: via an HTTP HEAD request, just getting the resource
and looking at the content-type header, or via it's _meta/_mediaType key.  For
this example, we'll use the _meta/_mediaType method:

**Request**
```http
GET /resources/fd8as8c/_meta/_mediaType HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Etag: "qewriuquicjdkcj832"

"application/vnd.oada.fields.1+json"
```

Hooray!  The monitor knows how to read `application/vnd.oada.fields.1+json` resources.
So, let's go get it (note we can use the link-following properties of OADA URL's to
request it directly from /bookmarks):

**Request**
```http
GET /bookmarks/fields HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Accept: application/vnd.oada.field+json
```

**Response**
```http
HTTP/1.1 200 Ok
Content-Type: application/vnd.oada.fields.1+json
Etag: "qewriuquicjdkcj832"

{
  "_id": "fd8as8c",
  "_rev": "34-kjxfdu73",
  "_meta": {
    "_metaid": "fd8as8c",
    "_rev": "3-xkjadfjx", 
  }
  "list": {
    "grower-farm-field": {
      "name": "grower-farm-field",
      "growers": {
        "02kjdf": { "_id": "0kdfj2", "_rev": "4-kfhj02" }
      },
    }
  }
}
```

# Manual Resource Syncing

![Resource syncing](resource_syncing.png "Resource syncing")

Frank uses an OADA conformant Android app to discover his planting prescription
resource via the prescription bookmark. He proceeds to edit it and sync it back
to agcloud.com. This same prescription resource was previously discovered and
downloaded by Frank's monitor.  However, to stay synchronized the monitor
periodically checks the agcloud.com for changes to the resource by polling the 
resource's `_rev` value.

**Assumptions**

- Frank's monitor device already has authorization and a valid token
  (SlAV32hkKG).
- The monitor has previously downloaded the 'machine_1' document (resource
  `ajd82ms`) with a `_rev` of `4-k23odkf`.

The monitor periodically checks the resource's `_rev` value by issuing the
following efficient HTTP request:

**Request**
```http
GET /bookmarks/planting/prescriptions/_rev HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Location: /resources/ajd82mx
Etag: "ajja97823jfaksdhfx"

6-jkxjaxf
```

And because the `_rev` for the resource (`ajd92mx`) has changed, the monitor
should make a follow up request to get the changed resource. *Note: The monitor can
issue a GET on /resources/ajd92mx or a GET to
/bookmarks/planting/prescriptions*

*Draft: Version 1.0.0+*

# Automatic Resource Syncing (Draft)

![Resource auto syncing](resource_auto_syncing.png "Resource auto syncing")

Frank stores the same resource in two different OADA implementations. Frank
wants the two copies to stay synchronized with each other automatically.

**Assumptions**

* Frank uses both openag.io and agcloud.com OADA cloud services.
* The resources being synchronized are known as
  `http://api.agcloud.com/resources/ajd82mx` and
  `http://api.openag.io/resources/xl2nfd0`
* openag.io is capable of receiving push notifications at
  https://api.openag.io/notifications.
* agcloud.com is capable of receiving push notifications at
  https://api.agcloud.com/notifications.

Synchronization of the resources is accomplished by establishing either a push
or poll sync between both clouds, in both directions.

*"poll" synchronization between both clouds*

**Request - api.agcloud.com**
```http
POST /resources/ajd82mx/_meta/syncs HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
  "type": "poll",
  "url": "http://api.openag.io/resources/xl2nfd0",
  "headers": {},
  "interval": 3600,
  "authorization": {
    "_id": "8ackam3"
  }
}
```

**Response**
```http
HTTP/1.1 200 OK
Location: resources/ajd82mx/_meta/syncs/xjf3ft6
Content-Type: application/json
Etag: "zjalkwjc3ldsua43ir"

{
  "type": "poll",
  "url": "http://api.openag.io/resources/xl2nfd0",
  "headers": {},
  "lastChangeId": "uc47fcs",
  "interval": 3600,
  "authorization": {
    "_id": "8ackam3"
  }
}
```

**Request - api.openag.io**
```http
POST /resources/xl2nfd0/_meta/syncs HTTP/1.1
Host: api.openag.io
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
  "type": "poll",
  "url": "http://api.agcloud.com/resources/ajd82mx",
  "headers": {},
  "interval": 3600,
  "authorization": {
    "_id": "3dcif83"
  }
}
```

**Response**
```http
HTTP/1.1 200 OK
Location: /resources/xl2nfd0/_meta/syncs/8dkvf4r
Content-Type: application/json
Etag: "kdjvjklasfje498u39"

{
  "type": "poll",
  "url": "http://api.agcloud.com/resources/ajd82mx",
  "headers": {},
  "lastChangeId": "fur4cxs5",
  "interval": 3600,
  "authorization": {
    "_id": "3dcif83"
  }
}
```

*"push" synchronization between both clouds*

**Request - api.agcloud.com**
```http
POST /resources/ajd82mx/_meta/syncs HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
  "type": "push",
  "url": "http://api.openag.io/notifications",
  "headers": {},
  "events": ["change"],
  "authorization": {
    "_id": "8ackam3"
  }
}
```

**Response**
```http
HTTP/1.1 200 OK
Location: resources/ajd82mx/_meta/syncs/xjf3ft6
Content-Type: application/json
Etag: "zjalkwjc3ldsua43ir"

{
  "type": "push",
  "url": "http://api.openag.io/notifications",
  "headers": {},
  "events": ["change"],
  "authorization": {
    "_id": "8ackam3"
  }
}
```

**Request - api.openag.io**
```http
POST /resources/xl2nfd0/_meta/syncs HTTP/1.1
Host: api.openag.io
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
  "type": "push",
  "url": "http://api.agcloud.com/notifications",
  "headers": {},
  "events": ["changed"],
  "authorization": {
    "_id": "3dcif83"
  }
}
```

**Response**
```http
HTTP/1.1 200 OK
Location: /resources/xl2nfd0/_meta/syncs/8dkvf4r
Content-Type: application/json
Etag: "kdjvjklasfje498u39"

{
  "type": "push",
  "url": "http://api.agcloud.com/notifications",
  "headers": {},
  "events": ["changed"],
  "authorization": {
    "_id": "3dcif83"
  }
}
```

*One push and one poll*

It is possible to establish the synchronization by conducting polls in one
direction and pushes in the other. The documents for each sync type are the same
as the above examples.

# View Changes (Draft)

Frank's file syncing application wants to discover all resources that have
changed since the last time it checked. The last time Frank's app checked it had
processed all changes up to and including the change id `6`.

*Decoded GET URI: /resources?view={"$each._meta.changeId":{"$gt":6}}*

**Request**
```http
GET /resources/%7B%22%24each._meta.changeId%22%3A%7B%22%24gt%22%3A6%7D%7D HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "jc4dcx6": {
    "_id": "jc4dcx6"
  },
  "xj3jdc5": {
    "_id": "xj3jdc5"
  }
}
```

# Resource Sharing (Draft)

![Resource sharing](resource_sharing.png "Resource sharing")

Frank instructs his OADA complaint Android app to share a resource with Andy.
Now Andy can access it directly with his own account.

**Assumptions**

- Frank's Android app already has authorization and a valid token for Frank's
  agcloud.com user (SlAV32hkKG).
- Andy's OADA application already has authorization and a valid token for Andy's
  agcloud.com user (kaJH38da3x).

To share `/resources/ixm24ws`, the GeoJSON yield resource created earlier, with
Andy as an owner, `userId = jdx83jx`, a new entry to the resource's permission
document must be added.

**Request**
```http
POST /resources/ixm24ws/_meta/permissions HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
  "user": {
    "_id": "jdx83jx"
  },
  "type": "user",
  "level": "owner"
}
```

**Response**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /resources/ixm24ws/_meta/permissions/9mxjs7c
Etag: "xJDS9fd8f2838fxay4"

{
  "user": {
    "_id": "jdx83jx"
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
HTTP/1.1 200 OK
Content-Type: application/json
Etag: "aodskjfoa3j9af7883"

{
  "totalYield": {
    "value": 5.6,
    "unit": "bushel"
  },
  "type": "FeatureCollection",
  "bbox": [40.42426718029455, 40.42429718029455, -86.841822197086, -86.841852197086],
  "features": [{
      "....": "...."
  }]
}
```

# View Changes for a Resource and Its Children (Draft)

Frank's application wants to discover all changes that occurred to either the
given resource or any resource in its tree of children.

**Assumptions**

* Suppose Frank has a field resource reprented by the JSON below: 

```json
{
  "name": "Smith30",
  "acres": 30.3,
  "boundary": { <geojson-of-boundary-polygons> }
}
```

* Change ID `15` was the last changeId that Frank's app processed for the given 
resource but Andy just edited Smith30's field boundary. Franks's app needs to
poll the resource to see if it has changed.

*Decoded GET URI: /resources/ixm24ws?view={"_meta.changeId":{"$gt":15}}*

**Request**
```http
GET /resources/ixm24ws?view=%7B%22_meta.changeId%22%3A%7B%22%24gt%22%3A15%7D%7D HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG

```

**Response before changes**
```http
HTTP/1.1 200 OK
Content-Type: application/json

```

**Response after changes**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "name": "Smith30",
  "acres": 33.8,
  "boundary": { <geojson-of-boundary-polygons> }
}
```

# More View Examples (Draft)

More examples of the view parameter can be found in the 
[View Proposal](View-Proposal.md#examples).

# Copy Resource (Draft)

Frank wants to make copy of a GeoJSON OADA yield resource but as a shape file.

This is accomplished by creating a new derivatives entry in the originating
resource.

**Request**
```http
POST /resources/ixm24ws/_meta/derivatives HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
  "contentType": "application/shape",
  "parents": [{
    "_id": "jd983dc"
  }]
}
```

**Response**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /resources/ixm24ws/_meta/derivatives/jed82ar

{
  "contentType": "application/shape",
  "parents": [{
    "_id": "jd983dc"
  }]
}
```

# Make Existing Resource a Derivative of Another (Draft)

Frank modified a shape file yield map resource using a non-OADA compliant
application. After uploading the result as a new resource he wants to make it a
derivative of the original.

This is accomplished by adding a derivatives entry to the originating resource.

**Request**
```http
POST /resources/ixm24ws/_meta/derivatives HTTP/1.1
Host: api.agcloud.com
Authentication: Bearer SlAV32hkKG
Content-Type: application/json

{
  "resource": {
    "_id": "fx3dfa3"
  }
}
```

**Response**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /resources/ixm24ws/_meta/derivatives/xjd83jf
Etag: "ckjlwj387fcakdfjk3"

{
  "contentType": "application/shape",
  "resource": {
    "_id": "fx3dfa3"
  }
}
```

