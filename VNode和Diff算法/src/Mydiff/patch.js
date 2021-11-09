import vnode from "./vnode";
import createElement from "./createElement";

export default function (oldVnode, newVnode) {
    debugger
    // 判断传入的第一个参数是 DOM节点 还是 虚拟节点
    if (oldVnode.sel == "" || oldVnode.sel === undefined) {
        // 说明oldVnode是DOM节点，此时要包装成虚拟节点
        oldVnode = vnode(
            oldVnode.tagName.toLowerCase(), // sel
            {}, // data
            [], // children
            undefined, // text
            oldVnode // elm
        );
    }
    // 判断 oldVnode 和 newVnode 是不是同一个节点
    if (oldVnode.key === newVnode.key && oldVnode.sel === newVnode.sel) {
        console.log("是同一个节点，需要精细化比较");
    } else {
        console.log("不是同一个节点，暴力 插入新节点，删除旧节点");
        // 创建 新虚拟节点 为 DOM节点
        // 要操作DOM，所以都要转换成 DOM节点
        let newVnodeElm = createElement(newVnode);
        let oldVnodeElm = oldVnode.elm;
        // 插入 新节点 到 旧节点 之前
        if (newVnodeElm) {
            // 判断newVnodeElm是存在的 在旧节点之前插入新节点
            oldVnodeElm.parentNode.insertBefore(newVnodeElm, oldVnodeElm);
        }
        // 删除旧节点
        oldVnodeElm.parentNode.removeChild(oldVnodeElm);
    }
}