const fs = require("fs-extra");
const path = require("path");

module.exports = {
	// class命名规范
	"hd-class-case": {
		meta: {
			fixable: true,
		},
		create(context) {
			// const comparator = context.options[0];
			return context.parserServices.defineTemplateBodyVisitor({
				"VAttribute[key.name=class]"(node) {
					const classStr = node.value.value;
					if (!/^[\da-z_ -]*$/.test(classStr)) {
						const fineClass = classStr
							.replace(/[A-Z]/g, (x) => "-" + x.toLowerCase())
							.replace(/[^\da-z_ -]+/g, "_");
						context.report({
							node,
							message: `class不规范 ${classStr} -> ${fineClass}`,
							loc: node.value.loc,
							// *fix(fixer) {
							// 	const [start, end] = node.value.range;
							// 	yield fixer.replaceTextRange([start + 1, end - 1], shouldOrder.join(" "));
							// },
						});
					}
				},
			});
		},
	},
	// static目录的资源不要用相对路径引入，会增加打包体积
	"hd-static-src": {
		meta: {
			fixable: true,
		},
		create(context) {
			// const comparator = context.options[0];
			return context.parserServices.defineTemplateBodyVisitor({
				"VAttribute[key.name=src]"(node) {
					const src = node.value.value;
					if (/\.\/static/.test(src)) {
						if (/\.svg$/.test(src)) {
							let filepath = src.split("/static/").slice(1).join("/static/");
							let oldpath = "src/static/" + filepath;
							let newpath = "src/assets/svgs/" + filepath;
							context.report({
								node,
								message: `相对路径引入svg不要放在static目录(会增加打包体积)\n ${oldpath.slice(
									4
								)} -> ${newpath.slice(4)}`,
								loc: node.value.loc,
							});
						} else {
							context.report({
								node,
								message: `请使用绝对路径引入static目录下的资源`,
								loc: node.value.loc,
								*fix(fixer) {
									const [start, end] = node.value.range;
									// 引入static资源时不带 / 开头，比如 src="ga.js"
									let newSrc = src.replace(/^.+?\/static\//, "");
									yield fixer.replaceTextRange([start + 1, end - 1], newSrc);
								},
							});
						}
					}
				},
			});
		},
	},
};

if (require.main === module) {
	const {ESLint} = require("eslint");
	const engine = new ESLint({
		fix: false,
		overrideConfig: {},
	});

	async function main() {
		const results = await engine.lintFiles(process.argv[2] || `src\\pages\\index.vue`);
		console.log(results[0].output);
		const formatter = await engine.loadFormatter("stylish");
		const resultText = formatter.format(results);
		console.log(resultText);
	}

	main();
}
