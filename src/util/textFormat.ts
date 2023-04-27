export const format = {
    //formats text for button to be not longer than specified
    lineBreakText: (text: string, size: string) => {

    },
    //formats text for button to be not shorter than specified
    expandText: (text: string, size: number) => {
        if (text.length < size) {
            const diff = size - text.length
            const even = diff % 2 === 0
            const text_ = `${'\u2800'.repeat(diff / 2)}${text}${'\u2800'.repeat(even ? diff / 2 : (diff / 2) - 1)}`
            return text_
        }
        return text
    }
}