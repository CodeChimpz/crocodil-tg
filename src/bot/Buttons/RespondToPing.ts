//answer ping confirm your hobby progress
import {InlineKeyboardButton} from "node-telegram-bot-api";
import TEXT from "../../static/bot-text/text-data.json";
import {HobbyInlineQueryButton} from "./interfaces/interfaces";

export class RespondToPingBtn implements InlineKeyboardButton, HobbyInlineQueryButton {
    text: string
    callback_data: string
    static cb_action = 'answer-ping'

    constructor(tried: boolean, hobby: number) {
        this.text = tried ? TEXT.hobby.tried_positive : TEXT.hobby.tried_negative
        const res = tried ? '1' : '0'
        this.callback_data = RespondToPingBtn.cb_action + ':' + res + ':' + hobby
    }
}