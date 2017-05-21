{
  _type: "application/vnd.oada.harvest.as-harveted.map.yield-moisture.1+json" },

  // All keys are considered optional as per the normal OADA duck-typing preferecence.
  // If they are there, you can do things with them.  If they are not, handle their absence.

  configurations: {

    // The 'default' configuration says what units and crop to use in other configurations
    // if those are not specified.  A specific configuration can override the default.
    'default': {  
      crop: {
        standard: 'CNH',
        name: 'CORN',
        id: '001',
      },
      units: { // If none of these are specified, we should provide a 'default' set with the standard
        gps: { lat: 'deg', lon: 'deg' },
        time: 'unix',
        yield: 'dry bu/ac',
        moisture: '% water',
        width: 'in',
      },

    },

    // Here is one configuration that contains recorded data:
    "02kjfo2sfd": {
      machine: {
        link: { _id: 'resources/209u2r3', _rev: '3-kdfj02l' },
        name: '6088 combine',
      },
      data: {
        // 'data' is an object here rather than an array so that you can 
        // safely POST data here in a distributed system.  The ordering
        // of the data is not specified: you'll have to order it on your
        // own if you want some particular ordering.
        'kj02fkl': {
          t: 129039812.457, // unix timestamp
          gps: { lat: '40.790078', lon: '-86.360114' },
          width: '240',
          yield: '189.64',
          moisture: '21.54',
        }
      },
    },

    // Here is another configuration that contains recorded data from 
    // a different machine.  Every machine should make it's own configuration.
    // One machine may have many configurations.
    "kdj20fkdk": { // This is data from a different machine in this tile
      machine: {
        link: { _id: 'resources/fej02jfkwl' }, // different combine than the other configuration
        name: '8010 combine',
      },
      data: {
        'kj02fkl': { 
          t: 129039812.457, // unix timestamp
          gps: { lat: '40.790078', lon: '-86.360114' },
          width: '240',
          yield: '189.64',
          moisture: '21.54',
        }
      },
    },

  },
}
