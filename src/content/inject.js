import Vue from 'vue';
import App from './App.vue';
Vue.directive('move', {
	bind: function(el, binding, vnode) {
		if (typeof binding.value === "function") {
			var bx, by;
			el.ontouchstart = el.onmousedown = function(e) {
				e.el = el;
				bx = e.clientX;
				by = e.clientY;
				binding.value('start', e);
			};
			el._move = function(e) {
				if (bx == null || e.buttons != 1) return;
				e.el = el;
				e.dx = e.clientX - bx;
				e.dy = e.clientY - by;
				binding.value('move', e);
			};
			document.addEventListener('touchmove', el._move);
			document.addEventListener('mousemove', el._move);
			el._end = function(e) {
				if (bx == null) return;
				e.el = el;
				e.dx = e.clientX - bx;
				e.dy = e.clientY - by;
				e.target.dxy = Math.sqrt(e.dx * e.dx + e.dy * e.dy);
				binding.value('end', e);
				bx = null;
			};
			document.addEventListener('touchend', el._end);
			document.addEventListener('mouseup', el._end);
		}
	},
	unbind(el) {
		el.ontouchstart = el.onmousedown = null;
		document.removeEventListener('touchmove', el._move);
		document.removeEventListener('mousemove', el._move);
		document.removeEventListener('touchend', el._end);
		document.removeEventListener('mouseup', el._end);
	}
});
Vue.prototype.$url = s => chrome.runtime.getURL(s);

const root = document.createElement('div')
document.body.appendChild(root);
let data = {
	show: false,
}
var vue = new Vue({
	data,
	render: h => h(App)
}).$mount(root);
console.log(vue)