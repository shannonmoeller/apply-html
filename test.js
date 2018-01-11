import test from 'ava';
import {SafeString, escape, html, raw} from '.';

test('should create safe strings', t => {
	t.truthy(html`` instanceof SafeString);
	t.truthy(raw('') instanceof SafeString);
	t.truthy(raw(raw('')) instanceof SafeString);
});

test('should interpolate values', t => {
	const values = [
		undefined,
		null,
		false,
		true,
		123,
		{foo: 'bar'},
		'<em>foo</em>',
		raw('<em>foo</em>')
	];

	const actual = html`
		Hi
		${values}
	`;

	const expected = `
		Hi
		123{&quot;foo&quot;:&quot;bar&quot;}&lt;em&gt;foo&lt;/em&gt;<em>foo</em>
	`;

	t.is(actual.length, expected.length);
	t.is(actual.toJSON(), expected);
	t.is(actual.toString(), expected);
});

test('should enforce type', t => {
	t.throws(() => escape(), TypeError);
	t.throws(() => escape(1), TypeError);
	t.throws(() => html`${() => {}}`, TypeError);
});
