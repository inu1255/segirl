import Vue from 'vue';
import Root from './Root.vue';
import config from '../common/config.js';
import '../components';
import '../common/base.less';

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
                [k]: value
            });
        }
    });
}

/* eslint-disable no-new */
let vue = new Vue({
    el: '#root',
    data: data,
    render: h => h(Root)
});

chrome.storage.onChanged.addListener(changes => {
    for (let key in changes) {
        vue[key] = changes[key].newValue;
    }
});