import {Redis} from "ioredis"
import {RepoConstructable} from "./interfaces/interfaces.js"
import {Repo} from "./Repo.js"

//An interface to expose Repos for cache data , composites Repo classes passing one Redis client to all of them
export class Cache<FiltersRepo extends Repo, RandomRepo extends Repo> {
    redis: Redis
    filters: FiltersRepo
    random: RandomRepo


    constructor(redis: Redis, filtersRepoClass: RepoConstructable<FiltersRepo>, randomRepoClass: RepoConstructable<RandomRepo>) {
        this.redis = redis
        //compose repos from passed classes
        const filters = new filtersRepoClass(redis)
        this.filters = filters
        const random = new randomRepoClass(redis)
        this.random = random

    }

    getRepository<RepoType>(name: string):any {
        if(name==='filters'){
            return this.filters
        }
        return this.random
    }

    //expose basic set/get to communicate with redis client
    get: any = async (key: string) => JSON.parse(String(await this.redis.get(key)))
    set: any = async (key: string, value: string, ...args: any[]) => this.redis.set(key, JSON.stringify(value))
    del: any = async (key: string) => this.redis.del(key)
}