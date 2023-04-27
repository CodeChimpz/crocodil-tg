import {DataSource, ObjectLiteral, Repository} from "typeorm";
import {dataSource} from "../connectors/db.js";
import {CategorySchema} from "../schema/category.schema.js";


export class CategoryService {
    repo: Repository<CategorySchema>

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(CategorySchema)
    }

    async getAll(filters: boolean = false, attributes: boolean = false) {
        return this.repo.findBy({isFilter: filters, isPersonalAttr: attributes})
    }

}

export const categoryService = new CategoryService(dataSource)