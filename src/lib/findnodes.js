const nt =
	/^[\u4E00-\u9FA5？，。·！￥……（）+｛｝【】、|《》；：“”‘’『』「」﹃﹄〔〕—～﹏\.\d\s/[\]{}$^*+|?.\-~!@#%&()_='";:><,。？！，、；：“”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]+$/;

function isText(node) {
	return node.nodeType == 3;
}

function specialTag(node) {
	return /^(svg|style|script|code)$/i.test(node.tagName) || node.hasAttribute("data-segirl-target");
}

export function isPre(node) {
	return /pre/.test(window.getComputedStyle(node).whiteSpace);
}

function _isAllChinese(content) {
	return !content || nt.test(content);
}

function isVisible(node) {
	let style = window.getComputedStyle(node);
	if (style.display == "none") return false;
	if (style.visibility == "hidden") return false;
	if (style.opacity == "0") return false;
	if (style.overflow == "visible") return true;
	return true;
}

function inScreen(node) {
	let rect = node.getBoundingClientRect();
	return (
		rect.left < rect.right &&
		rect.top < rect.bottom &&
		rect.right > 0 &&
		rect.bottom > 0 &&
		rect.left < window.innerWidth &&
		rect.top < window.innerHeight
	);
}

function onlyoneText(node) {
	let count = 0;
	for (let i = 0; i < node.childNodes.length; i++) {
		let el = node.childNodes[i];
		let text = isText(el) ? el.textContent : el.innerText;
		if (!_isAllChinese(text)) {
			count++;
			if (count > 1) return false;
		}
	}
	return count == 1;
}

function isInline(node) {
	return /inline/.test(window.getComputedStyle(node).display);
}

function hasSpecialChild(node) {
	return (
		node.querySelector("[data-segirl-target],svg,style,script,img,video,iframe,li,option") ||
		node.innerText.indexOf("\n") >= 0 ||
		onlyoneText(node)
	);
}

function skipNode(node) {
	if (node._segirl_el) return true;
	if (isText(node)) {
		return _isAllChinese(node.textContent);
	}
	return _isAllChinese(node.innerText) || specialTag(node) || !isVisible(node);
}

export function findNodes(node) {
	function dfs(node) {
		if (skipNode(node)) return [];
		if (isText(node)) {
			return [node];
		}
		if (!inScreen(node) || hasSpecialChild(node)) {
			return Array.from(node.childNodes)
				.map((x) => dfs(x))
				.flat();
		}
		return [node];
	}
	return dfs(node);
}
