import {encodeQuery, fixBMP, getAngle, getSvgSize, setSvgSize, svg2dataurl} from "./utils";
import SparkMD5 from "spark-md5";

const loadjs_cache = {};
export function loadjs(url, name) {
	if (loadjs_cache[url]) return loadjs_cache[url];
	if (!name) name = url.split("/").pop().split(".")[0];
	return (loadjs_cache[url] = new Promise(function (resolve, reject) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.async = true;
		script.onload = function () {
			resolve(window[name]);
		};
		script.onerror = function (err) {
			delete loadjs_cache[url];
			reject(err);
		};
		script.src = url;
		document.body.appendChild(script);
	}));
}

const loadcss_cache = {};
export function loadcss(url) {
	if (loadcss_cache[url]) return loadcss_cache[url];
	return (loadcss_cache[url] = new Promise(function (resolve, reject) {
		var link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.onload = resolve;
		link.onerror = function (err) {
			delete loadcss_cache[url];
			reject(err);
		};
		link.href = url;
		document.head.appendChild(link);
	}));
}

export function insertCss(id, css) {
	if (!css) {
		css = id;
		id = "user-insert-css";
	}
	let style = document.getElementById(id);
	if (!style) {
		style = document.createElement("style");
		style.id = id;
		document.head.appendChild(style);
	}
	style.innerHTML = css;
}

export function isWexin() {
	return ~navigator.userAgent.toLowerCase().indexOf("micromessenger");
}

export function isMobile() {
	return /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|IUC|UCWEB|UCBrowser|OPPO|VIVO|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(
		navigator.userAgent
	);
}

/**
 * @param {string} [ua]
 */
export function getOS(ua) {
	ua = ua || navigator.userAgent;
	const oss = {
		darwin: /os x/i,
		android: /Android/i,
		linux: /linux/i,
		iphone: /\(iPhone.*os (\d+)[._](\d+)/i,
		ipad: /\(iPad.*os (\d+)[._](\d+)/i,
		ios: /ios/i,
		chromeos: /cros/i,
		win32: /windows nt/i,
	};
	/** @type {keyof typeof oss} */
	let k;
	for (k in oss) {
		const v = oss[k];
		if (v.test(ua)) return k;
	}
	return "unknown";
}

/**
 * 获取OS版本
 */
export function getOSversion() {
	let sUserAgent = navigator.userAgent;
	let isWin = navigator.platform == "Win32" || navigator.platform == "Windows";
	let isMac =
		navigator.platform == "Mac68K" ||
		navigator.platform == "MacPPC" ||
		navigator.platform == "Macintosh" ||
		navigator.platform == "MacIntel";
	if (isMac) return "Mac";
	let isUnix = navigator.platform == "X11" && !isWin && !isMac;
	if (isUnix) return "Unix";
	let isLinux = String(navigator.platform).indexOf("Linux") > -1;
	if (isLinux) return "Linux";
	if (isWin) {
		let isWin2K =
			sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
		if (isWin2K) return "2000";
		let isWinXP =
			sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
		if (isWinXP) return "XP";
		let isWin2003 =
			sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
		if (isWin2003) return "2003";
		let isWinVista =
			sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
		if (isWinVista) return "Vista";
		let isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
		if (isWin7) return "7";
		let isWin10 = sUserAgent.indexOf("Windows NT 10") > -1 || sUserAgent.indexOf("Windows 10") > -1;
		if (isWin10) return "10";
	}
	return "other";
}

/**
 * @param {HTMLElement} el
 * @param {string} cls
 */
export function animate(el, cls) {
	return new Promise(function (resolve) {
		el.classList.add(cls);
		el.classList.add(cls + "-active");
		setTimeout(function () {
			var styl = window.getComputedStyle(el);
			var delays = (styl.transitionDelay || styl.webkitTransitionDelay || "").split(", ");
			// @ts-ignore
			var durations = (styl.transitionDuration || styl.webkittransitionDuration || "").split(", ");
			var ms =
				delays.concat(durations).reduce(function (a, b) {
					return a + parseFloat(b) || 0;
				}, 0) * 1000;
			el.classList.replace(cls, cls + "-to");
			setTimeout(function () {
				el.classList.remove(cls + "-to");
				el.classList.remove(cls + "-active");
				resolve();
			}, ms);
		});
	});
}

/**
 * @param {string} dataurl
 */
export function dataURLtoBlob(dataurl) {
	var arr = dataurl.split(",");
	var mime = arr[0].match(/:(.*?);/)[1];
	var bstr = atob(arr[1]);
	var n = bstr.length;
	var u8arr = new Uint8Array(n);
	while (n--) u8arr[n] = bstr.charCodeAt(n);
	return new Blob([u8arr], {type: mime});
}

export function request(method, url, data, responseType) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open(method.toUpperCase(), url, true);
		xhr.responseType = responseType;
		xhr.onload = function () {
			if (xhr.status == 200) {
				resolve(xhr.response);
			} else {
				reject(xhr);
			}
		};
		xhr.onerror = function () {
			reject(xhr);
		};
		xhr.send(data);
	});
}

