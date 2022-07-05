import Vue from "vue";
import md5 from "md5";

export const isFirefox = /firefox/i.test(navigator.userAgent);

/**
 * @param {string} tag
 * @return {HTMLElement}
 */
export function $(tag) {
	if (tag[0] == "<") {
		if (!$._div) $._div = document.createElement("div");
		$._div.innerHTML = tag;
		var div = $._div.children[0];
		return div;
	}
	return document.querySelector(tag);
}

/**
 * @param {HTMLElement} el
 * @param {string} cls
 */
export function animate(el, cls) {
	return new Promise(function(resolve) {
		el.classList.add(cls);
		el.classList.add(cls + "-active");
		Vue.nextTick(function() {
			var styl = window.getComputedStyle(el);
			var delays = (styl.transitionDelay || styl.webkitTransitionDelay || "").split(", ");
			var durations = (styl.transitionDuration || styl.webkittransitionDuration || "").split(", ");
			var ms =
				delays.concat(durations).reduce(function(a, b) {
					return a + parseFloat(b) || 0;
				}, 0) * 1000;
			el.classList.replace(cls, cls + "-to");
			setTimeout(function() {
				el.classList.remove(cls + "-to");
				el.classList.remove(cls + "-active");
				resolve();
			}, ms);
		});
	});
}

/**
 * @template T
 * @param {T} v
 * @param {(val:T,old:T)=>any} [fn]
 * @returns {T}
 */
export function watch(v, fn) {
	return new Vue({data: {v: v}, watch: fn && {v: {deep: true, handler: fn}}}).v;
}
/**
 * @param {string} str
 */
export function encodeURI(str) {
	return (str + "")
		.replace(/%/g, "%25")
		.replace(/=/g, "%3D")
		.replace(/\?/g, "%3F")
		.replace(/&/g, "%26");
}
/**
 * @return {string}
 */
export function encodeQuery(data) {
	var ss = [];
	for (var k in data) {
		var v = data[k];
		if (v == null) continue;
		if (typeof v === "object") v = JSON.stringify(v);
		ss.push(encodeURI(k) + "=" + encodeURI(v));
	}
	return ss.join("&");
}
/**
 * @param {string} str
 */
