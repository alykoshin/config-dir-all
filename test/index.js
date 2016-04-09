/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai'),
    assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

var miniDeepAssign = require('mini-deep-assign');


describe('config-dir-all', function () {

  before('before', function () {

  });

  beforeEach('beforeEach', function () {

  });

  afterEach('afterEach', function () {

  });

  after('after', function () {

  });

  it('# throw if directory does not exists', function () {
    expect( function() {
      var config = require('../')('this-directory-does-not-exists');
    }).throw();
  });

  it('# read single config', function () {
    var config1 = require('../')('./config1');
    //console.log('config1:', config1);
    expect(config1).eql({ test: require('./config1/default/test.json') });
  });

  it('# read array of configs', function () {
    var config = require('../')([ './config1', './config2' ]);
    //console.log('config1:', config1);
    var res = miniDeepAssign(
      {},
      require('./config1/default/test.json'),
      require('./config2/default/test.json')
    );
    expect(config).eql({ test: res });
  });

});
