# mustache模板引擎

![](E:\vue-\mustache的实现\mustache库的机理.png)

## `mustache` 库底层重点要做2个事情

1. 将模板字符串编译为 `tokens` 形式
2. 将 `tokens` 结合数据，解析为 `dom` 字符串

## 什么是 `tokens`？

- `tokens` 就是**JS的嵌套数组**，说白了，就是**模板字符串的JS表示**

- **它是“抽象语法书”、“虚拟节点”等等的开山鼻祖**

- 模板字符串

  ```html
  <h1>我买了一个{{thing}}，好{{mood}}啊</h1>
  ```

- `tokens`

  ```js
  [
    ["text", "<h1>我买了一个"],
    ["name", "thing"],
    ["text", "好"],
    ["name", "mood"],
    ["text", "啊</h1>"]
  ]
  ```

### 循环情况下的 `tokens`

- 当模板字符串中有循环存在时，它将被编译为**嵌套更深**的 `tokens`

- 模板字符串

  ```html
  <div>
    <ul>
      {{#arr}}
      <li>{{.}}</li>
      {{/arr}}
    </ul>
  </div>
  ```

- `tokens`

  ```js
  [
    ["text", "<div><ul>"],
    [
      "#",
      "arr", 
      [
        ["text", "li"],
        ["name", "."],
        ["text": "</li>"]
      ]
    ],
    ["text", "</ul></div>"]
  ]
  ```

### 双重循环下的 `tokens`

- 当循环是双重的，那么 `tokens` 会更深一层

- 模板字符串

  ```html
  <div>
    <ol>
      {{#students}}
      <li>
        学生{{name}}的爱好是
        <ol>
          {{#hobbies}}
          <li>{{.}}</li>
          {{/hobbies}}
        </ol>
      </li>
      {{/students}}
    </ol>
  </div>
  ```

- `tokens`

  ```js
  [
    ["text", "<div><ol>"],
    ["#", "students",
      [
        ["text", "<li>学生"],
        ["name", "name"],
        ["text", "的爱好是<ol>"],
        ["#", "hobbies",
          [
            ["text", "<li>"],
            ["name", "."],
            ["text", "</li>"]
          ]
        ],
        ["text", "</ol></li>"]
      ]
    ],
    ["text", "</ol></div>"]
  ]
  ```

## 手动实现 mustache 库

### 1：配置环境

> 增加效率，以免每步都要刷新页面

`package.json`

```js
{
  "name": "SGG-Template-Engine",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "webpack-dev-server",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^5.20.2",
    "webpack-cli": "^3.3.12",
    "webpack-dev-server": "^3.11.2"
  }
}
```

`webpack.config.js`

```js
const path = require('path')

module.exports = {
  // 入口
  entry: './src/index.js',
  // 出口
  output: {
    // 虚拟打包路径，就是说文件夹不会真正生成，而是在 8080 端口虚拟生成，不会真正的物理生成
    publicPath: 'xuni',
    // 打包出来的文件名
    filename: 'bundle.js'
  },
  devServer: {
    // 端口号
    port: 8080,
    // 静态资源文件夹
    contentBase: 'www'
  }
}
```

- 终端运行 `npm run dev`
- 访问：`http://localhost:8080/`

### 2：扫描类Scanner

这个扫描类Scanner主要的作用就是去除 “{{}}”，保留其他的模板字符串

`/src/Scanner.js`

```js
/*
扫描器类
*/
export default class Scanner {
    constructor(templateStr) {
        // templateStr 模板字符串
        // pos 扫描起点
        // tail 尾巴 -> templateStr还剩哪些没有进行扫描
        this.templateStr = templateStr
        this.pos = 0
        this.tail = templateStr
    }

    // scan方法不返回扫描过的字符串，就是走过指定的内容
    scan(tag) {
        if (tag.indexOf(tag) === 0) {
            // tag 有多长，比如 {{ 长度是2，就让指针后移几位
            this.pos += tag.length
            // 尾巴也要变，改变尾巴为从当前指针这个字符开始，到最后的全部字符
            this.tail = this.templateStr.substring(this.pos)
        }
    }

    // 让指针进行扫描，直到遇见指定内容结束，并且能够返回结束之前路过的文字
    scanUtil(tag) {
        let posBack = this.pos

        while (this.tail.indexOf(tag) !== 0 && !this.eos()) {
            // 开始扫描，起始位置加 1
            this.pos++
            // 尾巴就是除去扫描过的字符串
            this.tail = this.templateStr.substr(this.pos)
        }
        // 返回扫描过的字符串（这个时候是返回 {{ 之前的字符串）
        return this.templateStr.substring(posBack, this.pos)
    }

    // 判断是否扫描结束
    eos() {
        return this.pos >= this.templateStr.length
    }
}
```

