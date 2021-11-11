import Observer from "./Observer";
/**
 * 监听 value
 * @param {*} value 
 * @returns 
 */

/*
  监听 value
  尝试创建Observer实例，如果value已经是响应式数据，
  就不需要再创建Observer实例，直接返回已经创建的Observer实例即可，
  避免重复侦测value变化的问题
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