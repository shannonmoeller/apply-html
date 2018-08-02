import test from 'blue-tape';
import { apply, html } from '../src/index.js';

import './node.js';

function assertApply(t, a, b, message) {
	const aElement = document.createElement('div');
	const bElement = document.createElement('div');

	aElement.innerHTML = a;
	bElement.innerHTML = b;

	const expected = bElement.innerHTML;
	const actual = apply(aElement, b).innerHTML;

	t.equal(actual, expected, message);
}

test('should update child nodes', async (t) => {
	const parentA = document.createElement('div');
	const a = html`<main><p>hello world</p></main>`;
	const b = html`<main><p class="foo">hello you</p></main>`;

	// Set initial markup
	parentA.innerHTML = a;
	const childA = parentA.children[0];

	// Patch to new markup
	const parentB = apply(parentA, b);
	const childB = parentB.children[0];

	t.equal(parentA.innerHTML, String(b), 'patched content');
	t.equal(parentA === parentB, true, 'same parent');
	t.equal(childA === childB, true, 'same child');
});

test('should enforce type', async (t) => {
	const div = document.createElement('div');

	t.throws(() => apply(), TypeError, 'expects element');
	t.throws(() => apply(div), TypeError, 'expects string');
});

test('change text', async (t) => {
	assertApply(t, html`foo`, html`bar`);
	assertApply(t, html`<div>foo</div>`, html`<div>bar</div>`);
});

test('change tag', async (t) => {
	assertApply(t, html`<div>foo</div>`, html`<span>foo</span>`);
	assertApply(t, html`<main>foo</main>`, html`<aside>foo</aside>`);

	assertApply(
		t,
		html`<div id="foo">foo</main>`,
		html`<span id="foo">foo</span>`
	);

	assertApply(
		t,
		html`<div id="foo">foo</main>`,
		html`<span id="foo">bar</span>`
	);
});

test('change attribute', async (t) => {
	assertApply(t, html`<div>foo</div>`, html`<div class="a">foo</div>`);

	assertApply(
		t,
		html`<div class="a">foo</div>`,
		html`<div class="b">foo</div>`
	);

	assertApply(
		t,
		html`<div title="a">foo</div>`,
		html`<div title="b">foo</div>`
	);

	assertApply(
		t,
		html`<svg><use xlink:href="./foo.svg"></use></svg>`,
		html`<svg><use xlink:href="./bar.svg"></use></svg>`
	);

	assertApply(
		t,
		html`<svg><use xlink:href="./foo.svg"></use></svg>`,
		html`<svg><use xlink:href="./bar.svg"></use></svg>`
	);

	assertApply(
		t,
		html`<svg><use xlink:href="./foo.svg"></use></svg>`,
		html`<svg><use></use></svg>`
	);
});

test('add child', async (t) => {
	assertApply(
		t,
		html`<ul><li>a</li></ul>`,
		html`<ul><li>a</li><li>b</li></ul>`
	);
});

test('remove child', async (t) => {
	assertApply(
		t,
		html`<ul><li>a</li><li>b</li></ul>`,
		html`<ul><li>a</li></ul>`
	);
});

test('move child', async (t) => {
	assertApply(
		t,
		html`<ul><li>a</li><li>b</li><li>c</li></ul>`,
		html`<ul><li>b</li><li>a</li><li>c</li></ul>`
	);

	assertApply(
		t,
		html`
			<ul>
				<li id="a">a</li>
				<li id="b">b</li>
				<li id="c">c</li>
			</ul>
		`,
		html`
			<ul>
				<li id="b">b</li>
				<li id="a">a</li>
				<li id="c">c</li>
			</ul>
		`
	);

	assertApply(
		t,
		html`
			<ul>
				<li id="a">a</li>
				<li id="b">b</li>
				<li id="c">c</li>
			</ul>
		`,
		html`
			<ul>
				<li id="b">bar</li>
				<li id="a">foo</li>
				<li id="c">baz</li>
			</ul>
		`
	);
});

test('update input checked', async (t) => {
	assertApply(
		t,
		html`<input type="checkbox" value="foo" checked />`,
		html`<input type="checkbox" value="bar" />`
	);

	assertApply(
		t,
		html`<input type="checkbox" value="foo" />`,
		html`<input type="checkbox" value="bar" checked />`
	);

	assertApply(
		t,
		html`<input type="radio" value="foo" checked />`,
		html`<input type="radio" value="bar" />`
	);

	assertApply(
		t,
		html`<input type="radio" value="foo" />`,
		html`<input type="radio" value="bar" checked />`
	);
});

test('update input disabled', async (t) => {
	assertApply(
		t,
		html`<input type="text" value="foo" disabled />`,
		html`<input type="text" value="bar" />`
	);

	assertApply(
		t,
		html`<input type="text" value="foo" />`,
		html`<input type="text" value="bar" disabled />`
	);
});

test('update input placeholder', async (t) => {
	assertApply(
		t,
		html`<input type="text" placeholder="foo" />`,
		html`<input type="text" placeholder="bar" />`
	);

	assertApply(
		t,
		html`<input type="text" id="foo" name="foo" placeholder="foo" />`,
		html`<input type="text" id="foo" name="foo" placeholder="bar" />`
	);
});

test('update input value', async (t) => {
	assertApply(
		t,
		html`<input type="text" value="foo" />`,
		html`<input type="text" value="bar" />`
	);

	assertApply(
		t,
		html`<input type="text" id="foo" name="foo" value="foo" />`,
		html`<input type="text" id="foo" name="foo" value="bar" />`
	);
});

test('update select value', async (t) => {
	assertApply(
		t,
		html`
			<select>
				<option value="foo" selected>foo</option>
				<option value="bar">bar</option>
			</select>
		`,
		html`
			<select>
				<option value="foo">foo</option>
				<option value="bar" selected>bar</option>
			</select>
		`
	);
});

test('update textarea value', async (t) => {
	assertApply(
		t,
		html`<textarea>foo</textarea>`,
		html`<textarea>bar</textarea>`
	);
});

test('multiple root nodes', async (t) => {
	assertApply(
		t,
		html`
			<div class="a">foo</div>
			<div class="a">bar</div>
			<div class="a">baz</div>
		`,
		html`
			<div class="b">foo</div>
			<div class="b">bar</div>
			<div class="b">baz</div>
		`
	);
});

test.onFinish(window.__close__);
