import {HobbySchema} from "../../schema/hobby.schema.js"
import {HobbyTransformOptions} from "./interfaces/index.js"

export abstract class RowTransformer<T> {

    abstract transform: (entities: Array<T>, options: HobbyTransformOptions) => { inline_keyboard: { [p: string]: any, text: string }[][] }

}
