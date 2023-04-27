import {Redis} from "ioredis";
import {config} from "dotenv";

config()
export const redis = new Redis(String(process.env.REDIS_URL));
