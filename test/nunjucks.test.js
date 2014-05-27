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
var utils = require('./utils');

describe('nunjucks.test.js', function () {
  it('should convert Reference => Identifier `${name}`', function () {
    vmto.nunjucks("hello, $name!").should.equal('hello, {{name}}!');
    vmto.nunjucks("hello, ${name}!").should.equal('hello, {{name}}!');
    vmto.nunjucks("hello, ${name}! ${action} ops...").should.equal('hello, {{name}}! {{action}} ops...');

    vmto.nunjucks("hello, $!name!").should.equal('hello, {{name}}!');
    vmto.nunjucks("hello, $!{name}!").should.equal('hello, {{name}}!');
  });

  it('should convert Reference => Property => Identifier & Prop `$user.nick`', function () {
    vmto.nunjucks("hello, $user.nick!").should.equal('hello, {{user.nick}}!');
    vmto.nunjucks("hello, ${user.nick}!").should.equal('hello, {{user.nick}}!');
    vmto.nunjucks("hello, ${user.nick}! ${action} ops...").should.equal('hello, {{user.nick}}! {{action}} ops...');

    vmto.nunjucks("hello, $!user.nick!").should.equal('hello, {{user.nick}}!');
    vmto.nunjucks("hello, $!{user.nick}!").should.equal('hello, {{user.nick}}!');
  });

  it('should convert AssignExpr `#set`', function () {
    vmto.nunjucks('#set($a = 1)').should.equal('{% set a = 1 %}');
    vmto.nunjucks('#set($a = "foo $bar")').should.equal('{% set a = \'foo \' + bar %}');
    vmto.nunjucks('#set($a = "$foo bar")').should.equal('{% set a = foo + \' bar\' %}');
    vmto.nunjucks('#set($a = "$foo bar $user.name")').should.equal('{% set a = foo + \' bar \' + user.name %}');
    vmto.nunjucks('#set($a = \'foo\')').should.equal('{% set a = \'foo\' %}');
    vmto.nunjucks('#set($a = $b)').should.equal('{% set a = b %}');
    vmto.nunjucks('#set( $a = $b )').should.equal('{% set a = b %}');
  });

  it('should convert Reference => Method', function () {
    vmto.nunjucks('${hangjs.hello()}').should.equal('{{hangjs.hello()}}');
    vmto.nunjucks('$hangjs.hello()').should.equal('{{hangjs.hello()}}');
    vmto.nunjucks('$hangjs.hello(123, "456", \'bar\') world')
      .should.equal('{{hangjs.hello(123, \'456\', \'bar\')}} world');

    vmto.nunjucks("$fooServer.getURI('/foo/bar.htm')")
      .should.equal('{{fooServer.getURI(\'/foo/bar.htm\')}}');
  });

  it('should convert If', function () {
    vmto.nunjucks('#if($a)\nfoo $a\n#else\n$b else\n#end')
      .should.equal('{% if a %}\nfoo {{a}}\n{% else %}\n{{b}} else\n{% endif %}');
    vmto.nunjucks('#if($a)foo#else b#end')
      .should.equal('{% if a %}foo{% else %} b{% endif %}');
    vmto.nunjucks('#if($a)\n$a\n#elseif($b)\n$b\n#elseif($c)\n$c\n#end')
      .should.equal('{% if a %}\n{{a}}\n{% elif b %}\n{{b}}\n{% elif c %}\n{{c}}\n{% endif %}');

    vmto.nunjucks('#if(!$a)\n!$a\n#end').should.equal('{% if not a %}\n!{{a}}\n{% endif %}');

    vmto.nunjucks('#if($a || $b)\n$a or $b\n#end')
      .should.equal('{% if a or b %}\n{{a}} or {{b}}\n{% endif %}');

    vmto.nunjucks('#if($a || $b || !$c)\n$a or $b or not $c\n#end')
      .should.equal('{% if a or b or not c %}\n{{a}} or {{b}} or not {{c}}\n{% endif %}');
    vmto.nunjucks('#if($a && $b || !$c)\nfoo\n#end')
      .should.equal('{% if a and b or not c %}\nfoo\n{% endif %}');
    vmto.nunjucks('#if($a && $b && !$c)\nfoo\n#end')
      .should.equal('{% if a and b and not c %}\nfoo\n{% endif %}');
    vmto.nunjucks('#if(($a || $b) && !$c)\nfoo\n#end')
      .should.equal('{% if (a or b) and not c %}\nfoo\n{% endif %}');
    vmto.nunjucks('#if($a && ($b || !$c))\nfoo\n#end')
      .should.equal('{% if a and (b or not c) %}\nfoo\n{% endif %}');

    vmto.nunjucks('#if($a && ($b && !$c))\nfoo\n#end')
      .should.equal('{% if a and b and not c %}\nfoo\n{% endif %}');
    vmto.nunjucks('#if(($a || $b) || !$c)\n$a or $b or not $c\n#end')
      .should.equal('{% if a or b or not c %}\n{{a}} or {{b}} or not {{c}}\n{% endif %}');
    vmto.nunjucks('#if($a || ($b || !$c))\n$a or $b or not $c\n#end')
      .should.equal('{% if a or b or not c %}\n{{a}} or {{b}} or not {{c}}\n{% endif %}');
    vmto.nunjucks('#if($a || ($b || !$c))\n$a or $b or not $c\n#end')
      .should.equal('{% if a or b or not c %}\n{{a}} or {{b}} or not {{c}}\n{% endif %}');
  });

  it('should convert #if("$!uribroker_env"!="")', function () {
    vmto.nunjucks('#if("$!uribroker_env"!="")\nfoo\n#end')
      .should.equal('{% if uribroker_env != \'\' %}\nfoo\n{% endif %}');
    vmto.nunjucks('#if("$!uribroker_env bar"!="bar $foo")\nfoo\n#end')
      .should.equal('{% if uribroker_env + \' bar\' != \'bar \' + foo %}\nfoo\n{% endif %}');
  });

  it('should convert Comment', function () {
    vmto.nunjucks('## This is a single line comment.')
      .should.equal('{# This is a single line comment.#}');
    vmto.nunjucks('##This is a single line comment.     ')
      .should.equal('{#This is a single line comment.     #}');
    vmto.nunjucks(utils.string('multi_comment.vm'))
      .should.equal(utils.string('multi_comment.nj'));
  });

  it('should convert Macro', function () {
    vmto.setMacros({
      cmsparse: function (path) {
        return '{% include ' + path + ' %}';
      },
    });

    vmto.nunjucks('#cmsparse($uribroker_path)')
      .should.equal('{% include uribroker_path %}');

    vmto.nunjucks('#cmsparse($uribroker_path, 123)')
      .should.equal('{% include uribroker_path %}');

    vmto.nunjucks('#macroFoo($uribroker_path)')
      .should.equal('{% macroFoo(uribroker_path) %}');

    vmto.nunjucks('#macroFoo($uribroker_path, "foo")')
      .should.equal('{% macroFoo(uribroker_path, \'foo\') %}');
    vmto.nunjucks('#macroFoo($uribroker_path, \'foo\', 123)')
      .should.equal('{% macroFoo(uribroker_path, \'foo\', 123) %}');

    vmto.nunjucks(
'#if("$!uribroker_env"!="") \
  #set($uribroker_path="alipay/nav/uribroker_$!{uribroker_env}.vm") \
  #cmsparse($uribroker_path) \
#end').should.equal(
'{% if uribroker_env != \'\' %} \
  {% set uribroker_path = \'alipay/nav/uribroker_\' + uribroker_env + \'.vm\' %} \
  {% include uribroker_path %} \
{% endif %}');
  });

  it('should convert Parse', function () {
    vmto.nunjucks('#parse($uribroker_path)')
      .should.equal('{% include uribroker_path %}');
  });
});
