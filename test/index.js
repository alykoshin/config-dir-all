/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai'),
    assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

describe('config-dir-all', function () {

  before('before', function () {

  });

  beforeEach('beforeEach', function () {

  });

  afterEach('afterEach', function () {

  });

  after('after', function () {

  });

  it('should throw if directory does not exists', function () {

    expect( function() {
      var config = require('../')('this-directory-does-not-exists');
    }).throw();

  });

});
