# Table of Contents

  * [Authentication and Authorization](#authentication-and-authorization)
    * [What should I support?](#what-should-i-support)
  * [OADA Distributed Federation](#oada-distributed-federation)
      * [Well-Known Documents](#well-known-documents)
 * [`/.well-known/oada-configuration`](#well-knownoada-configuration)
 * [`/.well-known/openid-configuration`](#well-knownopenid-configuration)
      * [Client Registration](#client-registration)
        * [Example Client Registration](#example-client-registration)
      * [Client Authentication](#client-authentication)
        * [Requirements on the JWT](#requirements-on-the-jwt)
        * [Example Client Assertion](#example-client-assertion)
      * [Grant Screen](#grant-screen)
        * [Example Grant Screen with Licenses and PUC](#example-grant-screen-with-licenses-and-puc)
        * [Example Grant Screen without PUC](#example-grant-screen-without-puc)
        * [Example Grant Screen without Licenses](#example-grant-screen-without-licenses)
  * [Examples](#examples)
    * [Live Demonstration](#live-demonstration)
    * [OAuth 2.0 Examples (Authorization)](#oauth-20-examples-authorization)
      * [Retrieving an OAuth 2.0 Access Token (Implicit Flow)](#retrieving-an-oauth-20-access-token-implicit-flow)
      * [Retrieving an OAuth 2.0 Access Token (Code Flow)](#retrieving-an-oauth-20-access-token-code-flow)
      * [Retrieving an OAuth 2.0 Access Token (Refresh Flow)](#retrieving-an-oauth-20-access-token-refresh-flow)
    * [OpenID Connect Examples (Authentication)](#openid-connect-examples-authentication)
      * [Retrieving an OpenID Connect ID Token (Implicit Flow)](#retrieving-an-openid-connect-id-token-implicit-flow)
      * [Retrieving an OpenID Connect ID Token (Code Flow)](#retrieving-an-openid-connect-id-token-code-flow)

# Authentication and Authorization

OADA uses [OAuth 2.0][oauth2-rfc6749] for API Authentication and Authorization
and OpenID Connect for federated user identity authentication. There are two
RFC extensions that OADA also adopts, [OAuth 2.0 Dynamic Client Registration
Protocol][dyn-client-reg] and [JSON Web Token (JWT) Profile for OAuth 2.0
Client Authentication and Authorization Grant][jwt-bearer] (only for client
authentication).

## What should I support?

That depends on your desired role within the OADA ecosystem. In general, there
are three major role categories: **OADA Client**, **OADA Provider**, **OADA
Identity Provider**. Any particular OADA implementation may fit into one or
more of these roles simultaneously. The following table indicates whether or
not the client or server portions of the OAuth 2.0 and/or OpenID Connect, plus
extension, specifications are necessary for each role. If a particular
implementation fits in more than one role then it should support the union of
each applicable role.

|  Role                  |  OAuth 2.0 | OpenID Connect                       |
| ------------------     | ---------- | ------------------------------------ |
| OADA Client            | Client     | Client (Optional: "Login with OADA") |
| OADA Provider          | Server     | Client (OADA User Federated Login)   |
| OADA Identity Provider | -          | Server                               |

The above requirements are described in more detail below by using examples of
typical OADA operations. The OAuth 2.0 and OpenID Connect specifications
should be directly consulted for the details of their operation.

# OADA Distributed Federation

The inherent distributed nature of OADA means that the first interaction
between a client and a provider will often be the moment that a joint customer
tries to direct the client the to the provider's API. Therefore, OADA has
methods for both clients and providers to automatically discover one another.

### Well-Known Documents

#### `/.well-known/oada-configuration`

The `oada-configuration` well-known document is utilized in authorization
requests. It describes the location and supported features of the associated
OADA API.

More details can be found in the [/.well-known/oada-configuration endpoint
documentation][well-known-oada-configuration-docs].

#### `/.well-known/openid-configuration`

The `openid-configuration` well-known document is utilized in authentication
requests. It describes the location and supported features of an OpenID
Connect server. 

More details can be found in the [/.well-known/openid-configuration endpoint
documentation][well-known-openid-configuration-docs].

### Client Registration

Client registration is critical to the operation of OAuth 2.0. Rather than
individual provider client registration databases that would require an
application developer to register with all possible OADA providers, OADA has
opted for a more dynamic method. In particular it adopted the [OAuth 2.0
Dynamic Client Registration Protocol][dyn-client-reg] extension
specifications. However, a client and server must also adhere to the following
additional requirements (which are still in accord to the aforementioned
specification)

1. The client registration key/value pairs MUST be included as a
   JWT`software_statement`. Registration data that is included outside of the
   `software_statement` will cause the provider to issue a warning to the user
   that the client identity cannot be fully verified.
1. The `software_statement` SHOULD be signed by a trusted client registration
   provider. A `software_statement` that is not signed by a trusted client
   registration provider will cause the provider to issue a warning to the
   user that the client identity cannot be fully verified.
1. The `software_statement` MUST contain a `software_id` which is generated
   and is unique within client registration provider's domain.
1. The `software_statement` MUST contain the [JWS][jws] header parameter `jku`.
   The value of the parameter MUST be the URI to the [JWK Set][jwk] that
   contains the key which signed the `software_statement`.
1. The `software_statement` MUST contain the [JWS][jws] header parameter `kid`.
   The value of the parameter MUST be equal to the key id that signed the
   `software_statement` and can be found in the `jku` [JWK Set][jwk].
1. The `software_statement` MUST contain a `registration_proivder` claim that
   is the base the associated client registration provider's domain. A
   provider SHOULD locate the public key that can verify the registration
   document from the client registration provider trusted list. If the client
   registration provider domain is not on the trusted client registration
   provider list or the JWT can not be verified by the associated key then a
   warning MUST be shown indicating the client identifier cannot be fully
   verified.
1. The `software_statement` MUST contain a `jwks` or `jwks_uri` claim that 
   provides the public keys which the provider can use to verify the 
   client assertion in during the code flow. If the registration only supports
   the implicit flow this field is not required.
1. [OAuth 2.0 Dynamic Client Registration Protocol][dyn-client-reg] is to be
   extended to [OpenID Connect Dynamic Client Registration
   1.0][openid-dyn-client-reg]. This effectively amounts to requiring the
   OpenID Connect registration keys to be delivered as a `software_statement`
   to avoid the provider warning the user that the client's identity cannot be
   fully verified.

#### Example Client Registration

Below is an example OADA client registration document. Note `software_version`
and `scopes` are examples of claims that do not need to be asserted by a
trusted client registration provider and so they are given directly in the
registration document rather than in the `software_statement`. This allows a
client to use a single client registration across client versions and to
limit the set of scopes that can be requested by the client to only those needed
at the time.

```json
{
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "software_statement": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vY2xpZW50LmV4YW1wbGUuY29tL2NhbGxiYWNrIiwiaHR0cHM6Ly9jbGllbnQuZXhhbXBsZS5jb20vY2IiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJpbXBsaWNpdCIsImF1dGhvcml6YXRpb25fY29kZSIsInJlZnJlc2hfdG9rZW4iXSwicmVzcG9uc2VfdHlwZXMiOlsidG9rZW4iLCJjb2RlIl0sImNsaWVudF9uYW1lIjoiRXhhbXBsZSBPQURBIENsaWVudCIsImNsaWVudF91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20iLCJsb2dvX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS9sb2dvLnBuZyIsImNvbnRhY3RzIjpbIkNsaW50IENsaWVudCA8Y2NsaWVudEBleGFtcGxlLmNvbT4iXSwidG9zX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MuaHRtbCIsInBvbGljeV91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20vcG9saWN5Lmh0bWwiLCJqd2tzX3VyaSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vandrcyIsInNvZnR3YXJlX2lkIjoiZGp4a2phdTNuOTM3eHo3amFrbDMiLCJyZWdpc3RyYXRpb25fcHJvdmlkZXIiOiJyZWdpc3RyYXRpb24uZXhhbXBsZS5jb20ifQ.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo"
}
```

Where the [JWT][jwt] in the `software_statement` key takes the form:

`base64Url(header) + "." + base64Url(payload) + "." + base64Url(hash)`

Where `header` is the token header in JSON, `payload` is the token body in
JSON, and `hash` is the signature of the header appended to payload using the
algorithm described in the `header`, all joined together by a period.

The above `software_statement` example breaks down into:

`header`:
```json
{
  "typ": "JWT",
  "alg": "RS256",
  "jku": "https://registration.example.com/certs",
  "kid": "nc63dhaSdd82w32udx6v"
}
```

`payload`:
```json
{
  "redirect_uris": [
    "https://client.example.com/callback",
    "https://client.example.com/cb"
  ],
  "token_endpoint_auth_method": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "grant_types": [
    "implicit", 
    "authorization_code",
    "refresh_token"
  ],
  "response_types": [
    "token",
    "code" 
  ],
  "client_name": "Example OADA Client",
  "client_uri": "http://example.com",
  "logo_uri": "http://example.com/logo.png",
  "contacts": [
    "Clint Client <cclient@example.com>"
  ],
  "tos_uri": "http://example.com/tos.html",
  "policy_uri": "http://example.com/policy.html",
  "software_id": "djxkjau3n937xz7jakl3",
  "registration_provider": "registration.example.com",
  "jwks_uri": "https://example.com/certs"
}
```

### Client Authentication

During a typical OAuth 2.0 code flow the client is required to trade a code and
sometimes some sort of client authentication for an access token. OADA has
adopted [JSON Web Token (JWT) Profile for OAuth 2.0 Client Authentication and
Authorization Grants][jwt-bearer] for client assertions only.

#### Requirements on the JWT

The client assertions take the form of a [JWT][jwt]/[JWS][jws] and are used on
the token endpoint during the OAuth 2.0 authorization code flow. However, for
OADA there are a few additional requirements (which are still in accord to the
aforementioned specification):

- The client assertion can only be signed using an algorithm listed in the
  `token_endpoint_auth_signing_alg_values_supported` key of the provider's
  `oada-configuration`. RSA 256 (RS256 in [JSON Web Algorithms][jwa] speak) is
  required to be supported by all clients and providers.
- The `iss` claim MUST be set to the client's OAuth 2.0 clientId.
- The JWT body must include the `jti` key and MUST be equal to the access code
  from the OAuth 2.0 code flow. The secret should be considered invalid if
  either the `jti` key is missing or is not equal to that sessions access code.

#### Example Client Assertion

A JWT takes the form:

`base64Url(header) + "." + base64Url(payload) + "." + base64Url(hash)`

where `header` is the token header in JSON, `payload` is the token body in JSON,
and `hash` is the signature of the header appended to payload using the
algorithm described in the `header`, all joined together by a period.

An example of a valid RS256 JWS client assertion is show below:

`eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJqdGkiOiJQaTJkWS1GQnhacUx4ODFsVGJETTRXR2xJIiwiaWF0IjoxNDE4NDIxMTAyLCJhdWQiOiJodHRwczovL3Byb3ZpZGVyLm9hZGEtZGV2LmNvbS90b2tlbiIsImlzcyI6IjNrbGF4dTgzOGFrYWhmMzhhY3VjYWl4NzNAaWRlbnRpdHkub2FkYS1kZXYuY29tIn0.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo`

Where

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
  "jti": "Pi2dY-FBxZqLx81lTbDM4WGlI",
  "iat": 1418421102,
  "aud": "https://provider.example.org/token",
  "iss": "3klaxu838akahf38acucaix73",
  "sub": "3klaxu838akahf38acucaix73",
}
```

And the corresponding public key from the client's registration which can
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
be found at: https://client.example.org. In the example service there are three
entities: `client.example.org`, `provider.example.org`, and
`identity.example.org`. It is assumed that Frank (a farmer) and/or Andy (an
agronomist) is using `client.example.org` to access his/his clients data stored
at `provider.example.org`. Frank has a local account (username: frank) at
`provider.example.org` and Andy uses an OADA federated identity hosted at
`identity.example.org`. The client registration for `client.example.org` is
hosted at `identity.example.org`. `identity.example.org` is assumed to be on the
OADA list of trusted identity providers and trusted (to assert license
agreements) list of client discovery providers.

## OAuth 2.0 Examples (Authorization)

In the following examples `client.example.org` is a web based client which
Frank, a farmer, is using to access his data stored at
`provider.example.org`.

`client.example.org` has three options, the implicit, the authorization code,
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

**Step 1**: Frank instructs the application at `client.example.org` to access
his data at `provider.example.org` by typing in `provider.example.org` and
clicking a "fetch data" button/link.

**Step 2**: The application retrieves the `provider.example.org`
`oada-configuration` document to discover the necessary OAuth 2.0 endpoints.

**Request**
```http
GET /.well-known/oada-configuration HTTP/1.1
Host: provider.example.org
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.oada.oada-configuration.1+json

{
  "well_known_version": "1.0.0",
  "oada_base_uri": "https://provider.example.org",
  "authorization_endpoint": "https://provider.example.org/auth",
  "token_endpoint": "https://provider.example.org/token",
  "registration_endpoint": "https://example.org/register",
  "token_endpoint_auth_signing_alg_values_supported": [
      "RS256"
  ]
}
```

**Step 3**: The application dynamically registers itself with the provider by
making a POST request with it's client registration document to
`registration_endpoint`.

**Request**
```http
POST /register HTTP/1.1
Host: provider.example.org
Accept: application/json

{
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "software_statement": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vY2xpZW50LmV4YW1wbGUuY29tL2NhbGxiYWNrIiwiaHR0cHM6Ly9jbGllbnQuZXhhbXBsZS5jb20vY2IiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJpbXBsaWNpdCIsImF1dGhvcml6YXRpb25fY29kZSIsInJlZnJlc2hfdG9rZW4iXSwicmVzcG9uc2VfdHlwZXMiOlsidG9rZW4iLCJjb2RlIl0sImNsaWVudF9uYW1lIjoiRXhhbXBsZSBPQURBIENsaWVudCIsImNsaWVudF91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20iLCJsb2dvX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS9sb2dvLnBuZyIsImNvbnRhY3RzIjpbIkNsaW50IENsaWVudCA8Y2NsaWVudEBleGFtcGxlLmNvbT4iXSwidG9zX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MuaHRtbCIsInBvbGljeV91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20vcG9saWN5Lmh0bWwiLCJqd2tzX3VyaSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vandrcyIsInNvZnR3YXJlX2lkIjoiZGp4a2phdTNuOTM3eHo3amFrbDMiLCJyZWdpc3RyYXRpb25fcHJvdmlkZXIiOiJyZWdpc3RyYXRpb24uZXhhbXBsZS5jb20ifQ.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo"
}

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "client_id": "3klaxu838akahf38acucaix73",
  "client_id_issued_at": 1418423102,
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "redirect_uris": [
    "https://client.example.com/callback",
    "https://client.example.com/cb"
  ],
  "token_endpoint_auth_method": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "grant_types": [
    "implicit", 
    "authorization_code",
    "refresh_token"
  ],
  "response_types": [
    "token",
    "code" 
  ],
  "client_name": "Example OADA Client",
  "client_uri": "http://example.com",
  "logo_uri": "http://example.com/logo.png",
  "contacts": [
    "Clint Client <cclient@example.com>"
  ],
  "tos_uri": "http://example.com/tos.html",
  "policy_uri": "http://example.com/policy.html",
  "software_id": "djxkjau3n937xz7jakl3",
  "registration_provider": "registration.example.com"
}
```

**Step 4**: The application then initiates the OAuth 2.0 implicit flow by either
popping up a pop-up window or redirecting Frank's user-agent.  The request is a
GET on the resource in the `authorization_endpoint` key from
`oada-configuration` document above.

**Request**
```http
GET /auth?response_type=token&client_id=3klaxu838akahf38acucaix73&state=xyz&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb&scope=read:planting.prescriptions HTTP/1.1
Host: provider.example.org

```
*The response pends until step 6*

Where the request parameters are,

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| response_type   | token | Start the implicit flow |
| client_id       | 3klaxu838akahf38acucaix73 | The application's client id received from dynamic client registration. |
| state           | xyz   | A string for the client to recover its state after the OAuth 2.0 flow completes. It is also used to prevent cross-site request forgery attacks.  |
| redirect_uri    | https://client.example.org/cb | The URL which Frank's user-agent is redirected to after the OAuth 2.0 flow is complete. The bearer token is delivered to the client via this redirect. Its value must match an entry in the `redirectUrls` key from the client's registration. |
| scope           |  write:planting.prescriptions | The scope which the client is asking authorization for. OADA defines some [standard scopes][scopes]. |

**Step 5**: `provider.example.org` discovers the requesting client and verifies
the OAuth 2.0 request parameters. In particular the redirect URL must match an
entry in the `redirectUrls` key from the client's registration.

**Step 6**: Step 3's request is completed with a response of a page that
challenges Frank to login with his credentials. Frank successfully logs in.

The login credentials could either be for a local account at
`provider.example.org` (in this case 'frank') or for an OADA federated identity
(in this case 'andy' at identity.example.org). If Frank selects to login with
his OADA federated identity then `provider.example.org` should pause the current
OAuth 2.0 flow and begin a new [OpenID Connect Flow][openid-connect-flows] flow
as a *client* with Frank's identity provider (identity.example.org). If that
flow results in a valid ID token then `provider.example.org` should resume the
original OAuth 2.0 flow and consider Frank logged into `provider.example.org` as
the identity within the ID token.

**Step 7**: `provider.example.org` returns the authorization grant screen in
which the requested scopes, client license(s) and PUC, etc. are presented to the
user with a choice to allow or deny. The user approves the authorization.

**Step 8**: `provider.example.org` generates an access token for Frank and
redirects Frank's user-agent to the `redirect_uri` from the initial request with
the access token and other details in the fragment.

**Response**
```http
HTTP/1.1 302 Found
Location: https://client.example.org/cb#access_token=2YotnFZFEjr1zCsicMWpAA&state=xyz&token_type=bearer&expires_in=3600

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

**Step 1**: Frank instructs the application at `client.example.org` to access
his data at `provider.example.org` by typing in `provider.example.org` and
clicking a "fetch data" button/link.

**Step 2**: The application retrieves the `provider.example.org`
`oada-configuration` document to discover the necessary OAuth 2.0 endpoints.

**Request**
```http
GET /.well-known/oada-configuration HTTP/1.1
Host: provider.example.org
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.oada.oada-configuration.1+json

{
  "well_known_version": "1.0.0",
  "oada_base_uri": "https://provider.example.org",
  "authorization_endpoint": "https://provider.example.org/auth",
  "token_endpoint": "https://provider.example.org/token",
  "registration_endpoint": "https://example.org/register",
  "token_endpoint_auth_signing_alg_values_supported": [
      "RS256"
  ]
}
```

**Step 3**: The application dynamically registers itself with the provider by
making a POST request with it's client registration document to
`registration_endpoint`.

**Request**
```http
POST /register HTTP/1.1
Host: provider.example.org
Accept: application/json

{
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "software_statement": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vY2xpZW50LmV4YW1wbGUuY29tL2NhbGxiYWNrIiwiaHR0cHM6Ly9jbGllbnQuZXhhbXBsZS5jb20vY2IiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJpbXBsaWNpdCIsImF1dGhvcml6YXRpb25fY29kZSIsInJlZnJlc2hfdG9rZW4iXSwicmVzcG9uc2VfdHlwZXMiOlsidG9rZW4iLCJjb2RlIl0sImNsaWVudF9uYW1lIjoiRXhhbXBsZSBPQURBIENsaWVudCIsImNsaWVudF91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20iLCJsb2dvX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS9sb2dvLnBuZyIsImNvbnRhY3RzIjpbIkNsaW50IENsaWVudCA8Y2NsaWVudEBleGFtcGxlLmNvbT4iXSwidG9zX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MuaHRtbCIsInBvbGljeV91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20vcG9saWN5Lmh0bWwiLCJqd2tzX3VyaSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vandrcyIsInNvZnR3YXJlX2lkIjoiZGp4a2phdTNuOTM3eHo3amFrbDMiLCJyZWdpc3RyYXRpb25fcHJvdmlkZXIiOiJyZWdpc3RyYXRpb24uZXhhbXBsZS5jb20ifQ.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo"
}

  ```

  **Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "client_id": "3klaxu838akahf38acucaix73",
  "client_id_issued_at": 1418423102,
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "redirect_uris": [
    "https://client.example.com/callback",
    "https://client.example.com/cb"
  ],
  "token_endpoint_auth_method": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "grant_types": [
    "implicit", 
    "authorization_code",
    "refresh_token"
  ],
  "response_types": [
    "token",
    "code" 
  ],
  "client_name": "Example OADA Client",
  "client_uri": "http://example.com",
  "logo_uri": "http://example.com/logo.png",
  "contacts": [
    "Clint Client <cclient@example.com>"
  ],
  "tos_uri": "http://example.com/tos.html",
  "policy_uri": "http://example.com/policy.html",
  "software_id": "djxkjau3n937xz7jakl3",
  "registration_provider": "registration.example.com"
}
```

**Step 4**: The application then initiates the OAuth 2.0 code
flow by either popping up a pop-up window or redirecting Frank's user-agent.
The request is a GET on the resource in the `authorization_endpoint` key from `oada-configuration` document above.

**Request**
```http
GET /auth?response_type=code&client_id=3klaxu838akahf38acucaix73&state=xyz&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb&scope=write:planting.prescription HTTP/1.1
Host: provider.example.org

```
*The response pends until step 6*

Where the request parameters are,

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| response_type   | code | Start the code flow |
| client_id       | 3klaxu838akahf38acucaix73 | The application's client id received from dynamic client registration. |
| state           | xyz   | A string for the client to recover its state after the OAuth 2.0 flow completes. It is also used to prevent cross-site request forgery attacks.  |
| redirect_uri    | https://client.example.org/cb | The URL which Frank's user-agent is redirected to after the OAuth 2.0 flow is complete. The code is delivered to the intermediate server via this redirect. Its value must match an entry in the `redirectUrls` key from the client's registration. |
| scope           |  write:planting.prescriptions | The scope which the client is asking authorization for. OADA defines some [standard scopes][scopes]. |

**Step 5**: `provider.example.org` discovers the requesting client and verifies
the OAuth 2.0 request parameters. In particular the redirect URL must match an
entry in the `redirectUrls` key from the client's registration.

**Step 6**: Step 3's request is completed with a response of a page that
challenges Frank to login with his credentials. Frank successfully logs in.

The login credentials could either be for a local account at
`provider.example.org` (in this case 'frank') or for an OADA federated identity
(in this case 'andy' at identity.example.org). If Frank selects to login with
his OADA federated identity then `provider.example.org` should pause the current
OAuth 2.0 flow and begin a new [OpenID Connect Flow][openid-connect-flows] flow
as a *client* with Frank's identity provider (identity.example.org). If that
flow results in a valid ID token then `provider.example.org` should resume the
original OAuth 2.0 flow and consider Frank logged into `provider.example.org` as
the identity within the ID token.

**Step 7**: `provider.example.org` returns the authorization grant screen in
which the requested scopes, client license(s) and PUC, etc. are presented to the
user with a choice to allow or deny. The user approves the authorization.

**Step 8**: `provider.example.org` generates a code and redirects Frank's
user-agent to the `redirect_uri` from the initial request.

**Response**
```http
HTTP/1.1 302 Found
Location: https://client.example.org/cb?code=Pi2dY-FBxZqLx81lTbDM4WGlI&state=xyz

```

where the query parameters are

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| code            | Pi2dY-FBxZqLx81lTbDM4WGlI | The code for the approved authorization. |
| state           | xyz   | The state value from the original request so that the client can recover from the redirect. |

**Step 9**: The intermediate server for `client.example.org` which is hosting
the application parses the code and state from the GET request query parameters
and makes an out-of-band POST request to the `provider.example.org`
`token_endpoint` from the `oada-configuration` document.

The provider should validate the request as specified by OAuth 2.0 with the
extra requirements that the client assertion JWT validates against a public key
from client registration document, is valid by the [JWT standard][jwt], and
contains an `ac` key equal to the access code in the body.

**Request**
```http
POST /token HTTP/1.1
Host: provider.example.org
Accept: application/json
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=Pi2dY-FBxZqLx81lTbDM4WGlI&redirect_uri=https%3A%2F%2Fclient.example.org%2Fredirect&client_id=3klaxu838akahf38acucaix73%40identity.example.org&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJqdGkiOiJQaTJkWS1GQnhacUx4ODFsVGJETTRXR2xJIiwiaWF0IjoxNDE4NDIxMTAyLCJhdWQiOiJodHRwczovL3Byb3ZpZGVyLm9hZGEtZGV2LmNvbS90b2tlbiIsImlzcyI6IjNrbGF4dTgzOGFrYWhmMzhhY3VjYWl4NzNAaWRlbnRpdHkub2FkYS1kZXYuY29tIn0.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo
```
*Hint: http://jwt.io can be used to view client_secret*

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
that identity. 

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

**Step 1**: Andy chooses to log into his application at `client.example.org`
with his federated identity `andy@identity.example.org`.

**Step 2**: The application retrieves the `identity.example.org`
`openid-configuration` document to discover the necessary OpenID Connect
endpoints.

**Request**
```http
GET /.well-known/openid-configuration HTTP/1.1
Host: identity.example.org
Accept: application/json

  ```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "issuer": "https://identity.example.org",
  "registration_endpoint": "https://identity.example.org/register",
  "authorization_endpoint": "https://identity.example.org/auth",
  "token_endpoint": "https://identity.example.org/token",
  "userinfo_endpoint": "https://identity.example.org/userinfo",
  "jwks_uri": "https://identity.example.org/certs",
  "response_types_supported": [
    "code",
    "token",
    "id_token",
    "code token",
    "code id_token",
    "token id_token",
    "code token id_token"
  ],
  "subject_types_supported": [
    "public"
  ],
  "id_token_alg_values_supported": [
    "RS256"
  ],
  "token_endpoint_auth_methods_supported": [
    "client_secret_post"
  ]
}
```

**Step 3**: The application dynamically registers itself with the provider by
making a POST request with it's client registration document to
`registration_endpoint`.

**Request**
```http
POST /register HTTP/1.1
Host: identity.example.org
Accept: application/json

{
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "software_statement": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vY2xpZW50LmV4YW1wbGUuY29tL2NhbGxiYWNrIiwiaHR0cHM6Ly9jbGllbnQuZXhhbXBsZS5jb20vY2IiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJpbXBsaWNpdCIsImF1dGhvcml6YXRpb25fY29kZSIsInJlZnJlc2hfdG9rZW4iXSwicmVzcG9uc2VfdHlwZXMiOlsidG9rZW4iLCJjb2RlIl0sImNsaWVudF9uYW1lIjoiRXhhbXBsZSBPQURBIENsaWVudCIsImNsaWVudF91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20iLCJsb2dvX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS9sb2dvLnBuZyIsImNvbnRhY3RzIjpbIkNsaW50IENsaWVudCA8Y2NsaWVudEBleGFtcGxlLmNvbT4iXSwidG9zX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MuaHRtbCIsInBvbGljeV91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20vcG9saWN5Lmh0bWwiLCJqd2tzX3VyaSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vandrcyIsInNvZnR3YXJlX2lkIjoiZGp4a2phdTNuOTM3eHo3amFrbDMiLCJyZWdpc3RyYXRpb25fcHJvdmlkZXIiOiJyZWdpc3RyYXRpb24uZXhhbXBsZS5jb20ifQ.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo"
}

  ```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "client_id": "3klaxu838akahf38acucaix73",
  "client_id_issued_at": 1418423102,
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "redirect_uris": [
    "https://client.example.com/callback",
    "https://client.example.com/cb"
  ],
  "token_endpoint_auth_method": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "grant_types": [
    "implicit", 
    "authorization_code",
    "refresh_token"
  ],
  "response_types": [
    "token",
    "code" 
  ],
  "client_name": "Example OADA Client",
  "client_uri": "http://example.com",
  "logo_uri": "http://example.com/logo.png",
  "contacts": [
    "Clint Client <cclient@example.com>"
  ],
  "tos_uri": "http://example.com/tos.html",
  "policy_uri": "http://example.com/policy.html",
  "software_id": "djxkjau3n937xz7jakl3",
  "registration_provider": "registration.example.com"
}
```

**Step 3**: The application dynamically registers itself with the provider by
making a POST request with it's client registration document to
`registration_endpoint`.

**Request**
```http
POST /register HTTP/1.1
Host: identity.example.org
Accept: application/json

{
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "software_statement": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vY2xpZW50LmV4YW1wbGUuY29tL2NhbGxiYWNrIiwiaHR0cHM6Ly9jbGllbnQuZXhhbXBsZS5jb20vY2IiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJpbXBsaWNpdCIsImF1dGhvcml6YXRpb25fY29kZSIsInJlZnJlc2hfdG9rZW4iXSwicmVzcG9uc2VfdHlwZXMiOlsidG9rZW4iLCJjb2RlIl0sImNsaWVudF9uYW1lIjoiRXhhbXBsZSBPQURBIENsaWVudCIsImNsaWVudF91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20iLCJsb2dvX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS9sb2dvLnBuZyIsImNvbnRhY3RzIjpbIkNsaW50IENsaWVudCA8Y2NsaWVudEBleGFtcGxlLmNvbT4iXSwidG9zX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MuaHRtbCIsInBvbGljeV91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20vcG9saWN5Lmh0bWwiLCJqd2tzX3VyaSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vandrcyIsInNvZnR3YXJlX2lkIjoiZGp4a2phdTNuOTM3eHo3amFrbDMiLCJyZWdpc3RyYXRpb25fcHJvdmlkZXIiOiJyZWdpc3RyYXRpb24uZXhhbXBsZS5jb20ifQ.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo"
}

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "client_id": "3klaxu838akahf38acucaix73",
  "client_id_issued_at": 1418423102,
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "redirect_uris": [
    "https://client.example.com/callback",
    "https://client.example.com/cb"
  ],
  "token_endpoint_auth_method": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "grant_types": [
    "implicit", 
    "authorization_code",
    "refresh_token"
  ],
  "response_types": [
    "token",
    "code" 
  ],
  "client_name": "Example OADA Client",
  "client_uri": "http://example.com",
  "logo_uri": "http://example.com/logo.png",
  "contacts": [
    "Clint Client <cclient@example.com>"
  ],
  "tos_uri": "http://example.com/tos.html",
  "policy_uri": "http://example.com/policy.html",
  "software_id": "djxkjau3n937xz7jakl3",
  "registration_provider": "registration.example.com"
}
```

**Step 4**: The application then initiates the OpenID Connect implicit flow by
either popping up a pop-up window or redirecting Andy's user-agent.  The request
is a GET on the resource in the `authorization_endpoint` key from
`openid-configuration` document above.

**Request**
```http
GET /auth?response_type=id_token%40token&client_id=3klaxu838akahf38acucaix73&state=xyz&nonce=XJds9a7cAesf&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb&scope=openid%40profile HTTP/1.1
Host: identity.example.org

```
*The response pends until step 6*

Where the request parameters are,

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| response_type   | id_token token | Start the implicit flow for an OpenID Connect id_token. The token is used to access the `UserInfo` endpoint of OpenID Connect to gather Andy's profile information. |
| client_id       | 3klaxu838akahf38acucaix73 | The application's client id received from dynamic client registration. |
| state           | xyz   | A string for the client to recover its state after the OpenID Connect flow completes. It is also used to prevent cross-site request forgery attacks.  |
| nonce           | XJds9a7cAesf | A string used to associate the client session with an id token and to mitigate replay attacks. The value should always be passed through the flow unchanged and the request should be considered invalid if a change occurs. |
| redirect_uri    | https://client.example.org/cb | The URL which Andy's user-agent is redirected to after the OpenID Connect flow is complete. The id_token is delivered to the client via this redirect. Its value must match an entry in the `redirectUrls` key from the client's registration. |
| scope           |  openid profile | OpenID Connect requires the `openid` scope be present. The `profile` scope represents the application requesting basic identity profile information (username, real name, etc). See the [OpenID Connect Specifications][openid-connect] for more details. |

**Step 5**: `identity.example.org` discovers the requesting client and verifies
the OpenID Connect request parameters. In particular the redirect URL must match
an entry in the `redirectUrls` key from the client's registration.

**Step 6**: Step 3's request is completed with a response of a page that
challenges Andy to login with his credentials. Frank successfully logs in.

The login credentials could either be for a local account at
`identity.example.org` (in this case 'andy') or for an OADA federated identity.
At some point it must end at single domain where the user logs in with a local
account. If Andy does select to login with an OADA federated identity then
`identity.example.org` should pause the current OpenID Connect flow and begin a
new [OpenID Connect Flow][openid-connect-flows] flow as a *client* with Andy's
second identity provider. If that flow results in a valid ID token then
`identity.example.org` should resume the original OpenID Connect flow and
consider Andy logged into `identity.example.org` as the identity within the ID
token.

**Step 7**: `identity.example.org` returns the authorization grant screen in
which the requested scopes, client license(s) and PUC, etc. are presented to the
user with a choice to allow or deny. In this case Andy is allowing (or not) the
client to access his identity information. Andy approves the authorization.

**Step 8**: `identity.example.org` generates an ID Token for Andy and redirects
Andy's user-agent back the `redirect_uri` from the initial request with the id
token and other details in the fragment.

**Response**
```http
HTTP/1.1 302 Found
Location: https://client.example.org/cb#access_token=2YotnFZFEjr1zCsicMWpAA&state=xyz&token_type=bearer&expires_in=3600&id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtqY1NjamMzMmR3SlhYTEpEczNyMTI0c2ExIn0.eyJpYXQiOjE0MTg2NzY0MzAsImV4cCI6MTQxODY4MDAzMCwiYXVkIjoiM2tsYXh1ODM4YWthaGYzOGFjdWNhaXg3M0BpZGVudGl0eS5vYWRhLWRldi5jb20iLCJpc3MiOiJodHRwczovL2lkZW50aXR5Lm9hZGEtZGV2LmNvbSIsInN1YiI6MX0.SZGoDLalL5Kvabuw3EGdeShrHJWghJ8U5cTzqc0fNDt-bCYYG5bhgODkuBel4NLyOtusI9gW2LMYuSWCaNjddxkFP0eIT43Ij_w71eUMGPZNYPj2OpMupq77FsR5XttgIynF-ErtZlp9t0Ff1rnSjZKIQ-DoSCcoyPtiKLuHicg
```

*Hint: http://jwt.io can be used to view the id_token*

where the fragment parameters are

| Fragment Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| access_token    | 2YotnFZFEjr1zCsicMWpAA | The access token for the OpenID Connect `/UserInfo` endpoint.  |
| state           | xyz   | The state value from the original request so that the client can recover from the redirect. |
| token_type      | bearer | The access token is a bearer token. |
| expires_in      | 3600   | The number of seconds that access token will remain valid |
| id_token        | < Base64URL encoded JWT > | The identity assertion from the identity provider in the form of a JWT |

**Step 9**: Verify the ID Token.

The JWT is a standard JWS and should be verified according the [JWT][jwt] and
[JWS][jws] specifications. The [JWK][jwk] in which the public keys to verify the
ID Token can be found are located at the HTTP resource linked to by the
`jwks_uri` key in the `identity.example.org` `openid-configuration` document.

If the ID Token validates correctly then the key `sub` within the ID Token's
body is the unique ID for Andy at `identity.example.org`.

**Step 10**: Access Andy's profile data (if requested and authorized).

```http
GET /userinfo HTTP/1.1
Host: identity.example.org
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

**Step 1**: Andy chooses to log into his application at `client.example.org`
with his federated identity `andy@identity.example.org`.

**Step 2**: The application retrieves the `identity.example.org`
`openid-configuration` document to discover the necessary OpenID Connect
endpoints.

**Request**
```http
GET /.well-known/openid-configuration HTTP/1.1
Host: identity.example.org
Accept: application/json

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "issuer": "https://identity.example.org",
  "registration_endpoint": "https://identity.example.org/register",
  "authorization_endpoint": "https://identity.example.org/auth",
  "token_endpoint": "https://identity.example.org/token",
  "userinfo_endpoint": "https://identity.example.org/userinfo",
  "jwks_uri": "https://identity.example.org/certs",
  "response_types_supported": [
    "code",
    "token",
    "id_token",
    "code token",
    "code id_token",
    "token id_token",
    "code token id_token"
  ],
  "subject_types_supported": [
    "public"
  ],
  "id_token_alg_values_supported": [
    "RS256"
  ],
  "token_endpoint_auth_methods_supported": [
    "client_secret_post"
  ]
}
```

**Step 3**: The application dynamically registers itself with the provider by
making a POST request with it's client registration document to
`registration_endpoint`.

**Request**
```http
POST /register HTTP/1.1
Host: identity.example.org
Accept: application/json

{
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "software_statement": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vY2xpZW50LmV4YW1wbGUuY29tL2NhbGxiYWNrIiwiaHR0cHM6Ly9jbGllbnQuZXhhbXBsZS5jb20vY2IiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJpbXBsaWNpdCIsImF1dGhvcml6YXRpb25fY29kZSIsInJlZnJlc2hfdG9rZW4iXSwicmVzcG9uc2VfdHlwZXMiOlsidG9rZW4iLCJjb2RlIl0sImNsaWVudF9uYW1lIjoiRXhhbXBsZSBPQURBIENsaWVudCIsImNsaWVudF91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20iLCJsb2dvX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS9sb2dvLnBuZyIsImNvbnRhY3RzIjpbIkNsaW50IENsaWVudCA8Y2NsaWVudEBleGFtcGxlLmNvbT4iXSwidG9zX3VyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MuaHRtbCIsInBvbGljeV91cmkiOiJodHRwOi8vZXhhbXBsZS5jb20vcG9saWN5Lmh0bWwiLCJqd2tzX3VyaSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vandrcyIsInNvZnR3YXJlX2lkIjoiZGp4a2phdTNuOTM3eHo3amFrbDMiLCJyZWdpc3RyYXRpb25fcHJvdmlkZXIiOiJyZWdpc3RyYXRpb24uZXhhbXBsZS5jb20ifQ.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo"
}

```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "client_id": "3klaxu838akahf38acucaix73",
  "client_id_issued_at": 1418423102,
  "software_version": "1.0-ga",
  "scopes": "read:planting.prescriptions write:fields",
  "redirect_uris": [
    "https://client.example.com/callback",
    "https://client.example.com/cb"
  ],
  "token_endpoint_auth_method": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "grant_types": [
    "implicit", 
    "authorization_code",
    "refresh_token"
  ],
  "response_types": [
    "token",
    "code" 
  ],
  "client_name": "Example OADA Client",
  "client_uri": "http://example.com",
  "logo_uri": "http://example.com/logo.png",
  "contacts": [
    "Clint Client <cclient@example.com>"
  ],
  "tos_uri": "http://example.com/tos.html",
  "policy_uri": "http://example.com/policy.html",
  "software_id": "djxkjau3n937xz7jakl3",
  "registration_provider": "registration.example.com"
}
```

**Step 4**: The application then initiates the OpenID Connect code
flow by either popping up a pop-up window or redirecting Andy's user-agent.  The
request is a GET on the resource in the `authorization_endpoint` key from
`openid-configuration` document above.

**Request**
```http
GET /auth?response_type=code&client_id=3klaxu838akahf38acucaix73&state=xyz&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb&scope=openid%40profile HTTP/1.1
Host: identity.example.org

```
*The response pends until step 6*

Where the request parameters are,

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| response_type   | code | Start the code flow for an OpenID Connect id_token. The token is used to access the `UserInfo` endpoint of OpenID Connect to gather Andy's profile information. |
| client_id       | 3klaxu838akahf38acucaix73 | The application's client id received from dynamic client registration. |
| state           | xyz   | A string for the client to recover its state after the OpenID Connect flow completes. It is also used to prevent cross-site request forgery attacks.  |
| redirect_uri    | https://client.example.org/cb | The URL which Andy's user-agent is redirected to after the OpenID Connect flow is complete. The id_token is delivered to the client via this redirect. Its value must match an entry in the `redirectUrls` key from the client's registration. |
| scope           |  openid profile | OpenID Connect requires the `openid` scope be present. The `profile` scope represents the application requesting basic identity profile information (username, real name, etc). See the [OpenID Connect Specifications][openid-connect] for more details. |

**Step 5**: `identity.example.org` discovers the requesting client and verifies
the OpenID Connect request parameters. In particular the redirect URL must match
an entry in the `redirectUrls` key from the client's registration.

**Step 6**: Step 3's request is completed with a response of a page that
challenges Andy to login with his credentials. Frank successfully logs in.

The login credentials could either be for a local account at
`identity.example.org` (in this case 'andy') or for an OADA federated identity.
At some point it must end at single domain where the user logs in with a local
account. If Andy does select to login with an OADA federated identity then
`identity.example.org` should pause the current OpenID Connect flow and begin a
new [OpenID Connect Flow][openid-connect-flows] flow as a *client* with Andy's
second identity provider. If that flow results in a valid ID token then
`identity.example.org` should resume the original OpenID Connect flow and
consider Andy logged into `identity.example.org` as the identity within the ID
token.

**Step 7**: `identity.example.org` returns the authorization grant screen in
which the requested scopes, client license(s) and PUC, etc. are presented to the
user with a choice to allow or deny. In this case Andy is allowing (or not) the
client to access his identity information. Andy approves the authorization.

**Step 8**: `identity.example.org` generates a code and redirects Andy's
user-agent back the `redirect_uri` from the initial request.

**Response**
```http
HTTP/1.1 302 Found
Location: https://client.example.org/cb?code=5MZVZOgNV-nh3brHM78UoaJ-w&state=xyz
```

where the fragment parameters are

| Query Parameter | Value | Meaning |
| --------------- | ----- | ------- |
| code            | 5MZVZOgNV-nh3brHM78UoaJ-w | The code for the approved authorization. |
| state           | xyz   | The state value from the original request so that the client can recover from the redirect. |

**Step 9**: The intermediate server for `client.example.org` which is hosting
the application parses the code and state from the GET request query parameters
and makes an out-of-band POST request to the `identity.example.org`
`token_endpoint` from the `openid-configuration` document.

The provider should validate the request as specified by [OpenId
Connect][openid-connect] with the extra requirements that the client assertion JWT
validates against a public key from client registration document, is valid by
the JWT standard, and contains an ac key equal to the access code in the body.

**Request**
```http
POST /token HTTP/1.1
Host: identity.example.org
Accept: application/json
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=5MZVZOgNV-nh3brHM78UoaJ-w&redirect_uri=https%3A%2F%2Fclient.example.org%2Fredirect&client_id=3klaxu838akahf38acucaix73%40identity.example.org&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJqdGkiOiJQaTJkWS1GQnhacUx4ODFsVGJETTRXR2xJIiwiaWF0IjoxNDE4NDIxMTAyLCJhdWQiOiJodHRwczovL3Byb3ZpZGVyLm9hZGEtZGV2LmNvbS90b2tlbiIsImlzcyI6IjNrbGF4dTgzOGFrYWhmMzhhY3VjYWl4NzNAaWRlbnRpdHkub2FkYS1kZXYuY29tIn0.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo
```

*Hint: http://jwt.io can be used to view the client assertion*

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

*Hint: http://jwt.io can be used to view the id_token*

**Step 10**: Verify the ID Token.

The JWT is a standard JWS and should be verified according the [JWT][jwt] and
[JWS][jws] specifications. The [JWK][jwk] in which the public keys to verify the
ID Token can be found are located at the HTTP resource linked to by the
`jwks_uri` key in the `identity.example.org` `openid-configuration` document.

If the ID Token validates correctly then the key `sub` within the ID Token's
body is the unique ID for Andy at `identity.example.org`.

**Step 11**: Access Andy's profile data (if requested and authorized).

```http
GET /userinfo HTTP/1.1
Host: identity.example.org
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

[openid-connect-flows]: #openid-connect-examples-authentication
[discovering-a-client]: #discovering-a-client-from-a-clientid
[oauth2-rfc6749]: https://tools.ietf.org/rfc/rfc6749.txt
[dyn-client-reg]: https://tools.ietf.org/id/draft-ietf-oauth-dyn-reg.txt
[jwt-bearer]: https://tools.ietf.org/id/draft-ietf-oauth-jwt-bearer.txt
[openid-connect]: http://openid.net/specs/openid-connect-core-1_0.html
[openid-dyn-client-reg]: http://openid.net/specs/openid-connect-registration-1_0.html
[well-known-oada-configuration-docs]:  https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-Discovery-Endpoints.md#well-knownoada-configuration
[well-known-openid-configuration-docs]:  https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-Discovery-Endpoints.md#well-knownopenid-configuration
[client-discovery-endpoint-docs]:  https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-Discovery-Endpoints.md#clientdiscovery
[jwt]: https://tools.ietf.org/id/draft-ietf-oauth-json-web-token.txt
[jws]: https://tools.ietf.org/id/draft-ietf-jose-json-web-signature.txt
[jwa]: https://tools.ietf.org/id/draft-ietf-jose-json-web-algorithms.txt
[jwk]: https://tools.ietf.org/id/draft-ietf-jose-json-web-key.txt