### 3：生成`tokens`数组

 `src/parseTemplateToTokens`

```js
import Scanner from "./Scanner";
import nestTokens from './nestTokens'

export default function parseTemplateToTokens(templateStr) {
    var tokens = []
    var scanner = new Scanner(templateStr)
    var words

    while ((!scanner.eos())) {
        // 开始扫描
        words = scanner.scanUtil("{{")
        // 如果 words 不空，那么保存进 tokens 数组
        if (words) tokens.push(["text", words])

        scanner.scan("{{")
		
        words = scanner.scanUtil("}}")
        // 这个时候已经扫描完一轮了，然后把 }} 闭合前的字符存进 tokens 数组
        if (words != '') {
            对闭合前的字符串进行判断
            if (words[0] == "#") {
                tokens.push(["#", words.substring(1)])
            } else if (words[0] == '/') {
                tokens.push(['/', words.substring(1)])
            } else {
                tokens.push(['name', words])
            }
        }

        scanner.scan("{{")
    }
    console.log(tokens)
// 这个时候的 tokens 数组是平层的，这个时候我们需要把内层的数组折叠进去，通过nestTokens方法
    return nestTokens(tokens)
}
```

`src/nestTokens.js` 嵌套 `tokens` 的折叠处理

```js
这个方法难点在于对于 栈 的运用
export default function nestTokes(tokens) {
    // 结果数组
    var nestTokens = []
    // 栈结构，存放小tokens，栈顶（靠近端口的，最新进入的）的tokens数组中当前操作的这个tokens小数组
    var sections = []
     // 收集器，天生指向nestedTokens结果数组，引用类型值，所以指向的是同一个数组
    // 收集器的指向会变化，当遇见#的时候，收集器会指向这个token的下标为2的新数组
    var collector = nestTokens

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i]
        switch (token[0]) {
            case "#":
                collector.push(token)
                sections.push(token)
                // 收集器要换人。这个时候的收集器是 sections 数组栈顶元素的第三项元素
                collector = token[2] = []
                break
            case '/':
                // 看见了循环结束的标志，这个时候要把栈顶元素出栈
                sections.pop()
                 // 收集器要换人。这个时候的收集器是 sections 数组栈顶元素的第三项元素；如果栈空了，这个时候收集器就是结果数组
                collector = sections.length > 0 ? sections[sections.length - 1][2] : nestTokens
                break
            default:
                // 甭管当前的collector是谁，可能是结果nestedTokens，也可能是某个token的下标为2的数组，甭管是谁，推入collector即可
                collector.push(token)
                break
        }
    }

    return nestTokens
}
```

### 4:：将 `tokens` 结合数据，解析为 `dom` 字符串

> `#` 标记的 `tokens`，需要递归处理它的下标为2的小数组

`src/renderTemplate.js` 让 `tokens` 数组变为 `dom` 字符串

```js
import lookup from './lookup'
import parseArray from './parseArray'
/**
 * 让 tokens数组变为 dom 字符串
 * @param {array} tokens
 * @param {object} data
 */
export default function renderTemplate(tokens, data) {
  // 结果字符串
  var resultStr = ''
  // 遍历 tokens
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    // 看类型
    if (token[0] === 'text') {
      resultStr += token[1] // 拼起来
    } else if (token[0] === 'name') {
      // 如果是 name 类型，那么就直接使用它的值，当然要用 lookup
      // 防止这里有 “a.b.c” 有逗号的形式
      resultStr += lookup(data, token[1])
    } else if (token[0] === '#') {
      resultStr += parseArray(token, data)
    }
  }
  return resultStr
}
```

