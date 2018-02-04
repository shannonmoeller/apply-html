import istanbul from 'rollup-plugin-istanbul';
import node from 'rollup-preset-node';

export default {
	output: {
		format: 'umd',
		name: 'test',
	},
	plugins: [
		...node(),
		istanbul({
			exclude: '{node_modules,test}/**',
		}),
	],
};
