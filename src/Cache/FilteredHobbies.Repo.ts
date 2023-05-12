import {Redis} from "ioredis"
import {Repo} from "./Repo.js"

//Accesses filters chosen by User
export class FiltersRepo extends Repo {

    constructor(redis: Redis) {
        super(redis, 'filters')

    }

    async put(id: string, filter: string) {
        const redis = this.redis
        //
        const chosen = await redis.lrange(id, 0, -1)
        //delete or add to array
        const push_ = chosen.indexOf(filter) > -1 ? chosen.filter(val => val !== filter) : (() => {
            chosen.push(filter);
            return chosen
        })()
        await redis.del(id)
        if (push_.length) {
            await redis.lpush(id, ...push_)
            // await redis.expire(id, 5 * 60)
        }
        return push_
    }

    async get(id: string) {
        const redis = this.redis
        return redis.lrange(id, 0, -1)
    }

    async purge(id: string) {
        return this.redis.del(id)
    }
}