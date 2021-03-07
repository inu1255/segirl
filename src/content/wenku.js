import {sleep, download} from "../common/utils";

async function run() {
	if (location.host == "wenku.baidu.com" && location.pathname.startsWith("/view/")) {
		let pages;
		pages = document.querySelectorAll("[id^=pageNo]");
		while (!pages.length) {
			await sleep(300);
			pages = document.querySelectorAll(".bd[id^=page]");
		}
		window.scrollTo(0, 0);
		(document.querySelector(".moreBtn") || document.querySelector(".read-all")).click();
		console.log(`共${pages.length}页`);
		pages = Array.from(pages);
		let html = "";
		for (let i = 0; i < pages.length; i++) {
			let el = pages[i];
			let txt = el.querySelector(".reader-txt-layer .ie-fix");
			while (!txt) {
				window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY, behavior: "auto"});
				await sleep(300);
				txt = el.querySelector(".reader-txt-layer .ie-fix");
			}
			html += txt.innerText.replace(/\n\s*\n/g, "\n").replace(/（\s*(\d)\s*）\n?/g, "（$1）").replace(/(\d)\n）/g, '$1）').replace(/：\s*(\d+)\s*年\s*(\d+)\s*月/g, '：$1年$2月');
			console.log(`成功读取第${i + 1}页`);
		}
		download(html, document.title + ".txt");
	}
};

var div = document.createElement('div')
div.addEventListener('click', run)
div.setAttribute('style', 'position:fixed;z-index:10000;bottom:0;right:0;padding:20px;background:red;')
div.innerHTML = '下载文本'
console.log(div)
