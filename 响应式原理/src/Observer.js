import def from "./def";
import observe from "./observe";
import defineReactive from "./defineReactive";
import {
    arrayMethods
} from './array'
// import Dep from "./Dep";
/**
 * 将一个正常的object转换为每个层级的属性都是响应式（可以被侦测）的object
 */
export default class Observer {
    // 构造器
    constructor(value) {
        // 给实例添加__ob__属性，值是当前Observer的实例，不可枚举
        def(value, "__ob__", this, false);
        // this.dep = new Dep()
        // console.log("Observer构造器", value);

        // 将一个正常的object转换为每个层级的属性都是响应式（可以被侦测）的object
        if (Array.isArray(value)) {
            Object.setPrototypeOf(value, arrayMethods);
        } else {
            this.walk(value);
        }
    }
    // 遍历value的每一个key
    walk(value) {
        for (let key in value) {
            defineReactive(value, key);
        }
    }
    // 数组的遍历方式
    observeArray(arr) {
        for (let i = 0, l = arr.length; i < l; i++) {
            // 逐项进行observe
            observe(arr[i]);
        }
    }
}