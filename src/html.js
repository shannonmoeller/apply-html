const UNSAFE_RX = /[&<>"'`]/g;
const ENTITIES = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'`': '&#96;',
};

class SafeString {
	constructor(value) {
		this.raw = String(value);

		Object.freeze(this);
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

Object.freeze(SafeString.prototype);

export function isSafe(obj) {
	return obj instanceof SafeString;
}

export function raw(value) {
	if (isSafe(value)) {
		return value;
	}

	return new SafeString(value);
}

export function encode(value) {
	if (isSafe(value)) {
		return value;
	}

	if (typeof value !== 'string') {
		throw new TypeError('Expected a string.');
	}

	return raw(value.replace(UNSAFE_RX, (x) => ENTITIES[x]));
}

export function serialize(value) {
	if (isSafe(value)) {
		return value;
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

	return encode(value);
}

export function html(strings, ...values) {
	const literals = strings.raw;
	let result = literals[0];

	values.forEach((value, i) => {
		result += serialize(value);
		result += literals[i + 1];
	});

	return raw(result.trim());
}
