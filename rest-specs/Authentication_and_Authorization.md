# Authentication and Authorization

OADA uses OAuth 2.0 for API Authentication and Authorization and OpenID Connect
for federated user identity authentication. There are a few minor extensions
required by OADA to support the distributed nature of the OADA federation.

## What should I support?

That depends on your desired role within the OADA ecosystem. In general, there
are three major role categories: **OADA Client**, **OADA Provider**, **OADA
Identity Provider**. Any particular OADA implementation may fit into one or more
of these roles simultaneously. The following table indicates whether or not the
client or server portions of the OAuth 2.0 and/or OpenId Connect specifications
(plus distributed federation extensions) are necessary for each role. If a
particular implementation fits in more than one role then it should support the
union of each applicable role.

|  Role                  |  OAuth 2.0 | OpenID Connect                       |
| ------------------     | ---------- | ------------------------------------ |
| OADA Client            | Client     | Client (Optional: "Login with OADA") |
| OADA Provider          | Server     | Client (OADA User Federated Login)   |
| OADA Identity Provider | -          | Server                               |

The above requirements are described in more detail below by using examples of
typically OADA operations. The OAuth 2.0 and OpenID Connect specifications
should be directly consulted for the details of their operation.

## Distributed Federation Extensions

The inherent distributed nature of OADA means that client and providers and will
often meet for the first when a joint customer tries to point them together.
Therefore, OADA has methods for both clients and providers to automatically
discover each other. Below is a short description of those features.

### `/.well-known/oada-configuration`

`/.well-known/oada-configuration` is an HTTP resource in which clients use to
automatically discover the necessary endpoints of a new OADA provider. This
resource is located in a predictable path after the provider's domain and
therefore the only burden on the joint user is to know the base domain. For
example, a user should only have to enter `agcloud.com` as their provider rather
then the various endpoints, such as: `agcloud.com/oada/oauth2/auth`,
`agcloud.com/oada/oauth2/token`, etc.

More details of this endpoint can be found in the [/.well-known endpoint documentation][well-known-endpoint-docs].

### Client Discovery

Client discovery is used by providers to automatically discover the details of
the client. This allows a user to point their favorite client to their favorite
provider without the client having had to register with the provider beforehand.

More details of thie endpoint can be found in the [clientDiscovery endpoint
documentation][client-discovery-endpoint-docs]

### Client Secret

## Retrieving an OAuth 2.0 Access Token (Implicit Flow)


1. The client retrieves the cloud provider's 'oada-configuration' document to
discover the OAuth 2.0 endpoints.

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
  "authorization_endpoint": "https://auth.agcloud.com/authorize",
  "token_endpoint": "https://auth.agcloud.com/token",
  "OADABaseUri": "https://api.agcloud.com/",
  "clientDiscovery": "https://auth.agcloud.com/client"
}
```

2. The client initiates an OAuth 2.0 token (Implicit flow) or code
(Authorization flow) request.

* Implicit flow:

**Request**
```http
GET /authorize?response_type=token&client_id=s6BhdRkqt3&state=xyz&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb HTTP/1.1
Host: agcloud.com
```

* Authorization flow:

**Request**
```http
GET authorize?response_type=code&client_id=s6BhdRkqt3&state=xyz&redirect_uri=https%3A%2F%2Fagcloud%2Ecom%2Fcb HTTP/1.1
Host: agcloud.com
```

3. AgCloud challenges the user to login or uses a current and valid session to
identify the user. AgCloud may initiate an OpenID Connect flow if the end
user chooses to login with an OADA federated identity.

* Implicit flow - Upon login success, the user agent is redirected to
'redirect_uri' with the token embedded directly in the URI fragment:

**Response**
```http
HTTP/1.1 302 Found
Location: http://agcloud.com/cb#access_token=2YotnFZFEjr1zCsicMWpAA&state=xyz&token_type=example&expires_in=3600
```

* Authorization flow - Upon login success, the user agent is redirected to
`redirect_uri` with a authorization code.

**Response**
```http
HTTP/1.1 302 Found
Location: https://agcloud.com/cb?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz
```

4. (*Authorization flow only*) The client trades the authorization code for a
token at the token endpoint:

**Request**
```http
POST /token HTTP/1.1
Host: agcloud.com
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA&redirect_uri=https%3A%2F%2Fagcloud%2Ecom%2Fcb
```
**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token":"2YotnFZFEjr1zCsicMWpAA",
  "token_type":"example",
  "expires_in":3600,
  "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
  "example_parameter":"example_value"
}
```

[well-known-endpoint-docs]: https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-Discovery-Endpoints.md#well-knownoada-configuration
[client-discovery-endpoint-docs]:  https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-Discovery-Endpoints.md#clientdiscovery
