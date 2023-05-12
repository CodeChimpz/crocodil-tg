import {FiltersRepo} from "../FilteredHobbies.Repo.js"
import {RandomHobbiesRepo} from "../RandomHobbies.Repo.js"
import {redis} from "../../connectors/redis.js"
import {Cache} from "../CacheClient.js"

export const cache = new Cache<FiltersRepo, RandomHobbiesRepo>(redis, FiltersRepo, RandomHobbiesRepo)
