# OADA Client Discovery (and OAuth2 Primer)

OADA defines OAuth2 as the required authorization mechanism for OADA-compliant data exchange.  A typical
situation is that a farmer wants one of his apps or cloud services to get data from one of his OADA-compliant 
sources.  To make this abstract process more concrete, let's construct a paradigmatic example of this
scenario.

# Overview 

## Participants

- **Frank**: the farmer
- **fieldscout.com**: a web-based field scouting app for recording notes about a field.  In OAuth2, 
  fieldscout.com is considered the "client".
- **agcloud.com**: an OADA-compliant cloud service that Frank uses for storing his field boundaries.
- **client.discovery.com**: a trusted OADA client discovery provider (CDP).

## Example from Frank's Point of View

Frank is walking through a corn field in July, and notices a section of the field that has yellow leaves.
Frank would like to make a note of this so he can remember to come back and spray foliar fertilizer later.
Frank brings out his phone, searches Google for "field scouting app", and finds fieldscout.com.  He
decides to give it a try by creating an account at fieldscout.com.  

Frank is annoyed when, after registering with his phone, he notices that fieldscout.com requires him to create
a field with a boundary before being able to enter a note about that field.  He's about to go back to Google
to find a simpler solution, when he notices the "Sync Fields via OADA" button.  Yes!  One-click import of 
fields and boundaries into the app!  

Frank types "agcloud.com" as the location of his OADA cloud and clicks "Sync".  The next screen
is the login screen for agcloud.com.  Frank logs in, and then clicks "I approve sharing my field
names and boundaries with fieldscout.com".  The window disappears and Frank immediately sees his 
field boundaries on a Google Map, ready to make a note in the field where he's standing.


## The Same Example from OAuth2's Point of View

When Frank tells fieldscout.com to sync fields from agcloud.com, the first thing fieldscout.com must
do is submit an OAuth2 request to agcloud.com.  The tricky thing is that the initial request
must come from Frank's web browser, not fieldscout.com's servers.  This is accomplished by 
fieldscout.com sending a *redirect* (HTTP 302 Found) to Frank's browser asking it to send Frank to agcloud.com.

Once Frank's browser is redirected to agcloud.com's OAuth2 URL, agcloud.com first checks the client\_id 
from the request to see if fieldscout.com is a trusted client.  If it is, then agcloud.com sends a webpage back 
to Frank's 
browser asking him to login (or checks his local browser cookie and determines that he is already
logged in).  Frank clicks "Login" which sends his username and password back to agcloud.com.  agcloud.com
checks this against their database of users, and if successful, responds with a webpage asking whether
fieldscout.com should be allowed to have the requested access scope.  When Frank clicks an "I approve"
button on that webpage, his browser goes back to agcloud.com with an indication that Frank clicked the button.

agcloud.com then responds to Frank's browser by redirecting it back to fieldscout.com with a special, randomly
generated code that fieldscout.com can now exchange directly with agcloud.com for an OAuth2 authorization token.
Note that if agcloud.com had sent the authorization token directly to Frank's browser, then any malware running
on Frank's computer would be able to scrape that code from the URL and maliciously access Frank's data.  Since
the actual access token never touches Frank's browser, this is not a problem.

When the browser redirects back to fieldscout.com, fieldscout.com's servers send the code back to agcloud.com
in the background and get the access token.  It then sends another request for the actual field boundaries
bookmark in the background to agcloud.com with that token in the Authorization header.  agcloud.com sends the
field boundaries back in whatever format they support, and fieldscout.com can finally send a webpage to
Frank's browser with a Google Map embedded that draws the boundaries on it.

# The Details

There are many things in the overview story that remain to be explained:

1. How does fieldscout.com know the correct URL at agcloud.com to request a code and token, since within OADA 
   there is no guarantee that fieldscout.com and agcloud.com know anything about each other ahead of time?

2. How does agcloud.com know where to send Frank's browser at fieldscout.com?

3. Why should agcloud.com trust fieldscout.com enough to send Frank's data to them?

4. How does agcloud.com know that a malicious app is not trying to pretend to be fieldscout.com in order to
   hijack Frank's data?

5. What if fieldscout.com is an untrusted server running on Frank's farm because Frank is a maker and
   wants to build his own custom apps for fun?

