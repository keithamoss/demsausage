// Modified from https://stackoverflow.com/a/8817473
export const deepValue = function(obj: object, searchPath: string) {
    const path = searchPath.split(".")
    for (let i = 0, len = path.length; i < len; i++) {
        if (obj[path[i]] === null) {
            return null
        }
        if (obj[path[i]] === undefined) {
            return undefined
        }
        obj = obj[path[i]]
    }
    return obj
}

// @ts-ignore
export const isIE11 = !!window.MSInputMethodContext && !!document.documentMode

// http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
export function stringDivider(str: string, width: number, spaceReplacer: string, replaceCount: number = 0): [string, number] {
    if (str.length > width) {
        var p = width
        while (p > 0 && (str[p] !== " " && str[p] !== "-")) {
            p--
        }
        if (p > 0) {
            var left
            if (str.substring(p, p + 1) === "-") {
                left = str.substring(0, p + 1)
            } else {
                left = str.substring(0, p)
            }
            var right = str.substring(p + 1)
            replaceCount += 1
            const [newText, newReplaceCount] = stringDivider(right, width, spaceReplacer, replaceCount)
            return [left + spaceReplacer + newText, newReplaceCount]
        }
    }
    return [str, replaceCount]
}
