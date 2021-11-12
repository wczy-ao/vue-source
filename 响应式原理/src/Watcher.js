import Dep from "./Dep";

let uid = 0;
/**
 * Watcher是一个中介的角色，数据发生变化时通知它，然后它再通知其他地方
 */
export default class Watcher {
    constructor(target, expression, callback) {
        console.log("Watcher");
        this.id = uid++;
        this.target = target;
        // 按点拆分  执行this.getter()就可以读取data.a.b.c的内容
        this.getter = parsePath(expression);
        this.callback = callback;
        this.value = this.get();
    }

    get() {
        // 进入依赖收集阶段。
        // 让全局的Dep.target设置为Watcher本身
        Dep.target = this;
        const obj = this.target;
        var value;
        // 只要能找就一直找
        try {
            value = this.getter(obj);
        } finally {
            Dep.target = null;
        }
        return value;
    }

    update() {
        this.run();
    }

    run() {
        this.getAndInvoke(this.callback);
    }
    getAndInvoke(callback) {
        const value = this.get();
        if (value !== this.value || typeof value === "object") {
            const oldValue = this.value;
            this.value = value;
            callback.call(this.target, value, oldValue);
        }
    }
}

/**
 * 将str用.分割成数组segments，然后循环数组，一层一层去读取数据，最后拿到的obj就是str中想要读的数据
 * @param {*} str
 * @returns
 */
function parsePath(str) {
    let segments = str.split(".");
    return function (obj) {
        for (let key of segments) {
            if (!obj) return;
            obj = obj[key];
        }
        return obj;
    };
}