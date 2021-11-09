import vnode from "./vnode";
/**
 * 产生虚拟DOM树，返回的一个对象
 * 低配版本的h函数，这个函数必须接受三个参数，缺一不可
 * @param {*} sel
 * @param {*} data
 * @param {*} c
 * 调用只有三种形态 文字、数组、h函数
 * ① h('div', {}, '文字')
 * ② h('div', {}, [])
 * ③ h('div', {}, h())
 */
export default function (sel, data, c) {
    // 检查参数个数
    if (arguments.length !== 3) {
        throw new Error("请传且只传入三个参数！");
    }
    // 检查第三个参数 c 的类型
    if (typeof c === "string" || typeof c === "number") {
        // 说明现在是 ① 文字
        return vnode(sel, data, undefined, c, undefined);
    } else if (Array.isArray(c)) {
        // 说明是 ② 数组
        let children = [];
        // 遍历 c 数组
        for (let item of c) {
            if (!(typeof item === "object" && item.hasOwnProperty("sel"))) {
                throw new Error("传入的数组有不是h函数的项");
            }
            // 不用执行item, 只要收集数组中的每一个对象
            children.push(item);
        }
        return vnode(sel, data, children, undefined, undefined);
    } else if (typeof c === "object" && c.hasOwnProperty("sel")) {
        // 说明是 ③ h函数 是一个对象（h函数返回值是一个对象）放到children数组中就行了
        let children = [c];
        return vnode(sel, data, children, undefined, undefined);
    } else {
        throw new Error("传入的参数类型不对！");
    }
}
