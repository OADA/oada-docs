var Promise = require('bluebird');
var wsd = Promise.promisifyAll(require('websequencediagrams'));
var fs = Promise.promisifyAll(require('fs'));
var args = require('minimist')(process.argv.slice(2));
var path = require('path');

// USAGE: node generate_sequence_diagrams.js path1/file1.wsd path2/file2.wsd path3/file3.wsd
// will create files path1/file1.svg, path1/file2.svg, etc.
// If you name the wsd file 'something.style-modern-blue.wsd', then it will make the style modern-blue

var opts = {
  outputType: 'png',
  outputStyle: 'napkin'
};

var dir_prefix = __dirname + '/../';
if (args.d) dir_prefix = args.d + '/';

Promise.map(args._, function(input_path) {
  if (input_path.match(/node_modules/)) return;
  input_path = path.normalize(dir_prefix + input_path);
  var output_path = input_path.replace(/\.wsd$/,'.'+opts.outputType);

  if (input_path.match(/\.style-modern-blue\./)) {
    opts.outputStyle = 'modern-blue';
    output_path = output_path.replace('.style-modern-blue','');
  }

  return fs.readFileAsync(input_path)
  .then(function(input_buf) {
    return wsd.diagramAsync(input_buf, opts.outputStyle, opts.outputType);
  }).then(function(result, mediatype) {
    return fs.writeFileAsync(output_path, result)
  }).then(function() {
    console.log('Created ' + output_path+ ' successfully.');
  }).catch(function(err) {
    console.log('ERROR: could not create diagram from ' + path + '.  Error = ', err);
  });
}).then(function() {
  // Done!
});

