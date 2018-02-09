import nanomorph from 'nanomorph';

class SafeString {
	constructor(raw) {
		this.raw = String(raw);
	}

	get length() {
		return this.raw.length;
	}

	inspect() {
		return this.raw;
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

	const template = document.createElement('template');

	// Create inert DOM structure for diffing. Prevents
	// premature or duplicate resource loading and
	// execution of custom-element lifecycle callbacks.
	template.innerHTML = string;

	// Patch live DOM with new inert DOM
	nanomorph(element, template.content, {
		childrenOnly: true,
	});

	return element;
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

export { SafeString, escape, serialize, apply, html, raw };
//# sourceMappingURL=apply-html.es.js.map
