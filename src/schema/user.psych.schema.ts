import {Check, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation, Unique} from "typeorm";

import {UserSchema} from "./user.schema.js";

export enum PsycheAttributes {
    protected_ = 'защищённость',
    adventure_ = 'приключенчество',
    showoff_ = "самопроявление",
    knowledge_ = "знания",
    helper_ = "помогахерство",
    leaderhsip_ = "лидерство",
    renown_ = "слава"
}

@Entity('UserPsyche')
@Check(`"${[PsycheAttributes.protected_]}"<=2`)
@Check(`"${[PsycheAttributes.adventure_]}"<=2`)
@Check(`"${[PsycheAttributes.showoff_]}"<=2`)
@Check(`"${[PsycheAttributes.knowledge_]}"<=2`)
@Check(`"${[PsycheAttributes.helper_]}"<=2`)
@Check(`"${[PsycheAttributes.leaderhsip_]}"<=2`)
@Check(`"${[PsycheAttributes.renown_]}"<=2`)
// @Unique(`user`)
export class UserPsycheSchema {
    @PrimaryGeneratedColumn()
    _id: string
    @OneToOne(() => UserSchema, type => type.psyche)
    user: Relation<UserSchema>
    @Column({nullable: true})
    [PsycheAttributes.protected_]: number
    @Column({nullable: true})
    [PsycheAttributes.adventure_]: number
    @Column({nullable: true})
    [PsycheAttributes.showoff_]: number
    @Column({nullable: true})
    [PsycheAttributes.knowledge_]: number
    @Column({nullable: true})
    [PsycheAttributes.helper_]: number
    @Column({nullable: true})
    [PsycheAttributes.leaderhsip_]: number
    @Column({nullable: true})
    [PsycheAttributes.renown_]: number
}

