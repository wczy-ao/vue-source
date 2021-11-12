let uid = 0;
/**
 * Dep类专门帮助我们管理依赖，可以收集依赖，删除依赖，向依赖发送通知等
 */
export default class Dep {
    constructor() {
        console.log("Dep");
        this.id = uid++;
        // 用数组存储自己的订阅者，放的是Watcher的实例
        this.subs = [];
    }

    // 添加订阅
    addSub(sub) {
        this.subs.push(sub);
    }

    // 删除订阅
    removeSub(sub) {
        remove(this.subs, sub);
    }

    // 添加依赖
    depend() {
        // Dep.target 是一个我们指定的全局的位置，用window.target也行，只要是全局唯一，没有歧义就行
        if (Dep.target) {
            this.addSub(Dep.target);
        }
    }

    // 通知更新
    notify() {
        console.log("notify");
        // 浅拷贝一份
        const subs = this.subs.slice();
        // 遍历
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update();
        }
    }
}

/**
 * 从arr数组中删除元素item
 * @param {*} arr 
 * @param {*} item
 * @returns 
 */
// function remove(arr, item) {
//   if (arr.length) {
//     const index = arr.indexOf(item);
//     if (index > -1) {
//       return arr.splice(index, 1);
//     }
//   }
// }