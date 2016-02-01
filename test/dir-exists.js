/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai'),
    assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

var dirExistsSync  = require('../lib/dir-exists').sync;
var dirExistsAsync = require('../lib/dir-exists').async;

var existingDir    = '.';
var nonExistingDir = 'this-directory-does-not exists';
var existingFile   = './' + __filename;
var nonAccessibleDir = '/root/anything';

describe('dir-exists.sync', function () {

  it('should return true for existing directory', function () {
    expect(dirExistsSync(existingDir)).to.be.ok;
  });

  it('should return false for non-existing directory', function () {
    expect(dirExistsSync(nonExistingDir)).to.be.not.ok;
  });

  it('should return false for file', function () {
    expect(dirExistsSync(existingFile)).to.be.not.ok;
  });

  it('should throw on insufficient right on unix', function () {
    expect(function() {
      dirExistsSync(nonAccessibleDir);
    }).throw();
  });

});


describe('dir-exists.async', function () {

  it('should return true for existing directory', function () {
    dirExistsAsync(existingDir, function(err, result) {
      expect(err).to.be.null;
      expect(result).to.be.ok;
    });
  });

  it('should return false for non-existing directory', function () {
    //expect(dirExistsSync(nonExistingDir)).to.be.not.ok;
    dirExistsAsync(nonExistingDir, function(err, result) {
      expect(err).to.be.null;
      expect(result).to.be.not.ok;
    });
  });

  it('should return false for file', function () {
    //expect(dirExistsSync(existingFile)).to.be.not.ok;
    dirExistsAsync(existingFile, function(err, result) {
      expect(err).to.be.null;
      expect(result).to.be.not.ok;
    });
  });

  it('should return error on insufficient right on unix', function () {
      //dirExistsSync(nonAccessibleDir);
    dirExistsAsync(nonAccessibleDir, function(err, result) {
      expect(err).to.be.not.ok;
      expect(result).to.be.undefined;
    });
  });

});
