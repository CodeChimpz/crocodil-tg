import TelegramBot, {CallbackQuery, Message} from "node-telegram-bot-api";

export type MsgCommandT = (msg: Message) => Promise<void>
export type CbQueryCommandT = (cb: CallbackQuery) => Promise<void>

export function isCallbackQuery(cb: any): cb is CallbackQuery {
    return 'data' in {...cb}
}

