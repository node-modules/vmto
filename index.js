/**!
 * vmto - index.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var parser = require('velocity').parser;
var NunjucksConvertor = require('./lib/nunjucks');

exports.nunjucks = function (src, opt) {
  var ast = parser.parse(src);
  var nunjucksConvertor = new NunjucksConvertor(opt);
  return nunjucksConvertor.to(ast);
};
