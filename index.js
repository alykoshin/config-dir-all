'use strict';

/*
 NODE_CONFIG='{"test":"test"}' node conf
 NODE_CONFIG="{\"test\":\"test\"}" node conf
 node conf --NODE_CONFIG='{"test":"test1=test2"}'
 node conf --NODE_CONFIG="{\"test\":\"test1=test2\"}"

 NODE_ENV=production node conf
 NODE_ENV=development node conf
 [
 "default",
 "development",
 "al-nb-02",
 "development/al-nb-02"
 ]

 */

var os = require('os');
var path = require('path');

var req = require('require-dir-all');
var deepAssign = require('mini-deep-assign');
var moduleParent = require('module-parent');
var miniFs = require('mini-fs');


var buildDirList = function(options) {

  function pushDefault(dirs) {
    dirs.push('default');
  }

 function pushNodeEnv(dirs) {
   var env = process.env.NODE_ENV;
   //console.log('* process.env.NODE_ENV: ' + env);
   if (typeof env !== 'undefined') {
     dirs.push(env);
   }
  }

 function pushHostname(dirs) {
   var hostname = os.hostname();
   //console.log('* os.hostname(): ' + hostname);
   if (typeof hostname !== 'undefined') {
     dirs.push(hostname);
   }
  }

 function pushNodeEnvHostname(dirs) {
   var env = process.env.NODE_ENV;
   var hostname = os.hostname();
   if (typeof env !== 'undefined' && typeof hostname !== 'undefined') {
     dirs.push(path.join(env, hostname));
   }
 }

  //var dirs = [ 'default' ];
  var dirs = [];
  pushDefault(dirs);
  pushNodeEnv(dirs);
  pushHostname(dirs);
  pushNodeEnvHostname(dirs);

  if (options.verbose) {
    console.log('* getDirs(): dirs:' + JSON.stringify(dirs,null,1));
  }

  return dirs;
};


var getFromDirs = function(rootDir, subDirs/*, options*/) {
  var configs = [];

  for (var len=subDirs.length, i=0; i<len; ++i) {

    var subConfig = req(path.join(rootDir, subDirs[i]), { throwNoDir: false, _parentsToSkip: 1, recursive: true, indexAsParent: true });
    //config = Object.assign(config, subConfig);
    configs.push(subConfig);

  }

  //console.log('* getFromDirs(): configs: '+ JSON.stringify(configs,null,2));
  return configs;
};


//var getFromEnv = function(options) {
//
//	var config = {};
//	var envConfig = process.env.NODE_CONFIG;
//
//	if (typeof envConfig !== 'undefined') {
//		try {
//			config = JSON.parse(envConfig);
//		} catch (e) {
//			throw 'Environment variable NODE_CONFIG must have valid JSON value.';
//		}
//	}
//
//	console.log('* getFromEnv(): config: '+ JSON.stringify(config,null,2));
//	return config;
//};


var stringToConfig = function(s, nameOfString) {
  var config = {};
  if (typeof s !== 'undefined' && s.length !== 0) {
    try {
      config = JSON.parse(s);
    } catch (e) {
      throw nameOfString + ' must have valid JSON value (' + e.name+': ' + e.message + '), found: "' + s +'"';
    }
  }
  return config;
};


var getFromEnv = function(/*options*/) {
  var envConfig = process.env.NODE_CONFIG;
  var config = stringToConfig(envConfig, 'Environment variable NODE_CONFIG');

  //console.log('* getFromEnv(): config: '+ JSON.stringify(config,null,2));
  return config;
};


var getFromArgs = function(/*options*/) {

  var argKey  = '--';
  var argName = 'NODE_CONFIG';
  var argEq   = '=';

  var config = {};

  for (var len=process.argv.length, i=2; i<len; ++i) {
    var argPrefix = argKey+argName+argEq;

    if (process.argv[i ].indexOf(argPrefix) === 0) {
      // argument '--NODE_CONFIG=xyz' found
      var argConfig = process.argv[i ].substr(argPrefix.length);

      config = stringToConfig(argConfig, 'Command line argument NODE_CONFIG');
      break;
    }
  }

  //console.log('* getFromArgs(): config: '+ JSON.stringify(config,null,2));
  return config;
};


function mergeConfigs(configs) {
  var config = {};

  for (var len=configs.length, i=0; i<len; ++i) {
    //config = Object.assign ? Object.assign(config, configs[ i ]) : assign(config, configs[ i ]);
    config = deepAssign(config, configs[ i ]);
  }

  return config;
}

function ensureRootExists(relOrAbsDir) {
  var originalModule = moduleParent(module, 0);
  var parentDir      = path.dirname(originalModule.filename);
  var absDir         = path.resolve(parentDir, relOrAbsDir);
  if (!miniFs.dirExistsSync(absDir)) {
    throw 'Directory does not exists: "' + relOrAbsDir + '"';
  }
  return absDir;
}

var configure = function(relOrAbsDir, options) {
  options = options || {};

  if (typeof relOrAbsDir == 'string') {
    relOrAbsDir = [relOrAbsDir];
  }

  var subDirs = buildDirList(options);
  var configs = [];

  for (var len=relOrAbsDir.length, i=0; i<len; ++i) {
    ensureRootExists(relOrAbsDir[i]);
    var conf = getFromDirs(relOrAbsDir[i], subDirs, options);
    configs = configs.concat(conf);
  }
  configs.push(getFromEnv(options));
  configs.push(getFromArgs(options));

  if (options.verbose) {
    console.log('* configure(): configs:' + JSON.stringify(configs));
  }
  //console.log('* configure(): configs: '+ JSON.stringify(configs,null,2));

  var config = mergeConfigs(configs);

  //console.log('* configure(): config: '+ JSON.stringify(config,null,2));
  return config;
};


module.exports = configure;

