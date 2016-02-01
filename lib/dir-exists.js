/**
 * Created by alykoshin on 01.02.16.
 */

'use strict';

var fs = require('fs');


var dirExistsSync = function(dir) {
  try {
    var stats = fs.lstatSync(dir);
    return (stats.isDirectory());  // true only if it is directory
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      return false; // Directory does not exists
    } else {
      throw err;    // Some error
    }
  }
};


var dirExistsAsync = function(dir, cb) {
  if (typeof cb !== 'function') { cb = function() {}; }
  fs.lstat(dir, function(err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        cb(null, false); // Directory does not exists
      } else {
        cb(err);         // Some error
      }
    }
    cb(null, stats.isDirectory());  // true only if it is directory
  });
};


module.exports = {
  dirExists:     dirExistsAsync,
  async:         dirExistsAsync,
  dirExistsSync: dirExistsSync,
  sync:          dirExistsSync
};
