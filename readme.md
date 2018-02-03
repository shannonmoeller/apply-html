# apply-html

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url]

It's `.innerHTML = ''` for the 21st century!

Yet another library to diff and patch an existing DOM tree by efficiently comparing it to a string. Why? This library is a little bit different than [others](#acknowledgements). It makes use of an [HTML `<template>`'s](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) unique ability to create an inert [document fragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment). These amazing creatures' features include:

- A real DOM tree
- Multiple root nodes
- Will not trigger resource loading prematurely
- Will not apply embedded stylesheets prematurely
- Will not trigger custom element constructors or lifecycle events prematurely

The live DOM is then patched with the inert fragment using [`nanomorph`](http://npm.im/nanomorph), a hyper-fast diffing algorithm for real DOM nodes. This ensures that things only start happening if and when they're supposed to, organically.

Play with it on [CodePen](https://codepen.io/shannonmoeller/pen/XZXBpE?editors=1111).

## Install

```command
$ npm install --save apply-html
```

## Usage

### Patching

```js
const { apply } = require('apply-html');

apply(document.body, '<h1 class="day">Hello World</h1>');

console.log(document.body.innerHTML);
// -> <h1 class="day">Hello World</h1>

apply(document.body, '<h1 class="night">Goodnight Moon</h1>');

console.log(document.body.innerHTML);
// -> <h1 class="night">Goodnight Moon</h1>
```

### Interpolation and Escaping

```js
const { apply, html, raw } = require('apply-html');

const foo = '<em>foo</em>';
const bar = raw('<em>bar</em>');
const baz = html`<strong>baz</strong>`;

apply(document.body, html`
    ${foo}
    ${bar}
    ${baz}
`);

console.log(document.body.innerHTML);
// -> &lt;em&gt;foo&lt;/em&gt;
// -> <em>bar</em>
// -> <strong>baz</strong>
```

### Server-side Rendering

The `html` and `raw` functions never touch the DOM so they're completely safe to use server-side.

```js
const http = require('http');
const { html } = require('apply-html');

const content = html`
    <h1>Hello <em>World</em></h1>
    <p>How are you today?</p>
`;

module.exports = http
    .createServer((req, res) => res.end(content.toString()))
    .listen(3000);
```

## API

### `apply(element, string): Element`

- `element` `{Element}` DOM element with children to be patched.
- `string` `{String|SafeString}` String or [SafeString](#safestring) containing safe HTML to render.

Updates the content of the given element, making the fewest possible changes required to match the given string of HTML. The string is converted into an HTML `<template>` and the DOM trees are compared. Returns the updated element.

### `` html`string`: SafeString ``

A template tag that creates a new [SafeString](#safestring) containing a string of HTML. Interpolated values are serialized based on type:

- `Array` - Items are serialized then joined with an empty string (`''`).
- `Boolean|null|undefined` - Converted to an empty string (`''`).
- `Function` - Throws a `TypeError`.
- `Object` - Converted to an HTML-escaped JSON blob.
- `SafeString|Number` - Inserted as-is.
- `String` - HTML-escaped to safeguard against [XSS](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)). To opt out of escaping, use [`raw()`](#rawstring-safestring).

### `raw(string): SafeString`

- `string` `{String}` String of safe HTML.

Wraps a string in a [SafeString](#safestring) to indicate that it's safe to be inserted into the document. Only use on trusted strings to safeguard against [XSS](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)).

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

## Acknowledgements

Standing on the shoulders of these giants:

- [bel](http://npm.im/bel)
- [diff-dom](http://npm.im/diff-dom)
- [hyperhtml](http://npm.im/hyperhtml)
- [lit-html](http://npm.im/lit-html)
- [morphdom](http://npm.im/morphdom)
- [petit-dom](http://npm.im/petit-dom)
- [react](http://npm.im/react)
- [snabbdom](http://npm.im/snabbdom)
- [vue.js](http://npm.im/vue)
- and [more...](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html)

## Contribute

Standards for this project, including tests, code coverage, and semantics are enforced with a build tool. Pull requests must include passing tests with 100% code coverage and no linting errors.

### Test

```command
$ npm test
```

----

MIT © [Shannon Moeller](http://shannonmoeller.com)

[coveralls-img]: http://img.shields.io/coveralls/shannonmoeller/apply-html/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/shannonmoeller/apply-html
[downloads-img]: http://img.shields.io/npm/dm/apply-html.svg?style=flat-square
[npm-img]:       http://img.shields.io/npm/v/apply-html.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/apply-html
[travis-img]:    http://img.shields.io/travis/shannonmoeller/apply-html.svg?style=flat-square
[travis-url]:    https://travis-ci.org/shannonmoeller/apply-html
