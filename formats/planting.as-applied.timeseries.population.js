{
  _meta: { _mediaType: "application/vnd.oada.planting.as-applied.timeseries.population" },
  // This file represents a time series of seed population data records.

  // It can contain any number of data points, however it is recommended to keep the
  // size reasonably small to improve streaming and synchronization.  In the context
  // in which it was developed, the time series data in one of these resources
  // will correspond to a single 7-character geohash-defined tile.

  // Since the population records themselves will vary by machine, and different
  // machines should not have to worry about interleaving their time series with
  // the time series of other machines, the first level of organization in this
  // file will be by machine configurations:
  configurations: {
    "kd20jkfdl": {
      machines: {
        tractor: { _id: "resources/kdj02fjkd", _rev: "1-dkjf02ddf" },
        implement: { _id: "resources/4iofjikd", _rev: "3-dkjdfowf" },
        sections: {
          number: 16, // The planter has 16 independently-controlled sections that can adjust population
          units: {
            name: "inches",
            src: "https://openag.io/standards/units"
          },
          center_offset: {
            distance: "0",
          },
          // Expect to have one width per section (number listed above)
          widths: [ 30, 30, 30, 30, 30, 30, 30,
                    30, 30, 30, 30, 30, 30, 30 ]
        }
      },
      data: [
        { t: 129039812.457, population: [32.987, 32.523, 53.342... ] }, // These will always be unix timstamps
        { t: 129039812.457, population: [32.987, 32.523, 53.342... ] }, // These will always be unix timstamps
        { t: 129039812.457, population: [32.987, 32.523, 53.342... ] }, // These will always be unix timstamps
        {},
      ],

  },
