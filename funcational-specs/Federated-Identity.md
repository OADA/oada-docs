# OADA Federated Identity
* Author: Giri Anantharaman
* Reformat and minor edits: Andrew Balmos

OADA is an ecosystem of entities (applications, cloud providers, devices etc.)
that communicate over open APIs that provide access / manipulation to a farmer’s
data, upon farmer’s consent. Federated identity just means OADA entities trust
identities from one another. For example if Andy using an app hosted by
agronomists.com wants access to Frank’s data in agcloud.com, Andy simply asserts
his existing identity (andy / agronomist.com or andy / agronomistidentity.com)
to agcloud.com, to request access. Federated identity does not imply creation of
new identities for existing users. Just asserting existing identities to an OADA
entity that is not their provider.

In the absence of required federated identity, consultants who interact with
many farmers would either need:

* accounts on every OADA cloud that their farmer customers use
* or temporary tokens sent through email used to authenticate every subsequent
  request, with some out-of-band handshakes to allow API access.

## OADA Identity Federation

OADA Identity Federation is made up of all entities that decide to accept
identity assertions from one another. Membership list is maintained by OADA or
an independent third party. OADA Identity Federation Membership implies:

* Right to assert identities to other entities.
* Responsibility to abide by certain practices on data security and privacy
  (details to be determined)

OADA federation membership does not automatically grant access to farmer’s data.
Farmer is the ultimate arbitrar on who gets access to his / her data.

### Summarizing

* A list of OADA-compliant identity providers will be maintained and served
  securely using existing standards for federated identity trust discovery.
* OADA-compliant cloud providers and applications will allow identity from these
  providers.
* OADA-compliant cloud providers will be required to notify users if a given
  identity is from a non-OADA-trusted identity provider.

# Terminology

* End User
  * End user is an actual person depending on the context: i.e. a farmer, farm
    manager, agronomist, consultant etc.
* Cloud
  * OADA Cloud provides data storage and any other services through the OADA
    API.
* Service Provider
  * An OADA compliant application like a prescription provider, agronomy
    application etc.
* Device
  * An OADA compliant device synchronizes data to/from any OADA-compliant cloud
    using the OADA API.
* Client
  * Generic term for either a service provider or device or an application.
* User agent
  * An entity like a web browser or a web engine that handles the HTTP
    directives like redirects, sometimes seamlessly without the controlling
    layer (user if the user is using a web browser or a mobile app that wraps a
    headless browser a la “webview” in Android)
* Frank
  * Farmer, typically owner of the data, but not always. In some cases an
    agronomist could own data as well.
* Andy
  * Agronomist, provides advice and prescriptions to Frank.
* agcloud.com
  * Cloud storage provider. May or not be an identity provider.
* agronomists.com
  * Service provider, providing various recommendation / prescription services.
    May or may not be an identity provider.
* Identity Provider
  * An OADA entity that can verify an end-user’s identity. This is typically an
    entity with which an end user has an account. In SAML, the term is still
    Identity Provider (IdP). In OpenID Connect, the term is OpenID Provider (OP)
* farmeridentity.com
  * Frank’s identity provider in case Frank decides to use a different identity
    provider for his interactions on agcloud.com.
* agronomistidentity.com
  * Andy’s identity provider in case Andy decides to use a different identity
    provider for his interactions on agronomists.com.

# Sample Federated Identity Usecase

1. Frank uses browser app: App has link to login, Frank logs in to agcloud.com

  * OADA does not standardize the login APIs between a client and server. The
    login APIs between a client and server are left to each individual provider.
  * Login to agcloud.com could happen:
    * Direct login, in case agcloud.com is Frank’s identity provider, like so:
      https://agcloud.com/login
    * Login through a OADA federated identity like frank@farmeridentity.com.
      See step (4) below for details
  * One of the fields in the response from login process is an OAuth 2.0 access
    token for Frank’s data. Without this access token there is no way Frank’s
    application to navigate his data using the OADA “resources” API
    * OAuth 2.0 access token is retrieved via the flow described in Appendix.

2. Frank navigates to desired folder, viz. 2011/Harvest/Field1

Frank’s client uses https://agcloud.com/oada/resources API with OAuth 2.0 access
token to navigate Frank’s data.

3. Frank selects to share 2011/Harvest/Field1 with Andy

  * Assume the ID of that file is 12345.  Frank’s application does a “GET” on
    file ID 12345 for it’s permission property:

**Request**
```http
GET /resources/12345/_meta/permissions HTTP/1.1
Host: agcloud.com
Accept: application/json
```

**Response**
```http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8

[
  {
    "user": {
        "_id": "jdx83jx"
    },
    "type": "user",
    "level": "owner"
  }
]
```

  * Franks application then does a PUT with Andy’s OADA ID added with “view”
    permission:

