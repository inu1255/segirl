function toCamelCase(tagName) {
	return tagName.replace(/(^|-)(\w)/g, (x0, x1, w) => w.toUpperCase());
}

module.exports = function (x, source) {
	if (/\.vue/.test(this.resourcePath)) {
		x = x.replace(/((async\s+)?mounted\(\))\s*\{/g, `async mounted() { await this.$waitLocals();`);
		let dialogs = {};
		x = x.replace(/this\.\$dlg\s*\.show\("([^"]+)"/g, function (x0, tagName) {
			let component = toCamelCase(tagName) + "_dialog";
			dialogs[component] = `@/dialogs/${tagName}`;
			return `this.$dlg.show(${component}`;
		});
		x = x.replace(/this\.\$dlg\s*\.removeAll\("([^"]+)"/g, function (x0, tagName) {
			let component = toCamelCase(tagName) + "_dialog";
			dialogs[component] = `@/dialogs/${tagName}`;
			return `this.$dlg.remove(${component}`;
		});
		let code = "";
		for (let component in dialogs) {
			code += `import ${component} from '${dialogs[component]}'\n`;
		}
		if (code) {
			x = x.replace("export default", `${code}export default`);
		}
	}
	this.callback(null, x, source);
};