export function http_get(url, responseType) {
	return request("GET", url, null, responseType);
}

export function http_post(url, data, responseType) {
	return request("POST", url, data, responseType);
}

export function isMobileDownload() {
	return isMobile() && !/HuaweiBrowser|Firefox|EdgA/i.test(navigator.userAgent);
}

/**
 * 保存文件
 * @param {string|Blob|Uint8Array} txt
 * @param {string} [name]
 * @param {boolean} [newWindow]
 */
export function download(txt, name, newWindow) {
	if (/^(data|blob|https?):/.test(txt)) {
		let pms = Promise.reject();
		if (isMobileDownload() ? !/^https?:/.test(txt) : !/^blob:/.test(txt)) {
			pms = http_get(txt, "blob").then((blob) => {
				return download(new Blob([blob], {type: "application/octet-stream"}), name, newWindow);
			});
		}
		return pms.catch(() => {
			var a = document.createElement("a");
			a.href = txt;
			if (newWindow) {
				a.target = "_blank";
				a.rel = "noopener noreferrer";
			}
			a.download = name;
			a.click();
		});
	}
	if (txt instanceof Blob) {
		let pms = Promise.reject();
		if (isMobileDownload()) {
			const s = encodeQuery({uuid: localStorage.getItem("_g_uuid"), name, size: txt.size});
			pms = http_post("api/download?" + s, txt).then(() => location.origin + `/api/download?${s}`);
		}
		return pms
			.catch(() => {
				let url = URL.createObjectURL(txt);
				setTimeout(function () {
					URL.revokeObjectURL(url);
				}, 1000);
				return url;
			})
			.then((url) => download(url, name, newWindow));
	}
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
	const selection = window.getSelection();
	selection.empty();
	const range = document.createRange();
	range.selectNode(el);
	selection.addRange(range);
}

/**
 * 获取文件
 * @template T extends boolean
 * @param {string} [accept] 'image/png'
 * @param {T} [multiple=false]
 * @returns {Promise<T extends boolean ? File[] : File>}
 */
export function pick(accept, multiple) {
	return new Promise(function (resolve, reject) {
		const input = document.createElement("input");
		accept = accept ? accept.trim() : "";
		input.type = "file";
		input.multiple = multiple;
		let count = 0;
		function hasSelectedFile() {
			if (input.value !== "") {
				resolve(multiple ? Array.from(input.files) : input.files[0]);
			} else if (++count >= 40) {
				reject("pick cancel");
			} else {
				setTimeout(hasSelectedFile, 50);
			}
		}

		function focus() {
			window.removeEventListener("focus", focus);
			hasSelectedFile();
		}

		window.addEventListener("focus", focus);
		input.onchange = focus;
		if (accept[0] == "." && navigator.userAgent.indexOf("Quark") >= 0) {
			// 夸克浏览器特殊处理
			if (accept.indexOf(",") < 0) {
				// 把 .jpe 转换为 image/jpeg
				import("mime")
					.then((x) => {
						input.accept = x.getType(accept);
					})
					.finally(() => input.click());
			} else {
				// 如果设置了多种格式,则不限制格式
				input.click();
			}
		} else {
			input.accept =
				accept == "image"
					? "image/png,image/jpeg,image/gif,image/webp,image/apng,image/svg+xml,image/bmp,image/x-icon"
					: accept;
			input.click();
		}
	});
}

