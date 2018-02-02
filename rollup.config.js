import camelcase from 'lodash.camelcase';
import pkg from './package.json';

const external = Object.keys(pkg.dependencies);
const globals = external.reduce(
	(a, b) => Object.assign(a, { [b]: camelcase(b) }),
	{}
);

export default {
	input: 'src/index.js',
	output: [
		{
			format: 'cjs',
			file: pkg.main,
			sourcemap: true,
		},
		{
			format: 'es',
			file: pkg.module,
			sourcemap: true,
		},
		{
			format: 'umd',
			file: pkg.browser,
			name: camelcase(pkg.name),
			sourcemap: true,
			globals,
		},
	],
	external,
};
