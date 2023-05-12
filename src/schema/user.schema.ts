import {
    Entity,
    ManyToMany,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    JoinTable, OneToMany
} from "typeorm"
import {HobbySchema} from "./hobby.schema.js"
import {UserPsycheSchema} from "./user.psych.schema.js"
import {PINGSchema} from "./PING.schema.js"

@Entity('User')
export class UserSchema {
    @PrimaryGeneratedColumn()
    _id: string
    @PrimaryColumn()
    chat_id: string
    @OneToOne(() => UserPsycheSchema, type => type.user, {
        // onDelete: 'CASCADE',
        // onUpdate: 'CASCADE',
        cascade: true
    })
    @JoinColumn()
    psyche: UserPsycheSchema
    @OneToMany(() => PINGSchema, type => type.user, {
        cascade: true
    })
    @JoinColumn()
    ping: PINGSchema[]
    @ManyToOne(() => HobbySchema, {cascade: true})
    current_Hobby: HobbySchema
    //ping at
    @ManyToMany(() => HobbySchema, {cascade: true})
    @JoinTable()
    prev_Hobbies: HobbySchema[]
}