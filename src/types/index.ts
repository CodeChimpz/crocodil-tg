import TelegramBot, {CallbackQuery, Message} from "node-telegram-bot-api";
import EventEmitter from "events";

export type MsgCommandT = (msg: Message) => Promise<void>
export type CbQueryCommandT = (cb: CallbackQuery) => Promise<void>

export function isCallbackQuery(cb: any): cb is CallbackQuery {
    return 'data' in {...cb}
}

export type FunctionCommandT<InputT> = (bot: TelegramBot, input: InputT, events?: EventEmitter) => Promise<any>

export interface ActionObject<T> {
    [key: string]: FunctionCommandT<T>
}

