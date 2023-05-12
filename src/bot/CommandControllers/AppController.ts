import {UserService} from "../../services/user.service.js"
import {QueryToMsg} from "../../util/decorators.js"
import TelegramBot, {Message} from "node-telegram-bot-api"
import TEXT from "../../static/bot-text/text-data.json" assert {type:'json'}
import {InlineKeyboard, InlineKeyboardButton, Row} from "node-telegram-keyboard-wrapper"
import {PROMPTS} from "../../static/bot-text/text-prompts.js"

export class AppController {
    userService: UserService
    bot: TelegramBot

    constructor(userService: UserService, bot: TelegramBot) {
        this.userService = userService
        this.bot = bot
    }

//GENERAL COMMANDS
    //greet user and upload a menu of options
    @QueryToMsg
    async startup(input: Message) {
        const id = input.chat.id
        //check if first bot message
        const met_before = await this.userService.get(String(id))
        if (!met_before) {
            await this.userService.create(String(id))
            await this.bot.sendMessage(id, TEXT.greet.initial, {
                reply_markup: new InlineKeyboard(new Row(new InlineKeyboardButton(PROMPTS.categories.random, 'callback_data', 'get-random')
                        , new InlineKeyboardButton(PROMPTS.categories.filters, 'callback_data', 'get-filters')),
                    new Row(new InlineKeyboardButton(PROMPTS.categories.categories, 'callback_data', 'get-categories'),
                        new InlineKeyboardButton(PROMPTS.categories.quiz, 'callback_data', 'quiz'))).getMarkup()
            })
        } else {
            await this.bot.sendMessage(id, TEXT.greet.general,
                {
                    reply_markup: new InlineKeyboard(new Row(new InlineKeyboardButton(PROMPTS.categories.random, 'callback_data', 'get-random')
                            , new InlineKeyboardButton(PROMPTS.categories.filters, 'callback_data', 'get-filters')),
                        new Row(new InlineKeyboardButton(PROMPTS.categories.categories, 'callback_data', 'get-categories'),
                            new InlineKeyboardButton(PROMPTS.categories.quiz, 'callback_data', 'quiz'))).getMarkup()
                }
            )
        }
        await this.bot.deleteMessage(Number(id), String(input?.message_id))
    }
}