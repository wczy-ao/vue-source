import h from "./mysnabbdom/h";

const myVnode1 = h("div", {}, [
            h("p", {}, "嘻嘻"),
            h("p", {}, "哈哈"),
            h("p", {}, h('span', {}, '呵呵')),
]);
// const myVnode1 = h("div", {}, '哈哈哈');
console.log(myVnode1);