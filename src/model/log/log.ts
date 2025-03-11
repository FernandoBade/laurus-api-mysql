import "reflect-metadata";
import BaseModel from "../baseModel";
import { Table, Column, ManyToOne } from "../../utils/database/dbDecorators";
import User from "../user/user";
import { LogType, LogOperation, LogCategory } from "../../utils/enum";

@Table("log")
class Log extends BaseModel {
    @Column() id!: number;
    @Column() type!: LogType;
    @Column() operation!: LogOperation;
    @Column() category!: LogCategory;
    @Column() detail!: string;
    @Column() timestamp!: Date;

    @ManyToOne(() => User, "logs") user?: User;
}

export default Log;
