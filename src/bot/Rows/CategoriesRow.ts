import {HobbyTransformOptions} from "./interfaces/index.js"
import {InlineKeyboard, InlineKeyboardButton, Row} from "node-telegram-keyboard-wrapper"
import TEXT from "../../static/bot-text/text-data.json" assert {type:'json'}
import {CategorySchema} from "../../schema/category.schema.js"
import {RowTransformer} from "./HobbyRowTransformer.js"

export class CategoriesRow extends RowTransformer<CategorySchema> {
    transform = (filters: Array<CategorySchema>, options: HobbyTransformOptions) => {
        const kb = new InlineKeyboard()
        //PUT 'MISC' IN the bottom
        const misc = filters.find(filtr_ => ['Другое', 'Различное', 'Miscellaneous'].includes(filtr_.name))
        const filters_rm = filters.filter(filtr_ => !['Другое', 'Различное', 'Miscellaneous'].includes(filtr_.name))
        for (let curr = 0; curr < filters.length; curr = curr + options.in_a_row) {
            kb.push(...filters_rm.slice(curr, curr + options.in_a_row).map(cat => {
                return new Row(new InlineKeyboardButton(cat.name, 'callback_data', 'get-category:' + cat._id))
            }))
        }
        if (misc) {
            kb.push(new Row(new InlineKeyboardButton(misc.name, 'callback_data', 'get-category:' + misc._id)))
        }
        if (!options.final) {
            kb.push(new Row(new InlineKeyboardButton(TEXT.general.next_page, 'callback_data', 'get-categories:' + (options.page + 1))))
        }
        if (options.page >= 1) {
            kb.push(new Row(new InlineKeyboardButton(TEXT.general.prev_page, 'callback_data', 'get-categories:' + (options.page - 1))))
        }
        kb.push(new Row<InlineKeyboardButton>(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
        return kb.getMarkup()
    }
}