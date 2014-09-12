vmto
=======

[![Build Status](https://secure.travis-ci.org/node-modules/vmto.png)](http://travis-ci.org/node-modules/vmto)

[![Dependency Status](https://gemnasium.com/node-modules/vmto.png)](https://gemnasium.com/node-modules/vmto)

[![NPM](https://nodei.co/npm/vmto.png?downloads=true&stars=true)](https://nodei.co/npm/vmto/)

![logo](https://raw.github.com/node-modules/vmto/master/logo.png)

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

```
vmto.nunjucks("hello, $name", { escape: false})
// hello, {{name | safe}}
```

## License

(The MIT License)

Copyright (c) 2014 fengmk2 &lt;fengmk2@gmail.com&gt; and other contributors

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
