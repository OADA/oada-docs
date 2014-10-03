# OADA API Endpoint Overview

* [`/resources`](#user-content-resources)
* [`/configurations`](#user-content/configurations)
* [`/about`](#user-content-about)
* [`/users`](#user-content-users)
* [`/groups`](#user-content-groups)
* [`/authorizations`](#user-content-authorizations)
* [`/.well-known`](#user-content-well-known)

# `/resources`

## `/resources/{resourceId}`

OADA's `/resources` are the meat of the OADA API and are also the most
complex. It's responsibilities include:

- Storing all data: binary files, JSON documents, etc.
- Storing user defined metadata about the resource.
- Transform and represent data in multiple formats.
- Organize the data in a parent/child structure (think Google Drive).
- Share data with other users.

In order to accomplish these tasks with more ease, the following
endpoints beneath `/resources/{resourceId}` are defined:
- `/data`
- `/meta`
- `/formats`
- `/parents`
- `/children`
- `/permissions`
- `/syncs`

All of the above endpoints return a JSON document except for `/data`, which may
be any media type.

### Example `/resource/{resourceId}` document

The following example is an "expanded" version of document. This means that
`href` keys are resolved and included embedded in result. Therefore, the
response documents for the `/resources/{resourceId}` sub-endpoints are also
shown.

```json
{
    "href": "https://api.agcloud.com/resources/ixm24ws",
    "etag": "lajscfa938f23fuj8x",
    "name": "Frank's Yield",
    "mimeType": "application/vnd.oada.yield+json",
    "created": "1985-04-12T23:20:50.52Z",
    "createdBy": {
        "href": "https://api.agcloud.com/users/kdufe3f",
        "account": "frank@agidentity.com",
        "name": "Frank Fellow",
        "picture": {
            "href": "http://www.gravatar.com/avatar/c7e1ee573f"
        },
        "email": "frank@agcloud.com"
    },
    "modified": "1985-04-12T23:20:50.52Z",
    "modifiedBy": {
        "href": "https://api.agcloud.com/users/kdufe3f",
        "account": "frank@agidentity.com",
        "name": "Frank Fellow",
        "picture": {
            "href": "http://www.gravatar.com/avatar/c7e1ee573f"
        },
        "email": "frank@agcloud.com"
    },
    "data": {
        "href": "https://api.agcloud.com/resources/ixm24ws/data",
        "etag": "aj3ja8ecuidshfaifx",
        "totalYield": {
            "value": 5.6,
            "unit": "bushel"
        },
        "type": "FeatureCollection",
        "bbox": [40.42426718029455, 40.42429718029455, -86.841822197086, -86.841852197086],
        "features": [{
               "....": "...."
        }]
    },
    "meta": {
        "href": "https://api.agcloud.com/resources/ixm24ws/meta",
        "etag": "ewiudfaw82y3udhcxz",
        "totalYield": {
            "value": 5.6,
            "unit": "bushel"
        }
    },
    "formats": {
        "href": "https://api.agcloud.com/resources/ixm24ws/format",
        "etag": "iafueic9jcklhvcyfa",
        "transforms": {
            "application/vnd.oada.yield+json": {
                "original": true,
                "lossy": false,
                "name": "OADA GeoJSON Yield Open Format",
                "openFormat": true
            },
            "application/json": {
                "lossy": false,
                "name": "JavaScript Object Notation",
                "openFormat": false
            },
            "application/netcdf": {
                "lossy": false,
                "name": "Network Common Data Form",
                "openFormat": true
            },
            "application/shape": {
                "lossy": false,
                "name": "Esri Shapefile",
                "openFromat": false
            }
        }
    },
    "parents": {
        "href": "https://api.agcloud.com/resources/ixm24ws/parents",
        "etag": "oui9032uc8y78a9chx",
        "items": [{
            "href": "https://api.agcloud.com/resources/ixm24ws/parents/me30fzp",
            "resource": {
                "href": "https://api.agcloud.com/resources/me30fzp"
            }
        },
        {
            "href": "https://api.agcloud.com/resources/ixm24ws/parents/me30fzp",
            "resource": {
                "href": "https://api.agcloud.com/resources/me30fzp"
            }
        }]
    },
    "children": {
        "href": "https://api.agcloud.com/resources/ixm24ws/children",
        "etag": "asjc93uciasduf3jxj",
        "items": [{
            "href": "https://api.agcloud.com/resources/ixm24ws/children/kl3j93s",
            "resource": {
                "href": "https://api.agcloud.com/resources/kl3j93s"
            }
        },
        {
            "href": "https://api.agcloud.com/resources/ixm24ws/parents/op302xa",
            "resource": {
                "href": "https://api.agcloud.com/resources/op302xa"
            }
        }]
    },
    "permissions": {
        "href": "https://api.agcloud.com/resources/ixm24ws/permissions",
        "etag": "cvxfj23fjr9ifu932f",
        "items": [{
            "href": "https://api.agcloud.com/resources/ixm24ws/permissions/kdufe3f",
            "user": {
                "href": "https://api.agcloud.com/users/idnmz83",
                "account": "frank@agidentity.com",
                "name": "Frank Fellow",
                "picture": {
                    "href": "http://www.gravatar.com/avatar/c7e1ee573f"
                },
                "email": "frank@agcloud.com"
            },
            "type": "user",
            "level": "owner"
        }]
    },
    "syncs": {
        "href": "https://api.openag.io/resources/ixm24ws/syncs",
        "etag": "kj3idua8c78dji3weauowfusofgcykjhaelwr38d",
        "items": [{
            "href": "https://api.openag.io/resources/ixm24ws/syncs/2xf382s",
            "etag": "cjkawq8327r4ifhjuihdvfaewytr43kj5haief7a",
            "type": "poll",
            "url": "https://api.agcloud.com/resources/jdkx82d",
            "headers": {
                "X-Custom": "Custom Value"
            },
            "latest_etag": "d3fc9278c677bdb7af3781a1ebc2ec090c14f5f3",
            "interval": 3600,
            "authorization": {
                "href": "https://api.openag.io/authorizations/8ackam3"
            }
        }, {
            "href": "https://api.openag.io/resources/ixm24ws/syncs/2xf382s",
            "etag": "cjkawq8327r4ifhjuihdvfaewytr43kj5haief7a",
            "type": "push",
            "url": "https://api.agcloud.com/resources/jdkx82d",
            "headers": {
                "X-Custom": "Custom Value"
            },
            "events": ["change"],
            "authorization": {
                "href": "https://api.openag.io/authorizations/8ackam3"
            }
        }]
    }
}
```

# `/configurations`

## `/configurations/{key 1}/.../{key N}`

- OADA's `/configurations` allow API consumers to automatically discover interesting
  resources without having to search them all manually.
- Configurations can only store `href`'s to resources and other lower level
  configurations.
- The number of levels of keys is abritary.
- To improve interoperability between clouds, applications, and devices, OADA
  will define a standard set of configuration keys. For example,
    - /configurations/fields
    - /configurations/seeds
    - /configurations/prescriptions/planting
    - /configurations/prescriptions/fertilizing
    - etc.

### Example `/configurations` document

```json
{
    "href": "https://api.agcloud.com/configurations",
    "etag": "jd983954u7tu90t7dx",
    "items": {
        "fields": {
            "href": "https://api.agcloud.com/configurations/fields"
        },
        "prescriptions": {
            "href": "https://api.agcloud.com/configurations/prescriptions"
        }
    },
    "resource": {
        "href": "https://api.agcloud.com/resources/fd8as8c"
    }
}
```

# `/users`

## `/users/{userId}`

- OADA's `/users` allow API consumers to discover details of any *known* user's
  real personal identity, such as:
    - Real name
    - Email
    - Avatar
- Knowledge of personal identity makes sharing a lot nicer.
    - A user can see a picture and real name of another *before* sharing data.
- A user becomes *known* to you when:
    - It is local to the cloud and its profile is "public".
    - It has previously shared files with you.
- A cloud  can not return real identity information for a particular federated
  identity until it logs into the cloud.
    - Later versions of OADA may consider user discovery across the federation.

### Example `/users/{userId}` document

```json
{
    "href": "https://api.agcloud.com/users/kdufe3f",
    "etag": "a98345kjgfvjvcvkrc",
    "account": "frank@agidentity.com",
    "name": "Frank Fellow",
    "picture": {
        "url": "http://www.gravatar.com/avatar/c7e1ee573fc6b0956a4455560d5839d9"
    },
    "email": "frank@agcloud.com"
}
```

# `/about`

- OADA's `/about` allows API consumers to discover the currently logged in user
  and any information needed to "bootstrap" the application or device.
    - "Bootstrapping" is the application or device discovering the necessary
      information to show the user a reasonable first screen.
        - For example, locating the resource which is the top most parent of all
          other resources.

### Example `/about` document

```json
{
    "href": "https://api.agcloud.com/about",
    "etag": "ajs938r8c87au4t3jm",
    "rootResource": {
        "href": "https://api.agcloud.com/resources/jx9j3x8"
    },
    "currentUser": {
        "href": "https://api.agcloud.com/users/kdufe3f"
    }
}
```

# `/groups`
## `/groups/{groupId}`

- OADA's `/groups` allows an API consumer to create and manage groups of users.
- Groups can be used to allocate resource permissions more flexibly.
    - For example, users can be added to a group at any time and all previously
      shared files are automatically accessible.

### Example `/groups/{groupId}` document

```json
{
    "href": "https://api.agcloud.com/groups/jf72jsd",
    "etag": "kjasfd9c7ua3c772rx",
    "name": "Employees",
    "members": [{
        "href": "https://api.agcloud.com/users/kdufe3f"
    },
    {
        "href": "https://api.openagi.io/users/3jkxi82"
    }]
}
```

# `/authorizations`
## `/authorizations/{authorizationId}`

- OADA's `/authorizations` allows an API consumer to create and manage
  authorizations for a third party.
- Currently it is meant to manage OAuth 2.0 tokens, but could hypothetically
  manage any type of authorization.

### Example `/authorizations/{authorizationId}` document

```json
{
    "href": "https://api.agcloud.com/authorizations/8ackam3",
    "etag": "fkjasdc9772893r7ex",
    "user": {
        "href": "https://api.agcloud.com/users/fjf23cd"
    },
    "scope": "resources groups",
    "created": "1985-04-12T23:20:50.52Z",
    "modified": "1985-04-12T23:20:50.52Z",
    "expires": "1985-05-12T23:20:50.52Z"
}
```

# `/.well-known`

- OADA's `/.well-known` allows an API consumer to find the base URI for a
  particular domain's OADA API as well as discover the needed details to
  authorize users.
- This endpoint follows [RFC 5785](http://www.ietf.org/rfc/rfc5785.txt)
- Currently two required documents
    - `/.well-known/oada-configuration` - discover OADA base and authorization
      URI's
    - `/.well-known/openid-configuration` - discover OpenId Connect endpoints
      to initiate a federated idenity assertion

### Example `/.well-known/oada-configuration` document

```json
{
    "authorizationEndpoint": "http://id.openag.io/connect/authorize",
    "tokenEndpoint": "http://api.agcloud.com/connect/token",
    "OADABaseUri": "https://api.agcloud.com"
}
```

### Example `/.well-known/openid-configuration` document

Note: This example document comes directly from the
[Open ID Connect Discovery 1.0 Standard](http://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationResponse)

```json
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
