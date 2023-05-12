import bot from "./bot/app.js";

import {config} from "dotenv";
import {parseFile} from "./util/populate.js";
import {dataSource} from "./connectors/db.js";
import express from "express";
import {scheduleCheck} from "./util/schedule.js";

config()
const {
    ADMIN_PORT
} = process.env
//spin up bot
const bot_ = bot()
//run scripts
await parseFile(dataSource, './base.csv')
//listem on port for healthcheck
const app = express()
app.listen(8080, () => {
    console.log('Up and running')
})
//
await scheduleCheck(bot_.bot)



