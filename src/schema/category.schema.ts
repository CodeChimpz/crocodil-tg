import {Column, Entity,Unique, PrimaryGeneratedColumn} from "typeorm";

@Unique('name_id', ['name'])
@Entity('Category')
export class CategorySchema {
    @PrimaryGeneratedColumn()
    _id: number
    @Column({default: false})
    isFilter: boolean
    @Column({default: false})
    isPersonalAttr: boolean
    @Column()
    name: string
}