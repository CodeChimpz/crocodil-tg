import {Redis} from "ioredis"

export abstract class Repo {
    redis: Redis
    repoName: string
    protected constructor(redis: Redis,repoName:string) {
        this.redis = redis
        this.repoName = repoName
    }

    abstract get(id: String, ...args: any[]): Promise<any>

    abstract put(id: String, entity: any, ...args: any[]): Promise<any>
}