import {Redis} from "ioredis";
import { RepoConstructable} from "./interfaces/interfaces";
import {Repo} from "./Repo";

//An interface to expose Repos for cache data , composites Repo classes passing one Redis client to all of them
export class Cache<FiltersRepo extends Repo, RandomRepo extends Repo> {
    redis: Redis
    //Map of repositories
    repos: {
        filters: FiltersRepo
        random: RandomRepo
        [key: string]: Repo
    }

    constructor(redis: Redis, filtersRepoClass: RepoConstructable<FiltersRepo>, randomRepoClass: RepoConstructable<RandomRepo>) {
        this.redis = redis
        //compose repos from passed classes
        this.repos.filters = new filtersRepoClass(redis)
        this.repos.random = new randomRepoClass(redis)
    }

    getRepository<RepoType>(name: string) {
        return this.repos[name] as RepoType
    }

    //expose basic set/get to communicate with redis client
    get: any = async (key: string) => JSON.parse(String(await this.redis.get(key)))
    set: any = async (key: string, value: string, ...args: any[]) => this.redis.set(key, JSON.stringify(value))
    del: any = async (key: string) => this.redis.del(key)
}