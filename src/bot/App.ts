import TelegramBot, {CallbackQuery, Message} from 'node-telegram-bot-api'
import {config} from "dotenv"
import {Bot} from "./Bot.js"
import {ActionObject, isCallbackQuery} from "../types/index.js"
import {AppController} from "./CommandControllers/AppController.js"
import {userService} from "../services/user.service.js"

config()
const TOKEN = String(process.env.TELEGRAM_TOKEN)

const bot = new Bot(new TelegramBot(TOKEN, {polling: true}))


export class App {
    bot: Bot

    constructor(bot: Bot, config: {
        actions: ActionObject<any>,
        prompts: ActionObject<Message>,
        appController: AppController
    }) {
        this.bot = bot
        bot.registerCbActions(config.actions)
        bot.registerPrompts(config.prompts)
        bot.onEvent('go-back', async (input: CallbackQuery | Message) => {
            const message = isCallbackQuery(input) ? input.message : input
            if (!message) {
                throw 'No message'
            }
            await config.appController.startup(message)
        })
        bot.onBotEvent('new_chat_members', config.appController.startup.bind(config.appController))
    }
}



