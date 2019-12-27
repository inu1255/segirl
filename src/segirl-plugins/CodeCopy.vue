<template>
	<div class="segirl-plugins-codecopy">
		<button v-for="item in list" @mouseenter="onEnter(item)" @mouseleave="onLeave(item)" @click="onClick(item,$event)">{{item.tagName.toLowerCase()}}</button>
	</div>
</template>
<script>
import { copy } from '../common/utils'
export default {
	title: "文本复制",
	props: {
		el: {},
	},
	data() {
		return {
			radix: 10,
			list: [],
		}
	},
	watch: {
		el() {
			let el = this.el
			if (!el) return
			let p = el;
			let list = []
			while (p) {
				if (p.innerText) list.push(p)
				p = p.parentElement;
			}
			this.list = list;
			if (list.length)
				this.$emit('open')
		}
	},
	computed: {
	},
	methods: {
		onEnter(item) {
			var cover = this.cover;
			var rect = item.getBoundingClientRect()
			cover.style.display = 'block'
			cover.style.top = rect.top + 'px'
			cover.style.left = rect.left + 'px'
			cover.style.width = rect.width + 'px'
			cover.style.height = rect.height + 'px'
			cover.innerText = item.innerText.replace(/\n\n/g, '\n');
		},
		onLeave(item) {
			var cover = this.cover;
			cover.style.display = 'none';
		},
		onClick(item, e) {
			if (copy(item.innerText.replace(/\n\n/g, '\n'))) {
				var prev = e.target.innerText
				e.target.innerText = '已复制'
				setTimeout(function () {
					e.target.innerText = prev;
				}, 1e3)
			}

		},
	},
	mounted() {
		var cover = document.createElement('pre')
		cover.setAttribute('style', 'background:rgba(153,197,230,0.8);position:fixed;display:none;')
		document.body.appendChild(cover)
		this.cover = cover
		document.addEventListener('mousedown', () => {
			cover.style.display = 'none';
		})
	},
	components: {

	},
}
</script>
<style lang="less">
.segirl-plugins-codecopy {
	button {
		margin-right: 5px;
	}
}
</style>
