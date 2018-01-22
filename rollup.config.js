import camelcase from 'lodash.camelcase';
import pkg from './package.json'; // eslint-disable-line import/extensions

const external = Object.keys(pkg.dependencies);
const toCamelMap = (a, b) => Object.assign(a, {[b]: camelcase(b)});
const globals = external.reduce(toCamelMap, {});

export default {
	input: 'src/apply-html.js',
	output: {
		file: 'dist/apply-html.js',
		format: 'umd',
		name: 'applyHtml',
		globals
	},
	external
};
