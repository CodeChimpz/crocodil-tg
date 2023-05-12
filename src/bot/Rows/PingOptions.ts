import {InlineKeyboard, InlineKeyboardButton, Row} from "node-telegram-keyboard-wrapper"
import {PingOptionBtn} from "../Buttons/PingOptions.js"

export class PingOptions {
    transform = (opts: Array<string>, hobby: number) => {
        const kb = new InlineKeyboard()
        const btns = opts.map(num => {
            return new PingOptionBtn(num, hobby) as unknown as InlineKeyboardButton
        })
        kb.push(new Row(...btns))
        return kb.getMarkup()
    }
}