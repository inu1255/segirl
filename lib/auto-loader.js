const cofs = require("fs-extra");
const path = require("path");

const cache = {
	NotFound: false,
	AppDialog: false,
	AppToast: false,
	Nuxt: false,
	NuxtLink: false,
	TransitionGroup: false,
}; // componet name -> componet file

function toCamelCase(tagName) {
	return tagName.replace(/(^|-)(\w)/g, (x0, x1, w) => w.toUpperCase());
}

/**
 * @param {string} text
 */
async function extractComponents(text, tagMapFn) {
	let s = new Set();
	let m = /<template>([\s\S]+)<\/template>/.exec(text);
	if (m) {
		let template = m[1];
		let tagNames = new Set();
		template.replace(/<(([A-Z]|\w+-)[\w-]+)(\s|\/?>)/g, function (x0, tag) {
			tagNames.add(tag);
		});
		for (let tagName of Array.from(tagNames)) {
			let component = toCamelCase(tagName);
			if (cache[component]) s.add(component);
			else if (cache[component] == null) {
				let file;
				if (tagMapFn) file = tagMapFn(tagName, component);
				if (file == null) {
					tagName =
						tagName[0].toLowerCase() +
						tagName.slice(1).replace(/[a-z][A-Z]/g, (x) => x[0] + "-" + x[1].toLowerCase());
					let ss = tagName.split("-");
					for (let i = 0; i < ss.length; i++) {
						let dir = i ? ss.slice(0, i).join("/") : "";
						let name = ss
							.slice(i)
							.map((x) => x[0].toUpperCase() + x.slice(1))
							.join("");
						if (await cofs.pathExists(path.join("src/", dir, name + ".vue"))) {
							file = ["@", dir, name + ".vue"].filter((x) => x).join("/");
							break;
						}
						if (await cofs.pathExists(path.join("src/", dir, name, "index.js"))) {
							file = ["@", dir, name, "index.js"].filter((x) => x).join("/");
							break;
						}
						if (await cofs.pathExists(path.join("src/", dir, name + ".ts"))) {
							file = ["@", dir, name + ".ts"].filter((x) => x).join("/");
							break;
						}
						if (await cofs.pathExists(path.join("src/", dir, name + ".js"))) {
							file = ["@", dir, name + ".js"].filter((x) => x).join("/");
							break;
						}
					}
				}
				cache[component] = file || false;
				if (file) s.add(component);
			}
		}
	}
	return Array.from(s);
}

module.exports = async function (source, map, meta) {
	let callback = this.async();
	if (this.resourceQuery) return callback(null, source, map, meta);
	let text = await cofs.readFile(this.resource, "utf8");
	let components = await extractComponents(text, this.query.tagMapFn);
	if (components.length) {
		const index = this.mode === "development" ? source.indexOf("/* hot reload */") : -1;

		let code = "\n";
		if (this.query.sortFn) components.sort(this.query.sortFn);
		for (let component of components) {
			code += `import ${component} from '${cache[component]}'\n`;
		}
		code += `component.options.components = Object.assign({${components}}, component.options.components)\n`;
		source = index < 0 ? source + code : source.slice(0, index) + code + source.slice(index);
	}
	return callback(null, source, map, meta);
};
