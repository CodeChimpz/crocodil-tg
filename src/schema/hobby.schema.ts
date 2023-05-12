import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    ManyToOne,
    JoinTable,
    OneToMany,
    Relation,
    JoinColumn
} from "typeorm"
import {CategorySchema} from "./category.schema.js"
import {ReviewSchema} from "./review.schema.js"


@Entity('Hobby')
export class HobbySchema {
    @PrimaryGeneratedColumn()
    _id: number
    @Column('varchar', {
        nullable: false
    })
    name: string
    @Column('varchar', {
        nullable: false
    })
    descr: string
    @Column('varchar')
    guide: string
    @Column("varchar", {array: true})
    img: Array<string>
    //relations
    @ManyToOne(() => CategorySchema, {cascade: true})
    @JoinColumn()
    category: CategorySchema
    @ManyToMany(() => CategorySchema, {cascade: true})
    @JoinTable()
    filters: CategorySchema[]
    @ManyToMany(() => CategorySchema, {cascade: true})
    @JoinTable()
    attributes: CategorySchema[]
    @OneToMany(() => ReviewSchema, (type) => type.hobby, {cascade: true})
    reviews: Relation<ReviewSchema>[]
}