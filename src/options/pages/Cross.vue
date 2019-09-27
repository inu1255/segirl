<template>
	<mu-container class="pages-cross" style="margin-bottom: 245px;max-width: 640px;">
		<pre>加入白名单的站点可以跨域访问任何其它网址</pre>
		<br>
		<mu-text-field label="跨域头" v-model="$root.cross_header" full-width placeholder="Access-Control-Allow-Headers"></mu-text-field>
		<div class="tar">
			<mu-text-field v-model="site" placeholder="站点(协义://域名:[端口])"></mu-text-field>
			<mu-button @click="add" color="primary">添加</mu-button>
		</div>
		<mu-data-table :columns="columns" :data="cross_list" stripe>
			<template slot-scope="{row,$index}">
				<td>{{row.site}}</td>
				<td>
					<mu-switch :input-value="Boolean(row.cookie)" @change="row.cookie=row.cookie?0:2"></mu-switch>
				</td>
				<td>
					<mu-switch :input-value="Boolean(row.enable)" @change="row.enable=row.enable?0:1"></mu-switch>
				</td>
				<td>
					<mu-button small @click="del($index)" color="error">删除</mu-button>
				</td>
			</template>
		</mu-data-table>
		<br>
		<div class="tar">
			<mu-button @click="saveCrose" color="primary">保存</mu-button>
		</div>
	</mu-container>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import utils from '../../common/utils';

@Component()
export default class Cross extends Vue {
	cross_list = []
	site = ''
	columns = [{
		title: '站点(协义://域名:[端口])',
	}, {
		title: 'cookie跨域',
		width: 128,
	}, {
		title: '启用',
		width: 62,
	}, {
		title: '操作',
		width: 128,
	}]
	add() {
		let host = /[^:]+:\/\/[^/]+/.exec(this.site);
		if (!host) return this.$toast.error('站点格式错误')
		host = host[0]
		for (let item of this.cross_list) {
			if (item.site == host)
				return this.$toast.error('站点已存在')
		}
		this.cross_list.push({
			site: host,
			enable: 1,
			cookie: 0,
		})
		this.$toast.success('添加成功')
	}
	del(i) {
		this.cross_list.splice(i, 1)
	}
	getCrossList() {
		let allow_cross = this.$root.allow_cross
		let list = []
		for (let k in allow_cross) {
			let v = allow_cross[k]
			list.push({
				site: k,
				enable: v & 1,
				cookie: v & 2,
			})
		}
		this.cross_list = list
	}
	saveCrose() {
		let allow_cross = {}
		for (let item of this.cross_list) {
			allow_cross[item.site] = item.enable | item.cookie
		}
		this.$root.allow_cross = allow_cross
		this.$toast.success('保存成功')
	}
	async mounted() {
		await utils.sleep(500)
		this.getCrossList()
		this.$forceUpdate()
	}
}
</script>
<style lang="less">
.pages-cross {
}
</style>
