export default {
	title: 'base64解码',
	template: '<div>{{result}}</div>',
	props: {
		text: String,
	},
	data() {
		return {
			result: '',
		}
	},
	watch: {
		text() {
			if (/^[a-zA-Z0-9+/=-]+$/.test(this.text)) {
				this.result = this.decrypt(this.text)
				this.$emit('open')
			}
		}
	},
	methods: {
		decrypt(a) {
			a = atob(a);
			var b = '';
			for (var i = 0; i < a.length; i++) {
				var code = a.charCodeAt(i);
				if (code < 128) b += String.fromCharCode(code);
				else {
					var n = 1;
					while (code & (1 << 7 - n)) n++;
					var v = code & (1 << 7 - n) - 1;
					while (--n) {
						v = (v << 6) + (63 & a.charCodeAt(++i));
					}
					b += String.fromCharCode(v);
				}
			}
			return b;
		}
	},
}