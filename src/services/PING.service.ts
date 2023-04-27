import {LessThan, Repository} from "typeorm";
import {PINGSchema} from "../schema/PING.schema.js";
import {raw} from "express";
import {dataSource} from "../connectors/db.js";

export class PINGService {
    repo: Repository<PINGSchema>

    constructor(repo: Repository<PINGSchema>) {
        this.repo = repo
    }

    async ping(id: string) {
        const found_ = await this.repo.findOne({where: {_id: id}})
        if (!found_) {
            console.log('ping ',id,' not found')
            return
        }
        found_.pinged_ = true
        return  this.repo.save(found_)
    }

    async getAll(current: Date) {
        return this.repo.find({
            where: {at: LessThan(current)},
            relations: {
                user: true,
                hobby: true
            }
        })
    }
}

export const pings = new PINGService(dataSource.getRepository(PINGSchema))