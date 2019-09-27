<template>
	<mu-dialog title="添加/更新脚本?" :width="360" v-loading="loading" :open="Boolean(open)" @update:open="close" class="pages-preview" scrollable>
		<ul>
			<li><span class="key">脚本名：</span>{{task.name}}</li>
			<li><span class="key">作者：</span>{{task.author}}</li>
			<li><span class="key">域名：</span>{{task.domains+''}}</li>
			<li><span class="key">版本：</span>{{task.version}}</li>
			<li><span class="key">在线检查频率：</span>{{task.expire||900e3|diff}}</li>
		</ul>
		<div v-if="task.namespace" class="tar">
			<a :href="task.namespace" target="_blank">脚本主页</a>
		</div>
		<mu-button slot="actions" flat @click="close">取消</mu-button>
		<mu-button slot="actions" flat color="primary" @click="$emit('submit',task)">确定</mu-button>
	</mu-dialog>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import utils from '../../common/utils';

@Component()
export default class Preview extends Vue {
	@Prop() open
	task = {}
	loading = false

	@Watch('open')
	@utils.loading()
	async refresh() {
		if (!this.open) return
		try {
			let { data } = await utils.axios.get(this.open)
			this.task = utils.compileTask(data)
		} catch (error) {
			this.$toast.error(error + '')
			this.close()
		}
	}
	close() {
		location.href = '#'
		this.$emit('update:open', false)
	}
	mounted() {
		if (this.open) this.refresh()
	}
}
</script>
<style lang="less">
.pages-preview {
  ul {
    padding: 0;
    margin: 0;
  }
  li {
    list-style: none;
  }
  .key {
    color: #333;
    display: inline-block;
    width: 112px;
    text-align: right;
  }
}
</style>
