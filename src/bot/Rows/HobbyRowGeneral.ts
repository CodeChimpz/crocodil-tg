import {InlineKeyboard, InlineKeyboardButton, Row} from "node-telegram-keyboard-wrapper"
import {format} from "../../util/textFormat.js"
import TEXT from "../../static/bot-text/text-data.json" assert {type:'json'}
import {HobbySchema} from "../../schema/hobby.schema.js"
import {HobbyTransformOptions} from "./interfaces/index.js"
import {RowTransformer} from "./HobbyRowTransformer.js"

export class HobbyRowGeneral extends RowTransformer<HobbySchema>{
    transform = (hobbies: Array<HobbySchema>, options: HobbyTransformOptions) => {
        const kb = new InlineKeyboard()
        hobbies.forEach(hobby => {
            kb.push(
                new Row(new InlineKeyboardButton(format.expandText(hobby.name, options.row_len), 'callback_data', 'view-hobby:' + hobby._id)))
        })
        //pagination , considering callbacks
        let cb_val
        switch (options.mode) {
            case "category":
                cb_val = 'get-category:' + options.additional_data + ':'
                break
            case "filter":
                cb_val = 'search-filters:'
                break
            case 'quiz':
                cb_val = 'show-quiz:'
                break
            default:
                return kb.getMarkup()
        }
        if (!options.final) {
            kb.push(new Row(new InlineKeyboardButton(TEXT.general.next_page, 'callback_data', cb_val + (options.page + 1))))
        }
        if (options.page >= 1) {
            kb.push(new Row(new InlineKeyboardButton(TEXT.general.prev_page, 'callback_data', cb_val + (options.page - 1))))
        }
        kb.push(new Row<InlineKeyboardButton>(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
        return kb.getMarkup()
    }
}