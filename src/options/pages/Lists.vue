<template>
	<mu-dialog title="脚本推荐" :width="360" v-loading="loading" :open="Boolean(open)" @update:open="close" class="pages-lists" scrollable>
		<ul>
			<li class="tac" v-for="(item,i) in list" :key="i">
				<a :href="'#https://gitee.com/inu1255/soulsign-chrome/raw/master/public/demos/'+item[1]">{{item[0]}}</a>
			</li>
		</ul>
		<mu-button slot="actions" flat @click="close">关闭</mu-button>
	</mu-dialog>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import utils from '../../common/utils';

@Component()
export default class Lists extends Vue {
	@Prop() open
	loading = false
	list = []
	sort = { name: 'name', order: 'asc' }
	@Watch('open')
	@utils.loading()
	async refresh() {
		if (!this.open) return
		let { data } = await utils.axios.get(`https://gitee.com/inu1255/soulsign-chrome/raw/master/public/demos.json`)
		this.list = data
	}
	close() {
		this.$emit('update:open', false)
	}
	mounted() {
		if (this.open) this.refresh()
	}
}
</script>
<style lang="less">
.pages-lists {
  ul {
    padding: 0;
    margin: 0;
    min-height: 40vh;
  }
  li {
    list-style: none;
    margin: 3px 5px;
  }
}
</style>
