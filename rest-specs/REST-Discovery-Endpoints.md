# Table of Contents

- [OADA Discovery Endpoints](#oada-discovery-endpoints)
- [`/.well-known`](#well-known)
  - [`/.well-known/oada-configuration`](#well-knownoada-configuration)
    - [Example `/.well-known/oada-configuration` document](#example-well-knownoada-configuration-document)
  - [`/.well-known/oada-client-discovery`](#well-knownoada-client-discovery)
    - [Example `/.well-known/oada-client-discovery` document](#example-well-knownoada-client-discovery-document)
  - [`/.well-known/openid-configuration`](#well-knownopenid-configuration)
    - [Example `/.well-known/openid-configuration` document](#example-well-knownopenid-configuration-document)
- [`/clientDiscovery`](#clientdiscovery)
  - [Request Parameters](#request-parameters)
  - [Response](#response)
  - [Example](#example)

# OADA Discovery Endpoints

OADA has several discovery endpoints that enable the its distributed nature.

# `/.well-known`

`/.well-known` allows an application to automatically discover the details of an
OADA compliant API. For example, it can use it to locate the API's base URI for
a particular domain or discover the authentication and client discovery
endpoints.
It follows
[RFC 5785 Defining Well-Known Uniform Resource Identifiers (URIs)][rfc5785].

This endpoint MUST exist at the root of a clouds' domain or subdomain. For
example, if a cloud wants to be known as agcloud.com then `.well-known` MUST be
found at: `agcloud.com/.well-known`. The API MAY be hosted at another domain or
sub-domain as along the well-known documents are correctly configured.

## `/.well-known/oada-configuration`

Used to discovery any OADA API global details, such as the OADA API base URI,
authorization and token endpoints to gain an OADA token, and if and where the
provider hosts OADA client discovery.

### Example `/.well-known/oada-configuration` document

```http
GET /.well-known/oada-configuration HTTP/1.1
Host: provider.oada-dev.com
Content-Type: application/json

{
  "authorization_endpoint": "https://provider.oada-dev.com/auth",
  "token_endpoint": "https://provider.oada-dev.com/token",
  "oada_base_uri": "https://provider.oada-dev.com"
  "client_secret_alg_supported": [
    "RS256"
  ]
}
```
## `/.well-known/oada-client-discovery`

Used to discovery the client discovery endpoint within a client discovery
provider's domain. It is used by providers when trying to lookup a client
registration.

### Example `/.well-known/oada-client-discovery` document

```http
GET /.well-known/oada-client-discovery HTTP/1.1
Host: identity.oada-dev.com
Content-Type: application/json

{
  "client_discovery": "https://identity.oada-dev.com/clientDiscovery"
}
```

## `/.well-known/openid-configuration`

Standard OpenID Connect discovery document. It is optional for OpenID Connect
but required by OADA.
[Open ID Connect Discovery 1.0 Standard][oidc-openid-configuration]

### Example `/.well-known/openid-configuration` document

```http
GET /.well-known/openid-configuration HTTP/1.1
Host: identity.oada-dev.com
Content-Type: application/json

{
  "issuer": "https://identity.oada-dev.com",
  "authorization_endpoint": "https://identity.oada-dev.com/auth",
  "token_endpoint": "https://identity.oada-dev.com/token",
  "userinfo_endpoint": "https://identity.oada-dev.com/userinfo",
  "jwks_uri": "https://identity.oada-dev.com/certs",
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

# `/clientDiscovery`

Client discovery is used by OADA providers and OADA identity providers to
discover the details of a new client. Please refer to the [OAuth 2.0 and Client
Discovery][oauth2-and-client-discovery] functional spec for details on necessity
and function of this endpoint.

## Request Parameters
| Parameter Name | Type  | Required?   | Description |
| -------------- | ----- | ----------- | ----------- |
| clientId       | GET   | *Required*  | The client ID that is being discovered. The domain of the client ID should match the domain of the `/.well-known/oada-configuration` in which the discovery URI was obtained |

## Response

The response is either a valid [OADA error response][standard-error-response] or
a JSON document with *at least* the following root level keys:

| Key      | Value |
| ------------ | ----- |
| clientId     | The client ID being discovered. |
| redirectUrls | An array of complete URLs in which the provider should allow as redirect URLs during OAuth 2.0 flows. |
| licenses     | An array of objects containing *at least* the license ID and a human readable license name. The supported licenses **must** be presented to the users durring *at least* the OAuth 2.0 flow. |
| keys         | A [JSON Web Key Set (JWK set)][jwk]. It contains the public key portion of all keys currently used by client to generate [JSON Web Tokens][jwt], e.g., when generating a client secret for the OAuth 2.0 code flow. |
| name         | A human readable name for the client. It will be presented to the user during *at least* the OAuth 2.0 flows. |
| contact      | An email in which providers and users can contact the developer of the client. |
| puc          | The URL to the clients published [Privacy and Use Components][puc] or other terms of service and privacy statement. The PUC url **must** be presented to the user during *at least* the OAuth 2.0 flow. If this key is not present a warning **must** be presented to the user in its place. |

## Example

```http
GET /clientDiscovery?clientId=3klaxu838akahf38acucaix73%40identity.oada-dev.com HTTP/1.1
Host: identity.oada-dev.com
Accept: application/json

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
    "alg": "RS256",
    "kid": "nc63dhaSdd82w32udx6v",
    "n": "AKj8uuRIHMaq-EJVf2d1QoB1DSvFvYQ3Xa1gvVxaXgxDiF9-Dh7bO5f0VotrYD05MqvY9X_zxF_ioceCh3_rwjNFVRxNnnIfGx8ooOO-1f4SZkHE-mbhFOe0WFXJqt5PPSL5ZRYbmZKGUrQWvRRy_KwBHZDzD51b0-rCjlqiFh6N",
    "e": "AQAB"
  }
  ],
  "name": "OADA Reference Implementation",
  "contact": "info@openag.io",
  "puc": "https://identity.oada-dev.com/puc.html"
}
```

[rfc5785]: http://www.ietf.org/rfc/rfc5785.txt
[oidc-openid-configuration]: http://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationResponse
[oauth2-and-client-discovery]: https://github.com/OADA/oada-docs/blob/94488f803d03f5932672783f84b36d0bdd4d3a62/functional-specs/OAuth2-and-Client-Discovery.md
[standard-error-response]: https://github.com/OADA/oada-docs/blob/master/rest-specs/Standard-Error.md
[puc]: https://docs.google.com/document/d/1VEStM7_zRfNrRnZtYmCiVfDD2T35wvJZXyQkgPm9FDE/edit
[jwk]: https://tools.ietf.org/id/draft-ietf-jose-json-web-key.txt
[jwt]: https://tools.ietf.org/id/draft-ietf-oauth-json-web-token.txt
