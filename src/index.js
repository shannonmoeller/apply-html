import nanomorph from 'nanomorph';
import { SafeString } from './safe-string.js';

export function raw(value) {
	if (value instanceof SafeString) {
		return value;
	}

	return new SafeString(value);
}

export function escape(value) {
	if (value instanceof SafeString) {
		return value;
	}

	if (typeof value !== 'string') {
		throw new TypeError('Expected a string.');
	}

	return raw(
		value
			.replace(/&/g, '&amp;')
			.replace(/>/g, '&gt;')
			.replace(/</g, '&lt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/`/g, '&#96;')
	);
}

export function serialize(value) {
	if (value instanceof SafeString) {
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

	// Assume untrustworthy
	return escape(value);
}

export function html(strings, ...values) {
	const literals = strings.raw;
	let result = literals[0];

	values.forEach((value, i) => {
		result += serialize(value);
		result += literals[i + 1];
	});

	return raw(result);
}

export function apply(element, value) {
	if (!(element instanceof Element)) {
		throw new TypeError('Expected an element.');
	}

	if (value instanceof SafeString) {
		value = value.toString();
	}

	if (typeof value !== 'string') {
		throw new TypeError('Expected a string.');
	}

	const template = document.createElement('template');

	// Create inert DOM structure for diffing. Prevents
	// premature or duplicate resource loading and
	// execution of custom-element lifecycle callbacks.
	template.innerHTML = value;

	// Patch live DOM with new inert DOM
	nanomorph(element, template.content, {
		childrenOnly: true,
	});

	return element;
}
