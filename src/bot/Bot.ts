import TelegramBot, {CallbackQuery, Message} from "node-telegram-bot-api";
import EventEmitter from "events";

type FunctionCommandT<InputT> = (bot: TelegramBot, input: InputT, events?: EventEmitter) => Promise<any>

export class Bot {
    bot: TelegramBot
    app_events: EventEmitter

    constructor(bot: TelegramBot) {
        this.bot = bot
        this.app_events = new EventEmitter()
    }

    registerCbActions(actions: { [key: string]: FunctionCommandT<CallbackQuery | Message> }) {
        Object.entries(actions).forEach(entry_ => {
            const [action, func] = entry_
            console.log('Registered callback_query action : ' + action)
            this.bot.on('callback_query', async (query) => {
                if (query.data?.split(':')[0] === action) {
                    try {
                        console.log(query.message?.chat.id, '-> runs ->', query.data)
                        await func(this.bot, query, this.app_events)
                        await this.bot.answerCallbackQuery(String(query.id), {})
                    } catch (e: any) {
                        await this.bot.answerCallbackQuery(String(query.id), {
                            show_alert: true,
                            text: 'Ошибка, ошибка, ошибка 🤕 ... \nПопробуй позже,а я сейчас все порешаю'
                        })
                        console.error('error', e.message, e.stack)
                    }
                }
            })
        })
    }

    registerPrompts(prompts: { [key: string]: FunctionCommandT<Message> }) {
        Object.entries(prompts).forEach((entry) => {
                const [prompt, func] = entry
                this.bot.onText(new RegExp(prompt), async (message: Message) => {
                    try {
                        console.log(message.chat.id, '-> prompts ->', message.text)
                        await func(this.bot, message, this.app_events)
                    } catch (e: any) {
                        console.error('error', e)
                        await this.bot.sendMessage(Number(message.chat.id), 'Ошибка, ошибка, ошибка 🤕 ... \nСохраняй терпение, ща я все порешаю')
                    }
                })
                console.log('Registered command or prompt : "' + prompt + '"')
            }
        )
    }

    onCbAction(action: string, func: FunctionCommandT<CallbackQuery>) {
        this.bot.on('callback_query', async (query) => {
            if (query.data?.split(':')[0] === action) {
                console.log(query.data)
                return func(this.bot, query, this.app_events)
            }
        })
    }

    onPrompt(prompt: string, func: FunctionCommandT<Message>) {
        this.bot.onText(new RegExp(prompt), (message: Message) => func(this.bot, message, this.app_events))
    }

    onBotEvent(event: TelegramBot.MessageType, func: FunctionCommandT<Message>) {
        this.bot.on(event, async (message: Message) => {
            console.log(message);
            try {
                console.log(message.chat.id, '-> prompts ->', message.text)
                await func(this.bot, message, this.app_events)
            } catch (e: any) {
                console.log(e)
                await this.bot.sendMessage(Number(message.chat.id), 'Ошибка, ошибка, ошибка 🤕 ... \nСохраняй терпение, ща я все порешаю')
            }
        })
    }

    onEvent(event: string, func: FunctionCommandT<CallbackQuery>) {
        this.app_events.on(event, async (cb: CallbackQuery) => {
            try {
                await func(this.bot, cb, this.app_events)
            } catch (e: any) {
                console.log(e)
                await this.bot.sendMessage(String(cb.chat_instance), 'Ошибка, ошибка, ошибка 🤕 ... \nСохраняй терпение, ща я все порешаю')
            }
        })
    }

}