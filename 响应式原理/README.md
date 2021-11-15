数据属性和访问器属性

闭包

现在我们把目光集中到页面的初次渲染过程中(暂时忽略渲染函数和虚拟DOM等部分)：渲染引擎会解析模板，比如引擎遇到了一个插值表达式，如果我们此时实例化一个watcher，会发生什么事情呢？从Watcher的代码中可以看到，实例化时会执行get方法，get方法的作用就是获取自己依赖的数据，而我们重写了数据的访问行为，为每个数据定义了getter，因此getter函数就会执行，如果我们在getter中把当前的watcher添加到dep数组中(淘宝低登记买家信息)，不就能够完成依赖收集了吗！！


https://segmentfault.com/a/1190000019700618





# 响应式原理

## 什么是响应式？

我们在使用[Vue](https://so.csdn.net/so/search?from=pc_blog_highlight&q=Vue)时，只需要修改数据，视图就会自动更新，这就是数据响应

## 响应式原理

我么在回答响应式原理之前先思考vue做了什么？

- 侦测数据的变化
- 收集视图依赖了哪些数据
- 数据变化时，自动“通知”需要更新的视图部分，并进行更新

对应专业术语分别是：

- 数据劫持 / 数据代理
- 依赖收集
- 发布订阅模式

ok，我们先从官方的文档中找到vue响应式原理的答案：

当你把一个普通的 JavaScript 对象传入 Vue 实例作为 `data` 选项，Vue 将遍历此对象所有的 property，并使用 [`Object.defineProperty`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 把这些 property 全部转为 [getter/setter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_Objects#定义_getters_与_setters)。（vue3用的是proxy）

接下来我们深入了解vue是如何做到响应式的！

## 手动实现响应式

### 数据劫持

#### `Object.definProperty`

这个方法的弊端很明显，无法记录改变的值，有两个方法可以解决，闭包或者全局变量，我们使用闭包

```js
let obj = {};
Object.defineProperty(obj, "a", {
    get(value) {
        console.log("getter试图访问obj的a属性");
        return value;
    },
    set(newValue) {
        console.log("setter试图改变obj的a属性", newValue);
    },
});
console.log(obj.a);// undefined
obj.a = 5;
console.log(obj.a);// undefined
```

#### 闭包的`defineReactive`

```js
function defineReactive(data, key, value) {
    Object.defineProperty(data, key, {
        // 可枚举 可以for-in
        enumerable: true,
        // 可被配置，比如可以被delete
        configurable: true,
        // getter
        get() {
            console.log(`getter试图访问obj的${key}属性`);
            return value;
        },
        // setter
        set(newValue) {
            console.log(`setter试图改变obj的${key}属性`, newValue);
            if (value === newValue) return;
            value = newValue;
        },
    });
}
let obj = {};
// 初始化
defineReactive(obj, "a", 10);
console.log(obj.a); // 10
obj.a = 5;
console.log(obj.a); // 5  不会丢失数据
```

但是上述代码有一个问题，没办法访问深层的数据；如：

```js
let obj = {
    a: {
        c: 3
    }
};
defineReactive(obj, "a");
console.log(obj.a.c); // undefined
```

所以我们要创建一个`Observer`类 ——> 将一个正常的object转换为每个层级的属性都是响应式（可以被侦测）的object

#### `Observer`类

![](E:\vue-source\响应式原理\images\Observer的作用.png)

Observer 类会附加到每一个被侦测的object上

一旦被附加，Observer会将object所有属性转换成getter/setter的形式

`__ob__`的作用可以用来标记当前value是否已经被Observer转换成了响应式数据了；而且可以通过`value.__ob__`来访问Observer的实例

`Observer`

```JS
import def from "./def";
import defineReactive from "./defineReactive";
/**
 * 将一个正常的object转换为每个层级的属性都是响应式（可以被侦测）的object
 */
export default class Observer {
  // 构造器
  constructor(value) {
    // 给实例添加__ob__属性，值是当前Observer的实例，不可枚举
    def(value, "__ob__", this, false);
    
    console.log("Observer构造器", value);
    
    // 将一个正常的object转换为每个层级的属性都是响应式（可以被侦测）的object
    this.walk(value);
  }
  // 遍历value的每一个key
  walk(value) {
    for (let key in value) {
      defineReactive(value, key);
    }
  }
}
```

`def.js`

```js
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
```



#### 创建`observe.js`

> 监听 value
> 尝试创建Observer实例，如果value已经是响应式数据，就不需要再创建Observer实例，直接返回已经创建的Observer实例即可，避免重复侦测value变化的问题

```js
import Observer from "./Observer";
/**
 * 监听 value
 * @param {*} value 
 * @returns 
 */
export default function observe(value) {
  // 如果value不是对象，就什么都不做
  if (typeof value != "object") return;
  let ob;
  if (typeof value.__ob__ !== "undefined") {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  return ob;
}
```

https://blog.csdn.net/weixin_44972008/article/details/115922118