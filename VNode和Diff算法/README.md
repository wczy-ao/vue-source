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

#### 实现

##### 判断oldVnode是虚拟节点还是DOM

> `oldVnode.sel == "" || oldVnode.sel === undefined`

```js
// 判断传入的第一个参数是 DOM节点 还是 虚拟节点
  if (oldVnode.sel == "" || oldVnode.sel === undefined) {
    // 说明oldVnode是DOM节点，此时要包装成虚拟节点
    oldVnode = vnode(
      oldVnode.tagName.toLowerCase(), // sel
      {}, // data
      [], // children
      undefined, // text
      oldVnode // elm
    );
  }
```

##### 同一层的vnode判断

> sameVnode方法可以看到，会把新旧vnode的key，sel（选择器）进行判断

```ts
// 判断 oldVnode 和 newVnode 是不是同一个节点
  if (oldVnode.key === newVnode.key && oldVnode.sel === newVnode.sel) {
    console.log("是同一个节点，需要精细化比较");
  }
```

##### 不是同一层---暴力删除

```js
    // 创建 新虚拟节点 为 DOM节点
    // 要操作DOM，所以都要转换成 DOM节点
    let newVnodeElm = createElement(newVnode);
    let oldVnodeElm = oldVnode.elm;
    // 插入 新节点 到 旧节点 之前
    if (newVnodeElm) {
      // 判断newVnodeElm是存在的 在旧节点之前插入新节点
      oldVnodeElm.parentNode.insertBefore(newVnodeElm, oldVnodeElm);
    }
    // 删除旧节点
    oldVnodeElm.parentNode.removeChild(oldVnodeElm);
```

`createElement.js`

> 返回的是真实DOM节点

```js
/**
 * 创建节点。将vnode虚拟节点创建为DOM节点
 * 是孤儿节点，不进行插入操作
 * @param {object} vnode
 */
export default function createElement(vnode) {
    // 根据虚拟节点sel选择器属性 创建一个DOM节点，这个节点现在是孤儿节点
    let domNode = document.createElement(vnode.sel);
    // 判断是有子节点还是有文本
    if (
        vnode.text !== "" &&
        (vnode.children === undefined || vnode.children.length === 0)
    ) {
        // 说明没有子节点，内部是文本
        domNode.innerText = vnode.text;
    } else if (Array.isArray(vnode.children) && vnode.children.length > 0) {
        // 说明内部是子节点，需要递归创建节点 
        // 遍历数组
        for (let ch of vnode.children) {
            // 递归调用 创建出它的DOM，一旦调用createElement意味着创建出DOM了。并且它的elm属性指向了创建出的dom，但是没有上树，是一个孤儿节点
            let chDOM = createElement(ch); // 得到 子节点 表示的 DOM节点 递归最后返回的一定是文本节点
            // 文本节点 上domNode树
            domNode.appendChild(chDOM);
        }
    }
    // 补充虚拟节点的elm属性
    vnode.elm = domNode;
    // 返回domNode DOM对象
    return domNode;
}
```

##### 同一层---精细化比较

![](E:\vue-source\VNode和Diff算法\images\精细化处理.jpg)



1. 新旧Vnode的text属性

   1. 新旧都有text属性（既无children属性）

      > 直接替换（相同就不处理）

   2. 新的Vnode没有text属性，旧的有text属性

      > 旧的的text直接清空，遍历新Vnode的children，创建DOM节点上树

2. 新旧Vnode的children属性（最最麻烦）

   1. 四种比较，一种循环

      1. 《新前》与《新前》
      2. 《新后》与《旧后》
      3. 《新后》与《旧前》（《新前指向的节点，移动到《旧后》之后）
      4. 《新前》与《旧后》（《新前指向的节点，移动到《旧前》之前）

      > 命中一种就不再进行命中判断了

      如果都没有命中就遍历旧Vnode，移动到《旧前》之前

------



> 写在前面的话，不要去问为什么，先把这种逻辑看明白

###### 四种比较

- 《新前》与《新前》

![](E:\vue-source\VNode和Diff算法\images\新前与旧前.png)

```js
if (checkSameVnode(oldStartVnode, newStartVnode)) {
    // 新前与旧前
    console.log(" ①1 新前与旧前 命中");
    // 精细化比较两个节点 oldStartVnode现在和newStartVnode一样了
    patchVnode(oldStartVnode, newStartVnode);
    // 移动指针，改变指针指向的节点，这表示这两个节点都处理（比较）完了
    oldStartVnode = oldCh[++oldStartIdx];
    newStartVnode = newCh[++newStartIdx];
}
```



- 《新后》与《旧后》

![](E:\vue-source\VNode和Diff算法\images\新后与旧后.png)

