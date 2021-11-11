import observe from "./observe";


let obj = {
    a: 1,
    b: {
        c: {
            d: 4,
        },
    },
};

observe(obj);
var btn = document.querySelector("#btn")
btn.addEventListener('click', () => {
    console.log(obj.b.c.d);
})
// defineReactive(obj, "b")
// console.log(obj.b.c.d);