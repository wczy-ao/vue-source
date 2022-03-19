import {
    ARR_METHODS
} from "./config";
import Observer from "./observer";
import observeArray from "./observer";

/**
 * 对应七个会影响数组的方法进行了改写；主要是以下几点
 * 
 * 1：改写的方法实际进行的的是原生的方法
 * 2：对新添加进来的数据进行观察
 * 3：将7个方法添加到 属性对应的数组的原型上去，这样调用的就是改写的数组方法
 */
var originArrMethods = Array.prototype,
    arrMethods = Object.create(originArrMethods)

ARR_METHODS.map(m => {
    arrMethods[m] = function () {
        var args = Array.prototype.slice.call(arguments),
            result = originArrMethods[m].apply(this, args)

        var newArr
        // 这三个方法有增加的数据进来
        switch (m) {
            case 'push':
            case 'unshift':
                newArr = args
                break;
            case 'splice':
                newArr = args.slice(2)
                break;
            default:
                break;
        }

        newArr && observeArray(newArr)

        return result
    }


})

export {
    // 返回改写的数组方法
    arrMethods
}