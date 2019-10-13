<template>
	<div class="__segirl-app">
		<div class="__segirl-contianer">
			<input type="text" v-model="text">
			<plugin-box v-for="(item,i) in list" v-show="item.show" :name="item.title">
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
			this.read().then(sel => {
				let text = (sel + '').trim();
				if (text) {
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
body {
	margin: 0;
}
.__segirl-app {
	position: relative;
	min-width: 550px;
	min-height: 63px;
	> .__segirl-contianer {
		> input {
			padding: 7px 3px;
			border: none;
			border-bottom: 1px dashed #ccc;
			margin: 12px 0;
			color: #666;
		}
		--content-font: Georgia, Nimbus Roman No9 L, Songti SC,
			Noto Serif CJK SC, Source Han Serif SC, Source Han Serif CN, STSong,
			AR PL New Sung, AR PL SungtiL GB, NSimSun, SimSun, TW-Sung,
			WenQuanYi Bitmap Song, AR PL UMing CN, AR PL UMing HK,
			AR PL UMing TW, AR PL UMing TW MBE, PMingLiU, MingLiU, serif;
		--panel-width: 90%;
		margin: 12px auto;
		box-sizing: border-box;
		display: flex;
		width: unset;
		height: unset;
		text-align: initial;
		max-width: var(--panel-width);
		min-width: var(--panel-width);
		color: rgb(17, 17, 17);
		contain: layout;
		text-rendering: optimizelegibility;
		-webkit-font-smoothing: antialiased;
		box-shadow: rgba(0, 0, 0, 0.12) 0px 12px 45px 0px;
		border: unset;
		outline: unset;
		flex-flow: column;
		padding: 12px;
		padding-top: 5px;
		background: rgb(255, 255, 255);
		border-radius: 6px;
	}
}
</style>
