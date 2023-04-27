import {DataSource, Repository} from "typeorm";
import {dataSource} from "../connectors/db.js";
import {UserSchema} from "../schema/user.schema.js";
import {HobbySchema} from "../schema/hobby.schema.js";
import {PsycheAttributes, UserPsycheSchema} from "../schema/user.psych.schema.js";
import {PINGSchema} from "../schema/PING.schema.js";

export class UserService {
    repo: Repository<UserSchema>

    constructor(data_source: DataSource) {
        this.repo = data_source.getRepository<UserSchema>('User')
    }

    async create(id: string) {
        const made = new UserSchema()
        made.chat_id = id
        return this.repo.save(made)
    }

    async get(id: string) {
        return this.repo.findOne({where: {chat_id: id}, relations: {current_Hobby: true}})
    }

//Hobby relations
    async getHobby(id: string) {
        const usr = await this.repo.findOne({where: {chat_id: id}, relations: {current_Hobby: true}})
        return usr?.current_Hobby
    }

    async setHobby(id: string, hobby: HobbySchema) {
        const usr = await this.repo.findOne({
            where: {chat_id: id},
            relations: {current_Hobby: true, prev_Hobbies: true}
        })
        if (!usr) {
            return
        }
        const prev = usr.current_Hobby
        usr.current_Hobby = hobby
        usr.prev_Hobbies.push(prev)
        return this.repo.save(usr)
    }

    async checkExp(id: string, hobby_name: string) {

    }

//Psyche relations
    async resetPsyche(id: UserSchema["_id"]) {
        const user = await this.repo.findOne({where: {chat_id: id}, relations: {psyche: true}})
        if (!user) {
            return
        }
        if (!user.psyche) {
            user.psyche = new UserPsycheSchema()
        }
        //todo: DAAAAAM NIGGA WHAT IS THIS
        user.psyche[PsycheAttributes.adventure_] = 0
        user.psyche[PsycheAttributes.protected_] = 0
        user.psyche[PsycheAttributes.renown_] = 0
        user.psyche[PsycheAttributes.helper_] = 0
        user.psyche[PsycheAttributes.showoff_] = 0
        user.psyche[PsycheAttributes.leaderhsip_] = 0
        user.psyche[PsycheAttributes.knowledge_] = 0
        return this.repo.save(user)
    }

    async setPsyche(id: UserSchema["_id"], attr: PsycheAttributes, value: number) {
        if (value > 1) {
            return
        }
        const user = await this.repo.findOne({where: {chat_id: id}, relations: {psyche: true}})
        if (!user) {
            return
        }
        if (!user.psyche) {
            user.psyche = new UserPsycheSchema()
        }
        if (user.psyche[attr] == 2) {
            return
        }
        user.psyche[attr] = (user.psyche[attr] || 0) + value
        return this.repo.save(user)
    }

    async getPsyche(id: UserSchema["_id"]) {
        const attr = await this.repo.findOne({where: {chat_id: id}, relations: {psyche: true}})
        if (!attr) {
            return
        }
        return Object.keys(attr.psyche).filter(key => {
            return Object.values(PsycheAttributes).includes(key as unknown as PsycheAttributes) && attr.psyche[key as PsycheAttributes] === 2
        })
    }

    //ping actions
    async setPing(at: Date, user: UserSchema, hobby: HobbySchema) {
        const usr = await this.repo.findOne({where: {chat_id: user.chat_id}, relations: {ping: true}})
        if (!usr) {
            console.log('no user found')
            return
        }
        const ping = new PINGSchema()
        ping.at = at
        ping.hobby = hobby
        ping.user = user
        usr.ping.push(ping)
        return this.repo.save(usr)
    }


}

export const userService = new UserService(dataSource)