# apply-html

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url]

It's `innerHTML` for the modern world. Patches the contents of an existing element with a string.

## Install

```command
$ npm install --save apply-html
```

## Usage

```js
const { html, raw, apply } = require('apply-html');

const state = {
    salutation: 'Hello',
    target: '<em>World</em>'
};

const template = ({ salutation, target }) => html`
    <h1>${salutation} ${raw(target)}</h1>
`;

// document.body.innerHTML = template(state);
apply(document.body, template(state));

console.log(document.body.innerHTML);
// -> <h1>Hello <em>World</em></h1>
```

## API

### html``: Template

### raw(): Template

### apply(oldTree, string): Element

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
