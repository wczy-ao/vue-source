# diff算法和VNode

本文结构顺序：

- snabbdom简介
- snabbdom的h函数如何工作
- diif算法原理
- 手写diff算法



> 提前说明  虚拟DOM

本节不涉及真实DOM如何变成虚拟DOM，这个属于模板编译原理

![](E:\vue-source\VNode和Diff算法\images\真实DOM与虚拟DOM.jpg)



## snabbdom简介

### snabbdom库

`snabbdom`(瑞典语，“速度”)是著名的**虚拟DOM库**，是diff算法的鼻祖；**vue源码**也是借鉴了这个库；

snabbdom库的源码用的是ts： https://github.com/snabbdom/snabbdom 

### 配置

```js
// 必须是 webpack5 
npm insatll webpack@5 webpack-cli@3 webpack-dev-server@3
// 安装 snabbdom 库
npm install snabbdom -D
```

> package.json

```js
{
  "name": "diff",
  "version": "1.0.0",
  "description": "`snabbdom`(瑞典语，“速度”)是著名的虚拟DOM库，是diff算法的鼻祖；vue源码也是借鉴了这个库；",
  "main": "index.js",
  "scripts": {
    "dev": "webpack-dev-server"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "snabbdom": "^3.1.0",
    "webpack": "^5.62.1",
    "webpack-cli": "^3.3.12",
    "webpack-dev-server": "^3.11.2"
  }
}
```

> webpack.config.js

```js
module.exports = {
    entry: './src/index.js',
    output: {
        publicPath: 'xuni',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: 'www',
        port: 8080
    }
}
```

> `src/index.js`

```js
// 这个文件代码都是 https://github.com/snabbdom/snabbdom 库中的例子，能跑通就ok
import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
} from "snabbdom";

const patch = init([
    // Init patch function with chosen modules
    classModule, // makes it easy to toggle classes
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
    eventListenersModule, // attaches event listeners
]);

const container = document.getElementById("container");

const vnode = h("div#container.two.classes", {
    on: {
        click: function () {}
    }
}, [
    h("span", {
        style: {
            fontWeight: "bold"
        }
    }, "This is bold"),
    " and this is just normal text",
    h("a", {
        props: {
            href: "/foo"
        }
    }, "I'll take you places!"),
]);
// Patch into empty DOM element – this modifies the DOM as a side effect
patch(container, vnode);

const newVnode = h(
    "div#container.two.classes", {
        on: {
            click: function () {}
        }
    },
    [
        h(
            "span", {
                style: {
                    fontWeight: "normal",
                    fontStyle: "italic"
                }
            },
            "This is now italic type"
        ),
        " and this is still just normal text",
        h("a", {
            props: {
                href: "/bar"
            }
        }, "I'll take you places!"),
    ]
);
// Second `patch` invocation
patch(vnode, newVnode); // Snabbdom efficiently updates the old view to the new state
```

### 测试

> 我们自己提供h函数参数，看是否能够展示

`src/index.js`

```js
import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
} from "snabbdom";

const patch = init([
    // Init patch function with chosen modules
    classModule, // makes it easy to toggle classes
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
    eventListenersModule, // attaches event listeners
]);

const container = document.getElementById("container");
var myVnode = h('a', {
    props: {
        href: 'https://www.baidu.com/'
    }
}, '百度一下，你就知道') // 获取虚拟节点

patch(container, myVnode); // 虚拟节点挂载到dom树上
```

虚拟节点属性

![](E:\vue-source\VNode和Diff算法\images\虚拟节点对象.jpg)

## 学习diff算法

### h函数

h函数的作用就是用来产生虚拟节点（vnode）

```js
const myVnode1 = h("div", {}, [
            h("p", {}, "嘻嘻"),
            h("p", {}, "哈哈"),
            h("p", {}, h('span', {}, '呵呵')),
]);

// vnode对象属性
{
	children: undefined// 子元素 数组
	data: {} // 属性、样式、key
	elm: undefined // 对应的真正的dom节点(对象)，undefined表示节点还没有上dom树
	key: // 唯一标识
	sel: "" // 选择器
	text: "" // 文本内容
}
```

