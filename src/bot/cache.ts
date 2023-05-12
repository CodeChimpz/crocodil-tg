import {Redis} from "ioredis";
import {redis} from "../connectors/redis.js";
import {HobbySchema} from "../schema/hobby.schema.js";

interface Repo {
    get(id: String, ...args: any[]): Promise<any>

    put(id: String, entity: any, ...args: any[]): Promise<any>
}

interface RepoConstructable {
    new(redis: Redis): Repo
}

//An interface to expose Repos for cache data , composites Repo classes
export class Cache {
    redis: Redis
    //repos with predefined operations
    filters: any
    random: any

    constructor(redis: Redis, filtersRepoClass: RepoConstructable, randomRepoClass: RepoConstructable) {
        this.redis = redis
        //compose repos
        this.filters = new filtersRepoClass(redis)
        this.random = new randomRepoClass(redis)
    }

    //expose basic set/get
    get: any = async (key: string) => JSON.parse(String(await this.redis.get(key)))
    set: any = async (key: string, value: string, ...args: any[]) => this.redis.set(key, JSON.stringify(value))
    del: any = async (key: string) => this.redis.del(key)
}

//Repo that works with random hobbies stored for each user
class RandomHobbiesRepo {
    redis: Redis

    constructor(redis: Redis) {
        this.redis = redis
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
}

//Accesses filters chosen by User
class FiltersRepo {
    redis: Redis

    constructor(redis: Redis) {
        this.redis = redis
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

//
export const cache = new Cache(redis, FiltersRepo, RandomHobbiesRepo)