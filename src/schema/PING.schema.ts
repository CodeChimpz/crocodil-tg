import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany, OneToOne,
    PrimaryGeneratedColumn,
    Relation
} from "typeorm"
import {UserSchema} from "./user.schema.js"
import {HobbySchema} from "./hobby.schema.js"

@Entity('PING')
export class PINGSchema {
    @PrimaryGeneratedColumn()
    _id: string
    @ManyToOne(() => UserSchema)
    user: Relation<UserSchema>
    @ManyToOne(() => HobbySchema)
    hobby: Relation<HobbySchema>
    @Column()
    at: Date
    @Column({default:false})
    pinged_ : boolean
}