**Request**
```http
POST /resources/12345/permissions HTTP/1.1
Host: agcloud.com

[
  {
    "user": {
        "identity": "andy@agronomistidentity.com"
    },
    "type": "federated",
    "level": "view"
  }
]
```

**Response**
```http
HTTP/1.1 200 OK
```

  * **Alternative 1:** Frank enters “andy@agronomistidentity.com”, and
    agronomistidentity.com is not a trusted OADA identity agcloud.com responds
    with a failure code indicating untrusted identity provider, and Frank’s app
    warns Frank that he is sharing with an untrusted identity.
  * **Alternative 2:** Frank does not have Andy’s OADA ID, but has his email
    instead: andy@gmail.com. Frank’s app allows Frank to type in an email
    address for sharing instead. In this case Andy’s OADA ID will be resolved
    when Andy attempts to access the resource that Frank shared.

4. Andy uses app to build prescriptions and has to tell app to retrieve data
   from agcloud.com. In order to do this, Andy’s app has to get an OAuth 2.0
   token in order to get access to files on agcloud.com.

  * Andy’s app attempts to access Frank’s data on agcloud.com.
  * agcloud.com contains an option for “Login via OADA federation”, and Andy
    types in domain “agronomistidentity.com”, then presses button.
  * agcloud.com’s auth endpoint redirects Andy to agronomistidentity.com.
  * Andy enters his username and password when prompted.
  * agronomistidentity.com redirects Andy’s app to agcloud.com’s auth endpoint
    with credentials.
    * agcloud.com registers some version of an ID from this response with Andy’s
      currently anonymous local identity for future access.
  * agcloud.com auth endpoint validates the response forwarded by Andy’s app.
    * If agronomistidentity.com is not part of OADA Federation then Andy does
      not immediately get access to Frank’s files, especially if Frank were not
      aware of Andy’s identity provider when he intiated sharing.
    * Frank needs to be notified that Andy’s identity provider is not in the
      trusted list and Frank needs to approve access again.
  * agcloud.com’s auth endpoint returns an OAuth 2.0 token to access files on
    agcloud.com.

5. Andy’s app discovers agcloud.com endpoints by calling the API:

  * https://agcloud.com/.well-known/oada-configuration
  * Similarly agcloud.com discovers agronomistidentity.com endpoints by calling
    the API:
    * https://agronomistidentity.com/.well-known/oada-configuration See
      “Federated Identity Workflow” section below.

6. Andy’s browser popup passes the OAuth 2.0 token to the outer app for
   inclusion with future API requests.

Andy’s client uses https://agcloud.com/oada/resources API with OAuth 2.0 access
token to access Frank’s data.

# Federated Identity Architecture

This section provides a brief description of the key concepts and the components
defined in the standard, as they relate to OADA federated identity. OADA
Identity Providers support federated identity using:

  * Security Access Markup Language (SAML) V2.0[1]. SAML 2.0 is a version of the
    SAML standard for exchanging authentication and authorization data between
    security domains. SAML 2.0 is an XML-based protocol that uses security
    tokens containing assertions to pass information about a principal (usually
    an end user) between a SAML authority, that is, an identity provider, and a
    SAML consumer, that is, a service provider.
  * Open ID Connect (ODIC) [2]. OpenID Connect 1.0 is a simple identity layer on
    top of the OAuth 2.0 protocol. It allows Clients to verify the identity of
    the End-User based on the authentication performed by an Authorization
    Server, as well as to obtain basic profile information about the End-User in
    an interoperable and REST-like manner.

Both SAML and ODIC have their advantages. SAML is a well established technology
with plenty of open source implementations and ODIC lets end users use their
popular web identities (like Google) as OADA federated identity.

In the context of OADA, some of the OADA entities like cloud providers can take
on the role of identity provider.  Other OADA entities (software modules that
provide consulting services, devices etc) are service providers.  Note that
since one OADA cloud can request data from another OADA cloud, then in that
context OADA cloud providers can also be service providers in need of identity
verification.

## Basic Concepts

OADA federated identity exchange takes place between system entities referred to
as an OADA identity provider and OADA service provider What is typically
exchanged are assertions / tokens.

At the heart of OADA federated identity exchange is an assertion about a subject
(a principal – an entity that can be authenticated – within the context of a
particular security domain) about which something is being asserted. The subject
could be a human but could also be some other kind of entity, such as a software
application.

A typical assertion from an identity provider might convey information such as
“This user is John Doe, he has an email address of john.doe@example.com, and he
was authenticated into this system using a password mechanism.” A service
provider could choose to use this information, depending on its access policies,
to grant John Doe access to various resources.

## Federated Identity Workflow

