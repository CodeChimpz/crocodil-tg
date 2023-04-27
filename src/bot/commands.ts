import TelegramBot, {CallbackQuery, InlineKeyboardMarkup, Message} from "node-telegram-bot-api";
import {hobbyService, HobbyService} from "../services/hobby.service.js";
import {userService, UserService} from "../services/user.service.js";
import {redis} from "../connectors/redis.js";
import {
    RespondToPingBtn, RateHobbyBtn, ChangeHobby
} from "./buttons.js";
import {PROMPTS} from "../static/bot-text/text-prompts.js";
import TEXT from "../static/bot-text/text-data.json" assert {type: 'json'};
import {QueryToMsg} from "../util/decorators.js";
import {schedulePing} from "../util/schedule.js";
import {
    CategoriesKb,
    FiltersKb,
    HobbyChoice,
    HobbyChoiceRandom,
    HobbyRow, HobbyRowRandom,
    PingOptions,
} from "./rows.js";
import {HobbySchema} from "../schema/hobby.schema.js";
import {categoryService, CategoryService} from "../services/category.service.js";
import {cache, Cache, CurrentCache} from "./cache.js";
import EventEmitter from "events";
import {InlineKeyboard, InlineKeyboardButton, Row} from "node-telegram-keyboard-wrapper";

interface OptionsI {
    services: {
        userService: UserService,
        hobbyService: HobbyService,
        categoryService: CategoryService
    }
    cache: CurrentCache
}

export class BotCommandManager {
    cache: CurrentCache
    hobbyService: HobbyService
    userService: UserService
    categoryService: CategoryService
    //various options
    number_of_results: number

    constructor(options: OptionsI) {
        this.userService = options.services.userService
        this.hobbyService = options.services.hobbyService
        this.categoryService = options.services.categoryService
        this.cache = options.cache

        this.number_of_results = 8
    }

//GENERAL COMMANDS
    //greet user and upload a menu of options
    @QueryToMsg
    async startup(bot: TelegramBot, input: Message) {
        const id = input.chat.id
        //check if first bot message
        const met_before = await this.userService.get(String(id))
        if (!met_before) {
            await this.userService.create(String(id))
            await bot.sendMessage(id, TEXT.greet.initial + '\n' + TEXT.greet.general, {
                reply_markup: new InlineKeyboard(new Row(new InlineKeyboardButton(PROMPTS.categories.random, 'callback_data', 'get-random')
                        , new InlineKeyboardButton(PROMPTS.categories.filters, 'callback_data', 'get-filters')),
                    new Row(new InlineKeyboardButton(PROMPTS.categories.categories, 'callback_data', 'get-categories'),
                        new InlineKeyboardButton(PROMPTS.categories.quiz, 'callback_data', 'quiz'))).getMarkup()
            })
        } else {
            await bot.sendMessage(id, TEXT.greet.general,
                {
                    reply_markup: new InlineKeyboard(new Row(new InlineKeyboardButton(PROMPTS.categories.random, 'callback_data', 'get-random')
                            , new InlineKeyboardButton(PROMPTS.categories.filters, 'callback_data', 'get-filters')),
                        new Row(new InlineKeyboardButton(PROMPTS.categories.categories, 'callback_data', 'get-categories'),
                            new InlineKeyboardButton(PROMPTS.categories.quiz, 'callback_data', 'quiz'))).getMarkup()
                }
            )
        }
        await bot.deleteMessage(Number(id), String(input?.message_id))
    }

//RANDOM
    //initialize or access a randomised set of hobbies for a user and send him a bunch
    async random(bot: TelegramBot, input: CallbackQuery) {
        const NUMBER = this.number_of_results
        const id = String(input.message?.chat.id)
        //get random hobbies from cache
        let got = await this.cache.random.get(id + 'hobbies', NUMBER)
        //if none exist - get put them there and then get again
        if (!got) {
            const hobbies = await this.hobbyService.getRandom()
            got = await this.cache.random.put(id + 'hobbies', hobbies, NUMBER)
        }
        //get hobbies data from db
        const hobbies: Array<HobbySchema> = []
        await Promise.all(got.map(async (hobby_: string) => {
                //populate _id with data
                const hobby = await this.hobbyService.findById(Number(hobby_))
                if (hobby) {
                    hobbies.push(hobby)
                }
            }
        ))
        //send
        if (hobbies.length <= 0) {
            await bot.sendMessage(Number(id), TEXT.random.none, {
                reply_markup: {
                    ...new InlineKeyboard(
                        new Row(new InlineKeyboardButton(TEXT.random.once_more, 'callback_data', 'get-random')),
                        new Row(new InlineKeyboardButton(TEXT.general.go_back, 'callback_data', 'go-back'))).getMarkup(),
                    resize_keyboard: true
                }
            })
        } else {
            await bot.sendMessage(Number(id), TEXT.random.result, {
                reply_markup: {...HobbyRowRandom(hobbies), resize_keyboard: true}
            })
        }
        await bot.deleteMessage(Number(id), String(input?.message?.message_id))
    }

