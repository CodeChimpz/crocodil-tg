//change hobby
import {InlineKeyboardButton} from "node-telegram-bot-api"
import TEXT from "../../static/bot-text/text-data.json" assert {type:'json'}
import {HobbyInlineQueryButton} from "./interfaces/interfaces.js"


export class ChangeHobby implements InlineKeyboardButton, HobbyInlineQueryButton {
    text: string
    callback_data: string
    static cb_action = 'change-hobby'

    constructor(change: boolean, hobby: number) {
        this.text = change ? TEXT.hobby.tried_change : TEXT.hobby.continue_hesitant
        const res = change ? '1' : '0'
        this.callback_data = change ? 'go-back' : 'choose-hobby:' + hobby + ':edit'
    }
}