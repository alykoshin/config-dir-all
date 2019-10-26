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

const os = require('os');
const path = require('path');

const debug = require('debug')('config-dir-all');

const req = require('require-dir-all');
const deepAssign = require('mini-deep-assign');
const moduleParent = require('module-parent');
const miniFs = require('mini-fs');


const buildDirList = function(options) {

  function pushDefault(dirs) {
    dirs.push('default');
  }

  function pushNodeEnv(dirs) {
    const env = process.env.NODE_ENV;
    debug(`* process.env.NODE_ENV: "${env}"`);
    if (typeof env !== 'undefined') {
      dirs.push(env);
    }
  }

  function pushHostname(dirs) {
    const hostname = os.hostname();
    debug(`* os.hostname(): "${hostname}"`);
    if (typeof hostname !== 'undefined') {
      dirs.push(hostname);
    }
  }

  function pushNodeEnvHostname(dirs) {
    const env = process.env.NODE_ENV;
    const hostname = os.hostname();
    if (typeof env !== 'undefined' && typeof hostname !== 'undefined') {
      dirs.push(path.join(env, hostname));
    }
  }

  const dirs = [];
  pushDefault(dirs);
  pushNodeEnv(dirs);
  pushHostname(dirs);
  pushNodeEnvHostname(dirs);

  debug(`* getDirs(): dirs: [${dirs.join(',')}]`);

  return dirs;
};


const getFromDirs = function(rootDir, subDirs/*, options*/) {
  const configs = [];

  for (let len=subDirs.length, i=0; i<len; ++i) {

    const subConfig = req(path.join(rootDir, subDirs[i]), { throwNoDir: false, _parentsToSkip: 1, recursive: true, indexAsParent: true });
    configs.push(subConfig);

  }

  //debug('* getFromDirs(): configs: '+ JSON.stringify(configs,null,2));
  return configs;
};


//const getFromEnv = function(options) {
//
//	const config = {};
//	const envConfig = process.env.NODE_CONFIG;
//
//	if (typeof envConfig !== 'undefined') {
//		try {
//			config = JSON.parse(envConfig);
//		} catch (e) {
//			throw 'Environment variable NODE_CONFIG must have valid JSON value.';
//		}
//	}
//
//	debug('* getFromEnv(): config: '+ JSON.stringify(config,null,2));
//	return config;
//};


const stringToConfig = function(s, nameOfString) {
  let config = {};
  if (typeof s !== 'undefined' && s.length !== 0) {
    try {
      config = JSON.parse(s);
    } catch (e) {
      throw nameOfString + ' must have valid JSON value (' + e.name+': ' + e.message + '), found: "' + s +'"';
    }
  }
  return config;
};


const getFromEnv = function(/*options*/) {
  const envConfig = process.env.NODE_CONFIG;
  const config = stringToConfig(envConfig, 'Environment variable NODE_CONFIG');

  //debug('* getFromEnv(): config: '+ JSON.stringify(config,null,2));
  return config;
};


const getFromArgs = function(/*options*/) {

  const argKey  = '--';
  const argName = 'NODE_CONFIG';
  const argEq   = '=';

  let config = {};

  for (let len=process.argv.length, i=2; i<len; ++i) {
    const argPrefix = argKey+argName+argEq;

    if (process.argv[i ].indexOf(argPrefix) === 0) {
      // argument '--NODE_CONFIG=xyz' found
      const argConfig = process.argv[i ].substr(argPrefix.length);

      config = stringToConfig(argConfig, 'Command line argument NODE_CONFIG');
      break;
    }
  }

  //debug('* getFromArgs(): config: '+ JSON.stringify(config,null,2));
  return config;
};


function mergeConfigs(configs) {
  let config = {};

  for (let len=configs.length, i=0; i<len; ++i) {
    config = deepAssign(config, configs[ i ]);
  }

  return config;
}


function ensureRootExists(relOrAbsDir, options) {
  const originalModule = moduleParent(module, 0);
  const parentDir      = path.dirname(originalModule.filename);
  const absDir         = path.resolve(parentDir, relOrAbsDir);
  if (!miniFs.dirExistsSync(absDir)) {
    const msg = `Directory does not exists: "${relOrAbsDir}"`;
    if (options.throwNoDir) {
      throw new Error(msg);
    }
    debug(msg);
  }
  return absDir;
}

const configure = function(relOrAbsDir, options) {
  options = options || {};

  if (typeof relOrAbsDir == 'string') {
    relOrAbsDir = [relOrAbsDir];
  }

  const subDirs = buildDirList(options);
  let configs = [];

  for (let len=relOrAbsDir.length, i=0; i<len; ++i) {
    ensureRootExists(relOrAbsDir[i], options);
    const conf = getFromDirs(relOrAbsDir[i], subDirs, options);
    configs = configs.concat(conf);
  }
  configs.push(getFromEnv(options));
  configs.push(getFromArgs(options));

  //debug('* configure(): configs:' + JSON.stringify(configs));
  //debug('* configure(): configs: '+ JSON.stringify(configs,null,2));

  const config = mergeConfigs(configs);

  //debug('* configure(): config: '+ JSON.stringify(config,null,2));
  return config;
};


module.exports = configure;

