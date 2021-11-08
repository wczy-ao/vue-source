export default class Scanner {
    constructor(templateStr) {
        this.templateStr = templateStr
        this.pos = 0
        this.tail = templateStr
    }

    scan(tag) {
        if (tag.indexOf(tag) === 0) {
            this.pos += tag.length
            this.tail = this.templateStr.substring(this.pos)
        }
    }

    scanUtil(tag) {
        let posBack = this.pos

        while (this.tail.indexOf(tag) !== 0 && !this.eos()) {
            this.pos++
            this.tail = this.templateStr.substr(this.pos)
        }
        return this.templateStr.substring(posBack, this.pos)
    }

    eos() {
        return this.pos >= this.templateStr.length
    }
}