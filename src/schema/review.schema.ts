import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation} from "typeorm"
import {UserSchema} from "./user.schema.js"
import {HobbySchema} from "./hobby.schema.js"

@Entity('Review')
export class ReviewSchema {
    @PrimaryGeneratedColumn()
    id: number
    @Column({
        nullable: false
    })
    text: string
    @ManyToOne(() => HobbySchema, (type) => type.reviews)
    hobby: Relation<HobbySchema>

}