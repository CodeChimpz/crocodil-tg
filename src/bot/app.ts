import TelegramBot, {CallbackQuery, Message} from 'node-telegram-bot-api'
import {config} from "dotenv";
import {PROMPTS} from "../static/bot-text/text-prompts.js";
import {Bot} from "./Bot.js";
import {commands} from "./commands.js";
import {quiz, QuizQuestion} from "./Quiz.js";
import {PsycheAttributes} from "../schema/user.psych.schema.js";
import {questArrayFromFormat} from "../util/quiz-populate.js";
import {isCallbackQuery} from "../types/index.js";


config()
const TOKEN = String(process.env.TELEGRAM_TOKEN)

//bot init
export default function main() {
    //populate Quiz
    quiz.add(...questArrayFromFormat())
    //init bot
    const bot = new Bot(new TelegramBot(TOKEN, {polling: true}))
//bot commands init
//custom events
    bot.onEvent('go-back', async (bot: TelegramBot, input: CallbackQuery | Message) => {
        const message = isCallbackQuery(input) ? input.message : input
        if (!message) {
            throw 'No message'
        }
        await commands.startup(bot, message)
    })
//bot events
    bot.onBotEvent('new_chat_members', commands.startup.bind(commands))
//slash commands
    const PROMPTS_MAP: { [key: string]: any } = {
        [PROMPTS.commands.start]: commands.startup.bind(commands),
        [PROMPTS.commands.ratemy]: commands.acceptRating,
    }
    bot.registerPrompts(PROMPTS_MAP)
//callback query actions
    const ACTIONS: { [key: string]: any } = {
        'go-back': commands.startup.bind(commands),
        //categories
        'quiz': quiz.start.bind(quiz),
        'get-filters': commands.propose_filters.bind(commands),
        'get-categories': commands.propose_category.bind(commands),
        'get-random': commands.random.bind(commands),
        //random
        'propose-more-random': commands.random_change,
        //hobby
        'choose-hobby': commands.choose,
        'change-hobby': commands.startup,
        'rate-hobby': commands.rate.bind(commands),
        'view-hobby': commands.view,
        //ping
        'set-ping': commands.setPing,
        'answer-ping': commands.answerPing.bind(commands),
        //filter
        'set-filter': commands.set_filters,
        'search-filters': commands.get_by_filters,
        //categories
        'get-category': commands.get_by_category,
        'set-psyche': quiz.proceed.bind(quiz),
        //quiz
        'show-quiz': quiz.results.bind(quiz)
    }
    bot.registerCbActions(ACTIONS)
    //
    return bot
}

