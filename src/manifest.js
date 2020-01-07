module.exports = {
	name: '划姬',
	version: '1.0.0',
	description: '不止是划词翻译,你的划词贤内助',
	author: 'inu1255',
	homepage_url: "https://github.com/inu1255/segirl",
	manifest_version: 2,
	icons: { '16': 'icons/16.png', '48': 'icons/48.png', '96': 'icons/96.png', '128': 'icons/128.png' },
	permissions: [
		'<all_urls>',
		'*://*/*',
		'tabs',
		'cookies',
		// 'background',
		'contextMenus',
		'unlimitedStorage',
		'storage',
		'notifications',
		'identity',
		// 'identity.email',
		'webRequest',
		'webRequestBlocking'
	],
	browser_action: {
		default_title: '划姬',
		default_icon: "icons/48.png",
		default_popup: 'pages/popup.html'
	},
	background: {
		page: 'pages/background.html'
	},
	//   devtools_page: 'pages/devtools.html',
	// options_page: 'pages/options.html',
	content_scripts: [{
		js: ['js/manifest.js', 'js/vendor.js', 'js/inject.js'],
		run_at: 'document_end',
		matches: ['<all_urls>'],
		all_frames: true
	}],
	content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
	web_accessible_resources: ['icons/*']
};