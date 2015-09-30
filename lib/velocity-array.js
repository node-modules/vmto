/**!
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   shaoshuai0102 <shaoshuai0102@gmail.com> (http://shaoshuai.me)
 */

'use strict';

function VelocityArray() {}

VelocityArray.prototype = [];

VelocityArray.prototype.contains = function(value) {
  return this.some(function(v) {
    return v === value;
  });
};

VelocityArray.prototype.size = function() {
  return this.length;
};

module.exports = function() {
  var result = new VelocityArray();
  for (var i = 0, l = arguments.length; i < l; i++) {
    result.push(arguments[i]);
  }

  return result;
};
