/**!
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   shaoshuai0102 <shaoshuai0102@gmail.com> (http://shaoshuai.me)
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var vmto = require('../');
var VelocityArray = vmto.VelocityArray;

describe('nunjucks.test.js', function() {
  it('should work like array', function() {
    var arr = VelocityArray(1, '2', 3);
    arr.length.should.equal(3);
  });

  it('should have extended methods', function() {
    var arr = VelocityArray(1, '2', 3);
    arr.size().should.equal(3);
    arr.contains('3').should.equal(false);
    arr.contains(1).should.equal(true);
  });
});
