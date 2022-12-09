<template>
	<div class="segirl-plugins-hexbin">
		<div style="margin-bottom: 12px">
			<input v-model="radix" type="number" step="1" min="2" max="36" />
			<button :class="{active: radix == 2}" @click="radix = 2">二进制</button>
			<button :class="{active: radix == 8}" @click="radix = 8">八进制</button>
			<button :class="{active: radix == 10}" @click="radix = 10">十进制</button>
			<button :class="{active: radix == 16}" @click="radix = 16">16进制</button>
		</div>
		<div v-for="item in list" :key="item.key">
			<b>{{ item.key }}</b
			>{{ item.value }}
		</div>
	</div>
</template>
<script>
export default {
	title: "进制转换",
	components: {},
	props: {
		text: String,
	},
	data() {
		return {
			radix: 10,
		};
	},
	computed: {
		num() {
			return parseInt(this.text, this.radix);
		},
		list() {
			let n = this.num;
			let list = [];
			list.push({key: "二进制", value: n.toString(2)});
			list.push({key: "八进制", value: n.toString(8)});
			list.push({key: "十进制", value: n.toString(10)});
			list.push({key: "十六进制", value: n.toString(16)});
			return list;
		},
	},
	watch: {
		text() {
			let text = this.text;
			if (!text) return;
			let num = +text;
			if (isNaN(num) || /^0x/.test(text)) {
				num = parseInt(text, 16);
				this.radix = 16;
			} else this.radix = 10;
			if (isNaN(num) || num.toString().length + 2 < text.length) return;
			this.$emit("open");
		},
	},
	mounted() {},
	methods: {},
};
</script>
<style lang="less">
.segirl-plugins-hexbin {
	b {
		margin-right: 5px;
		display: inline-block;
		min-width: 4em;
	}
}
</style>
