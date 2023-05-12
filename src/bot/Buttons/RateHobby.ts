//leave feedback on hobby
import {InlineKeyboardButton} from "node-telegram-bot-api"
import TEXT from "../../static/bot-text/text-data.json" assert {type:'json'}
import {HobbyInlineQueryButton} from "./interfaces/interfaces.js"

export class RateHobbyBtn implements InlineKeyboardButton, HobbyInlineQueryButton {
    text: string
    callback_data: string
    static cb_action = 'rate-hobby'

    constructor(liked: boolean) {
        this.text = liked ? TEXT.rate.liked : TEXT.rate.disliked
        const res = liked ? '1' : '0'
        this.callback_data = RateHobbyBtn.cb_action + ':' + res
    }
}