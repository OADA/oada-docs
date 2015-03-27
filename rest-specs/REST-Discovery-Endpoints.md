# Table of Contents

- [`/.well-known`](#well-known)
  - [`/.well-known/oada-configuration`](#well-knownoada-configuration)
    - [Parameters](#parameters)
    - [Example](#example)
  - [`/.well-known/openid-configuration`](#well-knownopenid-configuration)
    - [Example](#example-1)

# `/.well-known`

OADA leverages the `/.well-known` URI path prefix defined by [RFC 5785 -
Defining Well-Known Uniform Resource Identifiers (URIs)][rfc5785] to enable
client bootstrapping. That is, a client SHOULD discover all the necessary
details of an OADA compliant API by consulting the well-known documents hosted
under the provider's public domain/sub-domain.

For example, let AgCloud be an OADA compliant provider that wishes to use
`agcloud.com` as its public OADA domain. However, internal business requirements
of AgCloud mandated that the API root be `oada.agcloud.com/v1`. As long as the
required `/.well-known` documents, with entries reflecting the actual API root,
are found  under`agcloud.com/.well-known`, a client can seamlessly discover and
use AgCloud's OADA API from nothing but the public domain.

The public "domain" of a provider MAY include sub-domains and path components.
For example, `agcloud.com`, `oada.agcloud.com`, `agcloud.com/oada`, and
`api.agcloud.com/oada` are all valid public domains given that the
`/.well-known` documents are found at `agcloud.com/.well-known`,
`oada.agcloud.com/.well-known`, `agcloud.com/oada/.well-known`, and
`api.agcloud.com/oada/.well-known`, respectively.

## `/.well-known/oada-configuration`

The `oada-configuration` well-known document describes the location and
supported features of the associated OADA API. Note, the key/values found in
this document may be well understood by other standards, e.g., OAuth 2.0 and
OpenID Connect, but defined here because their values are specific to the
particular instance of the OADA API.

### Parameters

- `oada_base_uri` (**String** *Valid absolute https URI*)  
  *REQUIRED*. The provider's associated OADA API base URI. All required OADA
  endpoints must reside under this root.

- `authorization_endpoint` (**String** *Valid absolute https URI*)  
  *REQUIRED*. The provider's OAuth 2.0 authorization endpoint for the associated
  OADA API. *Note: This key is inspired from [OpenId Connect
  Discovery][oidc-discovery]*


- `token_endpoint` (**String** *Valid absolute https URI*)  
  *REQUIRED*. The provider's OAuth 2.0 token endpoint for the associated OADA
  API. *Note: This key is inspired from [OpenId Connect
  Discovery][oidc-discovery]*


- `registration_endpoint` (**String** *Valid absolute https URI*)  
  *REQUIRED*. The provider's OAuth 2.0 [Dynamic Client
  Registration][oauth-dyn-reg] endpoint for the associated OADA API.  *Note:
  This key is inspired from [OpenId Connect Discovery][oidc-discovery]*

- `token_endpoint_auth_signing_alg_values_supported` (**Array[String]**)  
  *REQUIRED*. List of JWT signing algorithms that a client may use to sign an
  OAuth 2.0 client assertion ([JSON Web Token (JWT) Profile for OAuth
  2.0 Client Authentication and Authorization Grants][jwt-bearer]). The
  allowable values for this field are the same as those defined for the alg
  JWS header parameter in [JSON Web Algorithms (JWA)][jwa]. A provider MUST
  support RS256. *Note: This key is inspired from [OpenId Connect
  Discovery][oidc-discovery]*

### Example

```http
GET /.well-known/oada-configuration HTTP/1.1
Host: example.org
Content-Type: application/json

{
  "oada_base_uri": "https://api.example.org/v1",
  "authorization_endpoint": "https://example.org/auth",
  "token_endpoint": "https://example.org/token",
  "registration_endpoint": "https://example.org/register",
  "token_endpoint_auth_signing_alg_values_supported": [
    "RS256"
  ]
}
```

## `/.well-known/openid-configuration`

The `openid-configuration` well-known document describes the location and
supported features of an OpenID Connect server. Its contents are defined by
[Open ID Connect Discovery Specifications][oidc-openid-configuration].

The `/.well-known/openid-configuration` portions of the OpenID Connect Discovery
is upgraded from OPTIONAL to REQUIRED. The [OpenID Connect Discovery
Specifications][oidc-openid-configuration] should be consulted for the  specific
requirements with the following exceptions:

1. `registration_endpoint` parameter is upgraded from RECOMMENDED to REQUIRED.

### Example

```http
GET /.well-known/openid-configuration HTTP/1.1
Host: example.org
Content-Type: application/json

{
  "issuer": "https://example.org",
  "authorization_endpoint": "https://example.org/auth",
  "token_endpoint": "https://example.org/token",
  "registration_endpoint": "https://example.org/register",
  "userinfo_endpoint": "https://example.org/userinfo",
  "jwks_uri": "https://example.org/certs",
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
  ]
}
```

[rfc5785]: http://www.ietf.org/rfc/rfc5785.txt
[oidc-openid-configuration]: http://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationResponse
[oidc-discovery]: http://openid.net/specs/openid-connect-discovery-1_0.html
[jwt-bearer]: https://tools.ietf.org/id/draft-ietf-oauth-jwt-bearer.txt
[jwa]: https://tools.ietf.org/id/draft-ietf-jose-json-web-algorithms.txt
[jwks]: https://tools.ietf.org/id/draft-ietf-jose-json-web-key.txt
[oauth-dyn-reg]: https://tools.ietf.org/id/draft-ietf-oauth-dyn-reg.txt
