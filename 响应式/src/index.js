import Vue from 'vue'


let vm = new Vue({
    el: "#app",
    data() {
        return {
            title: '学生列表',
            classNum: 2,
            total: 1,
            teacher: ['张三'],
            info: {
                a: {
                    b: 1
                }
            },
            students: [{
                    id: 2,
                    name: '小米',
                },
                {
                    id: 4,
                    name: '小黑'
                }
            ]
        }
    }
})

// console.log(vm.students.push({
//     id: 77,
//     name: 999
// }));
// console.log(vm.students[2].id);