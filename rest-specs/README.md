# REST API Specification

## Current - v0.3

The current API spec is written in RAML and is hosted in
[oada-api-spec](http://github.com/OADA/oada-api-spec).

An easier to read HTML version is hosted at
[http://oada.github.io/docs/v0_3.html](http://oada.github.io/docs/v0_3.html)

# OADA API

## Base Endpoints

* [/resources](REST-API-Endpoints.md#resources)
* [/bookmarks](REST-API-Endpoints.md#bookmarks)
* [/users](REST-API-Endpoints.md#users)
* [/groups](REST-API-Endpoints.md#groups)
* [/authorizations](REST-API-Endpoints.md#authorizations)

## Discovery Endpoints

* [/.well-known/oada-configuration](REST-Discovery-Endpoints.md#well-knownoada-configuration)
* [/.well-known/openid-configuration](REST-Discovery-Endpoints.md#well-knownopenid-configuration)

# Supported HTTP

* [HTTP Headers](HTTP-Headers-for-REST-API.md)
* [HTTP Response Codes](HTTP-Status-Codes-for-REST-API.md)

# Standard Terms and Formats

* [Error Response](Standard-Error.md)
* [OAuth 2.0 Scopes](Standard-Scopes.md)
* [Bookmarks](Standard-Bookmarks.md)
* [Media Types](Standard-Media-Types.md)
* [Resource Formats](Standard-Resource-Formats.md)

# Documentation

## Authorization and Authentication

* [Authentication and
  Authorization](Authentication_and_Authorization.md#authentication-and-authorization)
* [Distributed Federation
  Extensions](Authentication_and_Authorization.md#distributed-federation-extensions)
* [Examples](Authentication_and_Authorization.md#examples)

## Example API Use Cases

* [Federated Login](REST-API-Examples.md#federated-login)
* [JSON Resource Upload](REST-API-Examples.md#json-resource-upload)
* [Binary Resource Upload](REST-API-Examples.md#binary-resource-upload)
* [Resource Update](REST-API-Examples.md#resource-update)
* [Resource Sharing](REST-API-Examples.md#resource-sharing)
* [Field Discovery](REST-API-Examples.md#field-discovery)
* [Manual Resource Syncing](REST-API-Examples.md#manual-resource-syncing)
* [Automatic Resource Syncing](REST-API-Examples.md#automatic-resource-syncing)
* [View Changes](REST-API-Examples.md#view-changes)
* [View Changes for a Resource and Its Children](REST-API-Examples.md#view-changes-for-a-resource-and-its-children)
* [Copy Resource](REST-API-Examples.md#copy-resource)
* [Make Existing Resource a Derivative of Another](REST-API-Examples.md#make-existing-resource-a-derivative-of-another)
