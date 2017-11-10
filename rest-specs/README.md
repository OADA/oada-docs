# REST API Specification

## Current - v1.0.0-rc1

# OADA API

## [API Philosophy](API-Philosophy.md)

## Base Endpoints

* [/resources](REST-API-Endpoints.md#resources)
* [/resources/&lt;string/_meta&gt;](REST-API-Endpoints.md#meta)
* [/bookmarks](REST-API-Endpoints.md#bookmarks)

*Draft: Version 1.0.0+*
* [/users (Draft)](REST-API-Endpoints.md#users-draft)
* [/groups (Draft)](REST-API-Endpoints.md#groups-draft)
* [/authorizations (Draft)](REST-API-Endpoints.md#authorizations-draft)

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

## Synchronization and Push Notifications

* [Cloud-to-Cloud Sync (DRAFT)](REST-API-Endpoints.md#_remote_syncs-draft)
* [Websockets]()

## Example API Use Cases

* [JSON Resource Upload](REST-API-Examples.md#json-resource-upload)
* [Binary Resource Upload](REST-API-Examples.md#binary-resource-upload)
* [Resource Update](REST-API-Examples.md#resource-update)
* [Field Discovery](REST-API-Examples.md#field-discovery)
* [Manual Resource Syncing](REST-API-Examples.md#manual-resource-syncing)

*Draft: Version 1.0.0+*
* [Automatic Resource Syncing (Draft)](REST-API-Examples.md#automatic-resource-syncing-draft)
* [Resource Sharing (Draft)](REST-API-Examples.md#resource-sharing-draft)
* [View Changes (Draft)](REST-API-Examples.md#view-changes-draft)
* [View Changes for a Resource and Its Children (Draft)](REST-API-Examples.md#view-changes-for-a-resource-and-its-children-draft)
* [More View Examples (Draft)](REST-API-Examples.md#more-view-examples-draft)
* [Copy Resource (Draft)](REST-API-Examples.md#copy-resource-draft)
* [Make Existing Resource a Derivative of Another (Draft)](REST-API-Examples.md#make-existing-resource-a-derivative-of-another-draft)
