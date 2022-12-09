import {debounce} from "@/common/utils";
import Vue from "vue";
import App from "../hd/App.vue";
import {findNodes, isPre} from "../lib/findnodes";
import "../lib/wenku.js";

Vue.prototype.$url = (s) => chrome.runtime.getURL(s);

const root = document.createElement("div");
document.body.appendChild(root);
new Vue({
	data: {
		show: false,
	},
	render: (h) => h(App),
}).$mount(root);

var set = new Set(); // 翻译过的节点
var mode = 0; // 0: 原文 1: 译文 2: 双语
var inited = false;
function init() {
	if (inited) return;
	inited = true;
	window.addEventListener("scroll", debounce(segirl_all));
	var handle = setInterval(() => {
		segirl_all();
	}, 3e3);
}
function segirl_all() {
	init();
	console.log("segirl_all", mode);
	let nodes = findNodes(document.body);
	console.log(nodes);
	let list = [];
	nodes.forEach((x) => {
		let y, text;
		if (x.nodeType == 3) {
			text = x.textContent;
			let font = document.createElement("font");
			if (!isPre(x.parentNode)) {
				text = text.trim().replace(/\s+/g, " ");
			}
			font.innerText = text;
			y = font;
		} else {
			text = x.innerText;
			y = x.cloneNode(true);
		}
		y.setAttribute("data-segirl-target", "");
		y.setAttribute("title", text.replace(/\s+/g, " "));
		set.add(y);
		x._segirl_el = y;
		y._segirl_el = x;
		list.push({y, text});
	});
	if (list.length) {
		console.log(list);
		chrome.runtime.sendMessage(
			{type: "translateAll", source: JSON.stringify(list.map((x) => x.text))},
			(data) => {
				if (!data) return;
				let res = data.target.map((x) => x.target);
				list.forEach((x, i) => {
					x.y.innerText = res[i];
				});
			}
		);
	}

	set.forEach((y) => {
		let x = y._segirl_el;
		if (!y.parentNode && !x.parentNode) {
			set.delete(y);
			return;
		}
		if (mode == 2 || mode == 0) {
			// 显示原文
			if (!x.parentNode) y.parentNode.insertBefore(x, y);
		}
		if (mode == 2 || mode == 1) {
			// 显示译文
			if (!y.parentNode) x.parentNode.insertBefore(y, x.nextSibling);
			if (y.tagName == "YT-FORMATTED-STRING") {
				// youtube 不显示bug fix
				y.removeAttribute("is-empty");
			}
		}
		if (mode == 1) {
			// 隐藏原文
			if (x.parentNode) x.parentNode.removeChild(x);
		}
		if (mode == 0) {
			// 隐藏译文
			if (y.parentNode) y.parentNode.removeChild(y);
		}
	});
}
window.segirl_all = function () {
	mode = (mode + 1) % 3;
	segirl_all();
};
