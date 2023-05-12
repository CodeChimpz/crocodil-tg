
import {HobbySchema} from "../../schema/hobby.schema.js"
import {HobbyTransformOptions} from "./interfaces/index.js"
import {InlineKeyboard, InlineKeyboardButton, Row} from "node-telegram-keyboard-wrapper"
import {format} from "../../util/textFormat.js"
import TEXT from "../../static/bot-text/text-data.json" assert {type:'json'} assert {type: 'json'}
import {RowTransformer} from "./HobbyRowTransformer.js"

export class HobbyRowBasic extends RowTransformer<HobbySchema>{
    transform = (hobbies: Array<HobbySchema>, options: HobbyTransformOptions) => {
        const kb = new InlineKeyboard()
        hobbies.forEach(hobby => {
            kb.push(
                new Row(new InlineKeyboardButton(format.expandText(hobby.name, options.row_len), 'callback_data', 'view-hobby:' + hobby._id)))
        })
        kb.push(new Row(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
        return kb.getMarkup()
    }
}