### 手动实现低配版本h函数

> 这个地方的难点可能在于`h('div', {}, [])`第三个参数具有多层嵌套`h()`，但不管怎么嵌套，它都得先执行h方法，数组中得到的就是vnode

`h.js`

```js
import vnode from "./vnode";
/**
 * 产生虚拟DOM树，返回的一个对象
 * 低配版本的h函数，这个函数必须接受三个参数，缺一不可
 * @param {*} sel
 * @param {*} data
 * @param {*} c
 * 调用只有三种形态 文字、数组、h函数
 * ① h('div', {}, '文字')
 * ② h('div', {}, [])
 * ③ h('div', {}, h())
 */
export default function (sel, data, c) {
    // 检查参数个数
    if (arguments.length !== 3) {
        throw new Error("请传且只传入三个参数！");
    }
    // 检查第三个参数 c 的类型
    if (typeof c === "string" || typeof c === "number") {
        // 说明现在是 ① 文字
        return vnode(sel, data, undefined, c, undefined);
    } else if (Array.isArray(c)) {
        // 说明是 ② 数组
        let children = [];
        // 遍历 c 数组
        for (let item of c) {
            if (!(typeof item === "object" && item.hasOwnProperty("sel"))) {
                throw new Error("传入的数组有不是h函数的项");
            }
            // 不用执行item, 只要收集数组中的每一个对象
            children.push(item);
        }
        return vnode(sel, data, children, undefined, undefined);
    } else if (typeof c === "object" && c.hasOwnProperty("sel")) {
        // 说明是 ③ h函数 是一个对象（h函数返回值是一个对象）放到children数组中就行了
        let children = [c];
        return vnode(sel, data, children, undefined, undefined);
    } else {
        throw new Error("传入的参数类型不对！");
    }
}
```

`vnode.js`

> 上面的h方法主要是用来解决多层嵌套的问题，而返回vnode对象其实很简单

```js
/**
 * 产生虚拟节点
 * 将传入的参数组合成对象返回
 * @param {string} sel 选择器
 * @param {object} data 属性、样式
 * @param {Array} children 子元素
 * @param {string|number} text 文本内容
 * @param {object} elm 对应的真正的dom节点(对象)，undefined表示节点还没有上dom树
 * @returns 
 */
export default function (sel, data, children, text, elm) {
    const key = data.key;
    return {
        sel,
        data,
        children,
        text,
        elm,
        key
    };
}
```

### patch

> patch就是将vnode挂载到真实DOM上

```js
const container = document.getElementById("container");
var myVnode = h('ul', {}, [h('li', {}, 222)])
// 将h函数返回的vnode挂载到真实dom上
patch(container, myVnode); // 页面展示
```

通过snabbdom的源码，我们可以知道patch的是怎么一个流程：

![](E:\vue-source\VNode和Diff算法\images\patch方法源码.jpg)

![](E:\vue-source\VNode和Diff算法\images\patch方法的主要流程.png)

因此我们的手动实现patch也是基于这个流程；

### 手动实现低版本patch

#### 预备知识

1. Element.tagName：返回当前元素的标签名，是大写形式；
2. Node.removeChild：从DOM中删除一个子节点。返回删除的节点
3. Node.insertBefore()：在当前节点下增加一个子节点 `Node`
4. Node.appendChild()：将一个节点附加到指定父节点的子节点列表的末尾处。
5. document.createElement：创建新元素

#### 同一层的vnode判断

> sameVnode方法可以看到，会把新旧vnode的key，sel（选择器）进行判断

```ts
function sameVnode(vnode1: VNode, vnode2: VNode): boolean {
  const isSameKey = vnode1.key === vnode2.key;
  const isSameSel = vnode1.sel === vnode2.sel;
  return isSameSel && isSameKey;
}
```



