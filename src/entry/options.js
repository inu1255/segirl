import Vue from "vue";
import App from "../view/options.vue";
import config from "../common/config";

Vue.config.productionTip = false;

var data = {};
for (let k in config) {
	Object.defineProperty(data, k, {
		enumerable: true,
		configurable: true,
		get() {
			return config[k];
		},
		set(value) {
			if (config[k] === value) return;
			config[k] = value;
			chrome.storage.local.set({
				[k]: value,
			});
		},
	});
}

/* eslint-disable no-new */
let vue = new Vue({
	data: data,
	render: (h) => h(App),
}).$mount("#app");

chrome.storage.onChanged.addListener((changes) => {
	for (let key in changes) {
		vue[key] = changes[key].newValue;
	}
});
