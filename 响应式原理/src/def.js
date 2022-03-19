/**
 * 定义一个对象属性
 * @param {*} obj 
 * @param {*} key 
 * @param {*} value 
 * @param {*} enumerable 
 */
export default function def(obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
        value,
        enumerable,
        writable: true,
        configurable: true,
    });
}