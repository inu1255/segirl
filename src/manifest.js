module.exports = {
	name: "划姬",
	version: "1.0.2",
	description: "不止是划词翻译,你的划词贤内助",
	author: "inu1255",
	homepage_url: "https://github.com/inu1255/segirl",
	manifest_version: 3,
	icons: {16: "icons/16.png", 48: "icons/48.png", 96: "icons/96.png", 128: "icons/128.png"},
	permissions: [
		"tabs",
		// 'cookies',
		// 'background',
		"activeTab",
		"contextMenus",
		// 'unlimitedStorage',
		"storage",
		"notifications",
		// 'identity',
		// 'identity.email',
		"offscreen",
		"webRequest",
		"webRequestBlocking",
	],
	host_permissions: ["https://fanyi.sogou.com/"],
	optional_host_permissions: ["*://*/*"],
	action: {
		default_title: "划姬",
		default_icon: "icons/48.png",
		default_popup: "popup.html",
	},
	background: {
		service_worker: "js/background.js",
		type: "module",
	},
	//   devtools_page: 'devtools.html',
	// options_page: 'options.html',
	content_scripts: [
		{
			js: ["js/content.js"],
			run_at: "document_end",
			matches: ["<all_urls>"],
			all_frames: true,
		},
	],
	// content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
	web_accessible_resources: [
		{
			matches: ["*://*/*"],
			resources: ["icons/*"],
		},
	],
};