OADA Federated Identity can be implemented either using:
  a. Security Assertion Markup Language (SAML)
  b. Open ID Connect (ODIC)

Although the protocol details might differ (XML vs JSON), conceptual workflow
between these two implementations is identical.

1. An end user (via an application / browser, henceforth called user agent)
   takes some action which prompts the need for an identity verification and/or
   access token generation. Therefore, an OADA entity (viz. agcloud.com)
   redirects the user to an OADA Identity provider’s (viz. farmeridentity.com or
   agronomistidentity.com) authentication endpoint with a specific request.
2. The end user's user agent carries out the redirect request.
3. The authentication endpoint then presents the end user with some sort of
   login challenge. Typically this is a web page which asks for credentials and
   the user's permission to authorize the requested scope. If the IdP can and is
   allowed to determine the user identity without credentials, such as current
   and active session, then it may only ask for the user to authorize the
   requested scope. If the end user has previously authorized the requested
   scope and has a current and active session then the IdP may not require any
   user interaction.
4. The end user successfully completes the login challenge and provides the
   necessary authorization.
5. The OADA identity provider’s authentication endpoint redirects the end user
   back to the OADA entity that initiated the authentication request (viz.
   agcloud.com).

![OADA Federated Identity](oada_federated_identity.jpg "OADA Federated Identity")

| OADA Entity | SAML Entity | ODIC Entity |
| ----------- | ----------- | ----------- |
| OADA Service Provider | Service Provider, SAML Relying Party, SAML Requester | Relying Party |
| OADA Identity Provider | Identity Provider, SAML Asserting Party, SAML Responder | OpenID Provider |

## Establishing and Managing Federated Identities

A user’s identity is said to be be “federated between a set of entities” when
there is an agreement between the entities on a set of identifiers and/or
identity attributes by which the entities will refer to the user.

Here are some basic considerations when OADA entities decide to use federated
identities to share security and identity information about users:

* Do the users have existing local identities at OADA entities (identity
  providers to be specific) that must be linked together through the federated
  identifiers?
    * Most identity management systems maintain local identities for users.
      These local identities might be represented by the user's local login
      account or some other locally identifiable user profile. These local
      identities must be linked to the federated identity that will be used to
      represent the user when the provider interacts with another OADA entity.
      The process of associating a federated identifier with the local identity
      at a partner (or partners) where the federated identity will be used is
      often called account linking.

* Will the establishment and termination of federated identifiers for the users
  be done dynamically or will OADA entities use pre-established federated
  identifiers?
    * While OADA entities are free to pre-establish some sort of mechanism like
      an “identity feed” between themselves, most of the time establishment and
      termination of federated identifiers will be a dynamic process.
* Do users need to explicitly consent to establishment of the federated identity?
  * Yes.
* Do identity attributes about the users need to be exchanged?
  * In order for a service provider (viz. agcloud.com) to be fully aware of the
    user / entity seeking resource access, we require that actual identity
    attributes (user name etc) be exchanged.
* Should the identity federation rely on transient identifiers that are
  destroyed at the end of the user session?
    * We recommend that transient identifiers be destroyed at the end of a user
      session.
* Is the privacy of information to be exchanged of high concern such that the
  information should be encrypted?
  * Just providing assertions from an identity provider to a service provider
    may not be adequate to ensure a secure system. How does the service provider
    trust what is being asserted to it? In addition, what prevents a
    “man-in-the-middle” attack that might grab assertions to be illicitly
    “replayed” at a later date?  SAML defines a number of security mechanisms to
    detect and protect against such attacks. SAML recommends HTTP over SSL 3.0
    or TLS 1.0 to assure message integrity and confidentiality.

# Appendix

## Retrieving OAuth 2.0 Access Token

1. GET Request to oada-configuration end point.
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

3. Client could use implicit flow or authorization code flow

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

4. Some web resource that challenges the user to login or uses a current session
   to identify the user. This is where an OIDC / SAML flow may occur if the user
   is using a federated login. agcloud.com redirects the user back to the
   redirect_uri given with the token directly in the redirect fragment.

  * Implicit flow - The token is directly in the fragment because the consumer
    is the web app:

    **Response**
    ```http
    HTTP/1.1 302 Found
    Location: http://agcloud.com/cb#access_token=2YotnFZFEjr1zCsicMWpAA&state=xyz&token_type=example&expires_in=3600
    ```

  * Authorization flow - A code is returned which is then traded for a token:

    **Response**
    ```http
    HTTP/1.1 302 Found
    Location: https://agcloud.com/cb?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz
    ```

5. The client then trades the authorization code in for a token at the token
   endpoint by doing the following:

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

# References

1. http://en.wikipedia.org/wiki/SAML_2.0
2. http://openid.net/connect/
