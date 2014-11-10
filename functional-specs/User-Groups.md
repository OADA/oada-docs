#OADA Functional Specifications

# DRAFT IN PROGRESS

The purpose of the OADA functional specification is to describe how the OADA
ecosystem will function for it's users.  To accomplish this, we will define the
types of users who may use some part of OADA, characteristic example usage
scenarios that describe details of how they may use the OADA ecosystem in daily
life to accomplish tasks, and a high level overview of the basic components of
the OADA ecosystem

## User Groups

The types of people participating in the OADA ecosystem include
[farmers](#user-content-farmers), [landowners](#user-content-landowners),
[software developers](#user-content-software-developers),
[local agents](#user-content-local-agents),
[equipment/device manufacturers](#user-content-equipmentdevice-manufacturers),
[storage providers](#user-content-cloud-storage-providers), and
[application providers](#user-content-application-providers).

### Farmers

Farmers are the central participant in any OADA compliant system.  For the
purposes of OADA, a farmer is anyone who is involved with the day-to-day
activities related to raising crops or livestock.  There are many types of
farmers, and each of them interact with the OADA ecosystem in different ways.
The first classification of farmers is by their role within a farm:

| Farmer Role | Description |
| ----------- | ----------- |
| Owner       | Makes business decisions for the farm, has large investment stake. Relies on manager for data management.  Most interested in using data for  analysis of business decisions. |
| Manager     | In charge of daily operations.  Also handles logistics of data management. |
| Farmhand    | Operates machines that generate data.  In charge of monitoring machine and data collection health: i.e. knowing when something goes wrong.  Also sometimes tasked with recording information manually about daily tasks. |
| Custom Operator | Owns and operates equipment that generates data while performing tasks for another farmer.  For example, an ag retailer that spreads fertilizer for a farmer likely has precision equipment on their spreading truck which can record  as-applied maps of fertilizer for the farmer. |

The extent to which a particular person performs any or all of those roles is
largely determined by the size of the farm:

* **Small farms**: the same person may be owner, manager, and farmhand.

* **Medium-sized farms**: there is typically an owner, a manager, and at least
  one farmhand.  The manager is likely the employee with the longest tenure on
  the farm, or a child of the owner.  Most of the work is somewhat equally
  shared among the small group of people.

* **Large farms**: generally have up to a small group of owners, likely with
  family ties, and these owners may have varying levels of involvement in daily
  activities.  There are one or two managers who coordinate farmhands, and
  perform much of the highly-skilled labor such as planting and harvest
  functions.  There are several full-time farmhands with different skill sets
  (mechanic, machinery operator, etc.).

* **Very large farms**:  have their own category from OADA's perspective because
  of vast differences in how they use data.  These farms have a much more formal
  structure than large farms, and they are generally spread across large,
  sometimes disconnected geographic regions.  They consist of a group of
  owners/investors, C-level officers, several managers and foremen, supporting
  staff, and many farmhands.

### Landowners

Landowners are the customer of the farmer, and hence important to OADA.  In most
cases a farmer owns some of the land they farm, and they rent other land from
external landowners.  This user group will address only these external
landowners who do not participate directly in daily farming activities.  The
needs from OADA for landowners can also be classified according to the size of
their business.  Landowners are relevant to OADA because some landowners may
require tenant farmers to supply them with data about the performance and soil
health of their land.

* **Small landowners**: generally own one or two farms.  Many times this land
  has been passed through inheritance, but not always.  Renting farmland is not
  their primary occupation.  To maximize return in an area that is not their
  specialization, they may subcontract with a land management company to handle
  rental to farmers.  This category is not likley to make much use of OADA for
  data management from their tenants.

* **Medium-sized landowners**: generally small corporations or partnerships with
  only a few members.  They specialize in renting farmland, generally to a small
  set of trusted farmers in a few regions.  They may also offer land management
  services to other landowners.  This group is likely to interact directly with
  trusted farmers to evaluate the performance of their land over time.

* **Large landowners**: generally large, heavily-invested corporations which own
  large amounts of land spread over very wide geographic areas.  Like very large
  farms, they have a formal corporate structure with C-level officers and
  managers.  They have direct interest in utlizing data generated from their
  farmland to evaluate decisions and reduce risk.

### Software Developers

Since a major part of OADA is a REST API specification and a set of data
handling libraries, it is important that these features be designed properly for
their intended users: software developers.  Use case descriptions should include
code snippets of how a software developer can perform a particular function with
an OADA-compliant system.  Any design which overloy complicates the life of the
developer should be avoided.

### Local Agents

Farmers generally have a set of local salesmen, ag retailers, agronomists, soil
testsers, crop scouts, and advisors whom they trust to aid in their farming
operation.  This diverse group of people can be broadly classified as either:

* performing services that generate data:  soil tests, crop scouting, aerial
  imagery, etc., or
* providing recommendations: prescription maps for seeding rates or fertilizer,
  application recommendations for herbicides, ideal planting dates, etc.

A farmer should be able to provision proper access to their OADA-compliant cloud
to these agents.  In the case of data generators, read/write access for a
particular operation in a given season  is probably good enough.  In the case of
recommendations, an agent may request access to past data in order to better
inform their recommendations, and the farmer should also be capable of giving
these agents write access to put digital forms of their recommendations directly
into his OADA-compliant cloud.

### Equipment/Device Manufacturers

Equipment and device manufacturers interact with the cloud through telematics
devices: a device which can transfer real-time machine and sensor data to a
cloud storage service through a wireless connection.  While telematics devices
are not currently present on a majority of machines in agriculture, the general
trend is away from manual data collection toward automated methods provided by
telematics units.

With OADA, it will be possible to support both a proprietary-only telematics
system, as well as an OADA-compliant telematics system.  An OADA-compliant
telematics device should be capable of uploading data to any OADA-compliant
cloud, including one a farmer may install locally on their farm.  For
proprietary-only solutions, a manufacturer can have a non-OADA-compliant
telematics unit transfer data to their cloud, yet still have their cloud be
considered OADA-compliant if their cloud enables the farmer to transfer and sync
that data to other cloud services.

### Cloud Storage Providers

A cloud storage provider is a user of the OADA ecosytem because they are the
primary implementers of the REST API.  A cloud storage provider can either use
the open source implementation directly, or produce their own proprietary
implementations of the OADA REST API which meets proper criteria for OADA
compliance.

### Application Providers

An application provider creates tools that can interact with OADA-compliant
clouds on behalf of a farmer to enable them to make better use of their data.  A
simple example might be a small mobile third-party app which a farmer can
provision to pull his field boundaries from his OADA-compliant cloud store, and
plot them on a google map for his employees to follow.  Or a desktop application
that syncs and backs up a farmer's data to his local computer from any
OADA-compliant data store, similar to Google Drive or Dropbox applications.  A
more complex example might be an application provider that, on behalf of the
farmer, creates models of crop growth from available data that will enable them
to provide better recommendations that are locally suited to the conditions in
particular fields.

In many cases, a cloud storage provider will also be an application provider:
some applications such as modeling will need local access to data by machine
learning algorithms, for example.  In other cases, the application provider is a
separate entity from the cloud storage provider, but still able to get what they
need from an OADA-compliant store remotely.

## Use Cases

Coming soon...
