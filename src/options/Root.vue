<template>
	<div class="root">
	</div>
</template>
<script>
import utils from '../common/utils.js'
export default {
	
}
</script>
<style lang="less">
.root {
	a.app {
		color: #000;
		text-decoration: underline;
	}
	td img {
		height: 20px;
		margin: 0 1px;
	}
	.console {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 240px;
		background: #eee;
		border-top: 1px solid #555;
		ul {
			padding: 0;
			margin: 0;
			height: 216px;
		}
		li {
			list-style: none;
			.small {
				color: #aaa;
			}
			> .info {
				color: #00c853;
			}
			> .error {
				color: #f44336;
			}
			> .warning {
				color: #ffeb3b;
			}
		}
	}
}
</style>
