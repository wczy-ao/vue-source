import observe from "./observe";

function defineReactiveData(data, key, value) {
    // value可能是数组或者对象，所以需要递归观察value
    observe(value)
    Object.defineProperty(data, key, {
        get() {
            console.log('观察的属性是：', key);
            return value
        },
        set(newValue) {
            console.log('设置的属性值是：', value);
            if (newValue === value) return
            // 设置的值可能是对象或者数组
            observe(newValue)
            value = newValue
        }
    })
}

export default defineReactiveData