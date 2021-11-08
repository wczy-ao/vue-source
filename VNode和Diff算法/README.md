# diff算法和VNode

本文结构顺序：

- snabbdom简介
- snabbdom的h函数如何工作
- diif算法原理
- 手写diff算法



> 提前说明  虚拟DOM

本节不涉及真实DOM如何变成虚拟DOM，这个属于模板编译原理

![](E:\vue-source\VNode和Diff算法\src\images\真实DOM与虚拟DOM.jpg)



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

![](E:\vue-source\VNode和Diff算法\src\images\虚拟节点对象.jpg)





