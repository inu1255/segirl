<template>
	<div v-show="show" class="__segirl-app" :style="{left: pos.x + 'px', top: pos.y + 'px'}">
		<div v-show="show == 1" class="__segirl-controller" @mousedown="doMove">
			<img :src="$url(`icons/128.png`)" @dragstart.prevent />
		</div>
		<div v-show="show == 2" class="__segirl-container">
			<plugin-box v-for="(item, i) in list" v-show="item.show" :key="i" :name="item.title">
				<component
					:is="item"
					:text="text"
					:el="el"
					:show="show == 2"
					@open="open(i, $event)"
				></component>
			</plugin-box>
			<div class="__segirl-move-box" @mousedown="doMove"></div>
		</div>
	</div>
</template>
<script>
import {isParent, moveIt} from "../common/utils";
import PluginBox from "./PluginBox";
import plugins from "../segirl-plugins";

export default {
	name: "App",
	components: Object.assign({}, plugins, {
		PluginBox,
	}),
	data() {
		let list = [];
		for (let k in plugins) {
			let v = plugins[k];
			v.show = false;
			list.push(v);
		}
		return {
			show: 0,
			pos: {x: 0, y: 0},
			list,
			text:
				location.protocol == "chrome-extension:" ? decodeURIComponent(location.hash.slice(1)) : "",
			el: null,
		};
	},
	computed: {},
	watch: {},
	mounted() {
		document.addEventListener("mouseup", (e) => {
			if (e.button != 0) return;
			if (!this.show) {
				// 没有打开时才调整位置
				this.pos.x = e.clientX + 20;
				this.pos.y = e.clientY + 20;
			}
			if (isParent(e.target, this.$el)) return;
			for (let item of this.list) {
				item.show = false;
			}
			setTimeout(() => {
				this.setText();
			});
		});
		document.addEventListener("contextmenu", (e) => {
			if (!this.show) {
				// 没有打开时才调整位置
				this.pos.x = e.clientX + 20;
				this.pos.y = e.clientY + 20;
			}
			if (isParent(e.target, this.$el)) return;
			for (let item of this.list) {
				item.show = false;
			}
			if (e.altKey) {
				this.el = e.target;
				if (e.target.tagName == "INPUT") {
					if (e.target.type == "password") {
						e.target.type = "text";
						e.target._type = "password";
					} else if (e.target._type) {
						e.target.type = e.target._type;
					}
				}
				this.pos.x = e.clientX + 20;
				this.pos.y = e.clientY + 20;
				this.show = 2;
				e.preventDefault();
			} else {
				this.el = null;
			}
		});
	},
	methods: {
		noop() {},
		doMove(e) {
			moveIt(e, {
				onchange: (e) => {
					this.pos.x += e.x;
					this.pos.y += e.y;
				},
				onend: (d) => {
					console.log(d.totalDistance());
					if (d.totalDistance() < 3) {
						this.show = 2;
					}
				},
			});
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
			let text = (sel + "").trim();
			if (text) {
				this.text = text;
				console.log(text);
			} else {
				this.text = "";
				this.show = 0;
				this.el = null;
			}
		},
	},
};
</script>
<style lang="less">
[data-segirl-target] {
	border: 1px dashed #a90e0e !important;
}
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
		> input {
			padding: 7px 3px;
			border: none;
			border-bottom: 1px dashed #ccc;
			margin: 12px 0;
			color: #666;
		}
		--content-font: Georgia, Nimbus Roman No9 L, Songti SC, Noto Serif CJK SC, Source Han Serif SC,
			Source Han Serif CN, STSong, AR PL New Sung, AR PL SungtiL GB, NSimSun, SimSun, TW-Sung,
			WenQuanYi Bitmap Song, AR PL UMing CN, AR PL UMing HK, AR PL UMing TW, AR PL UMing TW MBE,
			PMingLiU, MingLiU, serif;
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
		button {
			font-size: 12px;
			padding: 1px 3px;
			cursor: pointer;
			border-radius: 5px;
			background: transparent;
			&:hover {
				background: #c1acfc;
				border-color: #c1acfc;
				color: #eee;
			}
			&.active {
				background: #926bfc;
				border-color: #926bfc;
				color: #eee;
			}
		}

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
