{

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
  // All geohash tiles in a geohashes collection must have the same geohash length.  
  geohash_precision: 7, // number of characters in the geohashes.
  geohashes: {
    "dp4jzje": {
      _id: "jfd0kw", // each tile is actually a separate resource.  
      types: {
        "oada.planting.as-applied.population": {
          units: "ksds/ac",
        },
        "oada.planting.as-applied.crop": {
          name: "CORN"
        },
        "oada.planting.as-applied.downforce": {
          units: "psi"
        },
        "oada.planting.as-applied.working-width": {
          units: "feet"
        }
      },

      // This array contains all the data objects whose GPS coordinates lie in the tile
      // defined by this Geohash.  The content of each data object is determined by the
      // "types" defined above.
      "type": "FeatureCollection",
      "features": [
        { 
          type: "Point",
          coordinates: [ 23.3423423, -86.93849234 ],
          properties: {
            time: 13298420.903,  // standard unix timestamp
            population: 32.0123, // units specified under "types" above
            downforce: 1.034,    // units specified under "types" above
            working_width: 20.0
          }
        }
      ]
    },
  }

}
