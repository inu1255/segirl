<template>
	<div class="__segirl-app">
		<div class="__segirl-container">
			<input type="text" v-model="text">
			<plugin-box v-for="(item,i) in list" :key="i" v-show="item.show" :name="item.title">
				<component :is="item" :text="text" @open="open(i)"></component>
			</plugin-box>
		</div>
	</div>
</template>
<script>
import { isParent, clipboardRead, sleep } from "../common/utils";
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
			pos: { x: 0, y: 0 },
			list,
			text: '',
		}
	},
	computed: {

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
		open(i) {
			this.list[i].show = true;
		},
		read() {
			return clipboardRead()
		},
		run() {
			if (location.hash.length > 1)
				this.text = decodeURIComponent(location.hash.slice(1))
			else
				this.read().then(sel => {
					let text = (sel + '').trim();
					if (text && text != this.prev) {
						this.prev = text;
						if (text != this.text) {
							this.text = text;
							for (let item of this.list) {
								item.show = false;
							}
						}
						console.log(text)
					}
				});
		}
	},
	mounted() {
		this.run()
		window.onfocus = (e) => {
			this.run()
		}
	},
	components: Object.assign({}, plugins, {
		PluginBox,
	}),
}
</script>
<style lang="less">
@import "~@/styles/container.less";
body {
	margin: 0;
}
.__segirl-app {
	position: relative;
	min-width: 550px;
	min-height: 63px;
	> .__segirl-container {
		.container;
	}
}
</style>