    //get a random hobby instead of one proposed
    random_change = async (bot: TelegramBot, input: CallbackQuery) => {
        const to_change = input.data?.split(':')[1]
        const message = input?.message
        const id = message?.chat.id.toString()
        if (!id || !to_change) {
            //todo: throw and handle exception
            return
        }
        //remove the changed
        const got = await this.cache.random.pop(id + 'hobbies', to_change)
        if (!got) {
            await bot.sendMessage(id, TEXT.random.none)
            return
        }
        const hobby = await this.hobbyService.findById(Number(got))
        if (!hobby) {
            return
        }
        //text format
        //TEXT
        const text = `*${hobby.name}*\n${hobby.descr}`
        await bot.editMessageText(text, {
            message_id: Number(message?.message_id),
            chat_id: id,
            reply_markup: {...HobbyChoiceRandom(hobby)},
            parse_mode: "Markdown"
        })
    }
//CATEGORIES
    //present user with available categories
    propose_category = async (bot: TelegramBot, input: CallbackQuery) => {
        const id = input.message?.chat.id
        const message_id = input?.message?.message_id
        const data = input.data?.split(':')[1]
        const page = data ? parseInt(data) : 0
        //
        const categories = await this.categoryService.getAll(false)
        if (!categories) {
            return
        }
        //pagination
        const skip = page * this.number_of_results
        const limit = skip + this.number_of_results
        let final = limit >= categories.length
        await bot.sendMessage(Number(id), TEXT.categories.request, {
            reply_markup: {
                ...CategoriesKb(categories.slice(skip, limit), 1, page, final),
                resize_keyboard: true
            }
        })
        await bot.deleteMessage(Number(id), String(input.message?.message_id))
    }
    get_by_category = async (bot: TelegramBot, input: CallbackQuery) => {
        const id = input.message?.chat.id
        const category = input.data?.split(':')[1]
        const page = Number(input.data?.split(':')[2]) || 0
        //
        const hobbies = await this.hobbyService.searchCategory(Number(category))
        if (!hobbies.length) {
            return
        }
        //
        const skip = page * this.number_of_results
        const limit = skip + this.number_of_results
        let final = limit >= hobbies.length
        await bot.sendMessage(Number(id), TEXT.categories.result,
            {
                reply_markup: {
                    ...HobbyRow(hobbies.slice(skip, limit), 'category', page, final, category),
                    resize_keyboard: true
                }
            })
        return bot.deleteMessage(Number(id), String(input.message?.message_id))
    }
//FILTERS
    //send the menu of available filters to chat
    propose_filters = async (bot: TelegramBot, input: CallbackQuery) => {
        const id = input.message?.chat.id
        const message_id = input?.message?.message_id
        const data = input.data?.split(':')[1]
        const page: number | undefined = data ? parseInt(data) : 0
        //get filters
        const filters = await this.categoryService.getAll(true)
        //get data on filters already chosen by user
        const chosen = await this.cache.filters.get(id + 'filters')
        if (!filters) {
            return
        }
        //PAGINATION logic
        const skip = page * this.number_of_results
        const limit = skip + this.number_of_results
        let final = limit >= filters.length
        const Buttons_ = FiltersKb(filters.slice(skip, limit), 1, chosen, page, final)
        //check if
        if (page >= 1) {
            return bot.editMessageReplyMarkup(Buttons_, {
                message_id: message_id,
                chat_id: id,
            })
        }
        await bot.sendMessage(Number(id), TEXT.filters.get, {
            reply_markup: {...Buttons_, resize_keyboard: true}
        })
        return bot.deleteMessage(Number(id), String(message_id))

    }
    //set or unset the chosen filter from user choice set
    set_filters = async (bot: TelegramBot, input: CallbackQuery) => {
        const id = input.message?.chat.id
        const filter_id = input.data?.split(':')[1]
        const data = input.data?.split(':')[2]
        const page: number | undefined = data ? parseInt(data) : 0
        //GET updated chosen filters
        const filters_chosen = await this.cache.filters.put(id + 'filters', String(filter_id))
        //send all filters with intersection of chosen
        const filters = await this.categoryService.getAll(true)
        if (!filters) {
            return
        }
        //pagination
        const skip = page * this.number_of_results
        const limit = skip + this.number_of_results
        let final = limit >= filters.length
        return bot.editMessageReplyMarkup(FiltersKb(filters.slice(skip, limit), 1, filters_chosen, page, final), {
            message_id: input.message?.message_id,
            chat_id: id,
        })

    }
    //get filters by users choice set and send him
    get_by_filters = async (bot: TelegramBot, input: CallbackQuery) => {
        const id = input.message?.chat.id
        const page = Number(input.data?.split(':')[2]) || 0
        //get hobbies for filters
        const filters = await this.cache.filters.get(id + 'filters')
        const hobbies = await this.hobbyService.searchFilters(filters)
        if (hobbies.length <= 0) {
            return bot.sendMessage(Number(id), TEXT.filters.none)
        }
        //pagination
        const skip = page * this.number_of_results
        const limit = skip + this.number_of_results
        let final = limit >= hobbies.length
        //unset filters
        await this.cache.filters.purge(id + 'filters')
        //send shit
        await bot.sendMessage(Number(id), TEXT.categories.result,
            {
                reply_markup: {
                    ...HobbyRow(hobbies.slice(skip, limit), 'filter', page, final),
                    resize_keyboard: true
                }
            })
        await bot.deleteMessage(Number(id), String(input.message?.message_id))
    }
//HOBBIES
    view = async (bot: TelegramBot, input: CallbackQuery) => {
        const id = input.message?.chat.id
        const hobby_id = input.data?.split(':')[1]
        const mode_ = input.data?.split(':')[2]
        //send hobby data
        const hobby = await this.hobbyService.findById(Number(hobby_id))
        if (!hobby) {
            return
        }
        const text = `*${hobby.name}* \n ${hobby.descr}`
        //TEXT
        const markup = mode_ !== undefined ? HobbyChoiceRandom(hobby) : HobbyChoice(hobby)

        await bot.sendMessage(Number(id), text, {
            reply_markup: {...markup, resize_keyboard: true},
            parse_mode: "Markdown"
        })
        await bot.deleteMessage(Number(id), String(input.message?.message_id))
    }
    //assign a hobby to a user
    choose = async (bot: TelegramBot, input: CallbackQuery) => {
        // try {
        const id = input.message?.chat.id
        const hobby_id = input.data?.split(':')[1]
        const edit = input.data?.split(':')[2]
        //assign the hobby to user
        const hobby = await this.hobbyService.findById(Number(hobby_id))
        if (!hobby) {
            return
        }
        const usr = await this.userService.setHobby(String(id), hobby)
        if (!usr) {
            return
        }
        //give user info
        const guide = await this.hobbyService.findById(Number(hobby_id))
        if (!guide) {
            return
        }
        //send
        //TEXT
        const text = `${hobby.name}\n${TEXT.ping.request}`
        if (edit) {
            await bot.editMessageText(
                text,
                {
                    chat_id: Number(id),
                    message_id: input.message?.message_id,
                    reply_markup: PingOptions(['1', '3', '7'], hobby._id)
                })
        } else {
            await bot.sendMessage(Number(id),
                text,
                {
                    reply_markup: PingOptions(['1', '3', '7'], hobby._id)
                })
        }

    }
    }

export const commands = new BotCommandManager({
    services: {
        userService,
        hobbyService,
        categoryService
    },
    cache
})


function getFromMessageOrCb(input: Message | CallbackQuery) {
    const mess_inp = <Message>input
    const cb_inp = <CallbackQuery>input
    let id, data
    //if is message
    if (mess_inp.chat) {
        id = String(mess_inp.chat.id)
    } else {
        id = cb_inp.message?.chat.id
        data = cb_inp.data?.split(':')[1]
    }
    return {data, id}
}