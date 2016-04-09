/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai'),
    assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

var os = require('os');
var fs = require('fs');
var mkdirp = require('mkdirp');
var miniDeepAssign = require('mini-deep-assign');

describe('config-dir-all', function () {
  var hostname = os.hostname();
  var hostnameDir = __dirname + '/config2/'+hostname;
  var hostnameFile = hostnameDir+'/test.json';

  before('before', function () {

  });

  beforeEach('beforeEach', function () {
    //delete process.env.NODE_ENV = undefined;
    delete process.env.NODE_ENV;
   });

  afterEach('afterEach', function () {
    try {
      fs.unlinkSync(hostnameFile);
      fs.rmdirSync(hostnameDir);
    } catch(e) {
      // hide exception if not exists
    }
  });

  after('after', function () {

  });

  it('# throw if directory does not exists', function () {
    expect( function() {
      require('../')('this-directory-does-not-exists');
    }).throw();
  });

  it('# read single config', function () {
    var config1 = require('../')('./config1');
    //console.log('config1:', config1);
    expect(config1).eql({ test: require('./config1/default/test.json') });
  });

  it('# read array of config dirs', function () {
    var config = require('../')([ './config1', './config2' ], { verbose: true });
    //console.log('config1:', config1);
    var res = miniDeepAssign(
      {},
      require('./config1/default/test.json'),
      require('./config2/default/test.json')
    );
    expect(config).eql({ test: res });
  });

  it('# read array of config dirs and NODE_ENV', function () {
    process.env.NODE_ENV = 'testenv';

    var config = require('../')([ './config1', './config2' ], { verbose: true });
    //console.log('config1:', config1);
    var res = miniDeepAssign(
      {},
      require('./config1/default/test.json'),
      require('./config2/default/test.json'),
      require('./config2/testenv/test.json')
    );
    expect(config).eql({ test: res });
  });

  it('# read array of config dirs, NODE_ENV, hostname', function () {
    process.env.NODE_ENV = 'testenv';
    mkdirp(hostnameDir);
    fs.writeFileSync(hostnameFile, JSON.stringify({
      'key': 'config2-hostname-value',
      'key2': 'config2-hostname-value2',
      'key3': 'config2-hostname-value3',
      'key5': 'config2-hostname-value5'
    }, null, 2), { encoding: 'utf8' });

    var config = require('../')([ './config1', './config2' ], { verbose: true });
    //console.log('config1:', config1);
    var res = miniDeepAssign(
      {},
      require('./config1/default/test.json'),
      require('./config2/default/test.json'),
      require('./config2/testenv/test.json'),
      require(hostnameFile)
    );
    expect(config).eql({ test: res });
  });

});
