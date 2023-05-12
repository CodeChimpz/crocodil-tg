import {InlineKeyboard, InlineKeyboardButton, Row} from "node-telegram-keyboard-wrapper"
import {format} from "../../util/textFormat.js"
import TEXT from "../../static/bot-text/text-data.json" assert {type:'json'}
import {HobbySchema} from "../../schema/hobby.schema.js"

import {HobbyTransformOptions} from "./interfaces/index.js"
import {RowTransformer} from "./HobbyRowTransformer.js"

export class HobbyRowRandom extends RowTransformer<HobbySchema>{
    
    transform = (hobbies: Array<HobbySchema>, options: HobbyTransformOptions) => {
        const kb = new InlineKeyboard()
        hobbies.forEach(hobby => {
            kb.push(
                new Row(new InlineKeyboardButton(format.expandText(format.expandText(hobby.name, options.row_len), options.row_len), 'callback_data', 'view-hobby:' + hobby._id + ':random')))
        })
        kb.push(
            new Row(new InlineKeyboardButton(TEXT.hobby.other, 'callback_data', 'get-random')),
            new Row(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
        return kb.getMarkup()
    }
}