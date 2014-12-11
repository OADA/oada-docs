# OADA Discovery Endpoints

* [`/.well-known`](#user-content-well-known)

# `/.well-known`

`/.well-known` allows an application to automatticly discover the details of an
OADA compliant API. For example, it can use it to locate the API's base URI for
a particular domain or discover the authencation and client discovery endpoints.
It follows
[RFC 5785 Defining Well-Known Uniform Resource Identifiers (URIs)][rfc5785].

This endpoint MUST exist at the root of a clouds' domain or subdomain. For
example, if a cloud wants to be known as agcloud.com then `.well-known` MUST be
found at: `agcloud.com/.well-known`. The API MAY be hsoted at another domain or
sub-domain as along the well-known documents are correctly configured.

## `/.well-known/oada-configuration`

Used to discovery any OADA API global details, such as the OADA API base URI,
authorization and token endpoints to gain an OADA token, and if and where the
provider hosts OADA client discovery.

### Example `/.well-known/oada-configuration` document

```http
GET /.well-known/oada-configuration HTTP/1.1
Host: agcloud.com
Content-Type: application/json

{
    "authorization_endpoint": "http://id.openag.io/connect/authorize",
    "token_endpoint": "http://api.agcloud.com/connect/token",
    "oada_base_uri": "https://api.agcloud.com",
    "client_discovery": "https://api.agcloud.com/clientDiscovery"
}
```
## `/.well-known/openid-configuration`

Standard OpenID Connect discovery document. It is optional for OpenID Connect
but required by OADA.
[Open ID Connect Discovery 1.0 Standard][oidc-openid-configuration]

### Example `/.well-known/openid-configuration` document

```http
GET /.well-known/openid-configuration HTTP/1.1
Host: agcloud.com
Content-Type: application/json

{
    "issuer": "https://api.agcloud.com",
    "authorization_endpoint": "https://api.agcloud.com/connect/authorize",
    "token_endpoint": "https://api.agcloud.com/connect/token",
    "token_endpoint_auth_methods_supported": ["client_secret_basic", "private_key_jwt"],
    "token_endpoint_auth_signing_alg_values_supported": ["RS256", "ES256"],
    "userinfo_endpoint": "https://api.agcloud.com/connect/userinfo",
    "check_session_iframe": "https://api.agcloud.com/connect/check_session",
    "end_session_endpoint": "https://api.agcloud.com/connect/end_session",
    "jwks_uri": "https://api.agcloud.com/jwks.json",
    "registration_endpoint": "https://api.agcloud.com/connect/register",
    "scopes_supported": ["openid", "resources", "groups", "config"],
    "response_types_supported": ["code", "code id_token", "id_token", "token id_token"],
    "acr_values_supported": ["urn:mace:incommon:iap:silver","urn:mace:incommon:iap:bronze"],
    "subject_types_supported": ["public", "pairwise"],
    "userinfo_signing_alg_values_supported": ["RS256", "ES256", "HS256"],
    "userinfo_encryption_alg_values_supported": ["RSA1_5", "A128KW"],
    "userinfo_encryption_enc_values_supported": ["A128CBC-HS256", "A128GCM"],
    "id_token_signing_alg_values_supported": ["RS256", "ES256", "HS256"],
    "id_token_encryption_alg_values_supported": ["RSA1_5", "A128KW"],
    "id_token_encryption_enc_values_supported": ["A128CBC-HS256", "A128GCM"],
    "request_object_signing_alg_values_supported": ["none", "RS256", "ES256"],
    "display_values_supported": ["page", "popup"],
    "claim_types_supported": ["normal", "distributed"],
    "claims_supported": ["sub", "iss", "auth_time", "name", "picture", "email", "account"],
    "claims_parameter_supported": true,
    "service_documentation": "http://api.agcloud.com/connect/service_documentation.html",
    "ui_locales_supported": ["en-US"]
}
```

[rfc5785]: http://www.ietf.org/rfc/rfc5785.txt
[oidc-openid-configuration]: http://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationResponse
