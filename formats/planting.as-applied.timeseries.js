{
  // The inclusion of _meta._mediaType is not part of the format, it
  // is simply informational for people browsing the format.
  _meta: { _mediaType: "application/vnd.oada.planting.as-applied.timeseries.1" },

  // As-applied data is organized geographically according to tiles defined
  // by a 7-character geohash.  Time-series

  // A geohash that is 7 characters long corresponds to a tile that is approximately 153 meters square
  // near the equator, or about 5 acres.  The tiles get smaller as you move up or down in latitude, 
  // so this corresponds to about 2.5 acres per tile around the American midwest.  There is no
  // restriction in this format about the length of geohash you can use, however 7 characters
  // is a good tile size for grouping points.  The next tile size up (6 characters) is about 183 acres
  // per tile at the equator.  http://www.movable-type.co.uk/scripts/geohash.html has some good
  // information and a nice geohash converter/map viewer.
  //
  // At a 1-point-per-second sampling rate for an 8-row corn head working at 4 miles per hour, that would
  // be 117 square feet per sample (5.8667 linear feet traveled in 1 second * 20-foot swath), or 930 data points
  // per 2.5-acre tile, and 1861 data points per 5-acre tile.
  //
  geohashes: {
    // Each geohash is a separate resource that contains as-applied
    // data which falls within the bounds of the tile.  Note that since this
    // is timeseries data, the geohash is determined by a timeseries of 
    // GPS coordinates recorded for each machine.  Since the data has not yet
    // been processed into a precise map with correct GPS coordinates at each point,
    // if you want to make sure you get all possible data that may overlap a particular
    // tile, you will want to get all the tiles surrounding a particular tile to
    // compensate for edge effects, time lags, and calibration offsets.
    // The map-reconciled version of data still has edge effect issues with the tiles
    // (as do all geometries), however the issues are less pronounced.
    "dp4jzje": { _id: "jfd0kw", _rev: "2-kljslkfsd" },
    "dp4jzjf": { _id: "920o4i", _rev: "1-sd0f9sojk" },
  }

}
