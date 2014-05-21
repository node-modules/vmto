/**!
 * vmto - test/nunjucks.test.js
 *
 * Copyright(c) 2014 fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var vmto = require('../');

describe('nunjucks.test.js', function () {
  it('should convert Reference', function () {
    vmto.nunjucks("hello, $name!").should.equal('hello, {{name}}!');
    vmto.nunjucks("hello, ${name}!").should.equal('hello, {{name}}!');
    vmto.nunjucks("hello, ${name}! ${action} ops...").should.equal('hello, {{name}}! {{action}} ops...');

    vmto.nunjucks("hello, $!name!").should.equal('hello, {{name}}!');
    vmto.nunjucks("hello, $!{name}!").should.equal('hello, {{name}}!');
  });
});
