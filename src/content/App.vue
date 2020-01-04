<template>
	<div v-show="show" class="__segirl-app" :style="{left:pos.x+'px',top:pos.y+'px'}">
		<div v-show="show==1" class="__segirl-controller" @click="show=2" v-move="move">
			<img :src="$url(`icons/128.png`)">
		</div>
		<div v-show="show==2" class="__segirl-container">
			<plugin-box v-for="(item,i) in list" v-show="item.show" :name="item.title">
				<component :is="item" :text="text" :el="el" :show="show==2" @open="open(i,$event)"></component>
			</plugin-box>
			<div class="__segirl-move-box" v-move="move"></div>
		</div>
	</div>
</template>
<script>
import { isParent } from "../common/utils";
import PluginBox from '../components/PluginBox';
import * as plugins from '../segirl-plugins'

export default {
	name: "App",
	data() {
		let list = []
		for (let k in plugins) {
			let v = plugins[k]
			v.show = false;
			list.push(v);
		}
		return {
			show: 0,
			pos: { x: 0, y: 0 },
			list,
			text: location.protocol == "chrome-extension:" ? location.hash.slice(1) : "",
			el: null,
		}
	},
	computed: {

	},
	watch: {
	},
	methods: {
		noop() { },
		move(type, e) {
			if (type == "start") {
				this._prev = Object.assign({}, this.pos)
				e.stopPropagation();
			} else {
				this.pos.x = this._prev.x + e.dx;
				this.pos.y = this._prev.y + e.dy;
			}
		},
		call(info) {
			this.show = true;
		},
		open(i, n) {
			this.list[i].show = true;
			if (!this.show) this.show = n == null ? 1 : n;
		},
		setText() {
			const sel = window.getSelection();
			let text = (sel + '').trim();
			if (text) {
				this.text = text;
				console.log(text)
			}
			else {
				this.text = "";
				this.show = 0;
			}
		},
	},
	mounted() {
		document.addEventListener('mouseup', e => {
			if (e.button != 0) return;
			if (!this.show) { // 没有打开时才调整位置
				this.pos.x = e.clientX + 20;
				this.pos.y = e.clientY + 20;
			}
			if (isParent(e.target, this.$el)) return;
			for (let item of this.list) {
				item.show = false;
			}
			this.setText()
		});
		document.addEventListener('contextmenu', e => {
			if (!this.show) { // 没有打开时才调整位置
				this.pos.x = e.clientX + 20;
				this.pos.y = e.clientY + 20;
			}
			if (isParent(e.target, this.$el)) return;
			for (let item of this.list) {
				item.show = false;
			}
			this.setText()
			if (e.altKey) {
				this.el = e.target;
				this.pos.x = e.clientX + 20;
				this.pos.y = e.clientY + 20;
				this.show = 2;
				e.preventDefault()
			} else {
				this.el = null;
			}
		});
	},
	components: Object.assign({}, plugins, {
		PluginBox,
	}),
}
</script>
<style lang="less">
@import "~@/styles/container.less";
.__segirl-app {
	position: fixed;
	z-index: 98000;
	> .__segirl-controller {
		> img {
			width: 45px;
			border-radius: 50%;
			border: 1px solid #a90e0e;
			transition: transform 0.3s;
			cursor: pointer;
			box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
			&:hover {
				transform: scale(1.2);
			}
		}
	}
	> .__segirl-container {
		.container;
		--panel-width: 550px;
		> .__segirl-move-box {
			position: absolute;
			left: 0;
			top: 0;
			width: 0;
			height: 0;
			background: transparent;
			border-top: 6px solid #aaa;
			border-right: 6px solid transparent;
			border-bottom: 6px solid transparent;
			border-left: 6px solid #aaa;
			cursor: move;
			user-select: none;
		}
	}
}
</style>
