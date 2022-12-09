const fs = require("fs-extra");
const path = require("path");
const terser = require("terser");
const obfuscator = require("javascript-obfuscator");

if (require.main === module) {
	// 使用方法: node lib/uglify.js [目录]
	// 自动遍历目录下没有压缩过的js文件，进行混淆压缩
	// node lib/uglify.js ./dist
	if (process.argv[3]) copy(process.argv[2], process.argv[3]);
	else uglify(process.argv[2]);
}

module.exports = Object.assign(uglify, {copy});

async function uglify(dir, ignoreFn) {
	if (ignoreFn instanceof RegExp) {
		let reg = ignoreFn;
		ignoreFn = (s) => reg.test(s);
	}
	if (!(await fs.pathExists(dir))) return console.log("目录不存在", dir);
	await walk(dir, async (filename, stat) => {
		if (typeof ignoreFn === "function" && ignoreFn(filename)) return true;
		if (stat.isDirectory()) {
			if (path.basename(filename) == "_nuxt") return true;
			return false;
		}
		if (filename.endsWith(".js") && !filename.endsWith(".min.js")) {
			await compileFile(filename, filename);
		}
	});
}

async function copy(src, dst, ignoreFn) {
	if (ignoreFn instanceof RegExp) {
		let reg = ignoreFn;
		ignoreFn = (s) => reg.test(s);
	}
	if (!(await fs.pathExists(src))) return console.log("目录不存在", src);
	await fs.mkdirp(dst);
	await walk(src, async (srcfile, stat) => {
		let dstfile = srcfile.replace(src, dst);
		if (stat.isDirectory()) {
			if (!(await fs.pathExists(dstfile))) await fs.mkdir(dstfile);
			return;
		}
		if (
			(typeof ignoreFn === "function" && ignoreFn(srcfile)) ||
			srcfile.indexOf("_nuxt") >= 0 ||
			!srcfile.endsWith(".js") ||
			srcfile.endsWith(".min.js")
		) {
			await fs.copyFile(srcfile, dstfile);
		} else {
			let ds = await fs
				.stat(dstfile)
				.then((x) => x.mtimeMs)
				.catch(() => 0);
			if (!ds || ds <= (await fs.stat(srcfile).then((x) => x.mtimeMs)))
				await compileFile(srcfile, srcfile.replace(src, dst));
			else console.log("skip", srcfile);
		}
	});
}

async function compileFile(srcfile, dstfile) {
	let content = await fs.readFile(srcfile, "utf8");
	let lines = content.split("\n");
	let maxLine = Math.max(...lines.map((x) => x.length));
	if (lines.length * 10 > maxLine) {
		console.log(`uglify[line:${lines.length}, chars:${maxLine}]`, srcfile);
		// 先混淆
		let ob = obfuscator.obfuscate(content, {
			compact: false,
			controlFlowFlattening: true,
			controlFlowFlatteningThreshold: 1,
			numbersToExpressions: true,
			simplify: true,
			stringArrayShuffle: true,
			splitStrings: true,
			stringArrayThreshold: 1,
		});
		content = ob.getObfuscatedCode();
		// 再压缩
		let tm = await terser.minify(content, {
			compress: {
				drop_console: true,
			},
		});
		content = tm.code;
	}
	await fs.writeFile(dstfile, content);
}

/**
 * 遍历文件夹
 * @param {string} dir
 * @param {(filename: string, stat: fs.Stats, err?: any) => Promise<boolean> | boolean} fn
 */
function walk(dir, fn) {
	return new Promise((resolve, reject) => {
		fs.readdir(dir, function (err, filenames) {
			if (err) reject(err);
			else {
				let task = Promise.resolve(false);
				for (let filename of filenames) {
					filename = dir + "/" + filename;
					task = task.then(
						(x) =>
							new Promise((resolve, reject) => {
								fs.stat(filename, function (err, stat) {
									if (err) resolve(fn(filename, null, err));
									else if (stat.isDirectory()) {
										resolve(
											Promise.resolve(fn(filename, stat)).then((x) => x || walk(filename, fn))
										);
									} else {
										resolve(fn(filename, stat));
									}
								});
							})
					);
				}
				resolve(task);
			}
		});
	});
}
