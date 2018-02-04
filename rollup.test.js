import camelCase from 'lodash.camelcase';
import istanbul from 'rollup-plugin-istanbul';
import node from 'rollup-preset-node';
import pkg from './package.json';

export default {
	output: {
		format: 'iife',
		name: 'test',
		globals: Object.keys(pkg.dependencies).reduce(
			(a, b) => Object.assign(a, { [b]: camelCase(b) }),
			{}
		),
	},
	plugins: [
		...node({
			resolve: {
				browser: true,
			},
		}),
		istanbul({
			exclude: '{node_modules,test}/**',
		}),
	],
};
