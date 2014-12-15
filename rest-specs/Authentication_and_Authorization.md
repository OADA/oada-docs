# Table of Contents

- [Authentication and Authorization](#authentication-and-authorization)
  - [What should I support?](#what-should-i-support)
- [Distributed Federation Extensions](#distributed-federation-extensions)
    - [`/.well-known/oada-configuration`](#well-knownoada-configuration)
    - [Client Discovery](#client-discovery)
    - [Client Secret](#client-secret)
      - [Requirements on the JWT](#requirements-on-the-jwt)
      - [Example Client Secret](#example-client-secret)
    - [Grant Screen](#grant-screen)
      - [Example Grant Screen with Licenses and PUC](#example-grant-screen-with-licenses-and-puc)
      - [Example Grant Screen without PUC](#example-grant-screen-without-puc)
      - [Example Grant Screen without Licenses](#example-grant-screen-without-licenses)
- [Examples](#examples)
  - [Live Demonstration](#live-demonstration)
  - [OAuth 2.0 Examples (Authorization)](#oauth-20-examples-authorization)
    - [Retrieving an OAuth 2.0 Access Token (Implicit Flow)](#retrieving-an-oauth-20-access-token-implicit-flow)
    - [Retrieving an OAuth 2.0 Access Token (Code Flow)](#retrieving-an-oauth-20-access-token-code-flow)
    - [Retrieving an OAuth 2.0 Access Token (Refresh Flow)](#retrieving-an-oauth-20-access-token-refresh-flow)
  - [OpenID Connect Examples (Authentication)](#openid-connect-examples-authentication)
    - [Retrieving an OpenID Connect ID Token (Implicit Flow)](#retrieving-an-openid-connect-id-token-implicit-flow)
    - [Retrieving an OpenID Connect ID Token (Code Flow)](#retrieving-an-openid-connect-id-token-code-flow)
  - [Discovering a client from a clientId](#discovering-a-client-from-a-clientid)

# Authentication and Authorization

OADA uses [OAuth 2.0][oauth2-rfc6749] for API Authentication and Authorization
and OpenID Connect for federated user identity authentication. There are a few
minor extensions required by OADA to support the distributed nature of the OADA
federation.

## What should I support?

That depends on your desired role within the OADA ecosystem. In general, there
are three major role categories: **OADA Client**, **OADA Provider**, **OADA
Identity Provider**. Any particular OADA implementation may fit into one or more
of these roles simultaneously. The following table indicates whether or not the
client or server portions of the OAuth 2.0 and/or OpenId Connect specifications,
plus distributed federation extensions, are necessary for each role. If a
particular implementation fits in more than one role then it should support the
union of each applicable role.

|  Role                  |  OAuth 2.0 | OpenID Connect                       |
| ------------------     | ---------- | ------------------------------------ |
| OADA Client            | Client     | Client (Optional: "Login with OADA") |
| OADA Provider          | Server     | Client (OADA User Federated Login)   |
| OADA Identity Provider | -          | Server                               |

The above requirements are described in more detail below by using examples of
typical OADA operations. The OAuth 2.0 and OpenID Connect specifications
should be directly consulted for the details of their operation.

# Distributed Federation Extensions

The inherent distributed nature of OADA means that client and providers and will
often meet for the first when a joint customer tries to point them together.
Therefore, OADA has methods for both clients and providers to automatically
discover each other. Below is a short description of those features.

### `/.well-known/oada-configuration`

`/.well-known/oada-configuration` is an HTTP resource in which clients use to
automatically discover the necessary endpoints of a new OADA provider. This
resource's path **must** be directly appended the provider's domain and
therefore the only burden on the joint user is to know the base domain. For
example, a user should only have to enter `agcloud.com` as their provider rather
then the various endpoints, such as: `agcloud.com/oada/oauth2/auth`,
`agcloud.com/oada/oauth2/token`, etc.

More details can be found in the [/.well-known endpoint
documentation][well-known-endpoint-docs].

### Client Discovery

Client discovery is used by providers to automatically discover OAuth 2.0 and
other details of a given client. This allows a user to point their favorite
client to their favorite provider without the client having had to register with
the provider beforehand.

More details can be found in the [clientDiscovery endpoint
documentation][client-discovery-endpoint-docs]

### Client Secret

During a typical OAuth 2.0 code flow the client is required to trade a code and
sometimes a client secret (undefined string of characters) for an access token.
The client secret is supposed to only be known to the client and provider;
However, in the OADA ecosystem the client and provider often do not know each
other before their first interaction. Therefore, OADA further stipulates that
client secrets take the form of a [JSON Web Tokens (JWT)][jwt] encoded as a
[JSON Web Signatures][jws].

#### Requirements on the JWT

Specific details of a JWT and JWS can be found [here][jwt] and [here][jws]
respectively. However, for OADA there are a few requirements, list before:

- The client secret can only be signed using an algorithm listed in the
  `client_secret_alg_supported` key of the provider's `oada-configuration`. RSA
  256 (RS256 in [JSON Web Algorithms][jwa] speak) is required to be supported by
  all clients and providers.
- The JWT body must include the `ac` key and it is equal to the access code from
  the OAuth 2.0 code flow. The secret should be considered invalid if either the
  `ac` key is missing or is not equal to that sessions access code.

#### Example Client Secret

A JWT takes the form:

`base64Url(header) + "." + base64Url(payload) + "." + base64Url(hash)`

where `header` is the token header in JSON, `payload` is the token body in JSON,
and `hash` is the signature of the header appended to payload using the
algorithm described in the `header`, all joined together by a period.

An example of a valid RS256 JWS client secret is show below:

`eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJhYyI6IlBpMmRZLUZCeFpxTHg4MWxUYkRNNFdHbEkiLCJpYXQiOjE0MTg0MjExMDIsImF1ZCI6Imh0dHBzOi8vcHJvdmlkZXIub2FkYS1kZXYuY29tL3Rva2VuIiwiaXNzIjoiM2tsYXh1ODM4YWthaGYzOGFjdWNhaXg3M0BpZGVudGl0eS5vYWRhLWRldi5jb20ifQ.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo`

Where:

`header` decodes to:
```json
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "nc63dhaSdd82w32udx6v"
}
```

`payload` decodes to:
```json
{
  "ac": "Pi2dY-FBxZqLx81lTbDM4WGlI",
  "iat": 1418421102,
  "aud": "https://provider.oada-dev.com/token",
  "iss": "3klaxu838akahf38acucaix73@identity.oada-dev.com"
}
```

and the corresponding public key from the client's registration which can
validate the JWS is:

```json
{
  "kty": "RSA",
  "use": "sig",
  "alg": "RS256",
  "kid": "nc63dhaSdd82w32udx6v",
  "n": "AKj8uuRIHMaq-EJVf2d1QoB1DSvFvYQ3Xa1gvVxaXgxDiF9-Dh7bO5f0VotrYD05MqvY9X_zxF_ioceCh3_rwjNFVRxNnnIfGx8ooOO-1f4SZkHE-mbhFOe0WFXJqt5PPSL5ZRYbmZKGUrQWvRRy_KwBHZDzD51b0-rCjlqiFh6N",
  "e": "AQAB"
}
```

### Grant Screen

Providers are **required** to display both (a) the license(s) that the client
has agreed to and (b) a hyper-link to the client's privacy and use policy (PUC)
or similar terms-of-use type document for all OAuth 2.0 requests on the
authorization grant screen (the screen in which the users are presented with an
"allow" or "deny" option). Alternatively a warning should be displayed if the
information is not provided by the client. Providers learn this information
themselves during the client discovery phase.

#### Example Grant Screen with Licenses and PUC

![Grant screen for a client with published licenses and
PUC](authorization_grant_screen_with_puc_and_lic.png)

Note the "Privacy and Data Use Principles" link and the display that the client
supports/agreed to the "OADA" license (a fictions example license). OADA does
not require any particular styling of this screen other then  the required
information is prominently displayed.

#### Example Grant Screen without PUC

![Grant screen for a client with published licenses but no published
PUC](authorization_grant_screen_with_no_puc_and_lic.png)

Note the noticeable warning: "No published Privacy and Data Use Principles" and
the display that the client supports/agreed to the "OADA" license (a fictions
example license). OADA does not require any particular styling of this screen
other then the required information is prominently displayed.

#### Example Grant Screen without Licenses

![Grant screen for a client without a published licenses but a published
PUC](authorization_grant_screen_with_puc_and_no_lic.png)

Note the "Privacy and Data Use Principles" link and the noticeable warning: "No
published supported licenses". OADA does not require any particular styling of
this screen other then the required information is prominently displayed.

# Examples

## Live Demonstration

A live demonstration of the OADA Authentication and Authorization mechanism can
be found at: https://client.oada-dev.com. In the example service there are three
entities: client.oada-dev.com, provider.oada-dev.com, and identity.oada-dev.com.
It is assumed that Frank (a farmer) and/or Andy (an agronomist) is using
client.oada-dev.com to access his/his clients data stored at
provider.oada-dev.com. Frank has a local account (username: frank) at
provider.oada-dev.com and Andy uses an OADA federated identity hosted at
identity.oada-dev.com. The client registration for client.oada-dev.com is hosted
at identity.oada-dev.com. identity.oada-dev.com is assumed to be on the OADA
list of trusted identity providers and trusted (to assert license agreements)
list of client discovery providers.

## OAuth 2.0 Examples (Authorization)

In the following examples `client.oada-dev.com` is a web based client which
Frank, a farmer, is using to access his data stored at
`provider.oada-dev.com`. The client id for the application hosted at
`client.oada-dev.com` is `3klaxu838akahf38acucaix73@identity.oada-dev.com`.

`client.oada-dev.com` has three options, the implicit, the authorization code,
and the refresh flow, when requesting an OAuth 2.0 bearer (access) token and
therefore access to Frank's data. Implicit flow is used for "local"
applications, e.g., entirely in-browser, where the OADA API requests come
directly from the application. The authorization code flow is used by
applications in which intermediate server makes the OADA API requests. Finally,
the refresh flow is used by a client that has previously obtained a refresh
token (typically through the authorization code flow) and is attempting to renew
a soon-to-expire access token.

Please see the [OAuth 2.0 RFC][oauth2-rfc6749] for complete technical details.

### Retrieving an OAuth 2.0 Access Token (Implicit Flow)

The implicit flow is the easiest of the two available flows but typically only
produces short lived access tokens. Refresh tokens can not usually be obtained
with this method because the client is not authenticated. The access token is
exposed to the user's user-agent during the procedure and so there are some
security implications to consider. See the [OAuth 2.0 RFC][oauth2-rfc6749] for
complete details. This is the only required flow that an entirely "local"
applications, such as a completely in-browser application, can use.

The example only shows the steps of a successful authorization and
authentication. See the [OAuth 2.0 RFC][oauth2-rfc6749] for complete technical
details.

**Step 1**: Frank instructs the application at `client.oada-dev.com` to access
his data at `provider.oada-dev.com` by typing in `provider.oada-dev.com` and
clicking a "fetch data" button/link.

**Step 2**: The application retrieves the `provider.oada-dev.com`
`oada-configuration` document to discover the necessary OAuth 2.0 endpoints.

**Request**
```http
GET /.well-known/oada-configuration HTTP/1.1
Host: provider.oada-dev.com
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "authorization_endpoint": "https://provider.oada-dev.com/auth",
  "token_endpoint": "https://provider.oada-dev.com/token",
  "oada_base_uri": "https://provider.oada-dev.com",
  "client_secret_alg_supported": [
    "RS256"
  ]
}
```

**Step 3**: The application then initiates the OAuth 2.0 implicit
flow by either popping up a pop-up window or redirecting Frank's user-agent.
The request is a GET on the resource in the `authorization_endpoint` key from `oada-configuration` document above.

**Request**
```http
GET /auth?response_type=token&client_id=3klaxu838akahf38acucaix73%40identity.oada-dev.com&state=xyz&redirect_uri=https%3A%2F%2Fclient.oada-dev.com%2Fredirect.html&scope=bookmarks.fields HTTP/1.1
Host: provider.oada-dev.com

```
*The response pends until step 5*

Where the request parameters are,

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| response_type   | token | Start the implicit flow |
| client_id       | 3klaxu838akahf38acucaix73@identity.oada-dev.com | The application's registered client id |
| state           | xyz   | A string for the client to recover its state after the OAuth 2.0 flow completes. It is also used to prevent cross-site request forgery attacks.  |
| redirect_uri    | https://client.oada-dev.com/redirect.html | The URL which Frank's user-agent is redirected to after the OAuth 2.0 flow is complete. The bearer token is delivered to the client via this redirect. Its value must match an entry in the `redirectUrls` key from the client's registration. |
| scope           |  bookmarks.fields | The scope which the client is asking authorization for. OADA defines some [standard scopes][scopes]. |

**Step 4**: `provider.oada-dev.com` discovers the requesting client and verifies
the OAuth 2.0 request parameters. In particular the redirect URL must match an
entry in the `redirectUrls` key from the client's registration.

See [Discovering a client from a clientId][discovering-a-client] for details of this process.

**Step 5**: Step 3's request is completed with a response of a page that
challenges Frank to login with his credentials. Frank successfully logs in.

The login credentials could either be for a local account at
`provider.oada-dev.com` (in this case 'frank') or for an OADA federated identity
(in this case 'andy' at identity.oada-dev.com). If Frank selects to login with
his OADA federated identity then `provider.oada-dev.com` should pause the
current OAuth 2.0 flow and begin a new [OpenID Connect
Flow][openid-connect-flows] flow as a *client* with Frank's identity provider
(identity.oada-dev.com). If that flow results in a valid ID token then
`provider.oada-dev.com` should resume the original OAuth 2.0 flow and consider
Frank logged into `provider.oada-dev.com` as the identity within the ID token.

**Step 6**: `provider.oada-dev.com` returns the authorization grant screen in
which the requested scopes, client license(s) and PUC, etc. are presented to the
user with a choice to allow or deny. The user approves the authorization.

**Step 7**: `provider.oada-dev.com` generates an access token for Frank and
redirects Frank's user-agent to the `redirect_uri` from the initial request with
the access token and other details in the fragment.

**Response**
```http
HTTP/1.1 302 Found
Location: https://client.oada-dev.com/redirect.html#access_token=2YotnFZFEjr1zCsicMWpAA&state=xyz&token_type=bearer&expires_in=3600

```

where the fragment parameters are

| Fragment Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| access_token    | 2YotnFZFEjr1zCsicMWpAA | The access token to use with OADA API requests |
| state           | xyz   | The state value from the original request so that the client can recover from the redirect. |
| token_type      | bearer | The access token is a bearer token. |
| expires_in      | 3600   | The number of seconds that access token will remain valid |

### Retrieving an OAuth 2.0 Access Token (Code Flow)

The code flow is similar to the implicit flow with a few extra steps. Usually
the code flow results in a longer term access tokens and sometimes refresh
tokens. The client is authenticated in the code flow and the access token is
never exposed to the user's user-agent and so an intermediate server is
required. Please see the [OAuth 2.0 RFC][oauth2-rfc6749] for complete details.

The example only shows the steps of a successful authorization and
authentication. See the [OAuth 2.0 RFC][oauth2-rfc6749] for complete technical
details.

**Step 1**: Frank instructs the application at `client.oada-dev.com` to access
his data at `provider.oada-dev.com` by typing in `provider.oada-dev.com` and
clicking a "fetch data" button/link.

**Step 2**: The application retrieves the `provider.oada-dev.com`
`oada-configuration` document to discover the necessary OAuth 2.0 endpoints.

**Request**
```http
GET /.well-known/oada-configuration HTTP/1.1
Host: provider.oada-dev.com
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "authorization_endpoint": "https://provider.oada-dev.com/auth",
  "token_endpoint": "https://provider.oada-dev.com/token",
  "oada_base_uri": "https://provider.oada-dev.com",
  "client_secret_alg_supported": [
    "RS256"
  ]
}
```

**Step 3**: The application then initiates the OAuth 2.0 code
flow by either popping up a pop-up window or redirecting Frank's user-agent.
The request is a GET on the resource in the `authorization_endpoint` key from `oada-configuration` document above.

**Request**
```http
GET /auth?response_type=code&client_id=3klaxu838akahf38acucaix73%40identity.oada-dev.com&state=xyz&redirect_uri=https%3A%2F%2Fclient.oada-dev.com%2Fredirect&scope=bookmarks.fields HTTP/1.1
Host: provider.oada-dev.com

```
*The response pends until step 5*

Where the request parameters are,

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| response_type   | code | Start the code flow |
| client_id       | 3klaxu838akahf38acucaix73@identity.oada-dev.com | The application's registered client id |
| state           | xyz   | A string for the client to recover its state after the OAuth 2.0 flow completes. It is also used to prevent cross-site request forgery attacks.  |
| redirect_uri    | https://client.oada-dev.com/redirect | The URL which Frank's user-agent is redirected to after the OAuth 2.0 flow is complete. The code is delivered to the intermediate server via this redirect. Its value must match an entry in the `redirectUrls` key from the client's registration. |
| scope           |  bookmarks.fields | The scope which the client is asking authorization for. OADA defines some [standard scopes][scopes]. |

**Step 4**: `provider.oada-dev.com` discovers the requesting client and verifies
the OAuth 2.0 request parameters. In particular the redirect URL must match an
entry in the `redirectUrls` key from the client's registration.

See [Discovering a client from a clientId][discovering-a-client] for details of this process.

**Step 5**: Step 3's request is completed with a response of a page that
challenges Frank to login with his credentials. Frank successfully logs in.

The login credentials could either be for a local account at
`provider.oada-dev.com` (in this case 'frank') or for an OADA federated identity
(in this case 'andy' at identity.oada-dev.com). If Frank selects to login with
his OADA federated identity then `provider.oada-dev.com` should pause the
current OAuth 2.0 flow and begin a new [OpenID Connect
Flow][openid-conect-flows] flow as a *client* with Frank's identity provider
(identity.oada-dev.com). If that flow results in a valid ID token then
`provider.oada-dev.com` should resume the original OAuth 2.0 flow and consider
Frank logged into `provider.oada-dev.com` as the identity within the ID token.

**Step 6**: `provider.oada-dev.com` returns the authorization grant screen in
which the requested scopes, client license(s) and PUC, etc. are presented to the
user with a choice to allow or deny. The user approves the authorization.

**Step 7**: `provider.oada-dev.com` generates a code and redirects Frank's user-agent to the `redirect_uri` from the initial request.

**Response**
```http
HTTP/1.1 302 Found
Location: https://client.oada-dev.com/redirect?code=Pi2dY-FBxZqLx81lTbDM4WGlI&state=xyz

```

where the query parameters are

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| code            | Pi2dY-FBxZqLx81lTbDM4WGlI | The code for the approved authorization. |
| state           | xyz   | The state value from the original request so that the client can recover from the redirect. |

**Step 8**: The intermediate server for `client.oada-dev.com` which is hosting
the application parses the code and state from the GET request query parameters
and makes an out-of-band POST request to the `provider.oada-dev.com`
`token_endpoint` from the `oada-configuration` document.

The provider should validate the request as specified by OAuth 2.0 with the
extra requirements that the client secret JWT validates against a public key
from client registration document, is valid by the [JWT standard][jwt], and
contains an `ac` key equal to the access code in the body.

**Request**
```http
POST /token HTTP/1.1
Host: provider.oada-dev.com
Accept: application/json
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=Pi2dY-FBxZqLx81lTbDM4WGlI&redirect_uri=https%3A%2F%2Fclient.oada-dev.com%2Fredirect&client_id=3klaxu838akahf38acucaix73%40identity.oada-dev.com&client_secret=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJhYyI6IlBpMmRZLUZCeFpxTHg4MWxUYkRNNFdHbEkiLCJpYXQiOjE0MTg0MjExMDIsImF1ZCI6Imh0dHBzOi8vcHJvdmlkZXIub2FkYS1kZXYuY29tL3Rva2VuIiwiaXNzIjoiM2tsYXh1ODM4YWthaGYzOGFjdWNhaXg3M0BpZGVudGl0eS5vYWRhLWRldi5jb20ifQ.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo
```

*Hint: jwt.io can be used to view client_secret*

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token":"2YotnFZFEjr1zCsicMWpAA",
  "token_type":"bearer",
  "expires_in":3600,
  "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA"
}
```

### Retrieving an OAuth 2.0 Access Token (Refresh Flow)

*Write up to come*

## OpenID Connect Examples (Authentication)

The OpenID Connect flows are very similar to the OAuth 2.0 flows. In fact, in
most cases they are identical with only extra information being returned.

Andy, an agronomist, uses an OADA federated identity to login into his OADA
compliant client/cloud. The following examples illiterate Andy logging in with
that identity. Andy's application has a client id of
`3klaxu838akahf38acucaix73@identity.oada-dev.com` hosted at
`client.oada-dev.com`.

An application has two options, the implicit and the authorization code flows,
when requesting an OpenID Connect ID Token and therefore an assertion of Andy's
identity. Implicit flow is used for "local" applications, e.g., entirely
in-browser, where the ID Token should be directly returned to the application.
The authorization code flow is used by applications in which an intermediate
server requires the identity assertion.

Please see the [OpenID Connect Specifications][openid-connect] for complete
technical details.

### Retrieving an OpenID Connect ID Token (Implicit Flow)

The implicit flow is the easiest of the two available flows but can only return
the identity assertion (ID Token) directly to the application. The client is not
authenticated and the ID Token is exposed to Andy's user-agent during the
procedure and so there are some security implications to consider. See the
[OpenID Connect Specifications][openid-connect] for complete details. This is
the only required flow that an entirely "local" applications, such as a
completely in-browser application, can use.

The example only shows the steps of a successful authorization and
authentication. See the [OpenID Connect Specifications][openid-connect] for
complete technical details.

**Step 1**: Andy chooses to log into his application at `client.oada-dev.com`
with his federated identity `andy@identity.oada-dev.com`.  

**Step 2**: The application retrieves the `identity.oada-dev.com`
`openid-configuration` document to discover the necessary OpenID Connect
endpoints.  

**Request**
```http
GET /.well-known/openid-configuration HTTP/1.1
Host: identity.oada-dev.com
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  issuer: "https://identity.oada-dev.com",
  authorization_endpoint: "https://identity.oada-dev.com/auth",
  token_endpoint: "https://identity.oada-dev.com/token",
  userinfo_endpoint: "https://identity.oada-dev.com/userinfo",
  jwks_uri: "https://identity.oada-dev.com/certs",
  response_types_supported: [
    "code",
    "token",
    "id_token",
    "code token",
    "code id_token",
    "token id_token",
    "code token id_token"
  ],
  subject_types_supported: [
    "public"
  ],
  id_token_alg_values_supported: [
    "RS256"
  ],
  token_endpoint_auth_methods_supported: [
    "client_secret_post"
  ]
}
```

**Step 3**: The application then initiates the OpenID Connect implicit
flow by either popping up a pop-up window or redirecting Andy's user-agent.
The request is a GET on the resource in the `authorization_endpoint` key from `openid-configuration` document above.

**Request**
```http
GET /auth?response_type=id_token%40token&client_id=3klaxu838akahf38acucaix73%40identity.oada-dev.com&state=xyz&nonce=XJds9a7cAesf&redirect_uri=https%3A%2F%2Fclient.oada-dev.com%2Fredirect.html&scope=openid%40profile HTTP/1.1
Host: identity.oada-dev.com

```
*The response pends until step 5*

Where the request parameters are,

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| response_type   | id_token token | Start the implicit flow for an OpenID Connect id_token. The token is used to access the `UserInfo` endpoint of OpenID Connect to gather Andy's profile information. |
| client_id       | 3klaxu838akahf38acucaix73@identity.oada-dev.com | The application's registered client id |
| state           | xyz   | A string for the client to recover its state after the OpenID Connect flow completes. It is also used to prevent cross-site request forgery attacks.  |
| nonce           | XJds9a7cAesf | A string used to associate the client session with an id token and to mitigate replay attacks. The value should always be passed through the flow unchanged and the request should be considered invalid if a change occurs. |
| redirect_uri    | https://client.oada-dev.com/redirect.html | The URL which Andy's user-agent is redirected to after the OpenID Connect flow is complete. The id_token is delivered to the client via this redirect. Its value must match an entry in the `redirectUrls` key from the client's registration. |
| scope           |  openid profile | OpenID Connect requires the `openid` scope be present. The `profile` scope represents the application requesting basic identity profile information (username, real name, etc). See the [OpenID Connect Specifications][openid-connect] for more details. |

**Step 4**: `identity.oada-dev.com` discovers the requesting client and verifies
the OpenID Connect request parameters. In particular the redirect URL must match
an entry in the `redirectUrls` key from the client's registration.

See [Discovering a client from a clientId][discovering-a-client] for details of
this process.

**Step 5**: Step 3's request is completed with a response of a page that
challenges Andy to login with his credentials. Frank successfully logs in.

The login credentials could either be for a local account at
`identity.oada-dev.com` (in this case 'andy') or for an OADA federated identity.
At some point it must end at single domain where the user logs in with a local
account. If Andy does select to login with an OADA federated identity then
`identity.oada-dev.com` should pause the current OpenID Connect flow and begin a
new [OpenID Connect Flow][openid-connect-flows] flow as a *client* with Andy's
second identity provider. If that flow results in a valid ID token then
`identity.oada-dev.com` should resume the original OpenID Connect flow and
consider Andy logged into `identity.oada-dev.com` as the identity within the ID
token.

**Step 6**: `identity.oada-dev.com` returns the authorization grant screen in
which the requested scopes, client license(s) and PUC, etc. are presented to the
user with a choice to allow or deny. In this case Andy is allowing (or not) the client to access his identity information. Andy approves the authorization.

**Step 7**: `identity.oada-dev.com` generates an ID Token for Andy and redirects
Andy's user-agent back the `redirect_uri` from the initial request with the
id token and other details in the fragment.

**Response**
```http
HTTP/1.1 302 Found
Location: https://client.oada-dev.com/redirect.html#access_token=2YotnFZFEjr1zCsicMWpAA&state=xyz&token_type=bearer&expires_in=3600&id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtqY1NjamMzMmR3SlhYTEpEczNyMTI0c2ExIn0.eyJpYXQiOjE0MTg2NzY0MzAsImV4cCI6MTQxODY4MDAzMCwiYXVkIjoiM2tsYXh1ODM4YWthaGYzOGFjdWNhaXg3M0BpZGVudGl0eS5vYWRhLWRldi5jb20iLCJpc3MiOiJodHRwczovL2lkZW50aXR5Lm9hZGEtZGV2LmNvbSIsInN1YiI6MX0.SZGoDLalL5Kvabuw3EGdeShrHJWghJ8U5cTzqc0fNDt-bCYYG5bhgODkuBel4NLyOtusI9gW2LMYuSWCaNjddxkFP0eIT43Ij_w71eUMGPZNYPj2OpMupq77FsR5XttgIynF-ErtZlp9t0Ff1rnSjZKIQ-DoSCcoyPtiKLuHicg
```

*Hint: jwt.io can be used to view the id_token*

where the fragment parameters are

| Fragment Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| access_token    | 2YotnFZFEjr1zCsicMWpAA | The access token for the OpenID Connect `/UserInfo` endpoint.  |
| state           | xyz   | The state value from the original request so that the client can recover from the redirect. |
| token_type      | bearer | The access token is a bearer token. |
| expires_in      | 3600   | The number of seconds that access token will remain valid |
| id_token        | < Base64URL encoded JWT > | The identity assertion from the identity provider in the form of a JWT |

**Step 8**: Verify the ID Token.

The JWT is a standard JWS and should be verified according the [JWT][jwt] and
[JWS][jws] specifications. The [JWK][jwk] in which the public keys to verify the
ID Token can be found are located at the HTTP resource linked to by the
`jwks_uri` key in the `identity.oada-dev.com` `openid-configuration` document.

If the ID Token validates correctly then the key `sub` within the ID Token's
body is the unique ID for Andy at `identity.oada-dev.com`.

**Step 9**: Access Andy's profile data (if requested and authorized).

```http
GET /userinfo HTTP/1.1
Host: identity.oada-dev.com
Authorization: Bearer 2YotnFZFEjr1zCsicMWpAA
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "sub": "1",
  "name": "Andy Smith",
  "given_name": "Andy",
  "family_name": "Smith",
  "preferred_username": "a.smith",
  "email": "andy@smith.com",
  "picture": "http://example.com/andysmith/me.jpg"
}
```
### Retrieving an OpenID Connect ID Token (Code Flow)

The code flow is similar to the implicit flow with a few extra steps. The code
flow delivers the identity assertion (ID Token) to an intermediate server
between the identity provider and the application. The client is authenticated
and the ID Token is not exposed to Andy's user-agent during the procedure. See
the [OpenID Connect Specifications][openid-connect] for complete details.

The example only shows the steps of a successful authorization and
authentication. See the [OpenID Connect Specifications][openid-connect] for
complete technical details.

**Step 1**: Andy chooses to log into his application at `client.oada-dev.com`
with his federated identity `andy@identity.oada-dev.com`.

**Step 2**: The application retrieves the `identity.oada-dev.com`
`openid-configuration` document to discover the necessary OpenID Connect
endpoints.

**Request**
```http
GET /.well-known/openid-configuration HTTP/1.1
Host: identity.oada-dev.com
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  issuer: "https://identity.oada-dev.com",
  authorization_endpoint: "https://identity.oada-dev.com/auth",
  token_endpoint: "https://identity.oada-dev.com/token",
  userinfo_endpoint: "https://identity.oada-dev.com/userinfo",
  jwks_uri: "https://identity.oada-dev.com/certs",
  response_types_supported: [
    "code",
    "token",
    "id_token",
    "code token",
    "code id_token",
    "token id_token",
    "code token id_token"
  ],
  subject_types_supported: [
    "public"
  ],
  id_token_alg_values_supported: [
    "RS256"
  ],
  token_endpoint_auth_methods_supported: [
    "client_secret_post"
  ]
}
```

**Step 3**: The application then initiates the OpenID Connect code
flow by either popping up a pop-up window or redirecting Andy's user-agent.
The request is a GET on the resource in the `authorization_endpoint` key from `openid-configuration` document above.

**Request**
```http
GET /auth?response_type=code&client_id=3klaxu838akahf38acucaix73%40identity.oada-dev.com&state=xyz&redirect_uri=https%3A%2F%2Fclient.oada-dev.com%2Fredirect&scope=openid%40profile HTTP/1.1
Host: identity.oada-dev.com

```
*The response pends until step 5*

Where the request parameters are,

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| response_type   | code | Start the code flow for an OpenID Connect id_token. The token is used to access the `UserInfo` endpoint of OpenID Connect to gather Andy's profile information. |
| client_id       | 3klaxu838akahf38acucaix73@identity.oada-dev.com | The application's registered client id |
| state           | xyz   | A string for the client to recover its state after the OpenID Connect flow completes. It is also used to prevent cross-site request forgery attacks.  |
| redirect_uri    | https://client.oada-dev.com/redirect | The URL which Andy's user-agent is redirected to after the OpenID Connect flow is complete. The id_token is delivered to the client via this redirect. Its value must match an entry in the `redirectUrls` key from the client's registration. |
| scope           |  openid profile | OpenID Connect requires the `openid` scope be present. The `profile` scope represents the application requesting basic identity profile information (username, real name, etc). See the [OpenID Connect Specifications][openid-connect] for more details. |

**Step 4**: `identity.oada-dev.com` discovers the requesting client and verifies
the OpenID Connect request parameters. In particular the redirect URL must match
an entry in the `redirectUrls` key from the client's registration.

See [Discovering a client from a clientId][discovering-a-client] for details of
this process.

**Step 5**: Step 3's request is completed with a response of a page that
challenges Andy to login with his credentials. Frank successfully logs in.

The login credentials could either be for a local account at
`identity.oada-dev.com` (in this case 'andy') or for an OADA federated identity.
At some point it must end at single domain where the user logs in with a local
account. If Andy does select to login with an OADA federated identity then
`identity.oada-dev.com` should pause the current OpenID Connect flow and begin a
new [OpenID Connect Flow][openid-connect-flows] flow as a *client* with Andy's
second identity provider. If that flow results in a valid ID token then
`identity.oada-dev.com` should resume the original OpenID Connect flow and
consider Andy logged into `identity.oada-dev.com` as the identity within the ID
token.

**Step 6**: `identity.oada-dev.com` returns the authorization grant screen in
which the requested scopes, client license(s) and PUC, etc. are presented to the
user with a choice to allow or deny. In this case Andy is allowing (or not) the client to access his identity information. Andy approves the authorization.

**Step 7**: `identity.oada-dev.com` generates a code and redirects
Andy's user-agent back the `redirect_uri` from the initial request.

**Response**
```http
HTTP/1.1 302 Found
Location: https://client.oada-dev.com/redirect?code=5MZVZOgNV-nh3brHM78UoaJ-w&state=xyz
```

where the fragment parameters are

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| code            | 5MZVZOgNV-nh3brHM78UoaJ-w | The code for the approved authorization. |
| state           | xyz   | The state value from the original request so that the client can recover from the redirect. |

**Step 8**: The intermediate server for `client.oada-dev.com` which is hosting
the application parses the code and state from the GET request query parameters
and makes an out-of-band POST request to the `identity.oada-dev.com`
`token_endpoint` from the `openid-configuration` document.

The provider should validate the request as specified by [OpenId
Connect][openid-connect] with the extra requirements that the client secret JWT
validates against a public key from client registration document, is valid by
the JWT standard, and contains an ac key equal to the access code in the body.

**Request**
```http
POST /token HTTP/1.1
Host: identity.oada-dev.com
Accept: application/json
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=5MZVZOgNV-nh3brHM78UoaJ-w&redirect_uri=https%3A%2F%2Fclient.oada-dev.com%2Fredirect&client_id=3klaxu838akahf38acucaix73%40identity.oada-dev.com&client_secret=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJhYyI6IjVNWlZaT2dOVi1uaDNickhNNzhVb2FKLXciLCJpYXQiOjE0MTg2Nzc5NzUsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHkub2FkYS1kZXYuY29tL3Rva2VuIiwiaXNzIjoiM2tsYXh1ODM4YWthaGYzOGFjdWNhaXg3M0BpZGVudGl0eS5vYWRhLWRldi5jb20ifQ.oDIk3cde6xKfyQMCU3lBL1gmWbEqDcy2rH5pmPPrH7xk9yM7cx-lJC5oVDSVi42SGL1gCR2r6ATjHPVy-y-DBEbvPyBmDHkK3TD6bdqPlL9NgLxgH7UsMt9aFuvIjYkCUTKoF5aURqfUlO5fRpECvoJfchCDYgxP7LQwAZ2ic8M
```

*Hint: jwt.io can be used to view the client secret*

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token":"2YotnFZFEjr1zCsicMWpAA",
  "token_type":"bearer",
  "expires_in":3600,
  "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
  "id_token":  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtqY1NjamMzMmR3SlhYTEpEczNyMTI0c2ExIn0.eyJpYXQiOjE0MTg2NzY0MzAsImV4cCI6MTQxODY4MDAzMCwiYXVkIjoiM2tsYXh1ODM4YWthaGYzOGFjdWNhaXg3M0BpZGVudGl0eS5vYWRhLWRldi5jb20iLCJpc3MiOiJodHRwczovL2lkZW50aXR5Lm9hZGEtZGV2LmNvbSIsInN1YiI6MX0.SZGoDLalL5Kvabuw3EGdeShrHJWghJ8U5cTzqc0fNDt-bCYYG5bhgODkuBel4NLyOtusI9gW2LMYuSWCaNjddxkFP0eIT43Ij_w71eUMGPZNYPj2OpMupq77FsR5XttgIynF-ErtZlp9t0Ff1rnSjZKIQ-DoSCcoyPtiKLuHicg"
}
```

*Hint: jwt.io can be used to view the id_token*

**Step 9**: Verify the ID Token.

The JWT is a standard JWS and should be verified according the [JWT][jwt] and
[JWS][jws] specifications. The [JWK][jwk] in which the public keys to verify the
ID Token can be found are located at the HTTP resource linked to by the
`jwks_uri` key in the `identity.oada-dev.com` `openid-configuration` document.

If the ID Token validates correctly then the key `sub` within the ID Token's
body is the unique ID for Andy at `identity.oada-dev.com`.

**Step 9**: Access Andy's profile data (if requested and authorized).

```http
GET /userinfo HTTP/1.1
Host: identity.oada-dev.com
Authorization: Bearer 2YotnFZFEjr1zCsicMWpAA
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "sub": "1",
  "name": "Andy Smith",
  "given_name": "Andy",
  "family_name": "Smith",
  "preferred_username": "a.smith",
  "email": "andy@smith.com",
  "picture": "http://example.com/andysmith/me.jpg"
}
```

## Discovering a client from a clientId

Discovering a client is a multi-step process. In this example a provider is
attempting to discovery the client registration document of the client ID
`3klaxu838akahf38acucaix73@identity.oada-dev.com`.

**Step 1** The domain is parsed from the client ID, in this case,
`identity.oada-dev.com`.

**Step 2** The `oada-configuration` document for that domain is obtained.

**Request**
```http
GET /.well-known/oada-configuration HTTP/1.1
Host: identity.oada-dev.com
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "authorization_endpoint": "https://identity.oada-dev.com/auth",
  "token_endpoint": "https://identity.oada-dev.com/token",
  "oada_base_uri": "https://identity.oada-dev.com",
  "client_discovery": "https://identity.oada-dev.com/client",
  "client_secret_alg_supported": [
    "RS256"
  ]
}
```

**Step 3**: The client registration document is fetched via GET request on the
domains `client_discovery` endpoint with a `clientId` query parameter.

**Request**
```http
GET /client?clientId=3klaxu838akahf38acucaix73%40identity.oada-dev.com HTTP/1.1
Host: identity.oada-dev.com
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "clientId": "3klaxu838akahf38acucaix73@identity.oada-dev.com",
  "redirectUrls": [
    "https://client.oada-dev.com/redirect",
    "https://client.oada-dev.com/redirect.html"
  ],
  "licenses": [
    {
      "id": "oada-1.0",
      "name": "OADA Fictitious Agreement v1.0"
    }
  ],
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256"
      "kid": "nc63dhaSdd82w32udx6v",
      "n":   "AKj8uuRIHMaq-EJVf2d1QoB1DSvFvYQ3Xa1gvVxaXgxDiF9-Dh7bO5f0VotrYD05MqvY9X_zxF_ioceCh3_rwjNFVRxNnnIfGx8ooOO-1f4SZkHE-mbhFOe0WFXJqt5PPSL5ZRYbmZKGUrQWvRRy_KwBHZDzD51b0-rCjlqiFh6N",
      "e": "AQAB"
    }
  ],
  "name": "OADA Reference Implementation",
  "contact": "info@openag.io",
  "puc": "https://identity.oada-dev.com/puc.html"
}
```

*If the `clientId` domain, in this case `identity.oada-dev.com`, is not on the
*trusted list of client discovery providers a warning **must** presented to the
*user on the authorization grant screen. In particular the warning should
*indicate that client's agreement to the license(s) can not be trusted.*

[openid-conect-flows]: #openid-connect-examples
[discovering-a-client]: #discovering-a-client-from-a-clientId
[oauth2-rfc6749]: https://tools.ietf.org/rfc/rfc6749.txt
[openid-connect]: http://openid.net/specs/openid-connect-core-1_0.html
[well-known-endpoint-docs]:  https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-Discovery-Endpoints.md#well-knownoada-configuration
[client-discovery-endpoint-docs]:  https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-Discovery-Endpoints.md#clientdiscovery
[jwt]: https://tools.ietf.org/id/draft-ietf-oauth-json-web-token.txt
[jws]: https://tools.ietf.org/id/draft-ietf-jose-json-web-signature.txt
[jwa]: https://tools.ietf.org/id/draft-ietf-jose-json-web-algorithms.txt
[jwk]: https://tools.ietf.org/id/draft-ietf-jose-json-web-key.txt
[scopes]: https://github.com/OADA/oada-docs/blob/master/rest-specs/Standard-Scopes.md
