import {CallbackQuery, Message} from "node-telegram-bot-api"

function getFromMessageOrCb(input: Message | CallbackQuery) {
    const mess_inp = <Message>input
    const cb_inp = <CallbackQuery>input
    let id, data
    //if is message
    if (mess_inp.chat) {
        id = String(mess_inp.chat.id)
    } else {
        id = cb_inp.message?.chat.id
        data = cb_inp.data?.split(':')[1]
    }
    return {data, id}
}