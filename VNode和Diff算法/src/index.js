import h from "./Mydiff/h";
import patch from "./Mydiff/patch";

let container = document.getElementById("container");
// let btn = document.getElementById("btn");

// const myVnode1 = h("h1", {}, "你好");

const myVnode1 = h("p", {}, [
    h('p', {}, '我是'),
    h('div', {}, [
        h('ul', {}, [
            h('li', {}, "222")
        ])
    ])
]);

// 上树
patch(container, myVnode1);