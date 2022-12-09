export default {
	title: "ip归属地 power by ip.mcr.moe",
	render(h) {
		return h(
			"div",
			{
				style: {
					fontSize: "14px",
				},
			},
			this.result
		);
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
		async text() {
			if (/^\d+\.\d+\.\d+\.\d+$/.test(this.text)) {
				this.result = await this.lookup(this.text);
				if (this.result) this.$emit("open");
			}
		},
	},
	methods: {
		async lookup(ip) {
			let res = await fetch(`https://ip.mcr.moe/?ip=${ip}&compress`);
			let data = await res.json();
			let text = data.country || "未知";
			if (data.area) text += " | " + data.area;
			if (data.provider) text += " | " + data.provider;
			return text;
		},
	},
};
