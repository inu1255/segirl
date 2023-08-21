<template>
	<div class="segirl-plugins-codecopy">
		<button
			v-for="(item, i) in list"
			:key="i"
			@mouseenter="onEnter(item)"
			@mouseleave="onLeave(item)"
			@click="onClick(item, $event)"
		>
			{{ item.tagName.toLowerCase() }}
		</button>
	</div>
</template>
<script>
import {copy} from "../common/utils";
export default {
	title: "文本复制",
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
			if (!el) return;
			let p = el;
			let list = [];
			while (p) {
				if (p.innerText) list.push(p);
				p = p.parentElement;
			}
			this.list = list;
			if (list.length) this.$emit("open");
		},
	},
	mounted() {
		var cover = document.createElement("pre");
		cover.setAttribute(
			"style",
			"background:rgba(153,197,230,0.8);position:fixed;top:0;left:0;display:none;margin:0 !important;color:red;overflow:visible;white-space:pre-wrap;z-index:97000;pointer-events:none;"
		);
		document.body.appendChild(cover);
		var rect = cover.getBoundingClientRect();
		cover.style.transform = `translate(-${rect.left}px, -${rect.top}px)`;
		this.cover = cover;
		document.addEventListener("mousedown", () => {
			cover.style.display = "none";
		});
	},
	methods: {
		onEnter(item) {
			var cover = this.cover;
			var rect = item.getBoundingClientRect();
			cover.style.display = "block";
			cover.style.top = Math.max(rect.top, 0) + "px";
			cover.style.left = Math.max(rect.left, 0) + "px";
			cover.style.width = rect.width + "px";
			cover.style.height = rect.height + "px";
			cover.innerText = item.innerText.replace(/\n\n/g, "\n");
		},
		onLeave(item) {
			var cover = this.cover;
			cover.style.display = "none";
		},
		onClick(item, e) {
			if (copy(item.innerText.replace(/\n\n/g, "\n"))) {
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
.segirl-plugins-codecopy {
	button {
		margin: 0 !important;
		margin-right: 5px !important;
		color: #000;
	}
}
</style>
