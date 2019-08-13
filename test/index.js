/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai'),
    assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

var os = require('os');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var miniDeepAssign = require('mini-deep-assign');

const testDataDir = path.resolve(__dirname, '../test-data/');

describe('config-dir-all', function () {
  var hostname = os.hostname();
  var hostnameDir = testDataDir + '/config2/'+hostname;
  var hostnameFile = hostnameDir+'/test.json';

  function rmHostnameFile() {
    try {
      fs.unlinkSync(hostnameFile);
      fs.rmdirSync(hostnameDir);
    } catch(e) {
      // hide exception if not exists
    }
  }


  before('before', function () {

  });

  beforeEach('beforeEach', function () {
    //delete process.env.NODE_ENV = undefined;
    delete process.env.NODE_ENV;
    rmHostnameFile();
  });

  afterEach('afterEach', function () {
    rmHostnameFile();
   });

  after('after', function () {

  });

  it('# not throw if directory does not exists, return empty config', function () {
    expect( function() {
      var config = require('../')('this-directory-does-not-exists');
      expect(config).eql({});
    }).not.throw();
  });

  it('# read single config', function () {
    var config1 = require('../')(testDataDir+'/config1');
    //console.log('config1:', config1);
    expect(config1).eql({ test: require(path.join(testDataDir, './config1/default/test.json')) });
  });

  it('# read array of config dirs', function () {
    var config = require('../')([ testDataDir+'/config1', testDataDir+'/config2' ], { verbose: true });
    //console.log('config1:', config1);
    var res = miniDeepAssign(
      {},
      require(path.join(testDataDir, 'config1/default/test.json')),
      require(path.join(testDataDir, 'config2/default/test.json'))
    );
    expect(config).eql({ test: res });
  });

  it('# read array of config dirs and NODE_ENV', function () {
    process.env.NODE_ENV = 'testenv';

    var config = require('../')([ testDataDir+'/config1', testDataDir+'/config2' ], { verbose: true });
    //console.log('config1:', config1);
    var res = miniDeepAssign(
      {},
      require(path.join(testDataDir, 'config1/default/test.json')),
      require(path.join(testDataDir, 'config2/default/test.json')),
      require(path.join(testDataDir, 'config2/testenv/test.json'))
    );
    expect(config).eql({ test: res });
  });

  it('# read array of config dirs, NODE_ENV, hostname', function () {
    process.env.NODE_ENV = 'testenv';

    mkdirp.sync(hostnameDir);
    fs.writeFileSync(hostnameFile, JSON.stringify({
      'key':  'config2-hostname-value',
      'key2': 'config2-hostname-value2',
      'key3': 'config2-hostname-value3',
      'key5': 'config2-hostname-value5'
    }, null, 2), { encoding: 'utf8' });

    var config = require('../')([ testDataDir+'/config1', testDataDir+'/config2' ], { verbose: true });
    //console.log('config1:', config1);
    var res = miniDeepAssign(
      {},
      require(path.join(testDataDir, 'config1/default/test.json')),
      require(path.join(testDataDir, 'config2/default/test.json')),
      require(path.join(testDataDir, 'config2/testenv/test.json')),
      require(hostnameFile)
    );
    expect(config).eql({ test: res });
  });

});