```js
if (checkSameVnode(oldEndVnode, newEndVnode)) {
    patchVnode(oldEndVnode, newEndVnode);
    oldEndVnode = oldCh[--oldEndIdx];
    newEndVnode = newCh[--newEndIdx];
}
```



- 《新后》与《旧前》

![](E:\vue-source\VNode和Diff算法\images\新后与旧前.png)

```js
if (checkSameVnode(oldStartVnode, newEndVnode)) {
    // 新后与旧前
    console.log(" ③3 新后与旧前 命中");
    patchVnode(oldStartVnode, newEndVnode);
    // 当③新后与旧前命中的时候，此时要移动节点。移动 新后指向的这个节点到旧后的后面
    parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
    oldStartVnode = oldCh[++oldStartIdx];
    newEndVnode = newCh[--newEndIdx];
}
```

![](E:\vue-source\VNode和Diff算法\images\新后与旧前的复杂情况.png)



- 《新前》与《旧后》

  ![](E:\vue-source\VNode和Diff算法\images\《新前》与《旧后》.png)

```js
if (checkSameVnode(oldEndVnode, newStartVnode)) {
    // 新前与旧后
    console.log(" ④4 新前与旧后 命中");
    patchVnode(oldEndVnode, newStartVnode);
    // 当④新前与旧后命中的时候，此时要移动节点。移动 新前指向的这个节点到旧前的前面
    parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
    oldEndVnode = oldCh[--oldEndIdx];
    newStartVnode = newCh[++newStartIdx];
}
```

###### 一种循环

![](E:\vue-source\VNode和Diff算法\images\一种循环.png)

```js
// 四种都没有匹配到，都没有命中
// 寻找 keyMap 一个映射对象， 就不用每次都遍历old对象了
if (!keyMap) {
  keyMap = {};
  // 记录oldVnode中的节点出现的key
  // 从oldStartIdx开始到oldEndIdx结束，创建keyMap
  for (let i = oldStartIdx; i <= oldEndIdx; i++) {
    const key = oldCh[i].key;
    if (key !== undefined) {
      keyMap[key] = i;
    }
  }
}
// 寻找当前项（newStartIdx）在keyMap中映射的序号
const idxInOld = keyMap[newStartVnode.key];
if (idxInOld === undefined) {
  // 如果 idxInOld 是 undefined 说明是全新的项，要插入
  // 被加入的项（就是newStartVnode这项)现不是真正的DOM节点
  parentElm.insertBefore(createElement(newStartVnode), oldStartVnode.elm);
} else {
  // 说明不是全新的项，要移动
  const elmToMove = oldCh[idxInOld];
  patchVnode(elmToMove, newStartVnode);
  // 把这项设置为undefined，表示我已经处理完这项了
  oldCh[idxInOld] = undefined;
  // 移动，调用insertBefore也可以实现移动。
  parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm);
}

// newStartIdx++;
newStartVnode = newCh[++newStartIdx];
```

------



> 循环结束

- 新节点中剩余的都 **插入** 旧节点oldEnd后面 或 oldStart之前

![](E:\vue-source\VNode和Diff算法\images\新增旧前之前.png)

![](E:\vue-source\VNode和Diff算法\images\新增旧前之后.png)

------

- oldVnode中还有剩余节点

![](E:\vue-source\VNode和Diff算法\images\删除节点.png)

```js
// 循环结束
if (newStartIdx <= newEndIdx) {
  // 说明newVndoe还有剩余节点没有处理，所以要添加这些节点
  for (let i = newStartIdx; i <= newEndIdx; i++) {
    // insertBefore方法可以自动识别null，如果是null就会自动排到队尾，和appendChild一致
    parentElm.insertBefore(createElement(newCh[i]), oldCh[oldStartIdx].elm);
  }
} else if (oldStartIdx <= oldEndIdx) {
  // 说明oldVnode还有剩余节点没有处理，所以要删除这些节点
  for (let i = oldStartIdx; i <= oldEndIdx; i++) {
    if (oldCh[i]) {
      parentElm.removeChild(oldCh[i].elm);
    }
  }
}
```

###### 精细化比较---完整代码

`updateChildren.js`

