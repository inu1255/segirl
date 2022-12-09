<template>
	<div class="__segirl-plugin-box">
		<slot></slot>
		<div>{{ name }}</div>
	</div>
</template>
<script>
export default {
	name: "PluginBox",
	components: {},
	props: {
		name: String,
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {
		close(e) {
			console.log("close", e);
		},
	},
};
</script>
<style lang="less">
.__segirl-plugin-box {
	border-bottom: 1px solid #ccc;
	position: relative;
	padding: 12px 0;
	> div:last-child {
		position: absolute;
		right: 0;
		bottom: 0;
		text-align: right;
		font-size: 12px;
		color: #ccc;
	}
}
</style>
