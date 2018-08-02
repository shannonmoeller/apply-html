import test from 'blue-tape';
import { escape, html, isSafe, raw } from '../src/index.js';

test('should create safe strings', async (t) => {
	t.ok(isSafe(html``));
	t.ok(isSafe(raw('')));
	t.ok(isSafe(raw(html``)));
	t.ok(isSafe(raw(raw(''))));
	t.ok(isSafe(raw(escape(''))));
	t.ok(isSafe(escape('')));
	t.ok(isSafe(escape(html``)));
	t.ok(isSafe(escape(raw(''))));
	t.ok(isSafe(escape(escape(''))));

	t.throws(() => {
		html``.raw = 'evil';
	}, 'not writable');

	t.throws(() => {
		Object.defineProperty(html``, 'raw', { writable: true });
	}, 'not configurable');
});

test('should interpolate values', async (t) => {
	const values = [
		undefined,
		null,
		false,
		true,
		0,
		123,
		{ foo: 'bar' },
		'<em>foo</em>',
		raw('<em>foo</em>'),
		escape('<em>foo</em>'),
		escape(raw('<em>foo</em>')),
	];

	const actual = html`
		Hi
		${values}
	`;

	const expected = `
		Hi
		0123{&quot;foo&quot;:&quot;bar&quot;}&lt;em&gt;foo&lt;/em&gt;<em>foo</em>&lt;em&gt;foo&lt;/em&gt;<em>foo</em>
	`;

	t.equal(actual.length, expected.length);
	t.equal(actual.toJSON(), expected);
	t.equal(actual.toString(), expected);
});

test('should enforce type', async (t) => {
	t.throws(() => escape(), TypeError, 'expects value');
	t.throws(() => escape(1), TypeError, 'expects string');

	// eslint-disable-next-line no-empty-function
	t.throws(() => html`${() => {}}`, TypeError, 'disallow functions');
});
