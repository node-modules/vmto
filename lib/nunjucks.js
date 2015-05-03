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

function NunjucksConvertor(opt) {
  opt || (opt = {});
  this._macros = opt.macros || {};
  this.escape = opt.escape !== false;
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
    var out = '';
    if (obj.object.type !== 'Prop') {
      out += this._toObjectString(obj.object);
    } else {
      out += obj.object.name;
    }

    if (obj.property.type !== 'Prop') {
      out += '.' + this._toObjectString(obj.property);
    } else {
      out += '.' + obj.property.name;
    }
    return out;
  } else if (obj.type === 'String') {
    return "'" + obj.value + "'";
  } else if (obj.type === 'DString') {
    if (obj.value === '') {
      return "''";
    }

    var ast = parser.parse(obj.value);
    var len = ast.body.length;
    var out = [];
    for (var i = 0; i < len; i++) {
      var part = ast.body[i];
      var s = this._toObjectString(part);
      if (part.type === 'Text') {
        s = "'" + s + "'";
      }
      out.push(s);
    }
    return out.join(' + ');
  } else if (obj.type === 'Method') {
    var callee = obj.callee;
    var str = this._toObjectString(callee.object) + '.' + callee.property.name + '(';
    var args = obj.arguments || [];
    str += args.map(this._toObjectString.bind(this)).join(', ') + ')';
    return str;
  } else if (obj.type === 'Reference') {
    return this._toObjectString(obj.object);
  } else if (obj.type === 'Statements') {
    return this.to(obj);
  } else if (obj.type === 'UnaryExpr') {
    return 'not ' + this._toObjectString(obj.argument);
  } else if (obj.type === 'BinaryExpr') {
    var out = this._toObjectString(obj.left);
    if (obj.operator === '&&' && obj.left.operator === '||') {
      // (($a || $b) && $c)
      out = '(' + out + ')';
    }
    var operator = obj.operator;
    if (obj.operator === '||') {
      operator = 'or';
    } else if (obj.operator === '&&') {
      operator = 'and';
    }
    out += ' ' + operator + ' ';
    var right = this._toObjectString(obj.right);
    if (obj.operator === '&&' && obj.right.operator === '||') {
      // ($a && ($b || $c))
      right = '(' + right + ')';
    }
    return out + right;
  } else if (obj.type === 'List') {
    var arr = obj.elements.map(function (v) {
      return this._toObjectString(v);
    }, this);
    return '[' + arr.join(',') + ']';
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
  return '{{' +
    this._toObjectString(ref.object) +
    (this.escape ? '' : ' | safe') +
    '}}';
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

  // If DString and value is not empty string, parse it
  if (right.type === 'DString' && right.value.trim()) {
    var ast = parser.parse(right.value);
    var last = ast.body.length - 1;
    for (var i = 0; i <= last; i++) {
      var part = ast.body[i];
      if (part.type === 'Text') {
        var text = "'" + part.value.replace(/'|"/g, '\\$&') + "'";
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

proto.toComment = proto.toBComment = function (obj) {
  return '{#' + obj.value + '#}';
};

proto.toMacroCall = function (obj) {
  var name = obj.name;
  var fn = this._macros[name];
  var that = this;
  var args = obj.arguments.map(function (arg) {
    return that._toObjectString(arg);
  });
  if (fn) {
    if (typeof fn === 'function') {
      return fn.apply(null, args);
    } else if (typeof fn === 'string') {
      name = fn;
    }
  }
  return '{% ' + name + '(' + args.join(', ') + ') %}';
};

proto.toParse = function (obj) {
  return '{% include ' + this._toObjectString(obj.argument) + ' %}';
};

/*
{ type: 'Foreach',
  pos: { first_line: 33, last_line: 45, first_column: 6, last_column: 10 },
  left:
   { type: 'Reference',
     pos: { first_line: 33, last_line: 33, first_column: 15, last_column: 20 },
     object: { type: 'Identifier', pos: [Object], name: 'item' } },
  right:
   { type: 'Reference',
     pos: { first_line: 33, last_line: 33, first_column: 24, last_column: 37 },
     object: { type: 'Identifier', pos: [Object], name: 'productsList' } },
  body:
   { type: 'Statements',
     pos: { first_line: 33, last_line: 45, first_column: 38, last_column: 6 },
     body: [ [Object], [Object], [Object] ] } }
*/
proto.toForeach = function (obj) {
  if (obj.left.type === 'Reference' && obj.right.type === 'Reference') {
    var r = '{% for ' + obj.left.object.name + ' in ' + obj.right.object.name + ' %}' +
            this.to(obj.body) + '{% endfor %}';
  } else if (obj.left.type === 'Reference' && obj.right.type === 'List') {
    var r = '{% for ' + obj.left.object.name + ' in ' + this._toObjectString(obj.right) + ' %}' +
            this.to(obj.body) + '{% endfor %}';
  } else {
    throw new Error('未考虑完全的Foreach');
  }
  return r;
};
