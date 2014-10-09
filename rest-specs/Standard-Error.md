# OADA Standard Error Response

All OADA API errors should be reflected with an appropriate response status code
and a JSON document with the following structure:

```json
{
  "code": "401",
  "status": "Unauthorized",
  "href": "https://github.com/OADA/oada-docs/blob/master/rest-specs/OAuth2.md",
  "title": "Invalid or missing token",
  "detail": "All requests to private OADA endpoint must be sent with an Authorization header that contains a valid Bearer token",
  "userMessage": "Please login"
}
```

Where:

- **code** - HTTP response code
- **status** - HTTP response name
- **href** - A link to documentation that might be helpful to resolve the issue
- **title** - The title, or short description, of the error that occurred.
- **detail** - A detailed description of the error that occurred.
- **userMessage** - A simple, polite, and helpful message that an application
  can show to its user to explain the trouble.
