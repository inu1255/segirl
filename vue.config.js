const path = require("path");
const fs = require("fs");
const {merge} = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isDevMode = process.env.NODE_ENV === "development";

/** @type {import('@vue/cli-service').ProjectOptions} */
module.exports = {
	pages: getPages(),
	filenameHashing: false,
	chainWebpack: (config) => {
		config.plugin("copy").use(CopyWebpackPlugin, [
			{
				patterns: [
					{
						from: path.resolve(`src/manifest.js`),
						to: `${path.resolve("dist")}/manifest.json`,
						transform(content, path) {
							var mod = {exports: {}};
							new Function("module", "exports", content.toString())(mod, mod.exports);
							return JSON.stringify(mod.exports, null, 2);
						},
					},
					{
						from: path.resolve(`public/`),
						to: `${path.resolve("dist")}/`,
					},
				],
			},
		]);
	},
	configureWebpack(config) {
		merge(config, {
			output: {
				filename: `[name].js`,
				chunkFilename: `[name].js`,
			},
			devtool: isDevMode ? "inline-source-map" : false,
		});
	},
	css: {
		extract: false, // Make sure the css is the same
	},
};

function getPages() {
	const pages = {};

	fs.readdirSync(path.resolve(`src/entry`)).forEach((name) => {
		const fileName = path.basename(name, path.extname(name));
		pages[fileName] = {
			entry: `src/entry/${name}`,
			template: "public/index.html",
			filename: `${fileName}.html`,
		};
	});

	return pages;
}
