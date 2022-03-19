import {
    initState
} from './init'

function Vue(options) {
    this._init(options)
}

Vue.prototype._init = function (options) {
    var vm = this
    vm.$options = options
    // 初始化 vm
    initState(vm)
}

export default Vue