<template>
	<div v-show="show" class="__segirl-app" :style="{left:pos.x+'px',top:pos.y+'px'}">
		<div v-show="show==1" class="__segirl-controller" @click="show=2" v-move="move">
			<img :src="$url(`icons/128.png`)">
		</div>
		<div v-show="show==2" class="__segirl-contianer">
			<plugin-box v-for="(item,i) in list" v-show="item.show" :name="item.title">
				<component :is="item" :text="text" @open="open(i)"></component>
			</plugin-box>
		</div>
	</div>
</template>
<script>
import { isParent } from "../common/utils";
import PluginBox from './PluginBox';
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
			if (!this.show) this.show = 1;
		},
	},
	mounted() {
		document.addEventListener('mouseup', e => {
			if (!this.show) { // 没有打开时才调整位置
				this.pos.x = e.clientX + 20;
				this.pos.y = e.clientY + 20;
			}
			if (isParent(e.target, this.$el)) return;
			const sel = window.getSelection();
			let text = (sel + '').trim();
			if (text) {
				if (text == this.text) {
					this.show = 1;
				} else {
					this.text = text;
					for (let item of this.list) {
						item.show = false;
					}
				}
				console.log(text)
			}
			else this.show = 0;
		})
	},
	components: Object.assign({}, plugins, {
		PluginBox,
	}),
}
</script>
<style lang="less">
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
	> .__segirl-contianer {
		--content-font: Georgia, Nimbus Roman No9 L, Songti SC,
			Noto Serif CJK SC, Source Han Serif SC, Source Han Serif CN, STSong,
			AR PL New Sung, AR PL SungtiL GB, NSimSun, SimSun, TW-Sung,
			WenQuanYi Bitmap Song, AR PL UMing CN, AR PL UMing HK,
			AR PL UMing TW, AR PL UMing TW MBE, PMingLiU, MingLiU, serif;
		--panel-width: 550px;
		box-sizing: border-box;
		position: absolute;
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
		margin: unset;
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
