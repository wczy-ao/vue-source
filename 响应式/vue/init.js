import proxyData from "./proxy"
import observe from './observe'

function initState(vm) {
    var options = vm.$options

    if (options.data) {
        initData(vm)
    }
}

function initData(vm) {
    var data = vm.$options.data
    data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}

    // data属性劫持 实现 this.data.title === this.title
    for (var key in data) {
        proxyData(vm, '_data', key)
    }
    // 观察者
    observe(data)
}
export {
    initState
}