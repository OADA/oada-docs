{
  _id: "02kdjf02",
  _rev: "1-o20923j3k3l",

  // NOTE: the _meta key is a standard OADA key.  It is meant to hold
  // supporting information about a particular resource.  When a prescription is
  // first placed in the OEM cloud, these keys should not exist in the document.
  // They will be filled in as status reports by the OEM cloud as various functions
  // are completed on the prescription like field reconciliation and transfer to machines.
  _meta: {
    // _meta is a special document whose id's reside at /meta
    _metaid: "kdf2j0dfdfww",
    _rev: "2-dklfj2oi"

    // A 3rd party can monitor this key to see which fields a prescription is assigned to.
    // They will put up the prescription, and a field reconciler will look at the geospatial
    // content of the prescription, intersect it with known field boundaries, and fill
    // in all those for which it overlaps the boundary.  Note that if the 3rd party has not
    // requested read:oada.fields scope, they cannot read the field itself, they will only
    // know that a field has been assigned to the prescription.  It is also possible for
    // a 3rd party to fill in this parameter if the cloud supports it, or if the cloud does
    // not support field reconciliation.
    fields: [ { _id: "kjd20fkj" } ],
    // A 3rd party can monitor this key to see if the prescrition has been marked for transfer
    // to particular machines, and also when it actually exists on a machine.  Similar to fields,
    // the details of the linked machine will only be viewable by the third party if they
    // have a token approved with read:oada.machines scope.
    transfer_status: { 
      "jfj0234u": { 
        machine: { _id: "jfj0234u", _rev: "3-kldfjo2ijwe" }, // link to a machine resource
        status: "COMPLETE"  // prescription is physically present on this machine
      },
      "0f22f239": { 
        machine: { _id: "48jf49j0", _rev: "6-df92fu02j" }, // link to a machine resource
        status: "PENDING" // prescription is marked for transfer to this machine
      },
    },
  },

  // The value at the "name" key is what should be shown to a user when referring to this
  // particular prescription.  It can be any valid string.
  name: "Smith30 Prescription #2",

  // The "namespace" key specifies what "type" of document this is.  In this example case, the
  // document adheres to the "oada.types.planting.prescriptions" standard.
  // This sets the particular schema for this prescription file, in particular it defines what sort of 
  // properties to expect under the "zones" key (seeds, fertilizer, etc.).  This is an array in order to
  // support having a single prescription map that contains multiple types of information:
  // i.e. planter population and fertilizer rate.  The standard should define what kinds of things
  // are valid for "units" in the prescription itself.  If you are checking for an OADA standard,
  // it is enough to check for the existence of the "oada.types.planting.prescriptions.population" key
  // to know if it adheres to that standard: i.e.:
  // var is_population_map = (typeof types["oada.types.planting.prescriptions.population"] !== 'undefined');
  namespace: {
    "oada.planting.prescription": { // This prescription map contains planting populations
      src: "https://github.com/oada/oada-docs/blob/master/formats/planting.prescription.js", // the URL of where this "namespace" is defined.
      // any specific parameter to a standard can go here as well.  For the case of planting,
      population: {
        units: "ksds/ac"
      }
    },
  },

  // A "zone" defines a set of operating parameters: i.e. one zone may have planting
  // population of 32,000 seeds/acre with nitrogen of 200 units/acre.  The polygons
  // in the GeoJSON structure will list one of these zone identifiers as the one
  // which applies to that particular polygon.  If the zone indexed by "abc123" 
  // has population 34,000, and 3 polygons in the GeoJSON have properties of "zone"
  // equal to "abc123", then those polygons should be planted at 34,000 seeds/acre.
  //
  // It is important to note that a "zone" may be comprised of many geojson polygons/features
  // given below.
  zones: {
    // This is a special, reserved key for the prescriptions object.  It is optional,
    // and it gives the zone configuration to use when the planter is outside the
    // any of the polygons given in the geojson below.  i.e. it is the "default" rates.
    "default": {
      // Everything inside this object is defined by the standards listed in the "types" field 
      // for this resource.
      population: { value: 32.0 }, // units defined in namespace above
      crop: { name: "CORN" }       // valid list linked to by namespace document
      // other options may be variety, product, nitrogen, etc.
    },
    "jdkfji2": {
      population: { value: 32.0 },
      crop: { name: "CORN" }, // The valid list of crops would be linked to from
                              // the standard format's namespace document
    },
    "8f2jjokd": { 
      population: { value: 34.0, },
      crop: { name: "CORN" }
    },
  },

  // The prescription map itself is a GeoJSON FeatureCollection, as specified in 
  // the GeoJSON format specification: http://geojson.org/geojson-spec.html#polygon.
  // If you are unfamiliar with GeoJSON, I recommend you read the spec and find a few examples
  // before reading this format below.  No, really, go read it.  Really :).
  // Each "feature" represents one "rate" of the prescription.  It can be a single
  // polygon with a single prescribed value, or multiple polygons that all have the same
  // prescribed value.  All items under the "prescription" key are defined by GeoJSON, except
  // for those under any "properties" keys.  Those properties will be defined by the standards listed
  // in the "types" field above.
  // In general, anything that "changes" in the map (i.e. a product type, variety, rate, etc.) should
  // go inside the properties below.  Anything that is constant throughout the entire map (i.e.
  // like "crop" above), shoud be listed as a parameter on the standard doc type that it goes with.
  geojson: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        // "geometry" can be anything defined as a valid geometry by geojson: Polygon, MultiPolygon, etc.
        // Note that a polygon is comprised of an exterior ring followed optionally by interior "exclusion"
        // rings (i.e. "holes" in the polygon itself).
        geometry: { type: "Polygon", "coordinates": [ ["... some coordinates for polygon"] ] },
        properties: {
          zone: "kdjf203",
        },
      },
      {
        type: "Feature",
        geometry: { 
          type: "MultiPolygon", 
          "coodinates": [ 
            [ ["... some coordinates for polygon1"] ],
            [ ["... some coordinates for polygon2"] ],
          ]
        },
        properties: {
          zone: "8f2jjokd",
        },
      }
    ] // end of "features" key
  } // end of "geojson" key
}.
