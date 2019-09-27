import axios from 'axios';
const cache = {};

export default function(url) {
    if (cache[url])
        return Promise.resolve(cache[url]);
    return axios.get(url).then(function({ data }) {
		let module = { exports: {} };
        new Function('exports', 'module', data)(module.exports, module);
        return cache[url] = module.exports;
    });
}