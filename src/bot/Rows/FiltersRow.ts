import {HobbySchema} from "../../schema/hobby.schema.js"
import {HobbyTransformOptions} from "./interfaces/index.js"
import {RowTransformer} from "./HobbyRowTransformer.js"
import {CategorySchema} from "../../schema/category.schema.js"
import {InlineKeyboard, InlineKeyboardButton, Row} from "node-telegram-keyboard-wrapper"
import TEXT from "../../static/bot-text/text-data.json" assert {type:'json'}

export class FiltersRow extends RowTransformer<CategorySchema> {
    transform = (filters: Array<CategorySchema>, options: HobbyTransformOptions) => {
        const kb = new InlineKeyboard()
        //iteration
        for (let curr = 0; curr < filters.length; curr = curr + (options.in_a_row || 0) ){
            kb.push(new Row(...filters.slice(curr, curr + (options.in_a_row || 0)).map(filter => {
                const name = options?.additional_entities?.includes(String(filter._id)) ? '(✔️)' + filter.name : filter.name
                return new InlineKeyboardButton(name, 'callback_data', 'set-filter:' + filter._id + ':' + (options.page))
            })))
        }
        if (!options.final) {
            kb.push(new Row(new InlineKeyboardButton(TEXT.general.next_page, 'callback_data', 'get-filters:' + (options.page + 1))))
        }
        if (options.page >= 1) {
            kb.push(new Row(new InlineKeyboardButton(TEXT.general.prev_page, 'callback_data', 'get-filters:' + (options.page - 1))))
        }
        kb.push(
            new Row(new InlineKeyboardButton(TEXT.filters.get, 'callback_data', 'search-filters')),
            new Row(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back'))
        )
        return kb.getMarkup()
    }
}