export function decodeQuery(str) {
	var data = {};
	var ss = str.split("&");
	for (var i = 0; i < ss.length; i++) {
		var s = ss[i].split("=");
		if (s.length != 2) continue;
		var k = decodeURIComponent(s[0]);
		var v = decodeURIComponent(s[1]);
		if (/^\[{/.test(v))
			try {
				v = JSON.parse(v);
			} catch (e) {}
		data[k] = v;
	}
	return data;
}
/**
 * 可以操作localStorage/sessionStorage
 * 自带缓存: 多次读取只会JSON.parse一次
 *         多次同步写入只会JSON.stringify一次
 * @example
 * /// 创建
 * var user = utils.store.session('user', {id: 2, name: 'abc'})
 * /// 读取
 * user.name
 * /// 相当于
 * JSON.parse(sessionStorage.user).name
 * /// 写入
 * user.id = 1
 * user.name = '123'
 * /// 相当于
 * var user = JSON.parse(sessionStorage.user)
 * user.id = 1
 * user.name = '123'
 * sessionStorage.user = JSON.stringify(user)
 */
export const storage = (function() {
	var map = {};

	/**
	 * 创建存储
	 * @template T
	 * @param {string} key
	 * @param {T} [def={}]
	 * @param {Storage} [storage]
	 * @returns {T}
	 */
	function create(key, def, storage) {
		if (map[key]) return map[key];
		def = def || {};
		if (!storage) return (map[key] = def);
		try {
			def = Object.assign(def, JSON.parse(storage.getItem(key)));
		} catch (e) {}
		return (map[key] = watch(def, function(val) {
			storage.setItem(key, JSON.stringify(val));
		}));
	}

	/**
	 * 创建/获取存储
	 * @template T
	 * @param {string} key
	 * @param {T} [def={}]
	 * @returns {T}
	 */
	function local(key, def) {
		return create(key, def, localStorage);
	}

	/**
	 * 创建/获取会话存储
	 * @template T
	 * @param {string} key
	 * @param {T} [def={}]
	 * @returns {T}
	 */
	function session(key, def) {
		return create(key, def, sessionStorage);
	}
	return {
		local: local,
		session: session,
	};
})();
/**
 * 单向绑定query参数
 * @template T
 * @param {T} params
 * @param {boolean} [auto] 是否自动更新query
 * @returns {T}
 */
export function query(params, auto) {
	var router = window.require("../routes.js").router;
	var data = {};
	var timeout;
	var query = Object.assign({}, router.currentRoute.query);
	router.afterEach(function(to) {
		query = Object.assign({}, to.query);
	});
	for (var k in params) {
		var value = params[k];
		Object.defineProperty(data, k, {
			configurable: true,
			enumerable: true,
			get: function() {
				if (query[k] == null) return value;
				var tmp = query[k];
				try {
					tmp = decodeURIComponent(tmp);
					tmp = JSON.parse(tmp);
				} catch (err) {}
				return tmp;
			},
			set: function(v) {
				var tmp = encodeURIComponent(typeof v === "string" ? v : JSON.stringify(v));
				if ((query[k] == null ? value : query[k]) != tmp) {
					if (tmp == value) delete query[k];
					else query[k] = tmp;
					if (auto) {
						if (timeout) clearTimeout(timeout);
						timeout = setTimeout(function() {
							router.replace({query: query});
						});
					}
				}
			},
		});
	}
	return data;
}
/**
 * 格式化时间显示
 * @param {number} t
 * @param {string} format
 */
export function format(t, format) {
	if (typeof t === "number" && t < 1e10) {
		t *= 1e3;
	}
	t = new Date(t);
	var Y = (t.getFullYear() + 1e4).toString().slice(1);
	return format
		.replace(/YYYY/g, Y)
		.replace(/YY/g, Y.slice(2))
		.replace(/MM/g, (t.getMonth() + 101).toString().slice(1))
		.replace(/DD/g, (t.getDate() + 100).toString().slice(1))
		.replace(/hh/g, (t.getHours() + 100).toString().slice(1))
		.replace(/mm/g, (t.getMinutes() + 100).toString().slice(1))
		.replace(/ss/g, (t.getSeconds() + 100).toString().slice(1));
}

function dataURLtoBlob(dataurl) {
	var arr = dataurl.split(","),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) u8arr[n] = bstr.charCodeAt(n);
	return new Blob([u8arr], {type: mime});
}

/**
 * 保存文件
 * @param {string|Blob} txt
 * @param {string} [name]
 */
export function download(txt, name) {
	if (/^(blob|https?):/.test(txt)) {
		var a = document.createElement("a");
		a.href = txt;
		a.download = name || "未命名.txt";
		a.click();
		return;
	}
	if (txt == "[object Blob]") return download(URL.createObjectURL(txt), name);
	if (/^data:/.test(txt)) return download(dataURLtoBlob(txt), name);
	return download(new Blob([txt]), name);
}
/**
 * 复制字符串并返回是否复制成功
 * @param {string} str
 */
export function copy(str) {
	str = typeof str === "string" ? str : JSON.stringify(str);
	var success = false;
	try {
		var input = document.createElement("textarea");
		input.style.position = "fixed";
		input.style.top = "-100px";
		input.value = str;
		document.body.appendChild(input);
		input.select();
		input.setSelectionRange(0, str.length);
		success = document.execCommand("copy");
		document.body.removeChild(input);
	} catch (error) {}
	return success;
}

/**
 * 选中节点
 * @param {HTMLElement} el
 */
export function selectNode(el) {
	let selection = window.getSelection();
	selection.empty();
	let range = document.createRange();
	range.selectNode(el);
	selection.addRange(range);
}

/**
 * 获取文件
 * @param {string} [accept] 'image/png'
 * @param {boolean} [multiple]
 * @returns {Promise<File|FileList>}
 */
export function pick(accept, multiple) {
	return new Promise(function(resolve, reject) {
		var input = document.createElement("input");
		input.type = "file";
		input.multiple = multiple;
		input.accept = accept == "image" ? "image/png|image/jpeg|image/gif" : accept;
		input.onchange = function(e) {
			resolve(multiple ? e.target.files : e.target.files[0]);
		};
		input.click();
	});
}
/**
 * 读取文件
 * @param {File} file
 * @param {"ArrayBuffer"|"Binary​String"|"DataURL"|"base64"|"utf8"} [encoding]
 */
export function readFile(file, encoding) {
	return new Promise(function(resolve, reject) {
		var reader = new FileReader();
		if (encoding && reader["readAs" + encoding]) reader["readAs" + encoding](file);
		else reader.readAsText(file, encoding);
		reader.onload = function(e) {
			resolve(e.target.result);
		};
		reader.onerror = reject;
	});
}

export function pickImage() {
	return pick("image").then(function(file) {
		return readFile(file, "DataURL");
	});
}

export const http = (function() {
	/**
	 * 清理value中的null和undefined
	 * @param {any} value
	 */
	function clear(value) {
		if (typeof value === "object" && !(value instanceof Array)) {
			var data = {};
			for (var k in value) {
				if (value[k] != null) {
					data[k] = clear(value[k]);
				}
			}
			return data;
		}
		return value;
	}
	/**
	 * @param {FetchOpt} config
	 * @returns {Promise<FetchRes>}
	 */
	function ajax(config) {
		var xhr = new XMLHttpRequest();
		var i18 = config.i18 || {timeout: "请求超时", error: "无法连接网络", abort: "请求中止"};
		if (config.async === undefined) config.async = true;
		xhr.open(config.method, config.url, config.async, config.username, config.password);
		if (config.withCredentials) xhr.withCredentials = true;
		if (config.async) xhr.timeout = config.timeout;
		if (config.responseType) xhr.responseType = config.responseType;
		if (config.headers)
			for (var k in config.headers) {
				var v = config.headers[k];
				if (v instanceof Array) for (var i = 0; i < v.length; i++) xhr.setRequestHeader(k, v[i]);
				else xhr.setRequestHeader(k, v);
			}
		if (config.onUploadProgress) xhr.upload.onprogress = config.onUploadProgress;
		if (config.onDownloadProgress) xhr.onprogress = config.onDownloadProgress;
		var res;
		var pms = new Promise(function(resolve, reject) {
			xhr.ontimeout = xhr.onerror = xhr.onabort = function(e) {
				reject({no: 500, config: config, msg: i18[e.type], type: e.type});
			};
			xhr.onload = function() {
				var headers = {};
				xhr
					.getAllResponseHeaders()
					.split("\n")
					.forEach(function(s) {
						var i = s.indexOf(":");
						if (i < 0) return;
						var k = s.slice(0, i);
						var v = s.slice(i + 1).trim();
						if (headers[k] instanceof Array) headers[k].push(v);
						else if (headers[k]) headers[k] = [headers[k], v];
						else headers[k] = v;
					});
				res = {
					status: xhr.status,
					statusText: xhr.statusText,
					headers: headers,
					data: xhr.response,
				};
				resolve(res);
			};
		});
		xhr.send(config.body);
		if (config.cancelToken) config.cancelToken(xhr);
		return pms;
	}

	function Axios() {
		this.middles = [ajax];
	}
	Axios.prototype.request = function(config) {
		return this.middles[this.middles.length - 1](config);
	};

	/**
	 * @param {string} url
	 * @param {any} [data]
	 * @param {FetchOpt} [config]
	 */
	Axios.prototype.get = function(url, data, config) {
		if (data) {
			data = clear(data);
			url += (url.indexOf("?") < 0 ? "?" : "&") + encodeQuery(data);
		}
		config = config || {};
		config.url = url;
		config.method = "get";
		return this.request(config);
	};

	/**
	 * @param {string} url
	 * @param {any} [data]
	 * @param {FetchOpt} [config]
	 */
	Axios.prototype.post = function(url, data, config) {
		config = config || {};
		if (typeof data === "object" && !(data instanceof FormData)) {
			data = clear(data);
			data = encodeQuery(data);
			if (!config.headers) config.headers = {};
			config.headers["content-type"] = "application/x-www-form-urlencoded;charset=utf-8";
		}
		config.url = url;
		config.method = "post";
		config.body = data;
		return this.request(config);
	};

	/**
	 * @param {FetchMiddle} fn
	 */
	Axios.prototype.use = function(fn) {
		var prev = this.middles[this.middles.length - 1];
		this.middles.push(function(config) {
			return fn(config, prev);
		});
		return this;
	};

	Axios.prototype.create = function() {
		return new Axios();
	};

	return new Axios();
})();
/**
 * /foo/bar -> /foo
 * @param {string} url
 */
export function dirname(url) {
	for (var i = url.length - 1; i >= 0; i--) {
		if (url[i] == "/") return url.slice(0, i);
	}
	return "";
}

const bs = ["b", "Kb", "Mb", "Gb"];
export function traffic(v, i, n) {
	v = parseInt(v);
	n = n || 0;
	for (i = i || 0; i < 4; i++) {
		if (v < 1024) {
			return v + bs[i];
		}
		v = (v / 1024).toFixed(n);
	}
	return v + "GB";
}
Vue.filter("traffic", traffic);

/**
 * @param {ModuleFactory<EmscriptenWasm.Module>} moduleFactory
 * @param {string} wasmUrl
 * @returns {Promise}
 */
export function initWasmModule(moduleFactory, wasmUrl) {
	return new Promise((resolve) => {
		const module = moduleFactory({
			noInitialRun: true,
			locateFile(url) {
				if (url.endsWith(".wasm")) return wasmUrl;
				return url;
			},
			onRuntimeInitialized() {
				delete module.then;
				resolve(module);
			},
		});
	});
}

/**
 *
 * @param {HTMLImageElement} image
 */
export function toCanvas(image) {
	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0);
	return canvas;
}

