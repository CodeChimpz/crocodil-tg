import {Redis} from "ioredis";

export interface RepoConstructable<Type> {
    new(redis: Redis): Type
}