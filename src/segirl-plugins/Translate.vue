<template>
	<div class="segirl-plugins-translate">
		<div>
			<span>{{ data.result }}</span
			><span v-for="(item, i) in data.sounds || []" :key="i" @click="play(item.url)"
				><b>{{ item.type }}</b
				>[{{ item.text }}]</span
			>
		</div>
		<div v-for="(item, i) in data.dict || []" :key="i">
			<b>{{ item.pos }}</b
			><span>{{ item.text }}</span>
		</div>
	</div>
</template>
<script>
function hasEnglish(content) {
	return /[a-zA-Z]+/g.test(content);
}

export default {
	title: "搜狗翻译",
	components: {},
	props: {
		text: String,
		show: Boolean,
	},
	data() {
		return {
			data: {},
		};
	},
	computed: {},
	watch: {
		text() {
			if (!this.text) return;
			if (/^\w+-extension:/.test(location.href)) this.translate(this.text);
			else this.$emit("open");
		},
		show() {
			if (this.show && this.prev != this.text) {
				this.translate(this.text);
			}
		},
	},
	mounted() {
		this.translate(this.text);
	},
	methods: {
		async translate(text) {
			this.prev = text;
			chrome.runtime.sendMessage({type: "translate", text}, (data) => {
				if (!data) return;
				this.data = data;
				this.$emit("open");
			});
		},
		play(url) {
			if (!url) return;
			if (url.startsWith("//")) url = "http:" + url;
			chrome.runtime.sendMessage({type: "playsound", url}, (data) => {});
		},
	},
};
</script>
<style lang="less">
.segirl-plugins-translate {
	font-size: 14px;
	> div:first-child {
		display: flex;
		font-size: 15px;
		> span {
			cursor: pointer;
			margin-left: 5px;
		}
		> :first-child {
			flex: 1;
			margin-left: 0;
			cursor: text;
		}
	}
	b {
		margin-right: 3px;
	}
}
</style>
