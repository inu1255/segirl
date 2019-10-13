import config from '../common/config';
import { sougoTranslate, } from '../common/utils';

// chrome.contextMenus.removeAll()
// chrome.contextMenus.create({
// 	id: 'segirl',
// 	contexts: ['selection'],
// 	title: '召唤划姬',
// 	onclick(info, tab) {
// 		console.log(info)
// 		chrome.tabs.sendRequest(tab.id, Object.assign({ type: 'call' }, info), function(res) {
// 			console.log(res)
// 		})
// 	}
// });

chrome.extension.onRequest.addListener(async function(info, sender, cb) {
	if (info.type == 'translate') {
		let data = await sougoTranslate(info.text)
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