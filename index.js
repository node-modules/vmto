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

exports.to = function (src, convertor) {
  var ast = parser.parse(src);
  var len = ast.body.length;
  var out = '';
  for (var i = 0; i < len; i++) {
    var part = ast.body[i];
    if (part.type === 'Text') {
      out += part.value;
    } else {
      out += convertor['to' + part.type](part);
    }
  }
  return out;
};

var nunjucksConvertor = new NunjucksConvertor();

exports.nunjucks = function (src) {
  return exports.to(src, nunjucksConvertor);
};