```js
import createElement from "./createElement";
import patchVnode from "./patchVnode";
/**
 * 
 * @param {object} parentElm Dom节点
 * @param {Array} oldCh oldVnode的子节点数组
 * @param {Array} newCh newVnode的子节点数组
 */
export default function updateChildren(parentElm, oldCh, newCh) {
  console.log("updateChildren()");
  console.log(oldCh, newCh);

  // 四个指针
  // 旧前
  let oldStartIdx = 0;
  // 新前
  let newStartIdx = 0;
  // 旧后
  let oldEndIdx = oldCh.length - 1;
  // 新后
  let newEndIdx = newCh.length - 1;

  // 指针指向的四个节点
  // 旧前节点
  let oldStartVnode = oldCh[0];
  // 旧后节点
  let oldEndVnode = oldCh[oldEndIdx];
  // 新前节点
  let newStartVnode = newCh[0];
  // 新后节点
  let newEndVnode = newCh[newEndIdx];

  let keyMap = null;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    console.log("**循环中**");
    // 首先应该不是判断四种命中，而是略过已经加了undefined标记的项
    if (oldStartVnode === null || oldCh[oldStartIdx] === undefined) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (oldEndVnode === null || oldCh[oldEndIdx] === undefined) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode === null || newCh[newStartIdx] === undefined) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode === null || newCh[newEndIdx] === undefined) {
      newEndVnode = newCh[--newEndIdx];
    } else if (checkSameVnode(oldStartVnode, newStartVnode)) {
      // 新前与旧前
      console.log(" ①1 新前与旧前 命中");
      // 精细化比较两个节点 oldStartVnode现在和newStartVnode一样了
      patchVnode(oldStartVnode, newStartVnode);
      // 移动指针，改变指针指向的节点，这表示这两个节点都处理（比较）完了
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (checkSameVnode(oldEndVnode, newEndVnode)) {
      // 新后与旧后
      console.log(" ②2 新后与旧后 命中");
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (checkSameVnode(oldStartVnode, newEndVnode)) {
      // 新后与旧前
      console.log(" ③3 新后与旧前 命中");
      patchVnode(oldStartVnode, newEndVnode);
      // 当③新后与旧前命中的时候，此时要移动节点。移动 新后（旧前） 指向的这个节点到老节点的 旧后的后面
      // 移动节点：只要插入一个已经在DOM树上 的节点，就会被移动
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (checkSameVnode(oldEndVnode, newStartVnode)) {
      // 新前与旧后
      console.log(" ④4 新前与旧后 命中");
      patchVnode(oldEndVnode, newStartVnode);
      // 当④新前与旧后命中的时候，此时要移动节点。移动 新前（旧后） 指向的这个节点到老节点的 旧前的前面
      // 移动节点：只要插入一个已经在DOM树上的节点，就会被移动
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      // 四种都没有匹配到，都没有命中
      console.log("四种都没有命中");
      // 寻找 keyMap 一个映射对象， 就不用每次都遍历old对象了
      if (!keyMap) {
        keyMap = {};
        // 记录oldVnode中的节点出现的key
        // 从oldStartIdx开始到oldEndIdx结束，创建keyMap
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
          const key = oldCh[i].key;
          if (key !== undefined) {
            keyMap[key] = i;
          }
        }
      }
      console.log(keyMap);
      // 寻找当前项（newStartIdx）在keyMap中映射的序号
      const idxInOld = keyMap[newStartVnode.key];
      if (idxInOld === undefined) {
        // 如果 idxInOld 是 undefined 说明是全新的项，要插入
        // 被加入的项（就是newStartVnode这项)现不是真正的DOM节点
        parentElm.insertBefore(createElement(newStartVnode), oldStartVnode.elm);
      } else {
        // 说明不是全新的项，要移动
        const elmToMove = oldCh[idxInOld];
        patchVnode(elmToMove, newStartVnode);
        // 把这项设置为undefined，表示我已经处理完这项了
        oldCh[idxInOld] = undefined;
        // 移动，调用insertBefore也可以实现移动。
        parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm);
      }

      // newStartIdx++;
      newStartVnode = newCh[++newStartIdx];
    }
  }
  // 循环结束
  if (newStartIdx <= newEndIdx) {
    // 说明newVndoe还有剩余节点没有处理，所以要添加这些节点
    // // 插入的标杆
    // const before =
    //   newCh[newEndIdx + 1] === null ? null : newCh[newEndIdx + 1].elm;
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      // insertBefore方法可以自动识别null，如果是null就会自动排到队尾，和appendChild一致
      parentElm.insertBefore(createElement(newCh[i]), oldCh[oldStartIdx] ? oldCh[oldStartIdx].elm : null);
    }
  } else if (oldStartIdx <= oldEndIdx) {
    // 说明oldVnode还有剩余节点没有处理，所以要删除这些节点
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      if (oldCh[i]) {
        parentElm.removeChild(oldCh[i].elm);
      }
    }
  }
}

// 判断是否是同一个节点
function checkSameVnode(a, b) {
  return a.sel === b.sel && a.key === b.key;
}
```

> 这个时候就完成了diff算法代码了，虽然逻辑还算是比较理解，但代码的运用还是有很多东西值得体会，要多翻多看！

