import Vue from "vue";
import App from "../hd/App.vue";

const root = document.createElement("div");
document.body.appendChild(root);
new Vue({
	data: {
		show: false,
	},
	render: (h) => h(App),
}).$mount(root);
