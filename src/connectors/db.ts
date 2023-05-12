import {DataSource} from "typeorm"
import {config} from "dotenv"
import {HobbySchema} from "../schema/hobby.schema.js"
import {CategorySchema} from "../schema/category.schema.js"
import {UserSchema} from "../schema/user.schema.js"
import {ReviewSchema} from "../schema/review.schema.js"
import {UserPsycheSchema} from "../schema/user.psych.schema.js"
import {PINGSchema} from "../schema/PING.schema.js"

config()
export const dataSource = new DataSource({
    type: 'postgres',
    url: String(process.env.DATABASE_URL),
    entities: [HobbySchema, CategorySchema, UserSchema, ReviewSchema, UserPsycheSchema, PINGSchema],
    synchronize: true,
    dropSchema: !!process.env.DROP_SCHEMA
})
await dataSource.initialize()
console.log('DB connected')