/**
 * 获取文件夹
 * @returns {Promise<FileList>}
 */
export function pickDir() {
	return new Promise(function (resolve, reject) {
		var input = document.createElement("input");
		input.type = "file";
		input.webkitdirectory = true;
		input.onchange = function (e) {
			resolve(e.target.files);
		};
		input.click();
		input.onabort = reject;
		input.oncancel = reject;
	});
}

/**
 * 从drop事件中获取文件
 * @param {DragEvent} e
 * @returns {Promise<File[]>}
 */
export function dropFiles(e) {
	let items = Array.from(e.dataTransfer.items).filter((x) => x.kind == "file");
	if (!items.find((x) => x.webkitGetAsEntry().isDirectory))
		return Promise.resolve(Array.from(e.dataTransfer.files));
	let all = items.map((item) => getFileFromEntryRecursively(item.webkitGetAsEntry()));
	return Promise.all(all).then((x) => x.flat());
	/**
	 * @param {FileSystemEntry} entry
	 * @returns {Promise<File[]>}
	 */
	function getFileFromEntryRecursively(entry) {
		if (entry.isFile) {
			return new Promise((resolve, reject) =>
				entry.file(function (file) {
					let webkitRelativePath = entry.fullPath.replace(/^\//, "");
					Object.defineProperty(file, "webkitRelativePath", {
						get() {
							return webkitRelativePath;
						},
					});
					resolve([file]);
				}, reject)
			);
		}
		let reader = entry.createReader();
		return new Promise((resolve, reject) => {
			reader.readEntries((entries) => {
				let all = entries.map((x) => getFileFromEntryRecursively(x));
				resolve(Promise.all(all).then((x) => x.flat()));
			}, reject);
		});
	}
}

/**
 * 读取文件
 * @param {Blob} file
 * @param {"BinaryString"|"DataURL"|"base64"|"utf8"} [encoding]
 * @returns {Promise<string>}
 */
export function readFile(file, encoding) {
	return new Promise(function (resolve, reject) {
		var reader = new FileReader();
		var b64 = encoding == "base64";
		if (b64) encoding = "DataURL";
		if (encoding && reader["readAs" + encoding]) reader["readAs" + encoding](file);
		else reader.readAsText(file, encoding);
		reader.onload = function (e) {
			if (b64) {
				var idx = e.target.result.indexOf(",");
				resolve(e.target.result.substr(idx + 1));
			} else resolve(e.target.result);
		};
		reader.onerror = reject;
	});
}

/**
 * 读取文件
 * @param {Blob} file
 * @returns {Promise<ArrayBuffer>}
 */
export function readFileAsArrayBuffer(file) {
	return new Promise(function (resolve, reject) {
		var reader = new FileReader();
		reader.readAsArrayBuffer(file);
		reader.onload = function (e) {
			resolve(e.target.result);
		};
		reader.onerror = reject;
	});
}

/**
 * 如果是错误的bmp图片，修复后返回新的file,否则返回原来的file
 * @param {File} file
 */
export async function fixBmpFile(file) {
	let buf = await readFileAsArrayBuffer(file);
	let fix = fixBMP(new Uint8Array(buf));
	if (fix) file = new File([fix], file.name, {type: file.type});
	return file;
}

/**
 * @returns {Promise<string>}
 */
export function pickImage() {
	return pick("image").then(function (file) {
		return readFile(file, "DataURL");
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
 * @param {HTMLCanvasElement} canvas
 * @param {string} [type]
 * @param {any} [quality]
 * @returns {Promise<Blob>}
 */
export function toBlob(canvas, type, quality) {
	return new Promise(function (resolve) {
		canvas.toBlob(resolve, type, quality);
	});
}

/**
 * 从URL|File中加载图片
 * @param {string|Blob} url
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(url) {
	if (url instanceof Blob) {
		let _url = URL.createObjectURL(url);
		return loadImage(_url).finally(() => URL.revokeObjectURL(_url));
	}
	return new Promise(function (resolve, reject) {
		var img = document.createElement("img");
		img.crossOrigin = "Anonymous";
		img.src = url;
		img.onload = function () {
			if (!img.naturalWidth) {
				let err = `image width is 0: "${url}"`;
				if (!url.startsWith("data:")) {
					let pms = http_get(url).then((text) => {
						if (/^\s*<svg /i.test(text)) {
							let size = getSvgSize(text);
							if (size.width && size.height) {
								text = setSvgSize(text, size);
								return loadImage(svg2dataurl(text));
							}
						}
						return Promise.reject(err);
					});
					resolve(pms);
				} else {
					reject(err);
				}
			} else {
				resolve(img);
			}
		};
		img.onerror = function (_) {
			reject(new Error("load image error: " + img.src));
		};
	});
}

/**
 * 从URL中加载图片
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImageAsDataURL(url) {
	return new Promise(function (resolve, reject) {
		var img = document.createElement("img");
		img.src = url;
		img.onload = resolve.bind(this, img);
		img.onerror = reject;
	})
		.then(toCanvas)
		.then((canvas) => canvas.toDataURL("png"));
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
 *
 * @param {HTMLElement} e
 * @param {HTMLElement} p
 */
export function isParent(e, p) {
	while (e && e.parentNode != p) e = e.parentNode;
	return e;
}

/**
 *
 * @param {CanvasImageSource} img
 * @param {Rect} rect
 * @param {string} [bgColor]
 * @param {CanvasImageSource} [clipImage]
 */
export function crop(img, rect, bgColor, clipImage) {
	var canvas = document.createElement("canvas");
	canvas.width = rect.width;
	canvas.height = rect.height;
	var ctx = canvas.getContext("2d");
	if (bgColor) {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	ctx.drawImage(img, -rect.x, -rect.y);
	if (clipImage) {
		ctx.globalCompositeOperation = "destination-in";
		ctx.drawImage(clipImage, 0, 0, canvas.width, canvas.height);
	}
	return canvas;
}

/**
 *
 * @param {CanvasImageSource} img
 * @param {Size} size
 */
export function resize(img, size) {
	var canvas = document.createElement("canvas");
	canvas.width = size.width;
	canvas.height = size.height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, size.width, size.height);
	return canvas;
}

export function loadFont(name, timeout) {
	timeout = timeout || 30e3;
	return new Promise(function (resolve, reject) {
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
				reject(new Error("timeout"));
				document.body.removeChild(span);
				clearTimeout(h);
			} else if (w != span.clientWidth) {
				resolve();
				document.body.removeChild(span);
				clearTimeout(h);
			}
		}, 100);
	});
}

// export function resize(img, max, fit, bgColor) {
// 	var canvas = document.createElement("canvas");
// 	canvas.width = max.width;
// 	canvas.height = max.height;
// 	var width = img.naturalWidth || img.width;
// 	var height = img.naturalHeight || img.height;
// 	var size = {width, height};
// 	contain(size, max);
// 	if (fit) {
// 		canvas.width = size.width;
// 		canvas.height = size.height;
// 	}
// 	var x = (canvas.width - size.width) / 2;
// 	var y = (canvas.height - size.height) / 2;
// 	var ctx = canvas.getContext("2d");
// 	if (bgColor) {
// 		ctx.fillStyle = bgColor;
// 		ctx.fillRect(0, 0, canvas.width, canvas.height);
// 	}
// 	ctx.drawImage(img, x, y, size.width, size.height);
// 	return canvas;
// }

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
 * @param {number} deg 0~360
 */
export function rotate(img, deg) {
	deg = (deg / 180) * Math.PI;
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	var w = img.naturalWidth || img.width;
	var h = img.naturalHeight || img.height;
	canvas.width = Math.abs(Math.cos(deg) * w) + Math.abs(Math.sin(deg) * h);
	canvas.height = Math.abs(Math.sin(deg) * w) + Math.abs(Math.cos(deg) * h);
	var x = (canvas.width - w) / 2;
	var y = (canvas.height - h) / 2;
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.rotate(deg);
	ctx.drawImage(img, x - canvas.width / 2, y - canvas.height / 2);
	return canvas;
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

/**
 * 返回一个Promise，在下次触发eventType时返回
 * @param {EventTarget} listener
 * @param {string} eventType
 * @param {boolean} [options]
 */
export function once(listener, eventType, options) {
	var fn;
	return new Promise((resolve) => {
		listener.addEventListener(eventType, resolve, options);
		fn = function () {
			listener.removeEventListener(eventType, resolve);
		};
	}).finally(fn);
}

/**
 *
 * @param {DataTransfer} t
 * @return {{[path:string]:File}}
 */
export function getFilesFromDataTransfer(t) {}

let index = 1255;
/**
 * @param {HTMLElement} el
 */
export function pushIndex(el) {
	return (el.style.zIndex = index++);
}

export function detectZoom() {
	var ratio = 0;
	var screen = window.screen;
	var ua = navigator.userAgent.toLowerCase();

	if (window.devicePixelRatio !== undefined) {
		ratio = window.devicePixelRatio;
	} else if (~ua.indexOf("msie")) {
		if (screen.deviceXDPI && screen.logicalXDPI) {
			ratio = screen.deviceXDPI / screen.logicalXDPI;
		}
	} else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
		ratio = window.outerWidth / window.innerWidth;
	}

	return ratio;
}

/**
 * 选中正则匹配的文本
 * @param {HTMLInputElement} input
 * @param {RegExp} reg
 */
export function inputSelect(input, reg) {
	var value = input.value;
	var match = value.match(reg);
	if (match) {
		input.setSelectionRange(match.index, match.index + match[0].length);
	}
}

export function waitAllImageLoaded() {
	let imgs = document.querySelectorAll("img");
	let list = [];
	for (let i = 0; i < imgs.length; i++) {
		let img = imgs[i];
		if (!img.complete) {
			list.push(
				new Promise(function (resolve) {
					img.addEventListener("load", resolve);
					img.addEventListener("error", resolve);
				})
			);
		}
	}
	return Promise.all(list);
}

/**
 * 合并多个音轨
 * @param {MediaStream[]} streams
 * @returns
 */
export function mergeAudioStream(streams) {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	const audioCtx = new AudioContext();
	const destination = audioCtx.createMediaStreamDestination();
	for (let stream of streams) {
		const source = audioCtx.createMediaStreamSource(stream);
		source.connect(destination);
	}
	return destination.stream;
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number,y:number,size:number, buttons:number, type:string}} opts
 */
