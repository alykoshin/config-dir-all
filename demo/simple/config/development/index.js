'use strict';


var httpPort =  8080;
var httpsPort =  8081;

var devConfig = {
  client: {
    url: 'http://localhost:' + httpPort
  },
  server: {
    httpPort: httpPort,
    httpsPort:httpsPort
  }
};


module.exports = devConfig;
