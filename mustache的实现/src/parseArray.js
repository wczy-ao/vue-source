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
