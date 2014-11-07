# OADA Client Discovery (and OAuth2 Primer)

OADA defines OAuth2 as the required authorization mechanism for OADA-compliant data exchange.  A typical
situation is that a farmer wants one of his apps or cloud services to get data from one of his OADA-compliant 
sources.  To make this abstract process more concrete, let's construct a paradigmatic example of this
scenario.

# Overview 

## Participants

- *Frank*: the farmer
- *fieldscout.com*: a web-based field scouting app for recording notes about a field.  In OAuth2, 
  fieldscout.com is considered the "client".
- *agcloud.com*: an OADA-compliant cloud service that Frank uses for storing his field boundaries.

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
fieldscout.com sending a *redirect* to Frank's browser asking it to send Frank to agcloud.com.

Once Frank's browser is redirected to agcloud.com's OAuth2 URL, it sends a webpage back to Frank's 
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
in the background and gets the access token.  It then sends another request for the actual field boundaries
bookmark in the background to agcloud.com with that token in the Authorization header.  agcloud.com sends the
field boundaries back in whatever format they support, and fieldscout.com can finally send a webpage to
Frank's browser with a Google Map embedded that draws the boundaries on it.

# The Details

In this initial redirect that sends Frank to agcloud.com, fieldscout.com must tell agcloud.com several things:

- *scope*: what, specificically, fieldscout.com is requesting access to
- *response\_type*: what fieldscout.com wants back from agcloud.com
- *redirect\_uri*: where to send Frank's browser back to when he's approved access
- *client\_id*: a string that identifies fieldscout.com to agcloud.com.

fieldscout.com sends this information through *query parameters* appended to agcloud.com's URL for
OAuth2 authorization. 

This brings up the question, since the only thing Frank typed into fieldscout.com was "agcloud.com", 
how does fieldscout.com figure out the URL for it's OAuth2 request at agcloud.com?  If fieldscout.com
and agcloud.com know about each other ahead of time, then fieldscout.com could have just stored 
that information locally.  However, since the OADA distributed model means that there is no guarantee
that fieldscout.com will know about agcloud.com ahead of time, then fielscout.com must have some way
of discovering this URL using only the domain typed in by Frank.

OADA requires a particular URL to reside at the top level of the domain or sub-domain where Frank's
data resides.  This URL follows [RFC 5785](https://www.ietf.org/rfc/rfc5785.txt) which defines a 
`/.well-known/` endpoint for all internet domains.  At this endpoint, OADA defines a `oada-configuration`
endpoint where a JSON document must reside which tells fieldscout.com where to send Frank's browser
for the initial OAuth2 authorization request.

If fieldscout.com has already had a customer who sent them to agcloud.com, they can cache the oada-configuration
document and skip this step.  If not, they have to first ask agcloud.com for their oada-configuration.  

```json
Request:
GET /.well-known/oada-configuration HTTP/1.1
Host: agcloud.com

Response:
HTTP/1.1 200 Ok
Content-Type: application/vnd.oada.configuration+json

{
  "authorizationEndpoint": "https://oada.agcloud.com/authorization",
  "tokenEndpoint": "https://oada.agcloud.com/token",
  "OADABaseUri": "https://oada.agcloud.com",
  "clientDiscovery": "https://oada.agcloud.com/devDiscovery"
}
```

fieldscout.com now knows to send authorization requests for agcloud.com to "https://oada.agcloud.com/authorization".
They therefore constructs the initial request and sends it to Frank's browser as a redirect in response to Frank
pressing the "Sync" button on their website:

{{{{{{ blue-modern
  alice->bob: Test
    bob->alice: Test response
}}}}}}




