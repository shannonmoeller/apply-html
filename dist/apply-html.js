(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('nanomorph')) :
	typeof define === 'function' && define.amd ? define(['exports', 'nanomorph'], factory) :
	(factory((global.applyHtml = {}),global.nanomorph));
}(this, (function (exports,nanomorph) { 'use strict';

nanomorph = nanomorph && nanomorph.hasOwnProperty('default') ? nanomorph['default'] : nanomorph;

class SafeString {
	constructor(raw) {
		this.raw = String(raw);
	}

	get length() {
		return this.raw.length;
	}

	toJSON() {
		return this.raw;
	}

	toString() {
		return this.raw;
	}
}

function escape(value) {
	if (typeof value !== 'string') {
		throw new TypeError('Expected a string.');
	}

	return value
		.replace(/&/g, '&amp;')
		.replace(/>/g, '&gt;')
		.replace(/</g, '&lt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/`/g, '&#96;');
}

function serialize(value) {
	if (value instanceof SafeString) {
		// Assume trustworthy
		return value.raw;
	}

	if (Array.isArray(value)) {
		return value.map(serialize).join('');
	}

	if (value === null || value === undefined) {
		return '';
	}

	switch (typeof value) {
		case 'boolean':
			return '';

		case 'function':
			throw new TypeError(`Unexpected function: ${value}`);

		case 'number':
			value = String(value);
			break;

		case 'object':
			value = JSON.stringify(value);
			break;

		default:
			break;
	}

	// Assume untrustworthy
	return escape(value);
}

function apply(element, string) {
	if (!(element instanceof Element)) {
		throw new TypeError('Expected an element.');
	}

	if (string instanceof SafeString) {
		string = string.toString();
	}

	if (typeof string !== 'string') {
		throw new TypeError('Expected a string.');
	}

	// Clone root node without children
	const clone = element.cloneNode(false);

	// Create inert DOM structure for diffing. Prevents
	// premature or duplicate resource loading and
	// execution of custom-element lifecycle callbacks.
	const template = document.createElement('template');

	template.innerHTML = string;

	// Attach inert DOM to clone
	clone.appendChild(template.content);

	// Patch live DOM with new inert DOM
	return nanomorph(element, clone);
}

function html(strings, ...values) {
	const literals = strings.raw;
	let result = '';

	values.forEach((value, i) => {
		result += literals[i];
		result += serialize(value);
	});

	result += literals[literals.length - 1];

	return new SafeString(result);
}

function raw(string) {
	if (string instanceof SafeString) {
		return string;
	}

	return new SafeString(string);
}

exports.SafeString = SafeString;
exports.escape = escape;
exports.serialize = serialize;
exports.apply = apply;
exports.html = html;
exports.raw = raw;

Object.defineProperty(exports, '__esModule', { value: true });

})));
