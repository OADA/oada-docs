{
  // Note the inclusion of _meta is for the information of the reader only.
  _meta: _mediaType: "application/vnd.oada.planting.as-applied.timeseries.geohash";

  // This format represents the data that resides at one time series geohash tile.
  // The types of data which exist at this tile are duck-typed according to the
  // OADA format definition for various keys.
  namespace: {
    name: "oada.types.planting.as-applied.timeseries",
    src: "https://github.com/oada/oada-docs/blob/master/formats" // will formalize this URL
  },

  // Each type of data here is its own resource.  Given the tile size we've defined,
  // each one should contain on the order of 1,000 points.  Each will also contain
  // information such as calibrations, machine information, etc.  The "position" key
  // in particular is the time series stream of GPS points used to determine each
  // machine's time spent operating in this tile.  Note that these keys are not
  // guaranteed to exist, but if they exist, their content is well defined.  This is
  // because different farms and different machines will have different data recording
  // capabilities.
    position: { _id: "resources/902jfk", _rev: "3-d802fhjk" },
    coverage: { _id: "resources/kjdf20", _rev: "9-2o0kfkdj" },
  population: { _id: "resources/9023jf", _rev: "1-kdp022hl" },
   downforce: { _id: "resources/kjf02f", _rev: "3-92kdjf02" },
       skips: { _id: "resources/kdjf02", _rev: "6-02nfk2kl" },
        crop: { _id: "resources/9kjdfd", _rev: "7-dkd0p2kl" },
       speed: { _id: "resources/xkxzld", _rev: "2-oo04f2jl" },
     heading: { _id: "resources/SDkfdk", _rev: "1-kdjfo2kl" }
}
