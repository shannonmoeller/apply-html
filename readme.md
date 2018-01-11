# apply-html

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url]

It's `.innerHTML = ''` for the modern world. Diffs and patches an existing DOM element by [efficiently comparing it](#why) to a string.

## Install

```command
$ npm install --save apply-html
```

## Usage

### Patching

```js
const { html, apply } = require('apply-html');

const content = html`
    <h1>Hello World</h1>
`;

apply(document.body, content);
```

### Interpolation

```js
const { html, raw, apply } = require('apply-html');

const salutation = '<em>Hello</em>';
const target = '<strong>World</strong>';

const content = html`
    <h1>${salutation} ${raw(target)}</h1>
`;

apply(document.body, content);

console.log(document.body.innerHTML);
// -> <h1>&lt;em&gt;Hello&lt;/em&gt; <strong>World</strong></h1>
```

### Server-side rendering

The `html` and `raw` functions return [`SafeString`](#safestring)s which work great in Node.

```js
const http = require('http');
const { html } = require('apply-html');

const content = html`
    <h1>Hello <em>World</em></h1>
`;

http.createServer((req, res) => {
    res.end(content.toString());
}).listen(3000);
```

## Why?

I wanted the rendering simplicity of setting an element's `innerHTML` property coupled with the benefits of DOM diffing and patching. There are many libraries that do this sort of thing, so why another? [Custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements).

Most existing solutions for diffing and patching either replace the DOM with their own virtual representations ([`react`](http://npm.im/react), [`vdom`](http://npm.im/vdom), [`hyperscript`](http://npm.im/hyperscript)) or by diffing two live DOM trees ([`bel`](http://npm.im/bel), [`morphdom`](http://npm.im/morphdom), [`diff-dom`](http://npm.im/diff-dom)). Most of these libraries suffer the same issue in that they call a custom element's constructor before the elements are attached to the DOM leading to unexpected side effects and forcing constructor logic into the `connectedCallback`.

This library is a little bit different. It makes use of an [HTML `<template>`'s](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) unique ability to create an inert [document fragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment). These fragments are full, diffable, DOM trees, but have the added benefit of not triggering resource loading or custom element lifecycle callbacks. This inert document fragment is used to update the live DOM element with [`nanomorph`](http://npm.im/nanomorph), a tiny modern DOM diffing and patching utility.

Thus, `apply-html` ensures that things only start happening if and when they're supposed to. For more examples, see the [original CodePen](https://codepen.io/shannonmoeller/pen/opEdpe?editors=0010).

## API

### `` html`string`: SafeString ``

A template tag that creates a new [SafeString](#safestring) containing a string of HTML. Interpolated values are serialized based on type:

- `Array` - Items are serialized then joined with an empty string (`''`).
- `Boolean|null|undefined` - Converted to an empty string (`''`).
- `Function` - Throws a `TypeError`.
- `Object` - Converted to an HTML-escaped JSON blob.
- `SafeString|Number` - Inserted as-is.
- `String` - Literal strings will be HTML-escaped to safeguard against [XSS](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)). To opt out of escaping, use [`raw()`](#rawstring-safestring).

### `raw(string): SafeString`

- `string` `{String}` String of safe HTML.

Wraps a string in a [SafeString](#safestring) to indicate that it's safe to be inserted into the document. Only use on trusted strings to safeguard against [XSS](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)).

### `apply(element, string): element`

- `element` `{Element}` DOM element with children to be patched.
- `string` `{String|SafeString}` String or [SafeString](#safestring) containing safe HTML to render.

Updates the content of the given element, making the fewest possible changes required to match the given string of HTML. The string is converted into an HTML `<template>` and the DOM trees are compared. Returns the updated original element.

## SafeString

### `new SafeString(string)`

- `string` `{any}` - The value to wrap. Will be coerced into a string with `String()`.

Wraps a string to indicate that the string is safe to be inserted into the DOM. Only use on trusted strings to safeguard against [XSS](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)).

### SafeString Properties

#### `.raw` `{String}`

The wrapped string.

#### `.length` `{Number}`

Length of the wrapped string. Read only.

### SafeString Methods

#### `.toJSON(): String`

Returns the raw string.

#### `.toString(): String`

Returns the raw string.

## Contribute

Standards for this project, including tests, code coverage, and semantics are enforced with a build tool. Pull requests must include passing tests with 100% code coverage and no linting errors.

### Test

```command
$ npm test
```

----

© Shannon Moeller <me@shannonmoeller.com> (shannonmoeller.com)

Licensed under [MIT](http://shannonmoeller.com/mit.txt)

[coveralls-img]: http://img.shields.io/coveralls/shannonmoeller/apply-html/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/shannonmoeller/apply-html
[downloads-img]: http://img.shields.io/npm/dm/apply-html.svg?style=flat-square
[npm-img]:       http://img.shields.io/npm/v/apply-html.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/apply-html
[travis-img]:    http://img.shields.io/travis/shannonmoeller/apply-html.svg?style=flat-square
[travis-url]:    https://travis-ci.org/shannonmoeller/apply-html
