vmto
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/vmto.svg?style=flat-square
[npm-url]: https://npmjs.org/package/vmto
[travis-image]: https://img.shields.io/travis/node-modules/vmto.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/vmto
[codecov-image]: https://codecov.io/github/node-modules/vmto/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/vmto?branch=master
[david-image]: https://img.shields.io/david/node-modules/vmto.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/vmto
[download-image]: https://img.shields.io/npm/dm/vmto.svg?style=flat-square
[download-url]: https://npmjs.org/package/vmto

velocity(vm) to any other templates.

## Support templates

* [x] nunjucks
* [ ] ejs

## Install

```bash
$ npm install vmto
```

## Usage

```js
var vmto = require('vmto');

console.log(vmto.nunjucks("hello, ${name}!"));
// hello, {{name}}!
```

**Array support**

vmto transforms ArrayList(eg. [1, 2, 3]) to `VelocityArray(1, 2, 3)` to
support invocations like `$arr.size()` now(since 1.1.0), you must add
`vmto.VelocityArray` to your `nunjucks.Environment` instance to get
things work.

```js
var env = new nunjucks.Environment(...);
env.addGlobal(vmto.VelocityArray);
```

## options

### macros

custom your macros

```js
var opt = {
  macros: {
    cmsparse: function (path) {
      return '{% include ' + path + ' %}';
    }
  }
};

vmto.nunjucks('#cmsparse($uribroker_path)', opt)
// {% include uribroker_path %}
```

### escape

use safe filter when set escape false

```js
vmto.nunjucks("hello, $name", { escape: false})
// hello, {{name | safe}}
```

## License

(The MIT License)

Copyright (c) 2014 fengmk2 &lt;fengmk2@gmail.com&gt; and other contributors
Copyright (c) 2015 node-modules and other contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
