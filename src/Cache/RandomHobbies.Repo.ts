//Repo that works with random hobbies stored for each user

import {Redis} from "ioredis"
import {HobbySchema} from "../schema/hobby.schema.js"
import {Repo} from "./Repo.js"

export class RandomHobbiesRepo extends Repo {
    constructor(redis: Redis) {
        super(redis, 'random')
    }

    async pop(id: string, to_change: string) {
        const redis = this.redis
        await redis.lrem(id, 1, to_change)
        //get new
        return redis.lpop(id)
    }

    async put(id: string, hobbies: Array<HobbySchema>, MAX: number) {
        const redis = this.redis
        const hobbies_arr = hobbies.map((elem: any) => {
            return elem._id.toString()
        })
        //set the random array for da user
        await redis.rpush(id, ...hobbies_arr)
        await redis.expire(id, 20 * 60)
        //get hobbies
        return hobbies_arr.slice(0, MAX)
    }

    async get(id: string, MAX: number) {
        const redis = this.redis
        if (!await redis.exists(id)) {
            return
        }
        //delete viewed
        await redis.ltrim(id, MAX, -1)
        //get some
        return redis.lrange(id, 0, MAX - 1)

    }

    async purge(id: string) {
        return this.redis.del(id)
    }
}