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
}, '百度一下，你就知道')

console.log(myVnode);

patch(container, myVnode);
