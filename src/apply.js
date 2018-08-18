import { isSafe } from './html.js';
import { morphChildren } from './morph.js';

export function apply(element, value) {
	if (!(element instanceof Element)) {
		throw new TypeError('Expected an element.');
	}

	if (isSafe(value)) {
		value = value.toString();
	}

	if (typeof value !== 'string') {
		throw new TypeError('Expected a string.');
	}

	const template = document.createElement('template');

	template.innerHTML = value;

	morphChildren(element, template.content);

	return element;
}
