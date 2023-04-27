import {config} from "dotenv";
import {parseFile} from "./util/populate.js";
import {dataSource} from "./connectors/db.js";
import express from "express";
import {scheduleCheck} from "./util/schedule.js";
import {commands} from "./bot/commands";
import {PROMPTS} from "./static/bot-text/text-prompts";
import {App} from "./bot/app";
import {Bot} from "./bot/Bot";
import TelegramBot from "node-telegram-bot-api";

config()
const {
    ADMIN_PORT
} = process.env
//spin up bot
const TOKEN = String(process.env.TELEGRAM_TOKEN)

const bot = new Bot(new TelegramBot(TOKEN, {polling: true}))
const not_app = new App(bot,{
    actions: {
        'go-back': commands.startup.bind(commands),
        //categories
        'get-filters': commands.propose_filters.bind(commands),
        'get-categories': commands.propose_category.bind(commands),
        'get-random': commands.random.bind(commands),
        //random
        'propose-more-random': commands.random_change,
        //hobby
        'choose-hobby': commands.choose,
        'change-hobby': commands.startup,
        'view-hobby': commands.view,
        //filter
        'set-filter': commands.set_filters,
        'search-filters': commands.get_by_filters,
        //categories
        'get-category': commands.get_by_category,
    },
    prompts: {
        [PROMPTS.commands.start]: commands.startup.bind(commands),
    }
})
//run scripts
await parseFile(dataSource, './base.csv')
//listem on port for healthcheck
const app = express()
app.listen(8080, () => {
    console.log('Up and running')
})
//
await scheduleCheck(bot.bot)



