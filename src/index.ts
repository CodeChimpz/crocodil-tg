import {config} from "dotenv"
import {parseFile} from "./util/populate.js"
import {dataSource} from "./connectors/db.js"
import express from "express"
import {scheduleCheck} from "./util/schedule.js"
import {PROMPTS} from "./static/bot-text/text-prompts.js"
import {App, bot} from "./bot/App.js"
import {Bot} from "./bot/Bot.js"
import TelegramBot from "node-telegram-bot-api"
import {HobbyViewCommandController} from "./bot/CommandControllers/HobbyViewController.js"
import {cache} from "./Cache/module/index.js"
import {hobbyService} from "./services/hobby.service.js"
import {categoryService} from "./services/category.service.js"
import {HobbySetController} from "./bot/CommandControllers/HobbySetController.js"
import {userService} from "./services/user.service.js"
import {AppController} from "./bot/CommandControllers/AppController.js"

config()
const {
    ADMIN_PORT
} = process.env
//spin up bot
const TOKEN = String(process.env.TELEGRAM_TOKEN)

const hobbyView = new HobbyViewCommandController(cache, hobbyService, categoryService, bot.bot)
const hobbySet = new HobbySetController(hobbyService, userService, bot.bot)
const appCommands = new AppController(userService, bot.bot)
const not_app = new App(bot, {
    actions: {
        'go-back': appCommands.startup.bind(appCommands),
        //categories
        'get-filters': hobbyView.propose_filters.bind(hobbyView),
        'get-categories': hobbyView.propose_category.bind(hobbyView),
        'get-random': hobbyView.random.bind(hobbyView),
        //random
        'propose-more-random': hobbyView.random_change,
        //hobby
        'choose-hobby': hobbySet.choose,
        'change-hobby': appCommands.startup,
        'view-hobby': hobbyView.view,
        //filter
        'set-filter': hobbyView.set_filters,
        'search-filters': hobbyView.get_by_filters,
        //categories
        'get-category': hobbyView.get_by_category,
    },
    prompts: {
        [PROMPTS.commands.start]: appCommands.startup.bind(appCommands),
    },
    appController: appCommands
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



