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
obj.g.unshift(45)
console.log(obj.g);

// var btn = document.querySelector("#btn")
// btn.addEventListener('click', () => {
//     obj.b.c.d = 8
//     console.log(obj.b.c.d);
// })
// console.log(obj);
// defineReactive(obj, "b")
// console.log(obj.b.c.d);

// -------------------------------------------------------------------------------
