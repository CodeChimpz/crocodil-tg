import {pings} from "../services/PING.service.js"
import {userService} from "../services/user.service.js"
import {hobbyService} from "../services/hobby.service.js"
import TelegramBot from "node-telegram-bot-api"
import TEXT from "../static/bot-text/text-data.json" assert {type: 'json'};
import schedule from 'node-cron'
import {UserSchema} from "../schema/user.schema.js"
import {HobbySchema} from "../schema/hobby.schema.js"
import {RespondToPingBtn} from "../bot/Buttons/RespondToPing.js"

//todo: dedicated server with http conection to this one
export async function schedulePing(time: { days: number, minutes?: number }, data: { user: UserSchema, hobby: HobbySchema }) {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() + time.days)
    //for testing
    if (time.minutes) {
        date.setUTCMinutes(date.getUTCMinutes() + time.minutes)
    }
    //
    const job = await userService.setPing(date, data.user, data.hobby)
    console.log('Set ping')
}

export async function pingCheck(bot: TelegramBot) {
    console.log('Running job')
    const ping_resolves = await pings.getAll(new Date())
    await Promise.all(ping_resolves.map(async (res) => {
        if (!res.user) {
            return
        }
        if (!res.hobby) {
            return
        }
        if(res.pinged_){
            return
        }
        console.log('pinging ', res.user.chat_id, ' for ', res.hobby.name)
        await bot.sendMessage(Number(res.user.chat_id), TEXT.ping.check.replace('_PROMPT_', String(res.hobby.name)), {
            reply_markup: {inline_keyboard: [[new RespondToPingBtn(true, Number(res.hobby._id))], [new RespondToPingBtn(false, Number(res.hobby._id))]]}
        })
        await pings.ping(res._id)
    }))
}

export async function scheduleCheck(bot: TelegramBot) {
    schedule.schedule('1 * * * * * *', () => pingCheck(bot))
}