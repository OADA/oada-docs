# OADA Use Cases

# DRAFT IN PROGRESS

The purpose of use cases is to define real-world situations in which real people
will interact with pieces of the OADA system.  This is important to focus and
clarify goals, as well as ensure that the final design of the system will work
well for actual people.

**NOTE: the vast majority of the use cases here will involve components that are
not necessarily part of the open source codebase.  They are included here to
ensure that the OADA API would support someone else making such an application
should they determine a market need.**

# Use Case 1: Existing farmer data synced to OADA.

The most basic use case is enabling the farmer to store his current files and
precision ag data in an OADA-compliant cloud.  The farmer in this use case will
be named Frank for purposes of the storyline.  The OADA-compliant cloud store
will be referred to as 123example.com.

## Background: Frank's initial conditions

Frank currently stores his ag data in files on a Windows laptop in a completely
custom directory structure that has been developed ad-hoc over the past 10
years.  While no partiular farmer may use the exact same structure, most farmers
have dealt with data in this way since they started using precision ag software
in the 1990's.  They have, by necessity, had to expend time and effort
developing a structure for storing and reusing data that has evolved over time,
and this structure has survived many different changes to their precision ag
setup.  Any new system that is intended to gain their acceptance will need to
enable a farmer to make use of this historical data while it simultaneously
enables them to move forward to new ways of handling data.

An example structure
```text
PrecisionAg/

  2011/

    All_Field_Boundaries/

      FrankFarms_Home_Home40/
        FrankFarms_Home_Home40_poly.dbf
        FrankFarms_Home_Home40_poly.shp
        FrankFarms_Home_Home40_poly.shx

      FrankFarms_Smith_Smith30/
        FrankFarms_Smith_Smith30_poly.dbf
        FrankFarms_Smith_Smith30_poly.shp
        FrankFarms_Smith_Smith30_poly.shx

      ... and so on for about 50 fields ...

    Aerial_Fungicide_2011/

      ... similar structure above of field boundaries as shapefiles ...

    Corn_Planting_2011_Monitor_Export/

      5RYHMCXH.cn1/
        index.vy1
        shared/
          9HKHM0Q1.FMD
          9HKHM0Q1.FMS
          9HKHM2Q1.FMD
          9HKHM2Q1.FMS
          ... and so on for about 50 files ...
          growers.gws
          producers.pds

    Harvest_Monitor_Setup/
      9DCRMCD3.cn1/
        ... same structure as corn planting monitor export ...

    Original_Seed_Prescriptions_From_Agronomist/
      Frank Farms.zip
      Frank Farms/
        V4CHMN4L.cn1/
          ... same structure as planter monitor setup ...

    Cover_Crops_Aerial_Maps/
      ... set of shapefiles in folders per field, same as All_Field_Boundaries above ...

    Soil_Test_Boundaries/
      ... same structure as other directories containing shapefiles for field boundaries ...

  2012/
     ... similar to 2011, with KML files for fungicide aerial application

  2013/
     ... similar to 2012, added folders for prescription planting maps and monitor exports,
     split harvest-specific data into it's own folder ...
  2014/

  CardBackups/
     ... raw backups of individual monitor files from every year ...
  SoftwareBackups/
     ... raw backups of precision ag desktop software backups from every year ...
```

This set of files is rarely ever referenced directly by Frank, but remain for
posterity and backup.  This data will be referred to as "precision ag" data in
this use case.  Frank does not necessarily interact with this data directly, but
rather has imported it over the years into a desktop precision ag program which
provides an interface to generate maps, run queries, and edit some data.

In addition to this precision ag data, there is another set of data which does
not pertain to precision ag that Frank maintains.

This includes:
  * accounting information (reports, invoices, receipts, etc.),
  * inventory tracking (spreadsheets, journal records, delivery receipts, etc.),
  * regulational compliance records (manure/fertilizer application, pesticide
    application, etc.),
  * and management records (planting records and plans, logistics planning,
    etc., generally as spreadsheets).  This data is used by Frank every week,
    multiple times per week.  As such, he probably already syncs much of this
    information as files to the cloud via Google Drive, Dropbox, etc.  This will
    be referred to as "management data".

## Frank Syncs Data to agcloud.com

Frank has seen a new OADA-compliant application which he likes from
http://oada-app.com.  He does not currently have his data stored in an
OADA-compliant cloud, so he decides to sign up with http://agcloud.com and sync
his data there so he can use the app at http://oada-app.com seamlessly.

agcloud.com supports uploading an entire directory of files.  Frank chooses his
top-level folder containing all his farm's data, and uploads it directly to
agcloud.com.  This happens over the course of several days, as Frank's folder is
on the order of 5GB.

As files are uploaded to agcloud.com, automated file type and data
identification is being performed to identify as much data as possible.  Where
data cannot be identified, agcloud.com might indicate this to Frank when he
browses the file hierarchy so he can "touch up" the identification of his data
as the need arises.  For spreadsheets and other custom items, the type of data
will remain "unknown" indefinitely.

# Use Case: synchronization app to local filesystem

An alternative to the web-based file uploads is a local app which syncs a local
folder hierarchy of data with a remote OADA-compliant cloud provider.  Such an
app would function similar to Google Drive's or Dropbox's desktop sync apps.

Frank (farmer) downloads a desktop application to sync a folder to OADA.  He
opens this app, and using the OADA API for aquiring an OAuth token at his cloud
provider (agcloud.com), it asks him to login and provide proper access to the
app.  The app then proceeds to mirror the folder hierarchy at agcloud.com on his
local machine.

To handle the additonal metadata that is stored with files (filetype, custom
JSON properties, etc.), the app chooses to sync the metadata to a directory
named "meta" at the top level, inside which there are a set of files named by
the ID of the file they represent which contain the meta properties about that
file.

A nice feature of this approach would be that Frank can point his OADA sync app
at a different cloud provider, and ask it to sync the current state of his local
copy from agcloud.com to the new provider.  From an API standpoint, after the
sync to a new provider, the cloud state should look identical.

The sync app will require the ability to have push updates and handle race
conditions in order properly maintain up-to-date status locally.  At minimum, it
needs the ability to query which files have changed since a particular date,
especially if push is not enabled.

# Use Case: Transferring data to a new cloud provider.

As described in "synchronization app to local filesystem", one means of
switching providers is simply for Frank (farmer) to use an app to mirror all his
data from his OADA compliant cloud store onto his local computer.  Then, he can
use the same app to sync that data up to a different cloud provider.  This does
not necessarily handle deleting the data from the original cloud store, but it
certainly could.

There should be other options for this as well, primarily cloud-to-cloud
transfer without the intermediate step of flowing through the user's computer.
If Frank logs in to betteragcloud.com and signs up, betteragcloud.com may
provide an option to transfer data from another OADA cloud provider.  Frank can
enter his agcloud.com domain, login via the OADA identity protocols, and the new
betteragcloud.com cloud can begin transferring data to it's storage.
betteragcloud.com then emails Frank later that day when the sync is complete.
Frank chose the option of deleting the original data after transfer, so
betteragcloud.com deleted his original data on agcloud.com once it was
transferred.

# Use Case: Converting proprietary formats to open formats.

# Use Case: sharing data from farmer to agronomist.

# Use Case: shared machine setup

# Use Case: automated prescription download and updates

# Use Case: app for cohesive view across multiple OADA clouds

# Use Case: managing data across employees on a farm

# Use Case: precision ag app data discovery

