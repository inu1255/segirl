export default {
	title: "计算器",
	render(h) {
		return h("div", this.result);
	},
	props: {
		text: String,
	},
	data() {
		return {
			result: "",
		};
	},
	watch: {
		text() {
			if (/^\d/.test(this.text) && !/^[\d\.]+$/.test(this.text)) {
				try {
					this.result = this.text + " = " + eval(`(${this.text})`);
					this.$emit("open");
				} catch (e) {}
			}
		},
	},
};
