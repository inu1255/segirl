/**
 * 对URL参数进行编码,相当于 encodeURIComponent, 但只会编码 %=?+& 字符, 更加易读
 * @param {string} str
 */
export function encodeURI(str) {
	return (str + "")
		.replace(/%/g, "%25")
		.replace(/=/g, "%3D")
		.replace(/\?/g, "%3F")
		.replace(/\+/g, "%2B")
		.replace(/&/g, "%26");
}

/**
 * 将data编码为URL的query参数
 * @param {{[key:string]:any}} data 要编码的数据。
 * @param {number} [limit] 限制过大的参数
 * @returns {string} 编码后的字符串
 * @example
 * encodeQuery({a: 1, b: 2}) // a=1&b=2
 */
export function encodeQuery(data, limit) {
	var ss = [];
	for (var k in data) {
		var v = data[k];
		if (v == null || typeof v === "function") continue;
		if (typeof v === "object") v = JSON.stringify(v);
		else v = v.toString();
		if (v.length > limit) continue;
		ss.push(encodeURI(k) + "=" + encodeURI(v));
	}
	return ss.join("&");
}

/**
 * 将URL的query参数解码为data
 * @param {string} str 要解码的字符串。
 * @returns {{[key:string]:any}} 解码后的数据。
 * @example
 * decodeQuery("a=1&b=2") // {a: 1, b: 2}
 */
export function decodeQuery(str) {
	var data = {};
	if (!str) return data;
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
 * 拼接url和query参数，生成新的url
 * @param {string} url
 * @param {any} [query]
 * @returns {string}
 * @example
 * encodeHref("/api/user", {id: 1})
 * "/api/user?id=1"
 */
export function encodeHref(url, query) {
	if (isEmpty(query)) return url;
	return url + (url.indexOf("?") >= 0 ? "&" : "?") + encodeQuery(query);
}

/**
 * 解码 html字符串, 将 &lt; &gt; &amp; &quot; &apos; &#x...; &#...; 转换为对应的字符
 * @param {string} str
 * @returns {string}
 * @example
 * decodeHTML("&lt;&gt;&amp;&quot;&apos;&#x...;&#...;")
 */
export function decodeHTML(str) {
	return str
		.replace(/<[^>]*>/g, "")
		.replace(/&#(x)?([^&]{1,5});?/g, function ($, $1, $2) {
			return String.fromCharCode(parseInt($2, $1 ? 16 : 10));
		})
		.replace(/&nbsp;/g, " ")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&hellip;/g, "…")
		.replace(/&amp;/g, "&");
}

/**
 * 编码 html,编码后的字符串可以直接用于innerHTML
 * @param {string} html
 * @returns {string}
 * @example
 * encodeHTML("<div>123</div>") // "&lt;div&gt;123&lt;/div&gt;"
 */
