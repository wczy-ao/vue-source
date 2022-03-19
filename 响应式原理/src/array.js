import def from "./def";
import observe from "./observe";

const arrayPrototype = Array.prototype;

// 以Array.prototype为原型创建arrayMethod
export const arrayMethods = Object.create(arrayPrototype);

// 要被改写的7个数组方法
const methodsNeedChange = [
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse",
];

// 批量操作这些方法
methodsNeedChange.forEach((methodName) => {
    // 备份原来的方法
    const original = arrayPrototype[methodName];

    // 定义新的方法
    def(
        arrayMethods,
        methodName,
        function () {
            console.log("array数据已经被劫持");

            // // 恢复原来的功能(数组方法)
            const result = original.apply(this, arguments);
            // // 把类数组对象变成数组
            const args = [...arguments];

            // // 把这个数组身上的__ob__取出来
            // // 在拦截器中获取Observer的实例
            const ob = this.__ob__;

            // // 有三种方法 push、unshift、splice能插入新项，要劫持（侦测）这些数据（插入新项）
            let inserted = [];
            switch (methodName) {
                case "push":
                case "unshift":
                    inserted = arguments;
                    break;
                case "splice":
                    inserted = arguments.slice(2);
                    break;
            }

            // // 查看有没有新插入的项inserted，有的话就劫持
            if (inserted) {
                ob.observeArray(inserted);
            }

            return result;
        },
        false
    );
});