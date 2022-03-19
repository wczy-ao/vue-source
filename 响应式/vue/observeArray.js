import observe from "./observe"

function observeArray(arr) {
    for (var i = 0; i < arr.length; i++) {
        observe(arr[i])

    }
}

export default observeArray