/**
 * 从URL中加载图片
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(url) {
	return new Promise(function(resolve, reject) {
		var img = document.createElement("img");
		img.src = url;
		img.onload = resolve.bind(this, img);
		img.onerror = reject;
	});
}

export class Fileish extends Blob {
	constructor(data, name, opts) {
		super(data, opts);
		this.name = name;
	}
}

/**
 * @param {HTMLImageElement} img
 */
export function readImageData(img) {
	var canvas = document.createElement("canvas");
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * @param {string} filename
 */
export function extname(filename) {
	var type = filename.split(".");
	return type[type.length - 1];
}

/**
 *
 * @param {string|VueComponent} comp
 * @param {any} props
 * @param {{
 * title: string;
 * props: {}
 * }} [options]
 */
export function open(comp, props, options) {
	let value;
	options = options || {};
	if (typeof props != "object") props = {value: props};
	return new Promise(function(resolve, reject) {
		var cb = resolve;
		var vue = new Vue({
			el: document.createElement("div"),
			data: {
				show: true,
			},
			render(h) {
				let children = [
					h(comp, {
						on: {
							input(v) {
								value = v;
							},
							close() {
								vue.show = false;
							},
							cancel(v) {
								cb = reject;
								value = v;
								vue.show = false;
							},
							submit(v) {
								cb = resolve;
								value = v;
								vue.show = false;
							},
						},
						props: props,
					}),
				];
				if (options.showClose != false)
					children.push(
						h("span", {attrs: {slot: "footer"}, slot: "footer"}, [
							h(
								"el-button",
								{
									props: {size: "mini"},
									on: {
										click() {
											(cb = reject), (vue.show = false);
										},
									},
								},
								options.cancelText || "取消"
							),
							h(
								"el-button",
								{
									props: {size: "mini", type: "primary"},
									on: {
										click() {
											(cb = resolve), (vue.show = false);
										},
									},
								},
								options.submitText || "确定"
							),
						])
					);
				return h(
					"el-dialog",
					{
						props: Object.assign({}, options, {visible: this.show}),
						on: {
							close() {
								vue.show = false;
							},
							closed() {
								cb(value);
								vue.$destroy();
								document.body.removeChild(vue.$el);
							},
						},
					},
					children
				);
			},
		});
		document.body.appendChild(vue.$el);
	});
}

/**
 * 调整src高宽，类似css中的background-size: contain
 * @param {Size} src
 * @param {Size} dst
 */
export function contain(src, dst) {
	try {
		var r = src.width / src.height;
		var w = r * dst.height;
		if (dst.width >= w) {
			src.width = w;
			src.height = dst.height;
		} else {
			src.width = dst.width;
			src.height = dst.width / r;
		}
	} catch (e) {}
}

/**
 * 调整src高宽，类似css中的background-size: cover
 * @param {Size} src
 * @param {Size} dst
 */
export function cover(src, dst) {
	var r = src.width / src.height;
	var w = r * dst.height;
	if (dst.width > w) {
		src.width = dst.width;
		src.height = dst.width / r;
	} else {
		src.width = w;
		src.height = dst.height;
	}
}

Vue.prototype.$loading = function(name, fn) {
	if (arguments.length < 2) (fn = name), (name = "loading");
	if (this[name]) return;
	this[name] = true;
	var that = this;
	return Promise.resolve(fn.call(this)).then(
		function(data) {
			that[name] = false;
			return data;
		},
		function(err) {
			that[name] = false;
			return Promise.reject(err);
		}
	);
};

export function sleep(ms) {
	return new Promise(function(resolve) {
		setTimeout(resolve, ms);
	});
}

/**
 * 计算元素位置
 * @param {HTMLElement} el
 */
export function offset(el) {
	var box = el.getBoundingClientRect();
	return {
		top: box.top + window.pageYOffset - document.documentElement.clientTop,
		left: box.left + window.pageXOffset - document.documentElement.clientLeft,
		right: box.right,
		bottom: box.bottom,
	};
}
/**
 *
 * @param {HTMLElement} e
 * @param {HTMLElement} p
 */
export function isParent(e, p) {
	if (!e) return false;
	if (e == p) return e;
	return isParent(e.parentElement, p);
}

/**
 *
 * @param {HTMLElement} el
 * @param {MouseHandler} handler
 * @return {MouseHandler}
 */
export function onmouse(el, handler) {
	var h = {};
	var command = false;
	for (var k in handler) {
		let v = handler[k];
		h[k] = function(e) {
			var evt = {};
			if (e.clientX != null) {
				var box = offset(el);
				// 转换为相对于el的坐标
				evt.x = e.clientX - box.left + window.scrollX;
				evt.y = e.clientY - box.top + window.scrollY;
				evt.buttons = e.buttons;
				evt.t = isParent(e.target, el);
				evt.wheelDelta = e.wheelDelta || -e.detail * 24;
			} else {
				evt.keyCode = e.keyCode;
			}
			evt.ctrlKey = e.ctrlKey || command;
			evt.shiftKey = e.shiftKey;
			evt.altKey = e.altKey;
			evt.preventDefault = e.preventDefault.bind(e);
			v.call(handler, evt);
		};
	}
	if (handler.start) {
		el.addEventListener("mousedown", h.start);
		el.addEventListener("touchstart", h.start);
	}
	if (handler.move) {
		document.addEventListener("mousemove", h.move);
		document.addEventListener("touchmove", h.move);
	}
	if (handler.end) {
		document.addEventListener("mouseup", h.end);
		document.addEventListener("touchend", h.end);
	}
	if (handler.leave) {
		el.addEventListener("mouseleave", h.leave);
	}
	if (handler.enter) {
		el.addEventListener("mouseenter", h.enter);
	}
	if (handler.wheel) {
		el.addEventListener("mousewheel", h.wheel);
		el.addEventListener("DOMMouseScroll", h.wheel);
	}
	if (handler.keydown) {
		el.addEventListener("keydown", function(e) {
			if (e.keyCode == 91) command = true;
			h.keydown(e);
		});
	}
	if (handler.keyup) {
		el.addEventListener("keyup", function(e) {
			if (e.keyCode == 91) command = false;
			h.keyup(e);
		});
	}
	return h;
}

export function crop(img, x1, y1, x2, y2, bgColor) {
	var canvas = document.createElement("canvas");
	canvas.width = x2 - x1;
	canvas.height = y2 - y1;
	var ctx = canvas.getContext("2d");
	if (bgColor) {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	ctx.drawImage(img, -x1, -y1);
	return canvas;
}

export function loadFont(name, timeout) {
	timeout = timeout || 30e3;
	return new Promise(function(resolve, reject) {
		var span = document.createElement("span");
		span.innerText = "你好giItT1WQy@!-/#";
		span.style.fontSize = "300px";
		span.style.fontFamily = "sans-serif";
		span.style.position = "fixed";
		span.style.top = "-10000px";
		document.body.appendChild(span);
		var w = span.clientWidth;
		span.style.fontFamily = name;
		var b = +new Date();
		var h = setInterval(() => {
			if (+new Date() - b > timeout) {
				reject();
				document.body.removeChild(span);
				clearTimeout(h);
			} else {
				if (w != span.clientWidth) {
					resolve();
					document.body.removeChild(span);
					clearTimeout(h);
				}
			}
		}, 100);
	});
}

export function resize(img, max, fit, bgColor) {
	var canvas = document.createElement("canvas");
	canvas.width = max.width;
	canvas.height = max.height;
	var width = img.naturalWidth || img.width;
	var height = img.naturalHeight || img.height;
	var size = {width, height};
	contain(size, max);
	if (fit) {
		canvas.width = size.width;
		canvas.height = size.height;
	}
	var x = (canvas.width - size.width) / 2;
	var y = (canvas.height - size.height) / 2;
	var ctx = canvas.getContext("2d");
	if (bgColor) {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	ctx.drawImage(img, x, y, size.width, size.height);
	return canvas;
}

export function flipX(img) {
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = img.naturalWidth || img.width;
	canvas.height = img.naturalHeight || img.height;
	ctx.transform(-1, 0, 0, 1, canvas.width, 0);
	ctx.drawImage(img, 0, 0);
	return canvas;
}

export function flipY(img) {
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = img.naturalWidth || img.width;
	canvas.height = img.naturalHeight || img.height;
	ctx.transform(1, 0, 0, -1, 0, canvas.height);
	ctx.drawImage(img, 0, 0);
	return canvas;
}

/**
 * @param {HTMLImageElement} img
 * @param {number} deg
 */
export function rotate(img, deg) {
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	var w = img.naturalWidth || img.width;
	var h = img.naturalHeight || img.height;
	var n = Math.sqrt(w * w + h * h);
	canvas.width = canvas.height = n;
	var x = (n - w) / 2;
	var y = (n - h) / 2;
	ctx.translate(n / 2, n / 2);
	ctx.rotate((deg / 180) * Math.PI);
	ctx.drawImage(img, x - n / 2, y - n / 2);
	var scale = img.width / img.naturalWidth;
	var rect = img.getBoundingClientRect();
	var rw = rect.width / scale;
	var rh = rect.height / scale;
	return crop(canvas, (n - rw) / 2, (n - rh) / 2, (n + rw) / 2, (n + rh) / 2);
}

export function addText(img, o) {
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	var w = (canvas.width = img.naturalWidth || img.width);
	var h = (canvas.height = img.naturalHeight || img.height);
	ctx.drawImage(img, 0, 0);
	ctx.font = ((16 / 240) * 400).toFixed(2) + "px Arial";
	ctx.strokeStyle = ctx.fillStyle = o.color || "#fff";
	var m = ctx.measureText(o.text);
	var x = (w - m.width) / 2;
	ctx.fillText(o.text, x, h - 12);
	return canvas;
}

export function limit(s, n) {
	return s ? (s.length <= n ? s : s.slice(0, n - 2) + "..") : "";
}

export class Color {
	/**
	 * @param {string} s
	 */
	constructor(s) {
		var color = [];
		if (s.startsWith("#")) {
			s = s.slice(1);
			if (s.length == 3) s += s;
			var v = parseInt(s, 16);
			while (v > 0) {
				color.unshift(v & 0xff);
				v >>= 8;
			}
			if (color[3]) color[3] /= 255;
		} else {
			s.replace(/\d+/g, function(v) {
				color.push(parseFloat(v));
			});
		}
		this.color = color;
	}
	brightness() {
		let [R, G, B] = this.color;
		return (R * 299 + G * 587 + B * 114) / 255000;
	}
	/**
	 * @param {Color|string} b
	 */
	hover(b) {
		if (typeof b === "string") b = new Color(b);
		if (this.color[0] > 127) this.color[0] -= b.color[0];
		else this.color[0] += b.color[0];
		if (this.color[1] > 127) this.color[1] -= b.color[1];
		else this.color[1] += b.color[1];
		if (this.color[2] > 127) this.color[2] -= b.color[2];
		else this.color[2] += b.color[2];
		return this;
	}
	/**
	 * @param {Color|string} b
	 */
	add(b) {
		if (typeof b === "string") b = new Color(b);
		this.color[0] += b.color[0];
		this.color[1] += b.color[1];
		this.color[2] += b.color[2];
		return this;
	}
	/**
	 * @param {Color|string} b
	 */
	sub(b) {
		if (typeof b === "string") b = new Color(b);
		this.color[0] -= b.color[0];
		this.color[1] -= b.color[1];
		this.color[2] -= b.color[2];
		return this;
	}
	toString() {
		if (this.color.length == 3) return `rgb(${this.color})`;
		return `rgba(${this.color})`;
	}
}

Vue.directive("move", {
	bind: function(el, binding, vnode) {
		if (typeof binding.value === "function") {
			var bx, by;
			el.ontouchstart = el.onmousedown = function(e) {
				e.el = el;
				bx = e.clientX;
				by = e.clientY;
				binding.value("start", e);
			};
			el._move = function(e) {
				if (bx == null || e.buttons != 1) return;
				e.el = el;
				e.dx = e.clientX - bx;
				e.dy = e.clientY - by;
				binding.value("move", e);
			};
			document.addEventListener("touchmove", el._move);
			document.addEventListener("mousemove", el._move);
			el._end = function(e) {
				if (bx == null) return;
				e.el = el;
				e.dx = e.clientX - bx;
				e.dy = e.clientY - by;
				e.target.dxy = Math.sqrt(e.dx * e.dx + e.dy * e.dy);
				binding.value("end", e);
				bx = null;
			};
			document.addEventListener("touchend", el._end);
			document.addEventListener("mouseup", el._end);
		}
	},
	unbind(el) {
		el.ontouchstart = el.onmousedown = null;
		document.removeEventListener("touchmove", el._move);
		document.removeEventListener("mousemove", el._move);
		document.removeEventListener("touchend", el._end);
		document.removeEventListener("mouseup", el._end);
	},
});

export function measure(el) {
	var styl = window.getComputedStyle(el);
	var paddingLeft = parseFloat(styl.paddingLeft) || 0;
	var paddingRight = parseFloat(styl.paddingRight) || 0;
	var paddingTop = parseFloat(styl.paddingTop) || 0;
	var paddingBottom = parseFloat(styl.paddingBottom) || 0;
	var borderLeft = parseFloat(styl.borderLeft) || 0;
	var borderRight = parseFloat(styl.borderRight) || 0;
	var borderTop = parseFloat(styl.borderTop) || 0;
	var borderBottom = parseFloat(styl.borderBottom) || 0;
	var width = el.clientWidth - paddingLeft - paddingRight;
	var height = el.clientHeight - paddingTop - paddingBottom;
	return {
		paddingLeft,
		paddingRight,
		paddingTop,
		paddingBottom,
		borderLeft,
		borderRight,
		borderTop,
		borderBottom,
		width,
		height,
	};
}

/**** 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1 ****/
const CHARS = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
const NUMBERS = "0123456789";

/**
 * @param {number} len
 */
export function randomString(len) {
	var code = "";
	for (var i = 0; i < len; i++) {
		code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
	}
	return code;
}

/**
 * @param {number} len
 */
export function randomNumber(len) {
	var code = "";
	for (var i = 0; i < len; i++) {
		code += NUMBERS.charAt(Math.floor(Math.random() * NUMBERS.length));
	}
	return code;
}

export const ua = {
	appid: "wxaafbc399a80e1c49",
	iswx: navigator.userAgent.toLowerCase().indexOf("micromessenger") >= 0,
	baseURL:
		location.protocol +
		"//" +
		location.host +
		(location.port ? ":" + location.port : location.port),
};

export function loadjs(url) {
	return new Promise(function(resolve, reject) {
		var script = document.createElement("script");
		script.onload = resolve;
		script.onerror = reject;
		script.src = url;
		document.head.appendChild(script);
	});
}

export function previewImage(urls) {
	if (wx)
		return wx.previewImage({
			current: urls[0].src || urls[0],
			urls: urls.map((x) => x.src || x),
		});
	return open(
		"i-image-preview",
		urls.map((x) => (typeof x === "string" ? {src: x} : x))
	);
}

/**
 * 微信内登录
 * @param {string} appid
 * @param {string} [url]
 */
export function wxLogin(appid, url) {
	url = url || location.href;
	location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(
		ua.baseURL + "/login"
	)}&response_type=code&scope=snsapi_base&state=${encodeURIComponent(url)}#wechat_redirect`;
}

export function stopClose(msg) {
	window.onbeforeunload = msg
		? function(e) {
				var e = window.event || e;
				e.returnValue = msg;
		  }
		: null;
}

export function remove(arr, obj) {
	var idx = arr.indexOf(obj);
	if (idx >= 0) arr.splice(idx, 1);
	return arr;
}

export class DataSource {
	constructor(query, isList) {
		this.query = query;
		this.list = [];
		this.total = 0;
		this.page = 0;
		this.hasMore = true;
		this.pageSize = 10;
		this.sort = null;
		this.desc = 0;
		this.isList = isList;
	}
	async search(page) {
		if (page == null) page = this.page;
		let {total, list} = await this.query({page, sortBy: this.sort, desc: this.desc});
		this.total = total;
		if (page == 0 || !this.isList) {
			this.list = list;
		} else {
			this.list = this.list.concat(list);
		}
		if (typeof total === "number") this.hasMore = (page + 1) * this.pageSize < this.total;
		else this.hasMore = this.list.length;
	}
	onsort(e) {
		this.sort = e.prop;
		this.desc = e.order == "ascending" ? 0 : 1;
		return this.search();
	}
}

function _escape(text) {
	const ele = document.createElement("div");
	ele.appendChild(document.createTextNode(text));
	return ele.innerHTML;
}

/**
 * @summary 搜狗 API 调用 UUID 计算
 */
export const _sougouUuid = (_) => {
	let t;
	let e;
	let n = "";
	for (t = 0; t < 32; t++) {
		(e = (16 * Math.random()) | 0),
			(t !== 8 && t !== 12 && t !== 16 && t !== 20) || (n += "-"),
			(n += (t === 12 ? 4 : t === 16 ? (3 & e) | 8 : e).toString(16));
	}

	return n;
};
let sougo = http.create();
sougo.use(function(config, next) {
	config.headers = Object.assign(
		{
			"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest",
			_referer: "https://fanyi.sogou.com",
		},
		config.headers
	);
	return next(config).then((ret) => {
		try {
			return typeof ret.data === "string" ? JSON.parse(ret.data) : ret.data;
		} catch (error) {
			return ret.data;
		}
	});
});
// 获取 seccode
async function getSeccode() {
	const data = await sougo.get("https://fanyi.sogou.com/text");
	let m = /secretCode":\s*(\d+)/.exec(data);
	if (m) window.seccode = m[1];
}

window.seccode = "109984457";

export const _hasEnglish = (content) => {
	return /[a-zA-Z]+/g.test(content);
};

export const _stripChinese = (content) => {
	return content.replace(/[\u4e00-\u9fa5]/gm, "").trim();
};

export const _isAllChinese = (content) => {
	return /^[\u4e00-\u9fa5？，。·！￥……（）+｛｝【】、|《》；：“”‘’『』「」﹃﹄〔〕—～﹏]+$/gm.test(
		content.trim()
	);
};

export const _isAllNumber = (content) => {
	return /^[\d]+$/gm.test(content.trim());
};

export const _isAllPunctuation = (content) => {
	/* eslint-disable no-useless-escape */
	const reg = /^([\[\]\,.?"\(\)+_*\/\\&\$#^@!%~`<>:;\{\}？，。·！￥……（）+｛｝【】、|《》]|(?!\s)'\s+|\s+'(?!\s))+$/gi;
	return reg.test(content.trim());
};

export function dfs(data, fn, key, parent) {
	if (data == null) return;
	if (Array.isArray(data)) {
		for (let i = 0; i < data.length; i++) {
			let item = data[i];
			dfs(item, fn, key, parent);
		}
		return;
	}
	if (fn(data, parent)) return;
	if (key) dfs(data[key], fn, key, data);
	else
		for (let k in data) {
			let v = data[k];
			dfs(v, fn, null, data);
		}
}

export async function translate(q, to = "auto") {
	return sougoTranslate(q);
	let url = "https://fanyi-api.baidu.com/api/trans/vip/translate?";
	let appid = "20200922000571245";
	let secret = "QKGyC8dIwX4bYv1L2WhC";
	let salt = Math.floor(Math.random() * 1e8);
	let sign = md5(appid + q + salt + secret);
	let par = {
		q, //请求翻译 query	UTF-8 编码
		from: "auto", //翻译源语言	可设置为 auto
		to, //翻译目标语言	不可设置为 auto
		appid, //APP ID	可在 管理控制台 查看
		salt, //随机数
		sign, //签名	appid+q+salt+密钥 的MD5值
	};
	let data = await sougo.get(url + new URLSearchParams(par));
	if (data.error_code == 54003) {
		await sleep(500);
		return translate(q, to);
	}
	if (!data.trans_result) {
		throw data;
	}
	return data.trans_result.map((x) => x.dst).join("");
}

export async function sougoTranslate(text, isRetry) {
	if (!text) return;
	const from = "auto";
	const to = "zh-CHS";
	const textAfterEscape = _escape(text);
	const s = md5("" + from + to + textAfterEscape + window.seccode);
	const payload = {
		from,
		to,
		client: "pc",
		fr: "browser_pc",
		text: textAfterEscape,
		useDetect: "on",
		useDetectResult: "on",
		needQc: 1,
		uuid: _sougouUuid(),
		oxford: "on",
		pid: "sogou-dict-vr",
		isReturnSugg: "on",
		s,
	};
	const form = Object.entries(payload)
		.map(([k, v]) => k + "=" + encodeURIComponent(v))
		.join("&");
	console.log("translate: ", text);
	/** @type {df.SougoResponse} */
	let ret = await sougo.post("https://fanyi.sogou.com/reventondc/translate", form);
	let res = ret.data || ret;
	if (!res || res.translate.errorCode === "10") {
		const lastSecode = window.seccode;
		await getSeccode();
		if (window.seccode === lastSecode) return;
		return sougoTranslate(text);
	}
	if (res.translate.errorCode === "20" && !isRetry) {
		var tid = 0;
		chrome.tabs.create({url: "https://fanyi.sogou.com/", active: false}, (tab) => (tid = tab.id));
		await sleep(2e3);
		chrome.tabs.remove(tid);
		return sougoTranslate(text, true);
	}
	let data = {
		result: res.translate.dit,
	};
	if (res.dictionary) {
		let content = res.dictionary.content[0];
		if (content) {
			if (res.detect.detect == "en" && content.content) {
				data.dict = content.content
					.filter((x) => x.item)
					.map((x) => {
						let ss = [];
						for (let item of x.item.core) {
							ss.push(item.detail.zh);
						}
						return {pos: x.item.pos, text: ss.join("；")};
					});
			} else if (content.category && content.category[0] && content.category[0].sence) {
				data.dict = content.category[0].sence.map((x) => {
					return {pos: x.cat, text: x.description};
				});
			}
			if (Array.isArray(content.phonetic)) {
				data.sounds = content.phonetic.map((x) => {
					return {type: x.type, url: x.filename, text: x.text};
				});
			}
		}
	}
	return data;
}

export function clipboardRead() {
	return new Promise(function(resolve, reject) {
		var pms = Promise.resolve({state: "granted"});
		if (!isFirefox) {
			pms = navigator.permissions.query({name: "clipboard-read"});
			pms.then((result) => {
				if (result.state == "granted" || result.state == "prompt") {
					navigator.clipboard.readText().then(
						(text) => {
							console.log("Read from clipboard successfully: " + text);
							resolve(text);
						},
						(err) => {
							console.error("Failed to read from clipboard: " + err);
							reject(err);
						}
					);
				}
			});
		} else resolve("");
	});
}

export function CamelCase(str) {
	return str.replace(/(^|[-_])(\w)/g, function(all, x1, letter) {
		return letter.toUpperCase();
	});
}
