const TS_RULES = {
	"no-dupe-class-members": 0,
	"no-use-before-define": 0,
	"@typescript-eslint/no-unused-vars": 1,
	"@typescript-eslint/no-use-before-define": [
		"error",
		{functions: false, classes: false, typedefs: false},
	],
};
const RULES = {
	"local-rules/hd-class-case": 0,
	"local-rules/hd-static-src": 2,
	"no-var": 0,
	camelcase: 0,
	eqeqeq: 0,
	"no-console": 0,
	"object-shorthand": 0,
	"rules/prefer-includes": 0,
	"no-empty": 0,
	"no-redeclare": 0,
	"prefer-spread": 0,
	"prefer-const": 0,
	"no-prototype-builtins": 0,
	"no-new-func": 0,
	"no-control-regex": 0,
	"no-useless-escape": 0,
	"prefer-promise-reject-errors": 0,
	"require-await": 0,
	"no-throw-literal": 0,
	"no-template-curly-in-string": 0,
	"no-unused-vars": [
		"warn",
		{
			vars: "all",
			args: "none",
			ignoreRestSiblings: true,
			varsIgnorePattern: "^_",
		},
	],
	"no-use-before-define": ["error", {functions: false, classes: false}],
	"no-else-return": ["error", {allowElseIf: false}],
	"import/order": 0,
	// unicorn
	"unicorn/prefer-includes": 0,
	"unicorn/throw-new-error": 0,
	// vue
	"vue/require-default-prop": 0,
	"vue/no-mutating-props": 0,
	"vue/require-prop-types": 0,
	// nuxt
	"nuxt/no-cjs-in-config": 0,
	"nuxt/no-globals-in-created": 0,
	"node/no-callback-literal": 0,
	"node/no-deprecated-api": 0,
	"import/no-webpack-loader-syntax": 0,
};
module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
		webextensions: true,
	},
	parserOptions: {
		parser: "@babel/eslint-parser",
		requireConfigFile: false,
	},
	extends: ["@nuxtjs", "plugin:nuxt/recommended", "plugin:prettier/recommended"],
	plugins: ["eslint-plugin-local-rules"],
	globals: {
		dataLayer: "readonly",
		electron_api: "readonly",
		gevt: "readonly",
		gtag: "readonly",
		ClipboardItem: "readonly",
		$nuxt: "readonly",
	},
	// add your custom rules here
	rules: RULES,
	overrides: [
		{
			files: ["*.ts"],
			parserOptions: {},
			extends: [
				"@nuxtjs/eslint-config-typescript",
				"plugin:nuxt/recommended",
				"plugin:prettier/recommended",
			],
			rules: Object.assign({}, RULES, TS_RULES),
		},
	],
};
