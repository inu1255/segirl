import Vue from 'vue';
import Root from './Root.vue';
import '../common/base.less';
import * as utils from '../common/utils'

Vue.config.productionTip = false;
window.utils = utils

chrome.tabs.getCurrent(tab => {
	if (tab) {
		let vue = new Vue({
			el: '#root',
			render: h => h(Root)
		});
	} else {
		let url = chrome.runtime.getURL('pages/popup.html')
		chrome.tabs.create({
			url,
			active: true,
		})
		window.close()
	}
})