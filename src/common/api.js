export async function translateAll(source) {
	let data = await Promise.all(
		source.map((x) => {
			return fetch(
				`https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=` + encodeURIComponent(x)
			)
				.then((x) => x.json())
				.then((x) => {
					return {target: x.translateResult[0][0].tgt};
				});
		})
	);
	return data.map((x) => x.target);
}

export async function translate(fromText) {
	let target = await translateAll([fromText]);
	return {result: target[0]};
}
