import {InlineKeyboard, InlineKeyboardButton, Row} from 'node-telegram-keyboard-wrapper'
import {HobbySchema} from "../schema/hobby.schema.js";
import {PROMPTS} from "../static/bot-text/text-prompts.js";
import {CategorySchema} from "../schema/category.schema.js";
import TEXT from "../static/bot-text/text-data.json" assert {type: 'json'};
import {PingOptionBtn} from "./Buttons";
import {format} from "../util/textFormat.js";

export type ModeT = 'filter' | 'category' | 'quiz'
const HOBBY_LEN = 30

//Row of hobbies in mode random
export function HobbyRowRandom(hobbies: Array<HobbySchema>) {
    const kb = new InlineKeyboard()
    hobbies.forEach(hobby => {
        kb.push(
            new Row(new InlineKeyboardButton(format.expandText(format.expandText(hobby.name, HOBBY_LEN), HOBBY_LEN), 'callback_data', 'view-hobby:' + hobby._id + ':random')))
    })
    kb.push(
        new Row(new InlineKeyboardButton(TEXT.hobby.other, 'callback_data', 'get-random')),
        new Row(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
    return kb.getMarkup()
}

//Row of hobbies usual
export function HobbyRow(hobbies: Array<HobbySchema>, mode: ModeT, page: number = 0, final: boolean = false, data?: any) {
    const kb = new InlineKeyboard()
    hobbies.forEach(hobby => {
        kb.push(
            new Row(new InlineKeyboardButton(format.expandText(hobby.name, HOBBY_LEN), 'callback_data', 'view-hobby:' + hobby._id)))
    })
    //pagination , considering callbacks
    let cb_val
    switch (mode) {
        case "category":
            cb_val = 'get-category:' + data + ':'
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
    if (!final) {
        kb.push(new Row(new InlineKeyboardButton(TEXT.general.next_page, 'callback_data', cb_val + (page + 1))))
    }
    if (page >= 1) {
        kb.push(new Row(new InlineKeyboardButton(TEXT.general.prev_page, 'callback_data', cb_val + (page - 1))))
    }
    kb.push(new Row<InlineKeyboardButton>(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
    return kb.getMarkup()
}

export function HobbyRowBasic(hobbies: Array<HobbySchema>) {
    const kb = new InlineKeyboard()
    hobbies.forEach(hobby => {
        kb.push(
            new Row(new InlineKeyboardButton(format.expandText(hobby.name, HOBBY_LEN), 'callback_data', 'view-hobby:' + hobby._id)))
    })
    kb.push(new Row(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
    return kb.getMarkup()
}

//Choices for a specific hobby
export function HobbyChoiceRandom(hobby: HobbySchema) {
    const kb = new InlineKeyboard(
        new Row(new InlineKeyboardButton(TEXT.hobby.choose, 'callback_data', 'choose-hobby:' + hobby._id)),
        new Row(new InlineKeyboardButton(TEXT.hobby.other, 'callback_data', 'propose-more-random:' + hobby._id)),
        new Row(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
    return kb.getMarkup()
}

export function HobbyChoice(hobby: HobbySchema) {
    const kb = new InlineKeyboard(
        new Row(new InlineKeyboardButton(TEXT.hobby.choose, 'callback_data', 'choose-hobby:' + hobby._id)),
        new Row(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
    return kb.getMarkup()
}

//Row of filters with checked == chosen
export function FiltersKb(filters: Array<CategorySchema>, in_a_row: number, chosen: Array<string> = [], page: number, final: boolean = false) {
    const kb = new InlineKeyboard()
    //iteration
    for (let curr = 0; curr < filters.length; curr = curr + in_a_row) {
        kb.push(new Row(...filters.slice(curr, curr + in_a_row).map(filter => {
            const name = chosen.includes(String(filter._id)) ? '(✔️)' + filter.name : filter.name
            return new InlineKeyboardButton(name, 'callback_data', 'set-filter:' + filter._id + ':' + (page))
        })))
    }
    if (!final) {
        kb.push(new Row(new InlineKeyboardButton(TEXT.general.next_page, 'callback_data', 'get-filters:' + (page + 1))))
    }
    if (page >= 1) {
        kb.push(new Row(new InlineKeyboardButton(TEXT.general.prev_page, 'callback_data', 'get-filters:' + (page - 1))))
    }
    kb.push(
        new Row(new InlineKeyboardButton(TEXT.filters.get, 'callback_data', 'search-filters')),
        new Row(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back'))
    )
    return kb.getMarkup()
}

//Row of categories
export function CategoriesKb(filters: Array<CategorySchema>, in_a_row: number, page: number, final: boolean = false) {
    const kb = new InlineKeyboard()
    //PUT 'MISC' IN the bottom
    const misc = filters.find(filtr_ => ['Другое', 'Различное', 'Miscellaneous'].includes(filtr_.name))
    const filters_rm = filters.filter(filtr_ => !['Другое', 'Различное', 'Miscellaneous'].includes(filtr_.name))
    for (let curr = 0; curr < filters.length; curr = curr + in_a_row) {
        kb.push(...filters_rm.slice(curr, curr + in_a_row).map(cat => {
            return new Row(new InlineKeyboardButton(cat.name, 'callback_data', 'get-category:' + cat._id))
        }))
    }
    if (misc) {
        kb.push(new Row(new InlineKeyboardButton(misc.name, 'callback_data', 'get-category:' + misc._id)))
    }
    if (!final) {
        kb.push(new Row(new InlineKeyboardButton(TEXT.general.next_page, 'callback_data', 'get-categories:' + (page + 1))))
    }
    if (page >= 1) {
        kb.push(new Row(new InlineKeyboardButton(TEXT.general.prev_page, 'callback_data', 'get-categories:' + (page - 1))))
    }
    kb.push(new Row<InlineKeyboardButton>(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back')))
    return kb.getMarkup()
}

//
export function PingOptions(opts: Array<string>, hobby: number) {
    const kb = new InlineKeyboard()
    const btns = opts.map(num => {
        return new PingOptionBtn(num, hobby) as unknown as InlineKeyboardButton
    })
    kb.push(new Row(...btns))
    return kb.getMarkup()
}