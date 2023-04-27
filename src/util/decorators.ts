import {isCallbackQuery, MsgCommandT} from "../types/index.js";
import {CallbackQuery} from "node-telegram-bot-api";

//Transmutes a CbQuery into a Message object
export function QueryToMsg(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value
    descriptor.value = function (this: any, ...args: any[]) {
        const [bot,input,events] = args
        if (isCallbackQuery(input)) {
            return original.call(this, bot,input.message,events)
        } else {
            return original.call(this, bot,input,events)
        }
    }
}
