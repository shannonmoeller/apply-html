import test from 'blue-tape';
import { apply, html } from '../src/index.js';

import './node.js';

test('should update child nodes', async (t) => {
	const parentA = document.createElement('div');
	const a = html`<main><p>hello world</p></main>`;
	const b = html`<main><p class="foo">hello you</p></main>`;
	const expected = '<main><p class="foo">hello you</p></main>';

	// Set initial markup
	parentA.innerHTML = a;
	const childA = parentA.children[0];

	// Patch to new markup
	const parentB = apply(parentA, b);
	const childB = parentB.children[0];

	t.equal(parentA.innerHTML, expected, 'patched content');
	t.equal(parentA === parentB, true, 'same parent');
	t.equal(childA === childB, true, 'same child');
});

test('should enforce type', async (t) => {
	const div = document.createElement('div');

	t.throws(() => apply(), TypeError, 'expects element');
	t.throws(() => apply(div), TypeError, 'expects string');
});

test.onFinish(window.__close__);
