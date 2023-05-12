import {InlineKeyboardButton, KeyboardButton} from "node-telegram-bot-api";
import {InlineKeyboard, InlineKeyboardButton as IKButton, Row} from 'node-telegram-keyboard-wrapper'
import {HobbySchema} from "../schema/hobby.schema.js";
import TEXT from "../static/bot-text/text-data.json" assert {type: 'json'};

//change hobby
export class ChangeHobby implements InlineKeyboardButton {
    text: string
    callback_data: string
    static cb_action = 'change-hobby'

    constructor(change: boolean, hobby:number) {
        this.text = change ? TEXT.hobby.tried_change : TEXT.hobby.continue_hesitant
        const res = change ? '1' : '0'
        this.callback_data = change ?  'go-back' : 'choose-hobby:'+hobby+':edit'
        console.log(change)
    }
}

//send ping
export class PingOptionBtn implements InlineKeyboardButton {
    text: string
    callback_data: string
    static cb_action = 'set-ping'
    button: IKButton

    constructor(text: string, hobby: number) {
        this.text = 'Через ' + text
        this.callback_data = PingOptionBtn.cb_action + ':' + text + ':' + hobby
        this.button = new IKButton(this.text, 'callback_data', this.callback_data)
    }
}

//answer ping confirm your hobby progress
export class RespondToPingBtn implements InlineKeyboardButton {
    text: string
    callback_data: string
    static cb_action = 'answer-ping'

    constructor(tried: boolean, hobby: number) {
        this.text = tried ? TEXT.hobby.tried_positive : TEXT.hobby.tried_negative
        const res = tried ? '1' : '0'
        this.callback_data = RespondToPingBtn.cb_action + ':' + res + ':' + hobby
    }
}

//leave feedback on hobby
export class RateHobbyBtn implements InlineKeyboardButton {
    text: string
    callback_data: string
    static cb_action = 'rate-hobby'

    constructor(liked: boolean) {
        this.text = liked ? TEXT.rate.liked : TEXT.rate.disliked
        const res = liked ? '1' : '0'
        this.callback_data = RateHobbyBtn.cb_action + ':' + res
    }
}


