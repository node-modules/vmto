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

var parser = require('velocity').parser;

module.exports = NunjucksConvertor;

function NunjucksConvertor() {

}

var proto = NunjucksConvertor.prototype;

proto.to = function (ast) {
  var len = ast.body.length;
  var out = '';
  for (var i = 0; i < len; i++) {
    var part = ast.body[i];
    if (part.type === 'Text') {
      out += part.value;
    } else {
      out += this['to' + part.type](part);
    }
  }
  return out;
};

proto._toObjectString = function (obj) {
  if (obj.type === 'Identifier') {
    return obj.name;
  } else if (obj.type === 'Property') {
    return obj.object.name + '.' + obj.property.name;
  } else if (obj.type === 'String' || obj.type === 'DString') {
    return "'" + obj.value + "'";
  } else if (obj.type === 'Method') {
    var callee = obj.callee;
    var str = callee.object.name + '.' + callee.property.name + '(';
    var args = obj.arguments || [];
    str += args.map(this._toObjectString.bind(this)).join(', ') + ')';
    return str;
  } else if (obj.type === 'Reference') {
    return this._toObjectString(obj.object);
  } else if (obj.type === 'Statements') {
    return this.to(obj);
  } else if (obj.type === 'UnaryExpr') {
    return obj.operator + this._toObjectString(obj.argument);
  } else {
    return String(obj.value);
  }
};

proto.toReference = function (ref) {
  // $name
  // { type: 'Reference',
  //   pos: { first_line: 1, last_line: 1, first_column: 7, last_column: 14 },
  //   object: { type: 'Identifier', pos: [Object], name: 'name' },
  //   wrapped: true }
  return '{{' + this._toObjectString(ref.object) + '}}';
};

proto.toAssignExpr = function (expr) {
  // { type: 'AssignExpr',
  //   pos: { first_line: 1, last_line: 1, first_column: 5, last_column: 11 },
  //   left: { type: 'Reference', pos: [Object], object: [Object] },
  //   right: { type: 'Integer', pos: [Object], value: 1 } }
  var left = expr.left;
  if (left.type === 'Reference') {
    left = left.object;
  }

  var right = expr.right;
  if (right.type === 'Reference') {
    right = right.object;
  }

  var out = '{% set ' + this._toObjectString(left) + ' = ';

  if (right.type === 'DString') {
    var ast = parser.parse(right.value);
    var last = ast.body.length - 1;
    for (var i = 0; i <= last; i++) {
      var part = ast.body[i];
      if (part.type === 'Text') {
        var text = "'" + part.value + "'";
        if (i > 0) {
          text = ' + ' + text;
        }

        if (i < last) {
          text += ' + ';
        }
        out += text;
        continue;
      }

      if (part.type === 'Reference') {
        part = part.object;
      }
      out += this._toObjectString(part);
    }
  } else {
    out += this._toObjectString(right);
  }

  return out + ' %}';
};

proto.toIf = function (obj) {
  var out = '{% if ';
  var test = obj.test;
  out += this._toObjectString(obj.test);
  out += ' %}';
  out += this._toObjectString(obj.consequent);

  var alternate = obj.alternate;
  while (alternate) {
    if (alternate.test) {
      out += '{% elif ';
      out += this._toObjectString(alternate.test);
      out += ' %}';
      out += this._toObjectString(alternate.consequent);
    } else {
      out += '{% else %}';
      out += this._toObjectString(alternate);
    }
    alternate = alternate.alternate;
  }
  return out + '{% endif %}';
};
