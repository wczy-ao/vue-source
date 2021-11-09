import h from "./Mydiff/h";
import patch from "./Mydiff/patch";

let container = document.getElementById("container");
// let btn = document.getElementById("btn");

// const myVnode1 = h("h1", {}, "你好");

const myVnode1 = h("p", {}, "hahaha");

// 上树
patch(container, myVnode1);