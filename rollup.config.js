import pkg from './package.json';

export default {
	external: Object.keys(pkg.dependencies),
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
	],
};
