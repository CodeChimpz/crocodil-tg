
import {HobbySchema} from "../../schema/hobby.schema.js"
import {HobbyTransformOptions} from "./interfaces/index.js"
import {InlineKeyboard, InlineKeyboardButton, Row} from "node-telegram-keyboard-wrapper"
import TEXT from "../../static/bot-text/text-data.json" assert {type:'json'}
import {RowTransformer} from "./HobbyRowTransformer.js"

export class HobbyChoiceRandom extends RowTransformer<HobbySchema>{
    transform = (hobbies: Array<HobbySchema>, options: HobbyTransformOptions) => {
        const kb = new InlineKeyboard(
            new Row(new InlineKeyboardButton(TEXT.hobby.choose, 'callback_data', 'choose-hobby:' + hobbies[0]._id)),
            new Row(new InlineKeyboardButton(TEXT.hobby.other, 'callback_data', 'propose-more-random:' + hobbies[0]._id)),
            new Row(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
        return kb.getMarkup()
    }
}