import defineReactiveData from './reactive'
import observeArray from './observeArray'
import {
    arrMethods
} from './array'

function Observer(data) {
    if (Array.isArray(data)) {
        // 数组方法的劫持
        data.__proto__ = arrMethods
        observeArray(data)
    } else {
        this.walk(data)
    }
}

Observer.prototype.walk = function (data) {
    var keys = Object.keys(data)
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i],
            value = data[key];
        // 对象属性响应式
        defineReactiveData(data, key, value)
    }
}
export default Observer