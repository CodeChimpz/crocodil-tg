import {DataSource} from "typeorm";
import xslx from 'node-xlsx'
import * as fs from "fs";
import {HobbySchema} from "../schema/hobby.schema.js";
import {CategorySchema} from "../schema/category.schema.js";
import {dataSource} from "../connectors/db.js";
import {parse} from "csv-parse"

export async function readFromXls(data_location: string) {
    return xslx.parse(fs.readFileSync(`${data_location}`))
}

export async function parseFile(db: DataSource, data_dir: string) {
    const parsed: any = []
    await fs.createReadStream(data_dir)
        .pipe(parse({delimiter: ',', from_line: 2}))
        .on('error', error => console.error(error))
        .on('data', row => parsed.push(row))
        .on('end', () => {
            console.log('parsed data')
            writeToDb(parsed)
        });
}

async function writeToDb(parsed: any) {
    if (parsed.length) {
        const data = parsed
        let row: any
        for (row of data) {
            if (!await dataSource.getRepository('Hobby').findOneBy({name: row[0]})) {
                const instnc = dataSource.getRepository('Hobby').create()
                //create category
                let cat = await dataSource.getRepository('Category').findOneBy({name: row[2].trim()})
                if (!cat) {
                    const category = new CategorySchema()
                    category.name = row[2].trim()
                    const cat = await dataSource.getRepository('Category').save(category)
                }
                //create filters
                const filters = await Promise.all(row[1].split(',').map(async (filtr: any) => {
                    let res
                    res = await dataSource.getRepository('Category').findOneBy({name: filtr.trim()})
                    if (!res) {
                        res = new CategorySchema()
                        res.isFilter = true
                        res.name = filtr.trim()
                    }
                    return res

                }))
                //create attrs
                const attrs = await Promise.all(row[3].split(',').map(async (attr: any) => {
                    let res
                    res = await dataSource.getRepository('Category').findOneBy({name: attr.trim()})
                    if (!res) {
                        res = new CategorySchema()
                        res.isPersonalAttr = true
                        res.name = attr.trim()
                    }
                    return res
                }))
                //assign save instance
                const objecto = {
                    name: String(row[0]),
                    descr: String(row[4]),
                    guide: '',
                    img: [],
                    category: cat,
                    filters: filters,
                    attributes: attrs
                }
                Object.assign(instnc, objecto)
                await dataSource.getRepository('Hobby').save(instnc)
            }

        }
        console.log('Populated db')
    }
}