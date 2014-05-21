/**!
 * vmto - lib/nunjucks.js
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

module.exports = NunjucksConvertor;

function NunjucksConvertor() {

}

var proto = NunjucksConvertor.prototype;

proto.toReference = function (ref) {
  // { type: 'Reference',
  //   pos: { first_line: 1, last_line: 1, first_column: 7, last_column: 14 },
  //   object: { type: 'Identifier', pos: [Object], name: 'name' },
  //   wrapped: true }
  return '{{' + ref.object.name + '}}';
};
