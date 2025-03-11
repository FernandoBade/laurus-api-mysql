import "reflect-metadata";
import BaseModel from "../baseModel";
import { Table, Column, OneToMany } from "../../utils/database/dbDecorators";
import Log from "../log/log";

@Table("user")
class User extends BaseModel {
    @Column() id!: number;
    @Column() firstName!: string;
    @Column() lastName!: string;
    @Column() email!: string;
    @Column() phone?: string;
    @Column() password!: string;
    @Column() birthDate?: Date;
    @Column() active!: boolean;
    @Column() createdAt!: Date;
    @Column() theme!: string;
    @Column() language!: string;
    @Column() currency!: string;
    @Column() dateFormat!: string;
}

export default User;
