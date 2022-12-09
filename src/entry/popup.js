import Vue from "vue";
import * as utils from "../common/utils";

Vue.config.productionTip = false;
window.utils = utils;

chrome.tabs.query({active: true}, function (tabs) {
	tabs.forEach((tab) => {
		chrome.tabs.executeScript(tab.id, {
			code: `window.segirl_all()`,
		});
	});
	window.close();
});
// chrome.tabs.getCurrent((tab) => {
// 	console.log(tab);
// 	if (tab) {
// 		let vue = new Vue({
// 			el: "#root",
// 			render: (h) => h(Root),
// 		});
// 	} else {
// 		// let url = chrome.runtime.getURL('pages/popup.html')
// 		// chrome.tabs.create({
// 		// 	url,
// 		// 	active: true,
// 		// })
// 		// window.close()
// 	}
// });