export function drawMouse(ctx, opts) {
	let {x, y, size, type, buttons} = opts;
	size = size || 20;
	if (buttons) {
		ctx.strokeStyle = `rgb(${buttons & 1 && 255},${buttons & 4 && 255},${buttons & 2 && 255})`;
		ctx.beginPath();
		ctx.arc(x, y, size, 0, 2 * Math.PI);
		ctx.stroke();
	}
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(0.022, 0.022);
	ctx.strokeStyle = "#000";
	ctx.miterLimit = 4;
	if (type == "move") {
	} else {
		ctx.translate(-256.282687, -129.418931);
		ctx.beginPath();
		ctx.moveTo(564.338142, 1024);
		ctx.lineTo(392.09854699999994, 671.833309);
		ctx.lineTo(192.353359, 864.016856);
		ctx.lineTo(192.353359, 0);
		ctx.lineTo(869.3589509999999, 518.063297);
		ctx.lineTo(599.4832899999999, 565.6766620000001);
		ctx.lineTo(771.8627299999998, 918.1290370000002);
		ctx.lineTo(564.3381419999998, 1024.0000000000002);
		ctx.closePath();
		ctx.moveTo(410.987666, 564.94547);
		ctx.lineTo(593.200236, 937.505617);
		ctx.lineTo(686.81275, 889.748411);
		ctx.lineTo(504.74002600000006, 517.475947);
		ctx.lineTo(714.929668, 480.390943);
		ctx.lineTo(256.282687, 129.418931);
		ctx.lineTo(256.282687, 713.7929240000001);
		ctx.lineTo(410.987666, 564.94547);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
	ctx.restore();
}

/**
 * @param {"audioinput"|"videoinput"|"audiooutput"|} kind
 * @returns
 */
export function isSupport(kind) {
	return navigator.mediaDevices.enumerateDevices().then((devices) => {
		for (let device of devices) {
			if (device.kind === kind) {
				return true;
			}
		}
		return false;
	});
}

/**
 * 获取鼠标事件/触摸事件的坐标
 * @param {MouseEvent|TouchEvent} e
 * @returns {x:number,y:number}
 */
export function getPointByEvent(e) {
	if (e.clientX != null) return {x: e.clientX, y: e.clientY};
	if (e.touches && e.touches[0]) return {x: e.touches[0].clientX, y: e.touches[0].clientY};
	return {x: 0, y: 0};
}

class MoveDelta {
	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	constructor(e) {
		this.start = getPointByEvent(e);
		this.end = this.start;
		this.x = 0;
		this.y = 0;
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 * @example
	 * let delta = new MoveDelta(e);
	 * document.addEventListener("mousemove", (e) => {
	 *  delta.update(e);
	 * 	console.log(delta.x, delta.y);
	 * });
	 * document.addEventListener("mouseup", (e) => {
	 * delta.update(e);
	 * console.log(delta.x, delta.y);
	 * });
	 **/
	update(e) {
		let end = getPointByEvent(e);
		this.x = end.x - this.end.x;
		this.y = end.y - this.end.y;
		this.end = end;
		return end;
	}

	totalDelta() {
		return {x: this.end.x - this.start.x, y: this.end.y - this.start.y};
	}

	distance() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	totalDistance() {
		let {x, y} = this.totalDelta();
		return Math.sqrt(x * x + y * y);
	}
}

/**
 * 接受一个鼠标按下事件
 * - 在每次鼠标移动时触发 onchange(本次鼠标位移, mousemove事件)
 * - 在释放鼠标时触发 onend(从起点开始鼠标总位移, mousemove事件)
 * @param {MouseEvent} downEvent
 * @param {{
 * 	onchange?:(delta:MoveDelta, e: MouseEvent)=>void;
 * 	onend?:(totalDelta:MoveDelta, e: MouseEvent)=>void;
 * }} opt
 */
export function moveIt(downEvent, opt) {
	opt = opt || {};
	let moveDelta = new MoveDelta(downEvent);
	let mousemove = function (e) {
		moveDelta.update(e);
		opt.onchange?.(moveDelta, e);
	};
	function mouseup(e) {
		moveDelta.update(e);
		Object.assign(moveDelta, moveDelta.totalDelta());
		document.removeEventListener("mousemove", mousemove);
		document.removeEventListener("mouseup", mouseup);
		document.removeEventListener("touchmove", mousemove);
		document.removeEventListener("touchend", mouseup);
		opt.onend?.(moveDelta, e);
	}
	document.addEventListener("mousemove", mousemove);
	document.addEventListener("mouseup", mouseup);
	document.addEventListener("touchmove", mousemove);
	document.addEventListener("touchend", mouseup);
}

export function rotateIt(downEvent, opt) {
	var getCenter = typeof opt.center == "function" ? opt.center : () => opt.center;

	var getStatus = function (e) {
		var rightBottom = getPointByEvent(e);
		var center = getCenter();
		var distance = Math.sqrt(
			(center.x - rightBottom.x) * (center.x - rightBottom.x) +
				(center.y - rightBottom.y) * (center.y - rightBottom.y)
		);
		var angle = getAngle(center, rightBottom);
		return {distance, angle};
	};
	var prev = getStatus(downEvent);
	let delta;
	let all = {distance: 0, scale: 1, angle: 0};
	var mousemove = function (e) {
		var cur = getStatus(e);
		delta = {
			distance: cur.distance - prev.distance,
			scale: cur.distance / prev.distance,
			angle: cur.angle - prev.angle,
		};
		if (delta.scale > 0) {
			prev = cur;
			opt.onchange?.(delta);
			all.distance += delta.distance;
			all.angle += delta.angle;
			all.scale *= delta.scale;
		}
	};
	function mouseup(e) {
		document.removeEventListener("mousemove", mousemove);
		document.removeEventListener("mouseup", mouseup);
		document.removeEventListener("touchmove", mousemove);
		document.removeEventListener("touchend", mouseup);
		opt.onend?.(all, e);
	}
	document.addEventListener("mousemove", mousemove);
	document.addEventListener("mouseup", mouseup);
	document.addEventListener("touchmove", mousemove);
	document.addEventListener("touchend", mouseup);
}

export function selectIt(downEvent, opt) {
	if (!opt.elements) throw "need elements";
	let elements;
	if (typeof opt.elements == "function") elements = opt.elements();
	else if (typeof opt.elements === "string") elements = document.querySelectorAll(opt.elements);
	else elements = opt.elements;
	let p1 = getPointByEvent(downEvent);
	let el;
	var mousemove = function (e) {
		if (!el) {
			el = document.createElement("div");
			el.style.position = "fixed";
			el.style.border = "1px dashed #1b78ff";
			document.body.appendChild(el);
		}
		let p2 = getPointByEvent(e);
		let x1 = Math.min(p1.x, p2.x);
		let x2 = Math.max(p1.x, p2.x);
		let y1 = Math.min(p1.y, p2.y);
		let y2 = Math.max(p1.y, p2.y);
		el.style.left = x1 + "px";
		el.style.top = y1 + "px";
		el.style.width = x2 - x1 + "px";
		el.style.height = y2 - y1 + "px";
		let selected = [];
		for (let i = 0; i < elements.length; i++) {
			let rect = elements[i].getBoundingClientRect();
			if (rect.left > x2 || rect.right < x1 || rect.top > y2 || rect.bottom < y1) continue;
			selected.push(elements[i]);
		}
		opt.onchange?.(selected, e);
	};
	function mouseup(e) {
		if (el) document.body.removeChild(el);
		document.removeEventListener("mousemove", mousemove);
		document.removeEventListener("mouseup", mouseup);
		document.removeEventListener("touchmove", mousemove);
		document.removeEventListener("touchend", mouseup);
		opt.onend?.(null, e);
	}
	document.addEventListener("mousemove", mousemove);
	document.addEventListener("mouseup", mouseup);
	document.addEventListener("touchmove", mousemove);
	document.addEventListener("touchend", mouseup);
}

/**
 * 将文件生成zip包
 * @param {{[key:string]: Blob|string}} files
 * @returns {Promise<Blob|Uint8Array>}
 * @example
 * zipAll({
 * 	"index.txt": "hello world",
 * 	"test.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQAAAABazTCJAAAADElEQVQI12NwYGgAAAFEAMHrWQMJAAAAAElFTkSuQmCC",
 * 	"folder/test.json": "https://electron-update-1251441578.cos.ap-shanghai.myqcloud.com/logo/images.json",
 * 	"abc.txt": new Blob(["hello abc.txt"]),
 * })
 */
export async function zipAll(files, type = "blob") {
	let {zip} = await loadjs("fflate.min.js", "fflate");
	for (let key in files) {
		let file = files[key];
		if (/^(https?:\/\/|data:)/.test(file)) {
			files[key] = await http_get(file, "arraybuffer").then((x) => new Uint8Array(x));
		} else if (file instanceof Blob) {
			files[key] = await readFileAsArrayBuffer(file).then((x) => new Uint8Array(x));
		} else if (typeof file === "string") {
			files[key] = Buffer.from(file);
		}
	}
	return new Promise((resolve, reject) => {
		zip(files, {level: 1}, (err, data) => {
			err ? reject(err) : resolve(type == "blob" ? new Blob([data]) : data);
		});
	});
}

/**
 * 将zip文件解压
 * @param {Blob} file
 * @param {string|string[]} [filenames] 指定要解压的文件名,默认全部解压
 */
export async function unzipAll(file, filenames = []) {
	let {Unzip, AsyncUnzipInflate} = await loadjs("fflate.min.js", "fflate");
	if (file instanceof Blob) file = await readFileAsArrayBuffer(file);
	if (file instanceof ArrayBuffer) file = new Uint8Array(file);
	if (typeof filenames === "string") filenames = [filenames];
	let set = new Set(filenames);
	let error;
	let files = {};
	await new Promise(function (resolve, reject) {
		const unzip = new Unzip((stream) => {
			if (error) return;
			if (!filenames.length || set.has(stream.name)) {
				stream.ondata = (err, chunk, final) => {
					if (err) {
						error = err;
						reject(err);
					} else {
						files[stream.name] = chunk;
						set.delete(stream.name);
						if (final || (filenames.length && !set.size)) resolve();
					}
				};
				stream.start();
			}
		});
		unzip.register(AsyncUnzipInflate);
		unzip.push(file, true);
	});
	if (filenames.length == 1) return files[filenames[0]];
	return files;
}

const CONBINE_KEYS = ["Control", "Alt", "Shift", "Meta"];
const KEY_MAP = {
	Escape: "Esc",
	ArrowLeft: "Left",
	ArrowRight: "Right",
	ArrowUp: "Up",
	ArrowDown: "Down",
	" ": "Space",
};
const SHIFT_MAP = {
	"~": "`",
	"!": "1",
	"@": "2",
	"#": "3",
	$: "4",
	"%": "5",
	"^": "6",
	"&": "7",
	"*": "8",
	"(": "9",
	")": "0",
	_: "-",
	"+": "=",
	":": ";",
	'"': "'",
	"<": ",",
	">": ".",
	"?": "/",
	"|": "\\",
};
/**
 * @param {KeyboardEvent} evt
 * @returns {HotKey}
 */
export function getHotkey(evt) {
	if (CONBINE_KEYS.indexOf(evt.key) > -1) return "";
	let key = KEY_MAP[evt.key] || evt.key;
	if (evt.shiftKey) key = SHIFT_MAP[key] || key;
	return [
		evt.metaKey && "Meta",
		evt.ctrlKey && "Ctrl",
		evt.altKey && "Alt",
		evt.shiftKey && "Shift",
		evt.keyCode >= 65 && evt.keyCode < 108 ? key.toUpperCase() : key,
	]
		.filter((v) => v)
		.join("+");
}

export function openWindow(url, {name, width, height}) {
	let left = (screen.availWidth - width) / 2 + screen.availLeft;
	let top = (screen.availHeight - height) / 2 + screen.availTop;
	return window.open(
		url,
		name,
		`width=${width},height=${height},left=${left},top=${top},location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no`
	);
}

/**
 * 创建一个不超过最大限制的canvas
 * https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element
 * @param {Size} size
 * @returns {HTMLCanvasElement & {scale:number}}
 */
export function createCanvas(size) {
	size = Object.assign({}, size);
	if (size.width > size.height) {
		if (size.width > 32767) {
			size.height *= 32767 / size.width;
			size.width = 32767;
		}
	} else if (size.height > 32767) {
		size.width *= 32767 / size.height;
		size.height = 32767;
	}
	const area = size.width * size.height;
	let scale = 1;
	if (area > 268435456) {
		scale = Math.sqrt(268435456 / area);
		size.width *= scale;
		size.height *= scale;
	}
	let canvas = document.createElement("canvas");
	canvas.width = size.width;
	canvas.height = size.height;
	canvas.scale = scale;
	return canvas;
}

/**
 * @param { string | Uint8Array} file
 * @returns {string}
 */
export function md5Sync(file) {
	if (typeof file === "string") {
		return SparkMD5.hash(file);
	}
	return SparkMD5.ArrayBuffer.hash(file);
}

/**
 * @param {Blob | string | Uint8Array} file
 * @returns {Promise<string>}
 */
export async function md5(file) {
	if (file == null) throw new Error("can't get md5 of null");
	if (file instanceof Blob)
		return new Promise((resolve, reject) => {
			var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
			var chunkSize = 2097152; // 以每片2MB大小来逐次读取
			var chunks = Math.ceil(file.size / chunkSize);
			var currentChunk = 0;
			var spark = new SparkMD5(); // 创建SparkMD5的实例
			var fileReader = new FileReader();
			const loadNext = () => {
				var start = currentChunk * chunkSize;
				var end = start + chunkSize >= file.size ? file.size : start + chunkSize;

				fileReader.readAsBinaryString(blobSlice.call(file, start, end));
			};

			fileReader.onload = async (e) => {
				if (!e.target) {
					reject("read file error");
					return;
				}
				spark.appendBinary(e.target.result); // append array buffer
				currentChunk += 1;
				if (currentChunk < chunks) {
					loadNext();
				} else {
					resolve(spark.end());
				}
			};
			loadNext();
		});
	return md5Sync(file);
}
