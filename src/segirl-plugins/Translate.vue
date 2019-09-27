<template>
	<div class="segirl-plugins-translate">
		<div><span>{{data.result}}</span><span v-for="(item,i) in data.sounds||[]" @click="play(item.url)"><b>{{item.type}}</b>[{{item.text}}]</span></div>
		<div v-for="(item,i) in data.dict||[]"><b>{{item.pos}}</b><span>{{item.text}}</span></div>
	</div>
</template>
<script>
import { translateBaidu } from '../common/utils';

function hasEnglish(content) {
	return /[a-zA-Z]+/g.test(content)
}

export default {
	title: "搜狗翻译",
	props: {
		text: String,
	},
	data() {
		return {
			data: {},
		}
	},
	watch: {
		text() {
			this.translate(this.text)
		}
	},
	computed: {

	},
	methods: {
		async translate(text) {
			if (!text || !hasEnglish(text)) return;
			chrome.extension.sendRequest(null, { type: 'translate', text }, data => {
				if (!data) return;
				this.data = data;
				this.$emit('open')
			});
		},
		play(url) {
			if (!url) return;
			if (url.startsWith('//')) url = 'http:' + url;
			chrome.extension.sendRequest(null, { type: 'playsound', url }, data => { });
		}
	},
	mounted() {
		this.translate(this.text);
	},
	components: {

	},
}
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
