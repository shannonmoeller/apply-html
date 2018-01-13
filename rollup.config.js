// eslint-disable-next-line import/extensions
import pkg from './package.json';

const external = Object.keys(pkg.dependencies);
const globals = external.reduce((a, b) => {
	const c = b.replace(/\W+([a-z])/g, g => g[1].toUpperCase());

	a[b] = c[0].toLowerCase() + c.slice(1);

	return a;
}, {});

export default {
	external,
	input: 'src/apply-html.js',
	output: {
		file: 'dist/apply-html.js',
		format: 'umd',
		name: 'applyHtml',
		globals
	}
};
