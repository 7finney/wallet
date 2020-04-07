module.exports = {
	env: {
		browser: true,
		es6: true,
	},
	extends: [
		'plugin:react/recommended',
		'airbnb',
		'prettier',
		'prettier/react',
		'plugin:prettier/recommended',
		'eslint-config-prettier',
	],
	parser: 'babel-eslint',
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	plugins: [
		'react',
		'prettier',
	],
	rules: {
		'no-plusplus': 'off',
		'no-param-reassign': 'off',
		'prefer-destructuring': 'off',
		'prefer-spread': 'off',
		'prefer-rest-params': 'off',
		'func-names': 'off',
		'no-bitwise': 'off',
		'import/no-unresolved': 'off',
		'react/jsx-filename-extension': [
			1,
			{
				'extensions': ['.js', '.jsx'],
			},
		],
		'prettier/prettier': [
			'error',
			{
				'trailingComma': 'es5',
				'singleQuote': true,
				'printWidth': 100,
			},
		],
	},
};
