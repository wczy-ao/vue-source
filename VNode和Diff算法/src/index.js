import h from "./Mydiff/h";
import patch from "./Mydiff/patch";

let container = document.getElementById("container");
let btn = document.getElementById("btn");

const myVnode1 = h("ul", {}, [
    h("li", {
        key: 'A'
    }, "A"),
    h("li", {
        key: 'H'
        }, "H"),
        h("li", {
        key: 'B'
    }, "B"),
    h("li", {
        key: 'C'
    }, "C"),
    h("li", {
        key: 'D'
    }, "D"),
])
// 上树
patch(container, myVnode1);
const myVnode2 = h("ul", {}, [

    h("li", {
        key: 'C'
    }, "C"),
    h("li", {
        key: 'D'
    }, "D"),
    h("li", {
        key: 'A'
    }, "A"),
    h("li", {
        key: 'B'
    }, "B"),
    h("li", {
        key: 'E'
    }, "E"),
]);

btn.onclick = function () {
    patch(myVnode1, myVnode2);
}
