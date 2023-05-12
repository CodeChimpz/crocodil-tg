import {Redis} from "ioredis";

export abstract class Repo {
    redis: Redis

    protected constructor(redis: Redis) {
        this.redis = redis
    }

    abstract get(id: String, ...args: any[]): Promise<any>

    abstract put(id: String, entity: any, ...args: any[]): Promise<any>
}