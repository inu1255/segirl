module.exports = function (moduleOptions) {
	this.extendBuild((config, {isClient, isModern}) => {
		const vueRule = config.module.rules.find((rule) => rule.test.test(".vue"));
		if (!vueRule.use) {
			let {loader, options} = vueRule;
			delete vueRule.loader;
			delete vueRule.options;
			vueRule.use = [
				{
					loader: require.resolve("./auto-loader.js"),
					options: {
						tagMapFn(tag, componentName) {
							if (componentName === "IBranch") return "@/components/ITree/IBranch";
							if (tag.startsWith("i-")) return "@/components/" + componentName;
							if (tag.startsWith("el-")) {
								return `element-ui/lib/${tag.substr(3)}`;
							}
						},
						sortFn(a, b) {
							const order = "eih";
							var ia = order.indexOf(a[0].toLowerCase());
							var ib = order.indexOf(b[0].toLowerCase());
							if (ia === -1) ia = order.length;
							if (ib === -1) ib = order.length;
							return ia - ib;
						},
					},
				},
				{
					loader,
					options,
				},
			];
		}
		if (!isClient) return;
		// 使用local-loader，保证在mounted之后能使用 $local 中的数据
		const jsRule = config.module.rules.find((rule) => rule.test.test(".js"));
		jsRule.use.push({
			loader: require.resolve("./local-loader"),
		});
	});
};
