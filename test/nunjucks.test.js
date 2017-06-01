/**!
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.com)
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

  it('should convert stirng.length()', function() {
    vmto.nunjucks("hello, $name.length()!").should.equal('hello, {{name.length}}!');
    vmto.nunjucks("hello, $name.length(1, 2)!").should.equal('hello, {{name.length(1, 2)}}!');
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
    vmto.nunjucks('#set( $a = ["a", "b"] )').should.equal('{% set a = VelocityArray(\'a\', \'b\') %}');
    vmto.nunjucks('#set( $a = "<a href=\'/url\'>some test</a>" )').should.equal('{% set a = \'<a href=\\\'/url\\\'>some test</a>\' %}');
    vmto.nunjucks('#set( $a = "$b" )').should.equal('{% set a = \'\' + b %}');
    vmto.nunjucks('#set($foo="abc <a href=\'$!foo2\' target=\'_blank\' class=\'$!linkInXbox\' seed=\'AQ_CA_noClick\' data-xbox-cfg=\'{w:660,o:true}\'>安装证书</a>。" + "<span class=\'J-security-cert-is-not-use\'></span>")')
        .should.equal('{% set foo = \'abc <a href=\\\'\' + foo2 + \'\\\' target=\\\'_blank\\\' class=\\\'\' + linkInXbox + \'\\\' seed=\\\'AQ_CA_noClick\\\' data-xbox-cfg=\\\'{w:660,o:true}\\\'>安装证书</a>。\' + \'<span class=\\\'J-security-cert-is-not-use\\\'></span>\' %}');
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

  it('should convert #set($uribroker_env="") with emtpy DString', function () {
    vmto.nunjucks('#set($uribroker_env="")')
      .should.equal('{% set uribroker_env = \'\' %}');
    vmto.nunjucks('#set($uribroker_env=" ")')
      .should.equal('{% set uribroker_env = \' \' %}');
  });

  it('should convert Macro', function () {
    var opt = {
      macros: {
        cmsparse: function (path) {
          return '{% include ' + path + ' %}';
        }
      }
    };

    vmto.nunjucks('#cmsparse($uribroker_path)', opt)
      .should.equal('{% include uribroker_path %}');

    vmto.nunjucks('#cmsparse($uribroker_path, 123)', opt)
      .should.equal('{% include uribroker_path %}');

    vmto.nunjucks('#macroFoo($uribroker_path)', opt)
      .should.equal('{% macroFoo(uribroker_path) %}');

    vmto.nunjucks('#macroFoo($uribroker_path, "foo")', opt)
      .should.equal('{% macroFoo(uribroker_path, \'foo\') %}');
    vmto.nunjucks('#macroFoo($uribroker_path, \'foo\', 123)', opt)
      .should.equal('{% macroFoo(uribroker_path, \'foo\', 123) %}');

    vmto.nunjucks(
'#if("$!bar_env"!="") \
  #set($bar_path="foo/nav/bar_$!{bar_env}.vm") \
  #cmsparse($bar_path) \
#end', opt).should.equal(
'{% if bar_env != \'\' %} \
  {% set bar_path = \'foo/nav/bar_\' + bar_env + \'.vm\' %} \
  {% include bar_path %} \
{% endif %}');
  });

  it('should convert Parse', function () {
    vmto.nunjucks('#parse($uribroker_path)')
      .should.equal('{% include uribroker_path %}');
  });

  it('should convert Method', function () {
    vmto.nunjucks('$foo.bar.getSome(\'data\')')
      .should.equal('{{foo.bar.getSome(\'data\')}}');
    vmto.nunjucks('$foo.getSome(\'data\')')
      .should.equal('{{foo.getSome(\'data\')}}');
  });

  it('should convert Property', function () {
    vmto.nunjucks('$!systemUtil.hostInfo.name')
      .should.equal('{{systemUtil.hostInfo.name}}');
    vmto.nunjucks('$systemUtil.hostInfo.name')
      .should.equal('{{systemUtil.hostInfo.name}}');
    vmto.nunjucks('$foo.bar.haha.name')
      .should.equal('{{foo.bar.haha.name}}');
    vmto.nunjucks('${foo.bar.haha.name}')
      .should.equal('{{foo.bar.haha.name}}');
    vmto.nunjucks('$!foo.bar.haha.name')
      .should.equal('{{foo.bar.haha.name}}');
    vmto.nunjucks('$!{foo.bar.haha.name} haha')
      .should.equal('{{foo.bar.haha.name}} haha');
  });

  it('should convert with escape option', function() {
    var opt = {
      escape: false
    };
    vmto.nunjucks("hello, $name!", opt).should.equal('hello, {{name | safe}}!');
    vmto.nunjucks("hello, ${name}!", opt).should.equal('hello, {{name | safe}}!');
    vmto.nunjucks("hello, ${name}! ${action} ops...", opt).should.equal('hello, {{name | safe}}! {{action | safe}} ops...');

    vmto.nunjucks("hello, $!name!", opt).should.equal('hello, {{name | safe}}!');
    vmto.nunjucks("hello, $!{name}!", opt).should.equal('hello, {{name | safe}}!');
  });

  it('should convert foreach', function() {
    vmto.nunjucks('#foreach($item in ["a", "b"])$item#end')
      .should.equal('{% for item in VelocityArray(\'a\', \'b\') %}{{item}}{% endfor %}');
    vmto.nunjucks('#foreach($item in $somelist)$item#end')
      .should.equal('{% for item in somelist %}{{item}}{% endfor %}');
  });
});