We will highlight the answers to these questions as we walk through the technical details of the flow below.

## Discovery of agcloud.com's Endpoints

Since the OADA distributed model means that there is no guarantee
that fieldscout.com will know about agcloud.com ahead of time, then fieldscout.com must have some way
of discovering this URL using only the domain typed in by Frank.  "fieldscout.com" may be a server
running on Frank's farm where he's experimenting writing his own web apps.

OADA requires a particular URL to reside at the top level of the domain or sub-domain where Frank's
data resides.  This URL follows [RFC 5785](https://www.ietf.org/rfc/rfc5785.txt) which defines a 
`/.well-known/` endpoint for all internet domains.  At this endpoint, OADA defines an `oada-configuration`
endpoint where a JSON document must reside which tells fieldscout.com where to send Frank's browser
for the initial OAuth2 authorization request.

If fieldscout.com has already had a customer who sent them to agcloud.com, they can cache the oada-configuration
document using standard HTTP caching and skip this step.  If not, they have to first ask agcloud.com for their 
oada-configuration.  

A typical oada-configuration would look like this:

(Note: the content-type below is not correct.  Github's markdown won't syntax highlight properly
with the correct content type.  Andrew has submitted a patch to fix this bug in pygments, but
in the meantime we have to say everything is "JSON")

```http
GET /.well-known/oada-configuration HTTP/1.1
Host: agcloud.com
```
```http
HTTP/1.1 200 Ok
Content-Type: application/json

{
  "authorization_endpoint": "https://oada.agcloud.com/authorization",
  "token_endpoint": "https://oada.agcloud.com/token",
  "oada_base_uri": "https://oada.agcloud.com",
}
```

fieldscout.com now knows to send authorization requests for agcloud.com to `https://oada.agcloud.com/authorization`.


> **Question 1**: How does fieldscout.com know the correct URL at agcloud.com to request a code and token, since within OADA 
>   there is no guarantee that fieldscout.com and agcloud.com know anything about each other ahead of time?
> 
> **Answer**: fieldscout.com learns the URL's from `https://agcloud.com/.well-known/oada-configuration` because all 
> OADA-compliant clouds have the `/.well-known/oada-configuration` endpoint.


## Initial OAuth2 Request

After discovering the proper endpoints for OAuth2, fieldscout.com constructs the initial request and sends it to Frank's 
browser as a redirect.  Frank's browser is waiting for a response because the last thing it did was submit the
form which contained the "Sync" button to fieldscout.com.

In this initial redirect that sends Frank's browser to agcloud.com, fieldscout.com must tell agcloud.com several things:

- **scope**: what, specificically, fieldscout.com is requesting access to
- **response\_type**: what fieldscout.com wants back from agcloud.com
- **redirect\_uri**: where to send Frank's browser back to when he's approved access
- **client\_id**: a string that identifies fieldscout.com to agcloud.com.

The request for this example would be:
(Note: I added newlines to split each query parameter for readability)
```http
HTTP/1.1 302 Found
Location: /authorization?scope=bookmarks.fields
&response_type=code
&client_id=9jd292%40client.discovery.com
&redirect_uri=https%3A%2F%2Ffieldscout.com%2Fcode_accepter  
&state=jfd29jf4 HTTP/1.1
Host: agcloud.com
```

Whoa, that looks messy.  Let's go through each one individually:

- `&scope=bookmarks.oada`: this tells agcloud.com that fieldscout.com would like to access Frank's field boundaries.
   This scope is defined by OADA.  As currently defined in OADA, anything in bookmarks or resources can be a scope by
   replacing the "/" in the path with ".".  The word "scope" is defined by OAuth2.

- `&response_type=code`: this means we want a code to be sent back from this request that fieldscout.com can exchange 
  for an access token.  Both "response\_type" and "code" are defined by OAuth2.

- `&client_id=9jd292%40client.discovery.com`: this is supposed to identify fieldscout.com to agcloud.com.  OAuth2
   defines that the client\_id parameter has to exist, but it does not make any requirements about its value.
   In most cases, it's a long random string (like `9jd292`).  OADA Client Discovery appends an "@domain.com" to 
   that random string.  agcloud.com will use this to verify that the redirect\_uri from the browser matches the
   one that is pre-registered for fieldscout.com.  This prevents someone from attempting to redirect the browser
   to a malicious host.

- `&redirect_uri=https%3A%2F%2Ffieldscout.com%2Fcode_accepter`: this is the place that fieldscout would like
   Frank's browser sent after the OAuth2 approval takes place.  OAuth2 defines this as a required parameter, but
   agcloud.com is not allowed to use this in its redirect: it must use the pre-registered redirect\_uri for 
   the client\_id.  agcloud.com must lookup the registered redirect URI for this client, and if it doesn't match 
   this one then the request should fail.

- `&state=jfd29jf4`: a randomly-generated, hard-to-guess string that the fieldscout.com generates.  agcloud.com
   is required by OAuth2 to send this state string in it's redirect request.  This is to prevent 
   [Cross Site Request Forgery attacks](http://www.twobotechnologies.com/blog/2014/02/importance-of-state-in-oauth2.html).

> **Question 2**: How does agcloud.com know where to send Frank's browser at fieldscout.com?
>
> **Answer**: fieldscout.com sends a redirect\_uri in the initial OAuth2 request that must match a pre-registered
> redirect\_uri for fieldscout.com.



# WHY WE NEED CLIENT DISCOVERY

We now have enough background to discuss the problem of client discovery in a distributed network.

Since the total set of OADA-compliant places where data can be stored is definitionally unknown in this distributed
context, if you are the developer for fieldscout.com, how can you create an app that has any reasonable chance at 
working with whatever OADA-compliant data store your customer has?  OAuth2 seems to require that you pre-register 
as a client in order to be able to make an OAuth2 request, but you can't pre-register at an unknown set of places.

What if you could register at just one place, and then be assured that your client creditials will work at
any OADA-compliant service providers?  That is precisely the problem that OADA client discovery intends to solve.



## Agcloud.com Performs OADA Client Discovery for Fieldscout.com's client\_id

If agcloud.com has never seen a previous request from fieldscout.com, it will take the client\_id from the
OAuth2 request, parse out the domain, and check if that is a trusted client discovery provider.  In this 
case, recall the client\_id was `9jd292@client.discovery.com`.  agcloud.com checks that client.discovery.com
is on the list of trusted OADA client discovery providers.  If not, agcloud.com has the option to deny the
request altogether, or ask Frank if he is aware of this fact and if he'd like to continue anyway.  

> The OADA community will need to decide the proper way to handle untrusted client discovery providers.  
> The current preference is to inform Frank and let him decide so that people are free to build their
> own OADA-compliant systems in research labs or "in their garage", but many companies may not be able
> to comply with such a requirement.

To verify the client\_id 9jd292@client.discovery.com, agcloud.com will ask for the public client credentials
for that ID from client.discovery.com.  agcloud.com should discover and cache the client discovery endpoint
for that domain:

```http
GET /.well-known/oada-configuration HTTP/1.1
Host: client.discovery.com
```
```http
HTTP/1.1 200 Ok
Content-Type: application/json

{
  "client_discovery": "https://client.discovery.com/discover"
}
```

Now agcloud.com can get the developer credentials for this client\_id:

```http
GET /discover?client_id=9jd292%40client.discover.com HTTP/1.1
Host: client.discovery.com
```
```http
HTTP/1.1 200 Ok
Content-Type: application/json

{
  "clientId": "9jd292%40client.discover.com",
  "name": "Field Scout",
  "contact": "clientdiscoveryquestions@fieldscout.com",
  "redirectUrls": [
    "https://fieldscout.com/code_accepter"
  ],
  "licenses": [
    {
      "licenseid": "oada-dev-1",
      "name": "OADA Standard Developer Agreement v1"
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
   "puc": "https://fieldscout.com/privacy_and_use_components.html"
}
```

You can ignore some of that document until we get to the client\_secret portion of this document later
when the code is exchanged for an access token.

For now, the relevant parts of that response are now the redirectUri's that are registered for fieldscout.com, 
the licenses that fieldscout.com has signed, and the link to their privacy and use (puc) page.

As discussed earlier, agcloud.com can now compare the redirect\_uri from that document with the one sent from
Frank's browser to make sure they match.  If agcloud.com requires that developers sign one of several standard
agreements that OADA can define in the future, then they can also check that this developer has signed the
agreements they require by checking the "licenses" key.

OADA requires that when a data sharing request is made (i.e. an OAuth2 request), the public privacy and use
webpage for any entity involved must be presented to the user to give them an opportunity to review it.  There
are no requirements for the content of that page, however OADA recommends including the OADA Privacy and Use 
components on that page to easily classify the type of service you have to the farmer.  In this case,
agcloud.com will be required to provide a link on the OAuth2 access approval page to the URL given
in the client credentials for fieldscout.com.

> **Question 3**: Why should agcloud.com trust fieldscout.com enough to send Frank's data to them?
> 
> **Answer**: because agcloud.com trusts client.discovery.com because they are a trusted OADA
> Client Discovery Provider, and client.discovery.com has given them valid client credentials for
> fieldscout.com's client\_id.  In addition, if agcloud.com requires particular standard client
> agreements to be signed, client.developer.com reports which ones this client has signed.

> **Open Question**: It remains to be seen what it would take for a commercial partner to agree to become 
> a client discovery provider since this will involve signing agreements with developers.  It is possible
> to charge for this service, or the soon-to-be-formed Open Source Ag Foundation could handle executing
> the client agreements and the client discovery providers can simply faithfully report this information
> in the client credentials.


## Agcloud.com Sends Code Back to Fieldscout.com

Now that the developer is trusted, agcloud.com continues with the OAuth2 process.  Once Frank has logged in,
agcloud.com looks up the human-readable version of the scope "bookmarks.fields" from the OADA standard list,
and asks Frank for permission.  Frank clicks "I Approve", and agcloud.com redirects Frank's browser back
to fieldscout.com using the redirect\_uri it discovered for fieldscout.com:

```http
HTTP/1.1 302 Found
Location: /code_accepter?code=2093fjwlkf28&state=jfd29jf4
Host: fieldscout.com
```

## Fieldscout.com Requests Token From Agcloud.com

The next step in OAuth2 authorization code flow is for fieldscout.com's servers to directly contact agcloud.com
while Frank's browser waits for a response from fieldscout.com.  In this way, the actual authorization token never
touches Frank's potentially insecure browser.  This request looks like this:

```http
POST /token HTTP/1.1
Host: agcloud.com

grant_type=authorization_code&code=2093fjwlkf28&client_id=9jd292@client.discovery.com&client_secret=eyJhbGciOiAiUlMyNTYiLCAidHlwIjogIkpXVCIsICJraWQiOiAicWV4bXphNzhzYTN3Y2p4YzhGeCJ9.eyJhYyI6ICJZTktNUzR0c2FXYkh2cGQ5U0dmaXg5NDJFIiwgImF1ZCI6ICJodHRwczovL2lkZW50aXR5Lm9hZGEtZGV2LmNvbS90b2tlbiIsICJpc3MiOiAiY2tJdXlkc2E4M2xDRWxrYzlzZGN4N3pkZEBpZGVudGl0eS5vYWRhLWRldi5jb20iLCAianRpIjogIjQzTHNNdHRvWXkyRHdzQndfd1JwdEE9PSIsICJpYXQiOiAxNDE0NzY5MzI1LCAibmJmIjogMTQxNDc2OTMyNX0.vRKEC9PxTlUt-4UhEs7Kp9GmffgXUCaoHwhqYIo5__S-m5y3RUEoMFd1Avh3_xpjxW6nWKNXU1PgRjsETE_heMpkhbpsWklEBD5U1C0ZYwbFP-SwokpwlisUD_JomyxIFdGAJg50csZuFHhyinJvdZ-zDQ0IeoTnztGpe236aLBdUatsCAQQfOTyDq2Uoj84_l8z79_mTg7vww7kxkhic1RZ53Qiqm7DkqcRlbpw-ExGjthSS_W3SHtGzzcRXo6bqiZU9__aTYvyQjQVBG7iWFTRcyxaLfb5W8J6eZkdbSZIgBPI5X1Pc3jPXv5nVrAjQRArGrLlkc61H0Ef9sRKqA
```
```http
HTTP 200 Ok
Content-Type: application/json

{ 
  "access_token": "SJKF@jf309",
  "expires_in": 3600,
  "token_type": "Bearer",
  "state": "jfd29jf4",
}

```

You'll have to wait until I get back to writing this to explain how we securely create a trusted client secret. 

