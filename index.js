const nanomorph = require('nanomorph');

class SafeString {
	constructor(raw) {
		this.raw = raw;
	}

	toJSON() {
		return this.raw;
	}

	toString() {
		return this.raw;
	}
}

function escape(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/>/g, '&gt;')
		.replace(/</g, '&lt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/`/g, '&#96;');
}

function serialize(value) {
	if (value === null || value === undefined || typeof value === 'boolean') {
		value = '';
	}

	if (value instanceof SafeString) {
		// Assume trustworthy
		return value.raw;
	}

	if (Array.isArray(value)) {
		return value.map(serialize).join('');
	}

	if (typeof value === 'object') {
		value = JSON.stringify(value);
	}

	// Assume untrustworthy
	return escape(value);
}

function raw(string) {
	if (string instanceof SafeString) {
		return string;
	}

	return new SafeString(string);
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

function apply(element, string) {
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

module.exports = {
	SafeString,
	escape,
	serialize,
	raw,
	html,
	apply
};
