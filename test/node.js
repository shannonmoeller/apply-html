import test from 'blue-tape';
import { SafeString, escape, html, raw } from '../src/index.js';

test('should create safe strings', async (t) => {
	t.ok(html`` instanceof SafeString);
	t.ok(raw('') instanceof SafeString);
	t.ok(raw(html``) instanceof SafeString);
	t.ok(raw(raw('')) instanceof SafeString);
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
	];

	const actual = html`
		Hi
		${values}
	`;

	const expected = `
		Hi
		0123{&quot;foo&quot;:&quot;bar&quot;}&lt;em&gt;foo&lt;/em&gt;<em>foo</em>
	`;

	t.equal(actual.length, expected.length);
	t.equal(actual.inspect(), expected);
	t.equal(actual.toJSON(), expected);
	t.equal(actual.toString(), expected);
});

test('should enforce type', async (t) => {
	t.throws(() => escape(), TypeError, 'expects value');
	t.throws(() => escape(1), TypeError, 'expects string');

	// eslint-disable-next-line no-empty-function
	t.throws(() => html`${() => {}}`, TypeError, 'disallow functions');
});
