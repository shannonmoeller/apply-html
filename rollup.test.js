import istanbul from 'rollup-plugin-istanbul';
import node from 'rollup-preset-node';
import pkg from './package.json';

export default {
	external: Object.keys(pkg.dependencies),
	output: {
		format: 'iife',
		name: 'test',
	},
	plugins: [
		...node(),
		istanbul({
			exclude: '{node_modules,test}/**',
		}),
	],
};
