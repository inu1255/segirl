type Diff<T, U> = T extends U ? never : T;
type Filter<T, U> = T extends U ? T : never;
type VueMixin = Parameters<typeof Vue.extend>[0];

interface IPromise<T> extends Promise<T> {
	resolve(x?: T): void;
	reject(e: any): void;
	pending: boolean;
	resolved: boolean;
	rejected: boolean;
}

interface Point {
	x: number;
	y: number;
}

interface Size {
	width: number;
	height: number;
}

interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface Clipboard extends EventTarget {
	read(): Promise<ClipboardItem[]>;
	write(items: ClipboardItem[]);
	readText(): Promise<string>;
	writeText(data: string): Promise<void>;
}

interface Blob {
	name?: string;
	path?: string;
	lastModified?: number;
}

type SimpleKey =
	| "Left"
	| "Right"
	| "Up"
	| "Down"
	| "Enter"
	| "Space"
	| "Backspace"
	| "Delete"
	| "Tab"
	| "Home"
	| "End"
	| "PageUp"
	| "PageDown"
	| "Esc"
	| "F1"
	| "F2"
	| "F3"
	| "F4"
	| "F5"
	| "F6"
	| "F7"
	| "F8"
	| "F9"
	| "F10"
	| "F11"
	| "F12";
type WordKey =
	| "0"
	| "1"
	| "2"
	| "3"
	| "4"
	| "5"
	| "6"
	| "7"
	| "8"
	| "9"
	| "A"
	| "B"
	| "C"
	| "D"
	| "E"
	| "F"
	| "G"
	| "H"
	| "I"
	| "J"
	| "K"
	| "L"
	| "M"
	| "N"
	| "O"
	| "P"
	| "Q"
	| "R"
	| "S"
	| "T"
	| "U"
	| "V"
	| "W"
	| "X"
	| "Y"
	| "Z";
type SymbalKey = "," | "." | "/" | ";" | "'" | "[" | "]" | "\\" | "-" | "=" | "`";
type AllKeys = SimpleKey | WordKey | SymbalKey;
type Prefix =
	| "Meta+"
	| "Ctrl+"
	| "Alt+"
	| "Shift+"
	| "Ctrl+Shift+"
	| "Ctrl+Alt+"
	| "Meta+Shift+"
	| "Meta+Alt+"
	| "";
type HotKey = `${Prefix}${AllKeys}`;

type Split<T, K extends string = ","> = T extends `${infer A}${K}${infer B}`
	? Split<A, K> | Split<B, K>
	: T;

declare var baseURL: string;

declare module "*.vue" {
	import {ComponentOptions} from "vue";
	const a: ComponentOptions<any, any, any, any, any, any>;
	export default a;
}

declare function gevt(
	name: string,
	category: string,
	label?: string,
	result?: boolean,
	value?: number
);

declare module soulsign {
	interface Task<T> {
		online_at: number; // 最近在线时间
		run_at: number; // 上次执行时间
		success_at: number; // 上次执行成功时间
		failure_at: number; // 上次执行失败时间
		result: string; // 执行结果
		enable: boolean; // 是否启动
		ok: number; // 成功次数
		cnt: number; // 失败次数
		_params: T; // 参数
		author: string; // 作者
		code: string; // 代码
		domains: string[]; // 允许域名
		expire: number; // 检查在线的频率
		loginURL: string; // 登录链接
		name: string; // 脚本名
		namespace: string; // 主页
		updateURL: string; // 更新链接
		version: string; // 版本号
		grants: string[]; // 该脚本需要的权限
		run: (param?: T) => Promise<string>; // 签到函数
		check?: (param?: T) => Promise<boolean>; // 检查是否在线函数
	}
}
