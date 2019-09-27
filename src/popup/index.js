import Vue from 'vue';
import Root from './Root.vue';
import '../common/base.less';

Vue.config.productionTip = false;

/* eslint-disable no-new */
let vue = new Vue({
    el: '#root',
    render: h => h(Root)
});