`src/parseArray.js` 解析数组及嵌套数组

```js
import lookup from './lookup'
import renderTemplate from './renderTemplate'
/**
 * 处理数组，结合 renderTemplate 实现递归
 * 这个函数接受的参数是token 而不是 tokens
 * token 是什么，就是一个简单的 ['#', 'students', []]
 *
 * 这个函数要递归调用 renderTemplate 函数
 * 调用的次数由 data 的深度决定
 */
export default function parseArray(token, data) {
  // 得到整体数据data中这个数组要使用的部分
  var v = lookup(data, token[1])
  // 结果字符串
  var resultStr = ''
  // 遍历v数组，v一定是数组
  // 遍历数据
  for (let i = 0; i < v.length; i++) {
    // 这里要补一个 “.” 属性的识别
    resultStr += renderTemplate(token[2], v[i])
  }
  return resultStr
}
```

`src/lookup.js`

```js
/**
 * 功能是可以在 dataObj 对象中，用连续点符号的 keyName 属性
 * 比如，dataObj是
 * {
 *    a: {
 *      b: {
 *        c: 100
 *      }
 *    }
 * }
 * 那么 lookup(dataObj, 'a.b.c') 结果就是 100
 * @param {object} dataObj
 * @param {string} keyName
 */
export default function lookup(dataObj, keyName) {
  /*
  // 看看 keyName 中有没有 . 符号
  if (keyName.indexOf('.') !== -1 && keyName !== '.') {
    // 如果有点符号，那么拆开
    var keys = keyName.split('.')
    // 这只一个临时变量，用于周转，一层一层找下去
    var temp = dataObj
    // 每找一层，更新临时变量
    for (let i = 0; i < keys.length; i++) {
      temp = temp[keys[i]]
    }
    return temp
  }
  // 如果这里没有 . 符号
  return dataObj[keyName]
  */
  // 这里其实可以不用加是否包含 . 符号的判断 因为 'abc'.split('.') = ["abc"]
  // 只有一个元素不影响最终结果，不影响循环语句最终结果
  // 另外，这里的特征是：当前的值要依赖前一个的值，所以可以用 reduce 累加器
  // 一行代码搞定
  return keyName !== '.'
    ? keyName
        .split('.')
        .reduce((prevValue, currentKey) => prevValue[currentKey], dataObj)
    : dataObj
}
```

### 5：调用

`src/index.js`

```JS
import parseTemplateToTokens from './parseTemplateToTokens'
import renderTemplate from './renderTemplate'

window.SGG_TemplateEngine = {
  // 渲染方法
  render(templateStr, data) {
    // 调用 parseTemplateToTokens 函数，让模板字符串能够变成 tokens 数组
    var tokens = parseTemplateToTokens(templateStr)
    // 调用 renderTemplate 函数，让 tokens数组变为 dom 字符串
    var domStr = renderTemplate(tokens, data)
    return domStr
  }
}
```

`www/index.html`

```HTML
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>

  <body>
    <div id="container"></div>
    <script src="xuni/bundle.js"></script>
    <script>
      var templateStr = `
        <div>
          <ol>
            {{#students}}
            <li>
              学生{{name}}的爱好是
              <ol>
                {{#hobbies}}
                <li class='myli'>{{.}}</li>
                {{/hobbies}}
              </ol>
            </li>
            {{/students}}
          </ol>
        </div>
      `
      var data = {
        students: [
          { name: '小明', hobbies: ['游泳', '健身'] },
          { name: '小红', hobbies: ['足球', '篮球', '羽毛球'] },
          { name: '小强', hobbies: ['吃饭', '睡觉'] },
        ]
      }
      var domStr = SGG_TemplateEngine.render(templateStr, data)
      var container = document.getElementById('container')
      container.innerHTML = domStr
    </script>
  </body>

  </html>
```

## 总结

手动实现简单版mustache模板引擎有几个难点：

- 生成tokens数组，这个地方要求对栈的使用有一定要求，并且它是一个折叠的数组
- 从tokens数组结合数据，这个里面对 token[0] == '#' 和 token[0] == 'name' 的处理，尤其是前者用的是 “**函数A调用函数B，函数B调用函数A**”

