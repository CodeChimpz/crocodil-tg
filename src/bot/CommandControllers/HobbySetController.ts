import {HobbyService} from "../../services/hobby.service.js"
import {UserService} from "../../services/user.service.js"
import {QueryToMsg} from "../../util/decorators.js"
import TEXT from "../../static/bot-text/text-data.json" assert {type:'json'}
import {InlineKeyboard, InlineKeyboardButton, Row} from "node-telegram-keyboard-wrapper"
import {PROMPTS} from "../../static/bot-text/text-prompts.js"
import {schedulePing} from "../../util/schedule.js"
import EventEmitter from "events"
import {ChangeHobby} from "../Buttons/ChangeHobby.js"
import {RateHobbyBtn} from "../Buttons/RateHobby.js"
import {RespondToPingBtn} from "../Buttons/RespondToPing.js"
import TelegramBot, {CallbackQuery, Message} from "node-telegram-bot-api"
import {PingOptions} from "../Rows/PingOptions.js"

export class HobbySetController {

    hobbyService: HobbyService
    userService: UserService
    number_of_results: number
    bot: TelegramBot

    constructor(hobbyService: HobbyService, userService: UserService, bot: TelegramBot) {
        this.hobbyService = hobbyService
        this.userService = userService
        this.bot = bot
        this.number_of_results = 8
    }

//GENERAL COMMANDS
    //greet user and upload a menu of options
    @QueryToMsg
    async startup(input: Message) {
        const id = input.chat.id
        //check if first this.bot message
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

    choose = async (input: CallbackQuery) => {
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
            await this.bot.editMessageText(
                text,
                {
                    chat_id: Number(id),
                    message_id: input.message?.message_id,
                    reply_markup: new PingOptions().transform(['1', '3', '7'], hobby._id)
                })
        } else {
            await this.bot.sendMessage(Number(id),
                text,
                {
                    reply_markup: new PingOptions().transform(['1', '3', '7'], hobby._id)
                })
        }

    }

//PING
    //set ping for a user
    setPing = async (input: CallbackQuery) => {
        const id = input.message?.chat.id
        const ping_time = input.data?.split(':')[1]
        const hobby_id = input.data?.split(':')[2]
        const hobby_got = await this.hobbyService.findById(Number(hobby_id))
        if (!hobby_got) {
            return
        }
        const usr = await this.userService.get(String(id))
        if (!usr) {
            return
        }
        //set scheduled job
        await schedulePing({days: Number(ping_time)}, {user: usr, hobby: hobby_got})
        await this.bot.editMessageText(TEXT.ping.confirm, {
            chat_id: id,
            message_id: Number(input.message?.message_id)
        })
    }

    answerPing = async (input: CallbackQuery) => {
        const id = input.message?.chat.id
        const tried = Number(input.data?.split(':')[1])
        const hobby = input.data?.split(':')[2]
        console.log(hobby, tried)
        if (!tried) {
            await this.bot.editMessageText(TEXT.ping.change, {
                chat_id: Number(id),
                message_id: Number(input.message?.message_id),
                reply_markup: {
                    inline_keyboard: [[new ChangeHobby(true, Number(hobby))], [new ChangeHobby(false, Number(hobby))]]
                }
            })
        } else {
            await this.bot.editMessageText(TEXT.ping.liked, {
                chat_id: Number(id),
                message_id: Number(input.message?.message_id),
                reply_markup: {
                    inline_keyboard: [[new RateHobbyBtn(true)], [new RateHobbyBtn(false)]]
                }
            })
        }
    }

    //rate how user liked the proposed hobby
    rate = async (input: CallbackQuery) => {
        const id = input.message?.chat.id
        const liked = Number(input.data?.split(':')[1])
        const user = await this.userService.get(String(id))
        //
        if (!user) {
            return
        }
        const hobby_got = await this.hobbyService.findById(Number(user.current_Hobby._id))
        if (!hobby_got) {
            return
        }
        //
        if (!liked) {
            await this.bot.editMessageText(TEXT.ping.rate_propose, {
                chat_id: id,
                message_id: input.message?.message_id
            })
        } else {
            await this.bot.editMessageText(TEXT.ping.congratulate, {
                chat_id: id,
                message_id: input.message?.message_id
            })
            //reschedule
            const job = async () => {
                console.log('Pinging a user')
                return this.bot.editMessageText('Ты продолжаешь заниматься ' + user?.current_Hobby.name + " ?", {
                    chat_id: id,
                    message_id: input.message?.message_id,
                    reply_markup: {inline_keyboard: [[new RespondToPingBtn(true, Number(user._id))], [new RespondToPingBtn(false, Number(user._id))]]}
                })
            }
            await schedulePing({
                days:
                    Number({days: 30})
            }, {user: user, hobby: hobby_got})
        }
    }

    //write rating to db from user reply
    acceptRating = async (input: Message, events: EventEmitter) => {
        const id = input.chat.id
        if (!input.text) {
            await this.bot.editMessageText(TEXT.general.empty_prompt, {
                chat_id: id,
                message_id: input.message_id
            })
        } else {
            const review = input.text.split('/ratemy')[1].trim()
            const user = await this.userService.get(String(id))
            //todo : check all hobbies that user had
            if (!user?.current_Hobby) {
                await this.bot.editMessageText(TEXT.rate.no_hobby, {
                    chat_id: id,
                    message_id: input.message_id
                })
            } else {
                await this.hobbyService.leaveReview(user.current_Hobby._id, review)
                await this.bot.sendMessage(Number(id), TEXT.rate.thank)
                events.emit('go-back', input)
            }
        }
    }
}
