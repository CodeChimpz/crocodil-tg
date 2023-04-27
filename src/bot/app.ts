import TelegramBot, {CallbackQuery, Message} from 'node-telegram-bot-api'
import {config} from "dotenv";
import {PROMPTS} from "../static/bot-text/text-prompts.js";
import {ActionObject, Bot} from "./Bot.js";
import {commands} from "./commands.js";
import {isCallbackQuery} from "../types/index.js";

config()
const TOKEN = String(process.env.TELEGRAM_TOKEN)

const bot = new Bot(new TelegramBot(TOKEN, {polling: true}))

export class App {
    bot: Bot

    constructor(bot: Bot, config: {
        actions: ActionObject<any>,
        prompts: ActionObject<Message>,

    }) {
        this.bot = bot
        bot.registerCbActions(config.actions)
        bot.registerPrompts(config.prompts)
        bot.onEvent('go-back', async (bot: TelegramBot, input: CallbackQuery | Message) => {
            const message = isCallbackQuery(input) ? input.message : input
            if (!message) {
                throw 'No message'
            }
            await commands.startup(bot, message)
        })
        bot.onBotEvent('new_chat_members', commands.startup.bind(commands))
    }
}



