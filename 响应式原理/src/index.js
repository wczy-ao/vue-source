import observe from "./observe";


let obj = {
    a: 1,
    b: {
        c: {
            d: 4,
        },
    },
    g: [1, 2, 3, 4]
};

observe(obj);
var btn = document.querySelector("#btn")
btn.addEventListener('click', () => {
    console.log(obj.g.push([1, 2]));
})
// defineReactive(obj, "b")
// console.log(obj.b.c.d);