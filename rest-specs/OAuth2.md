## Retrieving OAuth 2.0 Access Token

**Work in progress**

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
  "clientDiscovery": "https://auth.agcloud.com/client"
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
