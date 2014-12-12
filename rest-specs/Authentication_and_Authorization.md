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

More details can be found in the [/.well-known endpoint
documentation][well-known-endpoint-docs].

### Client Discovery

Client discovery is used by providers to automatically discover OAuth 2.0 and
other details of a given client. This allows a user to point their favorite
client to their favorite provider without the client having had to register with
the provider beforehand.

More details can be found in the [clientDiscovery endpoint documentation][client-discovery-endpoint-docs]

### Client Secret

During a typical OAuth 2.0 code flow the client is required to trade a code and
sometimes a client secret (undefined string of characters) for an access token.
The client secret is supposed to only be known to the client and provider;
However, in the OADA ecosystem the client and provider often do not know each
other before their first interaction. Therefore, OADA further stipulates that
client secrets take the form of a [JSON Web Tokens (JWT)][jwt] encoded as a
[JSON Web Signature][jws].

#### Requirements on the JWT

Specific details of a JWT and JWS can be found [here][jwt] and [here][jws]
respectively. However, for OADA there are a few requirements, list before:

- The client secret can only be signed using an algorithm listed in the
  `client_secret_alg_supported` key of the provider's `oada-configuration`. RSA
  256 (RS256 in [JSON Web Algorithms][jwa] speak) is required to be supported by
  all clients and providers.
- The JWT body must include an `ac` key and it should be set equal to the
  access code from the OAuth 2.0 code flow. The secret should be considered
  invalid if either the `ac` key is missing or is not set to be equal to access
  code.

#### Example Client Secret

A JWT takes the form:

`base64Url(header) + "." + base64Url(payload) + "." + base64Url(hash)`

where `header` is the token header in JSON, `payload` is the token body in JSON,
and `hash` is the signature of the header appended to payload using the
algorithm described in the `header` all joined together by a period.

An example of a valid RS256 JWS client secret is show below:

`eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5jNjNkaGFTZGQ4MnczMnVkeDZ2In0.eyJhYyI6IlBpMmRZLUZCeFpxTHg4MWxUYkRNNFdHbEkiLCJpYXQiOjE0MTg0MjExMDIsImF1ZCI6Imh0dHBzOi8vcHJvdmlkZXIub2FkYS1kZXYuY29tL3Rva2VuIiwiaXNzIjoiM2tsYXh1ODM4YWthaGYzOGFjdWNhaXg3M0BpZGVudGl0eS5vYWRhLWRldi5jb20ifQ.Te_NzrMTfrMaIldbIPRm5E0MnI1SjBf1G_19MslsJVdDSIUj_9YMloa4iTt_ztuJD4G0IP77AfU2x-XHqTjB8LybDlL8nyDERQhO8KNV3jbPKpKNsndZx5LDGX1XKJNH53IE4GB9Le8CE3TZNdVPxxuJcNi4RGYk0RJtdv6h1bo`

Where the `header` decodes to:
```json
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "nc63dhaSdd82w32udx6v"
}
```
 and the `payload` decodes to:
```json
{
  "ac": "Pi2dY-FBxZqLx81lTbDM4WGlI",
  "iat": 1418421102,
  "aud": "https://provider.oada-dev.com/token",
  "iss": "3klaxu838akahf38acucaix73@identity.oada-dev.com"
}
```

The corresponding public key from the client's registration that is used to
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

Providers are **required** to display the list of licenses and a hyper-linkt to
privacy and use policy (PUC) or similar terms-of-use type document to the user
for any client making an OAuth 2.0 request on the authorization grant screen
(the screen in which the users are presented with an "allow" or "deny" option).
Alternatively a warning should be displayed if the information is provided by
the client. Providers learn this information during client discovery.

#### Example Grant Screen with Licenses and PUC

![Grant screen for a client with published licenses and PUC](authorization_grant_screen_with_puc_and_lic.png)

Note the Privacy and Data Use Principles link and the display of support for the
"OADA" license (a fictions license). OADA does not require any particular
styling of this screen other then the required information is prominently
displayed.

#### Example Grant Screen without PUC

![Grant screen for a client with published licenses but no published PUC](authorization_grant_screen_with_no_puc_and_lic.png)

Note the noticeable warning of no published privacy and data use principles.
OADA does not require any particular styling of this screen other then the
required information is prominently displayed.

#### Example Grant Screen without Licenses

![Grant screen for a client without a published licenses but a published PUC](authorization_grant_screen_with_puc_and_no_lic.png)

Note the noticeable warning of no published supported licenses. OADA does not
require any particular styling of this screen other then the required
information is prominently displayed.


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
  "clientDiscovery": "https://auth.agcloud.com/client",
  "client_secret_alg_supported": [
    "RS256"
  ]
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

[well-known-endpoint-docs]:  https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-Discovery-Endpoints.md#well-knownoada-configuration
[client-discovery-endpoint-docs]:  https://github.com/OADA/oada-docs/blob/master/rest-specs/REST-Discovery-Endpoints.md#clientdiscovery
[jwt]: https://tools.ietf.org/id/draft-ietf-oauth-json-web-token.txt
[jws]: https://tools.ietf.org/id/draft-ietf-jose-json-web-signature.txt
[jwa]: https://tools.ietf.org/id/draft-ietf-jose-json-web-algorithms.txt