export function encodeHTML(html) {
	return html
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

/**
 * 编码 attrs 为标签属性字符串
 * @param {object} attrs
 * @returns {string}
 * @example
 * encodeAttrs({src:'http://www.baidu.com',id:1,data:[1,2,3]})
 * // src="http://www.baidu.com" id=1 data="[1,2,3]"
 */
export function encodeAttribute(attrs) {
	let s = "";
	for (let k in attrs) {
		let v = attrs[k];
		if (typeof v === "number" || typeof v === "boolean") s += ` ${k}=${v}`;
		else if (typeof v === "string") s += ` ${k}="${encodeHTML(v)}"`;
		else s += ` ${k}="${encodeHTML(JSON.stringify(v))}"`;
	}
	return s;
}

/**
 * 解码 attrs 为对象
 * @param {string} str
 * @param {boolean} [noParse] 不解析属性值,全部返回字符串
 * @returns {object}
 * @example
 * decodeAttrs('src="http://www.baidu.com" id=1 data="[1, 2,3]"')
 * // {src:'http://www.baidu.com',id:1,data:[1,2,3]}
 * decodeAttrs('src="http://www.baidu.com" id=1 data="[1, 2,3]"',true)
 * // {src:'http://www.baidu.com',id:1,data:'[1, 2,3]'}
 **/
export function decodeAttribute(str, noParse) {
	let attrs = {};
	if (!str) return attrs;
	let i = 0;
	while (i < str.length) {
		let j = str.indexOf("=", i);
		if (j < 0) break;
		let k = str.substring(i, j).trim();
		i = j + 1;
		let v = "";
		if (str[i] === '"' || str[i] === "'") {
			let c = str[i];
			i++;
			j = str.indexOf(c, i);
			if (j < 0) break;
			v = str.substring(i, j);
			i = j + 1;
		} else {
			j = str.indexOf(" ", i);
			if (j < 0) break;
			v = str.substring(i, j);
			i = j + 1;
		}
		v = decodeHTML(v);
		if (!noParse) {
			if (/^\[{/.test(v))
				try {
					v = JSON.parse(v);
				} catch (e) {}
			else if (/^\d+$/.test(v)) v = parseInt(v);
			else if (/^\d+\.\d+$/.test(v)) v = parseFloat(v);
			else if (v === "true") v = true;
			else if (v === "false") v = false;
		}
		attrs[k] = v;
	}
	return attrs;
}

/**
 * 获取距离1970-01-04(星期日)的天数, 可以用于判断是否同一天, 返回值 % 7 可以得到星期几(0-6 代表星期日到星期六)
 * @param {Date|string|number} date
 * @returns {number}
 */
export function getDay(date) {
	if (typeof date === "string") date = new Date(date);
	getDay.t = getDay.t || new Date("1970-01-04 00:00").getTime();
	return Math.floor((+date - getDay.t) / 86400e3);
}

/**
 * 格式化时间显示
 * - YY: 年份(2位)
 * - YYYY: 年份(4位)
 * - MM: 月份(2位)
 * - DD: 日期(2位)
 * - hh: 小时(2位)
 * - mm: 分钟(2位)
 * - ss: 秒(2位)
 * @param {string} format
 * @param {number|Date} t
 * @example
 * format("YYYY-MM-DD hh:mm:ss", new Date()) // "2019-01-01 00:00:00"
 */
export function format(format, t) {
	t = t == null ? new Date() : new Date(t);
	if (!format) {
		let now = new Date();
		if (getDay(now) - getDay(t) == 1) format = "昨天 hh:mm";
		else if (t.getFullYear() != now.getFullYear()) format = "YYYY-MM-DD hh:mm";
		else if (t.getMonth() != now.getMonth() || t.getDate() != now.getDate()) format = "MM-DD hh:mm";
		else format = "hh:mm";
	}
	let year = t.getFullYear().toString();
	var month = (t.getMonth() + 1).toString();
	if (month.length < 2) month = "0" + month;
	var date = t.getDate().toString();
	if (date.length < 2) date = "0" + date;
	var hours = t.getHours().toString();
	if (hours.length < 2) hours = "0" + hours;
	var mintues = t.getMinutes().toString();
	if (mintues.length < 2) mintues = "0" + mintues;
	var seconds = t.getSeconds().toString();
	if (seconds.length < 2) seconds = "0" + seconds;
	return format
		.replace(/YYYY/g, year)
		.replace(/YY/g, year.slice(2))
		.replace(/MM/g, month)
		.replace(/DD/g, date)
		.replace(/hh/g, hours)
		.replace(/mm/g, mintues)
		.replace(/ss/g, seconds);
}

/**
 * 将时间转化为 2022-02-02 12:12:12 格式,效率比 format 高
 * - 返回值 .slice(0,10) 可以得到日期
 * - 返回值 .slice(11) 可以得到时间
 * @param {number|string|Date} [t]
 * @returns {string}
 * @example
 * datetime().slice(0,10) // "2022-02-02"
 */
export function datetime(t) {
	t = t ? new Date(t) : new Date();
	let year = t.getFullYear().toString();
	var month = (t.getMonth() + 1).toString();
	if (month.length < 2) month = "0" + month;
	var date = t.getDate().toString();
	if (date.length < 2) date = "0" + date;
	var hours = t.getHours().toString();
	if (hours.length < 2) hours = "0" + hours;
	var mintues = t.getMinutes().toString();
	if (mintues.length < 2) mintues = "0" + mintues;
	var seconds = t.getSeconds().toString();
	if (seconds.length < 2) seconds = "0" + seconds;
	return `${year}-${month}-${date} ${hours}:${mintues}:${seconds}`;
}

/**
 * 用对旧数据优化的方式从保存的数据中恢复配置项
 * - 用v初始化def, 第一层只保留def的key，如果v中有相同的key, 则会覆盖def中的值
 * - 之后会合并def和v的key, 如果v中有相同的key, 则会覆盖def中的值
 * @template T
 * @param {T} def
 * @param {any} v
 * @param {boolean} [copyAllKeys]
 * @returns {T}
 * @example
 * deepInit({a: 1, b: {}}, {a: 3, b: {d: 1}, c: 4}) // {a: 3, b: {d: 1}}
 */
export function deepInit(def, v, copyAllKeys) {
	if (Array.isArray(def) && !Array.isArray(v)) return def;
	if (def != undefined && v == undefined) return def;
	if (def == null || v === null) return v;
	if (Array.isArray(def)) {
		def.length = 0;
		def.push.apply(def, v);
	} else if (typeof def === "object") {
		for (let k in def) {
			def[k] = deepInit(def[k], v[k], true);
			delete v[k];
		}
		if (copyAllKeys)
			for (let k in v) {
				def[k] = v[k];
			}
		return def;
	}
	return v;
}

/**
 * 深拷贝一个对象或数组
 * @template T
 * @param {T} obj
 * @returns {T}
 */
export function deepClone(obj) {
	if (obj == null) return obj;
	if (Array.isArray(obj)) {
		return obj.map(deepClone);
	}
	if (obj instanceof ArrayBuffer) return obj;
	if (obj instanceof Uint8Array) return obj;
	if (typeof obj === "object") {
		let o = {};
		for (let k in obj) {
			o[k] = deepClone(obj[k]);
		}
		return o;
	}
	return obj;
}

/**
 * 深度比较两个对象是否相等
 * @param {any} def
 * @param {any} v
 * @param {(paths:string[],val1:any,val2:any)=>boolean} fn 比较函数,paths是路径,val1是def中的值,val2是v中的值
 * @param {string[]} [paths] 请忽略,内部递归使用
 * @returns {boolean}
 */
export function deepDiff(def, v, fn, paths = []) {
	if (Array.isArray(def) && !Array.isArray(v)) return fn(paths, def, v);
	if ((def == null || v == null) && (def !== null || v !== null)) return fn(paths, def, v);
	if (Array.isArray(def)) {
		if (def.length != v.length) return fn(paths, def, v);
		for (let i = 0; i < def.length; i++) {
			if (deepDiff(def[i], v[i], fn, paths.concat(i))) return true;
		}
		return false;
	}
	if (typeof def === "object") {
		let set = new Set();
		for (let k in def) {
			if (deepDiff(def[k], v[k], fn, paths.concat(k))) return true;
			set.add(k);
		}
		for (let k in v) {
			if (!set.has(k) && deepDiff(def[k], v[k], fn, paths.concat(k))) return true;
		}
		return false;
	}
	return fn(paths, def, v);
}

/**
 * 通过文件路径获取文件夹路径
 * @param {string} filepath
 * @returns {string} 返回文件夹路径
 * @example
 * dirname("/foo/bar") // "/foo"
 */
export function dirname(filepath) {
	var i = filepath.length - 1;
	while (filepath[i] == "/" || filepath[i] == "\\") i--;
	for (; i >= 0; i--) {
		if (filepath[i] == "/" || filepath[i] == "\\") return filepath.slice(0, i);
	}
	return "";
}

/**
 * 通过文件路径获取文件名
 * - C:\xunjie\maincss.js 中的 maincss.js
 * @param {string} filepath
 * @returns {string} 文件名
 * @example
 * basename("/foo/bar") // "bar"
 * basename("/foo/bar.js") // "bar.js"
 */
export function basename(filepath) {
	var i = filepath.length - 1;
	while (filepath[i] == "/" || filepath[i] == "\\") i--;
	var end = i + 1;
	for (; i >= 0; i--) {
		if (filepath[i] == "/" || filepath[i] == "\\") return filepath.slice(i + 1, end);
	}
	return filepath.slice(0, end);
}

/**
 * 获取文件缀名
 * @param {string} filepath
 * @returns {string} 文件缀名
 * @example
 * extname("/foo/bar.js") // ".js"
 * extname("/foo/bar") // ""
 * extname("/foo/bar.") // "."
 * extname("/foo/bar/") // ""
 */
export function extname(filepath) {
	filepath = basename(filepath);
	let idx = filepath.lastIndexOf(".");
	return idx > 0 ? filepath.slice(idx).toLowerCase() : "";
}

/**
 * 替换文件后缀
 * @param {string} filepath
 * @param {string} [ext=""] 新的文件后缀
 * @returns {string}
 * @example
 * replaceExt("/foo/bar.js", ".ts") // "/foo/bar.ts"
 * replaceExt("/foo/bar", ".ts") // "/foo/bar.ts"
 * replaceExt("/foo/bar.", ".ts") // "/foo/bar.ts"
 * replaceExt("/foo/bar/", ".ts") // "/foo/bar.ts"
 * replaceExt("/foo/bar.js", "") // "/foo/bar"
 */
export function replaceExt(filepath, ext = "") {
	var i = filepath.length - 1;
	while (filepath[i] == "/" || filepath[i] == "\\") i--;
	return filepath.slice(0, i + 1 - extname(filepath).length) + ext;
}

/**
 * 调整src高宽，使其充满dst而不超出dst
 * - 类似css中的background-size: contain
 * - https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
 * @param {Size} src
 * @param {Size} dst
 */
export function contain(src, dst) {
	var r = src.width / src.height;
	var w = r * dst.height;
	if (dst.width >= w) {
		src.width = w;
		src.height = dst.height;
	} else {
		src.width = dst.width;
		src.height = dst.width / r;
	}
}

/**
 * 调整src高宽，使其刚好覆盖dst
 * - 类似css中的background-size: cover
 * - https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
 * @param {Size} src
 * @param {Size} dst
 */
export function cover(src, dst) {
	if (src.height == 0 || src.width == 0) return;
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

/**
 * 调整src高宽, 如果超过dst则使其刚好不超出dst,否则保持原样
 * @param {Size} src
 * @param {Size} dst
 */
export function limitSize(src, dst) {
	let ratio = 1;
	if (src.width > dst.width) {
		ratio = dst.width / src.width;
		src.width = dst.width;
		src.height = src.height * ratio;
	}
	if (src.height > dst.height) {
		ratio = dst.height / src.height;
		src.height = dst.height;
		src.width = src.width * ratio;
	}
}

/**
 * 等待ms毫秒
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
	return new Promise(function (resolve) {
		setTimeout(resolve, ms);
	});
}

/**
 * 限制字符串长度, 如果超出，则显示...
 * @param {string} s 字符串
 * @param {number} n 限制长度(包含...)
 * @param {number} [m=0] 末尾要保留的字符数
 * @returns {string}
 */
export function limit(s, n, m = 0) {
	let tail = s && m ? s.slice(-m) : "";
	return s ? (s.length <= n + m ? s : s.slice(0, n - 3) + "..." + tail) : "";
}

/**
 * 生成随机字符串,包含小写字母和数字
 * @param {number} len
 */
export function randomString(len) {
	if (len < 1) return "";
	let s = Math.random().toString(36).slice(2);
	return s + randomString(len - s.length);
}

/**
 * 生成随机字符串,仅包含数字
 * @param {number} len
 */
export function randomNumber(len) {
	if (len < 1) return "";
	let s = Math.random().toString().slice(2);
	return s + randomNumber(len - s.length);
}

/**
 * 生成随机整数
 * @param {number} max 最大值
 */
export function randN(max) {
	return Math.floor(Math.random() * max);
}

/**
 * 如果是数组,则返回本身，否则返回 [ val ]
 * @template T
 * @param {T|T[]} val
 * @returns {T[]}
 * @example
 * toArray(null) // []
 * toArray([]) // []
 * toArray(1) // [1]
 */
export function arr(val) {
	if (val == null) return [];
	return val.length ? Array.from(val) : [val];
}

/**
 * 将data数组的数据合并到list数组中
 * - 通常后端返回订单列表和用户列表，需要在订单列表中显示用户信息时处理数据使用
 * @deprecated 不常用
 * @param {any[]} list 订单列表
 * @param {any[]} data 用户列表
 * @param {string} key 合并后添加到list元素上的key
 * @param {string} [foreignKey] 订单列表中表示用户id的key,默认为 `${参数key}_id`
 * @example
 * leftJoin([{id: 1, user_id: 1}, {id: 2, user_id: 1}, {id: 2, user_id: 2}], [{id: 1, name: "a"}, {id: 2, name: "b"}], "user")
 * [{id: 1, user_id: 1, user: {id: 1, name: "a"}}, {id: 2, user_id: 1, user: {id: 1, name: "a"}}, {id: 2, user_id: 2, user: {id: 2, name: "b"}}]
 */
export function leftJoin(list, data, key, foreignKey) {
	foreignKey = foreignKey || key + "_id";
	let map = {};
	for (let item of data) {
		map[item.id] = item;
	}
	for (let item of list) {
		let id = item[foreignKey];
		item[key] = map[id] || {id};
	}
}

/**
 * 修改body, 去掉keys和undefine
 * - keys为数组时, 遍历keys, 并删除body[key]
 * - keys为对象时, 遍历body, 如果body[key]为undefine或body[key]等于keys[key]时, 删除body[key]
 * @template T
 * @param {T} body
 * @param {string[] | { [key: string]: any }} keys
 * @returns {T}
 * @example
 * clearKeys({a: 1, b: undefined, c: 2}, {a: 1, c: 3}) // {c: 2}
 */
export function clearKeys(body, keys) {
	if (keys instanceof Array) {
		// 清除keys中的字段
		for (let key of keys) {
			delete body[key];
		}
	} else {
		// 清除与keys值相同的字段
		for (let k in body) {
			let v = body[k];
			if (keys[k] == v || v === undefined) delete body[k];
		}
	}
	return body;
}

/**
 * 判断对象是否为空
 * @param {any} obj
 * @returns {boolean}
 * @example
 * isEmpty({}) // true
 * isEmpty({a: 1}) // false
 * isEmpty(null) // true
 */
export function isEmpty(obj) {
	if (!obj) return true;
	let ok = true;
	// eslint-disable-next-line no-unreachable-loop
	for (let _ in obj) {
		ok = false;
		break;
	}
	return ok;
}

const bs = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB"];
/**
 * 字节数转换
 * @param {number} size
 * @param {number} [n=0] 保留几位小数, 负数表示去掉小数末尾的0
 * @param {number} [i=0] 参数size的单位是什么,0-3 对应 b/kb/mb/gb
 * @returns {string}
 * @example
 * byteSize(1024) // 1KB
 * byteSize(1024, 2) // 1.00KB
 */
export function traffic(size, n = 2, i = 0) {
	if (size == null) return "";
	size = parseFloat(size);
	for (; i < bs.length; i++) {
		if (size < 1024) {
			size = size.toFixed(Math.abs(n));
			if (n < 0) size = +size;
			return size + bs[i];
		}
		size /= 1024;
	}
	size = size.toFixed(Math.abs(n));
	if (n < 0) size = +size;
	return size + "YB";
}

/**
 * 小数转百分比,不包含%
 * @deprecated 已废弃,请使用 +(v*100).toFixed(n)+"%"
 * @param {number} v
 * @param {number} [n=0] 保留几位小数 100为两位
 * @returns {number}
 */
export function percent(v, n) {
	return Math.floor(v * 100 * n) / n;
}

/**
 * 防抖 间隔时间内的重复调用只有最后一次生效
 * @template T
 * @param {T} fn
 * @param {number} [delay=300]
 * @returns {T}
 * @example
 * template: `<div @click="onclick">你点我呀</div>`,
 * methods: {
 * 	onclick: debounce(function() {
 * 		console.log('哼,你不停我就不触发')
 * 	}, 300)
 * }
 */
export function debounce(fn, delay = 300) {
	var timer;
	return function () {
		var args = arguments;
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(this, args);
		}, delay);
	};
}

/**
 * 节流 每隔一段时间只能调用一次
 * - 第一次不用等待
 * - 最后一次可能被忽略
 * @template T
 * @param {T} fn
 * @param {number} [delay=300]
 * @returns {T}
 * @example
 * template: `<div @click="onclick">你点我呀</div>`,
 * methods: {
 * 	onclick: throttle(function() {
 * 		console.log('已经冷落你超过5秒了,让你触发一次吧')
 * 	}, 5000)
 * }
 */
export function throttle(fn, delay = 300) {
	let valid = true;
	return function () {
		var args = arguments;
		if (!valid) {
			// 休息时间
			return;
		}
		// 工作时间，执行函数并且在间隔期内把状态位设为无效
		valid = false;
		fn.apply(this, args);
		setTimeout(() => {
			valid = true;
		}, delay);
	};
}

/**
 * 节流 每隔一段时间只能调用一次
 * - 第一次不用等待
 * - 最后一次不会被忽略
 * @template T
 * @param {T} fn
 * @param {number} [delay=300]
 * @returns {T}
 **/
export function throttle2(fn, delay = 300) {
	let valid = true;
	let args;
	return function () {
		args = arguments;
		if (!valid) {
			// 休息时间
			return;
		}
		// 工作时间，执行函数并且在间隔期内把状态位设为无效
		valid = false;
		fn.apply(this, args);
		args = null;
		setTimeout(() => {
			valid = true;
			if (args) {
				fn.apply(this, args);
				args = null;
			}
		}, delay);
	};
}

/**
 * promise没有返回之前，忽略所有调用
 * @template {{(...args:any[])=>Promise<any>}}T
 * @param {T} fn
 * @param {string} [key] 执行过程中设置this[key]为true，执行完毕后设置为false, 不传则不设置
 * - 通常用于显示loading动画
 * @returns {T}
 * @example
 * template: `<div @click="onclick">你点我呀</div>`,
 * methods: {
 * 	onclick: onlyone(function() {
 * 		console.log('我手里有事,别找我')
 * 	}
 * }
 */
export function onlyone(fn, key) {
	let loading = false;
	return function () {
		if (key ? this[key] : loading) return;
		key ? (this[key] = true) : (loading = true);
		return fn.apply(this, arguments).finally(() => {
			key ? (this[key] = false) : (loading = false);
		});
	};
}

/**
 * 依次执行函数，上一个promise返回或出错后执行下一个
 * @template {{(...args:any[])=>Promise<any>}} T
 * @param {T} fn
 * @returns {T}
 * @example
 * template: `<div @click="onclick">你点我呀</div>`,
 * methods: {
 * 	onclick: synchronized(function() {
 * 		console.log('稍等一下,请排好队')
 * 	}
 * }
 */
export function synchronized(fn) {
	let pms = Promise.resolve();
	return function () {
		let p = pms.then(() => fn.apply(this, arguments));
		pms = p.catch(() => 0);
		return p;
	};
}

/**
 * 重试
 * @template {{(...args:any[])=>Promise<any>}} T
 * @param {T} fn
 * @param {number} [times=3] 重试次数
 * @param {number} [ms=1e3] 重试间隔时间(毫秒)
 * @returns {T}
 */
export function retry(fn, times = 3, ms = 1e3) {
	return function () {
		let n = times;
		let that = this;
		let args = arguments;
		function call() {
			n--;
			try {
				let ret = fn.apply(that, args);
				if (n >= 0 && ret && typeof ret.then === "function")
					return ret.catch(() => sleep(ms).then(call));
				return ret;
			} catch (error) {
				if (n < 0) throw error;
				return call();
			}
		}
		return call();
	};
}

/**
 * 生成装饰器
 * @deprecated 不常用
 * @template {{(...args:any[])=>any}} F
 * @param  {((k:F)=>F)[]} list
 * @returns {(target: any, propertyKey: any, descriptor: any) => void}
 */
export function useDecorator(...list) {
	if (!list.length) return function () {};
	return function (target, propertyKey, descriptor) {
		let fn = descriptor.value;
		list.forEach((x) => (fn = x(fn)));
		descriptor.value = fn;
	};
}

/**
 * 字符串转UTF8编码数据
 * @param {string} input
 * @returns {Uint8Array}
 */
export function fromUtf8(input) {
	const bytes = [];
	for (let i = 0, len = input.length; i < len; i++) {
		const value = input.charCodeAt(i);
		if (value < 0x80) {
			bytes.push(value);
		} else if (value < 0x800) {
			bytes.push((value >> 6) | 0b11000000, (value & 0b111111) | 0b10000000);
		} else if (
			i + 1 < input.length &&
			(value & 0xfc00) === 0xd800 &&
			(input.charCodeAt(i + 1) & 0xfc00) === 0xdc00
		) {
			const surrogatePair =
				0x10000 + ((value & 0b1111111111) << 10) + (input.charCodeAt(++i) & 0b1111111111);
			bytes.push(
				(surrogatePair >> 18) | 0b11110000,
				((surrogatePair >> 12) & 0b111111) | 0b10000000,
				((surrogatePair >> 6) & 0b111111) | 0b10000000,
				(surrogatePair & 0b111111) | 0b10000000
			);
		} else {
			bytes.push(
				(value >> 12) | 0b11100000,
				((value >> 6) & 0b111111) | 0b10000000,
				(value & 0b111111) | 0b10000000
			);
		}
	}

	return Uint8Array.from(bytes);
}

/**
 * UTF8编码数据转字符串
 * - web端推荐用 TextDecoder
 * @param {Uint8Array} input
 * @returns {string}
 */
export function toUtf8(input) {
	let decoded = "";
	for (let i = 0, len = input.length; i < len; i++) {
		const byte = input[i];
		if (byte < 0x80) {
			decoded += String.fromCharCode(byte);
		} else if (byte >= 0b11000000 && byte < 0b11100000) {
			const nextByte = input[++i];
			decoded += String.fromCharCode(((byte & 0b11111) << 6) | (nextByte & 0b111111));
		} else if (byte >= 0b11110000 && byte < 0b101101101) {
			const surrogatePair = [byte, input[++i], input[++i], input[++i]];
			const encoded = "%" + surrogatePair.map((byteValue) => byteValue.toString(16)).join("%");
			decoded += decodeURIComponent(encoded);
		} else {
			decoded += String.fromCharCode(
				((byte & 0b1111) << 12) | ((input[++i] & 0b111111) << 6) | (input[++i] & 0b111111)
			);
		}
	}

	return decoded;
}

/**
 * 检查文件名重复并返回新的文件名
 * @param {string} name 文件名
 * @param {Set<string>|string[]} names 已存在的文件名集合或数组
 * @param {(s:string)=>string} [fn] 旧文件名转新文件名的函数, 默认返回`${name}(${index++})`
 * - 请不要用类似 s => s 这样的函数，它会导致死循环
 * @returns {string} 新文件名
 * @example
 * const newName = checkName('a.txt', ['a.txt', 'a(1).txt']);
 * console.log(newName); // a(2).txt
 */
export function checkRename(name, names, fn) {
	let nameset = Array.isArray(names) ? new Set(names) : names;
	if (!fn)
		fn = (s) =>
			s.replace(
				/(\(\d+\))?(\.\w+)?$/,
				(_, x, ext) => (x ? `(${parseInt(x.slice(1)) + 1})` : `(1)`) + (ext || "")
			);
	let n = 10000;
	while (nameset.has(name) && n--) name = fn(name);
	if (!n) throw new Error("checkRename过多,是否fn函数有问题?");
	return name;
}

/**
 * 创建一个Promise实例，可以在在外部调用resolve或reject
 * @template T
 * @param {(resolve:(v?:T)=>void, reject:(r?:any)=>void)=>void} [fn]
 * @return {IPromise<T>}
 * @example
 * const p = createPromise()
 * p.then(()=>{
 *  console.log('resolved');
 * });
 * // 其他地方
 * console.log(p.pending, p.resolved, p.rejected) // 判断Promise状态
 * setTimeout(()=>p.resolve(), 1000);
 */
export function newPromise(fn) {
	let a, b;
	var tmp = {
		resolve(x) {
			if (this.pending) {
				a(x);
				this.resolved = true;
				this.pending = false;
			}
		},
		reject(e) {
			if (this.pending) {
				b(e);
				this.rejectd = true;
				this.pending = false;
			}
		},
		pending: true,
		resolved: false,
		rejected: false,
	};
	/** @type {Promise<T>} */
	var pms = new Promise(function (resolve, reject) {
		a = resolve;
		b = reject;
		if (fn) fn(tmp.resolve, tmp.reject);
	});
	return Object.assign(pms, tmp);
}

/**
 * 判断按键是否用于输入文本
 * - Nice: http://unixpapa.com/js/key.html
 * @param {{keyCode:number;ctrlKey?:boolean;metaKey?:boolean;altKey?:boolean;}} e
 * @returns {boolean}
 */
export function isIntendToInput(e) {
	if (e.ctrlKey || e.metaKey || e.altKey) return false;

	// a-zA-Z
	if (e.keyCode >= 65 && e.keyCode <= 90) return true;

	// 0-9 以及其上面的符号
	if (e.keyCode >= 48 && e.keyCode <= 57) return true;

	// 小键盘区域 (除回车外)
	if (e.keyCode != 108 && e.keyCode >= 96 && e.keyCode <= 111) return true;

	// 小键盘区域 (除回车外)
	// @yinheli from pull request
	if (e.keyCode != 108 && e.keyCode >= 96 && e.keyCode <= 111) return true;

	// 输入法
	if (e.keyCode == 229 || e.keyCode === 0) return true;

	return false;
}

/**
 * 检查是否国内手机号码
 * @param {string} phone
 * @returns {boolean}
 */
export function isChineseMobilePhone(phone) {
	return /^([1-9]{1,3}-)?1[3-9][0-9]{9}$/.test(phone);
}

/**
 * 判断是否邮箱格式，不支持中文邮箱
 * @param {string} email
 * @returns {boolean}
 */
export function isEmail(email) {
	return /^[\w-]+@[\w-]+(\.[\w-]+)+$/.test(email);
}

/**
 * 隐藏手机号中间4位
 * @deprecated 已废弃，请使用{@link limit}
 * @param {string} phone
 * @returns {string}
 */
export function hidePhone(phone) {
	return phone.replace(
		/^([1-9]{1,3}-)?1[3-9][0-9]{9}$/,
		(x) => `${x.slice(0, 3)}****${x.slice(7)}`
	);
}

/**
 * 等待直到某个条件成立或者超时
 * @template T
 * @param {()=>T} fn 要检查的函数,返回值为真则结束等待
 * @param {number} [timeout=10e3] 传0不超时
 * @param {number} [freq=1e3]
 * @returns {Promise<T>} fn的返回值
 * @example
 * await waitUntil(()=>document.querySelector('#app'), 10e3);
 * console.log("app加载完成");
 */
export function waitUntil(fn, timeout = 10e3, freq = 1e3) {
	let ret;
	return new Promise((resolve, reject) => {
		if ((ret = fn())) resolve(ret);
		else {
			var now = Date.now();
			var handle = setInterval(() => {
				if ((ret = fn())) {
					clearInterval(handle);
					resolve(ret);
				}
				if (Date.now() - now > timeout) {
					clearInterval(handle);
					resolve();
				}
			}, freq);
		}
	});
}

/**
 * 简单加密数据,防麻瓜不防猴子
 * @param {string} text 文本
 * @param {string} key 密码
 * @returns {string}
 */
export function encrypto(text, key) {
	key += "";
	var i = 0;
	var j = 0;
	var list = Array.from(text);
	while (i < text.length) {
		list[i++] = String.fromCharCode(text.charCodeAt(i - 1) ^ key.charCodeAt(j++ % key.length));
	}
	return btoa(list.join(""));
}

/**
 * 解密简单加密的数据
 * @param {string} text 文本
 * @param {string} key 密码
 * @returns {string}
 */
export function decrypto(text, key) {
	return atob(encrypto(atob(text), key));
}

/**
 * 生成svg图片的DataURL
 * @param {string} svg svg内容,可以是<svg>标签或者<svg>的内容
 * @param {Size} [size] svg的尺寸,当svg是<svg>的内容时生效
 * @returns {string}
 * @example
 * const svg = `<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"/></svg>`;
 * const image = document.createElement('img');
 * image.src = svgToDataURL(svg);
 * document.body.appendChild(image);
 */
export function svg2dataurl(svg, size) {
	if (!/^<svg/.test(svg)) {
		size = Object.assign({width: 1000, height: 1000}, size);
		svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">${svg}</svg>`;
	}
	return `data:image/svg+xml;utf8,${svg
		.replace(/>\s+</g, "><")
		.replace(/\r?\n/g, "")
		.replace(/%/g, "%25")
		.replace(/#/g, "%23")}`;
}

/**
 * 从数组中随机抽取一个元素
 * @template T
 * @param {T[]} list
 * @returns {T} 抽取的元素,如果没有元素则返回undefined
 */
export function randPick(list) {
	return list[Math.floor(Math.random() * list.length)];
}

/**
 * 获取向量(a,b)逆时针旋转的角度
 * @param {Point} a
 * @param {Point} b
 * @returns {number}
 * @example
 * getAngle({x:0,y:0}, {x:1,y:0}) //=> 0
 * getAngle({x:0,y:0}, {x:1,y:1}) //=> 45
 * getAngle({x:0,y:0}, {x:0,y:1}) //=> 90
 * getAngle({x:0,y:0}, {x:-1,y:1}) //=> 135
 * getAngle({x:0,y:0}, {x:-1,y:0}) //=> 180
 * getAngle({x:0,y:0}, {x:-1,y:-1}) //=> 225
 * getAngle({x:0,y:0}, {x:0,y:-1}) //=> 270
 * getAngle({x:0,y:0}, {x:1,y:-1}) //=> 315
 */
export function getAngle(a, b) {
	let angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
	return angle < 0 ? angle + 360 : angle;
}

/**
 * 获取a,b两点之间的距离
 * @param {Point} a 点a
 * @param {Point} b 点b
 * @returns {number}
 */
export function getDistance(a, b) {
	if (!a && !b) return 0;
	if (!b) return Math.sqrt(a.x * a.x + a.y * a.y);
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/**
 * 获取touch状态
 * @param {TouchList} touches
 */
export function touchStatus(touches) {
	if (touches.length < 1)
		return {
			x: 0,
			y: 0,
			angle: 0,
			distance: 0,
			length: touches.length,
		};
	if (touches.length < 2) {
		return {
			x: touches[0].clientX,
			y: touches[0].clientY,
			angle: 0,
			distance: 0,
			length: touches.length,
		};
	}
	let a = touches[0];
	let b = touches[1];
	return {
		x: (a.clientX + b.clientX) / 2,
		y: (a.clientY + b.clientY) / 2,
		angle: getAngle(a, b),
		distance: Math.sqrt(Math.pow(b.clientX - a.clientX, 2) + Math.pow(b.clientY - a.clientY, 2)),
		length: 2,
	};
}

/**
 * 通过svg字符串获取svg大小
 * @param {string} svg
 * @returns {Size}
 * @example
 * getSvgSize(`<svg width="100" height="100"></svg>`) //=> {width: 100, height: 100}
 */
export function getSvgSize(svg) {
	let m = /<svg[^>]+>/.exec(svg);
	svg = m && m[0];
	m = /width=['"]([^'"]+)['"]/.exec(svg);
	let width, height, viewBox;
	if (m) {
		width = parseFloat(m[1]);
	} else {
		width = 0;
	}
	m = /height=['"]([^'"]+)['"]/.exec(svg);
	if (m) {
		height = parseFloat(m[1]);
	} else {
		height = 0;
	}
	if (width && height) return {width, height};
	m = /viewBox=['"]([^'"]+)['"]/.exec(svg);
	if (m) {
		viewBox = m[1].split(/\s+/).map((x) => parseFloat(x));
		if (viewBox.length === 4) {
			if (width) {
				height = (viewBox[3] * width) / viewBox[2];
			} else if (height) {
				width = (viewBox[2] * height) / viewBox[3];
			} else {
				width = viewBox[2];
				height = viewBox[3];
			}
		}
	}
	return {width, height};
}

/**
 * 修改svg大小
 * @param {string} svg
 * @param {Size} size
 * @returns {string}
 * @example
 * setSvgSize(`<svg width="100" height="100"></svg>`, {width: 200, height: 200}) //=> `<svg width="200" height="200"></svg>`
 */
export function setSvgSize(svg, size) {
	return svg.replace(/<svg([^>]+)>/, function (x0, attrs) {
		let flag = false;
		attrs = attrs.replace(/width=['"]([^'"]+)['"]/, function (w) {
			flag = true;
			return `width="${size.width}"`;
		});
		if (!flag) attrs += ` width="${size.width}"`;
		flag = false;
		attrs = attrs.replace(/height=['"]([^'"]+)['"]/, function (h) {
			flag = true;
			return `height="${size.height}"`;
		});
		if (!flag) {
			attrs += ` height="${size.height}"`;
		}
		return `<svg${attrs}>`;
	});
}

/**
 * 将数值限制在 [min, max] 之间
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @example
 * clamp(0, 1, 2) //=> 1
 * clamp(1, 1, 2) //=> 1
 * clamp(2, 1, 2) //=> 2
 * clamp(3, 1, 2) //=> 2
 * clamp(1.5, 1, 2) //=> 1.5
 */
export function clamp(value, min, max) {
	return min < max
		? value < min
			? min
			: value > max
			? max
			: value
		: value < max
		? max
		: value > min
		? min
		: value;
}

/**
 * 创建一个速度计算器,通常用于计算最近一段时间的速度
 * @param {number} [ms=300] 时间间隔
 * @returns {{ push(v: number): void; get(): number; getNow(): number; }}
 * @example
 * let speed = newSpeedCounter();
 * setInterval(() => {
 * 	// 每下载到一些数据,就push到speed中
 *  speed.push(Math.random()*10);
 * 	console.log(speed.get());
 * }, 5);
 */
export function newSpeedCounter(ms = 200) {
	let list = [];
	return {
		push(v) {
			let now = Date.now();
			list.push({v, t: now});
			while (list.length > 0 && now - list[0].t > ms) list.shift();
		},
		get() {
			let duration = list.length > 0 ? list[list.length - 1].t - list[0].t : 0;
			duration = duration > 0 ? duration : ms;
			let s = (list.reduce((a, b) => a + b.v, 0) * ms) / duration;
			return s;
		},
		getNow() {
			this.push(0);
			return this.get();
		},
	};
}

/**
 * 传入一个返回Promise的函数fn,生成一个带缓存的函数
 * - 如果没有缓存或缓存过期，则调用fn获取数据
 * - 如果有缓存则返回缓存
 * - 调用新函数时第一个参数会作为缓存的key
 * - 调用新函数时传入参数大于1则禁用缓存,直接调用fn
 * - 注意fn的第一个参数必须是string或number,否则可能导致缓存错乱
 * @template {(...args:any[])=>any} T
 * @param {T} fn 缓存目标函数
 * @param {number} [maxAge=5e3] 最大缓存时间
 * @returns {T} 返回一个带缓存功能的新函数
 * @example
 * const getOrders = cacheFirst((user_id) => axios.get(`/api/orders/${user_id}`));
 * getOrders(1); // 调用接口并生成缓存,缓存key为 1
 * getOrders(1); // 找到key为1的缓存,不调用接口直接返回缓存
 * getOrders(2); // 由于没有key为2的缓存,调用接口并生成缓存,缓存key为 2
 * getOrders(2, 'payed'); // 由于有两个参数,不查找缓存直接调用接口,不会生成缓存
 */
export function cacheFirst(fn, maxAge = 5e3) {
	let cache = new Map();
	let tmap = new Map();
	return function (key) {
		if (
			Array.from(arguments)
				.slice(1)
				.filter((x) => x != null).length
		)
			return fn.apply(this, arguments);
		let t = tmap.get(key) || 0;
		if (t + maxAge < Date.now()) {
			let pms = fn.call(this, key);
			if (pms && typeof pms.then === "function") {
				let ret = cache.get(key);
				if (ret) pms = pms.catch(() => ret);
			}
			cache.set(key, pms);
			tmap.set(key, Date.now());
			return pms;
		}
		return cache.get(key);
	};
}

/**
 * 判断一个浮点数是否为0
 * - 如果 float 的绝对值小于 1e-10，则返回 true。
 * @param float - 要检查的数字。
 */
export function isZero(float) {
	return Math.abs(float) < 1e-10;
}

/**
 * 深度优先遍历对象
 * @param {string} [key]
 * @returns
 */
export function makeDFS(key = "children") {
	/**
	 * @template T
	 * @param {T} node
	 * @param {(node:T,pnode:T)=>void} fn
	 * @param {T} [parent]
	 * @returns
	 */
	return function dfs(node, fn, parent) {
		if (!node) return;
		if (Array.isArray(node)) {
			node.forEach((item) => {
				dfs(item, fn, parent);
			});
		} else {
			fn(node, parent);
			dfs(node[key], fn, node);
		}
	};
}

/**
 * 类似 string.replace, 但支持Promise
 * @param {string} str
 * @param {RegExp} regex
 * @param {(...args:string[])=>Promise<string>} fn
 * @returns
 */
export function asyncReplace(str, regex, fn) {
	let all = [];
	let cache = new Map();
	str.replace(regex, function (x0) {
		if (cache.has(x0)) return;
		cache.set(x0, true);
		all.push(
			Promise.resolve()
				.then(() => fn.apply(null, arguments))
				.then((x) => cache.set(x0, x))
		);
	});
	return Promise.all(all).then(function () {
		return str.replace(regex, function (x0) {
			return cache.get(x0);
		});
	});
}

/**
 * https://medium.com/@andrew.buntsev/javascript-string-memory-leak-48681fb39c0b
 * 通过生成新的string, 修复 sliced string 导致的内存泄漏
 * @param {string} s
 * @returns {string}
 */
export function copyString(s) {
	return s[0] + s.slice(1);
}

/**
 * 解析xml字符串
 * @typedef {{nodeName:string;attrs:{[key:string]:string};childNodes:(parseXMLNode|string)[]}} parseXMLNode
 *
 * @param {string} xml
 * @returns {parseXMLNode}
 * @example
 * parseXML('<a src="124" type="txt"><b mode="123">1</b><b mode="456">2</b></a>')
 * // [{nodeName:'a',attrs:{src:'124',type:'txt'},childNodes:[{nodeName:'b',attrs:{mode:'123'},childNodes:['1']},{nodeName:'b',attrs:{mode:'456'},childNodes:['2']}]}]
 **/
export function parseXML(xml) {
	let tree = [];
	let reg = /<([^\s>]+)([^>]*)>/g;
	let m = reg.exec(xml);
	let prev;
	let stack = [];
	while (m) {
		let value = xml.slice(prev ? prev.index + prev[0].length : 0, m.index);
		if (!(stack.length && stack[stack.length - 1].isPre)) value = value.trim();
		if (value) {
			let node = copyString(value);
			if (stack.length === 0) tree.push(node);
			else stack[stack.length - 1].childNodes.push(node);
		}
		let [, nodeName, text] = m;
		if (nodeName[0] === "/") {
			while (stack.length) {
				let node = stack.pop();
				if (stack.length === 0) tree.push(node);
				else stack[stack.length - 1].childNodes.push(node);
				if (node.nodeName == nodeName.slice(1)) break;
				console.warn(`xml格式错误,${node.nodeName}与${nodeName}不匹配`);
			}
		} else {
			let attrs = decodeAttribute(text, true);
			for (let key in attrs) {
				attrs[key] = copyString(attrs[key]);
			}
			nodeName = copyString(nodeName);
			if (text[text.length - 1] === "/" || nodeName.toLowerCase() == "br") {
				let node = {nodeName, attrs, childNodes: []};
				if (stack.length === 0) tree.push(node);
				else stack[stack.length - 1].childNodes.push(node);
			} else {
				let isPre = false;
				if (/white-space:\s*pre/.test(attrs.style)) isPre = true;
				if (!/white-space:/.test(attrs.style) && stack.length && stack[stack.length - 1].isPre)
					isPre = true;
				stack.push({nodeName, attrs, childNodes: [], isPre});
			}
		}
		prev = m;
		m = reg.exec(xml);
	}
	let value = xml.slice(prev ? prev.index + prev[0].length : 0).trim();
	if (value) {
		let node = copyString(value);
		if (stack.length === 0) tree.push(node);
		else stack[stack.length - 1].childNodes.push(node);
	}
	while (stack.length) {
		let node = stack.pop();
		if (stack.length === 0) tree.push(node);
		else stack[stack.length - 1].childNodes.push(node);
	}
	return tree;
}

/**
 * 生成xml字符串
 * @param {parseXMLNode} xml
 **/
export function stringifyXML(xml) {
	if (!xml) return "";
	if (typeof xml === "string") return xml;
	if (Array.isArray(xml)) return xml.map(stringifyXML).join("");
	let {nodeName, attrs, childNodes} = xml;
	if (!nodeName) return stringifyXML(childNodes);
	let str = `<${nodeName}`;
	for (let key in attrs) {
		str += ` ${key}="${encodeHTML(attrs[key])}"`;
	}
	str += ">";
	str += stringifyXML(childNodes);
	str += `</${nodeName}>`;
	return str;
}

/**
 * @param {Uint8Array} buf
 * @param {number} offset
 */
export function getDWORD(buf, offset) {
	return buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16) | (buf[offset + 3] << 24);
}

/**
 * @param {Uint8Array} buf
 * @param {number} offset
 * @param {number} value
 */
export function setDWORD(buf, offset, value) {
	buf[offset] = value & 0xff;
	buf[offset + 1] = (value >> 8) & 0xff;
	buf[offset + 2] = (value >> 16) & 0xff;
	buf[offset + 3] = (value >> 24) & 0xff;
}

/**
 * 修复错误的bmp图片
 * @param {Uint8Array} buf
 */
export function fixBMP(buf) {
	if (!buf || buf.length < 54) return;
	if (buf[0] === 0x42 && buf[1] === 0x4d) {
		let out;
		let offset = getDWORD(buf, 10);
		let dibSize = getDWORD(buf, 14);
		let len = 14 + dibSize;
		if (offset < len) {
			if (getDWORD(buf, 30) == 3) {
				out = new Uint8Array(buf.length - 12);
				out.set(buf.slice(0, len), 0);
				out.set(buf.slice(len + 12), len);
				setDWORD(out, 30, 0);
			} else {
				out = buf;
			}
			setDWORD(out, 2, out.length);
			setDWORD(out, 10, len);
		}
		return out;
	}
}

export function CamelCase(str) {
	return str.replace(/(^|[-_])(\w)/g, function (all, x1, letter) {
		return letter.toUpperCase();
	});
}

export function formatError(obj) {
	if (obj && typeof obj === "object") {
		if (typeof obj.msg === "string") return obj.msg;
		if (typeof obj.message === "string") return obj.message;
		if (typeof obj.error === "string") return obj.error;
		for (let k in obj) {
			let v = obj[k];
			if (typeof v === "string") return v;
		}
		for (let k in obj) {
			let v = obj[k];
			if (v && typeof v === "object") return formatError(v);
		}
	}
	return obj + "";
}

/**
 * 将 1,3,5-8,10,12-15 转换为 [1,3,5,6,7,8,10,12,13,14,15]
 * @param {string} str
 * @returns {number[]}
 */
export function decodePage(str) {
	let arr = [];
	if (!str) return arr;
	str.split(",").forEach((item) => {
		let [start, end] = item.split("-");
		if (end) {
			for (let i = parseInt(start); i <= parseInt(end); i++) {
				arr.push(i);
			}
		} else {
			arr.push(parseInt(start));
		}
	});
	return arr;
}

/**
 * 将 [1,3,5,6,7,8,10,12,13,14,15] 转换为 1,3,5-8,10,12-15
 * @param {number[]} arr
 * @returns {string}
 */
export function encodePage(arr) {
	if (!arr || !arr.length) return "";
	arr = arr.sort((a, b) => a - b);
	let str = "";
	let start = arr[0];
	let end = start;
	for (let i = 1; i < arr.length; i++) {
		if (arr[i] === end + 1) {
			end = arr[i];
		} else {
			if (start === end) {
				str += start + ",";
			} else {
				str += start + "-" + end + ",";
			}
			start = arr[i];
			end = start;
		}
	}
	if (start === end) {
		str += start;
	} else {
		str += start + "-" + end;
	}
	return str;
}
