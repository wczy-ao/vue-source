export default function lookup(dataObj, keyName) {
    return keyName !== '.'
    ? keyName
        .split('.')
        .reduce((prevValue, currentKey) => prevValue[currentKey], dataObj)
    : dataObj
}