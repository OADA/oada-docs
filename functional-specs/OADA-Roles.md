# OADA Participant Roles

To simplify the OADA ecosystem, we have defined a set of "roles" that contain
broad categories of features.  Any given entity can perform one or more role,
but each role should be handled as a distinct endeavour with it's own means of
providing value to customers.

## OADA-compliant Cloud Provider

An OADA-compliant cloud provider, at minimum, supports the OADA API for handling
and securing ag data.

## OADA-compliant Application Provider

An OADA compliant application is any application which uses solely the OADA API
for backend sychronization to the cloud.

## OADA-compliant Identity Provider

An OADA-compliant Identity Provider is any service which adheres to the
guidelines of the OADA Federated Identity standards (under development). Any
OADA-compliantcloud or appication must accept an identity verified from a
trusted OADA compliant identity provider.

## OADA-compliant Device
-----------------------------

An OADA-compliant device is typically headless or severly limited in it's
interactions with the user directly.  The best example of this is a telematics
device generating data and uploading it to the cloud.  Any telematics device
which uses solely the OADA API for uploading data, and enables a farmer to
upload or sync data to/from any OADA-compliant cloud will be considered and
OADA-compliant device.

## OADA-compliant Data Generator

An OADA-compliant data generator is any app or device which puts data into a
user's OADA-compliant cloud *solely* via open data formats, and properly
identifies the data and format using the OADA definitions for media types.


