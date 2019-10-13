import Vue from 'vue';
import Root from './Root.vue';
import '../common/base.less';

Vue.config.productionTip = false;

chrome.tabs.getCurrent(tab => {
	if (tab) {
		let vue = new Vue({
			el: '#root',
			render: h => h(Root)
		});
	} else {
		let url = chrome.extension.getURL('pages/popup.html')
		chrome.tabs.create({
			url,
			active: true,
		})
		window.close()
	}
})