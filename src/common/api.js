import {md5Sync, sleep} from "./utils";

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
		e = (16 * Math.random()) | 0;
		(t !== 8 && t !== 12 && t !== 16 && t !== 20) || (n += "-");
		n += (t === 12 ? 4 : t === 16 ? (3 & e) | 8 : e).toString(16);
	}

	return n;
};

export const _hasEnglish = (content) => {
	return /[a-zA-Z]+/g.test(content);
};

export const _stripChinese = (content) => {
	return content.replace(/[\u4E00-\u9FA5]/gm, "").trim();
};

export const _isAllChinese = (content) => {
	return /^[\u4E00-\u9FA5？，。·！￥……（）+｛｝【】、|《》；：“”‘’『』「」﹃﹄〔〕—～﹏]+$/gm.test(
		content.trim()
	);
};

export const _isAllNumber = (content) => {
	return /^[\d]+$/gm.test(content.trim());
};

export const _isAllPunctuation = (content) => {
	const reg =
		/^([\[\]\,.?"\(\)+_*\/\\&\$#^@!%~`<>:;\{\}？，。·！￥……（）+｛｝【】、|《》]|(?!\s)'\s+|\s+'(?!\s))+$/gi;
	return reg.test(content.trim());
};

export function caiyunTranslate(source) {
	if (typeof source === "string") source = [source];
	return fetch("https://api.interpreter.caiyunai.com/v1/page/translator", {
		headers: {
			"content-type": "application/json",
			"x-authorization": "token lqkr1tfixq1wa9kmj9po",
		},
		referrerPolicy: "strict-origin-when-cross-origin",
		body: JSON.stringify({
			page_id: 173555,
			user_id: "",
			cached: true,
			replaced: true,
			trans_type: "en2zh",
			os_type: "extension",
			url: "",
			source,
		}),
		method: "POST",
	}).then((x) => x.json());
}

const sougo = (function () {
	const headers = {
		"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
		"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		"X-Requested-With": "XMLHttpRequest",
		_referer: "https://fanyi.sogou.com",
	};
	function parseRet(x) {
		return x.headers.get("content-type").indexOf("json") > -1 ? x.json() : x.text();
	}
	return {
		get(url) {
			return fetch(url, {
				headers,
			}).then(parseRet);
		},
		post(url, data) {
			return fetch(url, {
				headers,
				method: "POST",
				body: data,
			}).then(parseRet);
		},
	};
})();

// 获取 seccode
async function getSeccode() {
	const data = await sougo.get("https://fanyi.sogou.com/text");
	let m = /secretCode":\s*(\d+)/.exec(data);
	if (m) window.seccode = m[1];
}

window.seccode = "109984457";

export async function sougoTranslate(text, isRetry) {
	if (!text) return;
	const from = "auto";
	const to = "zh-CHS";
	const textAfterEscape = _escape(text);
	const s = md5Sync("" + from + to + textAfterEscape + window.seccode);
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

export async function translate(q, to = "auto") {
	return sougoTranslate(q);
}
