<template>
	<div class="segirl-plugins-tableparams">
		<button @click="copy">复制参数</button>
		<button @click="copy($event, true)">复制结果</button>
		<button @click="copyFn">复制函数</button>
	</div>
</template>
<script>
import { copy, CamelCase } from "../common/utils";
export default {
	title: "小幺鸡参数",
	props: {
		el: {},
	},
	data() {
		return {
			radix: 10,
			list: [],
		};
	},
	watch: {
		el() {
			let el = this.el;
			while (el && el.className != "div-table") el = el.parentElement;
			if (!el) return;
			this.table = el;
			this.$emit("open");
		},
	},
	computed: {},
	methods: {
		readLine(tr, lines, result, deep) {
			let tail = ";";
			let ignore = result
				? new Set()
				: new Set([
						"deviceid",
						"client",
						"client_ver",
						"soft_version",
						"source",
				  ]);
			let tds = Array.from(tr.children);
			let subs = [];
			if (
				tr.nextElementSibling &&
				tr.nextElementSibling.className == "sub" &&
				tr.nextElementSibling.childElementCount
			) {
				let trs = tr.nextElementSibling.querySelectorAll(
					".sub>.div-table-line>.cb"
				);
				for (let i = 0; i < trs.length; i++) {
					let tr = trs[i];
					this.readLine(tr, subs, ignore, deep + 1);
				}
			}
			let name = tds[0].innerText.trim();
			if (ignore.has(name)) return;
			let type = tds[2].innerText.trim();
			let desc = tds[result ? 3 : 4].innerHTML.trim();
			let m;
			if (type == "int") type = `number${tail} // int`;
			else if (/^long/.test(type)) type = `number${tail} // long`;
			else if (type == "float") type = `number${tail} // float`;
			else if (type == "array") type = `any[]${tail}`;
			else if (type == "object")
				type = `{\n${subs.join("\n")}\n${"\t".repeat(deep + 1)}}${tail}`;
			else if ((m = /array\[(\w+)\]/.exec(type)))
				type = `{\n${subs.join("\n")}\n${"\t".repeat(deep + 1)}}[]${tail}`;
			else if ((m = /List<(\w+)>/.exec(type))) type = `${m[1]}[]${tail}`;
			else if ((m = /string\((\d+)\)/.exec(type)))
				type = `string${tail} // maxLength: ${m[1]}`;
			else if ((m = /string\((\d+)-(\d+)\)/.exec(type)))
				type = `string${tail} // minLength: ${m[1]} maxLength: ${m[2]}`;
			else type = `${type || "string"}${tail}`;
			let required = /true/.test(tds[1].innerText);
			if (desc) lines.push("\t".repeat(deep + 1) + `/** ${desc} */`);
			lines.push(
				"\t".repeat(deep + 1) + `${name}${required ? "" : "?"}: ${type}`
			);
		},
		getCode(result) {
			const el = this.table;
			let infoEl = document.querySelector(".api-base-info");
			let m = /接口地址:\s*(\S+)/.exec(infoEl.innerText);
			let name = m[1].split("/").pop();
			console.log(name);
			let trs = el.querySelectorAll(".div-table>.div-table-line>.cb");
			let lines = [
				`export interface ${CamelCase(name)}${result ? `Result` : `Param`} {`,
			];
			for (let i = 0; i < trs.length; i++) {
				let tr = trs[i];
				this.readLine(tr, lines, result, 0);
			}
			lines.push("}");
			return lines.join("\n");
		},
		getFnCode() {
			const el = this.table;
			let infoEl = document.querySelector(".api-base-info");
			let m = /接口地址:\s*(\S+)/.exec(infoEl.innerText);
			let url = m[1];
			let name = url.split("/").pop();
			console.log(name);
			let lines = [
				`export default function (data: ${CamelCase(
					name
				)}Param): Promise<${CamelCase(name)}Result> {`,
				`\treturn httpv1.post("/v1${url.split("v1")[1]}", data);`,
				`}`,
			];
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
		copyFn(e) {
			if (copy(this.getFnCode())) {
				var prev = e.target.innerText;
				e.target.innerText = "已复制";
				setTimeout(function () {
					e.target.innerText = prev;
				}, 1e3);
			}
		},
	},
	mounted() {},
	components: {},
};
</script>
<style lang="less">
.segirl-plugins-tableparams {
	button {
		margin-right: 5px;
	}
}
</style>
