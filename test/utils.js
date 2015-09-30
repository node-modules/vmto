/**!
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');

var fixtures = path.join(__dirname, 'fixtures');

exports.string = function (name) {
  return fs.readFileSync(path.join(fixtures, name), 'utf8');
};
