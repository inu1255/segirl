<template>
	<div class="segirl-plugins-tableparams">
		<button @click="copy">复制参数</button>
		<button @click="copy($event, true)">复制结果</button>
	</div>
</template>
<script>
import {copy} from "../common/utils";
export default {
	title: "接口参数",
	components: {},
	props: {
		el: {},
	},
	data() {
		return {
			radix: 10,
			list: [],
		};
	},
	computed: {},
	watch: {
		el() {
			let el = this.el;
			while (el && el.tagName != "TABLE") el = el.parentElement;
			if (!el) return;
			this.table = el;
			this.$emit("open");
		},
	},
	mounted() {},
	methods: {
		getCode(result) {
			const el = this.table;
			let ss = location.href.split(/#|\?/)[0].split("/");
			let name = "";
			while (!name && ss.length) name = ss.pop();
			name = name.split(".")[0];
			let trs = el.querySelectorAll("tr");
			let lines = [
				`export interface ${name[0].toUpperCase() + name.slice(1)}${result ? `Result` : `Param`} {`,
			];
			let ignore = result
				? new Set()
				: new Set(["deviceid", "timestamp", "productinfo", "datasign"]);
			let deeps = [];
			let tail = ";";
			for (let i = 0; i < trs.length; i++) {
				let tr = trs[i];
				let tds = Array.from(tr.children);
				if (tds[0].tagName == "TH") continue;
				let deep = 0;
				while (tds[0] && !tds[0].innerText.trim()) {
					tds.shift();
					deep++;
				}
				// let tail = deep ? "," : ";";
				while (deeps.length > deep) {
					if (deeps.pop()) lines.push("}[]" + tail);
					else lines.push("}" + tail);
				}
				let name = tds[1].innerText.trim();
				if (ignore.has(name)) continue;
				let type = tds[2].innerText.trim();
				let desc = tds[3].innerHTML.trim();
				let m;
				if (type == "int") type = `number${tail} // int`;
				else if (/^long/.test(type)) type = `number${tail} // long`;
				else if (type == "float") type = `number${tail} // float`;
				else if ((m = /List<(\w+)>/.exec(type))) type = `${m[1]}[]${tail}`;
				else if ((m = /string\((\d+)\)/.exec(type))) type = `string${tail} // maxLength: ${m[1]}`;
				else if ((m = /string\((\d+)-(\d+)\)/.exec(type)))
					type = `string${tail} // minLength: ${m[1]} maxLength: ${m[2]}`;
				else if (/json/.test(type)) {
					if (/数组/.test(type)) {
						deeps.push(1);
					} else {
						deeps.push(0);
					}
					type = `{`;
				} else type = `${type}${tail}`;
				let required = /是/.test(tds[4].innerText);
				lines.push("\t".repeat(deep + 1) + `/** ${desc} */`);
				lines.push("\t".repeat(deep + 1) + `${name}${required ? "" : "?"}: ${type}`);
			}
			while (deeps.length) {
				let deep = deeps.length;
				// let tail = deep > 1 ? "," : ";";
				if (deeps.pop()) lines.push("\t".repeat(deep) + "}[]" + tail);
				else lines.push("\t".repeat(deep) + "}" + tail);
			}
			lines.push("}");
			return lines.join("\n");
		},
		copy(e, result) {
			if (copy(this.getCode(result))) {
				var prev = e.target.innerText;
				e.target.innerText = "已复制";
				setTimeout(function () {
					e.target.innerText = prev;
				}, 1e3);
			}
		},
	},
};
</script>
<style lang="less">
.segirl-plugins-tableparams {
	button {
		margin-right: 5px;
	}
}
</style>
