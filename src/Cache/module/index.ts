import {FiltersRepo} from "./Filteredhobbies.Repo";
import {RandomHobbiesRepo} from "./RandomHobbies.Repo";
import {redis} from "../connectors/redis";
import {Cache} from "./CacheClient";

export const cache = new Cache<FiltersRepo, RandomHobbiesRepo>(redis, FiltersRepo, RandomHobbiesRepo)