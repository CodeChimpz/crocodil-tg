//send ping
import {InlineKeyboardButton} from "node-telegram-bot-api"

export class PingOptionBtn implements InlineKeyboardButton {
    text: string
    exclusive_key: string
    exclusive_value: string
    static cb_action = 'set-ping'

    constructor(text: string, hobby: number) {
        this.text = 'Через ' + text
        this.exclusive_key = 'callback_data'
        this.exclusive_value = PingOptionBtn.cb_action + ':' + text + ':' + hobby
    }
}