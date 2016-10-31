# Getting Started with OADA Authentication and Authorization

All APIs need a way to decide if a particular request is allowed to occur.
OADA standardizes that method of _authorization_ as the OAuth2 standard
with a couple of standard extensions.  In addition, the method of _authentication_
(i.e. is this user who they claim to be) is standardized as OpenIDConnect
(not to be confused with OpenID).

A complete technical description of OADA Authentication and Authorization 
can be found [here](../Authentication_and_Authorization.md).

## Overview

### Concept: Tokens

API Authorization is basically about _tokens_: long random strings of
characters that get sent along with every API request.  These strings are
sufficiently random and hard to guess that they act like a username and 
password all in one package.  If a request has a token, and that token
has been given permission to do whatever the request indicates, then
the request can be executed.

### Concept: Client Registrations

An application which tries to get a token needs a means to identify itself to
the place from which it is requesting a token.  This is accomplished in OADA
using the [oauth-dyn-reg](https://tools.ietf.org/html/rfc7591) extension to OAuth2.
Each application gets a "client registration document" that identifies it and
some of it's needed information for authorization flows.  This document is signed
by a trusted party so others can ensure it is valid.  

It is intended to be publicly
shared with anyone: in that sense it can be used by malicious attackers as fake
identification, however the OAuth2 protocol within OADA uses the 
[jwt-bearer](https://tools.ietf.org/html/rfc7523) extension which requires the 
sender of identification to prove they are indeed the original recipient of the
registration document by signing subsequent token requests with the private key 
associated with the client registration.

A single company or developer can have multiple client registration documents, either for
multiple apps or for multiple types of requests from the same application.
This document becomes the identity of the application within the OADA ecosystem.  This
dynamic client registration protocol is the means by which a cloud system
learns about applications that intend to utilize it's API.


### Concept: `.well-known` Service Discovery

A core tenet of OADA is that the protocols should allow for on-the-fly authorization,
requiring as little interaction outside the request for data as possible.  We've already
seen how the dynamic client registration enables cloud systems to learn about applications
on the fly.  This "`.well-known` service discovery" is the means to automate the other
direction: how can an app connect to an API of which it had no knowledge at development
time.  

Each OADA-conformant API must have a document at `/.well-known/oada-configuration` at the
top of its domain which external applications can retrieve to learn where to ask for tokens,
where to send client registrations, and other fun details.

## Examples

I find it best to understand OAuth2 and OADA authorization via paradigmatic examples.

### Business-to-Business: Client Grant Flow

The simplest method of requesting and handing out a token is between two
businesses: one holding data to be retrieved or changed, and one that wants
to do the retrieving or changing.

[Here is an example of the client grant authorization flow](../../auth-examples/client-grant-field-sensors/README.md)

### Business-to-Customer (app only): Implicit Grant Flow

A similar example exists when a customer has an app they would like to connect to their
data system of choice.  The customer provides authorization by logging in in this flow.

[Here is an example of the implicit grant authorization flow](../../auth-examples/implicit-grant-trialstracker/README.md)

### Business-to-Customer (cloud service): Code Grant Flow

The most complex example is when a customer is connecting two cloud services
at which they have accounts.  This adds a level of security unavailable to the
implicit flow by using a secure backchannel to communicate between the two
services, while still relying on the user to login and provide authorization for
the sharing.

[Here is an example of the code grant authorization flow](../../auth-examples/code-grant-scouting/README.md)

### Business-to-Customer (non-browser-enabled device): Device Grant Flow

This flow is used when the customer is connecting a "dumb" device to a
cloud service.  "dumb" means that the device does not have the ability
to present a web browser to the user.  If a web browser is available,
either the implicit or code flow should be used.

[Here is an example of the device grant authorization flow](../../auth-examples/device-grant-scouting/README.md)

