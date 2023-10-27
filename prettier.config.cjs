/** @type {import('prettier').Config} */
module.exports = {
	endOfLine: "lf",
	semi: true,
	singleQuote: false,
	useTabs: true,
	tabWidth: 4,
	printWidth: 150,
	overrides: [
		{
			files: "*.yml",
			options: {
				tabWidth: 2,
				useTabs: false,
			},
		},
	],
	importOrder: ["<THIRD_PARTY_MODULES>", "", "^@(root|classes|commands|events|components|const|models|type|utils)/", "", "^[./]"],
	importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
	plugins: ["@ianvs/prettier-plugin-sort-imports"],
};
