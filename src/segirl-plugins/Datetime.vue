<template>
	<div class="segirl-plugins-datetime">
		<div v-for="item in list"><b>{{item.key}}</b>{{item.value}}</div>
	</div>
</template>
<script>
/**
 * 格式化时间显示
 * @param {number} t 
 * @param {string} format 
 */
function format(t, format) {
	var Y = (t.getFullYear() + 1e4).toString().slice(1);
	return format.replace(/YYYY/g, Y)
		.replace(/YY/g, Y.slice(2))
		.replace(/MM/g, (t.getMonth() + 101).toString().slice(1))
		.replace(/DD/g, (t.getDate() + 100).toString().slice(1))
		.replace(/hh/g, (t.getHours() + 100).toString().slice(1))
		.replace(/mm/g, (t.getMinutes() + 100).toString().slice(1))
		.replace(/ss/g, (t.getSeconds() + 100).toString().slice(1));
};

export default {
	title: "时间转换",
	props: {
		text: String,
	},
	data() {
		return {
			list: [],
		}
	},
	watch: {
		text() {
			let date, text = this.text
			if (!/\d/.test(text)) return;
			if (/^\d+$/.test(text)) date = new Date(+text);
			else {
				text = text.replace(/-/g, '/').replace(/年/, '/').replace(/月/, '/').replace(/日/, ' ').replace(/小?时/, ':').replace(/分钟?/, ':').replace(/秒/, '').replace(/(\d+)\s+\//g, '$1/').replace(/(\d+)\s+:/g, '$1:')
				date = new Date(text);
			}
			console.log(date)
			if (!isNaN(date)) {
				let list = [];
				list.push({ key: '日期时间', value: format(date, 'YYYY-MM-DD hh:mm:ss') })
				list.push({ key: '时间辍', value: date.getTime() })
				list.push({ key: '距离', value: this.fromNow(date) })
				this.list = list
				this.$emit('open')
			}
		}
	},
	computed: {

	},
	methods: {
		diff: function (v, digits, suffix) {
			suffix = suffix || '';
			var s = '';
			var ts = [
				[86400e3, "天"],
				[3600e3, "小时"],
				[60e3, "分钟"],
				[1e3, "秒"],
			];
			for (var i = 0; i < ts.length; i++) {
				var unit = ts[i];
				var diff = v / unit[0];
				var tmp = Math.floor(diff);
				if (tmp) {
					if (digits) {
						var n = Math.pow(10, digits);
						s = Math.floor(v / unit[0] * n) / n;
					} else {
						s = tmp;
					}
					s += unit[1];
					break;
				}
			}
			if (s) return s + suffix;
		},
		fromNow: function (v, digits, def) {
			this.tick;
			digits = digits || 0;
			if (!v) return def || '未设置';
			if (typeof v === "number" && v < 1e12) {
				v *= 1e3;
			}
			v = +new Date(v)
			var suffix = ''
			if (v > 86400e3 * 365) {
				v -= Date.now();
				suffix = v > 0 ? '后' : '前'
			}
			var s = this.diff(Math.abs(v), digits, suffix);
			if (s) return s;
			return '刚刚';
		},
	},
	mounted() {

	},
	components: {

	},
}
</script>
<style lang="less">
.segirl-plugins-datetime {
	b {
		margin-right: 5px;
	}
}
</style>
